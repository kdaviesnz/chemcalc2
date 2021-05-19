const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const ReactionsList = require('../Stateless/ReactionsList')
const MReaction = require('../Stateless/Reaction')
const VReaction = require('../Stateless/Views/Reactions')
const _ = require('lodash');
const reagents_processed = []
var term = require( 'terminal-kit' ).terminal ;
const MoleculeLookup = require('../../Controllers/MoleculeLookup')
const PubChemLookup = require('../../Controllers/PubChemLookup')
const pubchem = require("pubchem-access").domain("compound");
const reductiveAminationReverse = require('../../Commands/ReductiveAminationReverse')
const transferProtonReverse = require('../../Commands/TransferProtonReverse')

class ReactionAI {

    constructor(db) {

        this.db = db

        this.target = null

        this.callback = null

        this.debugger_on = false

        this.commands_filter = []

        this.commands_filter.push("bondSubstrateToReagentReversal") // DO NOT USE


        // ****
        // Breaks Leuckart Wallach (imine2)
        this.commands_filter.push("protonateCarbocationReversal")

        this.command_sets = []

        this.description_map = {
            'substituteOxygenCarbonDoubleBondForAmine':"SN2 mechanism; O=C bond is replaced with OC bond at the same time as the replacement atom bonds.\nReagent nitrogen atom is bonded to the carboxyl carbon double bonded to oxygen atom on the substrate. At the same time one of the bonds on oxygen=carbon breaks, leaving the oxygen with a negative charge.",
            'transferProton':"Proton is transferred from electrophile (atom with positive charge) on substrate to nucleophile on substrate.",
            'addProtonFromReagentToSubstrate':"Hydroxyl oxygen (oxygen with one hydrogen and one carbon bond) atom on substrate attacks a proton on the reagent. The proton bonds to the oxygen atom giving the oxygen a positive charge and creating a water leaving group.",
            'reduceImineToAmineOnNitrogenMethylCarbon':'Nitrogen=Carbon double bond is replaced with a single bond.',
            'dehydrate':"Oxygen atom with a positive charge and two hydrogen bonds is removed from the substrate",
            'deprotonateNitrogen': "Reagent (base) attacks the proton on the nitrogen. Substrate acts as an acid as it loses a proton.",
            'bondNitrogenToCarboxylCarbon': 'Nitrogen atom (Lewis base, nucleophile) on reagent attacks the carboxyl carbon, forming a bond, and breaking one of the C=O bonds.',
            'breakCarbonOxygenDoubleBond': 'Change C=O bond to a single bond',
            'addProtonToReagent': 'Reagent attacks a proton on an acid catalyst.',
            'createEnolate':'Negative charge on the conjugate base (carbon atom) is delocalized to an electronegative atom such as an oxygen',
            'reductiveAmination':'Carbonyl oxygen is replace by amine group'
        }

        /*
        this.command_map = {
            'reduceImineToAmineOnNitrogenMethylCarbon': 'Reduce imine to amine',
            'reduceImineToAmine': 'Reduce imine to amine',
            'removeProtonFromOxygen': "Remove proton from oxygen atom",
            'protonateCarbocation': 'Add proton to carbocation',
            'substituteOxygenCarbonDoubleBondForAmine': 'Substitute oxygen-carbon double bond for oxygen-carbon single bond and amine group',
            'addProtonFromReagentToHydroxylGroup': 'Add proton from reagent to hydroxyl group on substrate',
            'makeCarbonNitrogenDoubleBond': 'Make carbon-nitrogen double bond',
            'deprotonateNitrogen': 'Deprotonate nitrogen atom on substrate',
            'substituteHalideForAmine': 'Substitute halide for amine group',
            'removeHalide': 'Remove halide',
            'oxygenCarbonDoubleBond': 'Make oxygen-carbon double bond',
            'dehydrate': 'Dehydrate',
            'carbocationShift': 'Shift carbocation',
            'transferProton': 'Transfer proton',
            'breakCarbonOxygenDoubleBond': 'Break oxygen-carbon double bond',
            'bondSubstrateToReagent': 'Bond substrate to reagent',
            'protonate': 'Protonate',
            'addProtonFromReagentToSubstrate': 'Add proton from reagent to substrate'
        }
        */

        this.command_map = {
            'reductiveAmination':'Convert carbonyl group to amine',
            'reduceImineToAmineOnNitrogenMethylCarbon': 'Reduce imine to amine',
            'deprotonateNitrogen': 'Deprotonate nitrogen atom on substrate',
            'dehydrate': 'Dehydrate',
            'transferProton': 'Transfer proton',
            'breakCarbonOxygenDoubleBond': 'Break oxygen-carbon double bond',
            'bondNitrogenToCarboxylCarbon': 'Bond nitrogen on reagent to carboxyl carbon on substrate',
            'addProtonToReagent': 'Protonate reagent using acid catalyst',
            'createEnolate':'Shift negative charge on conjugate base (carbon atom) to carbonyl oxygen',
        }

        this.commands = [
            reductiveAminationReverse,
            transferProtonReverse
        ]
//

    }


    synthesise(target, reagents, callback, max_number_of_steps, DEBUG) {


        if (reagents === undefined || reagents === null) {
            const water = MoleculeFactory("O")
            const formate = MoleculeFactory("C(=O)[O-]")
            const methylamine = MoleculeFactory("CN")
            const methylamide = MoleculeFactory("C[N-]")
            const deprotonated_methylamide = MoleculeFactory("C[NH0]")
            const hydrochloric_acid = MoleculeFactory("Cl")
            const ammonia = MoleculeFactory("N")
            const formaldehyde = MoleculeFactory("C=O")
            reagents = ["A", "B", water, methylamine, methylamide, deprotonated_methylamide, hydrochloric_acid, formate, formaldehyde, ammonia]
        }

        this.callback = callback
        this.target = _.cloneDeep(target)
        const moleculeAI = require("../Stateless/MoleculeAI")(_.cloneDeep([_.cloneDeep(target),1]))
        moleculeAI.validateMolecule()
        const commands = this.commands

        MoleculeLookup(this.db, VMolecule([target,1]).canonicalSMILES()).then(
            (target_json_obj) => {

                const target_name = undefined === target_json_obj.names && undefined === target_json_obj.IUPACName ? target_json_obj.search : ((undefined === target_json_obj.names?target_json_obj.IUPACName:target_json_obj.names[0]) + (undefined !== target_json_obj.MolecularFormula?' (' + target_json_obj.MolecularFormula + ')':""))

                reagents.map((reagent)=>{
                    if (typeof reagent === "string" || VMolecule([target,1]).canonicalSMILES() !== VMolecule([reagent,1]).canonicalSMILES()) {

                        const reagentAI = typeof reagent === "string"?null:require("../Stateless/MoleculeAI")(_.cloneDeep([_.cloneDeep(reagent),1]))
                        if (reagentAI !== null) {
                            reagentAI.validateMolecule()
                        }

                        MoleculeLookup(this.db, typeof reagent === "string"?reagent:VMolecule([reagent, 1]).canonicalSMILES()).then(
                            (reagent_json_obj) => {

                                // New code
                                const horizontal = (target, reagent, reaction_commands) => (i, horizontalCallback) => {
                                    console.log("ReactionAI synthesise -> calling horizontal, horizontalCallback")
                                    console.log(horizontalCallback)
                                    const rule = ""
                                    const DEBUG = false
                                    console.log("ReactionAI synthesise -> calling horizontal, command")
                                    console.log(commands[i])
                                    commands[i](target, reagent, rule, DEBUG, horizontalCallback, horizontal, reaction_commands, i)
                                }

                                const start = horizontal(target, [reagent, 1], commands)
                                start(0, start)

                            },
                            (Err) => {
                                console.log(Err)
                                console.log("Could not get reagent from db")
                            }
                        )

                    }
                })

            },
            (Err) => {
                console.log(Err)
                console.log("Could not get target from db")
            }

        )



    }







}

module.exports = ReactionAI
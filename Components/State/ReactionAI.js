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

class ReactionAI {

    constructor(db) {

        this.db = db

        this.target = null

        this.callback = null

        this.debugger_on = false

        this.commands_filter = []

        this.commands_filter.push("bondSubstrateToReagentReversal") // DO NOT USE

        // pinacol rearrangement
        /*
        ============================================================================
        [Add proton from reagent to hydroxyl group on substrate] CC(O)(C)C(C)(C)O + Cl = CC(O)(C)C(C)(C)[O+] + Cl
        [Dehydrate] CC(O)(C)C(C)(C)[O+] + Cl = CC(O)(C)[C+](C)C + Cl
        [Shift carbocation] CC(O)(C)[C+](C)C + Cl = C[C+](O)C(C)(C)C + Cl
        [Remove proton from oxygen atom] C[C+](O)C(C)(C)C + Cl = C[C+]([O-])C(C)(C)C + Cl
        [Make oxygen-carbon double bond] C[C+]([O-])C(C)(C)C + Cl = CC(=O)C(C)(C)C + Cl
        ============================================================================
        this.commands_filter.push("addProtonFromReagentToHydroxylGroupReversal")
        this.commands_filter.push("dehydrateReversal")
        this.commands_filter.push("carbocationShiftReversal")
        this.commands_filter.push("removeProtonFromOxygenReversal")
        //this.commands_filter.push("oxygenCarbonDoubleBondReversal")
         */

        /*
                this.commands_filter.push("addProtonFromReagentToSubstrateReversal")
                this.commands_filter.push("protonateReversal")
                this.commands_filter.push("makeCarbonNitrogenDoubleBondReversal")
                this.commands_filter.push("breakOxygenCarbonDoubleBondReversal")
                this.commands_filter.push("removeHalideReversal")
                this.commands_filter.push("breakCarbonOxygenDoubleBondReversal")
                this.commands_filter.push("substituteHalideForAmineReversal")
                this.commands_filter.push("deprotonateNitrogenReversal")
                this.commands_filter.push("substituteOxygenCarbonDoubleBondForAmineReversal")
                this.commands_filter.push("transferProtonReversal")
        */


        //this.commands_filter.push("reduceImineToAmineReversal")
        //this.commands_filter.push("reduceImineToAmineOnNitrogenMethylCarbonReversal")

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
            'bondNitrogenToCarboxylCarbon': 'Nitrogen atom (Lewis base, nucleophile) on reagent attacks the carboxyl carbon, forming a bond, and breaking one of the C=O bonds.'
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
          'reduceImineToAmineOnNitrogenMethylCarbon': 'Reduce imine to amine',
          'deprotonateNitrogen': 'Deprotonate nitrogen atom on substrate',
          'dehydrate': 'Dehydrate',
          'transferProton': 'Transfer proton',
          'bondNitrogenToCarboxylCarbon': 'Bond nitrogen on reagent to carboxyl carbon on substrate'

      }



    }

    debugger(o) {
        //// //console.log(this.debugger_on)
        if (this.debugger_on) {
            console.log(o)
        }
    }

    _commmandSetExists(command_set_to_match) {
        const matching_command_sets = this.command_sets.filter((command_set)=>{
            return _.isEqual(command_set,command_set_to_match)
        })
        return matching_command_sets.length > 0
    }

    render(o) {
        console.log(o)
    }



    hasCharge(substrate) {
        return _.findIndex(substrate[0][1], (atom)=>{
            return atom[0] !== "H" && atom[4] !== "" && atom[4] !== 0
        })
    }

    synthesise(target, reagents, callback) {

        if (reagents === undefined || reagents === null) {
            const water = MoleculeFactory("O")
            const formate = MoleculeFactory("C(=O)[O-]")
            const methylamine = MoleculeFactory("CN")
            const methylamide = MoleculeFactory("C[N-]")
            const deprotonated_methylamide = MoleculeFactory("C[NH0]")
            const hydrochloric_acid = MoleculeFactory("Cl")
            const ammonia = MoleculeFactory("N")
            const formaldehyde = MoleculeFactory("C=O")
            reagents = [water, methylamine, methylamide, deprotonated_methylamide, hydrochloric_acid, formate, formaldehyde, ammonia]
        }

        //const reagents = reagent === null || reagent === undefined? [formate, methylamide, methylamine, water, deprotonated_methylamide,hydrochloric_acid, ammonia] : [reagent]
        //const reagents = [hydrochloric_acid]
        // Important: Reagent is the last reagent (as result of reaction step) used in the reaction.
        // eg for pinacol–pinacolone rearrangement the reagent is "Brønsted–Lowry conjugate base" as
        // we protonating a hydroxyl group in reverse
        //const reagents = ["Brønsted–Lowry acid"] // Brønsted–Lowry conjugate base, Brønsted–Lowry acid, formaldehyde
        //const reagents = [ammonia] // MDA

        this.callback = callback
        this.target = _.cloneDeep(target)
        const moleculeAI = require("../Stateless/MoleculeAI")(_.cloneDeep([_.cloneDeep(target),1]))
        moleculeAI.validateMolecule()
        const commands = []

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
                                const reagent_name = undefined === reagent_json_obj.IUPACName?reagent_json_obj.search:reagent_json_obj.IUPACName
                                this.render("Synthesising " + target_name + " using reagent: " + reagent_name)
                                this._synthesise([_.cloneDeep(target), 1], [_.cloneDeep(reagent), 1], _.cloneDeep(commands), 'synthesise', 0, moleculeAI, reagentAI)
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

    results(commands) {

        commands.reverse()

        if (VMolecule(commands[0]['starting substrate']).canonicalSMILES() === VMolecule(commands[commands.length-1]['finish substrate']).canonicalSMILES() ) {
            return
        }



        if (true) {
            //if (commands.length > 0 && this.hasCharge(commands[0]['starting substrate']) === -1) {

            // Final command should result in the substrate we are trying to synthesise
            // VMolecule([this.target, 1]).canonicalSMILES().should.equal(VMolecule(commands[commands.length - 1]['finish substrate']).canonicalSMILES())

            const reaction_steps = commands.map(
                (command, command_index) => {
                    const command_in_plain_english = this.command_map[command['name']]
                    const description = undefined === this.description_map[command['name']]?"":this.description_map[command['name']];
                    return MReaction(
                        "[" + command['name'] + "]" + " " +command_in_plain_english,
                        command['starting substrate'],
                        command['name'] === "reduceImineToAmineOnNitrogenMethylCarbon" ? "Reducing reagent":command['starting reagent'],
                        command['finish substrate'],
                        command['name'] === "reduceImineToAmineOnNitrogenMethylCarbon" ? "Reducing reagent":command['finish reagent'],
                        description
                    )
                }
            )


            if (this.callback !== undefined && this.callback !== null) {
                this.callback(null, reaction_steps)
            } else {
                VReaction(reaction_steps).render(this.db)
            }

        }

    }

    _synthesise(substrate, reagent, commands, caller, depth, moleculeAI, reagentAI) {


        moleculeAI.validateMolecule()
        if (reagentAI !== null) {
            reagentAI.validateMolecule()
        }

        const indicator_map = ["\\", "/"]


        for(const command_name in this.command_map) {

            console.log("C:"+command_name)

            if (this.commands_filter.indexOf(command_name + 'Reversal') === -1) {

                // console.log('_synthesise() inner depth='+depth)
                term.eraseLine()
                //term(indicator_map[Math.floor(Math.random() * 3)])
                term(indicator_map[Math.floor(Math.random() * 2)] + ' ' + this.command_map[command_name])
                term.column(0)

                // testing
                if (caller === "transferProtonReversal") {
                    console.log("Command")
                    console.log(command_name)
                }

                if (caller !== command_name + 'Reversal') {

                    /*
                    ProtonateAI.js::deprotonateNitrogenReverse
        if (this.reaction.container_reagent[0] === "Brønsted–Lowry acid") {
               this.reaction.container_reagent[0] = "Brønsted–Lowry conjugate base"
           } else {
               console.log("Warning: reagent is not an acid ProtonationAI > deprotonateNitrogenReverse(), returning false")
               return false
           }
        */
                    // If command_name is deprotonateNitrogen then pass in Brønsted–Lowry acid as the reagent"
                    // testing
                    //console.log(command_name)
                    if (command_name === 'deprotonateNitrogen') {
                        reagent = "Brønsted–Lowry base"
                    }
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), command_name, _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth, reagentAI)
                }

            }

        }

    }



    runReverseCommand(reverse_reaction, command_name, target, reagent, moleculeAI, commands, caller, depth, reagentAI) {


        if (commands.length>3) {
            console.log(command_name)
        }

        this.debugger(caller + "  reverse reaction result")
        this.debugger("command " + command_name)


        // Check if the command has already been called and returned true
        // Note: In some cases we may need to call a command twice but
        // for now make all commands callable only once
        const command_names = commands.map((command)=>{
            return command['name']
        })

        if (command_name === "removeProtonFromOxygen" && command_names.length > 0 && command_names[command_names.length-1] === "oxygenCarbonDoubleBond") {
            return
        }

        if(command_names.indexOf(command_name)!==-1){
            return
        }

        let r = null




        r = reverse_reaction[command_name + 'Reverse']()

        if (command_name==="bondSubstrateToReagent" && commands.length===4) {
            console.log(hrrre)
            process.exit()
        }


        this.debugger(r)

        /*
        if (command_name === "reduceImineToAmine") {
            console.log(r)
            console.log(VMolecule(reverse_reaction.container_substrate).compressed())
            console.log(VMolecule(reverse_reaction.container_substrate).canonicalSMILES())
            console.log(reduceiminetoaminereevesre)
        }
        */



        if (caller === command_name) {
            return
        }


        if (!r) {
            return
        } else {




            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
                // this.result(target, reagent, commands, command_name)
                return
            }


            const reverse_reaction_substrate = _.cloneDeep(reverse_reaction.container_substrate)
            const reverse_reaction_reagent = _.cloneDeep(reverse_reaction.container_reagent)

            //console.log(VMolecule(reverse_reaction_substrate).compressed())
            //console.log(aaaa)
            //process.exit()

            const reverse_reaction_substrateAI = require("../Stateless/MoleculeAI")(_.cloneDeep(_.cloneDeep(reverse_reaction.container_substrate)))
            const reverse_reaction_reagentAI = typeof reverse_reaction.container_reagent[0] === "string"?null:require("../Stateless/MoleculeAI")(_.cloneDeep(_.cloneDeep(reverse_reaction.container_reagent)))

            reverse_reaction_substrateAI.validateMolecule()
            // addProtonFromReagentToHydroxylGroupReverse
            // addProtonFromReagentToSubstrateReverse
            //console.log("ReactionAI > command name:" + command_name)
            if (reverse_reaction_reagentAI !== null) {
                reverse_reaction_reagentAI.validateMolecule()
            }


            commands.push({
                'name':command_name,
                'starting substrate': _.cloneDeep(reverse_reaction_substrate),
                'starting reagent': command_name === "reduceImineToAmine"?"Reducing agent":_.cloneDeep(reverse_reaction_reagent),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': command_name === "reduceImineToAmine"?"Reducing agent":_.cloneDeep(reagent),
                'function':(reagent)=>{
                    const reaction = new Reaction(_.cloneDeep(reverse_reaction_substrate), _.cloneDeep(reverse_reaction_reagent), {})
                    reaction[command_name]()
                    return reaction
                }})

            this.debugger(command_names)


            if (false) {
            //if(this.hasCharge(commands[commands.length-1]['starting substrate']) === -1 && (reverse_reaction.transferProtonReverse(true) === false && command_name !== "reduceImineToAmine" && command_name !=="reduceImineToAmineOnNitrogenMethylCarbon")) {
                this.results(_.cloneDeep(commands))
                return
            } else {

               //console.log(commands)
               //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
               //console.log(nbn)
                //process.exit()

                this._synthesise(
                    _.cloneDeep(reverse_reaction.container_substrate),
                    _.cloneDeep(reverse_reaction.container_reagent),
                    _.cloneDeep(commands),
                    command_name + 'Reversal',
                    depth + 1,
                    reverse_reaction_substrateAI,
                    reverse_reaction_reagentAI
                )
            }

        }



    }

    _substrate_already_synthesised(substrate, commands) {

        const substrate_compressed = VMolecule(substrate).compressed()
        const matching_commands = commands.filter((command)=>{
            return _.isEqual(VMolecule(command['finish substrate']).compressed(), VMolecule(substrate).compressed())
        })
        return matching_commands.length > 0

    }

    _checkDepth(depth, commands) {
        if (depth > 40) {
            //console.log(commands)
            //console.log(depthgreaterthan40)
        }
    }






}

module.exports = ReactionAI
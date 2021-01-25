const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const ReactionsList = require('../Stateless/ReactionsList')
const MReaction = require('../Stateless/Reaction')
const VReaction = require('../Stateless/Views/Reactions')
const _ = require('lodash');
const reagents_processed = []
var term = require( 'terminal-kit' ).terminal ;

class ReactionAI {

    constructor() {

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

        // ****
        // Breaks Leuckart Wallach (imine2)
        this.commands_filter.push("protonateCarbocationReversal")




        this.command_sets = []

        this.command_map = {
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

    synthesise(target, reagent, callback) {

        this.callback = callback

        const water = MoleculeFactory("O")
        const formate = MoleculeFactory("C(=O)[O-]")
        const methylamine = MoleculeFactory("CN")
        const methylamide = MoleculeFactory("C[N-]")
        const deprotonated_methylamide = MoleculeFactory("C[NH0]")
        const ammonia = MoleculeFactory("N")
        const hydrochloric_acid = MoleculeFactory("Cl")


        //const reagents = reagent === null || reagent === undefined? [formate, methylamide, methylamine, water, deprotonated_methylamide,hydrochloric_acid, ammonia] : [reagent]
        //const reagents = [hydrochloric_acid]
        // Important: Reagent is the last reagent (as result of reaction step) used in the reaction.
        // eg for pinacol–pinacolone rearrangement the reagent is "Brønsted–Lowry conjugate base" as
        // we protonating a hydroxyl group in reverse
        const reagents = ["Brønsted–Lowry acid"] // Brønsted–Lowry conjugate base, Brønsted–Lowry acid

        const moleculeAI = require("../Stateless/MoleculeAI")(_.cloneDeep([_.cloneDeep(target),1]))


        const commands = []

        this.target = _.cloneDeep(target)

        reagents.map((reagent)=>{
            if (typeof reagent === "string" || VMolecule([target,1]).canonicalSMILES() !== VMolecule([reagent,1]).canonicalSMILES()) {
                this.render("Synthesising " + VMolecule([target, 1]).canonicalSMILES() + " product reagent: " + (typeof reagent === "string"?reagent:VMolecule([reagent, 1]).canonicalSMILES()))
                const reagentAI = typeof reagent === "string"?null:require("../Stateless/MoleculeAI")(_.cloneDeep([_.cloneDeep(reagent),1]))
                if (reagentAI !== null) {
                    reagentAI.validateMolecule()
                }
                moleculeAI.validateMolecule()
                this._synthesise([_.cloneDeep(target), 1], [_.cloneDeep(reagent), 1], _.cloneDeep(commands), 'synthesise', 0, moleculeAI, reagentAI)
            }
        })


    }

    results(commands) {

           commands.reverse()

        if (VMolecule(commands[0]['starting substrate']).canonicalSMILES() === VMolecule(commands[commands.length-1]['finish substrate']).canonicalSMILES() ) {
            return
        }


        if (true) {
        //if (commands.length > 0 && this.hasCharge(commands[0]['starting substrate']) === -1) {

               // Final command should result in the substrate we are trying to synthesise
               VMolecule([this.target, 1]).canonicalSMILES().should.equal(VMolecule(commands[commands.length - 1]['finish substrate']).canonicalSMILES())

               const reaction_steps = commands.map(
                   (command, command_index) => {
                       const command_in_plain_english = this.command_map[command['name']]
                       return MReaction(
                           command_in_plain_english,
                           command['starting substrate'],
                           command['starting reagent'],
                           command['finish substrate'],
                           command['finish reagent'],
                       )
                   }
               )

               if (this.callback !== undefined && this.callback !== null) {
                   this.callback(null, reaction_steps)
               } else {
                   VReaction(reaction_steps).render()
                   this.render('============================================================================')
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
            if (this.commands_filter.indexOf(command_name + 'Reversal') === -1) {
                // console.log('_synthesise() inner depth='+depth)
                term.eraseLine()
                //term(indicator_map[Math.floor(Math.random() * 3)])
                term(indicator_map[Math.floor(Math.random() * 2)] + ' ' + this.command_map[command_name])
                term.column(0)
                if (caller !== command_name + 'Reversal') {
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), command_name, _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth, reagentAI)
                }

            }

        }




    }



    runReverseCommand(reverse_reaction, command_name, target, reagent, moleculeAI, commands, caller, depth, reagentAI) {


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

            if(this.hasCharge(commands[commands.length-1]['starting substrate']) === -1 && (reverse_reaction.transferProtonReverse(true) === false && command_name !== "reduceImineToAmine")) {
                this.results(_.cloneDeep(commands))
                return
            } else {


                this._synthesise(
                    _.cloneDeep(reverse_reaction.container_substrate),
                    _.cloneDeep(reverse_reaction.container_reagent),
                    _.cloneDeep(commands),
                    command_name + 'Reversal', depth + 1,
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
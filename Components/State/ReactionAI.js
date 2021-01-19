const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const ReactionsList = require('../Stateless/ReactionsList')
const MReaction = require('../Stateless/Reaction')
const VReaction = require('../Stateless/Views/Reactions')
const _ = require('lodash');
const reagents_processed = []

class ReactionAI {

    constructor() {

        this.target = null

        this.callback = null

        this.debugger_on = false

        this.commands_filter = []

        this.commands_filter.push("bondSubstrateToReagentReversal") // DO NOT USE

        
        //this.commands_filter.push("addProtonFromReagentToSubstrateReversal")
        //this.commands_filter.push("protonateReversal")
        //this.commands_filter.push("makeCarbonNitrogenDoubleBondReversal")
        //this.commands_filter.push("breakOxygenCarbonDoubleBondReversal")
        //this.commands_filter.push("removeHalideReversal")
        //this.commands_filter.push("breakCarbonOxygenDoubleBondReversal")
        //this.commands_filter.push("substituteHalideForAmineReversal")
        //this.commands_filter.push("deprotonateNitrogenReversal")
        //this.commands_filter.push("substituteOxygenCarbonDoubleBondForAmineReversal")
        //this.commands_filter.push("transferProtonReversal")
        //this.commands_filter.push("carbocationShiftReversal")
         //this.commands_filter.push("removeProtonFromOxygenReversal")
        //this.commands_filter.push("oxygenCarbonDoubleBondReversal")
        //this.commands_filter.push("reduceImineToAmineReversal")

        // ****
        // Breaks Leuckart Wallach (imine2)
        this.commands_filter.push("protonateCarbocationReversal")

        //this.commands_filter.push("dehydrateReversal")
        //this.commands_filter.push("addProtonFromReagentToHydroxylGroupReversal")

        this.command_sets = []

        this.command_map = {
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
            'addProtonFromReagentToSubstrate': 'Add proton from reagent to substrate',
            'reduceImineToAmine': 'Reduce imine to amine'
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

    synthesise(target, callback) {

        this.callback = callback

        const water = MoleculeFactory("O")
        const formate = MoleculeFactory("[C+](=O)[O-]")
        const methylamine = MoleculeFactory("CN")
        const methylamide = MoleculeFactory("C[N-]")
        const deprotonated_methylamide = MoleculeFactory("C[NH0]")
        const ammonia = MoleculeFactory("N")
        const hydrochloric_acid = MoleculeFactory("Cl")

        //const reagents = [deprotonated_methylamide, ammonia,hydrochloric_acid]
        const reagents = [deprotonated_methylamide,hydrochloric_acid, ammonia]

        const moleculeAI = require("../Stateless/MoleculeAI")(_.cloneDeep([_.cloneDeep(target),1]))

        const commands = []

        this.target = _.cloneDeep(target)

        reagents.map((reagent)=>{
           this.render("Synthesising " + VMolecule([target,1]).canonicalSMILES() + " reagent: " + VMolecule([reagent,1]).canonicalSMILES())
            this._synthesise([_.cloneDeep(target),1], [_.cloneDeep(reagent),1], _.cloneDeep(commands), 'synthesise', 0, moleculeAI, )
        })


    }

    results(commands) {

           commands.reverse()


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

    _synthesise(substrate, reagent, commands, caller, depth, moleculeAI) {


        for(const command_name in this.command_map) {
            if (this.commands_filter.indexOf(command_name + 'Reversal') === -1) {
                // console.log('_synthesise() inner depth='+depth)
                if (caller !== command_name + 'Reversal') {
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), command_name, _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                }

            }

        }




    }



    runReverseCommand(reverse_reaction, command_name, target, reagent, moleculeAI, commands, caller, depth) {

        this.debugger(caller + "  reverse reaction result")
        this.debugger("command " + command_name)




        // Check if the command has already been called and returned true
        // Note: In some cases we may need to call a command twice but
        // for now make all commands callable only once
        const command_names = commands.map((command)=>{
            return command['name']
        })

        if(command_names.indexOf(command_name)!==-1){
            return
        }

        let r = null

        r = reverse_reaction[command_name + 'Reverse']()

        this.debugger(r)



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


                this._synthesise(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), command_name + 'Reversal', depth + 1)
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
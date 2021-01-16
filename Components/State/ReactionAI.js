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
        this.commands_filter.push("addProtonFromReagentToSubstrateReversal") // Works with Leuckart
        this.commands_filter.push("protonateReversal") // Works with Leuckart
        this.commands_filter.push("makeCarbonNitrogenDoubleBondReversal") // Works with Leuckart
        this.commands_filter.push("breakOxygenCarbonDoubleBondReversal") // Works with Leuckart

        this.commands_filter.push("removeHalideReversal")
        this.commands_filter.push("dehydratrationReversal")
        this.commands_filter.push("breakCarbonOxygenDoubleBondReversal")

        // Akylation
        this.commands_filter.push("substituteHalideForAmineReversal") // Works with Pinacol Rearrangement, Leuckart
        this.commands_filter.push("deprotonateNitrogenReversal") // breaks Leuckart Wallach, Works with Pinacol Rearrangement, Leuckart


        // Leuckart Wallach
        this.commands_filter.push("substituteOxygenCarbonDoubleBondForAmineReversal") // Works with Akylation, Pinacol Rearrangement
         this.commands_filter.push("transferProtonReversal") // Works with Akylation, Pinacol Rearrangement




        // Pinacol Rearrangement
         this.commands_filter.push("carbocationShiftReversal") // Works with Akylation, Leuckart
         this.commands_filter.push("removeProtonFromOxygenReversal") // Works with Akylation, Leuckart


        this.commands_filter.push("oxygenCarbonDoubleBondReversal") // Works with Akylation, Leuckart
        //this.commands_filter.push("protonateCarbocationReversal") // Breaks Akylation
        //this.commands_filter.push("dehydrateReversal") // Also used by Pinacol Rearrangement
        //this.commands_filter.push("addProtonFromReagentToHydroxylGroupReversal") // Also used by Pinacol Rearrangement, Works with Akylation

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
        const reagents = [deprotonated_methylamide]

        const moleculeAI = require("../Stateless/MoleculeAI")(_.cloneDeep([_.cloneDeep(target),1]))

        const commands = []

        this.target = _.cloneDeep(target)

        reagents.map((reagent)=>{
           this.render("Synthesising " + VMolecule([target,1]).canonicalSMILES() + " reagent: " + VMolecule([reagent,1]).canonicalSMILES())
            this._synthesise([_.cloneDeep(target),1], [_.cloneDeep(reagent),1], _.cloneDeep(commands), 'synthesise', 0, moleculeAI, )
        })


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
            /*

        ['carbocationShift','addProtonFromReagentToSubstrate', 'dehydrate', 'protonate', 'transferProton', 'bondSubstrateToReagent', 'addProtonFromReagentToHydroxylGroup', 'makeCarbonNitrogenDoubleBond', 'deprotonateNitrogen', 'substituteHalideForAmine', 'protonateCarbocation', 'removeProtonFromOxygen', 'oxygenCarbonDoubleBond', 'breakCarbonOxygenDoubleBond'].map((command_name)=>{
            if (this.commands_filter.indexOf(command_name + 'Reversal') === -1) {
                // console.log('_synthesise() inner depth='+depth)
                if (caller !== command_name + 'Reversal') {
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), command_name, _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                }

            }
        })
        */

        /*
        commands.reverse()

        //console.log(VMolecule(commands[0]['starting substrate']).canonicalSMILES())
        //console.log(this.hasCharge(commands[0]['starting substrate']))
        //console.log(lkkl)

        if (commands.length > 0 && this.hasCharge(commands[0]['starting substrate']) === -1) {

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
        */


    }



    runReverseCommand(reverse_reaction, command_name, target, reagent, moleculeAI, commands, caller, depth) {


        this.debugger(caller + "  reverse reaction result")

        let r = null

        r = reverse_reaction[command_name + 'Reverse']()

        this.debugger(r)



        if (caller === command_name) {
            return
        }

        console.log(command_name + ' ' + r)
      //  console.log('commands at start:')

        console.log(commands.map((cc)=>{
            return cc['name']
        }))

        console.log(commands.indexOf(command_name))


        if (!r) {
            return
        } else {


            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
               // this.result(target, reagent, commands, command_name)
                return
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))


            const reverse_reaction_substrate = _.cloneDeep(reverse_reaction.container_substrate)
            const reverse_reaction_reagent = _.cloneDeep(reverse_reaction.container_reagent)

/*
            console.log('commands before:')
            console.log(commands.map((cc)=>{
                return cc['name']
            }))
            */


            commands.push({
                'name':command_name,
                'starting substrate': _.cloneDeep(reverse_reaction_substrate),
                'starting reagent': _.cloneDeep(reverse_reaction_reagent),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':(reagent)=>{
                    const reaction = new Reaction(_.cloneDeep(reverse_reaction_substrate), _.cloneDeep(reverse_reaction_reagent), {})
                    reaction[command_name]()
                    return reaction
                }})

            /*
            console.log('commands after:')
            console.log(commands.map((cc)=>{
                return cc['name']
            }))
*/

            /*
            if (commands[0]['name']==='protonateCarbocation') {
                console.log(commands.length)
                console.log(kdflkjasjlfd)
            }
            */

          //  console.log(VMolecule(commands[0]['starting substrate']).canonicalSMILES() + " -> (" + commands[0]['name'] + ") " + VMolecule(commands[0]['finish substrate']).canonicalSMILES())

          //  console.log(VMolecule(reverse_reaction_substrate).canonicalSMILES())
           // console.log(this.hasCharge(reverse_reaction_substrate))
           // console.log(command_name)
            if(commands.length === 3) {
                commands.map((command)=>{
                    console.log(VMolecule(command['starting substrate']).canonicalSMILES() + " -> (" + command['name'] + ") " + VMolecule(command['finish substrate']).canonicalSMILES())
                    return command
                })
                console.log(mmm)
            }

            this._synthesise(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), command_name + 'Reversal', depth+1)

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


    _synthesise_old(substrate, reagent, commands, caller, depth, moleculeAI) {

        const command_names = commands.map((command)=>{
            return command['name']
        })

        if (command_names[command_names.length-1] === "substituteOxygenCarbonDoubleBondForAmine") {
            this.result(substrate, reagent, commands, '_synthesise()')
        }

        if (command_names.length > 0 && command_names[command_names.length-1] === "bondSubstrateToReagent" ) {
            this.result(substrate, reagent, commands, '_synthesise()')
        } else {


            // Proceed only if first step or there is a charge on the substrate.
            if (commands.length === 0 || this.hasCharge(_.cloneDeep(substrate)) !== -1) {



                ['carbocationShift','addProtonFromReagentToSubstrate', 'dehydrate', 'protonate', 'transferProton', 'bondSubstrateToReagent', 'addProtonFromReagentToHydroxylGroup', 'makeCarbonNitrogenDoubleBond', 'deprotonateNitrogen', 'substituteHalideForAmine', 'protonateCarbocation', 'removeProtonFromOxygen', 'oxygenCarbonDoubleBond', 'breakCarbonOxygenDoubleBond'].map((command_name)=>{
                    if (this.commands_filter.indexOf(command_name + 'Reversal') === -1) {
                        // console.log('_synthesise() inner depth='+depth)
                        if (caller !== command_name + 'Reversal') {
                            this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), command_name, _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                        }

                    }
                })

                //reagents_processed.push(VMolecule(reagent).canonicalSMILES())



            } else {


                ['transferProton', 'substituteHalideForAmine'].map((command_name)=>{
                    if (this.commands_filter.indexOf(command_name + 'Reversal') === -1) {
                        this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), command_name, _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                    }
                })

                this.result(substrate, reagent, commands, '_synthesise()')
            }

        }



    }




}

module.exports = ReactionAI
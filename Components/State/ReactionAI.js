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

        this.callback = null

        this.debugger_on = false

        this.commands_filter = []

        this.commands_filter.push("bondSubstrateToReagentReversal") // DO NOT USE
        this.commands_filter.push("addProtonFromReagentToSubstrateReversal") // Works with Leuckart
        this.commands_filter.push("protonateReversal") // Works with Leuckart

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
            'makeOxygenCarbonDoubleBond': 'Make oxygen-carbon double bond',
            'oxygenCarbonDoubleBond': 'Make oxygen-carbon double bond',
            'dehydrate': 'Dehydrate',
            'carbocationShift': 'Shift carbocation',
            'transferProton': 'Transfer proton',
            'breakOxygenCarbonDoubleBond': 'Break oxygen-carbon double bond',
            'breakCarbonOxygenDoubleBond': 'Break oxygen-carbon double bond',
            'bondSubstrateToReagent': 'Bond substrate to reagent',
            'protonate': 'Protonate',
            'addProtonFromReagentToSubstrate': 'Add proton from reagent to substrate'
        }



        this.result = (substrate, reagent, commands, caller, results_callback) => {
            if (reagent === null) {
            //console.log('No reagent')
            } else {
              //console.log('Reagent:')
               //console.log(VMolecule(reagent).compressed())
            }



            // Check if starting substate rate has no charges
            if (commands.length ===0 || this.hasCharge(_.cloneDeep(commands[commands.length-1]["starting substrate"])) !== -1) {
                return
            }

            const command_names = commands.map((command)=>{
                return command['name']
            })



            if( this._commmandSetExists(command_names)) {
               //console.log("Matching command set - exiting")
               // process.exit()
                //// //console.log(kioll)
                return
            }

            this.command_sets.push(command_names)


            const command_names_reversed = _.cloneDeep(command_names).reverse()
            const commands_reversed = _.cloneDeep(commands).reverse()


            this.run(_.cloneDeep(commands).reverse(), 0, null, substrate, reagent, results_callback)
            this.debugger("Caller:" + caller)
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

    run(commands, command_index, reaction, starting_substrate, starting_reagent) {

        if (commands[command_index] === undefined) {


            const reaction_steps =  commands.map(
                (command, command_index)=> {
                    const command_in_plain_english = this.command_map[command['name']]
                    return MReaction(
                        command_in_plain_english,
                        command['starting substrate'],
                        command['starting reagent'],
                        command['calculated product'],
                        command['finish reagent']
                    )
                }
            )

            if (this.callback !== undefined && this.callback !== null) {
                this.callback(null, reaction_steps)
            } else {
                VReaction(reaction_steps, reaction.container_substrate, '').render()
                this.render('============================================================================')
            }

        } else {
            const command_names = commands.map((command)=>{
                return command['name']
            })
            if (commands.length === 3) {
               //console.log("RUN command_names:")
               //console.log(command_names)
            }

            const r = _.cloneDeep(commands[command_index])['function'](command_index, command_names, commands[command_index]['starting substrate'])
            commands[command_index]['calculated product'] = r.container_substrate

            this.run(_.cloneDeep(commands), _.cloneDeep(command_index+1), _.cloneDeep(r), _.cloneDeep(starting_substrate), _.cloneDeep(starting_reagent))
        }
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


        const reagents = [deprotonated_methylamide, ammonia,hydrochloric_acid]

        const moleculeAI = require("../Stateless/MoleculeAI")(_.cloneDeep([_.cloneDeep(target),1]))

        const commands = []

        reagents.map((reagent)=>{
           this.render("Synthesising " + VMolecule([target,1]).canonicalSMILES() + " reagent: " + VMolecule([reagent,1]).canonicalSMILES())
            console.log("Commands ...")
            console.log(commands)
            this._synthesise([_.cloneDeep(target),1], [_.cloneDeep(reagent),1], _.cloneDeep(commands), 'synthesise', 0, moleculeAI)
        })


    }


    _synthesise(substrate, reagent, commands, caller, depth, moleculeAI) {

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


    runReverseCommand(reverse_reaction, command_name, target, reagent, moleculeAI, commands, caller, depth) {

        this.debugger(caller + "  reverse reaction result")


        let r = null
        r = reverse_reaction[command_name + 'Reverse']()

        this.debugger(r)


        if (caller === command_name) {
            return
        }


        if (r) {


            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
                this.result(target, reagent, commands, command_name)
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))


            const reverse_reaction_substrate = _.cloneDeep(reverse_reaction.container_substrate)
            const reverse_reaction_reagent = _.cloneDeep(reverse_reaction.container_reagent)

            commands.push({
                'name':command_name,
                'starting substrate': _.cloneDeep(reverse_reaction_substrate),
                'starting reagent': _.cloneDeep(reverse_reaction_reagent),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const reaction = new Reaction(_.cloneDeep(reverse_reaction_substrate), _.cloneDeep(reverse_reaction_reagent), {})
                    reaction[command_name]()
                    return reaction
                }})

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





}

module.exports = ReactionAI
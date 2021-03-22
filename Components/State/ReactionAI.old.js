// Deprotonation
// https://en.wikipedia.org/wiki/Pinacol_rearrangement
// Rules
// If [OH2+] then deprotonate [OH2+]

// Hydrate
// https://en.wikipedia.org/wiki/Pinacol_rearrangement
// Rules
// If carbocation then add water group to carbocation

// Make O=C bond
// https://en.wikipedia.org/wiki/Pinacol_rearrangement
// Rules
// if OH group attached to carbon then change to O=C
// Reversal
// if O=C bond then change to [OH]C

// Carbocation shift
// https://en.wikipedia.org/wiki/Pinacol_rearrangement
// Shift of carbon / hydrogen atom from carbon to a carbocation
// Rules
// if [C+]C(H) then move (H) to [C+]
// else if [C+]C(C) then move (C) to [C+]
// Reversal
// Same as above


// Protonation
// Organic chemistry 8th edition p245
// https://www.chemistrysteps.com/oxymercuration-demercuration/
// Addition of water to alkene (C=C)
// Rules
// if C=C bond then protonate (reagent = acid)
// Reversal
// if C+ (carbocation) convert [C+]C bond to C=C, removing proton from C.

// Epoxide acidic ring opening
// https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(McMurry)/Chapter_18%3A_Ethers_and_Epoxides%3B_Thiols_and_Sulfides/18.06_Reactions_of_Epoxides%3A_Ring-opening
// https://chem.libretexts.org/Courses/Sacramento_City_College/SCC%3A_Chem_420_-_Organic_Chemistry_I/Text/09%3A_Reactions_of_Alkenes/9.13%3A_Dihydroxylation_of_Alkenes
// if O atom on ring then protonate O (reagant = acid)
// Reversal
// if [O+] atom on ring then deprotonate [O+] (reagent = conjugate base)


// https://en.wikipedia.org/wiki/Pinacol_rearrangement
// https://en.wikipedia.org/wiki/Leuckart_reaction
// if OH (hyrodxyl oxygen) protonate OH (reagent = acid)
// Reversal
// if water group ([O+] then deprotonate [O+] (reagent = conjugate base)

//https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(Smith)/Chapter_22%3A_Carboxylic_Acids_and_Their_Derivatives—_Nucleophilic_Acyl_Substitution/22.11%3A_Reactions_of_Esters"
// if oxygen on double bond then protonate oxygen (reagent = acid)
// Reversal
// if [O+]=C then deprotonate [O+] (reagent = conjugate base)

// https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(McMurry)/18%3A_Ethers_and_Epoxides_Thiols_and_Sulfides/18.06%3A_Reactions_of_Epoxides_-_Ring-opening
// https://en.wikipedia.org/wiki/Leuckart_reaction
// if [O-] atom then protonate [O-] atom (reagent = acid)
// Reversal
// if OH (hyrodxyl oxygen) deprotonate OH (reagent = conjugate base)

// https://en.wikipedia.org/wiki/Ritter_reaction
// if [N+] then protonate [N+] (reagent = acid)
// Reversal
// if N with H then deprotonate N (reagent = conjugate base)

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
        // this.commands_filter.push("makeCarbonNitrogenDoubleBondReversal") // Works with Leuckart
        // this.commands_filter.push("breakOxygenCarbonDoubleBondReversal") // Works with Leuckart


        // Akylation
        // this.commands_filter.push("substituteHalideForAmineReversal") // Works with Pinacol Rearrangement, Leuckart
        // this.commands_filter.push("deprotonateNitrogenReversal") // breaks Leuckart Wallach, Works with Pinacol Rearrangement, Leuckart


        // Leuckart Wallach
        // this.commands_filter.push("substituteOxygenCarbonDoubleBondForAmineReversal") // Works with Akylation, Pinacol Rearrangement
        // this.commands_filter.push("transferProtonReversal") // Works with Akylation, Pinacol Rearrangement
        // this.commands_filter.push("addProtonFromReagentToHydroxylGroupReversal") // Also used by Pinacol Rearrangement, Works with Akylation
        // this.commands_filter.push("dehydrationReversal") // Also used by Pinacol Rearrangement
         // this.commands_filter.push("protonateCarbocationReversal") // Breaks Akylation

        // Pinacol Rearrangement
        // this.commands_filter.push("carbocationShiftReversal") // Works with Akylation, Leuckart
        // this.commands_filter.push("removeProtonFromOxygenReversal") // Works with Akylation, Leuckart
        // this.commands_filter.push("oxygenCarbonDoubleBondReversal") // Works with Akylation, Leuckart

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
          //console.log(this.command_sets.length)

            /*
            if (command_names.length === 4) {
               //console.log(caller)
               //console.log(command_names)
               //console.log(VMolecule(substrate).compressed())
               //console.log(this.command_sets.length)
               //console.log(kljjj)
            }
            */


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

            /*
             commands.push({
                'name':'removeProtonFromOxygen',
                'starting substrate': _.cloneDeep(substrate_with_proton_added),
                'starting reagent': _.cloneDeep(reagent_removeProtonFromOxygenReversal),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const removeProtonFromOxygenReversal_reaction = new Reaction(_.cloneDeep(substrate_with_proton_added), _.cloneDeep(reagent_removeProtonFromOxygenReversal), {})
                    removeProtonFromOxygenReversal_reaction.removeProtonFromOxygen()
                    return removeProtonFromOxygenReversal_reaction
                }})
             */

            const reaction_steps =  commands.map(
                (command, command_index)=> {
                    //console.log(this.command_map)
                    //console.log(this.command_map[command['name']])
                    //console.log(command)
                    //console.log(kljlkjljk)
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
                VReaction(db, reaction_steps, reaction.container_substrate, '').render()
                this.render('============================================================================')
            }

            /*
            this.render("\n\Run (result) " + commands.map((command)=>{
                   return command['name']
            }))

            this.debugger("Start: substrate:")
            this.debugger(VMolecule(starting_substrate).compressed())
            // @todo Check for duplicate starting substrates and filter out duplicate substrates with longer steps
            this.render(VMolecule(starting_substrate).canonicalSMILES() + " --> " + VMolecule(reaction.container_substrate).canonicalSMILES() + " (reagent=" + VMolecule(starting_reagent).canonicalSMILES() + ")")
            this.debugger("Start: reagent:")
            this.debugger(VMolecule(starting_reagent).compressed())
            this.debugger("Finish: substrate")
            this.debugger(VMolecule(reaction.container_substrate).compressed())

            //process.exit()
            if (VMolecule(starting_reagent).canonicalSMILES() === "CN") {
             //console.log(jgd)
            }
             */
           // reagents_processed.push(VMolecule(starting_reagent).canonicalSMILES())
           // console.log('reagents_processed')
           // console.log(reagents_processed)


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
            /*
            if (commands.length === 3) {

               //console.log(command_index)
                if (command_index === 0 || command_index === 1 || command_index === 2) {
                   //console.log(commands[command_index]['name'])
                   //console.log(VMolecule(r.container_substrate).canonicalSMILES())
                    if (command_index === 2) {
                       //console.log(thirdcommand)
                    }
                }
            }
            */
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
        //// //console.log(VMolecule([target,1]).compressed())
        //// //console.log(sssss)



        const reagents = [deprotonated_methylamide, ammonia,hydrochloric_acid]
        //const reagents = [ammonia]
        //const reagents = [hydrochloric_acid]


        // Leuckart Wallach - synthesising MoleculeFactory("CC(CC1=CC=CC=C1)NC")
        reagents.map((reagent)=>{
           this.render("Synthesising " + VMolecule([target,1]).canonicalSMILES() + " reagent: " + VMolecule([reagent,1]).canonicalSMILES())
            // Leuckart Wallach - synthesising MoleculeFactory("CC(CC1=CC=CC=C1)NC"), reagent deprotonated_methylamide
           //  this._synthesise([_.cloneDeep(target),1], [_.cloneDeep(deprotonated_methylamide),1], [], 'synthesise', 0)
            // Akylation - synthesising MoleculeFactory("CC(CC1=CC2=C(C=C1)OCO2)N"
            // this._synthesise([_.cloneDeep(target),1], [_.cloneDeep(ammonia),1], [], 'synthesise', 0)
            // Pinacol Rearrangement - synthesising MoleculeFactory("CC(CC1=CC=CC=C1)=NC")
            // this._synthesise([_.cloneDeep(target),1], [_.cloneDeep(hydrochloric_acid),1], [], 'synthesise', 0)
            this.synthesiseWithReagent([_.cloneDeep(target),1], [_.cloneDeep(reagent),1], [], 'synthesise', 0)
        })




    }



    synthesiseWithReagent(substrate, reagent, commands, caller, depth) {


        //console.log('_synthesise() depth='+depth)
        this._checkDepth(depth, commands)

         //console.log("---------------------------")
         //console.log(VMolecule(substrate).compressed())
         //console.log('Commands:')
         //console.log(commands)
         //console.log("---------------------------")
         //console.log('depth=' + depth)

//        this.render(substrate, reagent)
        const moleculeAI = require("../Stateless/MoleculeAI")(_.cloneDeep(substrate))

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

                if (this.commands_filter.indexOf('carbocationShiftReversal') === -1) {
                //    this.carbocationShiftReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    //this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'carbocationShift', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)


                }




/*

                if (this.commands_filter.indexOf('breakOxygenCarbonDoubleBondReversal') === -1) {
                    //this.breakCarbonOxygenDoubleBondReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'breakCarbonOxygenDoubleBond', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                }

                if (this.commands_filter.indexOf('oxygenCarbonDoubleBondReversal') === -1) {
                    //this.oxygenCarbonDoubleBondReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'oxygenCarbonDoubleBond', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }

                if (this.commands_filter.indexOf('addProtonFromReagentToSubstrateReversal') === -1) {
                    //this.addProtonFromReagentToSubstrateReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'addProtonFromReagentToSubstrate', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }


                if (this.commands_filter.indexOf('dehydrationReversal') === -1) {
                    //this.dehydrationReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'dehydrate', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }



                if (this.commands_filter.indexOf('protonateReversal') === -1) {
                    //this.protonateReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'protonate', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }



                if (this.commands_filter.indexOf('transferProtonReversal') === -1) {
                    //this.transferProtonReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'transferProton', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }


                if (this.commands_filter.indexOf('bondSubstrateToReagentReversal') === -1) {
                    //this.bondSubstrateToReagentReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'bondSubstrateToReagent', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                }


                if (this.commands_filter.indexOf('addProtonFromReagentToHydroxylGroupReversal') === -1) {
                    //this.addProtonFromReagentToHydroxylGroupReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'addProtonFromReagentToHydroxylGroup', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }


                if (this.commands_filter.indexOf('makeCarbonNitrogenDoubleBondReversal') === -1) {
                   // this.makeCarbonNitrogenDoubleBondReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'makeCarbonNitrogenDoubleBond', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }


                if (this.commands_filter.indexOf('deprotonateNitrogenReversal') === -1) {
                   // this.deprotonateNitrogenReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'deprotonateNitrogen', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }



                //this.removeHalideReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                if (this.commands_filter.indexOf('substituteHalideForAmineReversal') === -1) {
                   // this.substituteHalideForAmineReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'substituteHalideForAmine', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }



                if (this.commands_filter.indexOf('substituteOxygenCarbonDoubleBondForAmineReversal') === -1) {
                    //this.substituteOxygenCarbonDoubleBondForAmineReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'substituteOxygenCarbonDoubleBondForAmine', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }



                if (this.commands_filter.indexOf('protonateCarbocationReversal') === -1) {
                    // this.protonateCarbocationReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'protonateCarbocation', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }

                if (this.commands_filter.indexOf('removeProtonFromOxygenReversal') === -1) {
                    //this.removeProtonFromOxygenReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'removeProtonFromOxygen', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                }
*/

                ['carbocationShift','addProtonFromReagentToSubstrate', 'dehydrate', 'protonate', 'transferProton', 'bondSubstrateToReagent', 'addProtonFromReagentToHydroxylGroup', 'makeCarbonNitrogenDoubleBond', 'deprotonateNitrogen', 'substituteHalideForAmine', 'protonateCarbocation', 'removeProtonFromOxygen', 'oxygenCarbonDoubleBond', 'breakCarbonOxygenDoubleBond'].map((command_name)=>{
                    if (this.commands_filter.indexOf(command_name + 'Reversal') === -1) {
                       // console.log('_synthesise() inner depth='+depth)
                        if (caller !== command_name + 'Reversal') {
                            //console.log(caller + " " + command_name)
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

                /*
                // We can have a reverse proton transfer on a neutral substrate
                if (this.commands_filter.indexOf('transferProtonReversal') === -1) {
                   // this.transferProtonReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth + 1)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'transferProton', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }

                if (this.commands_filter.indexOf('substituteHalideForAmineReversal') === -1) {
                    //this.substituteHalideForAmineReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth + 1)
                    this.runReverseCommand(new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {}), 'substituteHalideForAmine', _.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                }
                */


                this.result(substrate, reagent, commands, '_synthesise()')
            }

        }


    }


    // removeProtonFromOxygenReversal(), // protonateCarbocationReversal(), // substituteOxygenCarbonDoubleBondForAmine()
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

            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), command_name + 'Reversal', depth+1)

        }



    }



    removeProtonFromOxygenReversal(target, reagent, moleculeAI, commands, caller, depth) {

        this.debugger("removeProtonFromOxygenReversal() reverse reaction result")


        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null
        r = reverse_reaction.removeProtonFromOxygenReverse()

        this.debugger(r)


        if (caller === "removeProtonFromOxygenReversal") {
            return
        }


        if (r) {


            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
                this.result(target, reagent, commands, 'removeProtonFromOxygenReversal')
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))


            const substrate_with_proton_added = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_removeProtonFromOxygenReversal = _.cloneDeep(reverse_reaction.container_reagent)

            commands.push({
                'name':'removeProtonFromOxygen',
                'starting substrate': _.cloneDeep(substrate_with_proton_added),
                'starting reagent': _.cloneDeep(reagent_removeProtonFromOxygenReversal),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const removeProtonFromOxygenReversal_reaction = new Reaction(_.cloneDeep(substrate_with_proton_added), _.cloneDeep(reagent_removeProtonFromOxygenReversal), {})
                    removeProtonFromOxygenReversal_reaction.removeProtonFromOxygen()
                    return removeProtonFromOxygenReversal_reaction
                }})

            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'removeProtonFromOxygenReversal', depth+1)

        }



    }

    protonateCarbocationReversal(target, reagent, moleculeAI, commands, caller, depth) {

        if (caller === "protonateCarbocationReversal") {
            return
        }

        const command_names = commands.map((command)=>{
            return command['name']
        })


        if (command_names.indexOf('protonateCarbocation') !== -1) {
           //console.log(gothereeee)
            return
        }

        this.debugger("protonateCarbocationReversal() reverse reaction result")

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null
        r = reverse_reaction.protonateCarbocationReverse()

        this.debugger(r)


        if (r) {

            this.debugger(command_names)

            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
                //// //console.log(eeeee)
                this.result(target, reagent, commands, 'protonateCarbocationReversal')
            }

            const substrate_with_carbocation = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_with_proton_added = _.cloneDeep(reverse_reaction.container_reagent)

            commands.push({
                'name':'protonateCarbocation',
                'starting substrate': _.cloneDeep(substrate_with_carbocation),
                'starting reagent': _.cloneDeep(reagent_with_proton_added),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const protonateCarbocation_reaction = new Reaction(_.cloneDeep(substrate_with_carbocation), _.cloneDeep(reagent_with_proton_added), {})
                    protonateCarbocation_reaction.protonateCarbocation()
                    return protonateCarbocation_reaction
                }})

            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'protonateCarbocationReversal', depth+1)
        }



    }

    substituteOxygenCarbonDoubleBondForAmineReversal(target, reagent, moleculeAI, commands, caller, depth) {
        if (caller === "substituteOxygenCarbonDoubleBondForAmineReversal") {
            return
        }

        this.debugger("substituteOxygenCarbonDoubleBondForAmineReversal() reverse reaction result")



        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null
        r = reverse_reaction.substituteOxygenCarbonDoubleBondForAmineReverse()

        this.debugger(r)

        /*
        if (r) {
           //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
           //console.log(VMolecule(reverse_reaction.container_reagent).compressed())
           //console.log(qwerty)
        }
         */

        if (r) {


            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
                //// //console.log(eeeee)
                this.result(target, reagent, commands, 'substituteOxygenCarbonDoubleBondForAmineReversal')
            }


            this.debugger(commands.map((command)=>{
                return command['name']
            }))


            const substrate_with_oxygen_double_bond = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_substituteOxygenCarbonDoubleBondForAmineReversal = _.cloneDeep(reverse_reaction.container_reagent)

            commands.push({
                'name':'substituteOxygenCarbonDoubleBondForAmine',
                'starting substrate': _.cloneDeep(substrate_with_oxygen_double_bond),
                'starting reagent': _.cloneDeep(reagent_substituteOxygenCarbonDoubleBondForAmineReversal),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const substituteOxygenCarbonDoubleBondForAmine_reaction = new Reaction(_.cloneDeep(substrate_with_oxygen_double_bond), _.cloneDeep(reagent_substituteOxygenCarbonDoubleBondForAmineReversal), {})
                    substituteOxygenCarbonDoubleBondForAmine_reaction.substituteOxygenCarbonDoubleBondForAmine()
                    return substituteOxygenCarbonDoubleBondForAmine_reaction
                }})

            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'substituteOxygenCarbonDoubleBondForAmineReversal', depth+1)
        }



    }

    addProtonFromReagentToHydroxylGroupReversal(target, reagent, moleculeAI, commands, caller, depth) {

        // Akylation ok
       // return false
        const command_names = commands.map((command)=>{
            return command['name']
        })



        if (caller === "addProtonFromReagentToHydroxylGroupReversal") {
            return
        }

        this.debugger("addProtonFromReagentToHydroxylGroupReversal() reverse reaction result")



        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null
        r = reverse_reaction.addProtonFromReagentToHydroxylGroupReverse()

        this.debugger(r)



        if (r) {

            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
                //// //console.log(eeeee)
                this.result(target, reagent, commands, 'addProtonFromReagentToHydroxylGroupReversal')
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))




            const substrate_proton_removed = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_with_proton_added = _.cloneDeep(reverse_reaction.container_reagent)

           //console.log(VMolecule(substrate_proton_removed).compressed())
           //console.log(spr)

            /*
            const addProtonFromReagentToHydroxylGroupReversal_substrate_ai = require("../Stateless/MoleculeAI")(_.cloneDeep(substrate_proton_removed))

            if(addProtonFromReagentToHydroxylGroupReversal_substrate_ai.findHydroxylOxygenIndex() === -1) {
               //console.log("Hydroxyl oxgyen not oufnd")
               //console.log(VMolecule(target).compressed())
               //console.log(safgh)
            }
            */


            commands.push({
                'name':'addProtonFromReagentToHydroxylGroup',
                'starting substrate': _.cloneDeep(substrate_proton_removed),
                'starting reagent': _.cloneDeep(reagent_with_proton_added),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const addProtonFromReagentToHydroxylGroup_reaction = new Reaction(_.cloneDeep(substrate_proton_removed), _.cloneDeep(reagent_with_proton_added), {})
                    addProtonFromReagentToHydroxylGroup_reaction.addProtonFromReagentToHydroxylGroup()
                    return addProtonFromReagentToHydroxylGroup_reaction
                }})



            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'addProtonFromReagentToHydroxylGroupReversal', depth+1)
        }


    }



    makeCarbonNitrogenDoubleBondReversal(target, reagent, moleculeAI, commands, caller, depth) {


        // Akylation ok
        // return false

       //console.log("ReactionAI.js Calling makeCarbonNitrogenDoubleBondReversal() caller=" + caller)
        if (caller === "makeCarbonNitrogenDoubleBondReversal") {
            return
        }


        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null

        this.debugger("makeCarbonNitrogenDoubleBondReversal() reverse reaction result")



        r = reverse_reaction.makeCarbonNitrogenDoubleBondReverse()

        this.debugger(r)



        //// //console.log(nnnn)

        /*
        if (depth === 2 && caller==="addProtonFromReagentToHydroxylGroupReversal") {
          //console.log(r)
          //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
           //console.log("Commands:")
           //console.log(commands.map((command)=>{
                return command['name']
            }))
          //console.log(h)
        }
        */

        if (r) {

            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
               //console.log(ffffff)
                return
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))



            const substrate_carbon_nitrogen_double_bond_removed = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_after_reverse_reaction = _.cloneDeep(reverse_reaction.container_reagent)

            commands.push({
                'name':'makeCarbonNitrogenDoubleBond',
                'starting substrate': _.cloneDeep(substrate_carbon_nitrogen_double_bond_removed),
                'starting reagent': _.cloneDeep(reagent_after_reverse_reaction),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const makeCarbonNitrogenDoubleBond_reaction = new Reaction(_.cloneDeep(substrate_carbon_nitrogen_double_bond_removed), _.cloneDeep(reagent_after_reverse_reaction), {})
                    makeCarbonNitrogenDoubleBond_reaction.makeNitrogenCarbonDoubleBond()
                    return makeCarbonNitrogenDoubleBond_reaction
                }})



            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'makeCarbonNitrogenDoubleBondReversal', depth+1)
        } else {
           //console.log("ReactionAI.js makeCarbonNitrogenDoubleBondReversal() reaction failed")
        }


    }



    deprotonateNitrogenReversal(target, reagent, moleculeAI, commands, caller, depth) {


        if (caller === "deprotonateNitrogenReversal") {
            return
        }

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null

        this.debugger("deprotonateNitrogenReversal() reverse reaction result")


        r = reverse_reaction.deprotonateNitrogenReverse()

        this.debugger(r)


       // this.debugger(VMolecule(reverse_reaction.container_substrate).compressed())

      // //console.log(deprontttanatereversal)




        if (r) {



            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
               //console.log(ggggg)
                this.result(target, reagent, commands, 'deprotonateNitrogenReversal')
                return
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))


           //console.log("deprotationReversal")
           //console.log(VMolecule(target).compressed())
           //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
           //console.log(iop)

            const substrate_protonated = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_deprotonated = _.cloneDeep(reverse_reaction.container_reagent)

            commands.push({
                'name':'deprotonateNitrogen',
                'starting substrate': _.cloneDeep(substrate_protonated),
                'starting reagent': _.cloneDeep(reagent_deprotonated),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':(command_index, command_names, substrate)=>{

                    const deprotonate_nitrogen_reaction = new Reaction(_.cloneDeep(substrate_protonated), _.cloneDeep(reagent_deprotonated), {})

                    deprotonate_nitrogen_reaction.deprotonateNitrogen(command_names, command_index )
                   //console.log('deprotonate result')
                   //console.log(VMolecule(deprotonate_reaction.container_substrate).compressed())
                    return deprotonate_nitrogen_reaction
                }})

/*

            const command_names = commands.map((command)=>{
                return command['name']
            })
            if (command_names.length === 1) {
               //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
               //console.log(VMolecule(reagent).compressed())
               //console.log(command_names)
               //console.log(r)
               //console.log(abcd)
            }
*/



            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'deprotonateNitrogenReversal', depth+1)
        }



    }

    substituteHalideForAmineReversal(target, reagent, moleculeAI, commands, caller, depth) {


        if (caller === "substituteHalideForAmineReversal") {
            return
        }

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null
        r = reverse_reaction.substituteHalideForAmineReverse()

        this.debugger("substituteHalideForAmineReversal() reverse reaction result")


        this.debugger(r)

        if (r) {

            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
               //console.log(ggggg)
                this.result(target, reagent, commands, 'substituteHalideForAmineReversal')
                return
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))




            const substrate_with_halide = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_substituteHalideForAmineReversal = _.cloneDeep(reverse_reaction.container_reagent)

            commands.push({
                'name':'substituteHalideForAmine',
                'starting substrate': _.cloneDeep(substrate_with_halide),
                'starting reagent': _.cloneDeep(reagent_substituteHalideForAmineReversal),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const substitute_halide_reaction = new Reaction(_.cloneDeep(substrate_with_halide), _.cloneDeep(reagent_substituteHalideForAmineReversal), {})
                    substitute_halide_reaction.substituteHalideForAmine()
                    return substitute_halide_reaction
                }})

            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'substituteHalideForAmineReversal', depth+1)


        }



    }

    removeHalideReversal(target, reagent, moleculeAI, commands, caller, depth) {

        // Not used
        return false


        if (caller === "removeHalideReversal") {
            return
        }

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null
        r = reverse_reaction.removeHalideReverse()

        this.debugger("removeHalideReversal() reverse reaction result")




        this.debugger(r)

        //// //console.log(commands)
//        this.debugger(VMolecule(reverse_reaction.container_substrate).compressed())

  //     //console.log(removehliadreversal)



        if (r) {


            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
               //console.log(ggggg)
                this.result(target, reagent, commands, 'removeHalideReversal')
                return
            }


            this.debugger(commands.map((command)=>{
                return command['name']
            }))


            const substrate_with_halide = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_removeHalideReversal = _.cloneDeep(reverse_reaction.container_reagent)

            commands.push({
                'name':'removeHalide',
                'starting substrate': _.cloneDeep(substrate_with_halide),
                'starting reagent': _.cloneDeep(reagent_removeHalideReversal),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const remove_halide_reaction = new Reaction(_.cloneDeep(substrate_with_halide), _.cloneDeep(reagent_removeHalideReversal), {})
                    remove_halide_reaction.removeHalide()
                    //// //console.log(VMolecule(remove_halide_reaction.container_substrate).compressed())
                    //// //console.log(ghjik)
                    return remove_halide_reaction
                }})


            /*
            const command_names = commands.map((command)=>{
                return command['name']
            })
            if (command_names.length ===  2) {
               //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
               //console.log(VMolecule(reverse_reaction.container_reagent).compressed())
               //console.log(command_names)
               //console.log(r)
               //console.log(dsa)
            }
            */


            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'removeHalideReversal', depth+1)
        }


    }

    oxygenCarbonDoubleBondReversal(target, reagent, moleculeAI, commands, caller, depth) {


        // Akylation ok
        // return false

        if (caller === "oxygenCarbonDoubleBondReversal" || caller === "breakOxygenCarbonDoubleBondReversal") {
            return
        }



        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        let r = null

        this.debugger("oxygenCarbonDoubleBondReversal() reverse reaction result")


        r = reverse_reaction.oxygenCarbonDoubleBondReverse()


        this.debugger(r)



        if (r) {

            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
               //console.log(hhhhh)
                return
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))




           //console.log(VMolecule(reagent_with_oxygen_carbon_double_bond_removed).compressed())
           //console.log('Pinacol rearrangement reversed - make oxygen carbon double bond reversed (caller=' + caller + '):')
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const substrate_with_oxygen_carbon_double_bond_removed = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_with_oxygen_carbon_double_bond_removed = _.cloneDeep(reverse_reaction.container_reagent)

          // //console.log("oxygenCarbonDoubleBondReversal() substrate_with_oxygen_carbon_double_bond_removed")
          // //console.log(VMolecule(substrate_with_oxygen_carbon_double_bond_removed).compressed())
          // //console.log(jjjjjqqq)

            commands.push({
                'name':'oxygenCarbonDoubleBond',
                'starting substrate': _.cloneDeep(substrate_with_oxygen_carbon_double_bond_removed),
                'starting reagent': _.cloneDeep(reagent_with_oxygen_carbon_double_bond_removed),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const makeOxygenCarbonDoubleBond_reaction = new Reaction(_.cloneDeep(substrate_with_oxygen_carbon_double_bond_removed), _.cloneDeep(reagent_with_oxygen_carbon_double_bond_removed), {})
                    makeOxygenCarbonDoubleBond_reaction.makeOxygenCarbonDoubleBond()
                    return makeOxygenCarbonDoubleBond_reaction
            }})
            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'oxygenCarbonDoubleBondReversal', depth+1)
        }



    }

    _substrate_already_synthesised(substrate, commands) {

       //console.log(commands)
        // //console.log(VMolecule(substrate).compressed())
       //console.log("=======================================")
       //console.log(VMolecule(commands[0]['finish substrate']).compressed())
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

    dehydrationReversal(target, reagent, moleculeAI, commands, caller, depth) {


        if (caller === "dehydrationReversal") {
            return
        }

        // Akylation ok
        // return false
        //// //console.log("dehydrationReversal() caller="+caller + " depth=" +depth )

        const command_names = commands.map((command)=>{
            return command['name']
        })


        /*
        if (caller==="addProtonFromReagentToHydroxylGroupReversal") {
           //console.log('Call from addProtonFromReagentToHydroxylGroupReversal- dehydrationReversal()')
            return
        }

        if (caller==="deprotonateNitrogenReversal") {
           //console.log('Call from deprotonateNitrogenReversal- dehydrationReversal()')
            return
        }
        */



        /*
        if (caller === "dehydrationReversal" || caller==="addProtonFromReagentToHydroxylGroupReversal") {
           //console.log('Duplicate call or call from addProtonFromReagentToHydroxylGroupReversal- dehydrationReversal()')
            return
        }
        */

        //console.log('dehydrationReversal() depth=' + depth + ' caller ' + caller)

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        this.debugger("dehydrationReversal() reverse reaction result")





        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        // https://en.wikipedia.org/wiki/Leuckart_reaction (2)

        let r = null

            r = reverse_reaction.dehydrateReverse()




        this.debugger(r)


            if (r) {


                if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
                    return
                }

                this.debugger(commands.map((command)=>{
                    return command['name']
                }))


                //// //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
                //// //console.log(cccc)


                const hydrated_substrate = _.cloneDeep(reverse_reaction.container_substrate)
                const hydrated_reagent = _.cloneDeep(reverse_reaction.container_reagent)

                if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
                    return
                }


                commands.push({
                    'name':'dehydrate',
                    'starting substrate': _.cloneDeep(hydrated_substrate),
                    'starting reagent': _.cloneDeep(hydrated_reagent),
                    'finish substrate': _.cloneDeep(target),
                    'finish reagent': _.cloneDeep(reagent),
                    'function':()=>{
                        const dehydrate_reaction = new Reaction(_.cloneDeep(hydrated_substrate), _.cloneDeep(hydrated_reagent), {})
                        dehydrate_reaction.dehydrate()
                        return dehydrate_reaction
                    }})


                this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent),_.cloneDeep(commands), 'dehydrationReversal', depth+1)


            } else {
                  //console.log("dehydrationReversal() reverse reaction failed")
            }





    }


    carbocationShiftReversal(target, reagent, moleculeAI, commands, caller, depth) {



        // Akylation ok
        // return false


        if (caller === "carbocationShiftReversal") {
            return
        }

        if (commands.length > 0 && commands[commands.length-1].name === 'carbocationShift') {
            return false
        }

        this.debugger("carbocationShiftReversal() reverse reaction result")


        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        // Carbocation shift
        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        let r = null
        r = reverse_reaction.carbocationShiftReverse()
        this.debugger(r)


        if (r) {




            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
                /*
                const command_names = commands.map((command)=>{
                    return command['name']
                })
               //console.log(command_names)
               //console.log("target substrate")
               //console.log(VMolecule(target).compressed())
               //console.log(jjjjj)
              */
                return
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))


           //console.log('Pinacol rearrangement reversed - carbocation shift (caller=' + caller + '):')
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const substrate_after_carbon_shift = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_after_carbon_shift = _.cloneDeep(reverse_reaction.container_reagent)
            commands.push({
                'name':'carbocationShift',
                'starting substrate': _.cloneDeep(substrate_after_carbon_shift),
                'starting reagent': _.cloneDeep(reagent_after_carbon_shift),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const carbocationShift_reaction = new Reaction(_.cloneDeep(substrate_after_carbon_shift), _.cloneDeep(reagent_after_carbon_shift), {})
                    carbocationShift_reaction.carbocationShift()
                    return carbocationShift_reaction
                }})
            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'carbocationShiftReversal', depth+1)
        }




    }

    transferProtonReversal(target, reagent, moleculeAI, commands, caller, depth) {


        // Akylation ok
        // return false

        if (caller === 'transferProtonReversal') {
           //console.log("Duplicate call - transferProtonReversal()")
            return
        }

        /*
        [ 'dehydrate',
  'addProtonFromReagentToHydroxylGroup',
  'makeCarbonNitrogenDoubleBond', 'protonate' ]
  'protonate'
         */


         //console.log('Caller: '+caller)
         //console.log('target (substrate before reverse reaction) transferProtonReversal()')
         //console.log(VMolecule(target).compressed())
         //console.log('reagent  before reverse reaction) transferProtonReversal()')
         //console.log(VMolecule(reagent).compressed())

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null

        this.debugger("transferProtonReversal() reverse reaction result")


        r = reverse_reaction.transferProtonReverse()
        const command_names = commands.map((command)=>{
            return command['name']
        })
       //console.log(command_names)

        this.debugger(r)

       //console.log(r)
        if (r) {


            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
               //console.log(kkkkk)
                return
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))



           //console.log('Pinacol rearrangement reversed - deprotonate (caller=' + caller + '):')
            // https://en.wikipedia.org/wiki/Leuckart_reaction (4)
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const substrate_with_proton_transferred = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_with_proton_transferred = _.cloneDeep(reverse_reaction.container_reagent)

               //console.log('target (substrate before reverse reaction) transferProtonReversal()')
               //console.log(VMolecule(target).compressed())
              //console.log('reagent  before reverse reaction) transferProtonReversal()')
              //console.log(VMolecule(reagent).compressed())

               //console.log('target (substrate after reverse reaction) transferProtonReversal()')
               //console.log(VMolecule(substrate_with_proton_transferred).compressed())
               //console.log('reagent  after reverse reaction) transferProtonReversal()')
              //console.log(VMolecule(reagent_with_proton_transferred).compressed())
               //console.log(r)

            const substrate_with_proton_transferredAI = require("../Stateless/MoleculeAI")(_.cloneDeep(substrate_with_proton_transferred))

           //console.log("Validating molecule (transferProtonReversal()")
            if (substrate_with_proton_transferredAI.validateMolecule() === false) {
               //console.log('transferProtonReversal.js substrate_with_proton_transferred is not valid')
               //console.log('Method: transferProtonReverse()')
               //console.log(VMolecule(substrate_with_proton_transferred).compressed())
               //console.log(i)
            }


            commands.push(
                {
                    'name':'transferProton',
                    'starting substrate': _.cloneDeep(substrate_with_proton_transferred),
                    'starting reagent': _.cloneDeep(reagent_with_proton_transferred),
                    'finish substrate': _.cloneDeep(target),
                    'finish reagent': _.cloneDeep(reagent),
                    'function':()=>{
                        const transferProton_reaction = new Reaction(_.cloneDeep(substrate_with_proton_transferred), _.cloneDeep(reagent_with_proton_transferred), {})
                        transferProton_reaction.transferProton()
                       //console.log("ReactionAI Transfer proton result:")
                       //console.log(VMolecule(transferProton_reaction.container_substrate).compressed())
                        return transferProton_reaction
                    }
                }
            )

            /*
            // [ 'dehydrate', 'addProtonFromReagentToHydroxylGroup', 'makeCarbonNitrogenDoubleBond', 'protonate', 'transferProton' ]
            const command_names = commands.map((command)=>{
                return command['name']
            })
            if (command_names.length === 5) {
               //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
               //console.log(command_names)
               //console.log(r)
               //console.log(bcde)
            }
            */


          //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
          // //console.log(protontransferred)

            /*
            this.substituteOxygenCarbonDoubleBondReversal(
                _.cloneDeep(reverse_reaction.container_substrate),
                _.cloneDeep(reverse_reaction.container_reagent),
                moleculeAI,
                commands,
                'protontransferred',
                depth +1
            )
             */

            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'transferProtonReversal', depth+1)

        } else {
              //console.log('transferProtonReversal() reaction failed')
        }


    }

    breakCarbonOxygenDoubleBondReversal(target, reagent, moleculeAI, commands, caller, depth) {


        // Akylation ok
        // return false

        if (caller === "breakCarbonOxygenDoubleBondReversal" || caller === "oxygenCarbonDoubleBondReversal") {
           //console.log('Duplicate call - breakCarbonOxygenDoubleBondReversal()')
            return
        }


         const substrate = _.cloneDeep(target)


        this.debugger("breakCarbonOxygenDoubleBondReversal() reverse reaction result")


        const reverse_reaction = new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {})

        let r = null





        const command_names = commands.map((command)=>{
            return command['name']
        })

        if (command_names[command_names.length -1] === "transferProtonReversal") {
           //console.log(VMolecule(target).compressed())
           //console.log(xxxx)
        }

        r = reverse_reaction.breakCarbonOxygenDoubleBondReverse()

        if (caller === "protontransferred") {
//           //console.log(command_names)
          // //console.log(VMolecule(target).compressed())
           //console.log(r)
           //console.log(bbbreakOx)
        }

        if (r===true) {
           //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
           //console.log(breakoxybond)
        }
        this.debugger(r)



        if (r) {

            // // https://en.wikipedia.org/wiki/Leuckart_reaction (5)
            //this.render(reaction.container_substrate, reaction.container_reagent)
            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
               //console.log(aaaaaa)
                return
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))





            const substrate_with_oxygen_carbon_double_bond = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_with_oxygen_carbon_double_bond = _.cloneDeep(reverse_reaction.container_reagent)

           //console.log('substrate (substrate before reverse reaction) breakOxygenCarbonDoubleBondReversal()')
           //console.log(VMolecule(substrate).compressed())
           //console.log('substrate (substrate after reverse reaction) breakOxygenCarbonDoubleBondReversal()')
           //console.log(VMolecule(substrate_with_oxygen_carbon_double_bond).compressed())

            const substrate_with_oxygen_carbon_double_bondAI = require("../Stateless/MoleculeAI")(_.cloneDeep(substrate_with_oxygen_carbon_double_bond))

            if (substrate_with_oxygen_carbon_double_bondAI.validateMolecule() === false) {
               //console.log('ReactoinAI.js substrate_with_oxygen_carbon_double_bond is not valid')
               //console.log('Method: breakCarbonOxygenDoubleBondReverse()')
               //console.log(VMolecule(substrate_with_oxygen_carbon_double_bond).compressed())
               //console.log(i)
            }

            commands.push({
                'name':'breakCarbonOxygenDoubleBond',
                'starting substrate': _.cloneDeep(substrate_with_oxygen_carbon_double_bond),
                'starting reagent': _.cloneDeep(reagent_with_oxygen_carbon_double_bond),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const breakOxygenCarbonDoubleBond_reaction = new Reaction(_.cloneDeep(substrate_with_oxygen_carbon_double_bond), _.cloneDeep(reagent_with_oxygen_carbon_double_bond), {})
                    breakOxygenCarbonDoubleBond_reaction.breakCarbonOxygenDoubleBond()
                    return breakOxygenCarbonDoubleBond_reaction
                }})

            /*
            // [ 'dehydrate', 'addProtonFromReagentToHydroxylGroup', 'makeCarbonNitrogenDoubleBond', 'protonate', 'transferProton', 'breakOxygenCarbonDoubleBond' ]
            const command_names = commands.map((command)=>{
                return command['name']
            })
            if (command_names.length === 6) {
               //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
               //console.log(command_names)
               //console.log(r)
               //console.log(bcdefg)
            }
            */

            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'breakCarbonOxygenDoubleBondReversal', depth+1)
        } else {
              //console.log('breakOxygenCarbonDoubleBondReversal() reverse reaction failed')
        }




    }

    bondSubstrateToReagentReversal(target, reagent, moleculeAI, commands, caller, depth) {

        return false

        // Akylation ok
        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null


        r = reverse_reaction.bondSubstrateToReagentReverse()

        this.debugger("bondSubstrateToReagentReversal() reverse reaction result")


        this.debugger(r)

        const c_names = commands.map((command)=>{
            return command['name']
        })


        if (c_names.length === 1 && c_names[0]==="deprotonate") {
           //console.log(VMolecule(target).compressed())
           //console.log(breaksubstrate)
        }

        /*
       //console.log("BondSubstrateToReagent caller=" + caller + " depth="+depth)
        const c_names = commands.map((command)=>{
            return command['name']
        })
       //console.log(c_names)
       //console.log(r)
        if (c_names.length === 2) {
           //console.log(VMolecule(target).compressed())
           //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
           //console.log(hjkhlasf)
        }
        */


        if (caller === "bondSubstrateToReagentReversal()") {
           //console.log('Duplicate call - bondSubstrateToReagentReversal()')
            return
        }

        this.debugger("bondSubstrateToReagentReversal() reverse reaction result")



        this.debugger(r)



        if (r) {



            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
               //console.log(bbbbb)
                return
            }


            this.debugger(commands.map((command)=>{
                return command['name']
            }))

            // https://en.wikipedia.org/wiki/Leuckart_reaction (6)
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const break_bond_substrate = _.cloneDeep(reverse_reaction.container_substrate)
            const break_bond_reagent = _.cloneDeep(reverse_reaction.leaving_groups[0])

           //console.log('bondSubstrateToReagentReversal() depth=' + depth)

           //console.log('target (substrate before reverse reaction bondSubstrateToReagentReversal')
           //console.log(VMolecule(target).compressed())
           //console.log('reagent (reagent before reverse reaction bondSubstrateToReagentReversal')
           //console.log(VMolecule(reagent).compressed())


           //console.log('subtrate (substrate after reverse reaction bondSubstrateToReagentReversal')
           //console.log(VMolecule(break_bond_substrate).compressed())
           //console.log('reagent (reagent after reverse reaction bondSubstrateToReagentReversal')
            //// //console.log(VMolecule(break_bond_reagent).compressed())
          //console.log(ytr)



            commands.push({
                'name':'bondSubstrateToReagent',
                'starting substrate': _.cloneDeep(break_bond_substrate),
                'starting reagent': _.cloneDeep(break_bond_reagent),
                'finish substrate': _.cloneDeep(target),
                'finish reagent': _.cloneDeep(reagent),
                'function':()=>{
                    const bondSubstrateToReagent_reaction = new Reaction(_.cloneDeep(break_bond_substrate), _.cloneDeep(break_bond_reagent), {})
                    bondSubstrateToReagent_reaction.bondSubstrateToReagent()
                    return bondSubstrateToReagent_reaction
                }})

/*
            const command_names = commands.map((command)=>{
                return command['name']
            })

            if (command_names.length === 3) {
               //console.log(command_names)
               //console.log('bondSubstrateToReagentReversal caller=' + caller + " depth=" + depth)
               //console.log(VMolecule(target).compressed())
               //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
               //console.log(VMolecule(reverse_reaction.container_reagent).compressed())
               //console.log(command_names)
               //console.log(r)
               //console.log(zyx)
            }
*/

            this.synthesiseWithReagent(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'bondSubstrateToReagentReversal()', depth+1)
        } else{
             //console.log("Failed breakBond() reverse reaction")
        }



    }

    protonateReversal(target, reagent, moleculeAI, commands, caller, depth) {


        // Akylation ok
        // return false

        if (depth === 1 && caller==="dehydrationReversal") {
           //console.log("ReactionAI.js Calling protonateReversal() caller=" + caller + " depth=" + depth)
        }


        if (caller==="protonateReversal()") {
            return
        }

         //console.log('protonateReversal() depth=') + depth
         //console.log('Caller: '+caller)
         //console.log('substrate before reaction (protonateReversal())')
         //console.log(VMolecule(target).compressed())
         //console.log('reagent before reaction (protonateReversal()')
         //console.log(VMolecule(reagent).compressed())

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        // https://en.wikipedia.org/wiki/Leuckart_reaction (3)

            let r = null
            r = reverse_reaction.protonateReverse()
//         //console.log('Pinacol rearrangement reversed - deprotonate (caller=' + caller + '):')
  //       //console.log('Leuckart reaction reversed - deprotonate (caller=' + caller + '):')


        if (depth === 4 && caller==="deprotonateNitrogenReversal") {
           //console.log("ReactionAI.js Calling protonateReversal() caller=" + caller + " depth=" + depth)
           //console.log(r)
           //console.log(VMolecule(reverse_reaction.container_substrate).compressed())
        }

        this.debugger("protonateReversal() reverse reaction result")


        this.debugger(r)



        if (r) {

            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
               //console.log(ccccc)
                return
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))



            // https://en.wikipedia.org/wiki/Leuckart_reaction (1)
                //this.render(reaction.container_substrate, reaction.container_reagent)
                const deprotonated_substrate = _.cloneDeep(reverse_reaction.container_substrate)
                const protonated_reagent = _.cloneDeep(reverse_reaction.container_reagent)

                /*

               //console.log('protonateReversal()')

               //console.log('substrate before reverse reaction')
               //console.log(VMolecule(target).compressed())
               //console.log('reagent before reverse reaction ')
               //console.log(VMolecule(reagent).compressed())

               //console.log('substrate after reverse reaction (deprotonate) deprotonated_substrate')
               //console.log(VMolecule(deprotonated_substrate).compressed())
               //console.log('reagent after reverse reaction (deprotonate) protonated_reagent')
               //console.log(VMolecule(protonated_reagent).compressed())
               //console.log('protonateReversal() Exiting')

               //console.log(caller)
               //console.log(depth)
                */


                commands.push(
                    {
                        'name':'protonate',
                        'starting substrate': _.cloneDeep(deprotonated_substrate),
                        'starting reagent': _.cloneDeep(protonated_reagent),
                        'finish substrate': _.cloneDeep(target),
                        'finish reagent': _.cloneDeep(reagent),
                        'function':()=>{
                            const protonate_reaction = new Reaction(_.cloneDeep(deprotonated_substrate), _.cloneDeep(protonated_reagent), {})
                            protonate_reaction.protonate()
                            return protonate_reaction
                        }
                    }
                )
                this.synthesiseWithReagent(reverse_reaction.container_substrate, reverse_reaction.container_reagent, _.cloneDeep(commands), 'protonateReversal', depth+1)
            } else {
                 //console.log('protonateReversal() reaction returned false')
            }
       // }



    }

    addProtonFromReagentToSubstrateReversal(target, reagent, moleculeAI, commands, caller, depth) {


        // Akylation ok
        // return false

        if (caller==="addProtonFromReagentToSubstrateReversal") {
            return
        }

         //console.log('addProtonFromReagentToSubstrateReversal()')
         //console.log('Caller: '+caller)
         //console.log('target (substrate before reaction)')
         //console.log(VMolecule(target).compressed())
         //console.log('reagent  before reaction)')


        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        // https://en.wikipedia.org/wiki/Leuckart_reaction (3)
        this.debugger("addProtonFromReagentToSubstrateReversal() reverse reaction result")



        let r = null
        r = reverse_reaction.addProtonFromSubstrateToReagent()
//         //console.log('Pinacol rearrangement reversed - deprotonate (caller=' + caller + '):')
        //       //console.log('Leuckart reaction reversed - deprotonate (caller=' + caller + '):')


        this.debugger(r)


        if (r) {

            if (this._substrate_already_synthesised(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(commands))) {
                return
            }

            this.debugger(commands.map((command)=>{
                return command['name']
            }))

            // https://en.wikipedia.org/wiki/Leuckart_reaction (1)
            //this.render(reaction.container_substrate, reaction.container_reagent)
             //console.log('deprotonated substrate (substrate after reverse reaction')
            const deprotonated_substrate = _.cloneDeep(reverse_reaction.container_substrate)
           //console.log(VMolecule(deprotonated_substrate).compressed())
           //console.log(deprotonatedsubstrate)
             //console.log('protonated reagent (reagent after reverse reaction')
            const protonated_reagent = _.cloneDeep(reverse_reaction.container_reagent)
             //console.log(VMolecule(protonated_reagent).compressed())

          //console.log(VMolecule(reagent).compressed())


            commands.push(
                {
                    'name':'addProtonFromReagentToSubstrate',
                    'starting substrate': _.cloneDeep(deprotonated_substrate),
                    'starting reagent': _.cloneDeep(protonated_reagent),
                    'finish substrate': _.cloneDeep(target),
                    'finish reagent': _.cloneDeep(reagent),
                    'function':()=>{
                        const addProtonFromReagentToSubstrate_reaction = new Reaction(_.cloneDeep(deprotonated_substrate), _.cloneDeep(protonated_reagent), {})
                        addProtonFromReagentToSubstrate_reaction.addProtonFromReagentToSubstrate()
                        return addProtonFromReagentToSubstrate_reaction
                    }
                }
            )
            this.synthesiseWithReagent(reverse_reaction.container_substrate, reverse_reaction.container_reagent, _.cloneDeep(commands), 'addProtonFromReagentToSubstrateReversal', depth+1)
        } else {
           //console.log("addProtonFromReagentToSubstrateReversal() reverse reaction failed")
        }
        // }




    }
}

module.exports = ReactionAI
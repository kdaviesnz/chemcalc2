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
const _ = require('lodash');

class ReactionAI {

    constructor() {
        this.render = (substrate, reagent) => {
              // console.log(VMolecule(substrate).canonicalSMILES())
            if (reagent === null) {
                  // console.log('No reagent')
            } else {
                  // console.log('Reagent:')
                  // console.log(VMolecule(reagent).canonicalSMILES())
            }
       }

        this.result = (substrate, reagent, commands, caller) => {
            if (reagent === null) {
             // console.log('No reagent')
            } else {
               // console.log('Reagent:')
                // console.log(VMolecule(reagent).compressed())
            }

            // console.log("Commands:")

            /*
            console.log(commands.map((command)=>{
                return command['name']
            }))
            */

            const command_names = commands.map((command)=>{
                return command['name']
            })


            // Leukart Wallach
            if (false) {
            //if (command_names.length === 7 && command_names[0] === "dehydrate" && command_names[command_names.length-1] === "bondSubstrateToReagent") {
                // console.log("Starting substrate (first command): " + command_names[command_names.length-1])
              //  // console.log(VMolecule(commands[commands.length - 1]['starting substrate']).compressed())
                // console.log(VMolecule(commands[commands.length - 1]['starting substrate']).canonicalSMILES())
                // console.log("Starting reagent (first command)")
                // console.log(VMolecule(commands[commands.length - 1]['starting reagent']).compressed())
                const reaction_object = commands[commands.length - 1]['function']()
                // console.log("Calculated substrate " + commands[commands.length - 1]["name"])
                // console.log(VMolecule(reaction_object.container_substrate).compressed())
                // console.log("----------------------------------")


                // console.log("Starting substrate (second command) " + command_names[command_names.length-2])
                // console.log(VMolecule(commands[commands.length - 2]['starting substrate']).compressed())
                // console.log("Starting reagent (second command)")
                // console.log(VMolecule(commands[commands.length - 2]['starting reagent']).compressed())
                const reaction_object2 = commands[commands.length - 2]['function']()
                // console.log("Calculated substrate " + commands[commands.length - 2]["name"])
                // console.log(VMolecule(reaction_object2.container_substrate).compressed())
                // console.log("----------------------------------")


                // console.log("Starting substrate (third command) "  + command_names[command_names.length-3])
                // console.log(VMolecule(commands[commands.length - 3]['starting substrate']).compressed())

                // console.log("Starting reagent (third command)")
                // console.log(VMolecule(commands[commands.length - 3]['starting reagent']).compressed())

                const reaction_object3 = commands[commands.length - 3]['function']()
                // console.log("Calculated substrate " + commands[commands.length - 3]["name"])
                // console.log(VMolecule(reaction_object3.container_substrate).compressed())

                // console.log("----------------------------------")


                // console.log("Starting substrate (fourth command) "  + command_names[command_names.length-4])
                // console.log(VMolecule(commands[commands.length - 4]['starting substrate']).compressed())

                // console.log("Starting reagent (fourth command)")
                // console.log(VMolecule(commands[commands.length - 4]['starting reagent']).compressed())
                const reaction_object4 = commands[commands.length - 4]['function']()
                // console.log("Calculated substrate " + commands[commands.length - 4]["name"])
                // console.log(VMolecule(reaction_object4.container_substrate).compressed())
                // console.log("Calculated reagent " + commands[commands.length - 4]["name"])
                // console.log(VMolecule(reaction_object4.container_reagent).compressed())
                // console.log("----------------------------------")


                // console.log("Starting substrate (fifth command) "  + command_names[command_names.length-5])
                // console.log(VMolecule(commands[commands.length - 5]['starting substrate']).compressed())

                // console.log("Starting reagent (fifth command)")
                // console.log(VMolecule(commands[commands.length - 5]['starting reagent']).compressed())

                const reaction_object5 = commands[commands.length - 5]['function']()
                // console.log("Calculated substrate " + commands[commands.length - 5]["name"])
                // console.log(VMolecule(reaction_object5.container_substrate).compressed())
                // console.log("Calculated reagent " + commands[commands.length - 5]["name"])
                // console.log(VMolecule(reaction_object5.container_reagent).compressed())
                // console.log("----------------------------------")



                // console.log("Starting substrate (sixth command) " + command_names[command_names.length-6])
                // console.log(VMolecule(commands[commands.length - 6]['starting substrate']).compressed())

                // console.log("Starting reagent (sixth command)")
                // console.log(VMolecule(commands[commands.length - 6]['starting reagent']).compressed())

                const reaction_object6 = commands[commands.length - 6]['function']()
                // console.log("Calculated substrate " + commands[commands.length - 6]["name"])
                // console.log(VMolecule(reaction_object6.container_substrate).compressed())
                // console.log("Calculated reagent " + commands[commands.length - 6]["name"])
                // console.log(VMolecule(reaction_object6.container_reagent).compressed())

                // console.log("----------------------------------")


                // console.log("Starting substrate (last command) " + command_names[command_names.length-7])
                // console.log(VMolecule(commands[commands.length - 7]['starting substrate']).compressed())

                // console.log("Starting reagent (last command)")
                // console.log(VMolecule(commands[commands.length - 7]['starting reagent']).compressed())

                const reaction_object7 = commands[commands.length - 7]['function']()
                // console.log("Calculated substrate " + commands[commands.length - 7]["name"])
                // console.log(VMolecule(reaction_object7.container_substrate).compressed())
                // console.log("Calculated reagent " + commands[commands.length - 7]["name"])
                // console.log(VMolecule(reaction_object7.container_reagent).compressed())

                // console.log("----------------------------------")



            }

            // console.log('starting substrate:')
            // console.log(VMolecule(commands[commands.length-1]['starting substrate']).canonicalSMILES())
         //   this.run(_.cloneDeep(commands).reverse(), 0, null, substrate, reagent)
              // console.log("Caller:" + caller)
        }
    }

    run(commands, command_index, reaction, starting_substrate, starting_reagent) {
        if (commands[command_index] === undefined) {
            /*
               // console.log("\n\Run (result)" + commands.map((command)=>{
                   return command['name']
               }))
               */
            // console.log("Start: substrate:")
            // console.log(VMolecule(starting_substrate).compressed())
            // console.log("Start: reagent:")
            // console.log(VMolecule(starting_reagent).compressed())
            // console.log("Finish: substrate=" + VMolecule(reaction.container_substrate).canonicalSMILES())
            // console.log(VMolecule(reaction.container_reagent).compressed())
        } else {
            const r = commands[command_index]['function']()
            this.run(_.cloneDeep(commands), _.cloneDeep(command_index+1), _.cloneDeep(r), _.cloneDeep(starting_substrate), _.cloneDeep(starting_reagent))
        }
    }

    hasCharge(substrate) {
        return _.findIndex(substrate[0][1], (atom)=>{
            return atom[0] !== "H" && atom[4] !== "" && atom[4] !== 0
        })
    }

    synthesise(target) {
        const water = MoleculeFactory("O")
        const formate = MoleculeFactory("[C+](=O)[O-]")
        const methylamine = MoleculeFactory("CN")
       // console.log(VMolecule([formate,1]).compressed())
       // console.log(VMolecule([formate,1]).canonicalSMILES())
        this.synthesiseCallback([_.cloneDeep(target),1], [_.cloneDeep(methylamine),1], [], 'synthesise', 0)
    }
    
    synthesiseCallback(substrate, reagent, commands, caller, depth) {
          // console.log("---------------------------")
          // console.log(VMolecule(substrate).compressed())
          // console.log('Commands:')
          // console.log(commands)
          // console.log("---------------------------")
          // console.log('depth=' + depth)

//        this.render(substrate, reagent)
        const moleculeAI = require("../Stateless/MoleculeAI")(_.cloneDeep(substrate))

        const command_names = commands.map((command)=>{
            return command['name']
        })

        if (command_names.length > 0 && command_names[command_names.length-1] === "bondSubstrateToReagent") {
            this.result(substrate, reagent, commands, 'synthesiseCallback()')
        } else {


            // Proceed only if first step or there is a charge on the substrate.
            if (commands.length === 0 || this.hasCharge(_.cloneDeep(substrate)) !== -1) {

                this.carbocationShiftReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                this.addProtonFromReagentToSubstrateReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                this.oxygenCarbonDoubleBondReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                this.dehydrationReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                this.protonateReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
                this.transferProtonReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                this.breakOxygenCarbonDoubleBondReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                this.bondSubstrateToReagentReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                this.addProtonFromReagentToHydroxylGroupReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                this.makeCarbonNitrogenDoubleBondReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

                this.deprotonateReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)


            } else {



                // We can have a reverse proton transfer on a neutral substrate
                this.transferProtonReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth + 1)
                this.result(substrate, reagent, commands, 'synthesiseCallback()')
            }

        }


    }

    addProtonFromReagentToHydroxylGroupReversal(target, reagent, moleculeAI, commands, caller, depth) {


        if (depth === 1 && caller==="dehydrationReversal") {
            // console.log("ReactionAI.js Calling addProtonFromReagentToHydroxylGroupReversal() caller=" + caller + " depth=" + depth)
        }


        if (caller === "addProtonFromReagentToHydroxylGroupReversal") {
            return
        }

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null
        r = reverse_reaction.addProtonFromReagentToHydroxylGroupReverse()


        if (r) {
            const substrate_proton_removed = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_with_proton_added = _.cloneDeep(reverse_reaction.container_reagent)

            commands.push({
                'name':'addProtonFromReagentToHydroxylGroup',
                'starting substrate': substrate_proton_removed,
                'starting reagent': reagent_with_proton_added,
                'finish substrate': target,
                'finish reagent': reagent,
                'function':()=>{
                    const reaction = new Reaction(substrate_proton_removed, reagent_with_proton_added, {})
                    reaction.addProtonFromReagentToHydroxylGroup()
                    return reaction
                }})



            this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'addProtonFromReagentToHydroxylGroupReversal', depth+1)
        }
    }

    makeCarbonNitrogenDoubleBondReversal(target, reagent, moleculeAI, commands, caller, depth) {




        // console.log("ReactionAI.js Calling makeCarbonNitrogenDoubleBondReversal() caller=" + caller)
        if (caller === "makeCarbonNitrogenDoubleBondReversal") {
            return
        }


        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null
        r = reverse_reaction.makeCarbonNitrogenDoubleBondReverse()

        /*
        if (depth === 2 && caller==="addProtonFromReagentToHydroxylGroupReversal") {
           // console.log(r)
           // console.log(VMolecule(reverse_reaction.container_substrate).compressed())
            // console.log("Commands:")
            // console.log(commands.map((command)=>{
                return command['name']
            }))
           // console.log(h)
        }
        */

        if (r) {
            const substrate_carbon_nitrogen_double_bond_removed = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_after_reverse_reaction = _.cloneDeep(reverse_reaction.container_reagent)

            commands.push({
                'name':'makeCarbonNitrogenDoubleBond',
                'starting substrate': substrate_carbon_nitrogen_double_bond_removed,
                'starting reagent': reagent_after_reverse_reaction,
                'finish substrate': target,
                'finish reagent': reagent,
                'function':()=>{
                    const reaction = new Reaction(substrate_carbon_nitrogen_double_bond_removed, reagent_after_reverse_reaction, {})
                    reaction.makeNitrogenCarbonDoubleBond()
                    return reaction
                }})



            this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'makeCarbonNitrogenDoubleBondReversal', depth+1)
        } else {
            // console.log("ReactionAI.js makeCarbonNitrogenDoubleBondReversal() reaction failed")
        }
    }

    deprotonateReversal(target, reagent, moleculeAI, commands, caller, depth) {


/*
        if (depth === 1 && caller==="dehydrationReversal") {
            // console.log("ReactionAI.js Calling deprotonateReversal() caller=" + caller + " depth=" + depth)
        }
        */


        if (caller === "deprotonateReversal") {
            return
        }

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null
        r = reverse_reaction.deprotonateReverse()



//        // console.log(VMolecule(target).compressed())
  //      // console.log(r)
    //

        if (r) {
            const substrate_protonated = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_deprotonated = _.cloneDeep(reverse_reaction.container_reagent)

            commands.push({
                'name':'protonate',
                'starting substrate': substrate_protonated,
                'starting reagent': reagent_deprotonated,
                'finish substrate': target,
                'finish reagent': reagent,
                'function':()=>{
                    const reaction = new Reaction(substrate_protonated, reagent_deprotonated, {})
                    reaction.protonate()
                    return reaction
                }})

            /*
                        // [ 'dehydrate', 'addProtonFromReagentToHydroxylGroup', 'makeCarbonNitrogenDoubleBond'. 'protonate ]
            const command_names = commands.map((command)=>{
                return command['name']
            })
            if (command_names.length === 4) {
                // console.log(VMolecule(reverse_reaction.container_substrate).compressed())
                // console.log(command_names)
                // console.log(r)
                // console.log(abcd)
            }


             */

            this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'deprotonateReversal', depth+1)
        }
    }

    oxygenCarbonDoubleBondReversal(target, reagent, moleculeAI, commands, caller, depth) {


        if (caller === "oxygenCarbonDoubleBondReversal" || caller === "breakOxygenCarbonDoubleBondReversal") {
            return
        }



        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        let r = null

        r = reverse_reaction.makeOxygenCarbonDoubleBondReverse()

        if (r) {


            // console.log(VMolecule(reagent_with_oxygen_carbon_double_bond_removed).compressed())
            // console.log('Pinacol rearrangement reversed - make oxygen carbon double bond reversed (caller=' + caller + '):')
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const substrate_with_oxygen_carbon_double_bond_removed = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_with_oxygen_carbon_double_bond_removed = _.cloneDeep(reverse_reaction.container_reagent)


            // console.log('substrate after reverse reaction (makeOxygenCarbonDoubleBondReverse()) substrate_with_oxygen_carbon_double_bond_removed')
            // console.log(VMolecule(substrate_with_oxygen_carbon_double_bond_removed).compressed())
            // console.log('reagent after reverse reaction (makeOxygenCarbonDoubleBondReverse) reagent_with_oxygen_carbon_double_bond_removed')

            const substrate_with_oxygen_carbon_double_bond_removedAI = require("../Stateless/MoleculeAI")(_.cloneDeep(substrate_with_oxygen_carbon_double_bond_removed))

            // console.log("Validating molecule (makeOxygenCarbonDoubleBondReverse()")
            if (substrate_with_oxygen_carbon_double_bond_removedAI.validateMolecule() === false) {
                // console.log('makeOxygenCarbonDoubleBondReverse.js substrate_with_oxygen_carbon_double_bond_removed is not valid')
                // console.log('Method: makeOxygenCarbonDoubleBondReverse()')
                // console.log(VMolecule(substrate_with_oxygen_carbon_double_bond_removed).compressed())
                // console.log(i)
            }

            commands.push({
                'name':'makeOxygenCarbonDoubleBond',
                'starting substrate': substrate_with_oxygen_carbon_double_bond_removed,
                'starting reagent': reagent_with_oxygen_carbon_double_bond_removed,
                'finish substrate': target,
                'finish reagent': reagent,
                'function':()=>{


                     // console.log("*Caller: " + caller)



                    const reaction = new Reaction(substrate_with_oxygen_carbon_double_bond_removed, reagent_with_oxygen_carbon_double_bond_removed, {})
                    reaction.makeOxygenCarbonDoubleBond()




                    return reaction
            }})
            this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'oxygenCarbonDoubleBondReversal', depth+1)
        }

    }

    dehydrationReversal(target, reagent, moleculeAI, commands, caller, depth) {

        // console.log("dehydrationReversal() caller="+caller + " depth=" +depth )
//        // console.log(e)

        if (caller === "dehydrationReversal()") {
            // console.log('Duplicate call - dehydrationReversal()')
            return
        }

         // console.log('dehydrationReversal() depth=' + depth + ' caller ' + caller)

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})


        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        // https://en.wikipedia.org/wiki/Leuckart_reaction (2)

        let r = null

            r = reverse_reaction.dehydrateReverse()

            const hydrated_substrate = _.cloneDeep(reverse_reaction.container_substrate)
            const hydrated_reagent = _.cloneDeep(reverse_reaction.container_reagent)



            if (r) {


                // console.log('substrate (substrate before reverse reaction (dehydration reversal))')
                // console.log(VMolecule(target).compressed())
              //  // console.log('Reagent: (reagent before reverse reaction')
                // console.log(VMolecule(reagent).compressed())


                // console.log('hydrated substrate (substrate after reverse reaction (dehydration reversal))')
                // console.log(VMolecule(hydrated_substrate).compressed())
//                // console.log('Reagent: (reagent after reverse reaction')
  //              // console.log(VMolecule(hydrated_reagent).compressed())


                const hydrated_substrateAI = require("../Stateless/MoleculeAI")(_.cloneDeep(hydrated_substrate))

                // console.log("Validating molecule (hydrate()")
                if (hydrated_substrateAI.validateMolecule() === false) {
                    // console.log('ReactioinAI.js hydrated substrate is not valid')
                    // console.log('Method: hydrate()')
                    // console.log(VMolecule(hydrated_substrate).compressed())
                    // console.log(i)
                }



                commands.push({
                    'name':'dehydrate',
                    'starting substrate': hydrated_substrate,
                    'starting reagent': hydrated_reagent,
                    'finish substrate': target,
                    'finish reagent': reagent,
                    'function':()=>{
                          // console.log('Command -> dehydrate()')
                          // console.log('hydrated substrate (substrate before running command):')
                          // console.log(VMolecule(hydrated_substrate).compressed())
                          // console.log('hydrated reagent (reagent before running command):')
                          // console.log(VMolecule(hydrated_reagent).compressed())
                        const reaction = new Reaction(hydrated_substrate, hydrated_reagent, {})
                        reaction.dehydrate()
                          // console.log('dehydrated substrate (substrate after running command:')
                          // console.log(VMolecule(reaction.container_substrate).compressed())
                          // console.log('dehydrated reagent (reagent after running command):')
                          // console.log(VMolecule(reaction.container_reagent).compressed())

                        return reaction
                    }})

                const command_names = commands.map((command)=>{
                    return command['name']
                })
                this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent),_.cloneDeep(commands), 'dehydrationReversal', depth+1)
            } else {
                   // console.log("dehydrationReversal() reverse reaction failed")
            }



    }


    carbocationShiftReversal(target, reagent, moleculeAI, commands, caller, depth) {

        if (caller === "carbocationShiftReversal()") {
            return
        }

        if (commands.length > 0 && commands[commands.length-1].name === 'carbocationShift') {
            return false
        }

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        // Carbocation shift
        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        let r = null
        r = reverse_reaction.carbocationShift()
        if (r) {
            // console.log('Pinacol rearrangement reversed - carbocation shift (caller=' + caller + '):')
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const substrate_after_carbon_shift = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_after_carbon_shift = _.cloneDeep(reverse_reaction.container_reagent)
            commands.push({
                'name':'carbocationShift',
                'starting substrate': substrate_after_carbon_shift,
                'starting reagent': reagent_after_carbon_shift,
                'finish substrate': target,
                'finish reagent': reagent,
                'function':()=>{
                    const reaction = new Reaction(substrate_after_carbon_shift, reagent_after_carbon_shift, {})
                    reaction.carbocationShift()
                    return reaction
                }})
            this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'carbocationSiftReversal()', depth+1)
        }

    }

    transferProtonReversal(target, reagent, moleculeAI, commands, caller, depth) {






        if (caller === 'transferProtonReversal') {
            // console.log("Duplicate call - transferProtonReversal()")
            return
        }

        /*
        [ 'dehydrate',
  'addProtonFromReagentToHydroxylGroup',
  'makeCarbonNitrogenDoubleBond', 'protonate' ]
  'protonate'
         */


          // console.log('Caller: '+caller)
          // console.log('target (substrate before reverse reaction) transferProtonReversal()')
          // console.log(VMolecule(target).compressed())
          // console.log('reagent  before reverse reaction) transferProtonReversal()')
          // console.log(VMolecule(reagent).compressed())

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null
        r = reverse_reaction.transferProtonReverse()




        // console.log(r)
        if (r) {
             // console.log('Pinacol rearrangement reversed - deprotonate (caller=' + caller + '):')
            // https://en.wikipedia.org/wiki/Leuckart_reaction (4)
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const substrate_with_proton_transferred = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_with_proton_transferred = _.cloneDeep(reverse_reaction.container_reagent)

                // console.log('target (substrate before reverse reaction) transferProtonReversal()')
                // console.log(VMolecule(target).compressed())
               // console.log('reagent  before reverse reaction) transferProtonReversal()')
               // console.log(VMolecule(reagent).compressed())

                // console.log('target (substrate after reverse reaction) transferProtonReversal()')
                // console.log(VMolecule(substrate_with_proton_transferred).compressed())
                // console.log('reagent  after reverse reaction) transferProtonReversal()')
               // console.log(VMolecule(reagent_with_proton_transferred).compressed())
                // console.log(r)

            const substrate_with_proton_transferredAI = require("../Stateless/MoleculeAI")(_.cloneDeep(substrate_with_proton_transferred))

            // console.log("Validating molecule (transferProtonReversal()")
            if (substrate_with_proton_transferredAI.validateMolecule() === false) {
                // console.log('transferProtonReversal.js substrate_with_proton_transferred is not valid')
                // console.log('Method: transferProtonReverse()')
                // console.log(VMolecule(substrate_with_proton_transferred).compressed())
                // console.log(i)
            }


            commands.push(
                {
                    'name':'transferProton',
                    'starting substrate': substrate_with_proton_transferred,
                    'starting reagent': reagent_with_proton_transferred,
                    'finish substrate': target,
                    'finish reagent': reagent,
                    'function':()=>{

                          // console.log('Substrate before command (transferProton())')
                          // console.log(VMolecule(substrate_with_proton_transferred).compressed())

                          // console.log('Reagent before command (transferProton())')
                          // console.log(VMolecule(reagent_with_proton_transferred).compressed())


                        const reaction = new Reaction(substrate_with_proton_transferred, reagent_with_proton_transferred, {})
                        reaction.transferProton()
                        return reaction
                    }
                }
            )

            /*
            // [ 'dehydrate', 'addProtonFromReagentToHydroxylGroup', 'makeCarbonNitrogenDoubleBond', 'protonate', 'transferProton' ]
            const command_names = commands.map((command)=>{
                return command['name']
            })
            if (command_names.length === 5) {
                // console.log(VMolecule(reverse_reaction.container_substrate).compressed())
                // console.log(command_names)
                // console.log(r)
                // console.log(bcde)
            }
            */


            this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'transferProtonReversal', depth+1)
        } else {
               // console.log('transferProtonReversal() reaction failed')
        }

    }

    breakOxygenCarbonDoubleBondReversal(target, reagent, moleculeAI, commands, caller, depth) {


        if (caller === "breakOxygenCarbonDoubleBondReversal" || caller === "oxygenCarbonDoubleBondReversal") {
            // console.log('Duplicate call - breakOxygenCarbonDoubleBondReversal()')
            return
        }


         const substrate = _.cloneDeep(target)


        const reverse_reaction = new Reaction(_.cloneDeep(substrate), _.cloneDeep(reagent), {})

        let r = null

        r = reverse_reaction.breakCarbonOxygenDoubleBondReverse()



        if (r) {
            // // https://en.wikipedia.org/wiki/Leuckart_reaction (5)
            //this.render(reaction.container_substrate, reaction.container_reagent)


            const substrate_with_oxygen_carbon_double_bond = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_with_oxygen_carbon_double_bond = _.cloneDeep(reverse_reaction.container_reagent)

            // console.log('substrate (substrate before reverse reaction) breakOxygenCarbonDoubleBondReversal()')
            // console.log(VMolecule(substrate).compressed())
            // console.log('substrate (substrate after reverse reaction) breakOxygenCarbonDoubleBondReversal()')
            // console.log(VMolecule(substrate_with_oxygen_carbon_double_bond).compressed())

            const substrate_with_oxygen_carbon_double_bondAI = require("../Stateless/MoleculeAI")(_.cloneDeep(substrate_with_oxygen_carbon_double_bond))

            if (substrate_with_oxygen_carbon_double_bondAI.validateMolecule() === false) {
                // console.log('ReactoinAI.js substrate_with_oxygen_carbon_double_bond is not valid')
                // console.log('Method: breakCarbonOxygenDoubleBondReverse()')
                // console.log(VMolecule(substrate_with_oxygen_carbon_double_bond).compressed())
                // console.log(i)
            }

            commands.push({
                'name':'breakOxygenCarbonDoubleBond',
                'starting substrate': substrate_with_oxygen_carbon_double_bond,
                'starting reagent': reagent_with_oxygen_carbon_double_bond,
                'finish substrate': target,
                'finish reagent': reagent,
                'function':()=>{


                    const reaction = new Reaction(substrate_with_oxygen_carbon_double_bond, reagent_with_oxygen_carbon_double_bond, {})
                    reaction.breakCarbonOxygenDoubleBond()

                     // console.log('substrate after command makeOxygenCarbonDoubleBondReverse()) substrate_with_oxygen_carbon_double_bond')
                     // console.log(VMolecule(reaction.container_substrate).compressed())
                     // console.log('reagent after command makeOxygenCarbonDoubleBondReverse()')
                     // console.log(VMolecule(reaction.container_reagent).compressed())



                    return reaction
                }})

            /*
            // [ 'dehydrate', 'addProtonFromReagentToHydroxylGroup', 'makeCarbonNitrogenDoubleBond', 'protonate', 'transferProton', 'breakOxygenCarbonDoubleBond' ]
            const command_names = commands.map((command)=>{
                return command['name']
            })
            if (command_names.length === 6) {
                // console.log(VMolecule(reverse_reaction.container_substrate).compressed())
                // console.log(command_names)
                // console.log(r)
                // console.log(bcdefg)
            }
            */

            this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'breakOxygenCarbonDoubleBondReversal', depth+1)
        } else {
               // console.log('breakOxygenCarbonDoubleBondReversal() reverse reaction failed')
        }

    }

    bondSubstrateToReagentReversal(target, reagent, moleculeAI, commands, caller, depth) {



        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        let r = null
        //r = reverse_reaction.breakBond()
        r = reverse_reaction.bondSubstrateToReagentReverse()



        if (caller === "bondSubstrateToReagentReversal()") {
            // console.log('Duplicate call - bondSubstrateToReagentReversal()')
            return
        }



        if (r) {
            // https://en.wikipedia.org/wiki/Leuckart_reaction (6)
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const break_bond_substrate = _.cloneDeep(reverse_reaction.container_substrate)
            const break_bond_reagent = _.cloneDeep(reverse_reaction.leaving_groups[0])

            // console.log('bondSubstrateToReagentReversal() depth=' + depth)

            // console.log('target (substrate before reverse reaction bondSubstrateToReagentReversal')
            // console.log(VMolecule(target).compressed())
            // console.log('reagent (reagent before reverse reaction bondSubstrateToReagentReversal')
            // console.log(VMolecule(reagent).compressed())


            // console.log('subtrate (substrate after reverse reaction bondSubstrateToReagentReversal')
            // console.log(VMolecule(break_bond_substrate).compressed())
            // console.log('reagent (reagent after reverse reaction bondSubstrateToReagentReversal')
            // console.log(VMolecule(break_bond_reagent).compressed())


            commands.push({
                'name':'bondSubstrateToReagent',
                'starting substrate': break_bond_substrate,
                'starting reagent': break_bond_reagent,
                'finish substrate': target,
                'finish reagent': reagent,
                'function':()=>{
                    const reaction = new Reaction(break_bond_substrate, break_bond_reagent, {})
                    reaction.bondSubstrateToReagent()
                    return reaction
                }})

            // [ 'dehydrate', 'addProtonFromReagentToHydroxylGroup', 'makeCarbonNitrogenDoubleBond', 'protonate', 'transferProton', 'breakOxygenCarbonDoubleBond', 'bondSubstrateToReagent' ]
            /*
            const command_names = commands.map((command)=>{
                return command['name']
            })
            if (command_names.length === 7) {
                // console.log(VMolecule(reverse_reaction.container_substrate).compressed())
                // console.log(command_names)
                // console.log(r)
                // console.log(bcdefghik)
            }
            */

            this.synthesiseCallback(reverse_reaction.container_substrate, reverse_reaction.container_reagent, _.cloneDeep(commands), 'bondSubstrateToReagentReversal()', depth+1)
        } else{
              // console.log("Failed breakBond() reverse reaction")
        }

    }

    protonateReversal(target, reagent, moleculeAI, commands, caller, depth) {

        if (depth === 1 && caller==="dehydrationReversal") {
            // console.log("ReactionAI.js Calling protonateReversal() caller=" + caller + " depth=" + depth)
        }


        if (caller==="protonateReversal()") {
            return
        }

          // console.log('protonateReversal() depth=') + depth
          // console.log('Caller: '+caller)
          // console.log('substrate before reaction (protonateReversal())')
          // console.log(VMolecule(target).compressed())
          // console.log('reagent before reaction (protonateReversal()')
          // console.log(VMolecule(reagent).compressed())

        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        // https://en.wikipedia.org/wiki/Leuckart_reaction (3)

            let r = null
            r = reverse_reaction.protonateReverse()
//          // console.log('Pinacol rearrangement reversed - deprotonate (caller=' + caller + '):')
  //        // console.log('Leuckart reaction reversed - deprotonate (caller=' + caller + '):')


        if (depth === 4 && caller==="deprotonateReversal") {
            // console.log("ReactionAI.js Calling protonateReversal() caller=" + caller + " depth=" + depth)
            // console.log(r)
            // console.log(VMolecule(reverse_reaction.container_substrate).compressed())
        }




        if (r) {


                // https://en.wikipedia.org/wiki/Leuckart_reaction (1)
                //this.render(reaction.container_substrate, reaction.container_reagent)
                const deprotonated_substrate = _.cloneDeep(reverse_reaction.container_substrate)
                const protonated_reagent = _.cloneDeep(reverse_reaction.container_reagent)

                /*

                // console.log('protonateReversal()')

                // console.log('substrate before reverse reaction')
                // console.log(VMolecule(target).compressed())
                // console.log('reagent before reverse reaction ')
                // console.log(VMolecule(reagent).compressed())

                // console.log('substrate after reverse reaction (deprotonate) deprotonated_substrate')
                // console.log(VMolecule(deprotonated_substrate).compressed())
                // console.log('reagent after reverse reaction (deprotonate) protonated_reagent')
                // console.log(VMolecule(protonated_reagent).compressed())
                // console.log('protonateReversal() Exiting')

                // console.log(caller)
                // console.log(depth)
                */


                commands.push(
                    {
                        'name':'protonate',
                        'starting substrate': deprotonated_substrate,
                        'starting reagent': protonated_reagent,
                        'finish substrate': target,
                        'finish reagent': reagent,
                        'function':()=>{
                              // console.log('Command - substrate (protonate)')
                              // console.log('deprotonated substrate (substrate before command protonate())')
                              // console.log(VMolecule(deprotonated_substrate).compressed())
                              // console.log('protonated reagent (reagent before command protonate())')
                              // console.log(VMolecule(protonated_reagent).compressed())
                            const reaction = new Reaction(deprotonated_substrate, protonated_reagent, {})
                            reaction.protonate()
                              // console.log('protonated substrate (substrate after running protonate() command')
                              // console.log(VMolecule(reaction.container_substrate).compressed())
                              // console.log('deprotonated reagent (reagent after runnnig protonate() command')
                              // console.log(VMolecule(reaction.container_reagent).compressed())
                            return reaction
                        }
                    }
                )
                this.synthesiseCallback(reverse_reaction.container_substrate, reverse_reaction.container_reagent, _.cloneDeep(commands), 'protonateReversal', depth+1)
            } else {
                  // console.log('protonateReversal() reaction returned false')
            }
       // }
        

    }

    addProtonFromReagentToSubstrateReversal(target, reagent, moleculeAI, commands, caller, depth) {

        if (caller==="addProtonFromReagentToSubstrateReversal") {
            return
        }

          // console.log('addProtonFromReagentToSubstrateReversal()')
          // console.log('Caller: '+caller)
          // console.log('target (substrate before reaction)')
          // console.log(VMolecule(target).compressed())
          // console.log('reagent  before reaction)')


        const reverse_reaction = new Reaction(_.cloneDeep(target), _.cloneDeep(reagent), {})

        // https://en.wikipedia.org/wiki/Leuckart_reaction (3)

        let r = null
        r = reverse_reaction.addProtonFromSubstrateToReagent()
//          // console.log('Pinacol rearrangement reversed - deprotonate (caller=' + caller + '):')
        //        // console.log('Leuckart reaction reversed - deprotonate (caller=' + caller + '):')


        if (r) {

            // https://en.wikipedia.org/wiki/Leuckart_reaction (1)
            //this.render(reaction.container_substrate, reaction.container_reagent)
              // console.log('deprotonated substrate (substrate after reverse reaction')
            const deprotonated_substrate = _.cloneDeep(reverse_reaction.container_substrate)
              // console.log(VMolecule(deprotonated_substrate).compressed())
              // console.log('protonated reagent (reagent after reverse reaction')
            const protonated_reagent = _.cloneDeep(reverse_reaction.container_reagent)
              // console.log(VMolecule(protonated_reagent).compressed())

           // console.log(VMolecule(reagent).compressed())


            commands.push(
                {
                    'name':'addProtonFromReagentToSubstrate',
                    'starting substrate': deprotonated_substrate,
                    'starting reagent': protonated_reagent,
                    'finish substrate': target,
                    'finish reagent': reagent,
                    'function':()=>{
                        const reaction = new Reaction(_.cloneDeep(deprotonated_substrate), _.cloneDeep(protonated_reagent), {})
                          // console.log('Command - substrate (addProtonFromReagentToSubstrate substrate before running command)')
                          // console.log(VMolecule(deprotonated_substrate).compressed())
                          // console.log('Command - reagent (addProtonFromReagentToSubstrate reagent before running command)')
                          // console.log(VMolecule(protonated_reagent).compressed())

                        reaction.addProtonFromReagentToSubstrate()

                          // console.log('protonated substrate (substrate after running command (addProtonFromReagentToSubstrate):')
                          // console.log(VMolecule(reaction.container_substrate).compressed())
                          // console.log('protonated reagent (reagent after running command addProtonFromReagentToSubstrate)')
                          // console.log(VMolecule(reaction.container_reagent).compressed())

                        return reaction
                    }
                }
            )
            this.synthesiseCallback(reverse_reaction.container_substrate, reverse_reaction.container_reagent, _.cloneDeep(commands), 'addProtonFromReagentToSubstrateReversal()', depth+1)
        } else {
            // console.log("addProtonFromReagentToSubstrateReversal() reverse reaction failed")
        }
        // }


    }
}

module.exports = ReactionAI
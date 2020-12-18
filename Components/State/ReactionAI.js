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
            console.log(VMolecule(substrate).canonicalSMILES())
            if (reagent === null) {
                console.log('No reagent')
            } else {
                console.log('Reagent:')
                console.log(VMolecule(reagent).canonicalSMILES())
            }
       }
        this.result = (substrate, reagent, commands, caller) => {
            console.log('RESULT')
            console.log('Substrate:')
            console.log(VMolecule(substrate).canonicalSMILES())
            if (reagent === null) {
            //    console.log('No reagent')
            } else {
              //  console.log('Reagent:')
               // console.log(VMolecule(reagent).compressed())
            }
            console.log('commands:')
            console.log(commands)
          //  process.exit()
           // console.log('starting substrate:')
           // console.log(VMolecule(commands[commands.length-1]['starting substrate']).canonicalSMILES())
           // this.run(_.cloneDeep(commands).reverse(), 0, null, substrate, reagent)
            //console.log("Caller:" + caller)
        }
    }

    run(commands, command_index, reaction, starting_substrate, starting_reagent) {
        if (commands[command_index] === undefined) {
            console.log('Run (result)')
            console.log("Start")
            this.render(commands[command_index -1]['starting substrate'], starting_reagent)
            console.log("Finish")
            this.render(reaction.container_substrate, reaction.container_reagent)
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
        this.synthesiseCallback([_.cloneDeep(target),1], [_.cloneDeep(water),1], [], 'synthesise', 0)
    }
    
    synthesiseCallback(substrate, reagent, commands, caller, depth) {
         console.log('synthesiseCallback()')
        console.log("---------------------------")
        console.log(VMolecule(substrate).compressed())
        console.log(commands)
        console.log("---------------------------")
        console.log('depth=' + depth)
        if (depth === 1) {
            console.log('Starting substrate:')
            //console.log(commands[0]['starting substrate'])
            console.log(VMolecule(commands[0]['starting substrate']).compressed())
            commands[0]['function']()
            process.exit()
        }
//        this.render(substrate, reagent)
        // Proceed only if first step or there is a charge on the substrate.
        if (commands.length === 0 || this.hasCharge(_.cloneDeep(substrate)) !== -1) {
            const moleculeAI = require("../Stateless/MoleculeAI")(_.cloneDeep(substrate))
            this.carbocationShiftReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

            this.addProtonFromReagentToSubstrateReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

            this.oxygenCarbonDoubleBondReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

            this.dehydrationReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

            this.protonateReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)
            this.transferProtonReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

            this.breakOxygenCarbonDoubleBondReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

            this.bondSubstrateToReagentReversal(_.cloneDeep(substrate), _.cloneDeep(reagent), moleculeAI, _.cloneDeep(commands), caller, depth)

         } else {
            this.result(substrate, reagent, commands, 'synthesiseCallback()')
        }


    }

    oxygenCarbonDoubleBondReversal(target, reagent, moleculeAI, commands, caller, depth) {

        const reverse_reaction = new Reaction(target, reagent, {})

        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        let r = null
        r = reverse_reaction.makeOxygenCarbonDoubleBondReverse()
        if (r) {
           // console.log('Pinacol rearrangement reversed - make oxygen carbon double bond reversed (caller=' + caller + '):')
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const substrate_with_oxygen_carbon_double_bond_removed = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_with_oxygen_carbon_double_bond_removed = _.cloneDeep(reverse_reaction.container_reagent)
            commands.push({
                'name':'makeOxygenCarbonDoubleBond',
                'starting substrate': substrate_with_oxygen_carbon_double_bond_removed,
                'starting reagent': reagent_with_oxygen_carbon_double_bond_removed,
                'function':()=>{
                    const reaction = new Reaction(substrate_with_oxygen_carbon_double_bond_removed, reagent_with_oxygen_carbon_double_bond_removed, {})
                    reaction.makeOxygenCarbonDoubleBond()
                    return reaction
            }})
            this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'oxygenCarbonDoubleBondReversal()', depth+1)
        }

    }

    dehydrationReversal(target, reagent, moleculeAI, commands, caller, depth) {

        const reverse_reaction = new Reaction(target, reagent, {})


        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        // https://en.wikipedia.org/wiki/Leuckart_reaction (2)

        let r = null
        if (moleculeAI.findIndexOfCarbocationAttachedtoCarbon() !== -1) {
            r = reverse_reaction.hydrate()
            const hydrated_substrate = _.cloneDeep(reverse_reaction.container_substrate)
            const hydrated_reagent = _.cloneDeep(reverse_reaction.container_reagent)
            console.log('R -> dehydrate()')
            console.log(VMolecule(hydrated_substrate).compressed())
            if (r) {
                commands.push({
                    'name':'dehydrate',
                    'starting substrate': hydrated_substrate,
                    'starting reagent': hydrated_reagent,
                    'function':()=>{
                        console.log('Command -> dehydrate()')
                        console.log(VMolecule(hydrated_substrate).compressed())
                        const reaction = new Reaction(hydrated_substrate, hydrated_reagent, {})
                        reaction.dehydrate()
                        return reaction
                    }})
                this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent),_.cloneDeep(commands), 'dehydrationReversal()', depth+1)
            }
        }


    }


    carbocationShiftReversal(target, reagent, moleculeAI, commands, caller, depth) {

        if (commands.length > 0 && commands[commands.length-1].name === 'carbocationShift') {
            return false
        }

        const reverse_reaction = new Reaction(target, reagent, {})

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
                'function':()=>{
                    const reaction = new Reaction(substrate_after_carbon_shift, reagent_after_carbon_shift, {})
                    reaction.carbocationShift()
                    return reaction
                }})
            this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'carbocationSiftReversal()', depth+1)
        }

    }

    transferProtonReversal(target, reagent, moleculeAI, commands, caller, depth) {

        const reverse_reaction = new Reaction(target, reagent, {})

        let r = null
        r = reverse_reaction.transferProtonReverse()

        if (r) {
            // console.log('Pinacol rearrangement reversed - deprotonate (caller=' + caller + '):')
            // https://en.wikipedia.org/wiki/Leuckart_reaction (4)
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const substrate_with_proton_transferred = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_with_proton_transferred = _.cloneDeep(reverse_reaction.container_reagent)
            commands.push(
                {
                    'name':'transferProton',
                    'starting substrate': substrate_with_proton_transferred,
                    'starting reagent': reagent_with_proton_transferred,
                    'function':()=>{
                        const reaction = new Reaction(substrate_with_proton_transferred, reagent_with_proton_transferred, {})
                        reaction.transferProton()
                        return reaction
                    }
                }
            )
            this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'transferProtonReversal()', depth+1)
        }

    }

    breakOxygenCarbonDoubleBondReversal(target, reagent, moleculeAI, commands, caller, depth) {

        const reverse_reaction = new Reaction(target, reagent, {})

        let r = null
        r = reverse_reaction.makeOxygenCarbonDoubleBond()
        if (r) {
            // // https://en.wikipedia.org/wiki/Leuckart_reaction (5)
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const substrate_with_oxygen_carbon_double_bond = _.cloneDeep(reverse_reaction.container_substrate)
            const reagent_with_oxygen_carbon_double_bond = _.cloneDeep(reverse_reaction.container_reagent)
            commands.push({
                'name':'makeOxygenCarbonDoubleBondReverse',
                'starting substrate': substrate_with_oxygen_carbon_double_bond,
                'starting reagent': reagent_with_oxygen_carbon_double_bond,
                'function':()=>{
                    const reaction = new Reaction(substrate_with_oxygen_carbon_double_bond, reagent_with_oxygen_carbon_double_bond, {})
                    reaction.makeOxygenCarbonDoubleBondReverse()
                    return reaction
                }})
            this.synthesiseCallback(_.cloneDeep(reverse_reaction.container_substrate), _.cloneDeep(reverse_reaction.container_reagent), _.cloneDeep(commands), 'breakOxygenCarbonDoubleBondReversal()', depth+1)
        }

    }

    bondSubstrateToReagentReversal(target, reagent, moleculeAI, commands, caller, depth) {

        const reverse_reaction = new Reaction(target, reagent, {})

        let r = null
        r = reverse_reaction.breakBond()
        if (r) {
            // // https://en.wikipedia.org/wiki/Leuckart_reaction (6)
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const break_bond_substrate = _.cloneDeep(reverse_reaction.container_substrate)
            const break_bond_reagent = _.cloneDeep(reverse_reaction.container_reagent)
            commands.push({
                'name':'bondSubstrateToReagent',
                'starting substrate': break_bond_substrate,
                'starting reagent': break_bond_reagent,
                'function':()=>{
                    const reaction = new Reaction(break_bond_substrate, break_bond_reagent, {})
                    reaction.bondSubstrateToReagent()
                    return reaction
                }})
            this.synthesiseCallback(reverse_reaction.container_substrate, reverse_reaction.container_reagent, _.cloneDeep(commands), 'bondSubstrateToReagentReversal()', depth+1)
        }

    }

    protonateReversal(target, reagent, moleculeAI, commands, caller, depth) {


            const reverse_reaction = new Reaction(target, reagent, {})

        // https://en.wikipedia.org/wiki/Leuckart_reaction (3)

            let r = null
            r = reverse_reaction.deprotonate()
//        console.log('Pinacol rearrangement reversed - deprotonate (caller=' + caller + '):')
  //      console.log('Leuckart reaction reversed - deprotonate (caller=' + caller + '):')

            if (r) {

                // https://en.wikipedia.org/wiki/Leuckart_reaction (1)
                //this.render(reaction.container_substrate, reaction.container_reagent)
                const deprotonated_substrate = _.cloneDeep(reverse_reaction.container_substrate)
                const protonated_reagent = _.cloneDeep(reverse_reaction.container_reagent)
                commands.push(
                    {
                        'name':'protonate',
                        'starting substrate': deprotonated_substrate,
                        'starting reagent': protonated_reagent,
                        'function':()=>{
                            const reaction = new Reaction(deprotonated_substrate, protonated_reagent, {})
                            console.log('Command - substrate (protonate)')
                            console.log(VMolecule(reaction.container_substrate).compressed())
                            reaction.protonate()
                            console.log(VMolecule(reaction.container_substrate).compressed())
                           // process.exit()
                            return reaction
                        }
                    }
                )
                this.synthesiseCallback(reverse_reaction.container_substrate, reverse_reaction.container_reagent, _.cloneDeep(commands), 'protonateReversal()', depth+1)
            }
       // }
        

    }

    addProtonFromReagentToSubstrateReversal(target, reagent, moleculeAI, commands, caller, depth) {


        const reverse_reaction = new Reaction(target, reagent, {})

        // https://en.wikipedia.org/wiki/Leuckart_reaction (3)

        let r = null
        r = reverse_reaction.addProtonFromSubstrateToReagent()
//        console.log('Pinacol rearrangement reversed - deprotonate (caller=' + caller + '):')
        //      console.log('Leuckart reaction reversed - deprotonate (caller=' + caller + '):')

        if (r) {

            // https://en.wikipedia.org/wiki/Leuckart_reaction (1)
            //this.render(reaction.container_substrate, reaction.container_reagent)
            const deprotonated_substrate = _.cloneDeep(reverse_reaction.container_substrate)
            const protonated_reagent = _.cloneDeep(reverse_reaction.container_reagent)
            commands.push(
                {
                    'name':'protonate',
                    'starting substrate': deprotonated_substrate,
                    'starting reagent': protonated_reagent,
                    'function':()=>{
                        const reaction = new Reaction(deprotonated_substrate, protonated_reagent, {})
                        console.log('Command - substrate (addProtonFromReagentToSubstrate)')
                        console.log(VMolecule(reaction.container_substrate).compressed())
                        reaction.addProtonFromReagentToSubstrate()
                        console.log(VMolecule(reaction.container_substrate).compressed())
                        // process.exit()
                        return reaction
                    }
                }
            )
            this.synthesiseCallback(reverse_reaction.container_substrate, reverse_reaction.container_reagent, _.cloneDeep(commands), 'addProtonFromReagentToSubstrateReversal()', depth+1)
        }
        // }


    }
}

module.exports = ReactionAI
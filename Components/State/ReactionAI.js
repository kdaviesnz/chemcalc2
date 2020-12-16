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

class ReactionAI {

    constructor() {
        this.render = (substrate, reagent) => {
            console.log(VMolecule(substrate).compressed())
            console.log(VMolecule(reagent).compressed())
        }
    }

    synthesise(target) {
        const conjugate_base_hydroxide = MoleculeFactory("[OH1-]")
        this.synthesiseCallback([target,1], [conjugate_base_hydroxide,1])
        console.log('synthesise')
    }
    
    synthesiseCallback(substrate, reagent) {
//        this.render(substrate, reagent)
        const reaction = new Reaction(substrate, reagent, {})
        const moleculeAI = require("../Stateless/MoleculeAI")(substrate)
        this.carbocationShiftReversal(reaction, substrate, reagent, moleculeAI)
        this.oxygenCarbonDoubleBondReversal(reaction, substrate, reagent, moleculeAI)
        this.dehydrationReversal(reaction, substrate, reagent, moleculeAI)
        this.protonateReversal(reaction, substrate, reagent, moleculeAI)
        console.log('synthesiseCallback')
    }

    dehydrationReversal(reaction, target, reagent, moleculeAI) {

        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        let r = null
        if (moleculeAI.findIndexOfCarbocationAttachedtoCarbon() !== -1) {
            r = reaction.hydrate()
            if (r) {
                console.log('Pinacol rearrangement reversed - dehydrate reversed (hydrate)')
                // this.render(reaction.container_substrate, reaction.container_reagent)
                this.synthesiseCallback(reaction.container_substrate, reaction.container_reagent)
            }
        }

        console.log('dehydrationReversal()')

    }

    oxygenCarbonDoubleBondReversal(reaction, target, reagent, moleculeAI) {

        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        let r = null
        r = reaction.makeOxygenCarbonDoubleBondReverse()
        if (r) {
            console.log('Pinacol rearrangement reversed - make oxygen carbon double bond reversed:')
            this.render(reaction.container_substrate, reaction.container_reagent)
            this.synthesiseCallback(reaction.container_substrate, reaction.container_reagent)
        }

        console.log('oxygenCarbonDoubleBondReversal()')

    }

    carbocationShiftReversal(reaction, target, reagent, moleculeAI) {

        // Carbocation shift
        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        let r = null
        r = reaction.carbocationShift()
        if (r) {
            console.log('Pinacol rearrangement reversed - carbocation shift')
           // this.render(reaction.container_substrate, reaction.container_reagent)
            this.synthesiseCallback(reaction.container_substrate, reaction.container_reagent)
        }

        console.log('carbocationShiftReversal()')

    }

    protonateReversal(reaction, target, reagent, moleculeAI) {
        
        // if target cannot be deprotonated then we fall to the next line
        // in synthesiseCallback() after this.protonateReversal()
        if (moleculeAI.findNitrogenWithHydrogenIndex() !== -1) { // NH
            console.log('Ritter reaction reversed - deprotonating nitrogen')
            reaction.deprotonate()
          //  this.render(reaction.container_substrate, reaction.container_reagent)
            this.synthesiseCallback(reaction.container_substrate, reaction.container_reagent)
        }

        /*
        if (moleculeAI.findIndexOfCarbocationAttachedtoCarbon() !== -1) {
            console.log(moleculeAI.findIndexOfCarbocationAttachedtoCarbon() !== -1)
            reaction.makeCarbonCarbonDoubleBond()
            this.synthesiseCallback(reaction.container_substrate, reaction.container_reagent)
        }



        if (moleculeAI.findHydroxylOxygenIndex() !== -1) { // OH
            reaction.deprotonateHydroxylOxygen()
            this.synthesiseCallback(reaction.container_substrate, reaction.container_reagent)
        }
        */
        console.log('protonateReversal()')


    }
}

module.exports = ReactionAI
// AtomFactory

const uniqid = require('uniqid');
const symbols = require('chemical-symbols');
const chemicalFormula = require('chemical-formula')
const smiles_parser = require('smiles')
const molFormula = require('molecular-formula')
//const elements = require('@chemistry/elements/dist/elements')
const pubchem = require("pubchem-access").domain("compound");
//console.log(elements.Element.getElementById(1));
//console.log(elements.Element.getElementByName('C'));
const water = new molFormula('H2O')
//console.log(water.getComposition())
water.subtract({'H':1})
//console.log(water.getSimplifiedFormula())
water.add({"H":1})


const PeriodicTable = require('./PeriodicTable')
const Prototypes = require("../Prototypes")
Prototypes()
const Typecheck = require("../Typecheck")
const Constants = require("../Constants")

// ATOM MODEL
// atomic symbol, proton count, max valence count*, max number of bonds, velectron1, velectron2, velectron3
// electrons are unique strings, v=valence
// * Maximum number of electrons in valence shell.
const AtomFactory = (atomicSymbol, charge, index) => {

    Typecheck(
        {name: "atomicSymbol", value: atomicSymbol, type: "string"},
        {name: "index", value: index, type: "number"}
    )

    if (atomicSymbol === undefined || atomicSymbol === null) {
        throw new Error("Atomic symbol is undefined or null")
    }

    if (charge === undefined || charge === null) {
        throw new Error("Charge is undefined or null")
    }

    if (index===undefined || index === null) {
        index = 0
    }

    // If charge is -1 then we need to add an extra electron
    // If charge is +1 then we need to remove an  electron
    const max_electrons_per_shell = [
        2, 8, 18, 32, 50, 72, 98
    ]

// * Maximum number of electrons in valence shell (how many bonds it has when neutrally charged).

     let atom = null

    if (atomicSymbol === "R") {
        atom = [
            atomicSymbol,
            -1,
            -1,
            -1,
            ""
        ]
    } else {

        if (PeriodicTable[atomicSymbol] === undefined) {
            throw new Error("Could not find atom " + atomicSymbol + " in periodic table.")
        }

        const electrons_per_shell = PeriodicTable[atomicSymbol].electrons_per_shell.split("-")
        const atom_id = uniqid().substr(uniqid().length-3,3)
         atom = [
            atomicSymbol,
            PeriodicTable[atomicSymbol].atomic_number * 1,
            PeriodicTable[atomicSymbol].electrons_per_shell.split("-").pop() * 1,
            atomicSymbol === "H" ? 1
                : atomicSymbol === "Al" ? 3 :
                (atomicSymbol === "Hg" ? 3 : (atomicSymbol === "Ac" ? 2 : 8 - 1 * electrons_per_shell.pop())),
            charge,
             atom_id
        ]
    }



    return atom

}


module.exports = AtomFactory

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
//console.log(water.getSimplifiedFormula())
//console.log(symbols)
//console.log(chemicalFormula('HOCH2CH2OH'))

const range = require("range");
// range.range(1,10,2)

const PeriodicTable = require('./PeriodicTable')

// ATOM MODEL
// atomic symbol, proton count, max valence count*, max number of bonds, velectron1, velectron2, velectron3
// electrons are unique strings, v=valence
// * Maximum number of electrons in valence shell.
const AtomFactory = (atomicSymbol, charge) => {

/*
PeriodicTable:
    "O": {
        "group":16,
        "column":"VIA",
        "atomic_number":8,
        "name":"oxygen",
        "atomic_weight":15.999,
        "electrons_per_shell": "2-6",
        "state_of_matter":"gas",
        "subcategory":"reactive nonmetal"
    },
 */
    // atomic symbol, proton count, valence count,  number of bonds, velectron1, velectron2, velectron3

    /*
         return [
         atomicSymbol,
         PeriodicTable[atomicSymbol].atomic_number*1,
         PeriodicTable[atomicSymbol].electrons_per_shell.split("-").pop()*1,
         atomicSymbol === "H"? 1
             :atomicSymbol === "Al"?3:
             8 - 1*PeriodicTable[atomicSymbol].electrons_per_shell.split("-").pop(),
         ...range.range(0,PeriodicTable[atomicSymbol].electrons_per_shell.split("-").pop(),1).map((i)=>{
             return uniqid()
         })

         [ [ 'Br',
    35,
    17,
    -9,
 ...]

     "Br": {
        "group":17,
        "column":"VIIA",
        "atomic_number":35,
        "name":"bromine",
        "atomic_weight":79.904,
        "electrons_per_shell": "2-8-18-7",
        "state_of_matter":"liquid",
        "subcategory":"reactive nonmetal"
    },
8-1*7=1
     */

    /*    // [Cl-]
    /*
    [ { type: 'BracketAtom', value: 'begin' },
  { type: 'ElementSymbol', value: 'Cl' },
  { type: 'Charge', value: -1 },
  { type: 'BracketAtom', value: 'end' } ]
     */
    // If charge is -1 then we need to add an extra electron
    // If charge is +1 then we need to remove an  electron
    const max_electrons_per_shell = [
        2, 8, 18, 32, 50, 72, 98
    ]



    // atomic symbol, proton count, max valence count*, max number of bonds, charge, velectron1, velectron2, velectron3
// electrons are unique strings, v=valence
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

        const electrons_per_shell = PeriodicTable[atomicSymbol].electrons_per_shell.split("-")
         atom = [
            atomicSymbol,
            PeriodicTable[atomicSymbol].atomic_number * 1,
            PeriodicTable[atomicSymbol].electrons_per_shell.split("-").pop() * 1,
            atomicSymbol === "H" ? 1
                : atomicSymbol === "Al" ? 3 :
                (atomicSymbol === "Hg" ? 3 : (atomicSymbol === "Ac" ? 2 : 8 - 1 * electrons_per_shell.pop())),
            charge,
            ...range.range(0, (PeriodicTable[atomicSymbol].electrons_per_shell.split("-").pop() * 1) + charge * -1, 1).map((i) => {
                return uniqid()
            })
        ]
    }


    if (atomicSymbol === "Hg") {
        // Add electrons from 5th shell
        range.range(0, 18, 1).map(
            (i) => {
                atom.push(uniqid())
            }
        )
    }

    return atom

}


module.exports = AtomFactory

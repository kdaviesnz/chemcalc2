// AtomFactory

const uniqid = require('uniqid');
const symbols = require('chemical-symbols');
const chemicalFormula = require('chemical-formula')
const smiles_parser = require('smiles')
const molFormula = require('molecular-formula')
const elements = require('@chemistry/elements/dist/elements')
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


// ATOM MODEL
// atomic symbol, proton count, max valence count*, max number of bonds, velectron1, velectron2, velectron3
// electrons are unique strings, v=valence
// * Maximum number of electrons in valence shell.
const AtomFactory = (atomicSymbol) => {

    const atomicNumber = () => {
        const e = elements.Element.getElementByName(atomicSymbol)
        return e.number
    }

    // atomic symbol, proton count, max valence count*, max number of bonds, velectron1, velectron2, velectron3
     return [
         atomicSymbol,

     ]

}


module.exports = AtomFactory
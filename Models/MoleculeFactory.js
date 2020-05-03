const AtomsFactory = require('./AtomsFactory')
const pKa = require('../Models/pKa')
const MoleculeFactory = (canonicalSmiles) => {

    if (canonicalSmiles.toLowerCase() === "water") {
        return MoleculeFactory("O")
    }
    
    let SMILESparser = null

    //SMILESparser = Canonical_SMILESParser(canonicalSmiles)

    const _atoms = () => {
        return AtomsFactory(canonicalSmiles)
    }


    // // MOLECULE MODEL
    // // pKa, atom, atom, atom ...
    return [
        pKa(_atoms()),
        ..._atoms()
    ]

}

module.exports = MoleculeFactory

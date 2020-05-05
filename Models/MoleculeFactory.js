const AtomsFactory = require('./AtomsFactory')
const pKa = require('../Models/pKa')
const MoleculeFactory = (canonicalSmiles) => {

    if (canonicalSmiles.toLowerCase() === "water") {
        return MoleculeFactory("O")
    }
    
    let SMILESparser = null

    //SMILESparser = Canonical_SMILESParser(canonicalSmiles)

    const _atoms = () => {
        const a = AtomsFactory(canonicalSmiles)
        return a
    }

    const atoms = _atoms()

    // // MOLECULE MODEL
    // // pKa, atom, atom, atom ...
    return [
        pKa(atoms),
        ...atoms
    ]

}

module.exports = MoleculeFactory

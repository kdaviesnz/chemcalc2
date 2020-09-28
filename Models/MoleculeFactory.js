const AtomsFactory = require('./AtomsFactory')
const pKa = require('../Models/pKa')
const MoleculeFactory = (canonicalSmiles, verbose) => {

    if (canonicalSmiles.toLowerCase() === "water") {
        return MoleculeFactory("O", verbose)
    }
    
    const _atoms = () => {
        const a = AtomsFactory(canonicalSmiles, verbose)
        return a
    }

    const atoms = _atoms()

    // // MOLECULE MODEL
    // // pKa, atom, atom, atom ...
    return [
        pKa(atoms),
        [...atoms]
    ]

}

module.exports = MoleculeFactory

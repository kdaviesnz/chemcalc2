const AtomsFactory = require('./AtomsFactory')

const MoleculeFactory = (canonicalSmiles) => {

    if (canonicalSmiles.toLowerCase() === "water") {
        return MoleculeFactory("O")
    }
    
    let SMILESparser = null

    //SMILESparser = Canonical_SMILESParser(canonicalSmiles)

    const _atoms = () => {
        return AtomsFactory(canonicalSmiles)
    }

    const pKa = () => {
        // @todo
        const map = {
            "CC(=O)O":4.76,
            "Cl":-7,
            "O":14,
            "[O+]":
        }
        return 9999
    }
        
    // // MOLECULE MODEL
    // // pKa, atom, atom, atom ...
    return [
        pKa(),
        ..._atoms()
    ]

}

module.exports = MoleculeFactory

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

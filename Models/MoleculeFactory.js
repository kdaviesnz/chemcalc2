const AtomsFactory = require('AtomsFactory')

const MoleculeFactory = (canonicalSmiles) => {

    let SMILESparser = null
    const Canonical_SMILESParser = require("CanonicalSMILESParser")
    SMILESparser = Canonical_SMILESParser(canonicalSmiles)

    const atoms = () => {
        const AtomsFactory = require("AtomsFactory")
        return undefined === atoms || null === atoms?AtomsFactory(canonicalSmiles):atoms
    }

    const pKa = () => {
        
    }
        
    // // MOLECULE MODEL
    // // pKa, atom, atom, atom ...
    return [
        pKa(),
        ...atoms
    ]

}

module.exports = MoleculeFactory

const AtomsFactory = require('AtomsFactory')

const MoleculeFactory = (canonicalSmiles) => {

    let SMILESparser = null
    const Canonical_SMILESParser = require("CanonicalSMILESParser")
    SMILESparser = Canonical_SMILESParser(canonicalSmiles)

    const _atoms = () => {
        const AtomsFactory = require("AtomsFactory")
        return undefined === atoms || null === atoms?AtomsFactory(canonicalSmiles):atoms
    }

    // // MOLECULE MODEL
    // // pKa, atom, atom, atom ...
    return [

    ]

}

module.exports = MoleculeFactory
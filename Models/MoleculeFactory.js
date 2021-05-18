const AtomsFactory = require('./AtomsFactory')
const AtomFactory = require('./AtomFactory')
const pKa = require('../Models/pKa')
const MoleculeFactory = (canonicalSmiles, verbose) => {

    if (canonicalSmiles.toLowerCase() === "water") {
        return MoleculeFactory("O", verbose)
    }

    if (canonicalSmiles === "NR") {
        const nitrogen = AtomFactory("N", "")
        const r = AtomFactory("R", "")
        // Create bond
        r.push(nitrogen[nitrogen.length-2])
        r.push(nitrogen[nitrogen.length-1])
        return [
            -1,
            [nitrogen, r]
        ]
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

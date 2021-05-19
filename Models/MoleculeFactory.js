const AtomsFactory = require('./AtomsFactory')
const AtomFactory = require('./AtomFactory')
const pKa = require('../Models/pKa')
const MoleculeFactory = (canonicalSmiles, verbose) => {

    let r = null
    
    if (canonicalSmiles.toLowerCase() === "water") {
        return MoleculeFactory("O", verbose)
    }

    if (canonicalSmiles === "NR") {
        const nitrogen = AtomFactory("N", "")
        r = AtomFactory("R", "")
        // Create bond
        r.push(nitrogen[nitrogen.length-2])
        r.push(nitrogen[nitrogen.length-1])
        return [
            -1,
            [nitrogen, r]
        ]
    }

    if (canonicalSmiles === "O=CR") {
        const oxygen = AtomFactory("O", "")
        const carbon = AtomFactory("C", "")
        r = AtomFactory("R", "")

        // Create bonds
        const oxygen_electron_atom_1 = oxygen[oxygen.length-1]
        const oxygen_electron_atom_2 = oxygen[oxygen.length-2]
        const carbon_electron_atom_1 = carbon[carbon.length-1]
        const carbon_electron_atom_2 = carbon[carbon.length-2]

        r.push(carbon[carbon.length-3])
        r.push(carbon[carbon.length-4])

        oxygen.push(carbon_electron_atom_1)
        oxygen.push(carbon_electron_atom_2)

        carbon.push(oxygen_electron_atom_1)
        carbon.push(oxygen_electron_atom_2)

        return [
            -1,
            [oxygen, carbon, r]
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

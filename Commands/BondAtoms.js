const MoleculeController = require('../controllers/MoleculeController')

const BondAtoms = (molecule, molecule_cation_atom = null, molecule_anion_atom = null) => {
    const m_c = MoleculeController(molecule)
    if (null == molecule_cation_atom) {
        molecule_cation_atom = FindCationAtom(molecule)
    }

    if (null == molecule_anion_atom) {
        molecule_cation_atom = FindAnionAtom(molecule)
    }

    if (null === molecule_cation_atom || null === molecule_anion_atom) {
        return {
            products: molecule
        }
    }
    return m_c.bondAtoms(molecule, molecule_cation_atom, molecule_anion_atom)
}

module.exports = BondAtoms
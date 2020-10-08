const MoleculeController = require('../controllers/MoleculeController')
const FindDoubleBondPair = require('./FindDoubleBondPair')

const AddProton = (target_molecule, proton, target_molecule_atom_index = null) => {
    if (null == target_molecule_atom_index) {
        const molecule_protonation_target_atom = FindProtonationTargetAtom(target_molecule, FindDoubleBondPair(target_molecule))
        target_molecule_atom_index = molecule_protonation_target_atom.index
    }
    const target_molecule_proton_removed_controller = MoleculeController(target_molecule)
    return target_molecule_proton_removed_controller.addProton(proton,target_molecule.atoms[target_molecule_atom_index]).products
}

module.exports = AddProton
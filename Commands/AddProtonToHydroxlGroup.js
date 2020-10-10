const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')

const AddProtonToHydroxlGroup = (mmolecule, reagent) => {
    const target_molecule_proton_removed_controller = MoleculeController(mmolecule)
    //return target_molecule_proton_removed_controller.addProton(proton,target_molecule.atoms[target_molecule_atom_index]).products
}

module.exports = AddProtonToHydroxlGroup
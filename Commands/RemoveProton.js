const MoleculeController = require('../controllers/MoleculeController')

const RemoveProton = (target_molecule, proton) => {
    const target_molecule_controller = MoleculeController(target_molecule)
    return target_molecule_controller.removeProton(proton).products
}

module.exports = RemoveProton
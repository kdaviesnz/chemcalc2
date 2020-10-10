const MoleculeController = require('../controllers/MoleculeController')

const RemoveProton = (mmolecule, reagent) => {
    const target_molecule_controller = MoleculeController(mmolecule)
   // return target_molecule_controller.removeProton(proton).products
}

module.exports = RemoveProton
//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const Deprotonate = (container_molecule, container_reagent) => {

    const reaction = new Reaction(container_molecule, container_reagent)

    reaction.deprotonate()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = Deprotonate

//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const Protonate = (mmolecule, reagent) => {

    const reaction = new Reaction(mmolecule, reagent)

    reaction.protonate()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = Protonate
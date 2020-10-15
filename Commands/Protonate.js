//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const Protonate = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    reaction.protonate()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = Protonate
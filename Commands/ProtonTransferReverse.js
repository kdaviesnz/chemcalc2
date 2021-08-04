//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const ProtonTransferReverse = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    const result = reaction.protonTransferReverse()

    return result  === false? false : [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = ProtonTransferReverse
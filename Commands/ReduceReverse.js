//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const ReduceReverse = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    const result = reaction.reduceReverse()

    return result  === false? false : [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = ReduceReverse
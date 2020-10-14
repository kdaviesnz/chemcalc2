//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const Reduce = (mmolecule, reagent) => {

    const reaction = new Reaction(mmolecule, reagent)

    const result = reaction.dereduce()

    return result  === false? false : [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = Reduce
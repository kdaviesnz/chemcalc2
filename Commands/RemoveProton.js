//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const RemoveProton = (mmolecule, reagent) => {

    const reaction = new Reaction(mmolecule, reagent)

    reaction.removeProtonFromReagent()

    return [
        reaction.mmolecule,
        reaction.reagent
    ]
}

module.exports = RemoveProton
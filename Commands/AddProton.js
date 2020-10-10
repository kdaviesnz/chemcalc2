//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const AddProton= (mmolecule, reagent) => {

    const reaction = new Reaction(mmolecule, reagent)

    reaction.addProton()

    return [
        reaction.mmolecule,
        reaction.reagent
    ]
}

module.exports = AddProton
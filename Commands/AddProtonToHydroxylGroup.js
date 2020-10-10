//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const AddProtonToHydroxylGroup = (mmolecule, reagent) => {

    const reaction = new Reaction(mmolecule, reagent)

    reaction.addProtonFromReagentToHydroxylGroup()

    return [
        reaction.mmolecule,
        reaction.reagent
    ]
}

module.exports = AddProtonToHydroxylGroup
//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')

const colors = require('colors')

const AddProtonToHydroxylGroupReverse = (container_molecule, container_reagent, rule, DEBUG) => {

    if (DEBUG) {
        console.log(("Commands/AddProtonToHydroxylGroup.js -> Running command reaction.addProtonFromReagentToHydroxylGroup").blue)
        console.log(("End product container molecule:" + VMolecule([container_molecule[0], 1]).canonicalSMILES(false)).blue)
        console.log(("End product container reagent:" + VMolecule([container_reagent[0], 1]).canonicalSMILES(false)).blue)
    }

    const reaction = new Reaction(container_molecule, container_reagent, rule, DEBUG)

    reaction.addProtonFromReagentToHydroxylGroupReverse()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = AddProtonToHydroxylGroupReverse
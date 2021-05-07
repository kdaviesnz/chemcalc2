//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')

const AddProtonToHydroxylGroup = (container_molecule, container_reagent, rule, DEBUG) => {

    if (DEBUG) {
        console.log("Commands/AddProtonToHydroxylGroup.js -> Running command reaction.addProtonFromReagentToHydroxylGroup")
        console.log("Container molecule:" + VMolecule([container_molecule[0], 1]).canonicalSMILES(false))
        console.log("Container reagent:" + VMolecule([container_reagent[0], 1]).canonicalSMILES(false))
    }

    const reaction = new Reaction(container_molecule, container_reagent, rule, DEBUG)

    reaction.addProtonFromReagentToHydroxylGroup()

    if (DEBUG) {
        console.log("DEBUG Commands/AddProtonToHydroxylGroup.js -> Product substrate " + VMolecule([reaction.container_substrate[0], 1]).canonicalSMILES(false))
        //console.log(VMolecule([reaction.container_substrate[0], 1]).compressed())
        console.log("DEBUG Commands/AddProtonToHydroxylGroup.js -> Product reagent " + VMolecule([reaction.container_reagent[0], 1]).canonicalSMILES(false))
        process.exit()
    }

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = AddProtonToHydroxylGroup
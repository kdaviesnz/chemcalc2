//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')

const colors = require('colors')

const AlphaSubstitutionReactionReverse = (container_molecule, container_reagent, rule, DEBUG) => {

    if (DEBUG) {
        console.log(("Commands/AddProtonToHydroxylGroup.js -> Running command reaction.addProtonFromReagentToHydroxylGroup").blue)
        console.log(("End product container molecule:" + VMolecule([container_molecule[0], 1]).canonicalSMILES(false)).blue)
        console.log(("End product container reagent:" + VMolecule([container_reagent[0], 1]).canonicalSMILES(false)).blue)
    }

    const reaction = new Reaction(container_molecule, container_reagent, rule, DEBUG)

    reaction.alphaSubstitutionReactionReverse()

    if (DEBUG) {
        console.log(("DEBUG Commands/AddProtonToHydroxylGroup.js -> Starting substrate " + VMolecule([reaction.container_substrate[0], 1]).canonicalSMILES(false)).red)
//        console.log(VMolecule([reaction.container_substrate[0], 1]).compressed())
        console.log(("DEBUG Commands/AddProtonToHydroxylGroup.js -> Starting reagent " + VMolecule([reaction.container_reagent[0], 1]).canonicalSMILES(false)).green)
    }

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = AlphaSubstitutionReactionReverse
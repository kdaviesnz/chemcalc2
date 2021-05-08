//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')

const colors = require('colors')

const Deprotonate = (container_molecule, container_reagent, rule, DEBUG) => {

    if (DEBUG) {
        console.log(("Commands/Deprotonate.js -> Running command reaction.deprotonate").blue)
        console.log(("Container molecule:" + VMolecule([container_molecule[0], 1]).canonicalSMILES(false)).blue)
        console.log(("Container reagent:" + VMolecule([container_reagent[0], 1]).canonicalSMILES(false)).blue)
    }

    const reaction = new Reaction(container_molecule, container_reagent, rule, DEBUG)

    reaction.deprotonate()

    if (DEBUG) {
        console.log(("DEBUG Commands/Deprotonate.js -> Product substrate " + VMolecule([reaction.container_substrate[0], 1]).canonicalSMILES(false)).red)
        //console.log(VMolecule([reaction.container_substrate[0], 1]).compressed())
        console.log(("DEBUG Commands/Deprotonate.js -> Product reagent " + VMolecule([reaction.container_reagent[0], 1]).canonicalSMILES(false)).green)
    }

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = Deprotonate

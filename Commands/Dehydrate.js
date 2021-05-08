//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')

const colors = require('colors')

const Dehydrate = (container_molecule, container_reagent, rule, DEBUG) => {

    if (DEBUG) {
        console.log(("Commands/Dehydrate.js -> Running command reaction.dehydrate").blue)
        console.log(("DEBUG Commands/Dehydrate.js -> End product molecule:" + VMolecule([container_molecule[0], 1]).canonicalSMILES(false)).blue)
        console.log(("DEBUG Commands/Dehydrate.js -> End product reagent:" + VMolecule([container_reagent[0], 1]).canonicalSMILES(false)).blue)
    }

    const reaction = new Reaction(container_molecule, container_reagent, rule, DEBUG)

    reaction.dehydrate()

    if (DEBUG) {
        console.log(("DEBUG Commands/Dehydrate.js -> Starting substrate " + VMolecule([reaction.container_substrate[0], 1]).canonicalSMILES(false)).red)
        console.log(VMolecule([reaction.container_substrate[0], 1]).compressed())
        console.log(("DEBUG Commands/Dehydrate.js -> Starting reagent " + VMolecule([reaction.container_reagent[0], 1]).canonicalSMILES(false)).green)
    }

    // Check substrate doesn't have water
    const molecule_ai = require('../Components/Stateless/MoleculeAI')(reaction.container_substrate)
    molecule_ai.findWaterOxygenIndex().should.be.equal(-1)


    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = Dehydrate
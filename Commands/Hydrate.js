const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')

const Hydrate = (container_molecule, container_reagent, rule, DEBUG) => {

    if (DEBUG) {
        console.log("Commands/Hydrate.js -> Running command reaction.hydrate")
        console.log("Container molecule:")
        //console.log(VMolecule([container_molecule[0], 1]).compressed())
        console.log(VMolecule([container_molecule[0], 1]).canonicalSMILES(false))
        console.log("Container reagent:")
        //console.log(VMolecule([container_reagent[0], 1]).compressed())
        console.log(VMolecule([container_reagent[0], 1]).canonicalSMILES(false))
    }

    const reaction = new Reaction(container_molecule, container_reagent, rule, DEBUG)

    reaction.hydrate()

    // Check we have a water molecule attached to main molecule
    const molecule_ai = require('../Components/Stateless/MoleculeAI')(reaction.container_substrate)
    molecule_ai.findWaterOxygenIndex().should.be.greaterThan(-1)

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = Hydrate

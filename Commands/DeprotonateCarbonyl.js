//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')

const DeprotonateCarbonyl = (container_molecule, container_reagent, rule, DEBUG) => {

    if (DEBUG) {
        console.log("Commands/DeprotonateCarbonyl.js -> Running command reaction.deprotonateCarbonyl")
        console.log("Container molecule:")
        //console.log(VMolecule([container_molecule[0], 1]).compressed())
        console.log(VMolecule([container_molecule[0], 1]).canonicalSMILES(false))
        console.log("Container reagent:")
        //console.log(VMolecule([container_reagent[0], 1]).compressed())
        console.log(VMolecule([container_reagent[0], 1]).canonicalSMILES(false))
    }

    const reaction = new Reaction(container_molecule, container_reagent, rule, DEBUG)


    const result = reaction.deprotonateCarbonyl()

    return result === false? false: [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = DeprotonateCarbonyl
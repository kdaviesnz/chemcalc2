//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')

const LewisAcidBaseReactionReverse = (container_molecule, container_reagent, rule, DEBUG) => {

    if (DEBUG) {
        console.log("Commands/AddProtonToSubstrate.js -> Running command reaction.addProtonFromReagentToSubstrate")
        console.log("Container molecule:")
        //console.log(VMolecule([container_molecule[0], 1]).compressed())
        console.log(VMolecule([container_molecule[0], 1]).canonicalSMILES(false))
        console.log("Container reagent:")
        //console.log(VMolecule([container_reagent[0], 1]).compressed())
        console.log(VMolecule([container_reagent[0], 1]).canonicalSMILES(false))
    }

    const reaction = new Reaction(container_molecule, container_reagent, rule, DEBUG)


    reaction.lewisAcidBaseReactionReverse()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = LewisAcidBaseReactionReverse
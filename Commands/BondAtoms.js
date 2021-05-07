const Reaction = require("../Components/State/Reaction")

const BondAtoms = (mmolecule, reagent, rule, DEBUG) => {

    if (DEBUG) {
        console.log("Commands/Deprotonate.js -> Running command reaction.addProtonFromReagentToHydroxylGroup")
        console.log("Container molecule:")
        //console.log(VMolecule([container_molecule[0], 1]).compressed())
        console.log(VMolecule([container_molecule[0], 1]).canonicalSMILES(false))
        console.log("Container reagent:")
        //console.log(VMolecule([container_reagent[0], 1]).compressed())
        console.log(VMolecule([container_reagent[0], 1]).canonicalSMILES(false))
    }
    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    const result = reaction.bondAtoms()

    return result === false ? false: [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BondAtoms

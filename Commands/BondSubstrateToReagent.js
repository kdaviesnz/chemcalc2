const Reaction = require("../Components/State/Reaction")

const BondSubstrateToReagent = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    const result = reaction.bondSubstrateToReagent()

    return result === false ? false: [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BondSubstrateToReagent

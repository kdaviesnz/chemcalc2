const Reaction = require("../Components/State/Reaction")

const BondSubstrateToReagent = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    const result = reaction.bondSubstrateToReagent()

    return result === false ? false: [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BondSubstrateToReagent

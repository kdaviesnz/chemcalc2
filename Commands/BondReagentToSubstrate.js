const Reaction = require("../Components/State/Reaction")

const BondReagentToSubstrate = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    const result = reaction.bondReagentToSubstrate()

    return result === false ? false: [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BondReagentToSubstrate

const Reaction = require("../Components/State/Reaction")

const OxygenToOxygenProtonTransfer = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    const result = reaction.oxygenToOxygenProtonTransfer()

    return result === false ? false: [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = OxygenToOxygenProtonTransfer

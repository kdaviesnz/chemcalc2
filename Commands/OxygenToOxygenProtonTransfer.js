const Reaction = require("../Components/State/Reaction")

const OxygenToOxygenProtonTransfer = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    const result = reaction.oxygenToOxygenProtonTransfer()

    return result === false ? false: [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = OxygenToOxygenProtonTransfer

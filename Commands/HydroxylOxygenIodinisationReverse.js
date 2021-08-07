const Reaction = require("../Components/State/Reaction")

const HydroxylOxygenIodinisationReverse = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    reaction.hydroxylOxygenIodinisationReverse()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = HydroxylOxygenIodinisationReverse
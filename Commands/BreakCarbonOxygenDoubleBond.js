const Reaction = require("../Components/State/Reaction")

const BreakCarbonOxygenDoubleBond = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    reaction.breakCarbonOxygenDoubleBond()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BreakCarbonOxygenDoubleBond
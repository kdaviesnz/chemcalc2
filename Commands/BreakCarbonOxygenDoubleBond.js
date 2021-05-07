const Reaction = require("../Components/State/Reaction")

const BreakCarbonOxygenDoubleBond = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    reaction.breakCarbonOxygenDoubleBond()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BreakCarbonOxygenDoubleBond
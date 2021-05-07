const Reaction = require("../Components/State/Reaction")

const BreakCarbonOxygenDoubleBondReverse = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    reaction.breakCarbonOxygenDoubleBondReverse()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BreakCarbonOxygenDoubleBondReverse
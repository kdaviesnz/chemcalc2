const Reaction = require("../Components/State/Reaction")

const BreakCarbonOxygenDoubleBondReverse = (mmolecule, reagent, rule, DEBUG) => {

    throw new Error("BreakCarbonOxygenDoubleBondReverse is now handled by BreakBondReverse")
    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    reaction.breakCarbonOxygenDoubleBondReverse()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BreakCarbonOxygenDoubleBondReverse
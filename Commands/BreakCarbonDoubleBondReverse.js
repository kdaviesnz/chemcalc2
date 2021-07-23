const Reaction = require("../Components/State/Reaction")

const BreakCarbonDoubleBondReverse = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    reaction.BreakCarbonDoubleBondReverse()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BreakCarbonDoubleBondReverse
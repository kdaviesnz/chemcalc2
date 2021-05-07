const Reaction = require("../Components/State/Reaction")

const BreakCarbonDoubleBond = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    reaction.breakCarbonDoubleBond()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BreakCarbonDoubleBond
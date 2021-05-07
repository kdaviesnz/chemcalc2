const Reaction = require("../Components/State/Reaction")

const BreakCarbonNitrogenDoubleBond = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    reaction.breakCarbonNitrogenDoubleBond()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BreakCarbonNitrogenDoubleBond
const Reaction = require("../Components/State/Reaction")

const BreakCarbonNitrogenDoubleBond = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    reaction.breakCarbonNitrogenDoubleBond()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BreakCarbonNitrogenDoubleBond
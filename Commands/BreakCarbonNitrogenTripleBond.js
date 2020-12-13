const Reaction = require("../Components/State/Reaction")

const BreakCarbonNitrogenTripleBond = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    reaction.breakCarbonNitrogenTripleBond()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BreakCarbonNitrogenTripleBond
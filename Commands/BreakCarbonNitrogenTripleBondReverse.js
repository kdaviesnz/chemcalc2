const Reaction = require("../Components/State/Reaction")

const BreakCarbonNitrogenTripleBondReverse = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    reaction.breakCarbonNitrogenTripleBondReverse()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BreakCarbonNitrogenTripleBondReverse
const Reaction = require("../Components/State/Reaction")

const MakeOxygenCarbonDoubleBondReverse = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    const result = reaction.makeOxygenCarbonDoubleBondReverse()

    return result === false ? false: [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = MakeOxygenCarbonDoubleBondReverse

const Reaction = require("../Components/State/Reaction")

const MakeOxygenCarbonDoubleBond = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    const result = reaction.makeOxygenCarbonDoubleBond()

    return result === false ? false: [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = MakeOxygenCarbonDoubleBond

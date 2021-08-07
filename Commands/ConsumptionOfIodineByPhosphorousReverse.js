const Reaction = require("../Components/State/Reaction")

const ConsumptionOfIodineByPhospheoousReverse = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    reaction.consumptionOfIodineByPhosphorousReverse()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = ConsumptionOfIodineByPhosphorousReverse
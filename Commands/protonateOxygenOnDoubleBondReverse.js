const Reaction = require("../Components/State/Reaction")

const protonateOxygenOnDoubleBondReverse = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    reaction.protonateOxygenOnDoubleBondReverse()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = protonateOxygenOnDoubleBondReverse
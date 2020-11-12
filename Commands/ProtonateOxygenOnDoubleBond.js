const Reaction = require("../Components/State/Reaction")

const ProtonateOxygenOnDoubleBond = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    reaction.protonateOxygenOnDoubleBond()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = ProtonateOxygenOnDoubleBond
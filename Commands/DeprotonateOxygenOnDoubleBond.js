const Reaction = require("../Components/State/Reaction")

const DeprotonateOxygenOnDoubleBond = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    reaction.deprotonateOxygenOnDoubleBond()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = DeprotonateOxygenOnDoubleBond
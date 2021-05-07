const Reaction = require("../Components/State/Reaction")

const DeprotonateOxygenOnDoubleBond = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    reaction.deprotonateOxygenOnDoubleBond()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = DeprotonateOxygenOnDoubleBond
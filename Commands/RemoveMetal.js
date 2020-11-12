const Reaction = require("../Components/State/Reaction")

const RemoveMetal = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    const result = reaction.removeMetal()

    return result === false ? false: [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = RemoveMetal

const Reaction = require("../Components/State/Reaction")

const BondAtoms = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    const result = reaction.bondAtoms()

    return result === false ? false: [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BondAtoms

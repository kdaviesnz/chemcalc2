const Reaction = require("../Components/State/Reaction")

const BondMetal = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)


    const result = reaction.bondMetal()

    return result === false ? false: [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = BondMetal

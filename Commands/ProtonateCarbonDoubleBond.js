const Reaction = require("../Components/State/Reaction")

const ProtonateCarbonDoubleBond = (mmolecule, reagent, rule) => {

    const reaction = new Reaction(mmolecule, reagent, rule)

    reaction.protonateCarbonDoubleBond()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = ProtonateCarbonDoubleBond
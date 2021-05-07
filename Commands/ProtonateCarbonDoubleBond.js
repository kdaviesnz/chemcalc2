const Reaction = require("../Components/State/Reaction")

const ProtonateCarbonDoubleBond = (mmolecule, reagent, rule, DEBUG) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    reaction.protonateCarbonDoubleBond()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = ProtonateCarbonDoubleBond
const Reaction = require("../Components/State/Reaction")

const RemoveFormateGroup = (container_substrate, reagent, rule, DEBUG) => {

    container_substrate.length.should.be.equal(2) // molecule, units
    container_substrate[0].length.should.be.equal(2) // pKa, atoms
    container_substrate[0][1].should.be.an.Array()

    const reaction = new Reaction(container_substrate, reagent, rule, DEBUG)

    reaction.removeFormateGroup()

    return [
        reaction.container_substrate,
        reaction.reagent,
        reaction.leaving_groups
    ]
}

module.exports = RemoveFormateGroup

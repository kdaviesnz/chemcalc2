const Reaction = require("../Components/State/Reaction")

const BreakBond = (container_substrate, reagent, mmolecule_atom_index, reagent_atom_index) => {

    container_substrate.length.should.be.equal(2) // molecule, units
    container_substrate[0].length.should.be.equal(2) // pKa, atoms
    container_substrate[0][1].should.be.an.Array()

    const reaction = new Reaction(container_substrate, reagent)

    reaction.breakBond(mmolecule_atom_index, reagent_atom_index)

    return [
        reaction.container_substrate,
        reaction.reagent
    ]
}

module.exports = BreakBond

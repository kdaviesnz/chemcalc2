//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const Dehydrate = (container_molecule, container_reagent, rule) => {

    container_molecule.length.should.be.equal(2) // molecule, units
    container_molecule[0].length.should.be.equal(2) // pKa, atoms
    container_molecule[0][1].should.be.an.Array()

    if (container_reagent !== null && container_reagent !== undefined) {
        container_reagent.length.should.be.equal(2) // molecule, units
        container_reagent[0].length.should.be.equal(2) // pKa, atoms
        container_reagent[0][1].should.be.an.Array()
    }

    const reaction = new Reaction(container_molecule, container_reagent, rule)

    reaction.dehydrate()

    // Check substrate doesn't have water
    const molecule_ai = require('../Components/Stateless/MoleculeAI')(reaction.container_substrate)
    molecule_ai.findWaterOxygenIndex().should.be.equal(-1)


    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = Dehydrate
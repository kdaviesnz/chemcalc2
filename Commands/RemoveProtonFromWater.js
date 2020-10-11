//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const RemoveProtonFromWater = (container_molecule, container_reagent) => {

    container_molecule.length.should.be.equal(2) // molecule, units
    container_molecule[0].length.should.be.equal(2) // pKa, atoms
    container_molecule[0][1].should.be.an.Array()

    container_reagent.length.should.be.equal(2) // molecule, units
    container_reagent[0].length.should.be.equal(2) // pKa, atoms
    container_reagent[0][1].should.be.an.Array()

    const reaction = new Reaction(container_molecule, container_reagent)

    reaction.removeProtonFromWater()

    return [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = RemoveProtonFromWater
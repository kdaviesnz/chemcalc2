const MoleculeLookup = require('../Controllers/MoleculeLookup')
const should = require('should')
const _ = require('lodash');
const MoleculeController = require('../Controllers/Molecule')
const DehydrationReaction = require('./DehydrationReaction')
const MoleculeFactory = require('./MoleculeFactory')


const Dehydrate = (db, ccontainer, callback) => {

    const dehydration_reaction = DehydrationReaction(MoleculeController)

    let water_molecule = [[], 0]

    ccontainer.container.slice(1).map((mmolecule)=>{

        // Basic checks
        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms


        const reaction = dehydration_reaction.react(mmolecule)

        if (reaction !==false) {

            mmolecule = reaction

            if (water_molecule[0].length === 0) {
                water_molecule[0] = MoleculeFactory("O")
            }
            // Units
            water_molecule[1]++
        }

        return mmolecule

    })

    if (water_molecule[1] > 0) {
        ccontainer.container.push(water_molecule)
    }

    callback(ccontainer)

}

module.exports = Dehydrate
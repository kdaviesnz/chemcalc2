const MoleculeLookup = require('../Controllers/MoleculeLookup')
const should = require('should')
const _ = require('lodash');

const Hydrate = (db, ccontainer, callback) => {

    MoleculeLookup(db, "O", "SMILES", true).then(
        (water_molecule) => {
            _.cloneDeep(water_molecule.json[1][2]).slice(5).length.should.be.equal(8)
            ccontainer.add(_.cloneDeep(water_molecule).json, 1, false, 1)
            callback(ccontainer)
        },
        (search) => {
            console.log("There was an error looking up water in the db")
            process.exit()
        },
        (err) => {
            console.log(err)
            process.exit()
        }
    )

}

module.exports = Hydrate
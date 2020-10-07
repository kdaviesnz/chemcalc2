const MoleculeLookup = require('./Controllers/MoleculeLookup')

const Hydrate = (mmolecule, ccontainer, callback) => {

    mmolecule.length.should.be.equal(2) // molecule, units
    mmolecule[0].length.should.be.equal(2) // pKa, atoms

    MoleculeLookup(db, "O", "SMILES", true).then(
        (water_molecule) => {
            _.cloneDeep(water_molecule.json[1][2]).slice(5).length.should.be.equal(8)
            ccontainer.add(_.cloneDeep(water_molecule).json, 1, verbose, 1)
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
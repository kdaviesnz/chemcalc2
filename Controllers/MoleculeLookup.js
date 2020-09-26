// MoleculeLookup
//const PubChemLookup    = require('../lib/PubChemLookup')
const MoleculeFactory = require('../Models/MoleculeFactory')

const MoleculeLookup = (db, search, search_type, add_hydrogens, debug_statement, Err) =>
    new Promise(
        (resolve, notFound, reject) => {
            db.collection('molecules').findOne(
                {"CanonicalSMILES":search},
                function (Err, molecule) {

                    // An error occurred
                    if (Err) {
                        reject(err)
                    }

                    if (null === molecule) {
                        notFound(search)
                    } else {
                        // molecule found in db
                        // add json if required
                        if (undefined === molecule.json) {
                            const molecule_json = MoleculeFactory(search)
                            db.collection('molecules').updateOne(
                                {CID: molecule.CID},
                                {$set:{json:molecule_json}},
                                {upsert:true},
                                (err, count, status) => {
                                    if (err) {
                                        console.log("Error adding json")
                                        process.exit()
                                    }
                                    resolve(molecule)
                                }
                            )
                        } else {
                            resolve(molecule)
                        }
                    }

                }
            )
        }
    )

module.exports = MoleculeLookup


















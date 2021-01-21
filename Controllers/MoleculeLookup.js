// MoleculeLookup
//const PubChemLookup    = require('../lib/PubChemLookup')
const MoleculeFactory = require('../Models/MoleculeFactory')

const MoleculeLookup = (db, search, search_type, add_hydrogens, debug_statement, Err) =>
    new Promise(
        (resolve, notFound, reject) => {
            const search_no_quotes = search.replace(/['"]+/g, '').trim()
            db.collection('molecules').findOne(
                {$or:[{"CanonicalSMILES":search}, {"search":search_no_quotes}, {"IUPACName":search_no_quotes}]},
                function (Err, molecule) {

                    // An error occurred
                    if (Err) {
                        console.log(Err)
                        process.exit()
                        // reject(Err)
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


















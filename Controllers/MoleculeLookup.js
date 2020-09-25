// MoleculeLookup
//const PubChemLookup    = require('../lib/PubChemLookup')


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
                        resolve(molecule)
                    }

                }
            )
        }
    )

module.exports = MoleculeLookup


















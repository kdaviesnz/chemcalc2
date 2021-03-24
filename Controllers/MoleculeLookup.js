// MoleculeLookup
//const PubChemLookup    = require('../lib/PubChemLookup')
const MoleculeFactory = require('../Models/MoleculeFactory')
const PubChemLookup = require('../Controllers/PubChemLookup')
const pubchem = require("pubchem-access").domain("compound");
const pkl = PubChemLookup((err)=>{
    console.log(err)
    process.exit()
})




const MoleculeLookup =(db, search, search_type, add_hydrogens, debug_statement, Err) =>
    new Promise(
        (resolve, reject) => {
            const search_no_quotes = search.replace(/['"]+/g, '').trim()
                db.collection('molecules').findOne(
                    {$or: [{"CanonicalSMILES": search}, {"search": search_no_quotes}, {"IUPACName": search_no_quotes}]},
                    function (Err, molecule) {

                        // An error occurred
                        if (Err) {
                            console.log(Err)
                            process.exit()
                            // reject(Err)
                        }


                        if (null === molecule) {
                           // notFound(search)
                            pkl.searchBySMILES(search.replace(/\(\)/g, ""), db, (molecule_from_pubchem) => {
                                if (molecule_from_pubchem !== null) {
                                    molecule_from_pubchem['json'] = MoleculeFactory(search)
                                    molecule_from_pubchem['search'] = search
                                    db.collection("molecules").insertOne(molecule_from_pubchem, (err, result) => {
                                        //console.log("Inserted molecule")
                                        //console.log(molecule_from_pubchem)
                                        //process.exit()
                                        if (err) {
                                            console.log(err)
                                            process.exit()
                                        } else {
                                            //onMoleculeAddedToDBCallback(search)
                                           // console.log('PKL molecule added to db')
                                        }
                                        resolve(molecule_from_pubchem)
                                    })

                                } else {
                                    console.log("Molecule not foudn in pubchem")
                                    console.log(search)
                                    process.exit()
                                }
                            })
                        } else {
                            // molecule found in db
                            // add json if required
                            if (undefined === molecule.json) {
                                const molecule_json = MoleculeFactory(search)
                                db.collection('molecules').updateOne(
                                    {CID: molecule.CID},
                                    {$set: {json: molecule_json}},
                                    {upsert: true},
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
    ).catch(e=>{
        console.log("Error:")
        console.log(e)
    })



module.exports = MoleculeLookup


















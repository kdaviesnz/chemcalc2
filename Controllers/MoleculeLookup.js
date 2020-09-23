// MoleculeLookup
const FunctionalGroups = require('../lib/FunctionalGroups')
const PubChemLookup    = require('../lib/PubChemLookup')


const MoleculeLookup = (db, search, search_type, add_hydrogens, debug_statement, Err) =>
    new Promise(
        (resolve, reject) => {

          //  console.log(debug_statement)

            const _log = (msg) => {
                if (false) {
                    console.log(msg)
                }
            }
            // Do mongo lookup
            const collection = "molecules"

            switch (search_type) {

                case "name":

                    _log("MoleculeLookup.js::Looking up " + search)
                    db.collection('molecules').findOne(
                        {names: search},
                        function (err, molecule) {
                            if (null === molecule) {

                                _log(search + ' not found in DB')
                                const pkl = PubChemLookup(Err)
                                pkl.searchByName(search, db, (molecule_from_pubchem) => {

                                    if (null !== molecule_from_pubchem && molecule_from_pubchem.CID !== 0) {

                                        // Check if via CID pubchem molecule already in db and if it isn't then save to db
                                        // If it is then add a tag so that next time it's found in the db
                                        db.collection('molecules').findOne(
                                            {CID: molecule_from_pubchem.CID},
                                            function (err, molecule) {
                                                if (null === molecule) {
                                                    _log(search + ' (CID lookup) not found in db')
                                                    molecule_from_pubchem.names = [search]
                                                    db.collection("molecules").insertOne(molecule_from_pubchem, (err, result) => {
                                                        if (err) {
                                                            Err(err)
                                                        } else {
                                                            _log('Added ' + search + ' to mongodb')
                                                            const fgs = FunctionalGroups(molecule_from_pubchem).functionalGroupsList()
                                                            if (fgs.length ===0) {
                                                                _log('No functional groups found for ' + search)
                                                                console.log('WARNING: No functional groups found for ' + search)
                                                                resolve(molecule_from_pubchem)
                                                            } else {
                                                                molecule_from_pubchem.functional_groups = fgs
                                                                resolve(molecule_from_pubchem)
                                                            }
                                                        }

                                                    })

                                                } else {
                                                    _log(search + ' (CID lookup) found in db. Adding name')
                                                    _log(molecule)
                                                    if (molecule.names) {
                                                        molecule.names.push(search)
                                                    } else {
                                                        molecule.names = [search]
                                                    }
                                                    db.collection('molecules').updateOne(
                                                        {CID: molecule.CID},
                                                        {$set:{names:molecule.names}},
                                                        {upsert:true},
                                                        (err, count, status) => {
                                                            const fgs = FunctionalGroups(molecule).functionalGroupsList()
                                                            if (fgs.length === 0) {
                                                                _log("4. No functional groups found for " + molecule_from_pubchem.CanonicalSmiles)
                                                                resolve(molecule)
                                                            } else {
                                                                molecule.functional_groups = fgs
                                                                resolve(molecule)
                                                            }
                                                        }
                                                    )
                                                }
                                            }
                                        )

                                    }
                                }, debug_statement)
                            } else {

                                _log("Molecule found in db - " + search)
                                if (molecule.names === undefined) {
                                    molecule.names = []
                                }
                                if (molecule.names.indexOf(search) === -1) {
                                    molecule.names.push(search)
                                    db.collection('molecules').updateOne(
                                        {CID: molecule.CID},
                                        {$set:{names:molecule.names}},
                                        {upsert:true},
                                        (err, count, status) => {
                                            const fgs = FunctionalGroups(molecule).functionalGroupsList()
                                            if (fgs.length === 0) {
                                                //_log("2. No functional groups found for " + molecule.CanonicalSmiles)
                                            } else {
                                                molecule.functional_groups = fgs
                                                resolve(molecule)
                                            }
                                        }
                                    )

                                } else {
                                    molecule.functional_groups = FunctionalGroups(molecule).functionalGroupsList();
                                    resolve(molecule)
                                }
                            }
                        }
                    )

                    break

                case "SMILES":

                    // C(=C.*)(C)(CC1=CC2=C(C=C1)OCO2)
                    if (search.toString().indexOf(".*")!==-1) {

                      //  const s_obj = new RegExp(search);
                        const s_obj = search.replace(/\.\*/, "")
                        _log('MoleculeLookup.js Getting substructures for ' + s_obj)

                        db.collection(collection).find(
                            {children: s_obj}
                        ).toArray(
                            (err, molecules) => {
                                if (err) {
                                    reject(err)
                                    //  process.exit()
                                }

                                if (molecules === null || molecules.length === 0) {

                                    const pkl = PubChemLookup(Err)

                                    const s = search.toString().replace(".*", "").replace(/\//g, "").replace(/\(\)/g,"")
                                    _log("Looking up " + s + " in pubchem")
                                    //process.exit()

                                    _log("MoleculeLookup Fetching substructures by SMILES")
                                    pkl.FetchSubstructuresBySMILES(s, db, (molecule, db) => {
                                        // Check if molecule already in db and if it isn't then save to db
                                        _log('Got substructure from pubchem - ' + molecule.CanonicalSMILES)
                                        db.collection('molecules').findOne(
                                            {CID: molecule.CID},
                                            function (err, molecule_in_mongo) {
                                                if (null === molecule_in_mongo) {
                                                    molecule.tags = [search]
                                                    molecule.children = [s_obj]
                                                    db.collection("molecules").insertOne(molecule, (err, result) => {
                                                        if (err) {
                                                            Err(err)
                                                        } else {
                                                            _log('Added ' + molecule.IUPACName + ' to mongodb')
                                                            const fgs = FunctionalGroups(molecule).functionalGroupsList()
                                                            if (fgs.length ===0) {
                                                                _log('[.*] No functional groups found for ' + molecule.CanonicalSMILES)
                                                            } else {
                                                                molecule.functional_groups = fgs
                                                                resolve(molecule)
                                                            }
                                                        }
                                                    })
                                                } else {
                                                    _log(molecule.CID + ' found in db. Adding tag')
                                                    if (molecule.tags) {
                                                        molecule.tags.push(search)
                                                    } else {
                                                        molecule.tags = [search]
                                                    }
                                                    _log(molecule.CID + ' found in db. Adding children')
                                                    if (molecule.children === undefined) {
                                                        molecule.children = [search]
                                                    } else {
                                                        molecule.children.push(search)
                                                    }
                                                    db.collection('molecules').updateOne(
                                                        {CID: molecule.CID},
                                                        {$set:{tags:molecule.tags, children:molecule.children}},
                                                        {upsert:true},
                                                        (err, count, status) => {
                                                            const fgs = FunctionalGroups(molecule).functionalGroupsList()
                                                            if (fgs.length === 0) {
                                                                // _log("3. No functional groups found for " + molecule.CanonicalSmiles)
                                                            } else {
                                                                molecule.functional_groups = fgs
                                                                resolve(molecule)
                                                            }
                                                        }
                                                    )
                                                }
                                            }
                                        )
                                    }, debug_statement)
                                } else {
                                    // molecules found in db
                                    /*
                                    try {
                                        throw new Error();
                                    } catch (e) {
                                        console.log(e.stack);
                                    }
                                    */
                                    resolve(molecules)
                                }
                            }
                        )

                    } else {
                        _log("MoleculeLookup.js::Looking up " + search)
                        db.collection('molecules').findOne(
                            {$or:[{CanonicalSMILES: search}, {tags:search}]},
                            function (err, molecule) {
                                if (null === molecule) {
                                    _log(search + ' not found in DB (1)')
                                    const pkl = PubChemLookup(Err)
                                    pkl.searchBySMILES(search.replace(/\(\)/g, ""), db, (molecule_from_pubchem) => {
                                        _log('MoleculeLookup Delaying two seconds')
                                       setTimeout(function() {
                                        }, 3000)
                                        if (null !== molecule_from_pubchem && molecule_from_pubchem.CID !==0 ) {
                                            // Check if via CD pubchem molecule already in db and if it isn't then save to db
                                            // If it is then add a tag so that next time it's found in the db
                                            _log(search + ' found in pubchem')
                                            db.collection('molecules').findOne(
                                                {CID: molecule_from_pubchem.CID},
                                                function (err, molecule) {
                                                    if (null === molecule) {
                                                        _log(search + ' not found in db (CID lookup)')
                                                        molecule_from_pubchem.tags = [search]
                                                        db.collection("molecules").insertOne(molecule_from_pubchem, (err, result) => {
                                                            if (err) {
                                                                Err(err)
                                                            } else {
                                                                _log('Added ' + search + ' to mongodb (CID lookup)')
                                                                const fgs = FunctionalGroups(molecule_from_pubchem).functionalGroupsList()
                                                                if (fgs.length ===0) {
                                                                    // _log('No functional groups found for ' + molecule_from_pubchem.CanonicalSMILES)
                                                                } else {
                                                                    molecule_from_pubchem.functional_groups = fgs
                                                                    resolve(molecule_from_pubchem)
                                                                }
                                                            }
                                                        })

                                                    } else {
                                                        _log(search + ' found in db (CID lookup). Adding tag')
                                                        if (molecule_from_pubchem.tags) {
                                                            molecule_from_pubchem.tags.push(search)
                                                        } else {
                                                            molecule_from_pubchem.tags = [search]
                                                        }
                                                        db.collection('molecules').updateOne(
                                                            {CID: molecule_from_pubchem.CID},
                                                            {$set:{tags:molecule_from_pubchem.tags}},
                                                            {upsert:true},
                                                            (err, count, status) => {
                                                                _log('Updated tags for ' + search)
                                                                const fgs = FunctionalGroups(molecule_from_pubchem).functionalGroupsList()
                                                                if (fgs.length === 0) {
                                                                    _log("1. No functional groups found for " + molecule_from_pubchem.CanonicalSmiles)
                                                                } else {
                                                                    molecule_from_pubchem.functional_groups = fgs
                                                                    resolve(molecule_from_pubchem)
                                                                }

                                                            }
                                                        )



                                                    }
                                                }
                                            )
                                        } else {
                                            _log(search + ' not found in pubchem. Adding dummy record')
                                            //Add dummy record so we don't search pubchem for it again
                                            const dummy_molecule = {
                                                CID: 0,
                                                tags:[search]
                                            }
                                            db.collection("molecules").insertOne(dummy_molecule, (err, result) => {
                                                if (err) {
                                                    Err(err)
                                                } else {
                                                    _log("Added dummy record for " + search)
                                                }
                                            })
                                        }
                                    }, debug_statement)


                                } else {
                                    if (molecule.CID === 0) {
                                        _log('Dummy record found in DB for ' + search)
                                        //process.exit()
                                    } else {
                                        //_log("Molecule found in db - " + search)
                                        if (undefined === molecule.tags) {
                                            molecule.tags = []
                                        }
                                        if (molecule.tags.indexOf(search) === -1) {
                                            molecule.tags.push(search)
                                        }
                                        const fgs = FunctionalGroups(molecule).functionalGroupsList()
                                        if (fgs.length === 0) {
                                            _log("No functional groups found for existing " + molecule.CanonicalSMILES)
                                            console.log('No functional groups for ' + search)
                                            resolve(molecule)
                                        } else {
                                            molecule.functional_groups = fgs;
                                            resolve(molecule)
                                        }
                                    }
                                }
                            }
                        )
                    }
                    break
                case "IUPAC":
                    resolve("")
                    break
                default:
                    resolve("")

            }
        }
    )

module.exports = MoleculeLookup


















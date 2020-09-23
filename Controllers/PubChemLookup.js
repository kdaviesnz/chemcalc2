const request = require('request');

const PubChemLookup = (Err) => {

    const _log = (msg) => {
        if (false) {
            console.log(msg)
        }
    }
    const properties = ["IUPACName", "MolecularFormula", "MolecularWeight",
        "CanonicalSMILES", "IsomericSMILES", "InChI", "InChIKey",
        "XLogP", "ExactMass", "MonoisotopicMass", "TPSA",
        "Complexity", "Charge", "HBondDonorCount", "HBondAcceptorCount",
        "RotatableBondCount", "HeavyAtomCount", "IsotopeAtomCount", "AtomStereoCount",
        "DefinedAtomStereoCount", "UndefinedAtomStereoCount", "BondStereoCount", "DefinedBondStereoCount",
        "UndefinedBondStereoCount", "CovalentUnitCount", "Volume3D", "XStericQuadrupole3D",
        "YStericQuadrupole3D", "ZStericQuadrupole3D", "FeatureCount3D", "FeatureAcceptorCount3D",
        "FeatureDonorCount3D", "FeatureAnionCount3D", "FeatureCationCount3D", "FeatureRingCount3D",
        "FeatureHydrophobeCount3D", "ConformerModelRMSD3D", "EffectiveRotorCount3D", "ConformerCount3D",
        "Fingerprint2D"]

    const searchByName = (name, db, callback, debug_statement) => {
// https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/heroin/property/MolecularFormula/JSON

        setTimeout(function() {
        }, Math.floor(Math.random() * 3000))

        request('https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/' + name + '/property/' + properties.join(',') + '/JSON', {json: true}, (err, res, body) => {
            if (err) {
                Err(err)
                console.log('PubchemLookup searchByName()'+ debug_statement)
                process.exit()
            } else {
                if (undefined !== body.Fault || undefined !== body.Code) {
                    console.log("There was an error searchByName()  " + name + debug_statement)
                    console.log(body)
                    if (Err) {
                        Err(body)
                    }
                    console.log('PubchemLookup searchByName()')
                    process.exit()
                } else {
                    callback(body.PropertyTable.Properties[0])
                }
            }
        })
    }

    const searchBySMILES = (SMILES, db, callback, debug_statement) => {

        //console.log('pubchem searchBySMILES - implementing random delay - ' + SMILES)
        setTimeout(function() {
        }, Math.floor(Math.random() * 3000))

// https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CCCC/cids/JSON

//https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CCCC/SDF

// https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CCCC/property/MolecularFormula/JSON

// https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/xyz/property/MolecularFormula/JSON


// https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/CCCC/property/MolecularFormula/SDF

        const request_string = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/' + encodeURIComponent(SMILES.replace(/\(\)/g, "")) + '/property/' + properties.join(',') + '/JSON'
        request(request_string, {json: true}, (err, res, body) => {
                if (err) {
                    Err(err);
                    console.log('PubchemLookup searchBySMILES()')
                    process.exit()
                } else {

                    /*
                   {
                     "Fault": {
                       "Code": "PUGREST.BadRequest",
                       "Message": "Unable to standardize the given structure - perhaps some special characters need to be escaped or data packed in a MIME form?",
                       "Details": [
                         "error: ",
                         "status: 400",
                         "output: Caught ncbi::CException: Standardization failed",
                         "Output Log:",
                         "Record 1: Warning: Cactvs Ensemble cannot be created from input string",
                         "Record 1: Error: Unable to convert input into a compound object",
                         "",
                         ""
                       ]
                     }
                   }
                   */

                    if (undefined !== body.Fault || undefined !== body.Code) {
                        Err = false
                        if (Err) {
                            console.log("PubchemLookup There was an error searchBySMILES() * " + SMILES + ' ' + debug_statement + ' ' + body.Fault.message)
                            Err(body)
                        }
                    } else {
                        if (undefined === body.PropertyTable ) {
                            console.log("PropertTable property missing")
                            if (undefined !== body.PC_Compounds) {
                               console.log(body)
                            }
                            process.exit()
                        }
                        callback(body.PropertyTable.Properties[0])
                    }
                }
            }
        )

    }

    const FetchByCID = (CID, db, callback) => {

        setTimeout(function() {
        }, Math.floor(Math.random() * 3000))

        request('https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/' + CID + '/property' + properties.join(',') + '/JSON', {json: true}, (err, res, body) => {
            if (err) {
                Err(err)
                console.log('PubchemLookup FetchByCID()')
                process.exit()
            } else {
                if (undefined !== body.Fault || undefined !== body.Code) {
                    console.log('Error FetchByCID() ' + CID)
                    Err(body)
                    console.log('PubchemLookup FetchByCID()')
                    process.exit()
                } else {
// https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/15/property/MolecularFormula,MolecularWeight,CanonicalSMILES/JSON
                    /*
                    {
                      "PropertyTable": {
                        "Properties": [
                          {
                            "CID": 15,
                            "MolecularFormula": "C19H30O2",
                            "MolecularWeight": 290.4,
                            "CanonicalSMILES": "CC12CCC(=O)CC1CCC3C2CCC4(C3CCC4O)C"
                          }
                        ]
                      }
                    }
                    */
                    callback(body.PropertyTable.Properties[0], db)
                }
            }
        })
    }



    const FetchSubstructuresByListKey = (list_key, db, callback, debug_statement) => {

        _log("Using list key " + list_key)
        _log('Callling https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/listkey/' + list_key + '/property/' + properties.join(',') + '/JSON')

        // https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/listkey/3433188641421175200/JSON
        process.exit()

        request('https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/listkey/' + list_key + '/property/' + properties.join(',') + '/JSON', { json: true }, (err, res, body) => {
            if (err) {
                Err(err)
                console.log('PubchemLookup FetchSubstructuresByListLey()')
                process.exit()
            } else {
                if (undefined !== body.Fault || undefined !== body.Code) {
                    console.log('listkey error - ' + list_key + debug_statement)
                    console.log(body)
                    Err(body)
                    // process.exit()
                } else {

                    /*{
                      "IdentifierList": {
                        "CID": [
                          1615,
                          71285,*/
                    if (undefined !== body.Waiting ){
                        FetchSubstructuresByListKey(list_key, db, callback)
                    } else {

                        body.PropertyTable.Properties.map(
                            (molecule) => {
                                // console.log('PubchemLookup - substructures - delaying one second')

                                setTimeout(function() {
                                }, Math.floor(Math.random() * 3000))

                                callback(molecule, db)
                            }
                        )
                    }
                }
            }

        })

    }

    const FetchSubstructuresBySMILES = (SMILES, db, callback, debug_statement) => {

        _log("PubChemLookup FetchSub " + SMILES)



        // get substructures
        //searchBySMILES(SMILES, db, (molecule)=> {

        // https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/substructure/smiles/C1CCCCCC1/JSON
        // https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastsubstructure/cid/2244/cids/XML?StripHydrogen=true
        // https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastsimilarity_2d/cid/2244/property/MolecularWeight,MolecularFormula,RotatableBondCount/XML?Threshold=99

        _log('Calling https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastsubstructure/SMILES/' + encodeURIComponent(SMILES) + '/cids/JSON?StripHydrogen=true')

        request('https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastsubstructure/SMILES/' + encodeURIComponent(SMILES) + '/property/CanonicalSmiles,IUPACName/JSON?StripHydrogen=true', { json: true }, (err, res, body) => {
            if (err) {
                Err(err)
                console.log('PubchemLookup FetchSubstructuresBySMILES()')
                process.exit()
            } else {
                if (undefined !== body.Fault) {
                    console.log('Error FetchSubstructuresBySMILES() ' + SMILES +debug_statement)
                    console.log(body)
                    console.log('PubchemLookup FetchSubstructuresBySMILES()')
                    process.exit()
                } else {

                    if (undefined !== body.PropertyTable ) {
                        body.PropertyTable.Properties.map(
                            (molecule) => {
                                callback(molecule, db, SMILES)
                            }
                        )
                    }

                }
            }
        })


        //  })


    }

    return {

        FetchSubstructuresBySMILES: FetchSubstructuresBySMILES,
        searchBySMILES: searchBySMILES,
        searchByName: searchByName
    }

}

module.exports = PubChemLookup

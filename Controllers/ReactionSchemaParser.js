const S = require('string')
const shuffle = require('shuffle-array')
const MoleculeLookup = require('./MoleculeLookup')


const ReactionControllerFactory = require('../Models/ReactionControllerFactory')

/*
ReactionSchemaParser
Example schemas:
"CCCBR -> HaCN|O ="
"CCCBR -> HaCN" ="
"CCCBR ? CCCCN"
"CCCBR remove BR"
"CCCBR add CN"
"CCCBR + CN"
"CCCBR add three member ring"
"CCCBR substitute BR for CN"
"C=C break double bond"

Below the arrow is the solvent.

When trying to work out the product we don’t worry about the solvent.

@see (8) BREAKING DOWN THE REACTION SCHEME


HydrohalogenationReaction
alkene + HALOGEN(HX) -> alkane-X

 */
const extractMoleculeFromSchema = (schema) => {
    // @todo this is not necessarily the SMILES
    let molecule_smiles
    if ("/" === S(schema.trim()).charAt(schema.length-1)){
        molecule_smiles = schema.trim().replace(/\/$/,'').trim();
    } else if (S(schema).contains("break double bond")) {
        molecule_smiles = schema.replace("break double bond", "").trim()
    } else if (S(schema).contains("->")) {
        molecule_smiles = schema.split("->").reverse().pop().trim()
    } else if (S(schema).contains("remove")) {
        molecule_smiles = schema.split("remove").reverse().pop().trim()
    } else if (S(schema).contains("substitute")) {
        molecule_smiles = schema.split("substitute").reverse().pop().trim()
    }  else if (S(schema).contains("add three member ring")) {
        molecule_smiles = schema.split("add three member ring").reverse().pop().trim()
    } else if (S(schema).contains("add")) {
        molecule_smiles = schema.split("add").reverse().pop().trim()
    } else if (S(schema).contains("+")) {
        molecule_smiles = schema.split("+").reverse().pop().trim()
    }else if (S(schema).contains("?")) {
        molecule_smiles = schema.split("?").reverse().pop().trim()
    }
    return molecule_smiles
}


const extractProductFromSchema = (schema, molecule_smiles) => {
    let product
    if (S(schema).contains("?")) {
        product = schema.split("?").pop().trim()
    } else if (S(schema).contains("remove")) {
        product = molecule_smiles.replace(schema.split("remove").pop().trim(), '')
    }else if(S(schema).contains("substitute")) {
        // "CCCBR substitute BR for CN"
        const right = schema.split("substitute").pop()
        const atom_to_substitute = right.split("for").reverse().pop().trim()
        const atom_to_substitute_with = right.split("for").pop().trim()
        product = molecule_smiles.replace(atom_to_substitute, atom_to_substitute_with)
    }
    return product
}

const determineReagent = (schema, molecule_JSON_object) => {
    let reagent
    if (S(schema).contains("break double bond")) {
        if (molecule_JSON_object.is_alkene) {
            reagent = shuffle(["H2O2", "peroxy acid"]).pop()
        }
    } else if (S(schema).contains("->")) {
        // "CCCBR -> HaCN|O ="
        const right = schema.split("->").pop()
        if (S(right).contains("|")) {
            reagent = right.split("|").reverse().pop()
        } else {
            reagent = right.replace(/\=/, '').trim()
        }
    } else if (S(schema).contains("add")) {
        const temp =  schema.split("add").pop().trim()
        if (S(temp).contains("three member ring")) {
            if (molecule_JSON_object.is_alkene) {
                reagent = shuffle(["H2O2", "peroxy acid"]).pop()
            }
        } else {
            const chemical_to_add = temp.trim()
            if (chemical_to_add === "O" || chemical_to_add.toLowerCase() === "oxygen") {
                // For both alkene and keytone when we are adding an oxygen reagent we are adding an oxygen.
                if (molecule_JSON_object.is_alkene || molecule_JSON_object.is_keytone) {
                    const oxidising_agents = ["OsO4", "CrO3", "O3", "KMnO4", "H2O2"]
                    // if alkene get oxidising_agent or peroxy acid or if keytone get peroxy acid and log.
                    reagent = molecule_JSON_object.is_alkene ? shuffle(oxidising_agents).pop() : "peroxy acid"
                }
            }
        }
    }
    return reagent
}

const extractSolventFromSchema = (schema) => {
    let solvent
    if (S(schema).contains("->")) {
        const right = schema.split("->").pop()
        if (S(right).contains("|")) {
            solvent = right.split("|").pop().replace(/\=/, '').trim()
        }
    }
    return solvent
}

const lookupProduct = (db, product, product_found_cb) => {

    if (product === false) {
        return false
    }

    MoleculeLookup(db, product, true).then(
        (product_JSON_object) => {
            product_found_cb(product_JSON_object)
        },
        (Err) => {
            console.error(new Error("Cannot load product"))
        }
    )
}


const lookupReagent = (db, reagent, reagent_found_cb) => {

    if (reagent === false) {
        return false
    }

    MoleculeLookup(db, reagent, true).then(
        (reagent_JSON_object) => {
            reagent_found_cb(reagent_JSON_object)
        },
        (Err) => {
            console.error(new Error("Cannot load reagent"))
        }
    )
}

const lookupSolvent = (db, solvent, solvent_found_cb) => {

    if (solvent === false) {
        return false
    }

    MoleculeLookup(db, solvent, true).then(
        (solvent_JSON_object) => {
            solvent_found_cb(solvent_JSON_object)
        },
        (Err) => {
            console.error(new Error("Cannot load solvent"))
        }
    )
}


const ReactionSchemaParser = (schema, callback) => {

    const MongoClient = require('mongodb').MongoClient
    const S = require('string');

    MongoClient.connect('mongodb+srv://kevin:77777!@cluster0-awqh6.mongodb.net', {useNewUrlParser: true},
        function (err, client) {

            if (err) {
                console.log(err)
                process.exit()

            }
            const db = client.db('chemistry');

            // DETERMINE MOLECULE
            const molecule_name = extractMoleculeFromSchema(schema)
            const product = extractProductFromSchema(schema, molecule_name)
            const reagent = determineReagent(schema, molecule_name)
            const solvent = extractSolventFromSchema(schema)

            if (undefined === molecule_name) {
                console.log('Unable to extract molecue name from schema')
                console.log(schema)
                process.exit()
            }

            if (molecule.name === false) {
                return false
            }

            MoleculeLookup(db, molecule_name, true).then(
                (molecule_JSON_object) => {

                    const reaction_controller = ReactionControllerFactory(molecule_JSON_object)

                    if (undefined !== product) {
                        const product_found_callback = () => (product_JSON_object) => {
                            if (undefined !== reagent) {
                                const reagent_found_callback = () => (reagent_json_object) => {
                                    if (undefined !== solvent) {
                                        const solvent_found_callback = () => (solvent_JSON_object) => {
                                            // Have product, reagent and solvent
                                            reaction_controller.react(molecule_JSON_object, reagent_JSON_object, solvent_JSON_object, product_JSON_object, db, (Err, result) => {
                                                callback(Err, result)
                                            })
                                        }
                                        lookupSolvent(db, solvent, solvent_found_callback())
                                    } else {
                                        // Have product, reagent but no solvent
                                        reaction_controller.react(molecule_JSON_object, reagent_JSON_object, null, product_JSON_object, db, (Err, result) => {
                                            callback(Err, result)
                                        })
                                    }
                                }
                            } else if (undefined !== solvent) {
                                const solvent_found_callback = () => (solvent_JSON_object) => {
                                    // Have product and solvent but no reagent
                                    reaction_controller.react(molecule_JSON_object, null, solvent_JSON_object, product_JSON_object, db, (Err, result) => {
                                        callback(Err, result)
                                    })
                                }
                                lookupSolvent(db, solvent, solvent_found_callback())
                            } else {
                                // Only have molecule and product.
                                reaction_controller.react(molecule_JSON_object, null, null, product_JSON_object, db, (Err, result) => {
                                    callback(Err, result)
                                })
                            }
                        }
                        lookupProduct(db, product, product_found_callback)
                    } else if (undefined !== reagent) { // no product
                        const reagent_found_callback = () => (reagent_json_object) => {
                            // @todo
                            if (reagent_json_object.tag==='HCl' || reagent_json_object.tag==='HCL') {
                                reagent_json_object.molecular_formula = "HCL"
                                reagent_json_object.atoms = reagent_json_object.atoms.reverse()
                            }
                            if (undefined !== solvent) {
                                const solvent_found_callback = () => (solvent_JSON_object) => {
                                    // Have reagent and solvent but no product
                                    reaction_controller.react(molecule_JSON_object, reagent_json_object, solvent_JSON_object, null, (Err, result) => {
                                        callback(Err, result)
                                    })
                                }
                                lookupSolvent(db, solvent, solvent_found_callback())
                            } else {
                                // Have just reagent
                                reaction_controller.react(molecule_JSON_object, reagent_json_object, null, null, db,  (Err, result) => {
                                    callback(Err, result)
                                })
                            }
                        }
                        lookupReagent(db, reagent, reagent_found_callback())
                    } else if (undefined !== solvent) { // no product or reagent
                        const solvent_found_callback = () => (solvent_JSON_object) => {
                            //No product or reagent
                            reaction_controller.react(molecule_JSON_object, null, solvent_JSON_object, null, db, (Err, result) => {
                                callback(Err, result)
                            })
                        }
                        lookupSolvent(db, solvent, solvent_found_callback())
                    } else {
                        // No product, reagent, or solvent
                        console.log("No product, reagent or solvent")
                        molecule_JSON_object.should.have.property('isAkylHalide')
                        molecule_JSON_object.isAkylHalide().should.be.equal(true)
                        reaction_controller.react(molecule_JSON_object, null, null, null, db, (Err, result) => {
                            callback(Err, result)
                        })
                    }

                },
                // "rejects" callback
                (Err) => {
                    console.error(new Error("Cannot load molecule"))
                }
            )
        }
    )
}

module.exports = ReactionSchemaParser















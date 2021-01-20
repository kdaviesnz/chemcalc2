// https://www.npmjs.com/package/should
// npm i should
const should = require('should')
const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient
const assert = require('assert');
const ReactionAI =  require('../Components/State/ReactionAI')
const MoleculeLookup = require('../Controllers/MoleculeLookup')
const PubChemLookup = require('../Controllers/PubChemLookup')

// Install using npm install pubchem-access
const pubchem = require("pubchem-access").domain("compound");
const uniqid = require('uniqid');
const MoleculeFactory = require('../Models/MoleculeFactory')
const VMolecule = require('../Components/Stateless/Views/Molecule')

/*
const MoleculeController = require('../Controllers/Molecule')
const FunctionalGroups = require('../Models/FunctionalGroups')
const Canonical_SMILESParser = require("../Models/CanonicalSMILESParser")
const AtomFactory = require('../Models/AtomFactory')
const Hydrate = require('../Models/Hydrate')
const Dehydrate = require('../Models/Dehydrate')
const BondDisassociate = require('../Models/BondDissassociate')


const PeriodicTable = require("../Models/PeriodicTable")
const CContainer = require('../Controllers/Container')
const CMolecule = require('../Controllers/Molecule')
const CAtom = require('../Controllers/Atom')
const range = require("range")
const Set = require('../Models/Set')

const VMolecule = require('../Components/Stateless/Views/Molecule')
const VContainer = require('../Components/Stateless/Views/Container');
const VReactions = require('../Components/Stateless/Views/Reactions');


// Install using npm install mongodb --save



const verbose = false

// Install using npm install dotenv
require("dotenv").config()




// CAtom tests
// https://www.quora.com/How-many-electrons-are-in-H2O

// Organic Chemistry 8th Edition P76

const FetchReactions = require('../Models/FetchReactions')
*/

const pkl = PubChemLookup((err)=>{
    console.log(err)
    process.exit()
})

const onErrorLookingUpMoleculeInDB = (Err) => {
    console.log(Err)
    client.close();
    process.exit()
}

require("dotenv").config()

const Test = () => {

    const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?retryWrites=true&w=majority";
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

    client.connect(err=> {
        assert.equal(err, null);
        const db = client.db("chemistry")

        const onMoleculeNotFound = (onMoleculeAddedToDBCallback) => {
            return (search) => {
                console.log("Molecule not found in db " + search)
                pkl.searchByName(search, db, (molecule_from_pubchem) => {
                    if (molecule_from_pubchem !== null) {
                        console.log("Molecule found in pubchem")
                        molecule_from_pubchem['json'] = MoleculeFactory(molecule_from_pubchem.CanonicalSMILES)
                        molecule_from_pubchem['search'] = search
                        db.collection("molecules").insertOne(molecule_from_pubchem, (err, result) => {
                            if (err) {
                                console.log(err)
                                client.close()
                                process.exit()
                            } else {
                                onMoleculeAddedToDBCallback(search, db, [molecule_from_pubchem.json, 1])
                            }
                        })

                    }
                })
            }
        }


        // Get known reactions from mongo
        db.collection("known_reactions").find({}).toArray(function(err, known_reactions) {
            if (err) throw err;
            const r = new ReactionAI()
            // Test to see if we can duplicate the reaction
            known_reactions.map(
                (known_reaction) => {
                    //console.log(known_reaction)
                    //console.log(lfakdsjlfsdf)
                    // Look up product
                    MoleculeLookup(db, known_reaction.product, "SMILES", true).then(
                        // "resolves" callback
                        (molecule) => {
                            // Look up substrate
                            const product = MoleculeFactory(molecule.CanonicalSMILES)
                            const reagent_map = {
                                "strong acid":"Cl"
                            }

                            MoleculeLookup(db, known_reaction.substrate).then(
                                (molecule) => {
                                    const substrate = MoleculeFactory(molecule.CanonicalSMILES)
                                    const reagent = MoleculeFactory(undefined === reagent_map[known_reaction.reagents[0]]?known_reaction.reagents[0]:reagent_map[known_reaction.reagents[0]])
                                    r.synthesise(product,  reagent,(err, calculated_reaction_steps) => {
                                        const substrate_from_db = [_.cloneDeep(substrate),1]
                                        const calculated_substrate = _.cloneDeep(calculated_reaction_steps[0].substrate)
                                        const product_from_db = [_.cloneDeep(product),1]
                                        const calculated_product = _.cloneDeep(calculated_reaction_steps[calculated_reaction_steps.length-1].product)
                                        if (VMolecule(substrate_from_db).canonicalSMILES() === VMolecule(calculated_substrate).canonicalSMILES()
                                            && VMolecule(product_from_db).canonicalSMILES() === VMolecule(calculated_product).canonicalSMILES()) {
                                            console.log(known_reaction.substrate + " plus " + known_reaction.reagents[0] +  " ---> " + known_reaction.product + " [OK]".bold.green)
                                        }
                                    })
                                },

                                onMoleculeNotFound((search, db, container_molecule, render) => {
                                    console.log("Product " + search + " added to database")
                                }),
                                // "rejects" callback
                                onErrorLookingUpMoleculeInDB
                            )

                        },
                        onMoleculeNotFound((search, db, container_molecule, render) => {
                            console.log("Molecule " + search + " added to database")
                        }),
                        // "rejects" callback
                        onErrorLookingUpMoleculeInDB
                    )

                    return known_reaction
                }
            )

        });

    })


}

module.exports = Test




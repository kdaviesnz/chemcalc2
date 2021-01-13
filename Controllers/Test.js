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
                            console.log('Product found in db, testing ...')
                            const product = MoleculeFactory(molecule.CanonicalSMILES)
                            console.log('Product: ' + VMolecule([product, 1]).canonicalSMILES())
                            MoleculeLookup(db, known_reaction.substrate).then(
                                (molecule) => {
                                    console.log('Substrate found in db, testing ...')
                                    const substrate = MoleculeFactory(molecule.CanonicalSMILES)
                                    console.log('Product: ' + VMolecule([product, 1]).canonicalSMILES())
                                    console.log('Substrate: ' + VMolecule([substrate, 1]).canonicalSMILES())
                                    // "resolves" callback
                                    // known_reaction.product
                                    // known_reaction.substrate
                                    // known_reaction.reagent
                                    // console.log(molecule.CanonicalSMILES)
                                    r.synthesise(product, (err, calculated_reactions) => {
                                        // Look in calculated_reactions for molecule.CanonicalSMILES
                                        const matching_reactions = calculated_reactions.filter((calculated_reaction) => {
                                            console.log(VMolecule(calculated_reaction.product).canonicalSMILES())
                                            console.log(VMolecule(calculated_reaction.substrate).canonicalSMILES())
                                            return VMolecule(calculated_reaction.product).canonicalSMILES() === VMolecule([product, 1]).canonicalSMILES() && VMolecule(calculated_reaction.substrate).canonicalSMILES() === VMolecule([substrate, 1]).canonicalSMILES()
                                        })
                                        console.log(matching_reactions)
                                        console.log(hfdd)
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




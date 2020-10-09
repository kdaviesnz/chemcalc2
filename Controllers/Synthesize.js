// https://www.npmjs.com/package/should
// npm i should
const should = require('should')
const _ = require('lodash');

const MoleculeController = require('../Controllers/Molecule')
const FunctionalGroups = require('../Models/FunctionalGroups')
const Canonical_SMILESParser = require("../Models/CanonicalSMILESParser")
const AtomFactory = require('../Models/AtomFactory')
const Hydrate = require('../Models/Hydrate')
const Dehydrate = require('../Models/Dehydrate')
const BondDisassociate = require('../Models/BondDissassociate')

const MoleculeFactory = require('../Models/MoleculeFactory')
const PeriodicTable = require("../Models/PeriodicTable")
const CContainer = require('../Controllers/Container')
const CMolecule = require('../Controllers/Molecule')
const CAtom = require('../Controllers/Atom')
const range = require("range")
const Set = require('../Models/Set')

const VMolecule = require('../Views/Molecule')
const VContainer = require('../Views/Container');

const MoleculeLookup = require('../Controllers/MoleculeLookup')
const PubChemLookup = require('../Controllers/PubChemLookup')

// Install using npm install pubchem-access
const pubchem = require("pubchem-access").domain("compound");
const uniqid = require('uniqid');

// Install using npm install mongodb --save
const MongoClient = require('mongodb').MongoClient
const assert = require('assert');

const verbose = false

// Install using npm install dotenv
require("dotenv").config()


const pkl = PubChemLookup((err)=>{
    console.log(err)
    process.exit()
})

const onErrorLookingUpMoleculeInDB = (Err) => {
    console.log(Err)
    client.close();
    process.exit()
}


// CAtom tests
// https://www.quora.com/How-many-electrons-are-in-H2O

// Organic Chemistry 8th Edition P76

const FetchReactions = require('../Models/FetchReactions')

const Synthesize = (verbose,  molecule_to_synthesize_name, search_type, child_reaction_string, render, Err) => {
// COC dimethyl ether
    const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?retryWrites=true&w=majority";
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

    client.connect(err => {

        assert.equal(err, null);
        const db = client.db("chemistry")


        const onMoleculeNotFound = (onMoleculeAddedToDBCallback) => {
            return (search) => {
                console.log("Molecule not found " + search)
                pkl.searchBySMILES(search.replace(/\(\)/g, ""), db, (molecule_from_pubchem) => {
                    if (molecule_from_pubchem !== null) {
                        console.log("Molecule found in pubchem")
                        molecule_from_pubchem['json'] = MoleculeFactory(search)
                        molecule_from_pubchem['search'] = search
                        db.collection("molecules").insertOne(molecule_from_pubchem, (err, result) => {
                            if (err) {
                                console.log(err)
                                client.close()
                                process.exit()
                            } else {
                                onMoleculeAddedToDBCallback(search)
                            }
                        })

                    }
                })
            }
        }

        MoleculeLookup(db, "C[N+]", "SMILES", true).then(
            // "resolves" callback
            (molecule) => {
                // Fetch and render reactions that synthesise chemical
                console.log('Synthesize.js')
                FetchReactions(verbose, db, molecule.json, child_reaction_string, render, (err) =>{
                    console.log('There was an error fetching reactions for ' + molecule_to_synthesize_name)
                    Err(err)
                })
            },
            onMoleculeNotFound((search) => {
                console.log("Molecule " + search + " added to database")
                client.close()
                process.exit()
            }),
            // "rejects" callback
            onErrorLookingUpMoleculeInDB
        )


    });

}

module.exports = Synthesize




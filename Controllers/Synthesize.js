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
    console.log(ddddd)
    console.log(Err)
    client.close();
    process.exit()
}

require("dotenv").config()

const Synthesize = (molecule_to_synthesize_name) => {

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
                        const search_no_quotes = search.replace(/['"]+/g, '').trim()
                        molecule_from_pubchem['json'] = MoleculeFactory(molecule_from_pubchem.CanonicalSMILES)
                        molecule_from_pubchem['search'] = search_no_quotes
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

        const MoleculeLookupClosure = () => {
             MoleculeLookup(db, molecule_to_synthesize_name, "SMILES", true).then(
                // "resolves" callback
                (molecule) => {
                    const r = new ReactionAI()
                    console.log('Product found in db, synthesising ...')
                    const product = MoleculeFactory(molecule.CanonicalSMILES)
                    r.synthesise(product)
                },
                onMoleculeNotFound((search, db, container_molecule, child_reaction_string, render) => {
                    console.log("Molecule " + search + " added to database")
                    MoleculeLookupClosure()
                }),
                // "rejects" callback
                onErrorLookingUpMoleculeInDB
            )
        }

        MoleculeLookupClosure()


    })


}

module.exports = Synthesize




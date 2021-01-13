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
                                onMoleculeAddedToDBCallback(search, db, [molecule_from_pubchem.json, 1], render)
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
                    // console.log(known_reaction)
                    // Look up chemical
                    MoleculeLookup(db, known_reaction.product, "SMILES", true).then(
                        // "resolves" callback
                        (molecule) => {
                            // known_reaction.product
                            console.log(molecule.CanonicalSMILES)
                            console.log('Molecule found in db')
                            const product = MoleculeFactory(molecule.CanonicalSMILES)
                            r.synthesise(product, (err, calculated_reactions)=> {
                                console.log(calculated_reactions)
                                console.log(akkkk)
                            })
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




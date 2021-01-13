// https://www.npmjs.com/package/should
// npm i should
const should = require('should')
const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient
const assert = require('assert');

/*
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

const VMolecule = require('../Components/Stateless/Views/Molecule')
const VContainer = require('../Components/Stateless/Views/Container');
const VReactions = require('../Components/Stateless/Views/Reactions');

const MoleculeLookup = require('../Controllers/MoleculeLookup')
const PubChemLookup = require('../Controllers/PubChemLookup')

// Install using npm install pubchem-access
const pubchem = require("pubchem-access").domain("compound");
const uniqid = require('uniqid');

// Install using npm install mongodb --save



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
*/

const Test = () => {

    const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?retryWrites=true&w=majority";
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

    client.connect(err=> {
        assert.equal(err, null);
        const db = client.db("chemistry")

        // Get known reactions from mongo
        db.collection("known_reactions").find({}).toArray(function(err, known_reactions) {
            if (err) throw err;
            // Test to see if we can duplicate the reaction
            known_reactions.map(
                (know_reaction) => {
                    console.log(known_reaction)
                    return know_reaction
                }
            )

        });

    })


}

module.exports = Test




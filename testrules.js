// https://www.npmjs.com/package/should
// npm i should
const should = require('should')
const _ = require('lodash');

const MoleculeController = require('./Controllers/Molecule')
const FunctionalGroups = require('./Models/FunctionalGroups')
const Canonical_SMILESParser = require("./Models/CanonicalSMILESParser")
const AtomFactory = require('./Models/AtomFactory')
const Hydrate = require('./Models/Hydrate')
const Dehydrate = require('./Models/Dehydrate')
const BondDisassociate = require('./Models/BondDissassociate')
const FetchReactions = require('./Models/FetchReactions')

const MoleculeFactory = require('./Models/MoleculeFactory')
const PeriodicTable = require("./Models/PeriodicTable")
const CContainer = require('./Controllers/Container')
const CMolecule = require('./Controllers/Molecule')
const CAtom = require('./Controllers/Atom')
const range = require("range")
const Set = require('./Models/Set')

const VMolecule = require('./Components/Stateless/Views/Molecule')
const VContainer = require('./Components/Stateless/Views/Container');
const VReactions = require('./Components/Stateless/Views/Reactions');

const MoleculeLookup = require('./Controllers/MoleculeLookup')
const PubChemLookup = require('./Controllers/PubChemLookup')


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


const Families = require('./Models/Families')

const FindSubstrates = require('./Models/FindSubstrates')

const ReactionTest = require('./Components/Stateless/ReactionTest')

// Tests start
const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    
    assert.equal(err, null);
    const db = client.db("chemistry")

    db.collection("rules").find({"mechanism":"Acid catalyzed addition of water to an alkene"}).toArray((err, rules) => {
        if (err) {
            console.log("Error looking up rule")
            console.log(err)
        }
        if (rules !== null) {
            const rule = rules.pop()
            console.log(rule)
            // "C(O)C", "COC(C)(C)CO"
            FindSubstrates(
                false,
                db,
                rule,
                _.cloneDeep([MoleculeFactory("COC(C)(C)CO"), 1]),
                "child_reaction_string",
                (reactions, product, rule) => {

                    VReactions(db, _.cloneDeep(reactions), product, rule).render()

                    _.cloneDeep(reactions).reverse().map((reaction)=>{
                        console.log( VMolecule(reaction.products[0]).canonicalSMILES().green)
                        ReactionTest(reaction.command, reaction.products[0], reaction.products[1], reaction.substrate, rule)
                    })

                    process.exit()
                },
                (err) => {
                    console.log("Error finding substrates")
                    Err(err)
                    process.exit()
                }
            )
        }
    })

})

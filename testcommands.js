const should = require('should')
const _ = require('lodash');
const Set = require('./Models/Set')
const Typecheck = require('./Typecheck')

const VMolecule = require('./Components/Stateless/Views/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')
const AtomFactory = require('./Models/AtomFactory')
const CAtom = require('./Controllers/Atom')

const CommandTest = require('./Components/Stateless/CommandTest')

const reductiveAminationReverse = require('./Commands/ReductiveAminationReverse')
const reduceImineToAmineReverse = require('./Commands/ReduceImineToAmineReverse')
const transferProtonReverse = require('./Commands/TransferProtonReverse')
const StateMoleculeAI = require('./Components/State/MoleculeAI')
const Reaction = require('./Components/State/Reaction')

let reaction =null
let stateMoleculeAI = null

//NMethyl1phenylpropane2imine = MoleculeFactory("CC(CC1=CC=CC=C1)[NH1+]=C")
/*
console.log("C[N+](C)(C)C")
const Tetramethylammonium = MoleculeFactory("C[N+](C)(C)C")
//const ammonium = MoleculeFactory("[NH4+]")
console.log(VMolecule([Tetramethylammonium,1]).compressed())
process.error()
 */

// coordinate covalent bond
// 2 hydrogens on nitrogen, 3 hydrogens on carbon
// Both carbon and nitrogen have 1 non-hydrogen bond and should be bonded to each other.
const m = MoleculeFactory("CN")
console.log(VMolecule([m,1]).compressed())
const test2 = MoleculeFactory("C=N") // [pka,atoms]
console.log(test2[1][4])
console.log(test2[1][8])
test2[1][4].indexedDoubleBonds(test2[1]).length.should.be.equal(1)
console.log(VMolecule([test2,1]).compressed())
process.error()

/*
// N has 1 hydrogen, C has 2.
const m = MoleculeFactory("CN")
const test2 = MoleculeFactory("[O+]")
let me = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
let pnm = MoleculeFactory("CC(CC1=CC=CC=C1)=NC")
let methylamine = MoleculeFactory("CN")
let me_nitrogen_index = null
let me_carbon_index = null
let imine_to_ketone_result = null
let reductiveAminationReverse_result = null
let carbon_index = null
*/

const colors = require('colors')
require("dotenv").config()

const renderCallback = (reactions) => {
    Typecheck(
        {name:"reactions", value:reactions, type:"array"},
    )
    reactions.map((reaction)=> {
        //  VMolecule(reaction.finish_reagent)
        const reagent_smiles = reaction.reagent === null?"Reagent not specified":VMolecule(reaction.reagent).canonicalSMILES()
        console.log(VMolecule(reaction.substrate).canonicalSMILES().red + " (" +  reagent_smiles.green + ") --> (" + reaction.description + ") " + VMolecule(reaction.product).canonicalSMILES().green)
    })
}

// Preliminary tests

// formKetoneFromImine

const MongoClient = require('mongodb').MongoClient
const assert = require('assert');

//const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?retryWrites=true&w=majority";
const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?keepAlive=true&poolSize=300&socketTimeoutMS=1990000&connectTimeoutMS=1990000&retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

process.on('unhandledRejection', function(err) {
    console.log(err);
})

console.log("Connecting to database ...")


client.connect(err => {

    assert.equal(err, null)
    const db = client.db("chemistry")

    console.log("Connected to database. Running preliminary tests ...")

    db.collection("synthesis_testing").find({}).toArray((err, reactions) => {
        reactions.map(
            (reaction_test, i) => {
                console.log("Testing " + reaction_test.reaction +"()")
                let reagent_container = null
                if (reaction_test.starting_reagent === "A" || reaction_test.starting_reagent === "") {
                    reagent_container = reaction_test.starting_reagent
                } else {
                    reagent_container = [MoleculeFactory("CN"), 1]
                }
                // reaction_test.starting_substrate is a string
                const reaction = new Reaction([MoleculeFactory(reaction_test.starting_substrate), 1], reagent_container, "", false, null, null, [], 0, [], renderCallback)
                const result = reaction[reaction_test.reaction](...Object.values(reaction_test.params), false)
                console.log("Testing " + reaction_test.reaction +"() result")
                if (result === false) {
                    console.log("Reaction returned false - " + reaction_test.reaction +"()")
                } else {
                    VMolecule(result[0]).canonicalSMILES().should.be.equal(reaction_test.finishing_substrate)
                    if (typeof result[1] !=="string" && result[1] !== null) {
                        VMolecule(result[1]).canonicalSMILES().should.be.equal(reaction_test.finishing_reagent)
                    } else {
                        result[1].should.be.equal(reaction_test.finishing_reagent)
                    }
                }
            }
        )
        console.log("Preliminary tests completed.")
        process.exit()
    })

})



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

let me = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
let pnm = MoleculeFactory("CC(CC1=CC=CC=C1)=NC")
let methylamine = MoleculeFactory("CN")

let me_nitrogen_index = null
let me_carbon_index = null
let imine_to_ketone_result = null
let reductiveAminationReverse_result = null
let carbon_index = null
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

console.log("Running preliminary tests")

const MongoClient = require('mongodb').MongoClient
const assert = require('assert');

//const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?retryWrites=true&w=majority";
const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?keepAlive=true&poolSize=300&socketTimeoutMS=1990000&connectTimeoutMS=1990000&retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

process.on('unhandledRejection', function(err) {
    console.log(err);
})




client.connect(err => {

    assert.equal(err, null)
    const db = client.db("chemistry")


    db.collection("synthesis_testing").find({}).toArray((err, reactions) => {
        reactions.map(
            (reaction_test) => {
                const reaction = new Reaction([MoleculeFactory(reaction_test.starting_substrate), 1], [MoleculeFactory("CN"), 1], "", false, null, null, [], 0, [], renderCallback)
                const result = reaction[reaction_test.reaction](...Object.values(reaction_test.params), false)
                VMolecule(result[0]).canonicalSMILES().should.be.equal(reaction_test.finishing_substrate)
                VMolecule(result[1]).canonicalSMILES().should.be.equal(reaction_test.finishing_reagent)
                console.log(reaction_test.reaction +"()")
            }
        )
    })

    // dehydrateReverse
    NMethyl1phenylpropane2imine = MoleculeFactory("CC(CC1=CC=CC=C1)[NH1+]=C")
    methylamine = MoleculeFactory("CN")
    //console.log(VMolecule([NMethyl1phenylpropane2imine,1]).compressed())
    reaction = new Reaction([NMethyl1phenylpropane2imine, 1], [methylamine,1], "", false, null, null, [], 0, [], renderCallback)
    dehydrateReverse_result = reaction.dehydrateReverse(true)
    VMolecule(dehydrateReverse_result[0]).canonicalSMILES().should.be.equal("CC(CC1=CC=CC=C1)NC[OH2+]")
    VMolecule(dehydrateReverse_result[1]).canonicalSMILES().should.be.equal("CN")
})



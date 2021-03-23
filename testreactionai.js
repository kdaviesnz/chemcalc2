const ReactionAI =  require('./Components/State/ReactionAI')
const MoleculeFactory = require('./Models/MoleculeFactory')
const VMolecule = require('./Components/Stateless/Views/Molecule')

const pinacolone = MoleculeFactory("CC(=O)C(C)(C)C")
VMolecule([pinacolone,1]).canonicalSMILES().should.equal("CC(=O)C(C)(C)C")

const formate = MoleculeFactory("C(=O)[O-]")
VMolecule([formate,1]).canonicalSMILES().should.equal("C(=O)[O-]")
const MD = MoleculeFactory("CC(CC1=CC2=C(C=C1)OCO2)NC")
VMolecule([MD,1]).canonicalSMILES().should.equal("CC(CC1=CC2=C(C=C1)OCO2)NC")
const methyl_piperonyl_ketone = MoleculeFactory("CC(=O)CC1=CC2=C(C=C1)OCO2")
VMolecule([methyl_piperonyl_ketone,1]).canonicalSMILES().should.equal("CC(=O)CC1=CC2=C(C=C1)OCO2")
const methylamine = MoleculeFactory("CN")
VMolecule([methylamine,1]).canonicalSMILES().should.equal("CN")
// https://en.wikipedia.org/wiki/Pinacol_rearrangement
const me = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
const me2Compare = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
VMolecule([me,1]).canonicalSMILES().should.equal("CC(CC1=CC=CC=C1)NC")
VMolecule([me2Compare,1]).canonicalSMILES().should.equal("CC(CC1=CC=CC=C1)NC")


// Chemicals to synthesise
const pm = MoleculeFactory("CC(=O)CC1=CC2=C(C=C1)OCO2")

//https://en.wikipedia.org/wiki/Leuckart_reaction
const isopropylamine = MoleculeFactory("CC(C)N")
const MA = MoleculeFactory("CC(CC1=CC2=C(C=C1)OCO2)N")

const MDImine = MoleculeFactory("CC(CC1=CC2=C(C=C1)OCO2)=NC")
const MeImine2 = MoleculeFactory("CC(CC1=CC=CC=C1)=NC")
const phenylacetone = MoleculeFactory("CC(=O)CC1=CC=CC=C1")

// Install using npm install dotenv
require("dotenv").config()

const MongoClient = require('mongodb').MongoClient
const assert = require('assert');
const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {

    assert.equal(err, null);
    const db = client.db("chemistry")

    const r = new ReactionAI(db)

    // Leuckart Wallach
    r.synthesise(MD) // reagent = ammonia

    /*
    r.synthesise(MeImine2)
    r.synthesise(MDImine)
    r.synthesise(MD)



// Pinacol Rearrangement
    r.synthesise(pinacolone)
    r.synthesise(methyl_piperonyl_ketone)
    r.synthesise(methylamine)

// Akylation
    r.synthesise(me)
    r.synthesise(isopropylamine)
    r.synthesise(phenylacetone)
    */


})





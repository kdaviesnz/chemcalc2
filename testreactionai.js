const ReactionAI =  require('./Components/State/ReactionAI')
const MoleculeFactory = require('./Models/MoleculeFactory')
const VMolecule = require('./Components/Stateless/Views/Molecule')

// Reagents
const hydrochloric_acid = MoleculeFactory("Cl")
const methylamide = MoleculeFactory("C[N-]")
const ammonia = MoleculeFactory("N")
const formate = MoleculeFactory("C(=O)[O-]")
const formaldehyde = MoleculeFactory("C=O")
const water = MoleculeFactory("O")


console.log("Running initial tests")

const md = MoleculeFactory("CC(CC1=CC2=C(C=C1)OCO2)NC")
VMolecule([md, 1]).canonicalSMILES(false).should.be.equal("CC(CC1=CC2=C(C=C1)OCO2)NC")

const sulphuric_acid = MoleculeFactory("OS(=O)(=O)O")
//console.log(VMolecule([sulphuric_acid, 10]).JSON())
//process.error()
VMolecule([sulphuric_acid, 1]).canonicalSMILES(false).should.be.equal("OS(=O)(=O)O")

// benzene
// C1=CC=CC=C1
const benzene = MoleculeFactory("C1=CC=CC=C1")
VMolecule([benzene, 1]).canonicalSMILES(false).should.be.equal("C1=CC=CC=C1") // actual C1=CC=C=C=C1

const benzyl_alcohol = MoleculeFactory("C1=CC=C(C=C1)CO")
VMolecule([benzyl_alcohol, 1]).canonicalSMILES(false).should.be.equal("C1=CC=C(C=C1)CO")

const ethanol = MoleculeFactory("C(O)C")
VMolecule([ethanol, 1]).canonicalSMILES(false).should.be.equal("C(O)C")

const methylene = MoleculeFactory("[CH2]")
VMolecule([methylene, 1]).canonicalSMILES(false).should.be.equal("[CH2]") // actual

// epoxide acidic ring opening
// 2-Methoxy-2-methylpropan-1-ol
const Two_Methoxy_2_methylpropan_1_ol = MoleculeFactory("COC(C)(C)CO")
VMolecule([Two_Methoxy_2_methylpropan_1_ol, 1]).canonicalSMILES(false).should.be.equal("COC(C)(C)CO")

const bromide_neg = MoleculeFactory("[Br-]")
VMolecule([bromide_neg, 1]).canonicalSMILES(false).should.be.equal("[Br-]")

const oxonium = MoleculeFactory("[OH3+]")
VMolecule([oxonium, 1]).canonicalSMILES(false).should.be.equal("[OH3+]")

const ammonium = MoleculeFactory("[NH4+]")
VMolecule([ammonium, 1]).canonicalSMILES(false).should.be.equal("[NH4+]")

const chloride = MoleculeFactory("[Cl-]")
VMolecule([chloride, 1]).canonicalSMILES(false).should.be.equal("[Cl-]")

const chloranium = MoleculeFactory("[Cl+]")
VMolecule([chloranium, 1]).canonicalSMILES(false).should.be.equal("[Cl+]")

const m = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
VMolecule([m, 1]).canonicalSMILES(false).should.be.equal("CC(CC1=CC=CC=C1)NC")

const pinacolone = MoleculeFactory("CC(=O)C(C)(C)C")
console.log(VMolecule([pinacolone,1]).compressed())
VMolecule([pinacolone,1]).canonicalSMILES(true).should.equal("CC(=O)C(C)(C)C")

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
//const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?retryWrites=true&w=majority";
const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?keepAlive=true&poolSize=300&socketTimeoutMS=1990000&connectTimeoutMS=1990000&retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

process.on('unhandledRejection', function(err) {
    console.log(err);
});


client.connect(err => {

    assert.equal(err, null);
    const db = client.db("chemistry")

    const r = new ReactionAI(db)

 //   console.log(VMolecule([me,0]).formatted())

    r.synthesise(me, [methylamine])

    /*
    r.synthesise(formate, null)
    r.synthesise(me2Compare, null)
    r.synthesise(MeImine2, null)
    r.synthesise(MDImine, null)
    r.synthesise(MA, null)
    r.synthesise(isopropylamine, null)
*/
  //  r.synthesise(pinacolone, null)
  //  r.synthesise(pm, null)
  //  r.synthesise(methylamine, null)
  //  r.synthesise(methyl_piperonyl_ketone, null)
    //r.synthesise(me, null)
    //r.synthesise(MD, null)
    //r.synthesise(phenylacetone, null)

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






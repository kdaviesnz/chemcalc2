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

if (true) {
    const bondsv2 = MoleculeFactory("CP(=O)C(O)NC" )
    bondsv2[1].filter((atom)=>{
        return atom[0] !== "H"
    }).branchesv2([[]], 0, true)
    process.error()
}

if (false) {
    const anhydrideSubstitutionReactionReverse = MoleculeFactory("CC(=O)CC(N)C" )
    console.log(VMolecule([anhydrideSubstitutionReactionReverse,1]).compressed())
    process.error()
}
// alphaSubstitutionReactionReverse(carbonyl_oxygen_index, carbonyl_carbon_index, alpha_carbonyl_carbon_index, beta_atom_index)
if (false) {
    const alphaSubstitutionReactionReverse = MoleculeFactory("CC(=O)C(C)(C)N" )
    console.log(VMolecule([alphaSubstitutionReactionReverse,1]).compressed())
    process.error()
}
if (false) {
    const amineAkylationReverse = MoleculeFactory("CCC(C)N(C)(C)" )
    console.log(VMolecule([amineAkylationReverse,1]).compressed())
    process.error()
}
if (false) {
    // carbon_to_add_iodine_to_index
    const eschweilerClark = MoleculeFactory("CCC(C)NC" )
    console.log(VMolecule([eschweilerClark,1]).compressed())
    process.error()
}
if (false) {
    // carbon_to_add_iodine_to_index
    const iodinisationReverse = MoleculeFactory("CC(C(C)NC)[I]" )
    console.log(VMolecule([iodinisationReverse,1]).compressed())
    process.error()
}
if (false) {
    // carbon_to_add_iodine_to_index
    const consumptionOfIodineByPhosphorousReverse = MoleculeFactory("CCC(C)NC" )
    console.log(VMolecule([consumptionOfIodineByPhosphorousReverse,1]).compressed())
    process.error()
}

if (false) {
    const bronsted_reverse = MoleculeFactory("[NH4]")
    console.log(VMolecule([bronsted_reverse, 1]).compressed())
    process.error()
}
if (false) {
    const lewis_acid_base_reaction = MoleculeFactory("[Al-](Cl)(Cl)(Cl)[O+](C)(C)" )
    console.log(VMolecule([lewis_acid_base_reaction,1]).compressed())
    process.error()
}
// [Al-](Cl)(Cl)(Cl)O(C)(C)

//const bronsted_reverse = MoleculeFactory("CC=[OH1+]")
//console.log(VMolecule([bronsted_reverse,1]).compressed())
//process.error()

//const lewis_acid_base_reaction = MoleculeFactory("C[CH1+](=[OH1+])[NH2+]C")
//console.log(VMolecule([lewis_acid_base_reaction,1]).compressed())
//process.error()

//const transfer_proton = MoleculeFactory("CC([OH2+])N")
//console.log(VMolecule([transfer_proton,1]).compressed())
//process.error()

//const reduce_reverse_1 = MoleculeFactory("CC(CC1=CC2=C(C=C1)OCO2)NC")
//console.log(VMolecule([reduce_reverse_1,1]).compressed())
//process.error()
//const t = MoleculeFactory("CC(O)[NH4]")
//console.log(VMolecule([t,1]).compressed())
//process.error()

const carboxylic_acid = MoleculeFactory("CC(=O)O")
//console.log(VMolecule([carboxylic_acid,1]).compressed())
carboxylic_acid[1].isCarboxylicAcid().should.be.true()
const alcohol = MoleculeFactory("OC")
//console.log(VMolecule([alcohol,1]).compressed())
alcohol[1].isAlcohol().should.be.true()
const ketone = MoleculeFactory("CC(=O)CC")
//console.log(VMolecule([ketone,1]).compressed())
ketone[1].isKetone().should.be.true()
const ester = MoleculeFactory("CC(=O)ON")
//console.log(VMolecule([ester,1]).compressed())
ester[1].isEster().should.be.true()

const branch_test = MoleculeFactory("C(OCC)(C)(N)")
//console.log(VMolecule([branch_test,1]).compressed())
//process.error()
//console.log(branch_test[1][1].branches(branch_test[1]))

const chains = VMolecule([branch_test,1]).chains()

//const test2 = MoleculeFactory("[CH2+]C") // [pka,atoms]
//console.log(VMolecule([test2,1]).compressed())
//process.error()
//console.log("testcommands.js")
//console.log(test2[1][4])
//console.log(test2[1][8])
//test2[1][4].indexedDoubleBonds(test2[1]).length.should.be.equal(1)
//test2[1][2].hydrogens(test2[1]).length.should.be.equal(2)
//test2[1][4].hydrogens(test2[1]).length.should.be.equal(1)
//console.log(VMolecule([test2,1]).compressed())


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
m[1][3].indexedBonds(m[1]).length.should.be.equal(1)
m[1][3].hydrogens(m[1]).length.should.be.equal(3)
m[1][6].hydrogens(m[1]).length.should.be.equal(2)

let me = MoleculeFactory("CC(CC1=CC=CC=C1)NC")


/*
// N has 1 hydrogen, C has 2.
const m = MoleculeFactory("CN")
const test2 = MoleculeFactory("[O+]")

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
//process.error()

const MongoClient = require('mongodb').MongoClient
const assert = require('assert');

//const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?retryWrites=true&w=majority";
const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?keepAlive=true&poolSize=300&socketTimeoutMS=1990000&connectTimeoutMS=1990000&retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

process.on('unhandledRejection', function(err) {
    console.log(err);
})

/*
Commands:
formImineFromKetoneReverse
reduceImineToAmineReverse
reductiveAminationReverse
dehydrateReverse
hydrateReverse
deprotonateOxygenOnDoubleBondReverse
To do:
Commands/BreakBondReverse.js                         Commands/HydrolysisReverse.js
Commands/BreakCarbonOxygenDoubleBondReverse.js       Commands/MakeOxygenCarbonDoubleBondReverse.js
Commands/CreateEnolateReverse.js
Commands/HydrideShiftOnCarbonNitrogenBondReverse.js  Commands/TransferProtonReverse.js

 */

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
                if (reaction_test.starting_reagent === "A" || reaction_test.starting_reagent === "CB" || reaction_test.starting_reagent === "") {
                    reagent_container = reaction_test.starting_reagent
                } else {
                    reagent_container = [MoleculeFactory(reaction_test.starting_reagent), 1]
                }
                // reaction_test.starting_substrate is a string
             //   console.log("testcommands")
               // console.log(MoleculeFactory(reaction_test.starting_substrate))
                const reaction = new Reaction([MoleculeFactory(reaction_test.starting_substrate), 1], reagent_container, "", false, null, null, [], 0, [], renderCallback)
                if (undefined === reaction[reaction_test.reaction]) {
                    throw new Error('reaction.' + reaction_test.reaction + "() is not defined.")
                }
                const result = reaction[reaction_test.reaction](...Object.values(reaction_test.params), false)
                if (result === false) {
                    console.log("Reaction returned false - " + reaction_test.reaction +"()")
                } else {
                    if (VMolecule(result[0]).canonicalSMILES() !== reaction_test.finishing_substrate) {
                        console.log(VMolecule(result[0]).compressed())
                        throw new Error("Finishing substrate is incorrect - expected " + reaction_test.finishing_substrate + " but got " + VMolecule(result[0]).canonicalSMILES())
                    }
                    VMolecule(result[0]).canonicalSMILES().should.be.equal(reaction_test.finishing_substrate)
                    if (typeof result[1] !== "string" && result[1] !== null) {
                        if (typeof reaction_test.finishing_reagent === "object") {
                            _.isEqual(reaction_test.finishing_reagent, result[1].map((r)=>{
                                return VMolecule(r).canonicalSMILES()
                            })).should.be.true()
                        } else {
                            VMolecule(result[1]).canonicalSMILES().should.be.equal(reaction_test.finishing_reagent)
                        }
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



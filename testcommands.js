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

me_nitrogen_index = 19
me_carbon_index = 23 // terminal carbon
pnm = MoleculeFactory("CC(CC1=CC=CC=C1)=NC") // phenylacetone-N-methylimine
methylamine = MoleculeFactory("CN")
reaction = new Reaction([pnm, 1], [methylamine, 1], "", false, null, null, [], 0, [], renderCallback)
stateMoleculeAI = new StateMoleculeAI(reaction)
imine_to_ketone_result = stateMoleculeAI.formKetoneFromImine(me_nitrogen_index, me_carbon_index, false)
VMolecule(imine_to_ketone_result[0]).canonicalSMILES().should.be.equal("C=O")
VMolecule(imine_to_ketone_result[1]).canonicalSMILES().should.be.equal("C(C)(CC1=CC=CC=C1)=N")

me_nitrogen_index = 19
me_carbon_index = 4 // non-terminal carbon attached to nitrogen
pnm = MoleculeFactory("CC(CC1=CC=CC=C1)=NC") // phenylacetone-N-methylimine
//console.log(VMolecule([pnm,1]).compressed())
//process.error()
methylamine = MoleculeFactory("CN")
reaction = new Reaction([pnm, 1], [methylamine, 1], "", false, null, null, [], 0, [], renderCallback)
stateMoleculeAI = new StateMoleculeAI(reaction)
imine_to_ketone_result = stateMoleculeAI.formKetoneFromImine(me_nitrogen_index, me_carbon_index, false)
VMolecule(imine_to_ketone_result[0]).canonicalSMILES().should.be.equal("C=O")
VMolecule(imine_to_ketone_result[1]).canonicalSMILES().should.be.equal("C(C)(CC1=CC=CC=C1)=N")

process.error()



// reduceImineToAmineReverse
nitrogen_index = 21
carbon_index = 5
me = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
reaction = new Reaction([me, 1], null, "", false, null, null, [], 0, [], renderCallback)
reduceImineToAmineReverse_result = reaction.reduceImineToAmineReverse(carbon_index, false)
VMolecule(reduceImineToAmineReverse_result[0]).canonicalSMILES().should.be.equal("CC(CC1=CC=CC=C1)=[NH1+]C")
if (reduceImineToAmineReverse_result[1] !==null) {
    throw new Error("Null expected")
}



// dehydrateReverse
NMethyl1phenylpropane2imine = MoleculeFactory("CC(CC1=CC=CC=C1)[NH1+]=C")
//NMethyl1phenylpropane2imine = MoleculeFactory("C[NH1+]=C")
console.log(VMolecule([NMethyl1phenylpropane2imine,1]).compressed())
VMolecule([NMethyl1phenylpropane2imine,1]).canonicalSMILES().should.be.equal("CC(CC1=CC=CC=C1)[NH1+]=C")
process.error()

// reduceImineToAmineReverse
nitrogen_index = 21
carbon_index = 25 // terminal carbon
me = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
reaction = new Reaction([me, 1], null, "", false, null, null, [], 0, [], renderCallback)
//console.log(VMolecule([me,1]).compressed())
reduceImineToAmineReverse_result = reaction.reduceImineToAmineReverse(carbon_index, false)
VMolecule(reduceImineToAmineReverse_result[0]).canonicalSMILES().should.be.equal("CC(CC1=CC=CC=C1)[NH1+]=C")
if (reduceImineToAmineReverse_result[1] !==null) {
    throw new Error("Null expected")
}




// dehydrateReverse
NMethyl1phenylpropane2imine = MoleculeFactory("CC(CC1=CC=CC=C1)[NH1+]=C")
console.log(VMolecule([NMethyl1phenylpropane2imine,1]).compressed())

reaction = new Reaction([NMethyl1phenylpropane2imine, 1], null, "", false, null, null, [], 0, [], renderCallback)
process.error()
//console.log(VMolecule([me,1]).compressed())
dehydrateReverse_result = reaction.dehydrateReverse(true)
VMolecule(dehydrateReverse_result[0]).canonicalSMILES().should.be.equal("CC(CC1=CC=CC=C1)=NC")
VMolecule(dehydrateReverse_result[1]).canonicalSMILES().should.be.equal("CC(CC1=CC=CC=C1)=NC")

process.error()




// reductiveAminationReverse
nitrogen_index = 21
carbon_index = 5
me = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
pnm = MoleculeFactory("CC(CC1=CC=CC=C1)=NC")
methylamine = MoleculeFactory("CN")
//  constructor(container_substrate, container_reagent, rule, DEBUG, horizontalCallback, horizontalFn, commands, command_index, reactions, renderCallback)
reaction = new Reaction([me, 1], null, "", false, null, null, [], 0, [], renderCallback)
stateMoleculeAI = new StateMoleculeAI(reaction)
reductiveAminationReverse_result = reaction.reductiveAminationReverse(carbon_index, false)
VMolecule(reductiveAminationReverse_result[0]).canonicalSMILES().should.be.equal("CC(CC1=CC=CC=C1)=O")
VMolecule(reductiveAminationReverse_result[1]).canonicalSMILES().should.be.equal("CN")

// Reductive amination
nitrogen_index = 21
carbon_index = 25
// CC(C(O)C1=CC=CC=C1)=O 1-Hydroxy-1-phenylacetone
me = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
methylamine = MoleculeFactory("CN")
reaction = new Reaction([me, 1], [methylamine, 1], "", false, null, null, [], 0, [], renderCallback)

stateMoleculeAI = new StateMoleculeAI(reaction)
reductiveAminationReverse_result = reaction.reductiveAminationReverse(carbon_index, false)
VMolecule(reductiveAminationReverse_result[0]).canonicalSMILES().should.be.equal("C=O")
VMolecule(reductiveAminationReverse_result[1]).canonicalSMILES().should.be.equal("CC(CC1=CC=CC=C1)N")



console.log("Preliminary tests completed. Running main tests...")



// ============================================================================================




const commands = [
    reductiveAminationReverse,
    reduceImineToAmineReverse
]

const horizontalFn = (target, reagent, reaction_commands) => (i, horizontalCallback, renderCallback, reactions) => {
    Typecheck(
        {name:"target", value:target, type:"object"},
        {name:"reagent", value:reagent, type:"object"},
        {name:"reaction_commands", value:reaction_commands, type:"array"},
        {name:"i", value:i, type:"number"},
        {name:"horizontalCallback", value:horizontalCallback, type:"function"},
        {name:"renderCallback", value:renderCallback, type:"function"},
        {name:"reactions", value:reactions, type:"array"},
    )
    const rule = ""
    commands[i](target, reagent, rule, horizontalCallback, horizontalFn, reaction_commands, i, renderCallback, reactions)
}

me = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
methylamine = MoleculeFactory("CN")
// null = reagent - we are not passing in a reagent
const horizontalCallback = horizontalFn(_.cloneDeep(me), null, _.cloneDeep(commands))
horizontalCallback(0, horizontalCallback, renderCallback, [])
/*
const reductive_amination_reverse = CommandTest(
    "REDUCTIVEAMINATIONREVERSE",
    _.cloneDeep(me),
    _.cloneDeep([methylamine,1]),
    "",
    horizontalCallback,
    horizontalFn,
    commands,
    0,
    renderCallback
)
*/

process.error()

const acetone = MoleculeFactory("CC(=O)C")
console.log(VMolecule([acetone,1]).compressed())
const reductive_amination_test_2 = CommandTest("REDUCTIVEAMINATION", _.cloneDeep([acetone,1]), null)
process.error()

const sulphuric_acid = MoleculeFactory("OS(=O)(=O)O")
VMolecule([sulphuric_acid,1]).canonicalSMILES().should.be.oneOf(["OS(O)(=O)=O", "OS(=O)(=O)O"])
const sulphuric_acid_ai = require("./Components/Stateless/MoleculeAI")([sulphuric_acid,1])

const molReverse = MoleculeFactory("CC([O-])=C")
const create_enolate_products_reverse = CommandTest("CREATEENOLATEREVERSE", _.cloneDeep([molReverse,1]), null)
create_enolate_products_reverse[1].should.be.equal("B")
VMolecule(create_enolate_products_reverse[0], 1).canonicalSMILES().should.be.equal("CC(=O)C")
process.error()

const mol = MoleculeFactory("CC=O")
const base = MoleculeFactory("[O-]")
console.log(VMolecule([mol,1]).compressed())
const mol_ai = require("./Components/Stateless/MoleculeAI")([mol,1])
const create_enolate_products = CommandTest("CREATEENOLATE", _.cloneDeep([mol,1]), _.cloneDeep([base, 1]))
process.error()




const methanol = MoleculeFactory("CO")
VMolecule([methanol,1]).canonicalSMILES().should.be.equal("CO")
const methanol_ai = require("./Components/Stateless/MoleculeAI")([methanol,1])

const carboxylic_ester = MoleculeFactory("CC(=O)ON")
const hydroxide_ion = MoleculeFactory("[OH-]")

//const carboxylic_ester = MoleculeFactory("CC(=O)ON")
console.log('Carboxylic ester')
console.log(VMolecule([carboxylic_ester,1]).compressed())
const saponification_step1 = CommandTest("BREAK carbon oxygen double bond", _.cloneDeep([carboxylic_ester,1]))
console.log('saponification step 1 BREAK carbon oxygen double bond. C atom should now have a + charge (electrophile). =O atom should have negative charge.')
console.log(VMolecule(saponification_step1[0]).compressed())


const saponification_step2= CommandTest("BOND atoms", _.cloneDeep(saponification_step1[0]), _.cloneDeep([hydroxide_ion, 1]))
console.log('saponification step 2 BOND atoms. O atom on reagent [OH-] (nucleophile) attacks C+ atom on substrate. O atom on former C=O double bond should still have negative charge.')
console.log(VMolecule(saponification_step2[0]).compressed())

const saponification_step3= CommandTest("MAKE oxygen carbon double bond", _.cloneDeep(saponification_step2[0]))
console.log('saponification step 3 MAKE oxygen carbon double bond. O- atom attacks the C atom on the former C=O bond. O atom should now have no charge. Carbon atom should have negative charge (nucleophile)')
console.log(VMolecule(saponification_step3[0]).compressed())

const saponification_step4= CommandTest("BREAK bond", _.cloneDeep(saponification_step3[0]))
console.log('saponification step 4 BREAK bond" - C-OR breaks forming leaving group. O atom on OR should have negative charge (nucleophile).')
console.log(VMolecule(saponification_step4[0]).compressed())
console.log(VMolecule(saponification_step4[2][0]).compressed()) // LEAVING GROUPS

const saponification_step5= CommandTest("DEPROTONATE", _.cloneDeep(saponification_step4[0]), _.cloneDeep(saponification_step4[2][0]))
console.log('saponification step 5 DEPROTONATE" - O- atom (nucleophile) on O-R attacks proton on O on substrate. O atom on substrate should now have a negative charge. O atom on C-R  should now have no charge.')
console.log(VMolecule(saponification_step5[0]).compressed())

//console.log(VMolecule([MoleculeFactory("ON"), 1]).compressed())
const saponification_step5_reversed = CommandTest("PROTONATE", _.cloneDeep(saponification_step5[0]), _.cloneDeep([MoleculeFactory("[OH]N"),1]))
console.log('saponification step 5 reverse PROTONATE" - Protonate [O-] atom on substrate. O atom on [OR] should now have a negative charge.')
console.log(VMolecule(saponification_step5_reversed[0]).compressed())
console.log(VMolecule(saponification_step5_reversed[1]).compressed())

const saponification_step4_reversed = CommandTest("BOND atoms", _.cloneDeep(saponification_step5_reversed[0]), _.cloneDeep(saponification_step5_reversed[1]))
console.log('saponification step 4 reversed BOND atoms to substrate" - Bond O- atom (nucleophile) to carbon atom on substrate (electrophile). Carbon  atom should have a - charge.')
console.log(VMolecule(saponification_step4_reversed[0]).compressed())

const saponification_step3_reversed = CommandTest("BREAK carbon oxygen double bond", _.cloneDeep(saponification_step4_reversed[0]))
console.log('saponification step 3 reversed BREAK carbon oxygen double bond" - Break C=O bond')
console.log(VMolecule(saponification_step3_reversed[0]).compressed())

const saponification_step2_reversed = CommandTest("MAKE oxygen carbon double bond", _.cloneDeep(saponification_step3_reversed[0]))
console.log('saponification step 2 reversed MAKE oxygen carbon double bond" - Break C=O bond')
console.log(VMolecule(saponification_step2_reversed[0]).compressed())

const saponification_step1_reversed = CommandTest("REMOVE hydroxyl group", _.cloneDeep(saponification_step2_reversed[0]))
console.log('saponification step 1 reversed REMOVE hydroxyl group" - Break CO bond')
console.log(VMolecule(saponification_step1_reversed[0]).compressed())
console.log(VMolecule(saponification_step1_reversed[2][0]).compressed()) // OH



// PROTONATE
// See Organic Chemistry 8th Edition p245
const alkene = MoleculeFactory("CC=C")
const alkene_ai = require("./Components/Stateless/MoleculeAI")([alkene,1])
const nucleophile_index =alkene_ai.findNucleophileIndex()
const reagent_nucleophile_index = sulphuric_acid_ai.findNucleophileIndex()
alkene_ai.findNucleophileIndex().should.be.equal(8)
sulphuric_acid_ai.findProtonIndex().should.be.equal(0)
CAtom(alkene[1][nucleophile_index], nucleophile_index, [alkene,1]).freeElectrons().length.should.be.equal(0)
const double_bonds = CAtom(alkene[1][nucleophile_index], nucleophile_index, [alkene,1]).indexedDoubleBonds("")
double_bonds.length.should.be.equal(1)
const protonated_products = CommandTest("PROTONATE", [alkene,1], [sulphuric_acid,1])
VMolecule(protonated_products[0]).canonicalSMILES().should.be.equal('C[CH1+]C')
VMolecule(protonated_products[1]).canonicalSMILES().should.be.oneOf(["[O-]S(O)(=O)=O", "[O-]S(=O)(=O)O"])


// DEPROTONATE
// See Organic Chemistry 8th Edition p245
const isopropyl_cation = protonated_products[0]
const hydrogen_sulfate = protonated_products[1]
const deprotonated_products = CommandTest("DEPROTONATE", _.cloneDeep(isopropyl_cation), _.cloneDeep(hydrogen_sulfate))
VMolecule(deprotonated_products[1]).canonicalSMILES().should.be.oneOf(["OS(O)(=O)=O","OS(=O)(=O)O"])
VMolecule(deprotonated_products[0]).canonicalSMILES().should.be.equal("CC=C")

// HYDRATE
// See Organic Chemistry 8th Edition p245
const isopropyl_cation_ai = require("./Components/Stateless/MoleculeAI")(isopropyl_cation)
isopropyl_cation_ai.findElectrophileIndex().should.be.equal(5)
const water = MoleculeFactory("O")
const hydrated_products = CommandTest("HYDRATE", _.cloneDeep(isopropyl_cation), _.cloneDeep([water,1]))
VMolecule(hydrated_products[0]).canonicalSMILES().should.be.oneOf(["CC([O+])C", "CC(C)[O+]"])
// DEHYDRATE
// See Organic Chemistry 8th Edition p245
const isopropyloxonium = hydrated_products[0]
const dehydrated_products = CommandTest("DEHYDRATE", _.cloneDeep(isopropyloxonium))
VMolecule(dehydrated_products[0]).canonicalSMILES().should.be.equal("C[CH1+]C")


// REMOVE proton from water
// See Organic Chemistry 8th Edition p245
const isopropyloxonium_ai = require("./Components/Stateless/MoleculeAI")(isopropyloxonium)
isopropyloxonium_ai.findWaterOxygenIndex().should.be.equal(12)
const deprotonated_hydrated_products = CommandTest("REMOVE proton from water", _.cloneDeep(isopropyloxonium), _.cloneDeep([water,1]))
VMolecule(deprotonated_hydrated_products[0]).canonicalSMILES().should.be.oneOf("CC(O)C", "CC(C)O")
// Add proton to hydroxyl group
// See Organic Chemistry 8th Edition p245
const isopropanol = deprotonated_hydrated_products[0]
//console.log(VMolecule(isopropanol).compressed())
const isopropanol_ai =  require("./Components/Stateless/MoleculeAI")(isopropanol)
isopropanol_ai.findHydroxylOxygenIndex().should.be.equal(11)
const protonated_deprotonated_hydrated_products = CommandTest("ADD proton to hydroxyl group", _.cloneDeep(isopropanol), _.cloneDeep([water,1]))
VMolecule(protonated_deprotonated_hydrated_products[0]).canonicalSMILES().should.be.oneOf(["CC([O+])C", "CC(C)[O+]"])


// Run commands in reverse
// See Organic Chemistry 8th Edition p245
const dehydrated_products_2 = CommandTest("DEHYDRATE", _.cloneDeep(protonated_deprotonated_hydrated_products[0]))
const deprotonated_products_2 = CommandTest("DEPROTONATE", _.cloneDeep(dehydrated_products_2[0]), _.cloneDeep(hydrogen_sulfate))
VMolecule(deprotonated_products_2[0]).canonicalSMILES().should.be.equal("CC=C")



// Epoxide acidic ring opening
// https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(McMurry)/Chapter_18%3A_Ethers_and_Epoxides%3B_Thiols_and_Sulfides/18.06_Reactions_of_Epoxides%3A_Ring-opening
// PROTONATE
// BREAK bond
// BOND atoms
// DEPROTONATE nonhydroxyl oxygen
// CC1(C)OC1
// Start
const isobutene_oxide = MoleculeFactory("CC1(CO1)C")
VMolecule([isobutene_oxide,1]).canonicalSMILES().should.be.equal("CC4(C)CO4")

// PROTONATE
// Protonate the oxygen atom
const protonated_ether_products = CommandTest("PROTONATE", _.cloneDeep([isobutene_oxide,1]), _.cloneDeep([sulphuric_acid,1]))
VMolecule(protonated_ether_products[0]).canonicalSMILES().should.be.equal("CC4(C)C[O+]4")
const twoTwoDimethyloxoniacyclopropane = protonated_ether_products[0]
// DEPROTONATE
// Reverse test - deprotonate the oxygen atom
//console.log(VMolecule(twoTwoDimethyloxoniacyclopropane).compressed())
const twoTwoDimethyloxoniacyclopropane_ai = require("./Components/Stateless/MoleculeAI")(twoTwoDimethyloxoniacyclopropane)
twoTwoDimethyloxoniacyclopropane_ai.findElectrophileIndex("").should.be.equal(8)
const deprotonated_ether_products = CommandTest("DEPROTONATE", _.cloneDeep(twoTwoDimethyloxoniacyclopropane), _.cloneDeep(protonated_ether_products[1]))
VMolecule(deprotonated_ether_products[0]).canonicalSMILES().should.be.equal("CC4(C)CO4")

// BREAK bond
// Break bond between the oxygen (electrophile) and most substituted carbon (nucleophile)
// Carbon will lose electrons and therefore will have a positive charge.
console.log('2,2,Dimethyloxoniacyclopropane:')
console.log(VMolecule(twoTwoDimethyloxoniacyclopropane).compressed())
console.log('Break bond between the oxygen (electrophile) and most substituted carbon (nucleophile)')
const protonated_ether_products_bond_broken = CommandTest("BREAK bond", _.cloneDeep(twoTwoDimethyloxoniacyclopropane))
const two_methylpropan_1_ol = protonated_ether_products_bond_broken[0]
console.log('protonated_ether_products_bond_broken[0]')
console.log(VMolecule(two_methylpropan_1_ol).compressed())
VMolecule(two_methylpropan_1_ol).canonicalSMILES().should.be.equal("C[C+](C)CO")
// console.log(VMolecule(two_methylpropan_1_ol).compressed()) // correct
// BOND atoms
// Reversal - bond oxygen with most substituted carbon
const protonated_ether_products_bond_fixed = CommandTest("BOND atoms", _.cloneDeep(two_methylpropan_1_ol))
VMolecule(protonated_ether_products_bond_fixed[0]).canonicalSMILES().should.be.equal("CC4(C)C[O+]4")


// Bond atoms (substrate + reagent)
// Bond methanol oxygen atom (reagent, nucleophile) with most substituted substrate carbon (electrophile)
const protonated_ether_products_methylated = CommandTest("BOND atoms", _.cloneDeep(two_methylpropan_1_ol),
    _.cloneDeep([methanol,1]))
VMolecule(protonated_ether_products_methylated[0]).canonicalSMILES().should.be.oneOf("CC(C)([O+]C)CO", "CC(C)(CO)[O+]C")
// BREAK bond
// Reversal - break bond between methanol oxygen atom with most substituted substrate carbon
const protonated_ether_products_demethylated = CommandTest("BREAK bond", _.cloneDeep(protonated_ether_products_methylated[0]))
// CC(C)([O+]C)CO remove [O+]
VMolecule(protonated_ether_products_demethylated[0]).canonicalSMILES().should.be.equal("C[C+](C)CO")

// DEPROTONATE nonhydroxyl oxygen
const protonated_ether_products_methylated_deprotonated = CommandTest("DEPROTONATE nonhydroxyl oxygen", _.cloneDeep(protonated_ether_products_methylated[0]),
    _.cloneDeep([methanol,1]))
VMolecule(protonated_ether_products_methylated_deprotonated[0]).canonicalSMILES().should.be.oneOf(["CC(C)(OC)CO", "CC(C)(CO)OC"])
// PROTONATE nonhydroxyl oxygen
const protonated_ether_products_methylated_protonated = CommandTest("PROTONATE nonhydroxyl oxygen",
    _.cloneDeep(protonated_ether_products_methylated_deprotonated[0]),
    _.cloneDeep(protonated_ether_products_methylated_deprotonated[1]))
VMolecule(protonated_ether_products_methylated_protonated[0]).canonicalSMILES().should.be.oneOf(["CC(C)([O+]C)CO", "CC(C)(CO)[O+]C"])


// ANTI-DIHYDROXYLATION
// https://chem.libretexts.org/Courses/Sacramento_City_College/SCC%3A_Chem_420_-_Organic_Chemistry_I/Text/09%3A_Reactions_of_Alkenes/9.13%3A_Dihydroxylation_of_Alkenes
/*
PROTONATE nonhydroxyl oxygen
BREAK bond
HYDRATE
DEPROTONATE nonhydroxyl oxygen

[OH3]
[O]
""
O
[OH3]
*/
const oxydanium = MoleculeFactory("[OH3+]")
VMolecule([isobutene_oxide,1]).canonicalSMILES().should.be.equal("CC4(C)CO4")

const antidihydroxlation_test_step1 = CommandTest("PROTONATE nonhydroxyl oxygen",
    _.cloneDeep([isobutene_oxide,1]), _.cloneDeep([oxydanium,1]))
VMolecule(antidihydroxlation_test_step1[0]).canonicalSMILES().should.be.equal("CC4(C)C[O+]4") // correct

const antidihydroxlation_test_step2 = CommandTest("BREAK bond",
    _.cloneDeep(antidihydroxlation_test_step1[0]))
VMolecule(antidihydroxlation_test_step2[0]).canonicalSMILES().should.be.equal("C[C+](C)CO") // not correct

const antidihydroxlation_test_step3 = CommandTest("HYDRATE",
    _.cloneDeep(antidihydroxlation_test_step2[0]), _.cloneDeep([water,1]))
VMolecule(antidihydroxlation_test_step3[0]).canonicalSMILES().should.be.oneOf(["CC([O+])(C)CO", "CC(C)([O+])CO"])

const antidihydroxlation_test_step4 = CommandTest("DEPROTONATE nonhydroxyl oxygen",
    _.cloneDeep(antidihydroxlation_test_step3[0]), _.cloneDeep([water,1]))
VMolecule(antidihydroxlation_test_step4[0]).canonicalSMILES().should.be.oneOf(["CC(O)(C)CO","CC(C)(O)CO"])


// OXYMERCURATION - DEMERCURATION
// https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(Wade)/09%3A_Reactions_of_Alkenes/9.05%3A_Hydration_by_Oxymercuration-Demercuration
/*
Notice that overall, the oxymercuration - demercuration mechanism follows Markovnikov's Regioselectivity with the OH group attached to the most substituted carbon and the H attached to the least substituted carbon. The reaction is useful, because strong acids are not required and carbocation rearrangements are avoided because no discreet carbocation intermediate forms.
 */
// https://www.masterorganicchemistry.com/2011/08/12/reagent-friday-sodium-borohydride-nabh4/#:~:text=What%20it's%20used%20for%3A%20Sodium,aldehydes%20and%20ketones%20to%20alcohols.
// https://www.chemistrysteps.com/oxymercuration-demercuration/
// Mecury has a positive charge
// BREAK double carbon bond
// HYDRATE most substituted carbon
const mercuriacetate = MoleculeFactory("[Hg+](O[Ac])")
VMolecule([mercuriacetate,1]).canonicalSMILES().should.be.equal("[Hg+]O[Ac]")
const isobutene = MoleculeFactory("CC(C)C=C")

console.log('mercuriacetate')
console.log(VMolecule([mercuriacetate,1]).compressed())
// "Protonate", using the mercury atom, the least substituted carbon
const oxymercuration_demercuration_step1 = CommandTest("BREAK double carbon bond", [isobutene,1], [mercuriacetate,1])
console.log('oxymercuration_demercuration_step1 (BREAK double carbon bond)')
console.log(VMolecule(oxymercuration_demercuration_step1[0]).compressed())

console.log('oxymercuration_demercuration_step2 (BOND metal)')
const oxymercuration_demercuration_step2 = CommandTest("BOND metal", oxymercuration_demercuration_step1[0])
console.log(VMolecule(oxymercuration_demercuration_step2[0]).compressed())

const oxymercuration_demercuration_step3 = CommandTest("HYDRATE most substituted carbon", oxymercuration_demercuration_step2[0], [water,1])
console.log('oxymercuration_demercuration_step3 (HYDRATE most substituted carbon)')
console.log(VMolecule(oxymercuration_demercuration_step3[0]).compressed())


const oxymercuration_demercuration_step4 = CommandTest("BREAK metal bond", oxymercuration_demercuration_step3[0])
console.log('oxymercuration_demercuration_step4 (BREAK metal bond)')
console.log(VMolecule(oxymercuration_demercuration_step4[0]).compressed())


const oxymercuration_demercuration_step5 = CommandTest("REMOVE proton from water", _.cloneDeep(oxymercuration_demercuration_step4[0]), _.cloneDeep([water,1]))
console.log('oxymercuration_demercuration_step5 (REMOVE proton from water)')
console.log(VMolecule(oxymercuration_demercuration_step5[0]).compressed())


const oxymercuration_demercuration_step6 = CommandTest("DEMERCURIFY", _.cloneDeep(oxymercuration_demercuration_step5[0]))
console.log('oxymercuration_demercuration_step6 (DEMERCURIFY)')
console.log(VMolecule(oxymercuration_demercuration_step6[0]).compressed())


// Reversal - remercurify
const oxymercuration_demercuration_step6_reversed = CommandTest("REMERCURIFY", _.cloneDeep(oxymercuration_demercuration_step6[0]))
console.log('oxymercuration_demercuration_step6_reversed (REMERCURIFY)')
console.log(VMolecule(oxymercuration_demercuration_step6_reversed[0]).compressed())


// Reversal - readd proton to hyroxyl group
const oxymercuration_demercuration_step5_reversed = CommandTest("ADD proton to hydroxyl group", _.cloneDeep(oxymercuration_demercuration_step6_reversed[0]), _.cloneDeep([water,1]))
console.log('oxymercuration_demercuration_step5_reversed (ADD proton to hydroxyl group)')
console.log(VMolecule(oxymercuration_demercuration_step5_reversed[0]).compressed())

// Reversal - dehydrate
const oxymercuration_demercuration_step4_reversed = CommandTest("DEHYDRATE", _.cloneDeep(oxymercuration_demercuration_step5_reversed[0]))
console.log('oxymercuration_demercuration_step4_reversed (DEHYDRATE)')
console.log(VMolecule(oxymercuration_demercuration_step4_reversed[0]).compressed())


// Reversal - bond hg to carbon
const oxymercuration_demercuration_step3_reversed = CommandTest("BOND metal", _.cloneDeep(oxymercuration_demercuration_step4_reversed[0]))
console.log('oxymercuration_demercuration_step3_reversed (BOND metal)')
console.log(VMolecule(oxymercuration_demercuration_step3_reversed[0]).compressed())

// Reversal - remove hg bond
const oxymercuration_demercuration_step2_reversed = CommandTest("BREAK metal bond", _.cloneDeep(oxymercuration_demercuration_step3_reversed[0]))
console.log('oxymercuration_demercuration_step2_reversed (BREAK metal bond)')
console.log(VMolecule(oxymercuration_demercuration_step2_reversed[0]).compressed())

// Reversal - bond hg to carbon
const oxymercuration_demercuration_step1_reversed = CommandTest("REMOVE metal", _.cloneDeep(oxymercuration_demercuration_step2_reversed[0]))
console.log('oxymercuration_demercuration_step2_reversed (REMOVE metal)')
console.log(VMolecule(oxymercuration_demercuration_step1_reversed[0]).compressed())

//process.exit()


// Saponification
/*
{
    "_id": {
        "$oid": "5dc78ffe5f099c87386137d9"
    },
    "commands": [
    "PROTONATE oxygen on double bond" - protonate =O (nucleophile) using H from oxydanium  [OH3+]. =O should now have a positive charge. O on oxydanium should have no charge.
    "BREAK carbon oxygen double bond" - C=O bond breaks. C atom should now have a + charge (electrophile). =O atom should have no charge.
    "HYDRATE" O atom on water attacks the C atom on the former C=O bond. O atom from water should now have positive charge.
    "proton transfer" Proton on O atom from water transfers to other O, giving that O a positive charge
    "BREAK bond" - C-O+ breaks forming alcohol leaving group. C atom should now have positive charge (electrophile)
    "BOND atoms" - O atom on O-C+ bond attacks C+ atom, forming double bond and creating a carboxylic acid.
    ],
    "description": "",
    "links": [
    "https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(Smith)/Chapter_22%3A_Carboxylic_Acids_and_Their_Derivatives—_Nucleophilic_Acyl_Substitution/22.11%3A_Reactions_of_Esters",
    "https://en.m.wikipedia.org/wiki/Carboxylate",
    "https://www.sciencedirect.com/topics/chemistry/carboxylic-ester",
    "https://www.angelo.edu/faculty/kboudrea/index_2353/Chapter_05_2SPP.pdf"],
    "step": "",
    "catalyst": "[Na][OH-]",
    "parent mechanism": [""],
    "mechanism": "Saponification",
    "substrate": {
        "functional group": "carboxylate ester"
    },
    "reagents": ["[OH3+]", "", "", "", "", "", ""],
    "products": ["carboxylate acid", "alcohol"]
}
 */
//const hydroxide =  MoleculeFactory("[OH3+]")
// oxydanium
// Carboxylic acids are weak organic acids which contain the carboxyl group (RC(=O)OH):
// Esters
// • An ester (“carboxylic ester” in the textbook) is derivative of a carboxylic acid in which there is a
// carbon group connected to the single-bonded oxygen:
// CC(=O)O (acetic acid)
// CC(=O)OC

console.log('Carboxylic ester')
console.log(VMolecule([carboxylic_ester,1]).compressed())
const carboxylic_acid_step1 = CommandTest("PROTONATE oxygen on double bond", _.cloneDeep([carboxylic_ester,1]), _.cloneDeep([oxydanium,1]))
console.log('carboxylic_acid_step1 PROTONATE oxygen on double bond')
console.log(VMolecule(carboxylic_acid_step1[0]).compressed())

const carboxylic_acid_step2 = CommandTest("BREAK carbon oxygen double bond", _.cloneDeep(carboxylic_acid_step1[0]))
console.log('carboxylic_acid_step2 BREAK carbon oxygen double bond')
console.log(VMolecule(carboxylic_acid_step2[0]).compressed())

const carboxylic_acid_step3 = CommandTest("HYDRATE", _.cloneDeep(carboxylic_acid_step2[0]), _.cloneDeep([water,1]))
console.log('carboxylic_acid_step3 HYDRATE')
console.log(VMolecule(carboxylic_acid_step3[0]).compressed())

const carboxylic_acid_step4 = CommandTest("TRANSFER oxygen proton to oxygen", _.cloneDeep(carboxylic_acid_step3[0]))
console.log('carboxylic_acid_step4 TRANSFER oxygen proton to oxygen')
console.log(VMolecule(carboxylic_acid_step4[0]).compressed())

const carboxylic_acid_step5 = CommandTest("BREAK bond", _.cloneDeep(carboxylic_acid_step4[0]))
console.log('carboxylic_acid_step5 BREAK bond')
console.log(VMolecule(carboxylic_acid_step5[0]).compressed())

const carboxylic_acid_step6 = CommandTest("MAKE oxygen carbon double bond", _.cloneDeep(carboxylic_acid_step5[0]))
console.log('carboxylic_acid_step6 MAKE oxygen carbon double bond')
console.log(VMolecule(carboxylic_acid_step6[0]).compressed())

const carboxylic_acid_step6_reversed = CommandTest("MAKE oxygen carbon double bond [reverse]", _.cloneDeep(carboxylic_acid_step6[0]))
console.log('carboxylic_acid_step6 MAKE oxygen carbon double bond [reverse]')
console.log(VMolecule(carboxylic_acid_step6_reversed[0]).compressed())

const alcohol = MoleculeFactory("NO")
const carboxylic_acid_step5_reversed = CommandTest("BOND reagent to substrate",_.cloneDeep(carboxylic_acid_step6_reversed[0]),  _.cloneDeep([alcohol,1]) )
console.log('carboxylic_acid_step5 reversed bond alcohol with carbon')
console.log(VMolecule(carboxylic_acid_step5_reversed[0]).compressed())

const carboxylic_acid_step4_reversed = CommandTest("TRANSFER oxygen proton to oxygen", _.cloneDeep(carboxylic_acid_step5_reversed[0]))
console.log('carboxylic_acid_step4 reversed TRANSFER oxygen proton to oxygen')
console.log(VMolecule(carboxylic_acid_step4_reversed[0]).compressed())

console.log('carboxylic_acid_step3 reversed DEHYDRATE')
const carboxylic_acid_step3_reversed = CommandTest("DEHYDRATE", _.cloneDeep(carboxylic_acid_step4_reversed[0]))
console.log(VMolecule(carboxylic_acid_step3_reversed[0]).compressed())

const carboxylic_acid_step2_reversed = CommandTest("BREAK carbon oxygen double bond [reverse]", _.cloneDeep(carboxylic_acid_step3_reversed[0]))
console.log('carboxylic_acid_step2 reversed BREAK carbon oxygen double bond [reverse]')
console.log(VMolecule(carboxylic_acid_step2_reversed[0]).compressed())

const carboxylic_acid_step1_reversed = CommandTest("DEPROTONATE oxygen on double bond", _.cloneDeep(carboxylic_acid_step2_reversed[0]))
console.log('carboxylic_acid_step1 reversed DEPROTONATE oxygen on double bond')
console.log(VMolecule(carboxylic_acid_step1_reversed[0]).compressed())

/*
Saponification
{
    "_id": {
    "$oid": "5dc78ffe5f099c87386137d9"
},
    "commands": [
    "BREAK carbon oxygen double bond" - C=O bond breaks. C atom should now have a + charge (electrophile). =O atom should have negative charge.
    "BOND atoms - O atom on reagent [OH-] (nucleophile) attacks C+ atom on substrate.
    "MAKE oxygen carbon double bond" O- atom attacks the C atom on the former C=O bond. O atom should now have no charge. Carbon atom should have negative charge (nucleophile).
    "BREAK bond" - C-OR breaks forming leaving group. O atom on OR should have negative charge.
    "DEPRONTONATE" O- atom (nucleophile) on O-R attacks proton on O on substrate. O atom on substrate should now have a negative charge. O atom on
    C-R  should now have no charge.


],
    "description": "",
    "links": [
    "https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(Smith)/Chapter_22%3A_Carboxylic_Acids_and_Their_Derivatives—_Nucleophilic_Acyl_Substitution/22.11%3A_Reactions_of_Esters",
    "https://en.m.wikipedia.org/wiki/Carboxylate",
    "https://www.sciencedirect.com/topics/chemistry/carboxylic-ester",
    "https://www.angelo.edu/faculty/kboudrea/index_2353/Chapter_05_2SPP.pdf"],
    "step": "",
    "catalyst": "[Na][OH-]",
    "parent mechanism": [""],
    "mechanism": "Saponification",
    "substrate": {
    "functional group": "carboxylate ester"
},
    "reagents": ["[OH3+]", "", "", "", "", "", ""],
    "products": ["carboxylate acid", "alcohol"]
}
*/



console.log(VMolecule([hydroxide_ion,1]).compressed())


// Expoxide ring opening via methoxide
// https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(McMurry)/Chapter_18%3A_Ethers_and_Epoxides%3B_Thiols_and_Sulfides/18.06_Reactions_of_Epoxides%3A_Ring-opening
// substrate = isobutene_oxide
// reagent [O-]CH3 (NaOCH3)
// BOND atoms: O- (nucleophile) of reagent attacks the least substituted carbon of the substrate.
// BREAK bond: C-O bond of the attacked carbon breaks. Oxygen atom should now have a negative charge.
// PROTONATE: O- of substrate attacks proton on reagent (OCH3)
const methoxide = MoleculeFactory("[O-]C")
console.log("isobutene oxide (substrate)")
console.log(VMolecule([isobutene_oxide,1]).compressed())
console.log("methoxide (reagent)")
console.log(VMolecule([methoxide,1]).compressed())
console.log("epoxide ring opening via methoxide step 1 - BOND substrate to reagent - O- (nucleophile) of reagent attacks the least substituted carbon of the substrate.")
const expoxide_ring_opening_via_methoxide_step1 = CommandTest("BOND substrate to reagent", _.cloneDeep([isobutene_oxide,1]), _.clone([methoxide,1]))
console.log(VMolecule(expoxide_ring_opening_via_methoxide_step1[0]).compressed())
console.log("epoxide ring opening via methoxide step 2 - BREAK bond - C-O epoxide bond of the attacked carbon breaks. Oxygen atom should now have a negative charge.")
const expoxide_ring_opening_via_methoxide_step2 = CommandTest("BREAK bond", _.cloneDeep(expoxide_ring_opening_via_methoxide_step1[0]))
console.log(VMolecule(expoxide_ring_opening_via_methoxide_step2[0]).compressed())
console.log("epoxide ring opening via methoxide step 3 - PROTONATE - O- of substrate attacks proton on reagent (OCH3)")
const expoxide_ring_opening_via_methoxide_step3 = CommandTest("PROTONATE", _.cloneDeep(expoxide_ring_opening_via_methoxide_step2[0]), _.cloneDeep([methanol,1]))
console.log(VMolecule(expoxide_ring_opening_via_methoxide_step3[0]).compressed())

console.log("epoxide ring opening via methoxide step 3 reversed - DEPROTONATE")
const epoxide_ring_opening_via_methoxide_step3_reversed = CommandTest("DEPROTONATE", _.cloneDeep(expoxide_ring_opening_via_methoxide_step3[0]), _.cloneDeep([methanol,1]))
console.log(VMolecule(epoxide_ring_opening_via_methoxide_step3_reversed[0]).compressed())

console.log("epoxide ring opening via methoxide step 2 reversed - BREAK bond reversed - O- bonds to carbon")
const epoxide_ring_opening_via_methoxide_step2_reversed = CommandTest("BREAK bond reversed", _.cloneDeep(epoxide_ring_opening_via_methoxide_step3_reversed[0]), null, {'mechanism':'Epoxide ring opening via methoxide'})
console.log(VMolecule(epoxide_ring_opening_via_methoxide_step2_reversed[0]).compressed())

console.log("epoxide ring opening via methoxide step 1 reversed - REMOVE methanol  - remove OC group")
const epoxide_ring_opening_via_methoxide_step1_reversed = CommandTest("REMOVE methanol", _.cloneDeep(epoxide_ring_opening_via_methoxide_step2_reversed[0]), null, {'mechanism':'Epoxide ring opening via methoxide'})
console.log(VMolecule(epoxide_ring_opening_via_methoxide_step1_reversed[0]).compressed())

// AMINES
// mechanism: Leukart Wallach reaction
// https://en.wikipedia.org/wiki/Leuckart_reaction
// Substrate is either aldehyde or ketone
// Reagent is either ammonium formate or formamide
const ammonium_formate = MoleculeFactory("C(=O)[O-].[NH4+]")
// ammonium formate dissassociates into formic acid and ammonia
const formic_acid = MoleculeFactory("C(=O)O")
const ammonia = MoleculeFactory("N") // NH3
const propionaldehyde = MoleculeFactory("CCC=O") // aldehyde (substrate)

// 1. N atom on ammonia (nucleophile) attacks carbonyl carbon (C=O) on substrate, attaching itself to the carbon
// 2. C=O bond breaks and forms a CO bond. O atom should now be negatively charged.
// 3. O atom (nucleophile) deprotonates N atom.
// 4. O atom is protonated using OH hydrogen from formic acid (reagent). O should now have a positive charge.
// 5. OC bond breaks, creating a water leaving group. Carbon atom should now have a positive charge.
// 6. Carbon deprotonates deprotonated formic acid.
// 7. CO bond on deprotonated formic acid forms double bond to create carbon dioxide.
/*
        "BOND substrate to reagent": BondSubstrateToReagent, // Important:
        // The reagent is the nucleophile and is attacking the substrate
        // The substrate is the electrophile
 */
console.log("Leukart Wallach reaction - BOND substrate to reagent - N atom on ammonia (nucleophile) attacks carbonyl carbon (C=O) on substrate, attaching itself to the carbon")
const leukart_wallach_reaction_step1 = CommandTest("BOND substrate to reagent", _.cloneDeep([acetone,1]), [ammonia,1])
console.log(VMolecule(leukart_wallach_reaction_step1[0]).compressed())


console.log("Leukart Wallach reaction - BREAK carbon oxygen double bond - C=O bond breaks and forms a CO bond. O atom should now be negatively charged. N should be + charged.")
const leukart_wallach_reaction_step2 = CommandTest("BREAK carbon oxygen double bond", _.cloneDeep(leukart_wallach_reaction_step1[0]))
console.log(VMolecule(leukart_wallach_reaction_step2[0]).compressed())

console.log("Leukart Wallach reaction - TRANSFER proton - O atom (nucleophile) is protonated by N atom.")
const leukart_wallach_reaction_step3 = CommandTest("TRANSFER proton", _.cloneDeep(leukart_wallach_reaction_step2[0]))
console.log(VMolecule(leukart_wallach_reaction_step3[0]).compressed())

console.log('Formic acid')
console.log(VMolecule([formic_acid,1]).compressed())
console.log("Leukart Wallach reaction - PROTONATE - O atom is protonated using OH hydrogen from formic acid (reagent). O should now have a positive charge. O atom on formic acid should have negative charge.")
const leukart_wallach_reaction_step4 = CommandTest("ADD proton to hydroxyl group", _.cloneDeep(leukart_wallach_reaction_step3[0]), _.cloneDeep([formic_acid, 1]))
console.log(VMolecule(leukart_wallach_reaction_step4[0]).compressed())
console.log('Deprotonated formic acid')
console.log(VMolecule(leukart_wallach_reaction_step4[1]).compressed())
const deprotonated_formic_acid = leukart_wallach_reaction_step4[1][0]

console.log("Leukart Wallach reaction - DEHYDRATE - OC bond breaks, creating a water leaving group. Carbon atom should now have a positive charge.")
const leukart_wallach_reaction_step5 = CommandTest("DEHYDRATE", _.cloneDeep(leukart_wallach_reaction_step4[0]))
console.log(VMolecule(leukart_wallach_reaction_step5[0]).compressed())

console.log("Leukart Wallach reaction - ADD proton to substrate - Deprotonated formic acid protonates carbon atom. Carbon atom on formic acid should have positive charge.")
const leukart_wallach_reaction_step6 = CommandTest("ADD proton to substrate", _.cloneDeep(leukart_wallach_reaction_step5[0]), _.cloneDeep([deprotonated_formic_acid,1]))
console.log(VMolecule(leukart_wallach_reaction_step6[0]).compressed())
console.log(VMolecule(leukart_wallach_reaction_step6[1]).compressed())

console.log("Leukart Wallach reaction - MAKE oxygen carbon double bond - CO bond on deprotonated formic acid forms double bond to create carbon dioxide.")
const leukart_wallach_reaction_step7 = CommandTest("MAKE oxygen carbon double bond", _.cloneDeep(leukart_wallach_reaction_step6[1]))
console.log(VMolecule(leukart_wallach_reaction_step7[0]).compressed())

const carbon_dioxide = leukart_wallach_reaction_step7[0][0]


console.log("Leukart Wallach reaction step 6 reversed - ADD proton to reagent - add proton from carbon atom on substrate to carbon atom on reagent")
const leukart_wallach_reaction_step6_reversed = CommandTest("ADD proton to reagent", _.cloneDeep(leukart_wallach_reaction_step6[0]), [carbon_dioxide, 1])
console.log(VMolecule(leukart_wallach_reaction_step6_reversed[0]).compressed())
console.log(VMolecule(leukart_wallach_reaction_step6_reversed[1]).compressed())

console.log("Leukart Wallach reaction step 5 reversed - HYDRATE")
const leukart_wallach_reaction_step5_reversed = CommandTest("HYDRATE", _.cloneDeep(leukart_wallach_reaction_step6_reversed[0]), _.cloneDeep([water,1]))
console.log(VMolecule(leukart_wallach_reaction_step5_reversed[0]).compressed())
console.log(VMolecule([deprotonated_formic_acid, 1]).compressed())


console.log("Leukart Wallach reaction step 4 reversed - REMOVE proton from water - remove hydrogen from water group")
const leukart_wallach_reaction_step4_reversed = CommandTest("REMOVE proton from water", _.cloneDeep(leukart_wallach_reaction_step5_reversed[0]), _.cloneDeep([deprotonated_formic_acid,1]))
console.log(VMolecule(leukart_wallach_reaction_step4_reversed[0]).compressed())

// mechanism "Leukart Wallach reaction"
console.log("Leukart Wallach reaction step 3 reversed - TRANSFER proton - oxygen atom protonates N. N should now be + charged and O atom should be - charged.")
const leukart_wallach_reaction_step3_reversed = CommandTest("TRANSFER proton [reverse]", _.cloneDeep(leukart_wallach_reaction_step4_reversed[0]), null, {'mechanism':'Leukart Wallach reaction'})
console.log(VMolecule(leukart_wallach_reaction_step3_reversed[0]).compressed())


console.log("Leukart Wallach reaction step 2 reversed - MAKE oxygen carbon double bond. Carbon should have a negative charge.")
const leukart_wallach_reaction_step2_reversed = CommandTest("MAKE oxygen carbon double bond", _.cloneDeep(leukart_wallach_reaction_step3_reversed[0]))
console.log(VMolecule(leukart_wallach_reaction_step2_reversed[0]).compressed())

console.log("Leukart Wallach reaction step 1 reversed - BREAK bond - break N-C bond, creating ammonia leaving group")
const leukart_wallach_reaction_step1_reversed = CommandTest("BREAK bond", _.cloneDeep(leukart_wallach_reaction_step2_reversed[0]))
console.log(VMolecule(leukart_wallach_reaction_step1_reversed[0]).compressed())


const formamide = MoleculeFactory("C(=O)N")
console.log('acetone (substrate)')
console.log(VMolecule([acetone,1]).compressed())
console.log('formamide (reagent)')
console.log(VMolecule([formamide,1]).compressed())

console.log("Leukart Wallach reaction (formamide) - BOND substrate to reagent - N atom on formamide (nucleophile) attacks carbonyl carbon (C=O) on substrate, attaching itself to the carbon. N atom should be positively charged. C should have negative charge.")
const leukart_wallach_reaction_formamide_step1 = CommandTest("BOND substrate to reagent", _.cloneDeep([acetone,1]), [formamide,1])
console.log(VMolecule(leukart_wallach_reaction_formamide_step1[0]).compressed())

console.log("Leukart Wallach reaction (formamide) - BREAK carbon oxygen double bond - C=O bond on acetone breaks. O atom should be negatively charged. C atom should now have no charge. Note: Make sure correct C=O bond breaks.")
const leukart_wallach_reaction_formamide_step2 = CommandTest("BREAK carbon oxygen double bond", _.cloneDeep(leukart_wallach_reaction_formamide_step1[0]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step2[0]).compressed())

console.log("Leukart Wallach reaction (formamide) - TRANSFER proton - Proton transfers from N to O-. N atom should have no charge. O atom should have no charge.")
const leukart_wallach_reaction_formamide_step3 = CommandTest("TRANSFER proton", _.cloneDeep(leukart_wallach_reaction_formamide_step2[0]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step3[0]).compressed())

console.log("Leukart Wallach reaction (formamide) - TRANSFER proton - Proton transfers from N to OH. N atom should be negatively charged. O atom should be positively charged.")
const leukart_wallach_reaction_formamide_step4 = CommandTest("TRANSFER proton", _.cloneDeep(leukart_wallach_reaction_formamide_step3[0]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step4[0]).compressed())


console.log("Leukart Wallach reaction (formamide) - DEHYDRATE - water group leaves. C atom should have a positive charge.")
const leukart_wallach_reaction_formamide_step5 = CommandTest("DEHYDRATE", _.cloneDeep(leukart_wallach_reaction_formamide_step4[0]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step5[0]).compressed())


console.log("Leukart Wallach reaction (formamide) -BREAK carbon oxygen double bond. C atom should have + charge. O atom should have negative charge. N should have double bond")
const leukart_wallach_reaction_formamide_step6 = CommandTest("BREAK carbon oxygen double bond", _.cloneDeep(leukart_wallach_reaction_formamide_step5[0]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step6[0]).compressed())


const formate = MoleculeFactory("C(=O)[O-]")
console.log('formate')
console.log(VMolecule([formate, 1]).compressed())
console.log("Leukart Wallach reaction (formamide) - BOND substrate to reagent - Bond O (nucleophile) on reagent to C+ (electrophile) on substrate. C atom and O atom should now have no charge")
const leukart_wallach_reaction_formamide_step7 = CommandTest("BOND substrate to reagent", _.cloneDeep(leukart_wallach_reaction_formamide_step6[0]), _.cloneDeep([formate,1]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step7[0]).compressed())

console.log("Leukart Wallach reaction (formamide) - HYDRIDE shift")
const leukart_wallach_reaction_formamide_step8 = CommandTest("HYDRIDE shift", _.cloneDeep(leukart_wallach_reaction_formamide_step7[0]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step8[0]).compressed())
console.log(VMolecule(leukart_wallach_reaction_formamide_step8[2][0]).compressed()) // carbon dioxide

// const protonated_ether_products_methylated_deprotonated = CommandTest("PROTONATE nonhydroxyl oxygen", _.cloneDeep(protonated_ether_products_methylated[0]),
//     _.cloneDeep([methanol,1]))
// const result = reaction.addProtonFromReagentToNonHydroxylGroup()
console.log("Leukart Wallach reaction (formamide) - PROTONATE nonhydroxyl oxygen. All atoms should now have no charge")
const leukart_wallach_reaction_formamide_step9 = CommandTest("PROTONATE nonhydroxyl oxygen", _.cloneDeep(leukart_wallach_reaction_formamide_step8[0]), _.cloneDeep([ammonium,1]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step9[0]).compressed())

console.log("Leukart Wallach reaction (formamide) - HYROLYSIS")
const leukart_wallach_reaction_formamide_step10 = CommandTest("HYDROLYSISE", _.cloneDeep(leukart_wallach_reaction_formamide_step9[0]), _.cloneDeep([water,1]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step10[0]).compressed())


console.log("Leukart Wallach reaction (formamide) - HYDROLYSIS reverse")
const leukart_wallach_reaction_formamide_step10_reverse = CommandTest("HYDROLYSISE reverse", _.cloneDeep(leukart_wallach_reaction_formamide_step10[0]), _.cloneDeep([methanol,1]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step10_reverse[0]).compressed())

console.log("Leukart Wallach reaction (formamide) -  step 9 (before reversal)")
console.log(VMolecule(leukart_wallach_reaction_formamide_step9[0]).compressed())
console.log("Leukart Wallach reaction (formamide) -  step 9 (reversed) DEPROTONATE hydroxyl oxygen")
const leukart_wallach_reaction_formamide_step9_reverse = CommandTest("DEPROTONATE hydroxyl oxygen", _.cloneDeep(leukart_wallach_reaction_formamide_step9[0]), _.cloneDeep([ammonia,1]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step9_reverse[0]).compressed())

console.log("Leukart Wallach reaction (formamide) -  step 8 (reversed) HYDRIDE shift on carbon nitrogen bond reverse")
const leukart_wallach_reaction_formamide_step8_reverse = CommandTest("HYDRIDE shift on carbon nitrogen bond reverse", _.cloneDeep(leukart_wallach_reaction_formamide_step9_reverse[0]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step8_reverse[0]).compressed())

console.log("Leukart Wallach reaction (formamide) -  step 7 (reversed) REMOVE formate group")
const leukart_wallach_reaction_formamide_step7_reverse = CommandTest("REMOVE formate group", _.cloneDeep(leukart_wallach_reaction_formamide_step8_reverse[0]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step7_reverse[0]).compressed())

console.log("Leukart Wallach reaction (formamide) -  step 6 (reversed) MAKE carbon oxygen double bond. C atom should have no charge. O atom should have no charge. N should have negative bond")
const leukart_wallach_reaction_formamide_step6_reverse = CommandTest("MAKE oxygen carbon double bond", _.cloneDeep(leukart_wallach_reaction_formamide_step7_reverse[0]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step6_reverse[0]).compressed())

console.log("Leukart Wallach reaction (formamide) -  step 5 (reversed) HYDRATE - add water group to C+")
const leukart_wallach_reaction_formamide_step5_reverse = CommandTest("HYDRATE", _.cloneDeep(leukart_wallach_reaction_formamide_step6_reverse[0]), _.cloneDeep([water,1]))
console.log(VMolecule(leukart_wallach_reaction_formamide_step5_reverse[0]).compressed())

console.log("Leukart Wallach reaction (formamide) -  step 4 (reversed) TRANSFER proton - Proton transfers from OH to N. N atom should have no charge. O atom should have no charge.")
const leukart_wallach_reaction_formamide_step4_reverse = CommandTest("TRANSFER proton [reverse]", _.cloneDeep(leukart_wallach_reaction_formamide_step5_reverse[0]), null, {'mechanism':'Leukart Wallach reaction'})
console.log(VMolecule(leukart_wallach_reaction_formamide_step4_reverse[0]).compressed())

console.log("Leukart Wallach reaction (formamide) -  step 3 (reversed)  TRANSFER proton - Proton transfers from O to N. N atom should have positive charge. O atom should have negative charge.")
const leukart_wallach_reaction_formamide_step3_reverse = CommandTest("TRANSFER proton [reverse]", _.cloneDeep(leukart_wallach_reaction_formamide_step4_reverse[0]), null, {'mechanism':'Leukart Wallach reaction'})
console.log(VMolecule(leukart_wallach_reaction_formamide_step3_reverse[0]).compressed())

console.log("Leukart Wallach reaction (formamide) -  step 2 (reversed) MAKE oxygen carbon double bond. N should be positively charged.  Note: Make sure correct C=O bond breaks.")
const leukart_wallach_reaction_formamide_step2_reverse = CommandTest("MAKE oxygen carbon double bond", _.cloneDeep(leukart_wallach_reaction_formamide_step3_reverse[0]), null, {'mechanism':'Leukart Wallach reaction'})
console.log(VMolecule(leukart_wallach_reaction_formamide_step2_reverse[0]).compressed())

console.log("Leukart Wallach reaction (formamide) -  step 1 (reversed) BOND substrate to reagent - N atom on formamide (nucleophile) attacks carbonyl carbon (C=O) on substrate, attaching itself to the carbon. N atom should be positively charged. C should have negative charge.")
const leukart_wallach_reaction_formamide_step1_reverse = CommandTest("REMOVE formamide group", _.cloneDeep(leukart_wallach_reaction_formamide_step2_reverse[0]), null, {'mechanism':'Leukart Wallach reaction'})
console.log(VMolecule(leukart_wallach_reaction_formamide_step1_reverse[0]).compressed())
console.log(VMolecule(leukart_wallach_reaction_formamide_step1_reverse[2][0]).compressed())


// Pinacol rearrangement
// substrate 1,2 Diol
// https://en.wikipedia.org/wiki/Pinacol_rearrangement
// reagents: strong acid
const pinacol = MoleculeFactory("CC(C)(C(C)(C)O)O")
const strong_acid = MoleculeFactory("OS(=O)(=O)O") // sulphuric acid
const deprotonated_strong_acid = MoleculeFactory("[O-]S(=O)(=O)O")

// Steps
// 1. Protonation of one of the OH groups (this will be the group that creates the most stable carbocation (@todo))
// 2. Protonated OH group (water) leaves. Carbon that was attached to the protonated OH group should now have a positive charge.
// 3. Methyl group attached to C atom attached to C+ atom shifts to C+ atom. C atom that was attached to methyl group should now have a positive charge. C+ atom should now have positive charge.
// 4. O atom on positively charged C forms double bond.
// Reversal
// 4. Change C=O bond to CO bond. C atom should have positive charge.
// 3. Methyl group attached to C atom attached to C+ atom shifts to C+ atom. C atom that was attached to methyl group should now have a positive charge. C+ atom should now have positive charge.
// 2. Hydrate C+ atom.
// 1. Deprotonate water group.

console.log('Pinacol:')
console.log(VMolecule([pinacol,1]).compressed())

console.log("Pinacol rearrangement -  step 1 Protonation of one of the OH groups (this will be the group that creates the most stable carbocation). O atom should now have positive charge.")
const pinacol_rearrangement_step1 = CommandTest("PROTONATE hydroxyl group", _.cloneDeep([pinacol,1]), _.cloneDeep([strong_acid,1]))
console.log(VMolecule(pinacol_rearrangement_step1[0]).compressed())

//process.exit()

console.log("Pinacol rearrangement -  step 2 Protonated OH group (water) leaves. Carbon that was attached to the protonated OH group should now have a positive charge.")
const pinacol_rearrangement_step2 = CommandTest("DEHYDRATE", _.cloneDeep(pinacol_rearrangement_step1[0]))
console.log(VMolecule(pinacol_rearrangement_step2[0]).compressed())

//process.exit()

console.log("Pinacol rearrangement -  step 3  Methyl group attached to C atom attached to C+ atom shifts to C+ atom. C atom that was attached to methyl group should now have a positive charge. C+ atom should now have no charge.")
const pinacol_rearrangement_step3 = CommandTest("CARBOCATION shift", _.cloneDeep(pinacol_rearrangement_step2[0]))
console.log(VMolecule(pinacol_rearrangement_step3[0]).compressed())


console.log("Pinacol rearrangement -  step 4  O atom on positively charged C forms double bond. There should be no charges on any of the atoms.")
const pinacol_rearrangement_step4 = CommandTest("MAKE oxygen carbon double bond", _.cloneDeep(pinacol_rearrangement_step3[0]))
console.log(VMolecule(pinacol_rearrangement_step4[0]).compressed())


console.log("Pinacol rearrangement -  step 4 reversed. Reverse C=O bond. C atom attached to O should have positive charge.")
const pinacol_rearrangement_step4_reversed = CommandTest("MAKE oxygen carbon double bond [reverse]", _.cloneDeep(pinacol_rearrangement_step4[0]), null, {"mechanism":"pinacol rearrangement"})
console.log(VMolecule(pinacol_rearrangement_step4_reversed[0]).compressed())


console.log("Pinacol rearrangement -  step 3 reversed. Methyl group attached to C atom attached to C+ atom shifts to C+ atom. C atom that was attached to methyl group should now have a positive charge. C+ atom should now have positive charge.")
const pinacol_rearrangement_step3_reversed = CommandTest("CARBOCATION shift", _.cloneDeep(pinacol_rearrangement_step4_reversed[0]))
console.log(VMolecule(pinacol_rearrangement_step3_reversed[0]).compressed())

console.log("Pinacol rearrangement -  step 2 reversed. Hydrate C+ atom.")
const pinacol_rearrangement_step2_reversed = CommandTest("HYDRATE", _.cloneDeep(pinacol_rearrangement_step3_reversed[0]), [_.cloneDeep(water),1])
console.log(VMolecule(pinacol_rearrangement_step2_reversed[0]).compressed())

console.log("Pinacol rearrangement -  step 1 reversed. Deprotonate water group.")
const pinacol_rearrangement_step1_reversed = CommandTest("DEPROTONATE", _.cloneDeep(pinacol_rearrangement_step2_reversed[0]), [_.cloneDeep(deprotonated_strong_acid), 1])
console.log(VMolecule(pinacol_rearrangement_step1_reversed[0]).compressed())


// Ritter Reaction
//https://en.wikipedia.org/wiki/Ritter_reaction
const carbenium_ion = MoleculeFactory("C[C+](C)(C)")
const nitrile = MoleculeFactory("N#CC")
const oxide = MoleculeFactory("[OH3+]")

// Bond N (nucleophile, reagent) to C+ (electrophile, substrate). C should have no charge. N should have positive charge.
// Change N#C triple bond to double bond.
// Hydrate C atom on N#C bond. O atom should have positive charge.
// Change OC bond to O=C bond.
// Change N=C bond to NC bond.
// Break OH bond.
// Protonate nitrogen
// Reversal
// Deprotonate nitrogen
// Protonate oxygen
// Break O=C bond
// Protonate hydroxyl oxygen
// Dehydrate
// Change N=C bond to N#C bond
// Break NC bond.

console.log("Carbenium ion")
console.log(VMolecule([carbenium_ion,1]).compressed())
console.log("Nitrile")
console.log(VMolecule([nitrile,1]).compressed())

console.log("Ritter Reaction -  step 1  Bond nitrogen (nucleophile, reagent) to carbocation C+ (electrophile, substrate). C should have no charge. N should have positive charge.")
const ritter_reaction_step1 = CommandTest("BOND substrate to reagent", [_.cloneDeep(carbenium_ion),1], [_.cloneDeep(nitrile),1])
console.log(VMolecule(ritter_reaction_step1[0]).compressed())


console.log("Ritter Reaction -  step 2 Change N#C triple bond to double bond.")
const ritter_reaction_step2 = CommandTest("BREAK carbon nitrogen triple bond", _.cloneDeep(ritter_reaction_step1[0]))
console.log(VMolecule(ritter_reaction_step2[0]).compressed())


console.log("Ritter Reaction -  step 3 Hydrate C atom on N=C bond. O atom should have positive charge.")
const ritter_reaction_step3 = CommandTest("HYDRATE", _.cloneDeep(ritter_reaction_step2[0]), [_.cloneDeep(water), 1])
console.log(VMolecule(ritter_reaction_step3[0]).compressed())

console.log("Ritter Reaction -  step 4 DEPROTONATE O on water")
const ritter_reaction_step4 = CommandTest("DEPROTONATE", _.cloneDeep(ritter_reaction_step3[0]), [_.cloneDeep(water), 1])
console.log(VMolecule(ritter_reaction_step4[0]).compressed())

console.log("Ritter Reaction -  step 5 PROTONATE nitrogen")
const ritter_reaction_step5 = CommandTest("PROTONATE", _.cloneDeep(ritter_reaction_step4[0]), [_.cloneDeep(oxide), 1])
console.log(VMolecule(ritter_reaction_step5[0]).compressed())

console.log("Ritter Reaction -  step 6 Change OC bond to O=C bond. This will also change N=C bond to NC bond. O should have positive charge. Nitrogen atom should have no charge.")
// This should NOT remove H from the oxygen
const ritter_reaction_step6 = CommandTest("MAKE oxygen carbon double bond", _.cloneDeep(ritter_reaction_step5[0]))
console.log(VMolecule(ritter_reaction_step6[0]).compressed())


process.exit()



console.log("Ritter Reaction -  step 6 reversed DEPROTONATE nitrogen")
const ritter_reaction_step6_reversed = CommandTest("DEPROTONATE", _.cloneDeep(ritter_reaction_step6[0]), [water,1], {"mechanism":"ritter reaction"})
console.log(VMolecule(ritter_reaction_step6_reversed[0]).compressed())

console.log("Ritter Reaction -  step 5 reversed PROTONATE oxygen on double bond")
const ritter_reaction_step5_reversed = CommandTest("PROTONATE oxygen on double bond", _.cloneDeep(ritter_reaction_step6_reversed[0]), [water,1], {"mechanism":"Ritter reaction"})
console.log(VMolecule(ritter_reaction_step5_reversed[0]).compressed())

console.log("Ritter Reaction -  step 4 reversed BREAK carbon oxygen double bond")
// This will also recreate the N=C bond
const ritter_reaction_step4_reversed = CommandTest("BREAK carbon oxygen double bond", _.cloneDeep(ritter_reaction_step5_reversed[0]), null, {"mechanism":"Ritter reaction"})
console.log(VMolecule(ritter_reaction_step4_reversed[0]).compressed())

console.log("Ritter Reaction -  step 3 reversed PROTONATE")
const ritter_reaction_step3_reversed = CommandTest("PROTONATE", _.cloneDeep(ritter_reaction_step4_reversed[0]), null, {"mechanism":"ritter reaction"})
console.log(VMolecule(ritter_reaction_step3_reversed[0]).compressed())

console.log("Ritter Reaction -  step 2 reversed DEHYDRATE")
const ritter_reaction_step2_reversed = CommandTest("DEHYDRATE", _.cloneDeep(ritter_reaction_step3_reversed[0]), null, {"mechanism":"ritter reaction"})
console.log(VMolecule(ritter_reaction_step2_reversed[0]).compressed())

console.log("Ritter Reaction -  step 1 reversed MAKE nitrogen oxygen triple bond")
const ritter_reaction_step1_reversed = CommandTest("MAKE nitrogen carbon triple bond", _.cloneDeep(ritter_reaction_step2_reversed[0]), null, {"mechanism":"Ritter reaction"})
console.log(VMolecule(ritter_reaction_step1_reversed[0]).compressed())

console.log("Ritter Reaction -  step 0 reversed BREAK NC bond")
const ritter_reaction_step0_reversed = CommandTest("BREAK bond", _.cloneDeep(ritter_reaction_step1_reversed[0]), null, {"mechanism":"ritter reaction"})
console.log(VMolecule(ritter_reaction_step0_reversed[0]).compressed())
console.log(VMolecule(ritter_reaction_step0_reversed[2][0]).compressed())



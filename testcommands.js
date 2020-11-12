const should = require('should')
const _ = require('lodash');

const VMolecule = require('./Components/Stateless/Views/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')
const AtomFactory = require('./Models/AtomFactory')
const CAtom = require('./Controllers/Atom')

const CommandTest = require('./Components/Stateless/CommandTest')

const sulphuric_acid = MoleculeFactory("OS(=O)(=O)O")
VMolecule([sulphuric_acid,1]).canonicalSMILES().should.be.oneOf(["OS(O)(=O)=O", "OS(=O)(=O)O"])
const sulphuric_acid_ai = require("./Components/Stateless/MoleculeAI")([sulphuric_acid,1])

const methanol = MoleculeFactory("CO")
VMolecule([methanol,1]).canonicalSMILES().should.be.equal("CO")
const methanol_ai = require("./Components/Stateless/MoleculeAI")([methanol,1])





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
//console.log(VMolecule(twoTwoDimethyloxoniacyclopropane).compressed())
const protonated_ether_products_bond_broken = CommandTest("BREAK bond", _.cloneDeep(twoTwoDimethyloxoniacyclopropane))
const two_methylpropan_1_ol = protonated_ether_products_bond_broken[0]
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
const carboxylic_ester = MoleculeFactory("CC(=O)ON")
console.log('Carboxylic ester')
console.log(VMolecule([carboxylic_ester,1]).compressed())
const saponification_step1 = CommandTest("PROTONATE oxygen on double bond", _.cloneDeep([carboxylic_ester,1]), _.cloneDeep([oxydanium,1]))
console.log('saponification_step1 PROTONATE oxygen on double bond')
console.log(VMolecule(saponification_step1[0]).compressed())

const saponification_step2 = CommandTest("BREAK carbon oxygen double bond", _.cloneDeep(saponification_step1[0]))
console.log('saponification_step2 BREAK carbon oxygen double bond')
console.log(VMolecule(saponification_step2[0]).compressed())

const saponification_step3 = CommandTest("HYDRATE", _.cloneDeep(saponification_step2[0]), _.cloneDeep([water,1]))
console.log('saponification_step3 HYDRATE')
console.log(VMolecule(saponification_step3[0]).compressed())

const saponification_step4 = CommandTest("TRANSFER oxygen proton to oxygen", _.cloneDeep(saponification_step3[0]))
console.log('saponification_step4 TRANSFER oxygen proton to oxygen')
console.log(VMolecule(saponification_step4[0]).compressed())

const saponification_step5 = CommandTest("BREAK bond", _.cloneDeep(saponification_step4[0]))
console.log('saponification_step5 BREAK bond')
console.log(VMolecule(saponification_step5[0]).compressed())

const saponification_step6 = CommandTest("MAKE oxygen carbon double bond", _.cloneDeep(saponification_step5[0]))
console.log('saponification_step6 MAKE oxygen carbon double bond')
console.log(VMolecule(saponification_step6[0]).compressed())


process.exit()
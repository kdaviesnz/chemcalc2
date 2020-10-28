const should = require('should')
const _ = require('lodash');

const VMolecule = require('./Components/Stateless/Views/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')
const AtomFactory = require('./Models/AtomFactory')
const CAtom = require('./Controllers/Atom')

const CommandTest = require('./Components/Stateless/CommandTest')

const sulphuric_acid = MoleculeFactory("OS(=O)(=O)O")
VMolecule([sulphuric_acid,1]).canonicalSMILES().should.be.equal("OS(O)(=O)=O")
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
VMolecule(protonated_products[1]).canonicalSMILES().should.be.equal("[O-]S(O)(=O)=O")


// DEPROTONATE
// See Organic Chemistry 8th Edition p245
const isopropyl_cation = protonated_products[0]
const hydrogen_sulfate = protonated_products[1]
const deprotonated_products = CommandTest("DEPROTONATE", _.cloneDeep(isopropyl_cation), _.cloneDeep(hydrogen_sulfate))
VMolecule(deprotonated_products[1]).canonicalSMILES().should.be.equal("OS(O)(=O)=O")
VMolecule(deprotonated_products[0]).canonicalSMILES().should.be.equal("CC=C")

// HYDRATE
// See Organic Chemistry 8th Edition p245
const isopropyl_cation_ai = require("./Components/Stateless/MoleculeAI")(isopropyl_cation)
isopropyl_cation_ai.findElectrophileIndex().should.be.equal(5)
const water = MoleculeFactory("O")
const hydrated_products = CommandTest("HYDRATE", _.cloneDeep(isopropyl_cation), _.cloneDeep([water,1]))
VMolecule(hydrated_products[0]).canonicalSMILES().should.be.equal("CC([O+])C")
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
VMolecule(deprotonated_hydrated_products[0]).canonicalSMILES().should.be.equal("CC(O)C")
// Add proton to hydroxyl group
// See Organic Chemistry 8th Edition p245
const isopropanol = deprotonated_hydrated_products[0]
//console.log(VMolecule(isopropanol).compressed())
const isopropanol_ai =  require("./Components/Stateless/MoleculeAI")(isopropanol)
isopropanol_ai.findHydroxylOxygenIndex().should.be.equal(11)
const protonated_deprotonated_hydrated_products = CommandTest("ADD proton to hydroxyl group", _.cloneDeep(isopropanol), _.cloneDeep([water,1]))
VMolecule(protonated_deprotonated_hydrated_products[0]).canonicalSMILES().should.be.equal("CC([O+])C")


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
const deprotonated_ether_products = CommandTest("DEPROTONATE", _.cloneDeep(twoTwoDimethyloxoniacyclopropane), _.cloneDeep(protonated_ether_products[1]))
VMolecule(deprotonated_ether_products[0]).canonicalSMILES().should.be.equal("CC4(C)CO4")

// BREAK bond
// Break bond between the oxygen (electrophile) and most substituted carbon (nucleophile)
// Carbon will lose electrons and therefore will have a positive charge.
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
VMolecule(protonated_ether_products_methylated[0]).canonicalSMILES().should.be.equal("CC(C)([O+]C)CO")
// BREAK bond
// Reversal - break bond between methanol oxygen atom with most substituted substrate carbon
const protonated_ether_products_demethylated = CommandTest("BREAK bond", _.cloneDeep(protonated_ether_products_methylated[0]))
// CC(C)([O+]C)CO remove [O+]
VMolecule(protonated_ether_products_demethylated[0]).canonicalSMILES().should.be.equal("C[C+](C)CO")

// DEPROTONATE nonhydroxyl oxygen
const protonated_ether_products_methylated_deprotonated = CommandTest("DEPROTONATE nonhydroxyl oxygen", _.cloneDeep(protonated_ether_products_methylated[0]),
    _.cloneDeep([methanol,1]))
VMolecule(protonated_ether_products_methylated_deprotonated[0]).canonicalSMILES().should.be.equal("CC(C)(OC)CO")
// PROTONATE nonhydroxyl oxygen
const protonated_ether_products_methylated_protonated = CommandTest("PROTONATE nonhydroxyl oxygen",
    _.cloneDeep(protonated_ether_products_methylated_deprotonated[0]),
    _.cloneDeep(protonated_ether_products_methylated_deprotonated[1]))
VMolecule(protonated_ether_products_methylated_protonated[0]).canonicalSMILES().should.be.equal("CC(C)([O+]C)CO")


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
VMolecule(antidihydroxlation_test_step3[0]).canonicalSMILES().should.be.equal("CC([O+])(C)CO")

const antidihydroxlation_test_step4 = CommandTest("DEPROTONATE nonhydroxyl oxygen",
    _.cloneDeep(antidihydroxlation_test_step3[0]), _.cloneDeep([water,1]))
VMolecule(antidihydroxlation_test_step4[0]).canonicalSMILES().should.be.equal("CC(O)(C)CO")


// OXYMERCURATION - DEMERCURATION
// https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(Wade)/09%3A_Reactions_of_Alkenes/9.05%3A_Hydration_by_Oxymercuration-Demercuration
/*
Notice that overall, the oxymercuration - demercuration mechanism follows Markovnikov's Regioselectivity with the OH group attached to the most substituted carbon and the H attached to the least substituted carbon. The reaction is useful, because strong acids are not required and carbocation rearrangements are avoided because no discreet carbocation intermediate forms.
 */
// https://www.masterorganicchemistry.com/2011/08/12/reagent-friday-sodium-borohydride-nabh4/#:~:text=What%20it's%20used%20for%3A%20Sodium,aldehydes%20and%20ketones%20to%20alcohols.
// BOND atoms
// BOND atoms
// BREAK bond
// HYDRATE O
// BREAK bond
// REMOVE proton from water O
// REDUCE
const mercuriacetate = MoleculeFactory("[Hg](O[Ac])O[Ac]")
VMolecule([mercuriacetate,1]).canonicalSMILES().should.be.equal("[Hg](O[Ac])O[Ac]")
const isobutene = MoleculeFactory("CC(C)C=C")
const isobutene_ai = require("./Components/Stateless/MoleculeAI")([isobutene,1])
isobutene_ai.findElectrophileIndex().should.be.equal(11) // electrophile - substrate


// Bond least substituted carbon (nucleophile in isobutene to mercury atom (electrophile)
// In this step for the purposes of bondAtoms() isobutene (nucleophile) is treated as the reagent and mercuriacetate
// as the substrate
const mercuriacetate_ai = require("./Components/Stateless/MoleculeAI")([mercuriacetate,1])
mercuriacetate_ai.findNucleophileIndex().should.be.equal(1) // nucleophile - reagent - has lone pair
VMolecule([isobutene,1]).canonicalSMILES().should.be.equal("CC(C)C=C")
isobutene_ai.findNucleophileIndex().should.be.equal(14)
mercuriacetate_ai.findElectrophileIndex().should.be.equal(1)
const oxymercuration_demercuration_step1 = CommandTest("BOND atoms", [mercuriacetate,1], [isobutene,1])

const oxymercuration_demercuration_step1_ai = require("./Components/Stateless/MoleculeAI")(oxymercuration_demercuration_step1[0])
console.log(VMolecule(oxymercuration_demercuration_step1[0]).compressed())
oxymercuration_demercuration_step1_ai.findNucleophileIndex().should.be.equal(1)
oxymercuration_demercuration_step1_ai.findElectrophileIndex().should.be.equal(19)
const oxymercuration_demercuration_step2 = CommandTest("BOND atoms", oxymercuration_demercuration_step1[0])
console.log("oxymercuration_demercuration_step2 substrate")
console.log(VMolecule(oxymercuration_demercuration_step2[0]).compressed())
/*
[ [ 'Hg', 1, 'H 1', 'C 0', [ '2  O', '5  O', '19  C', '22  C' ] ],
  [ 'O', 2, 'H 0', 'C 0', [ '1  Hg', '4  Ac' ] ],
  [ 'Ac', 4, 'H 1', 'C 0', [ '2  O' ] ],
  [ 'O', 5, 'H 0', 'C 0', [ '1  Hg', '7  Ac' ] ],
  [ 'Ac', 7, 'H 1', 'C 0', [ '5  O' ] ],
  [ 'C', 11, 'H 3', 'C 0', [ '13  C' ] ],
  [ 'C', 13, 'H 1', 'C 0', [ '11  C', '17  C', '19  C' ] ],
  [ 'C', 17, 'H 3', 'C 0', [ '13  C' ] ],
  [ 'C', 19, 'H 1', 'C ', [ '1  Hg', '13  C', '22  C' ] ],
  [ 'C', 22, 'H 2', 'C ', [ '1  Hg', '19  C' ] ] ]
 */
// Break bond between mercury (nucleophile) and oxygen (electrophile)
const oxymercuration_demercuration_step2_ai = require("./Components/Stateless/MoleculeAI")(oxymercuration_demercuration_step2[0])
//oxymercuration_demercuration_step2_ai.findNucleophileIndex().should.be.equal(999)
oxymercuration_demercuration_step2_ai.findElectrophileIndex().should.be.equal(999)

process.exit()
const oxymercuration_demercuration_step3 = CommandTest("BREAK bond", oxymercuration_demercuration_step2[0])


process.exit()


// Hg atom (nucleophile) from reagent bonds with most substituted substrate carbon (electrophile) on the double bond

oxymercuration_demercuration_step3.should.not.be.equal(false)
//console.log(VMolecule(oxymercuration_demercuration_step3[0]).compressed())
VMolecule(oxymercuration_demercuration_step3[0]).canonicalSMILES().should.be.equal("CC(C)C(=C)[Hg+](O[Ac])O[Ac]")

const oxymercuration_demercuration_step4 = CommandTest("BREAK bond", oxymercuration_demercuration_step1[2])






const should = require('should')
const _ = require('lodash');

const VMolecule = require('./Components/Stateless/Views/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')
const CAtom = require('./Controllers/Atom')

const CommandTest = require('./Components/Stateless/CommandTest')


// Epoxide acidic ring opening
// https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(McMurry)/Chapter_18%3A_Ethers_and_Epoxides%3B_Thiols_and_Sulfides/18.06_Reactions_of_Epoxides%3A_Ring-opening
// PROTONATE
// BREAK bond
// BOND atoms
// DEPROTONATE nonhydroxyl oxygen
// CC1(C)OC1
// Start
const isobutene_oxide = MoleculeFactory("CC1(CO1)C")
console.log(VMolecule([isobutene_oxide,1]).compressed())
/*[ [ 'C', 3, 'H 3', 'B 4', 'DB 0', [ '4  C' ] ],
  [ 'C',
    4,
    'H 0',
    'B 4',
    'DB 0',
    [ '3  C', '7  C', '8  O', '12  C' ] ],
  [ 'C', 7, 'H 2', 'B 4', 'DB 0', [ '4  C', '8  O' ] ],
  [ 'O', 8, 'H 0', 'B 2', 'DB 0', [ '4  C', '7  C' ] ],
  [ 'C', 12, 'H 3', 'B 4', 'DB 0', [ '4  C' ] ] ]

  chains
  [ [ 3, 4, 7, 8, 4, 3 ],    CC1CO
  [ 3, 4, 7, 8, 4, 7, 8, 4, 3 ],
  [ 3, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 3 ],
  [ 3, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 3 ],
  [ 3, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 3 ],
  [ 3, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 3 ],
  [ 3, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7 ] ]

*/
VMolecule([isobutene_oxide,1]).canonicalSMILES()


// PROTONATE
// See Organic Chemistry 8th Edition p245
const sulphuric_acid = MoleculeFactory("OS(=O)(=O)O")
const alkene = MoleculeFactory("CC=C")
const sulphuric_acid_ai = require("./Components/Stateless/MoleculeAI")([sulphuric_acid,1])
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
VMolecule(protonated_products[1]).canonicalSMILES().should.be.equal("[O-]S(=O)(=O)O")


// DEPROTONATE
// See Organic Chemistry 8th Edition p245
const isopropyl_cation = protonated_products[0]
const hydrogen_sulfate = protonated_products[1]
const deprotonated_products = CommandTest("DEPROTONATE", _.cloneDeep(isopropyl_cation), _.cloneDeep(hydrogen_sulfate))
VMolecule(deprotonated_products[0]).canonicalSMILES().should.be.equal("CC=C")
VMolecule(deprotonated_products[1]).canonicalSMILES().should.be.equal("OS(=O)(=O)O")


// HYDRATE
// See Organic Chemistry 8th Edition p245
// console.log(VMolecule(isopropyl_cation).compressed())
const isopropyl_cation_ai = require("./Components/Stateless/MoleculeAI")(isopropyl_cation)
isopropyl_cation_ai.findElectrophileIndex().should.be.equal(5)
const water = MoleculeFactory("O")
const hydrated_products = CommandTest("HYDRATE", _.cloneDeep(isopropyl_cation), _.cloneDeep([water,1]))
VMolecule(hydrated_products[0]).canonicalSMILES().should.be.equal("CC(C)[O+]")
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
VMolecule(deprotonated_hydrated_products[0]).canonicalSMILES().should.be.equal("CC(C)O")
// Add proton to hydroxyl group
// See Organic Chemistry 8th Edition p245
const isopropanol = deprotonated_hydrated_products[0]
//console.log(VMolecule(isopropanol).compressed())
const isopropanol_ai =  require("./Components/Stateless/MoleculeAI")(isopropanol)
isopropanol_ai.findHydroxylOxygenIndex().should.be.equal(11)
const protonated_deprotonated_hydrated_products = CommandTest("ADD proton to hydroxyl group", _.cloneDeep(isopropanol), _.cloneDeep([water,1]))
VMolecule(protonated_deprotonated_hydrated_products[0]).canonicalSMILES().should.be.equal("CC(C)[O+]")


// Run commands in reverse
// See Organic Chemistry 8th Edition p245
const dehydrated_products_2 = CommandTest("DEHYDRATE", _.cloneDeep(protonated_deprotonated_hydrated_products[0]))
const deprotonated_products_2 = CommandTest("DEPROTONATE", _.cloneDeep(dehydrated_products_2[0]), _.cloneDeep(hydrogen_sulfate))
VMolecule(deprotonated_products_2[0]).canonicalSMILES().should.be.equal("CC=C")
const should = require('should')
const _ = require('lodash');

const VMolecule = require('./Components/Stateless/Views/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')
const CAtom = require('./Controllers/Atom')

const CommandTest = require('./Components/Stateless/CommandTest')

// See Organic Chemistry 8th Edition p245
const alkene = MoleculeFactory("CC=C")
const alkene_ai = require("./Components/Stateless/MoleculeAI")([alkene,1])
console.log(VMolecule([alkene,1]).compressed())
/*
[ [ 'C', 3, [ '5  C' ] ],
  [ 'C', 5, [ '3  C', '8  C' ] ],
  [ 'C', 8, [ '5  C' ] ] ]

 */
const nucleophile_index =alkene_ai.findNucleophileIndex()
alkene_ai.findNucleophileIndex().should.be.equal(8)
CAtom(alkene[1][nucleophile_index], nucleophile_index, [alkene,1]).freeElectrons().length.should.be.equal(0)
const double_bonds = CAtom(alkene[1][nucleophile_index], nucleophile_index, [alkene,1]).indexedDoubleBonds("")
double_bonds.length.should.be.equal(1)

const protonated_products = CommandTest("PROTONATE", [alkene,1], [MoleculeFactory("OS(=O)(=O)O"),1])

console.log(".....")
console.log(VMolecule(protonated_products[0]).compressed())

console.log(VMolecule(protonated_products[0]).canonicalSMILES())
process.exit()

console.log(VMolecule(protonated_products[1]).canonicalSMILES())
/*
CC=[C+]
OS(=O)(=O)O

 */
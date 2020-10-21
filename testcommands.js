const should = require('should')
const _ = require('lodash');

const VMolecule = require('./Components/Stateless/Views/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')
const CAtom = require('./Controllers/Atom')

const CommandTest = require('./Components/Stateless/CommandTest')

// PROTONATE
// See Organic Chemistry 8th Edition p245
const alkene = MoleculeFactory("CC=C")
const alkene_ai = require("./Components/Stateless/MoleculeAI")([alkene,1])
const nucleophile_index =alkene_ai.findNucleophileIndex()
alkene_ai.findNucleophileIndex().should.be.equal(8)
CAtom(alkene[1][nucleophile_index], nucleophile_index, [alkene,1]).freeElectrons().length.should.be.equal(0)
const double_bonds = CAtom(alkene[1][nucleophile_index], nucleophile_index, [alkene,1]).indexedDoubleBonds("")
double_bonds.length.should.be.equal(1)
const protonated_products = CommandTest("PROTONATE", [alkene,1], [MoleculeFactory("OS(=O)(=O)O"),1])
VMolecule(protonated_products[0]).canonicalSMILES().should.be.equal('C[CH1+]C')
process.exit()


// DEPROTONATE
const isopropyl_cation = protonated_products[0]

console.log(VMolecule(protonated_products[1]).canonicalSMILES())
/*
CC=[C+]
OS(=O)(=O)O

 */
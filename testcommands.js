const should = require('should')
const _ = require('lodash');

const VMolecule = require('./Components/Stateless/Views/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')
const CAtom = require('./Controllers/Atom')

const CommandTest = require('./Components/Stateless/CommandTest')

// PROTONATE
// See Organic Chemistry 8th Edition p245
const alkene = MoleculeFactory("CC=C")
const sulphuric_acid = MoleculeFactory("OS(=O)(=O)O")
const alkene_ai = require("./Components/Stateless/MoleculeAI")([alkene,1])
const sulphuric_acid_ai = require("./Components/Stateless/MoleculeAI")([sulphuric_acid,1])
const nucleophile_index =alkene_ai.findNucleophileIndex()
const reagent_nucleophile_index = sulphuric_acid_ai.findNucleophileIndex()
alkene_ai.findNucleophileIndex().should.be.equal(8)
sulphuric_acid_ai.findProtonIndex().should.be.equal(0)
CAtom(alkene[1][nucleophile_index], nucleophile_index, [alkene,1]).freeElectrons().length.should.be.equal(0)
const double_bonds = CAtom(alkene[1][nucleophile_index], nucleophile_index, [alkene,1]).indexedDoubleBonds("")
double_bonds.length.should.be.equal(1)
const protonated_products = CommandTest("PROTONATE", [alkene,1], [MoleculeFactory("OS(=O)(=O)O"),1])
VMolecule(protonated_products[0]).canonicalSMILES().should.be.equal('C[CH1+]C')
VMolecule(protonated_products[1]).canonicalSMILES().should.be.equal("[O-]S(=O)(=O)O")
process.exit()


// DEPROTONATE
// See Organic Chemistry 8th Edition p245
const isopropyl_cation = protonated_products[0]
const hydrogen_sulfate = protonated_products[1]


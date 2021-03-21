const should = require('should')
const _ = require('lodash');
const Set = require('./Models/Set')

const VMolecule = require('./Components/Stateless/Views/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')
const AtomFactory = require('./Models/AtomFactory')
const CAtom = require('./Controllers/Atom')

const CommandTest = require('./Components/Stateless/CommandTest')
const md = MoleculeFactory("CC(CC1=CC2=C(C=C1)OCO2)NC")
VMolecule([md,1]).canonicalSMILES().should.be.equal("CC(CC1=CC2=C(C=C1)OCO2)NC")

const three_Methylamino_phenol = MoleculeFactory("CNC1=CC(=CC=C1)O")
// CNC1=CC(=CC=C1)O
// CNC1=CC(=CC=C1)O
VMolecule([three_Methylamino_phenol,1]).canonicalSMILES().should.be.equal("CNC1=CC(=CC=C1)O")

const cyclohexanamine = MoleculeFactory("C1=C(NC)C=CC=C1")
VMolecule([cyclohexanamine,1]).canonicalSMILES().should.be.equal('C1=C(NC)C=CC=C1')

const benzene = MoleculeFactory("C1=CC=CC=C1")
VMolecule([benzene,1]).canonicalSMILES().should.be.equal('C1=CC=CC=C1')

const m = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
// CC(CC1=CC=CC=C1)NC
// CC(CC1=CC=CC=C1)NC
VMolecule([m,1]).canonicalSMILES().should.be.equal("CC(CC1=CC=CC=C1)NC")

const methanol = MoleculeFactory("CO")
VMolecule([methanol,1]).canonicalSMILES().should.be.equal("CO")

const pinacolone = MoleculeFactory("CC(=O)C(C)(C)C")
// CC(=O)C(C)(C)C
// CC(=O)C(C)C)C
VMolecule([pinacolone,1]).canonicalSMILES().should.equal("CC(=O)C(C)(C)C")




//console.log(cccc)







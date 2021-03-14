const should = require('should')
const _ = require('lodash');
const Set = require('./Models/Set')

const VMolecule = require('./Components/Stateless/Views/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')
const AtomFactory = require('./Models/AtomFactory')
const CAtom = require('./Controllers/Atom')

const CommandTest = require('./Components/Stateless/CommandTest')

const m = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
// CC(CC=(CC=CC=CNC)
console.log(VMolecule([m,1]).canonicalSMILES())
console.log(cccc)
const benzene = MoleculeFactory("C1=CC=CC=C1")
VMolecule([benzene,1]).canonicalSMILES().should.be.equal('C1=CC=CC=C1')
const cyclohexanamine = MoleculeFactory("C1=C(NC)C=CC=C1")
VMolecule([cyclohexanamine,1]).canonicalSMILES().should.be.equal('C1=C(NC)C=CC=C1')
const three_Methylamino_phenol = MoleculeFactory("CNC1=CC(=CC=C1)O")
// CNC=(CC=(CC=CO)
VMolecule([three_Methylamino_phenol,1]).canonicalSMILES().should.be.equal("CNC1=CC(=CC=C1)O")


//const methanol = MoleculeFactory("CO")
//VMolecule([methanol,1]).canonicalSMILES().should.be.equal("CO")

//console.log(VMolecule([methanol,1]).canonicalSMILES())
//console.log(VMolecule([methanol,1]).compressed())
//console.log(VMolecule([methanol,1]).formatted())
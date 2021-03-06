const should = require('should')
const _ = require('lodash');
const Set = require('./Models/Set')

const VMolecule = require('./Components/Stateless/Views/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')
const AtomFactory = require('./Models/AtomFactory')
const CAtom = require('./Controllers/Atom')

const CommandTest = require('./Components/Stateless/CommandTest')
const methanol = MoleculeFactory("CO")
VMolecule([methanol,1]).canonicalSMILES().should.be.equal("CO")

console.log(VMolecule([methanol,1]).canonicalSMILES())
console.log(VMolecule([methanol,1]).compressed())
console.log(VMolecule([methanol,1]).formatted())
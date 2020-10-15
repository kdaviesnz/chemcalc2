
const should = require('should')
const _ = require('lodash');

const VMolecule = require('./Components/Stateless/Views/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')

const CommandTest = require('./Components/Stateless/CommandTest')

// [PROTONATE] COC(C)(C)(=C) + OS(=O)(=O)(O) = COC(C)(C)([C+])

// Incorrect
// [HYDRATE] COC(C)(C)([CH2+]) + O = COC(C)(C)(C[OH2+])
// Should be
// [HYDRATE] COC(C)(C)([CH3+]) + O = COC(C)(C)(C[OH2+])
// DEHYDRATE command is wrong


// Correct
// [REMOVE proton from water] COC(C)(C)(C[OH2+]) + [O+] = COC(C)(C)(CO)
const protonate_products = CommandTest("PROTONATE", [MoleculeFactory("COC(C)(C)(=C)"),1], [MoleculeFactory("OS(=O)(=O)(O)"),1])
console.log(VMolecule(products[0]).canonicalSMILES())
console.log(VMolecule(products[1]).canonicalSMILES())
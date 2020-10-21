
const should = require('should')
const _ = require('lodash');

const VMolecule = require('./Components/Stateless/Views/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')

const CommandTest = require('./Components/Stateless/CommandTest')

// See Organic Chemistry 8th Edition p245
const alkene = MoleculeFactory("CC=C")
const protonated_products = CommandTest("PROTONATE", [alkene,1], [MoleculeFactory("OS(=O)(=O)O"),1])
console.log(VMolecule(protonated_products[0]).canonicalSMILES())
console.log(VMolecule(protonated_products[1]).canonicalSMILES())
/*
CC=[C+]
OS(=O)(=O)O

 */
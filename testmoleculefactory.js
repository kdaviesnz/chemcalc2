
const MoleculeFactory = require('./Models/MoleculeFactory')

const VMolecule = require('./Components/Stateless/Views/Molecule')

const ChargesAI = require('./Components/State/ChargesAI')

const chargesAI = new ChargesAI(null)

const water = [MoleculeFactory("O"),1]

console.log(VMolecule(water).compressed())
console.log(water[0][1])

// true if charge is incorrect
console.log(chargesAI.checkCharge(water, water[0][1][2], 2))

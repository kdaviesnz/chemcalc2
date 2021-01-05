const should = require('should')
const MoleculeFactory = require('./Models/MoleculeFactory')
const VMolecule = require('./Components/Stateless/Views/Molecule')
const ChargesAI = require('./Components/State/ChargesAI')
const chargesAI = new ChargesAI(null)

const water = [MoleculeFactory("O"),1]
// console.log(VMolecule(water).compressed())
// console.log(water[0][1])

// true if charge is incorrect
chargesAI.checkCharge(water, water[0][1][2], 2).should.be.false()

const hydronium = [MoleculeFactory("[O+]"),1]
console.log(hydronium[0][1])
// true if charge is incorrect
chargesAI.checkCharge(hydronium, hydronium[0][1][0], 0).should.be.false()

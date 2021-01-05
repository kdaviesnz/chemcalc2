const should = require('should')
const MoleculeFactory = require('./Models/MoleculeFactory')
const VMolecule = require('./Components/Stateless/Views/Molecule')
const ChargesAI = require('./Components/State/ChargesAI')
const chargesAI = new ChargesAI(null)
const _ = require('lodash');

const hydronium = [MoleculeFactory("[OH3+]"),1]
hydronium[0][1].length.should.be.equal(4)
console.log(hydronium[0][1])
// 3 electrons from H + 6 electrons from O -1 from positive charge
_.cloneDeep(hydronium[0][1][3]).slice(5).length.should.be.equal(8)
// true if charge is incorrect
chargesAI.checkCharge(hydronium, hydronium[0][1][3], 3).should.be.false()
console.log(asd)

const hydroxide = [MoleculeFactory("[OH1]"),1]
hydroxide[0][1].length.should.be.equal(2)
// console.log(hydroxide[0][1])
// console.log(jhg)
// true if charge is incorrect
chargesAI.checkCharge(hydroxide, hydroxide[0][1][1], 1).should.be.false()


const water = [MoleculeFactory("O"),1]
// console.log(VMolecule(water).compressed())
// console.log(water[0][1])

// true if charge is incorrect
chargesAI.checkCharge(water, water[0][1][2], 2).should.be.false()



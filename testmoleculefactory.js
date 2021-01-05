const should = require('should')
const MoleculeFactory = require('./Models/MoleculeFactory')
const VMolecule = require('./Components/Stateless/Views/Molecule')
const ChargesAI = require('./Components/State/ChargesAI')
const chargesAI = new ChargesAI(null)
const _ = require('lodash');
const CAtom = require('./Controllers/Atom')

const m2 = MoleculeFactory("CC(CC1=CC2=C(C=C1)OCO2)N")


const o = CAtom(m2[1][22], 22, [m2,1])

console.log(o.bondCount())
console.log(kljj)

const cation = [MoleculeFactory("[CH5+]"),1]
cation[0][1].length.should.be.equal(5)
_.cloneDeep(cation[0][1][4]).slice(5).length.should.be.equal(6)
// true if charge is incorrect
chargesAI.checkCharge(cation, cation[0][1][3], 4).should.be.false()

const methane = [MoleculeFactory("[CH3-]"),1]
methane[0][1].length.should.be.equal(4)
// 3 electrons from H + 4 valence electrons from C + 1 electron for negative charge
_.cloneDeep(methane[0][1][3]).slice(5).length.should.be.equal(8)
// true if charge is incorrect
chargesAI.checkCharge(methane, methane[0][1][3], 3).should.be.false()

const carbon = [MoleculeFactory("C"),1]
// console.log(VMolecule(water).compressed())
// console.log(water[0][1])
// true if charge is incorrect
chargesAI.checkCharge(carbon, carbon[0][1][2], 4).should.be.false()


const hydronium = [MoleculeFactory("[OH3+]"),1]
hydronium[0][1].length.should.be.equal(4)
// 3 electrons from H + 6 valence electrons from O -1 from positive charge
_.cloneDeep(hydronium[0][1][3]).slice(5).length.should.be.equal(8)
// true if charge is incorrect
chargesAI.checkCharge(hydronium, hydronium[0][1][3], 3).should.be.false()

// O
const hydroxide = [MoleculeFactory("[OH1-]"),1]
hydroxide[0][1].length.should.be.equal(2)
_.cloneDeep(hydroxide[0][1][1]).slice(5).length.should.be.equal(8)
chargesAI.checkCharge(hydroxide, hydroxide[0][1][1], 1).should.be.false()
const water = [MoleculeFactory("O"),1]
chargesAI.checkCharge(water, water[0][1][2], 2).should.be.false()


const ammonium = [MoleculeFactory("[NH4+]"),1]
//console.log(ammonium[0])
ammonium[0][1].length.should.be.equal(5)
// 4 electrons from H + 5 valence electrons from N -1 from positive charge
_.cloneDeep(ammonium[0][1][4]).slice(5).length.should.be.equal(8)
// true if charge is incorrect
chargesAI.checkCharge(ammonium, ammonium[0][1][3], 4).should.be.false()


const amide = [MoleculeFactory("[NH2-]"),1]
amide[0][1].length.should.be.equal(3)
// 2 electrons from H + 5 valence electrons from O + 1 electron for negative charge
_.cloneDeep(amide[0][1][2]).slice(5).length.should.be.equal(8)
// true if charge is incorrect
chargesAI.checkCharge(amide, amide[0][1][2], 2).should.be.false()

const ammonia = [MoleculeFactory("N"),1]
// console.log(VMolecule(water).compressed())
// console.log(water[0][1])
// true if charge is incorrect
chargesAI.checkCharge(ammonia, ammonia[0][1][2], 3).should.be.false()



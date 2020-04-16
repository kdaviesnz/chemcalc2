// https://www.npmjs.com/package/should
// npm i should
const should = require('should')
const FunctionalGroups = require('./Models/FunctionalGroups')
const Canonical_SMILESParser = require("./Models/CanonicalSMILESParser")
const AtomFactory = require('./Models/AtomFactory')

const CMolecule = require('./Controllers/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')
const PeriodicTable = require("./Models/PeriodicTable")
const CContainer = require('./Controllers/Container')


const ccontainer = new CContainer([false], MoleculeFactory)

// HCl + H2O <-> Cl- + H3O+
//  CONTAINER MODEL
// is vacuum, molecule, molecule ...
ccontainer.add("HCl")
ccontainer.container.length.should.be.equal(2)
ccontainer.container[0].should.be.equal(false)
ccontainer.container[1].should.be.a.Array()

// MOLECULE MODEL
// pKa, atom, atom, atom ...
ccontainer.container[1].length.should.be.equal(3)

// pKa
if (undefined===ccontainer.container[1][0]) {
    console.error("Undefined element")
    process.exit()
}
ccontainer.container[1][0].should.be.a.Number()
ccontainer.container[1][0].should.be.equal(9999) // -6.3

// ATOM MODEL
// atomic symbol, proton count, valence count, std number of bonds, velectron1, velectron2, velectron3
ccontainer.container[1][1].should.be.Array()
/*
[ 'Cl',
  17,
  '7',
  1,
  'bqdtz0lfnk8zh0emo',
  'bqdtz0lfnk8zh0emp',
  'bqdtz0lfnk8zh0emq',
  'bqdtz0lfnk8zh0emr',
  'bqdtz0lfnk8zh0ems',
  'bqdtz0lfnk8zh0emt' ]
 */
ccontainer.container[1][1].length.should.be.equal(6)
ccontainer.container[1][1][0].should.be.equal("H")
ccontainer.container[1][1][1].should.be.equal(1)
ccontainer.container[1][1][2].should.be.equal(1)
ccontainer.container[1][1][3].should.be.equal(1)
ccontainer.container[1][1][4].should.be.a.String()
ccontainer.container[1][1][5].should.be.a.String()

ccontainer.container[1][2].should.be.Array()
ccontainer.container[1][2].length.should.be.equal(12)
ccontainer.container[1][2][0].should.be.equal("Cl")
ccontainer.container[1][2][1].should.be.equal(17)
ccontainer.container[1][2][2].should.be.equal(7)
ccontainer.container[1][2][3].should.be.equal(1)
ccontainer.container[1][2][4].should.be.a.String()
ccontainer.container[1][2][5].should.be.a.String()

ccontainer.add("water")
ccontainer.container.length.should.be.equal(3)

ccontainer.container[1].length.should.be.equal(1)
ccontainer.container[1][0].should.be.a.number()
ccontainer.container[1][0].should.be.equal(-9999)

ccontainer.container[1][1].should.be.array()
ccontainer.container[1][1].length.should.be.equal(5)
ccontainer.container[1][1][0].should.be.equal("Cl")
ccontainer.container[1][1][1].should.be.equal(17)
ccontainer.container[1][1][2].should.be.equal(7)
ccontainer.container[1][1][3].should.be.equal(1)
ccontainer.container[1][1][4].should.be.a.string()


ccontainer.container[1].length.should.be.equal(1)

ccontainer.container[2].should.be.array()
ccontainer.container[2].length.should.be.array(5)
ccontainer.container[2][0].should.be.a.number()
ccontainer.container[2][0].should.be.equal(14)

ccontainer.container[1][1][5].should.be.a.string()
ccontainer.container[2][1].should.be.array()
ccontainer.container[2][1].length.should.be.equal(6)
ccontainer.container[2][1][0].should.be.equal("H")
ccontainer.container[2][1][1].should.be.equal(1)
ccontainer.container[2][1][2].should.be.equal(1)
ccontainer.container[2][1][3].should.be.equal(1)
ccontainer.container[2][1][4].should.be.a.string()
ccontainer.container[2][1][5].should.be.a.string()

ccontainer.container[2][2].length.should.be.equal(6)
ccontainer.container[2][2][0].should.be.equal("H")
ccontainer.container[2][2][1].should.be.equal(1)
ccontainer.container[2][2][2].should.be.equal(1)
ccontainer.container[2][2][3].should.be.equal(1)
ccontainer.container[2][2][4].should.be.a.string()
ccontainer.container[2][2][5].should.be.a.string()

ccontainer.container[2][3].length.should.be.equal(6)
ccontainer.container[2][3][0].should.be.equal("H")
ccontainer.container[2][3][1].should.be.equal(1)
ccontainer.container[2][3][2].should.be.equal(1)
ccontainer.container[2][3][3].should.be.equal(1)
ccontainer.container[2][3][4].should.be.a.string()
ccontainer.container[2][3][5].should.be.a.string()

ccontainer.container[2][4].length.should.be.equal(9)
ccontainer.container[2][4][0].should.be.equal("O")
ccontainer.container[2][4][1].should.be.equal(8)
ccontainer.container[2][4][2].should.be.equal(6)
ccontainer.container[2][4][3].should.be.equal(2)
ccontainer.container[2][4][4].should.be.a.string()
ccontainer.container[2][4][5].should.be.a.string()
ccontainer.container[2][4][6].should.be.a.string()
ccontainer.container[2][4][7].should.be.a.string()
ccontainer.container[2][4][8].should.be.a.string()


// CC(=O)O (acetic acid) + water

// aluminum chloride ([Al](Cl)(Cl)Cl) (Lewis acid) + dimethyl ether (COC) (Lewis base)

// oOf8ZoXI`@.pE/$DLX2H(FKI7PC$I51

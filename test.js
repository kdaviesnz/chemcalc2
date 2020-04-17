// https://www.npmjs.com/package/should
// npm i should
const should = require('should')
const FunctionalGroups = require('./Models/FunctionalGroups')
const Canonical_SMILESParser = require("./Models/CanonicalSMILESParser")
const AtomFactory = require('./Models/AtomFactory')

const MoleculeController = require('./Controllers/Molecule')
const MoleculeFactory = require('./Models/MoleculeFactory')
const PeriodicTable = require("./Models/PeriodicTable")
const CContainer = require('./Controllers/Container')


// MOLECULE MODEL
// pKa, atom, atom, atom ...
const watermolecule = MoleculeFactory("water")
watermolecule.should.be.a.Array()
watermolecule.length.should.be.equal(4)
watermolecule[0].should.be.a.Number()
watermolecule[0].should.be.a.equal(9999)
watermolecule[1].should.be.a.Array()
watermolecule[1].length.should.be.a.equal(9999)
watermolecule[1][0].should.be.a.String()
watermolecule[1][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        watermolecule[1][i].should.be.a.Number()
    }
) 
watermolecule[1][1].should.be.equal(9999)
watermolecule[1][2].should.be.equal(9999)
watermolecule[1][3].should.be.equal(9999)
range.range(4,watermolecule[1].length-1).map(
    (i)=>{
        watermolecule[2][i]should.be.a.String()
    }
)
watermolecule[2].should.be.a.Array()
watermolecule[2].length.should.be.a.equal(9999)
watermolecule[2][0].should.be.a.String()
watermolecule[2][0].should.be.equal("O")
range.range(1,3,1).map(
    (i)=>{
        watermolecule[2][i].should.be.a.Number()
    }
) 
watermolecule[2][1].should.be.equal(9999)
watermolecule[2][2].should.be.equal(9999)
watermolecule[2][3].should.be.equal(9999)
range.range(4,watermolecule[2].length-1,1).map(
    (i)=>{
        watermolecule[2][i]should.be.a.String()
    }
)
watermolecule[3].should.be.a.Array()
watermolecule[3].length.should.be.a.equal(9999)
watermolecule[3][0].should.be.a.String()
watermolecule[3][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        watermolecule[3][i].should.be.a.Number()
    }
) 
watermolecule[3][1].should.be.equal(9999)
watermolecule[3][2].should.be.equal(9999)
watermolecule[3][3].should.be.equal(9999)
range.range(4,watermolecule[3].length-1,1).map(
    (i)=>{
        watermolecule[2][i].should.be.a.String()
    }
) 
watermolecule[3].indexOf(watermolecule[2][watermolecule[2].length-1]).should.not.be.False()
watermolecule[2].indexOf(watermolecule[3][watermolecule[3].length-1]).should.not.be.False()
watermolecule[2].indexOf(watermolecule[1][watermolecule[1].length-1]).should.not.be.False()
watermolecule[1].indexOf(watermolecule[2][watermolecule[2].length-1]).should.not.be.False()


const hcl = MoleculeFactory("HCl")
hcl.should.be.a.Array()
hcl.length.should.be.equal(3)
hcl[0].should.be.a.Number()
hcl[0].should.be.a.equal(9999)
hcl[1].should.be.a.Array()
hcl[1].length.should.be.a.equal(9999)
hcl[1][0].should.be.a.String()
hcl[1][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        hcl[1][i].should.be.a.Number()
    }
) 
hcl[1][1].should.be.equal(9999)
hcl[1][2].should.be.equal(9999)
hcl[1][3].should.be.equal(9999)
range.range(4,hcl[1].length-1).map(
    (i)=>{
        hcl[2][i].should.be.a.String()
    }
)
hcl[2].should.be.a.Array()
hcl[2].length.should.be.a.equal(9999)
hcl[2][0].should.be.a.String()
hcl[2][0].should.be.equal("O")
range.range(1,3,1).map(
    (i)=>{
        hcl[2][i].should.be.a.Number()
    }
) 
hcl[2][1].should.be.equal(9999)
hcl[2][2].should.be.equal(9999)
hcl[2][3].should.be.equal(9999)
range.range(4,hcl[2].length-1,1).map(
    (i)=>{
        hcl[2][i].should.be.a.String()
    }
)
hcl[2].indexOf(hcl[1][hcl[1].length-1]).should.not.be.False()
hcl[1].indexOf(hcl[2][hcl[2].length-1]).should.not.be.False()

const ccontainer = new CContainer([false], MoleculeFactory, MoleculeController)

// HCl + H2O <-> Cl- + H3O+
//  CONTAINER MODEL
// is vacuum, molecule, molecule ...
ccontainer.add("HCl")
ccontainer.container.length.should.be.equal(2)
ccontainer.container[0].should.be.equal(false)
ccontainer.container[1].should.be.a.Array()

// ATOM MODEL
// atomic symbol, proton count, valence count, std number of bonds, velectron1, velectron2, velectron3


ccontainer.add("water",1)
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

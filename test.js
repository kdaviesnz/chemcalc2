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

const range = require("range");

// MOLECULE MODEL
// pKa, atom, atom, atom ...
// ATOM MODEL
// atomic symbol, proton count, valence count, std number of bonds, velectron1, velectron2, velectron3
const watermolecule = MoleculeFactory("water")
/*
[ 9999,
  [ 'H', 1, 1, 1, 'cfo6drik94nz8an', 'cfo6drik94nz8ah' ],
  [ 'H', 1, 1, 1, 'cfo6drik94nz8ao', 'cfo6drik94nz8ai' ],
  [ 'O',
    8,
    6,
    2,
    'cfo6drik94nz8ah',
    'cfo6drik94nz8ai',
    'cfo6drik94nz8aj',
    'cfo6drik94nz8ak',
    'cfo6drik94nz8al',
    'cfo6drik94nz8am',
    'cfo6drik94nz8an',
    'cfo6drik94nz8ao' ] ]
 */
watermolecule.should.be.a.Array()
watermolecule.length.should.be.equal(4)
watermolecule[0].should.be.a.Number()
watermolecule[0].should.be.a.equal(9999)
watermolecule[1].should.be.a.Array()
//watermolecule[1].length.should.be.a.equal(6)
watermolecule[1][0].should.be.a.String()
watermolecule[1][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        watermolecule[1][i].should.be.a.Number()
    }
) 
watermolecule[1][1].should.be.equal(1)
watermolecule[1][2].should.be.equal(1)
watermolecule[1][3].should.be.equal(1)
range.range(4,watermolecule[1].length-1).map(
    (i)=>{
        watermolecule[2][i].should.be.a.String()
    }
)
watermolecule[2].should.be.a.Array()
//watermolecule[2].length.should.be.a.equal(6)
watermolecule[2][0].should.be.a.String()
watermolecule[2][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        watermolecule[2][i].should.be.a.Number()
    }
) 
watermolecule[2][1].should.be.equal(1)
watermolecule[2][2].should.be.equal(1)
watermolecule[2][3].should.be.equal(1)
range.range(4,watermolecule[2].length-1,1).map(
    (i)=>{
        watermolecule[2][i].should.be.a.String()
    }
)
watermolecule[3].should.be.a.Array()
watermolecule[3].length.should.be.a.equal(12)
watermolecule[3][0].should.be.a.String()
watermolecule[3][0].should.be.equal("O")
range.range(1,3,1).map(
    (i)=>{
        watermolecule[3][i].should.be.a.Number()
    }
) 
watermolecule[3][1].should.be.equal(8)
watermolecule[3][2].should.be.equal(6)
watermolecule[3][3].should.be.equal(2)
range.range(4,watermolecule[3].length-1,1).map(
    (i)=>{
        watermolecule[3][i].should.be.a.String()
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
hcl[1].length.should.be.a.equal(5)
hcl[1][0].should.be.a.String()
hcl[1][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        hcl[1][i].should.be.a.Number()
    }
) 
hcl[1][1].should.be.equal(1)
hcl[1][2].should.be.equal(1)
hcl[1][3].should.be.equal(1)
range.range(4,hcl[1].length-1).map(
    (i)=>{
        hcl[2][i].should.be.a.String()
    }
)
hcl[2].should.be.a.Array()
hcl[2].length.should.be.a.equal(12)
hcl[2][0].should.be.a.String()
hcl[2][0].should.be.equal("Cl")
range.range(1,3,1).map(
    (i)=>{
        hcl[2][i].should.be.a.Number()
    }
) 
hcl[2][1].should.be.equal(17)
hcl[2][2].should.be.equal(7)
hcl[2][3].should.be.equal(1)
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
ccontainer.add("HCl",1)
ccontainer.container.length.should.be.equal(2)
ccontainer.container[0].should.be.equal(false)
ccontainer.container[1].should.be.a.Array()
//console.log(ccontainer.container)
ccontainer.add("water",1)
console.log("Container after adding water:")
console.log(ccontainer.container)
/*
[ false,
  [ 9999,
    [ 'H', 1, 1, 1, 'w2u17v1k97q2s6c', 'w2u17v1k97q2s65' ],
    [ 'Cl',
      17,
      7,
      1,
      'w2u17v1k97q2s65',
      'w2u17v1k97q2s66',
      'w2u17v1k97q2s67',
      'w2u17v1k97q2s68',
      'w2u17v1k97q2s69',
      'w2u17v1k97q2s6a',
      'w2u17v1k97q2s6b',
      'w2u17v1k97q2s6c' ] ] ]
Container after adding water:
[ 9999, [ 'H', 1, 1, 1, 'w2u17v1k97q2s6c' ] ]

 */
process.exit()
ccontainer.container.length.should.be.equal(3)

const Clneg = ccontainer.container[1]
Clneg.should.be.a.Array()
Clneg.length.should.be.a.equal(2)
Clneg[0][0].should.be.a.String()
Clneg[0][0].should.be.equal("Cl")
range.range(1,3,1).map(
    (i)=>{
        Clneg[0][i].should.be.a.Number()
    }
) 
Clneg[0][1].should.be.equal(9999)
Clneg[0][2].should.be.equal(9999)
Clneg[0][3].should.be.equal(9999)
range.range(4,Clneg[0].length-1,1).map(
    (i)=>{
        Clneg[0][i].should.be.a.String()
    }
)

const HthreeO = ccontainer.container[2]
HthreeO.should.be.a.Array()
HthreeO.length.should.be.a.equal(3)

HthreeO[0][0].should.be.a.String()
HthreeO[0][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        HthreeO[0][i].should.be.a.Number()
    }
) 
HthreeO[0][1].should.be.equal(9999)
HthreeO[0][2].should.be.equal(9999)
HthreeO[0][3].should.be.equal(9999)
range.range(4,HthreeO[0].length-1,1).map(
    (i)=>{
        HthreeO[0][i].should.be.a.String()
    }
)

HthreeO[1][0].should.be.a.String()
HthreeO[1][0].should.be.equal("O")
range.range(1,3,1).map(
    (i)=>{
        HthreeO[0][i].should.be.a.Number()
    }
) 
HthreeO[1][1].should.be.equal(9999)
HthreeO[1][2].should.be.equal(9999)
HthreeO[1][3].should.be.equal(9999)
range.range(4,HthreeO[1].length-1,1).map(
    (i)=>{
        HthreeO[1][i].should.be.a.String()
    }
)

HthreeO[2][0].should.be.a.String()
HthreeO[2][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        HthreeO[2][i].should.be.a.Number()
    }
) 
HthreeO[2][1].should.be.equal(9999)
HthreeO[2][2].should.be.equal(9999)
HthreeO[2][3].should.be.equal(9999)
range.range(4,HthreeO[2].length-1,1).map(
    (i)=>{
        HthreeO[2][i].should.be.a.String()
    }
)

HthreeO[3][0].should.be.a.String()
HthreeO[3][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        HthreeO[3][i].should.be.a.Number()
    }
) 
HthreeO[3][1].should.be.equal(9999)
HthreeO[3][2].should.be.equal(9999)
HthreeO[3][3].should.be.equal(9999)
range.range(4,HthreeO[3].length-1,1).map(
    (i)=>{
        HthreeO[3][i].should.be.a.String()
    }
)
HthreeO[2].indexOf(HthreeO[1][HthreeO[1].length-1]).should.not.be.False()
HthreeO[3].indexOf(HthreeO[1][HthreeO[1].length-2]).should.not.be.False()
HthreeO[1].indexOf(HthreeO[3][HthreeO[3].length-1]).should.not.be.False()
HthreeO[1].indexOf(HthreeO[2][HthreeO[2].length-2]).should.not.be.False()



// CC(=O)O (acetic acid) + water

// aluminum chloride ([Al](Cl)(Cl)Cl) (Lewis acid) + dimethyl ether (COC) (Lewis base)

// oOf8ZoXI`@.pE/$DLX2H(FKI7PC$I51

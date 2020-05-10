// https://www.npmjs.com/package/should
// npm i should
const should = require('should')

const MoleculeController = require('./Controllers/Molecule')
const FunctionalGroups = require('./Models/FunctionalGroups')
const Canonical_SMILESParser = require("./Models/CanonicalSMILESParser")
const AtomFactory = require('./Models/AtomFactory')

const MoleculeFactory = require('./Models/MoleculeFactory')
const PeriodicTable = require("./Models/PeriodicTable")
const CContainer = require('./Controllers/Container')
const CMolecule = require('./Controllers/Molecule')
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
watermolecule[0].should.be.a.equal(14)
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

const WaterController = CMolecule(watermolecule)
WaterController.bondCount(watermolecule[1]).should.be.equal(1)
WaterController.bondCount(watermolecule[2]).should.be.equal(1)
WaterController.bondCount(watermolecule[3]).should.be.equal(2) // Oxygen

const hcl = MoleculeFactory("HCl")
const HCLController = CMolecule(hcl)
HCLController.bondCount(hcl[1]).should.be.equal(1)
HCLController.bondCount(hcl[2]).should.be.equal(1)
hcl.should.be.a.Array()
hcl.length.should.be.equal(3)
hcl[0].should.be.a.Number()
hcl[0].should.be.a.equal(-6.3)
hcl[1].should.be.a.Array()
hcl[1].length.should.be.a.equal(6)
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


const ccontainer = new CContainer([false], MoleculeFactory, MoleculeController, 1)

// HCl + H2O <-> Cl- + H3O+
//  CONTAINER MODEL
// is vacuum, molecule, molecule ...
ccontainer.add("HCl",1)
ccontainer.container.length.should.be.equal(2)
ccontainer.container[0].should.be.equal(false)
ccontainer.container[1].should.be.a.Array()
// pKa of HCl is -6.3
// pKa of water is 14


ccontainer.add("water",1)

ccontainer.container.length.should.be.equal(3)

const Clneg = ccontainer.container[1]
Clneg.should.be.a.Array()
Clneg.length.should.be.a.equal(2)
Clneg[0].should.be.equal(2.86) // pKa of Cl- is 2.86



Clneg[1].length.should.be.a.equal(12) // [Cl-] has 8 valence electrons
Clneg[1][0].should.be.a.String()
Clneg[1][0].should.be.equal("Cl")
range.range(1,3,1).map(
    (i)=>{
        Clneg[1][i].should.be.a.Number()
    }
) 
Clneg[1][1].should.be.equal(17)
Clneg[1][2].should.be.equal(7)
Clneg[1][3].should.be.equal(1)
range.range(4,Clneg[1].length-1,1).map(
    (i)=>{
        Clneg[1][i].should.be.a.String()
    }
)

const HthreeO = ccontainer.container[2]



HthreeO.should.be.a.Array()

HthreeO[0].should.be.equal(-1.74) // pKa of H30+ is -1.74

HthreeO.length.should.be.a.equal(5)

HthreeO[1][0].should.be.a.String()
HthreeO[1][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        HthreeO[1][i].should.be.a.Number()
    }
) 
HthreeO[1][1].should.be.equal(1)
HthreeO[1][2].should.be.equal(1)
HthreeO[1][3].should.be.equal(1)
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
HthreeO[2][1].should.be.equal(1)
HthreeO[2][2].should.be.equal(1)
HthreeO[2][3].should.be.equal(1)
range.range(4,HthreeO[2].length-1,1).map(
    (i)=>{
        HthreeO[2][i].should.be.a.String()
    }
)

/*
[ 9999,
  [ 'H', 1, 1, 1, 'a9fq447o4k9df3xo5', 'a9fq447o4k9df3xnz' ],
  [ 'H', 1, 1, 1, 'a9fq447o4k9df3xo6', 'a9fq447o4k9df3xo0' ],
  [ 'O',
    8,
    6,
    2,
    'a9fq447o4k9df3xnz',
    'a9fq447o4k9df3xo0',
    'a9fq447o4k9df3xo1',
    'a9fq447o4k9df3xo2',
    'a9fq447o4k9df3xo3',
    'a9fq447o4k9df3xo4',
    'a9fq447o4k9df3xo5',
    'a9fq447o4k9df3xo6',
    'a9fq447o4k9df3xny' ],
  [ 'H', 1, 1, 1, 'a9fq447o4k9df3xny', 'a9fq447o4k9df3xo4' ] ]

 */
HthreeO[3][0].should.be.a.String()
HthreeO[3].length.should.be.equal(12) // O on H3O should have 8 valence electrons with 3 being shared
//MoleculeController(HthreeO).bondCount(HthreeO[3]).should.be.equal(3)
HthreeO[3][0].should.be.equal("O")
range.range(1,3,1).map(
    (i)=>{
        HthreeO[3][i].should.be.a.Number()
    }
) 
HthreeO[3][1].should.be.equal(8)
HthreeO[3][2].should.be.equal(6)
HthreeO[3][3].should.be.equal(2)
range.range(4,HthreeO[3].length-1,1).map(
    (i)=>{
        HthreeO[3][i].should.be.a.String()
    }
)

HthreeO[4][0].should.be.a.String()
HthreeO[4][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        HthreeO[4][i].should.be.a.Number()
    }
) 
HthreeO[4][1].should.be.equal(1)
HthreeO[4][2].should.be.equal(1)
HthreeO[4][3].should.be.equal(1)
range.range(4,HthreeO[4].length-1,1).map(
    (i)=>{
        HthreeO[4][i].should.be.a.String()
    }
)
HthreeO[2].indexOf(HthreeO[1][HthreeO[1].length-1]).should.not.be.False()
HthreeO[3].indexOf(HthreeO[1][HthreeO[1].length-2]).should.not.be.False()
HthreeO[1].indexOf(HthreeO[3][HthreeO[3].length-1]).should.not.be.False()
HthreeO[1].indexOf(HthreeO[2][HthreeO[2].length-2]).should.not.be.False()


const ccontainer2 = new CContainer([false], MoleculeFactory, MoleculeController, 2)
ccontainer2.add(Clneg,1)
ccontainer2.add(HthreeO,1)

//console.log(ccontainer2.container)


// console.log(ccontainer.container)


const ccontainer3 = new CContainer([false], MoleculeFactory, MoleculeController, 3)

const aluminumChloride = MoleculeFactory("[Al](Cl)(Cl)Cl")
aluminumChloride.filter(
    (atom) => {
        return atom[0] === "H"
    }
).length.should.be.equal(0)

const dimethylEther = MoleculeFactory("COC") // 6 hydrogens
dimethylEther.length.should.be.equal(10)
dimethylEther.filter(
    (atom) => {
        return atom[0] === "H"
    }
).length.should.be.equal(6)
dimethylEther[0].should.be.equal(-3.5)

//console.log(aluminumChloride)
ccontainer3.add(aluminumChloride,1)
ccontainer3.add(dimethylEther,1)

const hbr = MoleculeFactory("HBr")
const HBrController = CMolecule(hcl)
HBrController.bondCount(hbr[1]).should.be.equal(1)
HBrController.bondCount(hbr[2]).should.be.equal(1)
hbr[0].should.be.a.equal(-6.3)
hbr[1].should.be.a.Array()
hbr[1].length.should.be.a.equal(6)
hbr[1][0].should.be.a.String()
hbr[1][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        hbr[1][i].should.be.a.Number()
    }
) 
hbr[1][1].should.be.equal(1)
hbr[1][2].should.be.equal(1)
hbr[1][3].should.be.equal(1)
range.range(4,hbr[1].length-1).map(
    (i)=>{
        hbr[2][i].should.be.a.String()
    }
)
hbr[2].should.be.a.Array()
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

// CH3CH=CHCH3
const butene = MoleculeFactory("CC=CC")

console.log("All tests succeeded")


// CC(=O)O (acetic acid) + water

// aluminum chloride ([Al](Cl)(Cl)Cl) (Lewis acid) + dimethyl ether (COC) (Lewis base)

// oOf8ZoXI`@.pE/$DLX2H(FKI7PC$I51

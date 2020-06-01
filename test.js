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
const Set = require('./Models/Set')





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

// HCl
ccontainer.container[1].length.should.be.equal(3)

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


console.log("Test 1 complete")
//process.exit()


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

console.log("Test 2 complete")
//process.exit()

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

ccontainer3.add(aluminumChloride,1) // Aluminium Chloride is a Lewis acid and accepts and electron pair
ccontainer3.add(dimethylEther,1) // Dimethyl Ether is a Lewis base and donates an electron pair (oxygen atom)

console.log("Test 3 complete")
//process.exit()



const hbr = MoleculeFactory("HBr")
// Check for hydrogen
hbr.slice(1).filter(
    (atom) => {
        return atom[0] === 'H'
    }
).length.should.be.equal(1)
hbr.length.should.be.equal(3)
const HBrController = CMolecule(hbr)
HBrController.bondCount(hbr[1]).should.be.equal(1)
HBrController.bondCount(hbr[2]).should.be.equal(1)
hbr[0].should.be.a.equal(12345)
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
hbr[2].length.should.be.a.equal(12)
hbr[2][0].should.be.a.String()
hbr[2][0].should.be.equal("Br")
range.range(1,3,1).map(
    (i)=>{
        hbr[2][i].should.be.a.Number()
    }
) 
hbr[2][1].should.be.equal(35)
hbr[2][2].should.be.equal(7)
hbr[2][3].should.be.equal(1)
range.range(4,hcl[2].length-1,1).map(
    (i)=>{
        hbr[2][i].should.be.a.String()
    }
)
hbr[2].indexOf(hbr[1][hbr[1].length-1]).should.not.be.False()
hbr[1].indexOf(hbr[2][hbr[2].length-1]).should.not.be.False()

// CH3CH=CHCH3
const butene = MoleculeFactory("CC=CC")
const buteneController = CMolecule(butene)
HBrController.bondCount(hbr[1]).should.be.equal(1)
HBrController.bondCount(hbr[2]).should.be.equal(1)
hbr[0].should.be.a.equal(12345)
hbr[1].should.be.a.Array()
hbr[1].length.should.be.a.equal(6)
hbr[1][0].should.be.a.String()
hbr[1][0].should.be.equal("H")
range.range(1,3,1).map(
    (i)=>{
        hbr[1][i].should.be.a.Number()
    }
) 

const ccontainer4 = new CContainer([false], MoleculeFactory, MoleculeController, 4)
ccontainer4.add(butene,1)
ccontainer4.add(hbr,1)

console.log("Test 4 complete")

ccontainer4.container.length.should.be.equal(3)

// CH3[C+]H-CH(H)CH3
const carbocation = ccontainer4.container[1]
//console.log(carbocation)
//process.exit()
carbocation.slice(1).filter(
  (atom) => {
    return atom[0] === "H"
  }
).length.should.be.equal(9)
carbocation.slice(1).filter(
    (atom) => {
        return atom[0] === "C"
    }
).length.should.be.equal(4)

//console.log(carbocation)
/*
[ 12345,
  [ 'H', 1, 1, 1, '26f1151ckavyl85g', '26f1151ckavyl850' ], 1
  [ 'H', 1, 1, 1, '26f1151ckavyl85h', '26f1151ckavyl851' ], 2
  [ 'H', 1, 1, 1, '26f1151ckavyl85i', '26f1151ckavyl852' ], 3
  [ 'C',
    6,
    4,
    4,
    '26f1151ckavyl850',
    '26f1151ckavyl851',
    '26f1151ckavyl852',
    '26f1151ckavyl853',
    '26f1151ckavyl857',
    '26f1151ckavyl85g',
    '26f1151ckavyl85h',
    '26f1151ckavyl85i' ],4
  [ 'H', 1, 1, 1, '26f1151ckavyl85j', '26f1151ckavyl854' ], 5
  [ 'C',
    6,
    4,
    4,
    '26f1151ckavyl854',
    '26f1151ckavyl855',
    '26f1151ckavyl856',
    '26f1151ckavyl857',
    '26f1151ckavyl853',
    '26f1151ckavyl85b',
    '26f1151ckavyl85a',
    '26f1151ckavyl85j' ], 6
  [ 'H', 1, 1, 1, '26f1151ckavyl85k', '26f1151ckavyl858' ], 7
  [ 'C',
    6,
    4,
    4,
    '26f1151ckavyl858',
    '26f1151ckavyl859',
    '26f1151ckavyl85a',
    '26f1151ckavyl85b',
    '26f1151ckavyl85f',
    '26f1151ckavyl85k' ], 8
  [ 'H', 1, 1, 1, '26f1151ckavyl85l', '26f1151ckavyl85c' ], 9
  [ 'H', 1, 1, 1, '26f1151ckavyl85m', '26f1151ckavyl85d' ], 10
  [ 'H', 1, 1, 1, '26f1151ckavyl85n', '26f1151ckavyl85e' ], 11
  [ 'C',
    6,
    4,
    4,
    '26f1151ckavyl85c',
    '26f1151ckavyl85d',
    '26f1151ckavyl85e',
    '26f1151ckavyl85f',
    '26f1151ckavyl859',
    '26f1151ckavyl85l',
    '26f1151ckavyl85m',
    '26f1151ckavyl85n' ], 12
  [ 'H', 1, 1, 1, '26f1151ckavyl855', '26f1151ckavyl856' ] 13 ]

 */

carbocation[1][0].should.be.equal("H")
carbocation[2][0].should.be.equal("H")
carbocation[3][0].should.be.equal("H")
carbocation[4][0].should.be.equal("C")
Set().intersection(carbocation[4].slice(4), carbocation[1].slice(4)).length.should.be.equal(2)
Set().intersection(carbocation[4].slice(4), carbocation[2].slice(4)).length.should.be.equal(2)
Set().intersection(carbocation[4].slice(4), carbocation[3].slice(4)).length.should.be.equal(2)
carbocation[5][0].should.be.equal("H")
carbocation[6][0].should.be.equal("C")
Set().intersection(carbocation[6].slice(4), carbocation[5].slice(4)).length.should.be.equal(2)
Set().intersection(carbocation[6].slice(4), carbocation[4].slice(4)).length.should.be.equal(2)
carbocation[7][0].should.be.equal("H")
carbocation[8][0].should.be.equal("C")
carbocation[9][0].should.be.equal("H")
Set().intersection(carbocation[7].slice(4), carbocation[8].slice(4)).length.should.be.equal(2)
Set().intersection(carbocation[8].slice(4), carbocation[6].slice(4)).length.should.be.equal(2) // not ok 4
carbocation[10][0].should.be.equal("H")
carbocation[12][0].should.be.equal("C")
carbocation[13][0].should.be.equal("H")

const brNeg = ccontainer4.container[2]
brNeg.slice(1).filter(
  (atom) => {
    return atom[0] === "H"
  }
).length.should.be.equal(0)


// [Br-] (nucleophile) -----> carbocation
// Br atom should bond to carbon that has three bonds
// Target atom index should be 8
// Source atom index should be 1
const ccontainer5 = new CContainer([false], MoleculeFactory, MoleculeController, 5)
ccontainer5.add(brNeg,1)
ccontainer5.add(carbocation,1)
ccontainer5.container.length.should.be.equal(2)

ccontainer5.container[1].slice(1).filter(
  (atom) => {
    return atom[0] === "H"
  }
).length.should.be.equal(9)


// console.log(ccontainer5['container'])
/*
[ false,
  [ 12345, 0
    [ 'Br',35,7,1,'26f1153zkavz8oli','26f1153zkavz8olj','26f1153zkavz8olk','26f1153zkavz8oll',
      '26f1153zkavz8olm','26f1153zkavz8oln','26f1153zkavz8olo','26f1153zkavz8olp' ], 1
    [ 'H', 1, 1, 1, '26f1153zkavz8om6', '26f1153zkavz8olq' ], 2
    [ 'H', 1, 1, 1, '26f1153zkavz8om7', '26f1153zkavz8olr' ], 3
    [ 'H', 1, 1, 1, '26f1153zkavz8om8', '26f1153zkavz8ols' ], 4
    [ 'C',6,4,4,'26f1153zkavz8olq','26f1153zkavz8olr','26f1153zkavz8ols','26f1153zkavz8olt',
      '26f1153zkavz8olx','26f1153zkavz8om6','26f1153zkavz8om7','26f1153zkavz8om8' ], 5
    [ 'H', 1, 1, 1, '26f1153zkavz8om9', '26f1153zkavz8olu' ], 6
    [ 'C',6,4,4, '26f1153zkavz8olu','26f1153zkavz8olv','26f1153zkavz8olw','26f1153zkavz8olx',
      '26f1153zkavz8olt','26f1153zkavz8om1','26f1153zkavz8om0','26f1153zkavz8om9' ], 7
    [ 'H', 1, 1, 1, '26f1153zkavz8oma', '26f1153zkavz8oly' ], 8
    [ 'C',6,4,4,'26f1153zkavz8oly','26f1153zkavz8olz','26f1153zkavz8om0','26f1153zkavz8om1',
     '26f1153zkavz8om5','26f1153zkavz8oma' ], 9
    [ 'H', 1, 1, 1, '26f1153zkavz8omb', '26f1153zkavz8om2' ], 10
    [ 'H', 1, 1, 1, '26f1153zkavz8omc', '26f1153zkavz8om3' ], 11
    [ 'H', 1, 1, 1, '26f1153zkavz8omd', '26f1153zkavz8om4' ], 12
    [ 'C',6,4,4,'26f1153zkavz8om2','26f1153zkavz8om3','26f1153zkavz8om4','26f1153zkavz8om5',
      '26f1153zkavz8olz','26f1153zkavz8omb','26f1153zkavz8omc','26f1153zkavz8omd' ], 13
    [ 'H', 1, 1, 1, '26f1153zkavz8olv', '26f1153zkavz8olw' ] ]  14 ]

 */

console.log("Test 5 complete")
process.exit()


const propylene = MoleculeFactory("CC=C")
// watermolecule

const ccontainer6 = new CContainer([false], MoleculeFactory, MoleculeController, 6)
ccontainer6.add(propylene, 1)
ccontainer6.add(watermolecule, 1)
// We shouldnt have a reaction
ccontainer6.length.should.equal(3)
ccontainer6[1].should.equal(propylene)
ccontainer6[2].should.equal(watermolecule)

const sulfuric_acid = MoleculeFactory("OS(=O)(=O)O")
ccontainer6.add(sulfuric_acid, 1)
ccontainer6.length.should.equal(3)

console.log("All tests succeeded")


// CC(=O)O (acetic acid) + water

// aluminum chloride ([Al](Cl)(Cl)Cl) (Lewis acid) + dimethyl ether (COC) (Lewis base)

// oOf8ZoXI`@.pE/$DLX2H(FKI7PC$I51

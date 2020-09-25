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
const range = require("range")
const Set = require('./Models/Set')

const VMolecule = require('./Views/Molecule')

const MoleculeLookup = require('./Controllers/MoleculeLookup')
const PubChemLookup = require('./Controllers/PubChemLookup')

// Install using npm install pubchem-access
const pubchem = require("pubchem-access").domain("compound");
const uniqid = require('uniqid');

// Install using npm install mongodb --save
const MongoClient = require('mongodb').MongoClient
const assert = require('assert');

const verbose = false

// Install using npm install dotenv
require("dotenv").config()


//const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://" + process.env.MONGODBUSER + ":" + process.env.MONGODBPASSWORD + "@cluster0.awqh6.mongodb.net/chemistry?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {

    assert.equal(err, null);
    const db = client.db("chemistry")
    // perform actions on the collection object

    // MOLECULE MODEL
// pKa, atom, atom, atom ...
// ATOM MODEL
// atomic symbol, proton count, valence count, std number of bonds, velectron1, velectron2, velectron3
    const propylene = MoleculeFactory("CC=C")
    const watermolecule = MoleculeFactory("water", verbose)
    console.log(VMolecule(watermolecule).canonicalSMILES(1))
    const hcl = MoleculeFactory("HCl", verbose)
//VMolecule(hcl).render(1)
    console.log(VMolecule(hcl).canonicalSMILES(1))
    console.log(VMolecule(propylene).canonicalSMILES(1))
//VMolecule(propylene).render(1)


    const pkl = PubChemLookup((err)=>{
        console.log(err)
        process.exit()
    })

    const onMoleculeFoundOInDB = (molecule) => {
        console.log("Molecule found")
        pkl.fetchSubstructuresBySMILES("CC=C", db, (molecule, db, SMILES)=> {
            console.log("Molecule: " + molecule)
        })
    }



    MoleculeLookup(db, "CC=C", "SMILES", true).then(
        // "resolves" callback
        onMoleculeFoundOInDB,
        // Nothing found callback
        (search) => {
            console.log("Molecule not found " + search)
            pkl.searchBySMILES(search.replace(/\(\)/g, ""), db, (molecule_from_pubchem) => {
                if (molecule_from_pubchem !== null) {
                    console.log("Molecule found in pubchem")
                    molecule_from_pubchem['json'] = MoleculeFactory(search)
                    db.collection("molecules").insertOne(molecule_from_pubchem, (err, result) => {
                        if (err) {
                            console.log(err)
                            client.close()
                            process.exit()
                        } else {
                            console.log("Molecule " + search + " added to database")
                            client.close()
                            process.exit()
                        }
                    })
                }

            })
        },
        // "rejects" callback
        (Err) => {
            console.log(Err)
            client.close();
            process.exit()
        }
    )


});


if (false) {
    MongoClient.connect('mongodb+srv://' + process.env.MONGODBUSER + ':' + process.env.MONGODBPASSWORD + '@clustercluster0-awqh6.mongodb.net', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function (err, client) {

        assert.equal(err, null);
        const db = client.db('chemistry');


// MOLECULE MODEL
// pKa, atom, atom, atom ...
// ATOM MODEL
// atomic symbol, proton count, valence count, std number of bonds, velectron1, velectron2, velectron3
        const propylene = MoleculeFactory("CC=C")
        const watermolecule = MoleculeFactory("water", verbose)
        console.log(VMolecule(watermolecule).canonicalSMILES(1))
        const hcl = MoleculeFactory("HCl", verbose)
//VMolecule(hcl).render(1)
        console.log(VMolecule(hcl).canonicalSMILES(1))
        console.log(VMolecule(propylene).canonicalSMILES(1))
//VMolecule(propylene).render(1)

        MoleculeLookup(db, tokens[0]).then(
            // "resolves" callback
            (first_molecule_JSON_object) => {

                if (undefined === tokens[2]) {
                    ArrheniusBaseReaction(potassium_hydroxide)
                } else {
                    if (tokens[2] === false) {
                        return false
                    }
                    MoleculeLookup(db, tokens[2]).then(
                        // "resolves" callback
                        (second_molecule_JSON_object) => {
                            ArrheniusAcidicReaction(first_molecule_JSON_object, second_molecule_JSON_object)
                        },
                        // "rejects" callback
                        (Err) => {
                            console.error(new Error("Cannot load second molecule"))
                        }
                    )
                }

            },
            // "rejects" callback
            (Err) => {
                console.error(new Error("Cannot load first molecule"))
            }
        )


        process.exit()

        if (verbose) {
            console.log('test:: watermolecule ->')
            console.log(watermolecule)
        }

        watermolecule.should.be.a.Array()
        watermolecule.length.should.be.equal(4)
        watermolecule[0].should.be.a.Number()
        watermolecule[0].should.be.a.equal(14)
        watermolecule[1].should.be.a.Array()
//watermolecule[1].length.should.be.a.equal(6)
        watermolecule[1][0].should.be.a.String()
        watermolecule[1][0].should.be.equal("H")
        range.range(1, 3, 1).map(
            (i) => {
                watermolecule[1][i].should.be.a.Number()
            }
        )
        watermolecule[1][1].should.be.equal(1)
        watermolecule[1][2].should.be.equal(1)
        watermolecule[1][3].should.be.equal(1)
        range.range(4, watermolecule[1].length - 1).map(
            (i) => {
                watermolecule[2][i].should.be.a.String()
            }
        )
        watermolecule[2].should.be.a.Array()
//watermolecule[2].length.should.be.a.equal(6)
        watermolecule[2][0].should.be.a.String()
        watermolecule[2][0].should.be.equal("H")
        range.range(1, 3, 1).map(
            (i) => {
                watermolecule[2][i].should.be.a.Number()
            }
        )
        watermolecule[2][1].should.be.equal(1)
        watermolecule[2][2].should.be.equal(1)
        watermolecule[2][3].should.be.equal(1)
        range.range(4, watermolecule[2].length - 1, 1).map(
            (i) => {
                watermolecule[2][i].should.be.a.String()
            }
        )
        watermolecule[3].should.be.a.Array()
        watermolecule[3].length.should.be.a.equal(12)
        watermolecule[3][0].should.be.a.String()
        watermolecule[3][0].should.be.equal("O")
        range.range(1, 3, 1).map(
            (i) => {
                watermolecule[3][i].should.be.a.Number()
            }
        )
        watermolecule[3][1].should.be.equal(8)
        watermolecule[3][2].should.be.equal(6)
        watermolecule[3][3].should.be.equal(2)
        range.range(4, watermolecule[3].length - 1, 1).map(
            (i) => {
                watermolecule[3][i].should.be.a.String()
            }
        )
        watermolecule[3].indexOf(watermolecule[2][watermolecule[2].length - 1]).should.not.be.False()
        watermolecule[2].indexOf(watermolecule[3][watermolecule[3].length - 1]).should.not.be.False()
        watermolecule[2].indexOf(watermolecule[1][watermolecule[1].length - 1]).should.not.be.False()
        watermolecule[1].indexOf(watermolecule[2][watermolecule[2].length - 1]).should.not.be.False()

        const WaterController = CMolecule([watermolecule, 1])
        if (verbose) {
            console.log('Created water molecule controller')
        }
        WaterController.bondCount(watermolecule[1], verbose).should.be.equal(1)
        WaterController.bondCount(watermolecule[2], verbose).should.be.equal(1)
        WaterController.bondCount(watermolecule[3], verbose).should.be.equal(2) // Oxygen

        const HCLController = CMolecule([hcl, 1], verbose)
        HCLController.bondCount(hcl[1], verbose).should.be.equal(1)
        HCLController.bondCount(hcl[2], verbose).should.be.equal(1)
        hcl.should.be.a.Array()
        hcl.length.should.be.equal(3)
        hcl[0].should.be.a.Number()
        hcl[0].should.be.a.equal(-6.3)
        hcl[1].should.be.a.Array()
        hcl[1].length.should.be.a.equal(6)
        hcl[1][0].should.be.a.String()
        hcl[1][0].should.be.equal("H")
        range.range(1, 3, 1).map(
            (i) => {
                hcl[1][i].should.be.a.Number()
            }
        )
        hcl[1][1].should.be.equal(1)
        hcl[1][2].should.be.equal(1)
        hcl[1][3].should.be.equal(1)
        range.range(4, hcl[1].length - 1).map(
            (i) => {
                hcl[2][i].should.be.a.String()
            }
        )
        hcl[2].should.be.a.Array()
        hcl[2].length.should.be.a.equal(12)
        hcl[2][0].should.be.a.String()
        hcl[2][0].should.be.equal("Cl")
        range.range(1, 3, 1).map(
            (i) => {
                hcl[2][i].should.be.a.Number()
            }
        )
        hcl[2][1].should.be.equal(17)
        hcl[2][2].should.be.equal(7)
        hcl[2][3].should.be.equal(1)
        range.range(4, hcl[2].length - 1, 1).map(
            (i) => {
                hcl[2][i].should.be.a.String()
            }
        )
        hcl[2].indexOf(hcl[1][hcl[1].length - 1]).should.not.be.False()
        hcl[1].indexOf(hcl[2][hcl[2].length - 1]).should.not.be.False()


        const ccontainer = new CContainer([false], MoleculeFactory, MoleculeController, 1, verbose)

// HCl + H2O <-> Cl- + H3O+
//  CONTAINER MODEL
// is vacuum, molecule, molecule ...
        ccontainer.add("HCl", 1, verbose)
        ccontainer.container.length.should.be.equal(2)
        ccontainer.container[0].should.be.equal(false)
        ccontainer.container[1].should.be.a.Array()
// pKa of HCl is -6.3
// pKa of water is 14

// HCl
        ccontainer.container[1].length.should.be.equal(3)

        ccontainer.add("water", 1, verbose)

        ccontainer.container.length.should.be.equal(3)

        const Clneg = ccontainer.container[1]

        if (verbose) {
            console.log("Test: Got Cl- ->")
            console.log(Clneg)
        }
        Clneg.should.be.a.Array()
        Clneg.length.should.be.a.equal(2)
        Clneg[0].should.be.equal(2.86) // pKa of Cl- is 2.86
        Clneg[1].length.should.be.a.equal(12) // [Cl-] has 8 valence electrons
        Clneg[1][0].should.be.a.String()
        Clneg[1][0].should.be.equal("Cl")
        range.range(1, 3, 1).map(
            (i) => {
                Clneg[1][i].should.be.a.Number()
            }
        )
        Clneg[1][1].should.be.equal(17)
        Clneg[1][2].should.be.equal(7)
        Clneg[1][3].should.be.equal(1)
        range.range(4, Clneg[1].length - 1, 1).map(
            (i) => {
                Clneg[1][i].should.be.a.String()
            }
        )


        console.log("Test 1 complete")
        process.exit()


// SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)


// watermolecule

        const ccontainer6 = new CContainer([false], MoleculeFactory, MoleculeController, 6, verbose)
        ccontainer6.add(propylene, 1, verbose)
        ccontainer6.add(watermolecule, 1, verbose)
// We shouldn't have a reaction
        ccontainer6.container.length.should.equal(3)
        ccontainer6.container[1].should.equal(propylene)
        ccontainer6.container[2].should.equal(watermolecule)

        console.log("Test 6 ok")


        const sulfuric_acid = MoleculeFactory("OS(=O)(=O)O", verbose)
        ccontainer6.test_number = 7
        if (verbose) {
            /*
            Sulfuric acid:
        [ 12345,
          [ 'H', 1, 1, 1, 'bqdtz0b3rkdjnb7ro', 'bqdtz0b3rkdjnb7qu' ],
          [ 'O',
            8,
            6,
            2,
            'bqdtz0b3rkdjnb7qu',
            'bqdtz0b3rkdjnb7qv',
            'bqdtz0b3rkdjnb7qw',
            'bqdtz0b3rkdjnb7qx',
            'bqdtz0b3rkdjnb7qy',
            'bqdtz0b3rkdjnb7qz',
            'bqdtz0b3rkdjnb7r5',
            'bqdtz0b3rkdjnb7ro' ],
          [ 'S',
            16,
            6,
            2,
            'bqdtz0b3rkdjnb7r0',
            'bqdtz0b3rkdjnb7r1',
            'bqdtz0b3rkdjnb7r2',
            'bqdtz0b3rkdjnb7r3',
            'bqdtz0b3rkdjnb7r4',
            'bqdtz0b3rkdjnb7r5',
            'bqdtz0b3rkdjnb7qz',
            'bqdtz0b3rkdjnb7rb',
            'bqdtz0b3rkdjnb7ra',
            'bqdtz0b3rkdjnb7rh',
            'bqdtz0b3rkdjnb7rg',
            'bqdtz0b3rkdjnb7rn' ],
          [ 'O',
            8,
            6,
            2,
            'bqdtz0b3rkdjnb7r6',
            'bqdtz0b3rkdjnb7r7',
            'bqdtz0b3rkdjnb7r8',
            'bqdtz0b3rkdjnb7r9',
            'bqdtz0b3rkdjnb7ra',
            'bqdtz0b3rkdjnb7rb',
            'bqdtz0b3rkdjnb7r4',
            'bqdtz0b3rkdjnb7r3' ],
          [ 'O',
            8,
            6,
            2,
            'bqdtz0b3rkdjnb7rc',
            'bqdtz0b3rkdjnb7rd',
            'bqdtz0b3rkdjnb7re',
            'bqdtz0b3rkdjnb7rf',
            'bqdtz0b3rkdjnb7rg',
            'bqdtz0b3rkdjnb7rh',
            'bqdtz0b3rkdjnb7r2',
            'bqdtz0b3rkdjnb7r1' ],
          [ 'H', 1, 1, 1, 'bqdtz0b3rkdjnb7rp', 'bqdtz0b3rkdjnb7ri' ],
          [ 'O',
            8,
            6,
            2,
            'bqdtz0b3rkdjnb7ri',
            'bqdtz0b3rkdjnb7rj',
            'bqdtz0b3rkdjnb7rk',
            'bqdtz0b3rkdjnb7rl',
            'bqdtz0b3rkdjnb7rm',
            'bqdtz0b3rkdjnb7rn',
            'bqdtz0b3rkdjnb7r0',
            'bqdtz0b3rkdjnb7rp' ] ]

             */
        }
        ccontainer6.add(sulfuric_acid, 1, verbose)
        ccontainer6.container.length.should.equal(4)

        if (verbose) {
            console.log('Test 7 test.js')
            console.log('Substrate (protonated propylene) -->')
            console.log(ccontainer6.container[1])
            console.log('Water -->')
            console.log(ccontainer6.container[2])
            console.log('Reagent (deprotonated sulfuric acid) -->')
            console.log(ccontainer6.container[3])
        }
        console.log('Test 7 ok')
        process.exit()


        const HthreeO = ccontainer.container[2]


        HthreeO.should.be.a.Array()

        HthreeO[0].should.be.equal(-1.74) // pKa of H30+ is -1.74

        HthreeO.length.should.be.a.equal(5)

        HthreeO[1][0].should.be.a.String()
        HthreeO[1][0].should.be.equal("H")
        range.range(1, 3, 1).map(
            (i) => {
                HthreeO[1][i].should.be.a.Number()
            }
        )
        HthreeO[1][1].should.be.equal(1)
        HthreeO[1][2].should.be.equal(1)
        HthreeO[1][3].should.be.equal(1)
        range.range(4, HthreeO[1].length - 1, 1).map(
            (i) => {
                HthreeO[1][i].should.be.a.String()
            }
        )

        HthreeO[2][0].should.be.a.String()
        HthreeO[2][0].should.be.equal("H")
        range.range(1, 3, 1).map(
            (i) => {
                HthreeO[2][i].should.be.a.Number()
            }
        )
        HthreeO[2][1].should.be.equal(1)
        HthreeO[2][2].should.be.equal(1)
        HthreeO[2][3].should.be.equal(1)
        range.range(4, HthreeO[2].length - 1, 1).map(
            (i) => {
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
        range.range(1, 3, 1).map(
            (i) => {
                HthreeO[3][i].should.be.a.Number()
            }
        )
        HthreeO[3][1].should.be.equal(8)
        HthreeO[3][2].should.be.equal(6)
        HthreeO[3][3].should.be.equal(2)
        range.range(4, HthreeO[3].length - 1, 1).map(
            (i) => {
                HthreeO[3][i].should.be.a.String()
            }
        )

        HthreeO[4][0].should.be.a.String()
        HthreeO[4][0].should.be.equal("H")
        range.range(1, 3, 1).map(
            (i) => {
                HthreeO[4][i].should.be.a.Number()
            }
        )
        HthreeO[4][1].should.be.equal(1)
        HthreeO[4][2].should.be.equal(1)
        HthreeO[4][3].should.be.equal(1)
        range.range(4, HthreeO[4].length - 1, 1).map(
            (i) => {
                HthreeO[4][i].should.be.a.String()
            }
        )
        HthreeO[2].indexOf(HthreeO[1][HthreeO[1].length - 1]).should.not.be.False()
        HthreeO[3].indexOf(HthreeO[1][HthreeO[1].length - 2]).should.not.be.False()
        HthreeO[1].indexOf(HthreeO[3][HthreeO[3].length - 1]).should.not.be.False()
        HthreeO[1].indexOf(HthreeO[2][HthreeO[2].length - 2]).should.not.be.False()


        const ccontainer2 = new CContainer([false], MoleculeFactory, MoleculeController, 2)
        ccontainer2.add(Clneg, 1)
        ccontainer2.add(HthreeO, 1)

        console.log("Test 2 complete")
//process.exit()

        const ccontainer3 = new CContainer([false], MoleculeFactory, MoleculeController, 3, verbose)

        const aluminumChloride = MoleculeFactory("[Al](Cl)(Cl)Cl", verbose)
        aluminumChloride.filter(
            (atom) => {
                return atom[0] === "H"
            }
        ).length.should.be.equal(0)

        const dimethylEther = MoleculeFactory("COC", verbose) // 6 hydrogens
        dimethylEther.length.should.be.equal(10)
        dimethylEther.filter(
            (atom) => {
                return atom[0] === "H"
            }
        ).length.should.be.equal(6)
        dimethylEther[0].should.be.equal(-3.5)

// @see Organic Chemistry 8th edition p76
        ccontainer3.add(aluminumChloride, 1, verbose) // Aluminium Chloride is a Lewis acid and accepts and electron pair
        ccontainer3.add(dimethylEther, 1, verbose) // Dimethyl Ether is a Lewis base and donates an electron pair (oxygen atom)

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
        const HBrController = CMolecule([hbr, 1])
        HBrController.bondCount(hbr[1]).should.be.equal(1)
        HBrController.bondCount(hbr[2]).should.be.equal(1)
        hbr[0].should.be.a.equal(12345)
        hbr[1].should.be.a.Array()
        hbr[1].length.should.be.a.equal(6)
        hbr[1][0].should.be.a.String()
        hbr[1][0].should.be.equal("H")
        range.range(1, 3, 1).map(
            (i) => {
                hbr[1][i].should.be.a.Number()
            }
        )
        hbr[1][1].should.be.equal(1)
        hbr[1][2].should.be.equal(1)
        hbr[1][3].should.be.equal(1)
        range.range(4, hbr[1].length - 1).map(
            (i) => {
                hbr[2][i].should.be.a.String()
            }
        )
        hbr[2].should.be.a.Array()
        hbr[2].length.should.be.a.equal(12)
        hbr[2][0].should.be.a.String()
        hbr[2][0].should.be.equal("Br")
        range.range(1, 3, 1).map(
            (i) => {
                hbr[2][i].should.be.a.Number()
            }
        )
        hbr[2][1].should.be.equal(35)
        hbr[2][2].should.be.equal(7)
        hbr[2][3].should.be.equal(1)
        range.range(4, hcl[2].length - 1, 1).map(
            (i) => {
                hbr[2][i].should.be.a.String()
            }
        )
        hbr[2].indexOf(hbr[1][hbr[1].length - 1]).should.not.be.False()
        hbr[1].indexOf(hbr[2][hbr[2].length - 1]).should.not.be.False()

// CH3CH=CHCH3
        const butene = MoleculeFactory("CC=CC")
        const buteneController = CMolecule([butene, 1])
        HBrController.bondCount(hbr[1]).should.be.equal(1)
        HBrController.bondCount(hbr[2]).should.be.equal(1)
        hbr[0].should.be.a.equal(12345)
        hbr[1].should.be.a.Array()
        hbr[1].length.should.be.a.equal(6)
        hbr[1][0].should.be.a.String()
        hbr[1][0].should.be.equal("H")
        range.range(1, 3, 1).map(
            (i) => {
                hbr[1][i].should.be.a.Number()
            }
        )

// See organic chemistry 8th edition ch 6 p 235
// C=C (butene, nucleophile) -> HBr (H is electrophile)
// Butene:
        /*
        [ 12345, 0
          [ 'H', 1, 1, 1, '2edg3og5glkb4obdla', '2edg3og5glkb4obdku' ], 1
          [ 'H', 1, 1, 1, '2edg3og5glkb4obdlb', '2edg3og5glkb4obdkv' ], 2
          [ 'H', 1, 1, 1, '2edg3og5glkb4obdlc', '2edg3og5glkb4obdkw' ], 3
          [ 'C', 6, 4, 4,'2edg3og5glkb4obdku','2edg3og5glkb4obdkv','2edg3og5glkb4obdkw', 4
            '2edg3og5glkb4obdkx','2edg3og5glkb4obdl1','2edg3og5glkb4obdla',
            '2edg3og5glkb4obdlb','2edg3og5glkb4obdlc' ],
          [ 'H', 1, 1, 1, '2edg3og5glkb4obdld', '2edg3og5glkb4obdky' ], 5
          [ 'C', 6,4,4,'2edg3og5glkb4obdky','2edg3og5glkb4obdkz', 6
            '2edg3og5glkb4obdl0','2edg3og5glkb4obdl1','2edg3og5glkb4obdkx',
            '2edg3og5glkb4obdl5','2edg3og5glkb4obdl4','2edg3og5glkb4obdld' ],
          [ 'H', 1, 1, 1, '2edg3og5glkb4obdle', '2edg3og5glkb4obdl2' ], 7
          [ 'C',6,4,4,'2edg3og5glkb4obdl2','2edg3og5glkb4obdl3','2edg3og5glkb4obdl4', 8
            '2edg3og5glkb4obdl5','2edg3og5glkb4obdl0','2edg3og5glkb4obdkz',
            '2edg3og5glkb4obdl9','2edg3og5glkb4obdle' ],
          [ 'H', 1, 1, 1, '2edg3og5glkb4obdlf', '2edg3og5glkb4obdl6' ], 9
          [ 'H', 1, 1, 1, '2edg3og5glkb4obdlg', '2edg3og5glkb4obdl7' ], 10
          [ 'H', 1, 1, 1, '2edg3og5glkb4obdlh', '2edg3og5glkb4obdl8' ], 11
          [ 'C',6,4,4,'2edg3og5glkb4obdl6','2edg3og5glkb4obdl7', 12
            '2edg3og5glkb4obdl8','2edg3og5glkb4obdl9','2edg3og5glkb4obdl3',
            '2edg3og5glkb4obdlf','2edg3og5glkb4obdlg','2edg3og5glkb4obdlh' ]
            ]
         */
//console.log(hbr)
        /*
        [ 12345, 0
          [ 'H', 1, 1, 1, '2edg3og5gokb4ofslh', '2edg3og5gokb4ofsla' ], 1
          [ 'Br', 35,7,1,'2edg3og5gokb4ofsla','2edg3og5gokb4ofslb', 2
            '2edg3og5gokb4ofslc','2edg3og5gokb4ofsld','2edg3og5gokb4ofsle',
            '2edg3og5gokb4ofslf','2edg3og5gokb4ofslg','2edg3og5gokb4ofslh' ]
            ]
         */
        const ccontainer4 = new CContainer([false], MoleculeFactory, MoleculeController, 4)
        ccontainer4.add(butene, 1)
        ccontainer4.add(hbr, 1)

        console.log("Test 4 complete")

        ccontainer4.container.length.should.be.equal(3)

// Organic Chemistry 8th edition, P199
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
        const ccontainer5 = new CContainer([false], MoleculeFactory, MoleculeController, 5, verbose)
        ccontainer5.add(brNeg, 1, verbose, 5.1)
        ccontainer5.add(carbocation, 1, verbose, 5.2)
        ccontainer5.container.length.should.be.equal(2)

        ccontainer5.container[1].slice(1).filter(
            (atom) => {
                return atom[0] === "H"
            }
        ).length.should.be.equal(9)

        console.log("Test 5 result")
        /*
        Test 5 result
        [ false,
          [ 12345,
            [ 'Br',
              35,
              7,
              1,
              'bqdtz09ztkdjmdnd6',
              'bqdtz09ztkdjmdnd7',
              'bqdtz09ztkdjmdnd8',
              'bqdtz09ztkdjmdnd9',
              'bqdtz09ztkdjmdnda',
              'bqdtz09ztkdjmdndb',
              'bqdtz09ztkdjmdndc',
              'bqdtz09ztkdjmdndd' ],
            [ 'H', 1, 1, 1, 'bqdtz09ztkdjmdndu', 'bqdtz09ztkdjmdnde' ],
            [ 'H', 1, 1, 1, 'bqdtz09ztkdjmdndv', 'bqdtz09ztkdjmdndf' ],
            [ 'H', 1, 1, 1, 'bqdtz09ztkdjmdndw', 'bqdtz09ztkdjmdndg' ],
            [ 'C',
              6,
              4,
              4,
              'bqdtz09ztkdjmdnde',
              'bqdtz09ztkdjmdndf',
              'bqdtz09ztkdjmdndg',
              'bqdtz09ztkdjmdndh',
              'bqdtz09ztkdjmdndl',
              'bqdtz09ztkdjmdndu',
              'bqdtz09ztkdjmdndv',
              'bqdtz09ztkdjmdndw' ],
            [ 'H', 1, 1, 1, 'bqdtz09ztkdjmdndx', 'bqdtz09ztkdjmdndi' ],
            [ 'C',
              6,
              4,
              4,
              'bqdtz09ztkdjmdndi',
              'bqdtz09ztkdjmdndj',
              'bqdtz09ztkdjmdndk',
              'bqdtz09ztkdjmdndl',
              'bqdtz09ztkdjmdndh',
              'bqdtz09ztkdjmdndp',
              'bqdtz09ztkdjmdndo',
              'bqdtz09ztkdjmdndx' ],
            [ 'H', 1, 1, 1, 'bqdtz09ztkdjmdndy', 'bqdtz09ztkdjmdndm' ],
            [ 'C',
              6,
              4,
              4,
              'bqdtz09ztkdjmdndm',
              'bqdtz09ztkdjmdndn',
              'bqdtz09ztkdjmdndo',
              'bqdtz09ztkdjmdndp',
              'bqdtz09ztkdjmdndt',
              'bqdtz09ztkdjmdndy' ],
            [ 'H', 1, 1, 1, 'bqdtz09ztkdjmdndz', 'bqdtz09ztkdjmdndq' ],
            [ 'H', 1, 1, 1, 'bqdtz09ztkdjmdne0', 'bqdtz09ztkdjmdndr' ],
            [ 'H', 1, 1, 1, 'bqdtz09ztkdjmdne1', 'bqdtz09ztkdjmdnds' ],
            [ 'C',
              6,
              4,
              4,
              'bqdtz09ztkdjmdndq',
              'bqdtz09ztkdjmdndr',
              'bqdtz09ztkdjmdnds',
              'bqdtz09ztkdjmdndt',
              'bqdtz09ztkdjmdndn',
              'bqdtz09ztkdjmdndz',
              'bqdtz09ztkdjmdne0',
              'bqdtz09ztkdjmdne1' ],
            [ 'H', 1, 1, 1, 'bqdtz09ztkdjmdndj', 'bqdtz09ztkdjmdndk' ] ] ]
        Test 5 complete

         */
        if (verbose) {
            console.log(ccontainer5['container'])
        }
        console.log("Test 5 complete")


        console.log("All tests succeeded")


// CC(=O)O (acetic acid) + water

// aluminum chloride ([Al](Cl)(Cl)Cl) (Lewis acid) + dimethyl ether (COC) (Lewis base)

// oOf8ZoXI`@.pE/$DLX2H(FKI7PC$I51


    })

}

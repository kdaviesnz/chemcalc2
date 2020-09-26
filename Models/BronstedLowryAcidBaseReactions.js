// @see Organic Chemistry 8th Edition P51
const CAtom = require('../Controllers/Atom')
const Families = require('../Models/Families')
const BronstedLowryAcidBaseReactions = (container, MoleculeController, test_number, verbose) => {

    const react = () => {   

        // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)

        if (undefined === nucleophile_molecule) {
           
            const substrate_proton_index = MoleculeController(container[1]).indexOf("H", false, verbose)
            const reagent_proton_index = MoleculeController(container[2]).indexOf("H", false, verbose)

           // HCl (electrophile) <------ H2O (nucleophile)
            if (test_number === 1) {
                substrate_proton_index.should.be.equal(1) // HCl
                reagent_proton_index.should.be.equal(2) // water
            }
            
            if (test_number === 2) {
                substrate_proton_index.should.be.equal(false) // Cl-
                reagent_proton_index.should.be.equal(4) // H3O
            }
          
            if (test_number === 3) {
                substrate_proton_index.should.be.equal(false)
                reagent_proton_index.should.be.equal(false) // hydrogens are attached to carbons
            }
            
            if (test_number === 4) {
                substrate_proton_index.should.be.equal(false) // CC=CC (Second carbon is nucleophile)
                reagent_proton_index.should.be.equal(1) // HBr (H is electrophile)
            }

            if (substrate_proton_index !== false && reagent_proton_index === false) {
                electrophile_molecule_index = 1
                electrophile_molecule = container[electrophile_molecule_index]
                electrophile_atom_index = substrate_proton_index
                nucleophile_molecule_index = 2
                nucleophile_molecule = container[nucleophile_molecule_index]
                nucleophile_atom_index = MoleculeController(electrophile_molecule).nucleophileIndex()
            } else if (substrate_proton_index === false && reagent_proton_index !== false) {
               
                // Cl- (nucleophile)  <---- H3O (electrophile, what arrow points to)
                // test 4 CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
                
                electrophile_molecule_index = 2
                electrophile_molecule = container[electrophile_molecule_index]
                electrophile_atom_index = reagent_proton_index
                nucleophile_molecule_index = 1
                nucleophile_molecule = container[nucleophile_molecule_index]
                nucleophile_atom_index = MoleculeController(nucleophile_molecule).nucleophileIndex()
                
                if (test_number === 2) {
                    nucleophile_atom_index.should.be.equal(1) // Cl-
                    electrophile_atom_index.should.be.equal(4)
                    nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("Cl")
                    electrophile_molecule[electrophile_atom_index][0].should.be.equal("H")
                }
                
                if (test_number === 4) {
                    nucleophile_atom_index.should.be.equal(6) // C on C=C
                    electrophile_atom_index.should.be.equal(1)   // H
                    nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("C")
                    electrophile_molecule[electrophile_atom_index][0].should.be.equal("H")
                }
            } else if (substrate_proton_index=== false && reagent_proton_index === false) {
                return false
            }else {
                // -6.3 HCl, 14 H2O
                // Test number 1
                // Container - [false, [HCl], [H2O]]
                if (test_number === 1) {
                    (container[1][0] <= container[2][0]).should.be.equal(true)
                }
                if (container[1][0] <= container[2][0]) {
                    // HCl is the proton donator and is our electrophile as protons do not have electrons
                    // H2O (nucleophile) is the proton acceptor as the oxygen has lone pairs of electrons.
                    electrophile_molecule_index = 1 // HCl
                    electrophile_molecule = container[electrophile_molecule_index]
                    electrophile_atom_index = substrate_proton_index
                    nucleophile_molecule_index = 2 // water
                    nucleophile_molecule = container[nucleophile_molecule_index]
                    nucleophile_atom_index = MoleculeController(nucleophile_molecule).nucleophileIndex(test_number)
                    if (test_number===1) {
                       nucleophile_atom_index.should.be.equal(3)
                       nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("O")
                    }
                } else {
                    electrophile_molecule_index = 2
                    electrophile_molecule = container[electrophile_molecule_index]
                    electrophile_atom_index = reagent_proton_index
                    nucleophile_molecule_index = 1
                    nucleophile_molecule = container[nucleophile_molecule_index]
                    nucleophile_atom_index = MoleculeController(nucleophile_molecule).nucleophileIndex()

                }
            }
        }

        if (undefined === electrophile_molecule ) {
            console.log("BronstedLowryAcidBaseReactions::electrophile_molecule is undefined or null")
            process.exit()
        }

        if (electrophile_atom_index === null || electrophile_atom_index === undefined) {
            electrophile_atom_index = MoleculeController(electrophile_molecule).indexOf("H")
        }

        if (electrophile_atom_index === null || electrophile_atom_index === undefined) {
            console.log("BronstedLowryAcidBaseReactions::electrophile_atom_index is undefined or null")
            process.exit()
        }

       
        if (test_number === 3) {
            electrophile_molecule[1][0].should.be.equal("Al")
        }
        
        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        if (test_number === 4) {
            electrophile_molecule[1][0].should.be.equal("H")
        }

        
            // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
        if (test_number === 6) {
            // hydrogen water atom
            electrophile_molecule[electrophile_atom_index +1][0].should.be.equal("H")
        }

        if (test_number === 7) {
            // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
            // Error: water should not be an electrophile
            // sulfuric acid hydrogen atom
            // 'Electropile molecule is one of sulfuric acid, water'
            // electrophile index is 0 (sulfuric acid) or 2 (water (oxygen atom))
            // nucleophile is propylene (when electrophile is sulfuric acid)
            // nucleophile is protonated propylene (when electrophile is water)
            // UPDATE this is actually correct and NOT an error
            // test 7
        // ccontainer6.add(propylene, 1, verbose)
        // ccontainer6.add(watermolecule, 1, verbose)
        // ccontainer6.add(sulfuric_acid, 1, verbose)
        // r -> s
        // 1.1 sulfuric acid (e) -> propylene (n) = deprotonated sulfuric acid, protonated propylene
        // 1.2 deprotonated sulfuric acid -> water
        // 1.3 deprotonated sulfuric acid -> deprotonated sulfuric acid
        // 2.1 water (n) -> protonated propylene (e) = oxygen atom on water attacks carbocation on propylene
 
           // console.log(electrophile_molecule)
           // console.log(electrophile_atom_index)
            // console.log(nucleophile_molecule)
            electrophile_molecule[electrophile_atom_index+1][0].should.be.oneOf("H","O")
        }

        if (electrophile_molecule[electrophile_atom_index+1][0] !== "H") {

            if (test_number === 1) {
                console.log("BronstedLowryAcidBaseReactions::Should have a proton test number 1")
                process.exit()
            }

            // See organic chemistry 8th edition ch 6 p 235
            // C=C (butene, nucleophile) -> HBr (H is electrophile)
            if (test_number === 4 ) {
                electrophile_molecule[1][0].should.be.equal("H")
                electrophile_atom_index.should.be.equal(1)
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
                console.log("BronstedLowryAcidBaseReactions::Should have a proton (test number 4")
                process.exit()

            }
            return false
        }

        if (test_number === 3) {
            // console.log(electrophile_molecule) // COC
            console.log("Wrong section for test 3 - reagent doesn't have a non-carbon hydrogen (Container.js)")
            process.exit()
        }

        // HCl (electrophile) <- H2O (nucleophile)
        if (test_number === 1) {
            // console.log(nucleophile_molecule)
            nucleophile_molecule.length.should.be.equal(4) // H2O
            electrophile_molecule.length.should.be.equal(3)  // HCl
            electrophile_molecule[electrophile_atom_index][0].should.be.equal("H")
            nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("O")
        }

        // [Cl-] (nucleophile) <- H3O (electrophile)
        if (test_number === 2 ) {
            nucleophile_molecule.length.should.be.equal(2)
            nucleophile_atom_index.should.be.equal(1)
            electrophile_molecule.length.should.be.equal(5)
            electrophile_molecule[electrophile_atom_index][0].should.be.equal("H")
            nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("Cl")
        }
        
        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        /*
        [ [ 'H', 1, 1, 1, '1y5g42jkkahi190y', '1y5g42jkkahi190i' ], 1
  [ 'H', 1, 1, 1, '1y5g42jkkahi190z', '1y5g42jkkahi190j' ], 2
  [ 'H', 1, 1, 1, '1y5g42jkkahi1910', '1y5g42jkkahi190k' ], 3
  [ 'C', 6, 4, 4, '1y5g42jkkahi190i', '1y5g42jkkahi190j', '1y5g42jkkahi190k','1y5g42jkkahi190l'
  ,'1y5g42jkkahi190p','1y5g42jkkahi190y','1y5g42jkkahi190z', '1y5g42jkkahi1910' ], 4
  [ 'H', 1, 1, 1, '1y5g42jkkahi1911', '1y5g42jkkahi190m' ], 5
  [ 'C', 6,  4, 4,'1y5g42jkkahi190m','1y5g42jkkahi190n','1y5g42jkkahi190o', 6
    '1y5g42jkkahi190p', '1y5g42jkkahi190l', '1y5g42jkkahi190t','1y5g42jkkahi190s', '1y5g42jkkahi1911' ],
  [ 'H', 1, 1, 1, '1y5g42jkkahi1912', '1y5g42jkkahi190q' ], 7
  [ 'C', 6, 4, 4, '1y5g42jkkahi190q','1y5g42jkkahi190r', '1y5g42jkkahi190s',
    '1y5g42jkkahi190t', '1y5g42jkkahi190o','1y5g42jkkahi190n','1y5g42jkkahi190x',
    '1y5g42jkkahi1912' ], 8
  [ 'H', 1, 1, 1, '1y5g42jkkahi1913', '1y5g42jkkahi190u' ], 9
  [ 'H', 1, 1, 1, '1y5g42jkkahi1914', '1y5g42jkkahi190v' ], 10
  [ 'H', 1, 1, 1, '1y5g42jkkahi1915', '1y5g42jkkahi190w' ], 11
  [ 'C', 6,4,4, '1y5g42jkkahi190u','1y5g42jkkahi190v','1y5g42jkkahi190w',
    '1y5g42jkkahi190x','1y5g42jkkahi190r', '1y5g42jkkahi1913','1y5g42jkkahi1914',
    '1y5g42jkkahi1915' ] 12 ]
         */
        if (test_number === 4 ) {
            nucleophile_molecule.length.should.be.equal(13)
            nucleophile_atom_index.should.be.equal(6)
            electrophile_molecule.length.should.be.equal(3)
            electrophile_molecule[electrophile_atom_index][0].should.be.equal("H")
            nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("C")
        }

        // react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index)
        // Here the substrate (base) has no proton and the reagent (acid) does.
        // So we remove the proton from the reagent and add it to the substrate.
        const proton_index = MoleculeController(electrophile_molecule).indexOf("H")
        proton_index.should.be.greaterThan(0);

        if (test_number === 2) {
            nucleophile_molecule[1][0].should.be.equal("Cl")
            electrophile_molecule.length.should.be.equal(5)
            proton_index.should.be.equal(4)
        }
        
        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        if (test_number === 4) {
            nucleophile_molecule[4][0].should.be.equal("C")
            electrophile_molecule.length.should.be.equal(3)
            proton_index.should.be.equal(1)
        }

        // remove proton
        if (test_number === 1) {
            electrophile_molecule_index.should.be.equal(1)
        }
        
        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        if (test_number === 4) {
            electrophile_molecule_index.should.be.equal(2)           
        }
        
        // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
        if (test_number === 6) {
            // hydrogen water atom
            console.log('BronstedLowryAcidBaseReactions.js')
            console.log('Electrophile molecule')
            console.log(electrophile_molecule) // water
            console.log('Nucleophile molecule')
            console.log(nucleophile_molecule) // propylene
            const reagent_families = Families(nucleophile_molecule.slice(1), this.verbose).families
            console.log(reagent_families.alkene().length)
            electrophile_molecule_index.should.be.equal(2)
            proton_index.should.be.equal(2)
        }

        if (test_number === 7) {
            // hydrogen sulfuric acid atom
            console.log(electrophile_molecule)
            // Electropile molecule is sulfuric acid
            /*
            [ 12345,
  [ 'H', 1, 1, 1, 'bqdtz04tpkdthcoc1', 'bqdtz04tpkdthcob7' ],
  [ 'O',
    8,
    6,
    2,
    'bqdtz04tpkdthcob7',
    'bqdtz04tpkdthcob8',
    'bqdtz04tpkdthcob9',
    'bqdtz04tpkdthcoba',
    'bqdtz04tpkdthcobb',
    'bqdtz04tpkdthcobc',
    'bqdtz04tpkdthcobi',
    'bqdtz04tpkdthcoc1' ],
  [ 'S',
    16,
    6,
    2,
    'bqdtz04tpkdthcobd',
    'bqdtz04tpkdthcobe',
    'bqdtz04tpkdthcobf',
    'bqdtz04tpkdthcobg',
    'bqdtz04tpkdthcobh',
    'bqdtz04tpkdthcobi',
    'bqdtz04tpkdthcobc',
    'bqdtz04tpkdthcobo',
    'bqdtz04tpkdthcobn',
    'bqdtz04tpkdthcobu',
    'bqdtz04tpkdthcobt',
    'bqdtz04tpkdthcoc0' ],
  [ 'O',
    8,
    6,
    2,
    'bqdtz04tpkdthcobj',
    'bqdtz04tpkdthcobk',
    'bqdtz04tpkdthcobl',
    'bqdtz04tpkdthcobm',
    'bqdtz04tpkdthcobn',
    'bqdtz04tpkdthcobo',
    'bqdtz04tpkdthcobh',
    'bqdtz04tpkdthcobg' ],
  [ 'O',
    8,
    6,
    2,
    'bqdtz04tpkdthcobp',
    'bqdtz04tpkdthcobq',
    'bqdtz04tpkdthcobr',
    'bqdtz04tpkdthcobs',
    'bqdtz04tpkdthcobt',
    'bqdtz04tpkdthcobu',
    'bqdtz04tpkdthcobf',
    'bqdtz04tpkdthcobe' ],
  [ 'H', 1, 1, 1, 'bqdtz04tpkdthcoc2', 'bqdtz04tpkdthcobv' ],
  [ 'O',
    8,
    6,
    2,
    'bqdtz04tpkdthcobv',
    'bqdtz04tpkdthcobw',
    'bqdtz04tpkdthcobx',
    'bqdtz04tpkdthcoby',
    'bqdtz04tpkdthcobz',
    'bqdtz04tpkdthcoc0',
    'bqdtz04tpkdthcobd',
    'bqdtz04tpkdthcoc2' ] ]
             */
            electrophile_molecule_index.should.be.equal(3)
            proton_index.should.be.equal(1)
        }
        
           // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
        container = MoleculeController(electrophile_molecule).removeProton(
            container,
            electrophile_molecule_index,
            MoleculeController(electrophile_molecule).itemAt(proton_index),
            test_number,
            verbose
        )

        if (test_number === 7) {
            container.should.not.be.equal(false)
        }

        if (test_number === 2) {
            container.length.should.be.equal(4)
            if (null !== container[container.length-1][0]) {
                console.log("BronstedLowryAcidBaseReactions::Value should be null")
                process.exit()
            }
            container[container.length-1][1][0].should.be.equal("H")
            container[container.length-1][1].length.should.be.equal(4)
        }

        if (test_number === 7) {
            // console.log(container)
            // false, propylene, water, sulfuric acid, proton
            container.length.should.be.equal(5)
            if (null !== container[container.length-1][0]) {
                console.log("BronstedLowryAcidBaseReactions::Value should be null")
                process.exit()
            }
            container[container.length-1][1][0].should.be.equal("H")
            container[container.length-1][1].length.should.be.equal(4)
        }

        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        /*
        [ [ 'H', 1, 1, 1, '1y5g42jkkahi190y', '1y5g42jkkahi190i' ], 1
  [ 'H', 1, 1, 1, '1y5g42jkkahi190z', '1y5g42jkkahi190j' ], 2
  [ 'H', 1, 1, 1, '1y5g42jkkahi1910', '1y5g42jkkahi190k' ], 3
  [ 'C', 4, 6, 4, 4, '1y5g42jkkahi190i', '1y5g42jkkahi190j', '1y5g42jkkahi190k','1y5g42jkkahi190l'
  ,'1y5g42jkkahi190p','1y5g42jkkahi190y','1y5g42jkkahi190z', '1y5g42jkkahi1910' ],
  [ 'H', 1, 1, 1, '1y5g42jkkahi1911', '1y5g42jkkahi190m' ], 5
  [ 'C', 6,  4, 4,'1y5g42jkkahi190m','1y5g42jkkahi190n','1y5g42jkkahi190o', 6
    '1y5g42jkkahi190p', '1y5g42jkkahi190l', '1y5g42jkkahi190t','1y5g42jkkahi190s', '1y5g42jkkahi1911' ],
  [ 'H', 1, 1, 1, '1y5g42jkkahi1912', '1y5g42jkkahi190q' ], 7
  [ 'C', 6, 4, 4, '1y5g42jkkahi190q','1y5g42jkkahi190r', '1y5g42jkkahi190s',
    '1y5g42jkkahi190t', '1y5g42jkkahi190o','1y5g42jkkahi190n','1y5g42jkkahi190x',
    '1y5g42jkkahi1912' ], 8
  [ 'H', 1, 1, 1, '1y5g42jkkahi1913', '1y5g42jkkahi190u' ], 9
  [ 'H', 1, 1, 1, '1y5g42jkkahi1914', '1y5g42jkkahi190v' ], 10
  [ 'H', 1, 1, 1, '1y5g42jkkahi1915', '1y5g42jkkahi190w' ], 11
  [ 'C', 6,4,4, '1y5g42jkkahi190u','1y5g42jkkahi190v','1y5g42jkkahi190w',
    '1y5g42jkkahi190x','1y5g42jkkahi190r', '1y5g42jkkahi1913','1y5g42jkkahi1914',
    '1y5g42jkkahi1915' ] 12 ]
         */
        if (test_number === 4) {
            // [pKa, CC=CC, [Br-], [H+]]
            container.length.should.be.equal(4)
            if (null !== container[container.length-1][0]) {
                console.log("BronstedLowryAcidBaseReactions::Value should be null")
                process.exit()
            }
            container[2][1][0].should.be.equal("Br")
            container[2][1].slice(4).length.should.be.equal(8)    // correct
            container[container.length-1][1][0].should.be.equal("H")
            container[container.length-1][1].length.should.be.equal(4) // no electrons
        }
        
        const proton = container[container.length-1][1]

        if (test_number === 2) {
            proton.should.be.Array()
            proton.length.should.be.equal(4)
            proton[0].should.be.String()
            proton[0].should.be.equal("H")
        }

        if (test_number === 7) {
            proton.should.be.Array()
            proton.length.should.be.equal(4)
            proton[0].should.be.String()
            proton[0].should.be.equal("H")
        }

        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        if (test_number === 4) {
            proton.should.be.Array()
            proton.length.should.be.equal(4)
            proton[0].should.be.String()
            proton[0].should.be.equal("H")
        }

        if (test_number === 7) {
            proton.should.be.Array()
            proton.length.should.be.equal(4)
            proton[0].should.be.String()
            proton[0].should.be.equal("H")
        }
        
        // Move the proton to first molecule
        container.splice(container.length-1,1) // remove proton from container
        
        // H+ (electrophile) <------- H2O (nucleophile)
        if (test_number === 1) {
            nucleophile_molecule.length.should.be.equal(4)
            electrophile_molecule.length.should.be.equal(2)
            nucleophile_atom_index.should.be.equal(3)
            electrophile_atom_index.should.be.equal(1)
        }
        
        // Cl- (nucleophile) <------- H3O (electrophile)
        if (test_number === 2) {
            nucleophile_molecule.length.should.be.equal(2)
            electrophile_molecule.length.should.be.equal(4)
            nucleophile_atom_index.should.be.equal(1)
            electrophile_atom_index.should.be.equal(4)
        }
        
        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        if (test_number === 4) {
            nucleophile_molecule.length.should.be.equal(13)
            electrophile_molecule.length.should.be.equal(2)
            nucleophile_atom_index.should.be.equal(6)
            electrophile_atom_index.should.be.equal(1)
        }

        // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
        if (test_number === 7) {
            // protonated propylene
            nucleophile_molecule.length.should.be.equal(10)
            // sulfuric acid with proton removed
            electrophile_molecule.length.should.be.equal(7)
            nucleophile_atom_index.should.be.equal(8)
            electrophile_atom_index.should.be.equal(0)
        }
        
        // test 1 - nucleophile_molecule is water
        // test 2 - nucleophile_molecule is Cl-
        // test 4 CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        // target atom index should always be 1 as it is a proton
        MoleculeController(nucleophile_molecule).push([proton], container, container.length-1, test_number, 1, nucleophile_atom_index +1)

        if (test_number === 7) {
           // console.log(container)
            // false, propylene, water, sulfuric acid
            container.length.should.be.equal(4)
            // protonated propylene
            nucleophile_molecule.length.should.be.equal(11)
            nucleophile_molecule[3].length.should.be.equal(6)
            // deprotonated sulfuric acid
            electrophile_molecule[1][0].should.be.equal("O")
            electrophile_molecule.length.should.be.equal(7)
        }

        if (test_number === 1) {
            container.length.should.be.equal(3)
            // H3O
            nucleophile_molecule.length.should.be.equal(5)
            nucleophile_molecule[3].length.should.be.equal(12)
            // [Cl-]
            electrophile_molecule[1][0].should.be.equal("Cl")
            electrophile_molecule.length.should.be.equal(2)
        }
        
        if (test_number === 2) {
            container.length.should.be.equal(3)
            nucleophile_molecule.length.should.be.equal(3)
            electrophile_molecule.length.should.be.equal(4)
            nucleophile_molecule[1].length.should.be.equal(12)
            nucleophile_molecule[1][0].should.be.equal("Cl")
            nucleophile_molecule[2][0].should.be.equal("H")
            electrophile_molecule[1].length.should.be.equal(6)
            electrophile_molecule[1][0].should.be.equal("H")
            electrophile_molecule[2].length.should.be.equal(6)
            electrophile_molecule[2][0].should.be.equal("H")
            electrophile_molecule[3].length.should.be.equal(12)
            electrophile_molecule[3][0].should.be.equal("O")
        }

        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        // After pushing proton to nucleophile
        if (test_number === 4) {
            container.length.should.be.equal(3)
            nucleophile_molecule.length.should.be.equal(14)
            electrophile_molecule.length.should.be.equal(2)
            nucleophile_molecule[1].length.should.be.equal(6)
            nucleophile_molecule[1][0].should.be.equal("H")
            nucleophile_molecule[2][0].should.be.equal("H")
            electrophile_molecule[1].length.should.be.equal(12)
            electrophile_molecule[1][0].should.be.equal("Br")
        }

        // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
        if(test_number===7) {
            container.length.should.be.equal(4)
        }

        return container

    }

    return {
        react: react
    }

}

module.exports = BronstedLowryAcidBaseReactions

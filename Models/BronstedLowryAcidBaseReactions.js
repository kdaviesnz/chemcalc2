const CAtom = require('../Controllers/Atom')

const BronstedLowryAcidBaseReactions = (container, MoleculeController, test_number, verbose) => {

    const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule,
                   electrophile_atom_index, nucleophile_molecule_index, electrophile_molecule_index) => {

        if (verbose) {
            console.log("Models/BronstedLowryAcidBaseReactions.js Doing Bronsted Lowry reactions ->")
            console.log(
                {
                    "nucleophile molecule" : nucleophile_molecule,
                    "nucleopile atom index" : nucleophile_atom_index,
                    "electrophile molecle" : electrophile_molecule,
                    "electrophile atom index" : electrophile_atom_index,
                    "nucleophile molecule index" : nucleophile_molecule_index,
                    "electrophile molecule index" : electrophile_molecule_index,
                    "container" : container,
                    "molecule controller" : MoleculeController
                }
            )
        }

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

        if (electrophile_molecule[electrophile_atom_index][0] !== "H") {

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
        
        container = MoleculeController(electrophile_molecule).removeProton(
            container,
            electrophile_molecule_index,
            MoleculeController(electrophile_molecule).itemAt(proton_index),
            test_number
        )

        if (test_number === 2) {
            container.length.should.be.equal(4)
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

        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        if (test_number === 4) {
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
        
        // test 1 - nucleophile_molecule is water
        // test 2 - nucleophile_molecule is Cl-
        // test 4 CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        // target atom index should always be 1 as it is a proton
        MoleculeController(nucleophile_molecule).push([proton], container, container.length-1, test_number, 1, nucleophile_atom_index)

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

        return container

    }

    return {
        react: react
    }

}

module.exports = BronstedLowryAcidBaseReactions

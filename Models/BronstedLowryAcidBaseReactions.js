const BronstedLowryAcidBaseReactions = (container, MoleculeController, test_number) => {
  
  const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index) => {
    
    if (arguments.length === 0) {
       const substrate_proton_index = MoleculeController(container[1]).indexOf("H")
       const reagent_proton_index = MoleculeController(container[2]).indexOf("H")
       if (substrate_proton_index!== false && reagent_proton_index === false) {
         electrophile_molecule = container[1]
         electrophile_atom_index = substrate_proton_index
         nucleophile_molecule = container[2]         
       } elseif (substrate_proton_index=== false && reagent_proton_index !== false) {
         electrophile_molecule = container[2]
         electrophile_atom_index = reagent_proton_index
         nucleophile_molecule = container[1]  
       } else {
            if (container[1][0] <= container[2][0]) {
               electrophile_molecule = container[1]
               electrophile_atom_index = substrate_proton_index
              
               nucleophile_molecule = container[2]
            } else {
                  electrophile_molecule = container[2]
                electrophile_atom_index = reagent_proton_index
                nucleophile_molecule = container[1]    

                       
            }
       }
    }
    
    if (electrophile_atom_index === null) {
      electrophile_atom_index = MoleculeController(electrophile_molecule).indexOf("H")
    }
    
    // Check that we have a proton
    if (!AtomController(electrophile_molecule[electrophile_atom_index]).isProton()) {
       return false
    }
    
    if (test_number === 3) {
                    // console.log(container[2]) // COC
                    console.log("Wrong section for test 3 - reagent doesn't have a non-carbon hydrogen (Container.js)")
                    process.exit()
    }
    
    // react(container[1], nucleophile_atom_index, container[2], electrophile_atom_index)
    // Here the substrate (base) has no proton and the reagent (acid) does.
                // So we remove the proton from the reagent and add it to the substrate.
                const proton_index = MoleculeController(electrophile_molecule).indexOf("H")
                proton_index.should.be.greaterThan(0);

                if (test_number === 2) {
                    container[1][1][0].should.be.equal("Cl")
                    electrophile_molecule.length.should.be.equal(5)
                    proton_index.should.be.equal(4)
                }
    
                 // remove proton
                container = MoleculeController(electrophile_molecule).removeProton(
                    container,
                    2,
                    MoleculeController(electrophile_molecule).itemAt(proton_index)
                )
    
                if (test_number === 2) {
                    container.length.should.be.equal(4)
                    if (null !== container[container.length-1][0]) {
                        console.log("Value should be null")
                        process.exit()
                    }
                    container[container.length-1][1][0].should.be.equal("H")
                    container[container.length-1][1].length.should.be.equal(4)
                }

                const proton = container[container.length-1][1]
                if (test_number === 2) {
                    proton.should.be.Array()
                    proton.length.should.be.equal(4)
                    proton[0].should.be.String()
                    proton[0].should.be.equal("H")
                }

                // Move the proton to first molecule
                container.splice(container.length-1,1) // remove proton from container
                // container[1] is chlorine
                const atom_to_push_index = 0
                MoleculeController(container[1]).push([proton], container, container.length-1, test_number, atom_to_push_index)

                if (test_number === 2) {
                    container.length.should.be.equal(3)
                    container[1].length.should.be.equal(3)
                    electrophile_molecule.length.should.be.equal(4)
                    container[1][1].length.should.be.equal(12)
                    container[1][1][0].should.be.equal("Cl")
                    container[1][2][0].should.be.equal("H")
                    electrophile_molecule[1].length.should.be.equal(6)
                    electrophile_molecule[1][0].should.be.equal("H")
                    electrophile_molecule[2].length.should.be.equal(6)
                    electrophile_molecule[2][0].should.be.equal("H")
                    electrophile_molecule[3].length.should.be.equal(12)
                    electrophile_molecule[3][0].should.be.equal("O")
                }       
    
               if (test_number === 1) {
                        container.length.should.be.equal(3)
                        container[1].length.should.be.equal(2)
                        container[1][1].length.should.be.equal(12)
                        const lone_pairs = MoleculeController(container[1]).lonePairs(
                            container[1][1],
                            1)
                        lone_pairs.length.should.equal(8)
                        container[1][1][0].should.be.equal("Cl")
                        electrophile_molecule.length.should.be.equal(5)
                        electrophile_molecule[1].should.be.an.Array()
                        electrophile_molecule[1].length.should.be.equal(6)
                        container[2][1][0].should.be.equal("H")
                        container[2][1][1].should.be.equal(1)
                        container[2][1][2].should.be.equal(1)
                        container[2][1][3].should.be.equal(1)
                        container[2][1][4].should.be.a.String()
                        container[2][2].should.be.an.Array()
                        container[2][2].length.should.be.equal(6)
                        container[2][2][0].should.be.equal("H")
                        container[2][2][1].should.be.equal(1)
                        container[2][2][2].should.be.equal(1)
                        container[2][2][3].should.be.equal(1)
                }
    
    
       }
  
  
  
  
  
  
  
  
   // We've just added a reagent to the container
            // Brønsted and Lowry Acid base reactions
            if (MoleculeController(container[1]).indexOf("H") !== false && MoleculeController(container[2]).indexOf("H") === false) {

                console.log("got here container.js")
                process.exit()
                const proton_index = MoleculeController(container[1]).indexOf("H")
                MoleculeController.remove(container, 1, MoleculeController(container[1]).itemAt(proton_index)) // remove proton
                container[2] = MoleculeController(container[2]).push("H")
                
            } else if (MoleculeController(container[1]).indexOf("H") === false && MoleculeController(container[2]).indexOf("H") !== false) {

                react(container[1], nucleophile_atom_index, container[2], electrophile_atom_index)

       //##########
                
            
                
            } else if (container[1].indexOf("H") !== false && MoleculeController(container[2]).indexOf("H") !== false) {
                 // Here both substrate and reagent has a proton.
                 // So we remove a proton from the molecule with the lowest pKa value (acid)
                 // and add it to the molecule with the highest pKa value (base)
                // HCl + H2O <-> Cl- + H3O+
                 // CC(=O)O (C2H4O2, acetic acid) + water (water is base and accepts proton)
                // First element is pKa value
                // Molecule with highest pka value is the base and accepts the proton (check)
                // pKa of HCl is -6.3
               // pKa of water is 14
                // HCL is first element
                if (container[1][0] <= container[2][0]) {

                    // First test - HCl + water

                    // Move proton from first molecule to second molecule
                    const proton_index = MoleculeController(container[1]).indexOf("H")

                    if (test_number === 1) {
                        proton_index.should.be.equal(1)
                    }

                    container = MoleculeController(container[1]).removeProton(
                        container,
                        1,
                        MoleculeController(container[1]).itemAt(proton_index)
                    )

                    if (test_number === 1) {                        
                        // Cl, H2O, proton
                        container[1][1][0].should.be.equal("Cl")
                        container[2][3][0].should.be.equal("O")
                    }

                    // last item of container will now be the proton from the first molecule
                    const proton = container[container.length-1][1]
                    proton.should.be.Array()
                    proton.length.should.be.equal(4)
                    proton[0].should.be.String()
                    proton[0].should.be.equal("H")

                    // Move the proton to second molecule
                    container.splice(container.length-1,1) // remove proton from container
                    // container[2] is water molecule
                    // container.length-1 is where the proton is in the container
                    const atom_to_push_index = 0
                    MoleculeController(container[2]).push([proton], container, container.length-1, test_number, atom_to_push_index)

                    if (test_number === 1) {
                        container.length.should.be.equal(3)
                        container[1].length.should.be.equal(2)
                        container[1][1].length.should.be.equal(12)
                        const lone_pairs = MoleculeController(container[1]).lonePairs(
                            container[1][1],
                            1)
                        lone_pairs.length.should.equal(8)
                        container[1][1][0].should.be.equal("Cl")
                        container[2].length.should.be.equal(5)
                        container[2][1].should.be.an.Array()
                        container[2][1].length.should.be.equal(6)
                        container[2][1][0].should.be.equal("H")
                        container[2][1][1].should.be.equal(1)
                        container[2][1][2].should.be.equal(1)
                        container[2][1][3].should.be.equal(1)
                        container[2][1][4].should.be.a.String()
                        container[2][2].should.be.an.Array()
                        container[2][2].length.should.be.equal(6)
                        container[2][2][0].should.be.equal("H")
                        container[2][2][1].should.be.equal(1)
                        container[2][2][2].should.be.equal(1)
                        container[2][2][3].should.be.equal(1)
                        container[2][2][4].should.be.a.String()
                        container[2][3].should.be.an.Array()
                        container[2][3].length.should.be.equal(12)
                        container[2][3][0].should.be.equal("O")
                        container[2][3][1].should.be.equal(8)
                        container[2][3][2].should.be.equal(6)
                        container[2][3][3].should.be.equal(2)
                        container[2][3][4].should.be.a.String()
                        container[2][4].should.be.an.Array()
                        container[2][4].length.should.be.equal(6)
                        container[2][4][0].should.be.equal("H")
                        container[2][4][1].should.be.equal(1)
                        container[2][4][2].should.be.equal(1)
                        container[2][4][3].should.be.equal(1)
                        container[2][4][4].should.be.a.String()
                    }


                } else {

                    console.log(test_number)
                    if (test_number ===1) {
                        console.log(container)
                    }

                    // Move proton from second molecule to first molecule
                    const proton_index = MoleculeController(container[2]).indexOf("H") // 2
                    container = MoleculeController(container[2]).remove(
                        container,
                        2,
                        MoleculeController(container[2]).itemAt(proton_index)
                    ) // remove proton

                    // last item of container will now be the proton from the second molecule
                    const proton = container.pop()
                    // add the proton to first molecule
                    MoleculeController(container[1]).push(proton)
                    
                }
            } else {
                
                return false

                
            }
  
}

module.exports = BronstedLowryAcidBaseReactions

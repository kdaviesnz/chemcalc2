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

        
           
            const substrate_proton_index = MoleculeController(container[1].json).indexOf("H", false, verbose)
            const reagent_proton_index = MoleculeController(container[2].json).indexOf("H", false, verbose)

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
                    (container[1].json[0] <= container[2].json[0]).should.be.equal(true)
                }
                
                // compare pka values
                if (container[1].json[0] <= container[2].json[0]) {
                    // @see Organic Chemistry 8th Edition P51
                    // HCl is the proton donator and is our electrophile as protons do not have electrons
                    // H2O (nucleophile) is the proton acceptor as the oxygen has lone pairs of electrons.
                    electrophile_molecule_index = 1 
                    electrophile_molecule = container[electrophile_molecule_index]
                    electrophile_atom_index = substrate_proton_index
                    nucleophile_molecule_index = 2 //
                    
 
                    nucleophile_molecule = container[nucleophile_molecule_index]
                    nucleophile_atom_index = MoleculeController(nucleophile_molecule).nucleophileIndex(test_number)
                    
                } else {
                    electrophile_molecule_index = 2
                    electrophile_molecule = container[electrophile_molecule_index]
                    electrophile_atom_index = reagent_proton_index
                    nucleophile_molecule_index = 1
                    nucleophile_molecule = container[nucleophile_molecule_index]
                    nucleophile_atom_index = MoleculeController(nucleophile_molecule).nucleophileIndex()

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

       
        
        
        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        

        
            // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
        

        if (test_number === 7) {
            // SEE organic chemistry 8th edition p245

            
        }

        if (electrophile_molecule[electrophile_atom_index+1][0] !== "H") {

            if (test_number === 1) {
                console.log("BronstedLowryAcidBaseReactions::Should have a proton test number 1")
                process.exit()
            }

            // See organic chemistry 8th edition ch 6 p 235
            // C=C (butene, nucleophile) -> HBr (H is electrophile)

            return false
        }

        


        // react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index)
        // Here the substrate (base) has no proton and the reagent (acid) does.
        // So we remove the proton from the reagent and add it to the substrate.
        const proton_index = MoleculeController(electrophile_molecule).indexOf("H")
        proton_index.should.be.greaterThan(0);


        
        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)


        // remove proton

        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        
        
        // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
        

        
        
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

        

        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)

        
        
        const proton = container[container.length-1][1]

        
        
        // Move the proton to first molecule
        container.splice(container.length-1,1) // remove proton from container
        
        // H+ (electrophile) <------- H2O (nucleophile)
        

        // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
        
        
        // test 1 - nucleophile_molecule is water
        // test 2 - nucleophile_molecule is Cl-
        // test 4 CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        // target atom index should always be 1 as it is a proton
        MoleculeController(nucleophile_molecule).push([proton], container, container.length-1, test_number, 1, nucleophile_atom_index +1)

        
        
        

        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        // After pushing proton to nucleophile


        // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
        
        return container

    }

    return {
        react: react
    }

}

module.exports = BronstedLowryAcidBaseReactions

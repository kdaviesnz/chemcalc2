const Set = require('../Models/Set')

const LewisAcidBaseReactions = (container, MoleculeController, test_number, verbose) => {

    const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, test_number) => {

        
        // test 7
                    // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
        // ccontainer6.add(propylene, 1, verbose)
        // ccontainer6.add(watermolecule, 1, verbose)
        // ccontainer6.add(sulfuric_acid, 1, verbose)
        // r -> s
        // 1.1 sulfuric acid (e) -> propylene (n) = deprotonated sulfuric acid, protonated propylene
        // 1.2 deprotonated sulfuric acid -> water
        // 1.3 deprotonated sulfuric acid -> deprotonated sulfuric acid
        // 2.1 water (n) -> protonated propylene (e) = oxygen atom on water attacks carbocation on propylene
 
        let nucleophile_molecule_index = null
        let electrophile_molecule_index = null

            // [Br-] (nucleophile) -----> carbocation
            // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8
            // Source atom index should be 1
              // Organic Chemistry 8th edition, P199
        // test_number 5
        // [Br-] + carbocation (alkane)
        // electrophile is [C+] cation on carbocation
        // nucleophile is [Br-]
        // carbocation is added to [Br-]
        // Br and C form bond
        
        if (verbose) {
            console.log("Models/LewisAcidBaseReactions.js Doing Lewis reactions ->")
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
        
        if (test_number !==3 && test_number !==5) {
            console.log("Wrong section for test number " + test_number)
            (10).should.be.equal(9999)
            process.exit()
        }

        if (null === nucleophile_molecule) {

            if (verbose) {
                console.log("Model/LewsiAcidBaseReactions.js react() Getting electrophile index")
            }
            const substrate_electrophile_atom_index = MoleculeController(container[1], verbose).electrophileIndex(test_number + 0.1) // AlCl3

            if (verbose) {
                console.log("Model/LewsiAcidBaseReactions.js react() Got electrophile index " + substrate_electrophile_atom_index)
            }

            // [Br-] (nucleophile, electron donor) -----> carbocation
            // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8 (electrophile)
            // Source atom index should be 1
            // substrate is [Br-]
            // reagent is carbocation
            // see organic chenistry 8th edition ch 6 p235
                // [Br-] (nucleophile) -----> carbocation
            // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8
            // Source atom index should be 1
              // Organic Chemistry 8th edition, P199
        // test_number 5
        // [Br-] + carbocation (alkane)
        // electrophile is [C+] cation on carbocation
        // nucleophile is [Br-]
        // carbocation is added to [Br-]
        // Br and C form bond
            if (test_number ===5) {
                // substrate is [Br-]
                // Should be false as [Br-] is the nucleophile,  not electrophile
                substrate_electrophile_atom_index.should.be.equal(false) // Nucleophile [Br-]
            }

            const reagent_electrophile_atom_index = MoleculeController(container[2]).electrophileIndex(test_number + 0.2)

            // CO:C (nucleophile) ------> AlCl3 (electrophile) O: is the nucleophile (base, donates an electron pair), Al is the electrophile (acid, accepts an electron pair) See 2.12 Organic Chemistry 8th Edition P76
            if (test_number === 3) {
                substrate_electrophile_atom_index.should.be.equal(1) // Al
                reagent_electrophile_atom_index.should.be.equal(5) // C  as all hydrogens are bonded to carbons
            }

            // [Br-] (nucleophile, electron donor) -----> carbocation
            // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8 (electrophile)
            // Source atom index should be 1
            // substrate is [Br-]
            // reagent is carbocation
            // see orgsnic chenistry 8th edition ch 6 p235
                // [Br-] (nucleophile) -----> carbocation
            // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8
            // Source atom index should be 1
              // Organic Chemistry 8th edition, P199
        // test_number 5
        // [Br-] + carbocation (alkane)
        // electrophile is [C+] cation on carbocation
        // nucleophile is [Br-]
        // carbocation is added to [Br-]
        // Br and C form bond
            if (test_number ===5) {
                substrate_electrophile_atom_index.should.be.equal(false) // Nucleophile [Br-]
                // container[2] (reagent) is the carbocation
                if (verbose) {
                    console.log("Reagent")
                    console.log(container[2])
                }
                reagent_electrophile_atom_index.should.be.equal(8)
            }

            // Container [false, [AlCl3], [COC]]
            if (substrate_electrophile_atom_index !==false) {
                electrophile_atom_index = substrate_electrophile_atom_index
                nucleophile_molecule_index = 2
                electrophile_molecule_index = 1
                electrophile_molecule = container[1]
                nucleophile_molecule = container[2]
                nucleophile_atom_index = MoleculeController(nucleophile_molecule).nucleophileIndex(test_number)
                if (test_number ===3) {
                    nucleophile_molecule[nucleophile_atom_index][0].should.be.equal('O')
                    nucleophile_atom_index.should.be.equal(5)
                }
            } else if (reagent_electrophile_atom_index !==false) {
                electrophile_atom_index = reagent_electrophile_atom_index
                nucleophile_molecule_index = 1
                electrophile_molecule_index = 2
                electrophile_molecule = container[2]
                nucleophile_molecule = container[1]
                nucleophile_atom_index = MoleculeController(container[1]).nucleophileIndex(3)
            } else {
                return false
            }
        }


        // AlCl3 (electrophile) <- C:OC (nucleophile)
        const molecule_to_add_to_index = 0
        if (test_number === 3) {
            nucleophile_molecule.length.should.be.equal(10) // COC
            electrophile_molecule.length.should.be.equal(5) // AlCl
            electrophile_atom_index.should.be.equal(1)
            nucleophile_atom_index.should.be.equal(5)
            electrophile_molecule[electrophile_atom_index][0].should.be.equal("Al")
            nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("O")
        }

        // [Br-] (nucleophile) -----> carbocation
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1
        if (test_number === 5) {
            electrophile_molecule[electrophile_atom_index][0].should.be.equal("C")
            nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("Br")
            nucleophile_molecule.length.should.be.equal(2) // Br
            electrophile_molecule.length.should.be.equal(14) // CC[C+]C
            electrophile_atom_index.should.be.equal(8)
            nucleophile_atom_index.should.be.equal(1)
        }

        // test 7
                    // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
        // ccontainer6.add(propylene, 1, verbose)
        // ccontainer6.add(watermolecule, 1, verbose)
        // ccontainer6.add(sulfuric_acid, 1, verbose)
        // r -> s
        // 1.1 sulfuric acid (e) -> propylene (n) = deprotonated sulfuric acid, protonated propylene
        // 1.2 deprotonated sulfuric acid -> water
        // 1.3 deprotonated sulfuric acid -> deprotonated sulfuric acid
        // 2.1 water (n) -> protonated propylene (e) = oxygen atom on water attacks carbocation on propylene
        if (test_number === 7) {
            // electrophile should be protonated propylene
            // nucleophile should be water
            // electrophile atom should be carbocation on protonated propylene
            // nucleohile atom should be oxygen atom on water
            electrophile_molecule.length.should.be.equal(8888) // protonated propylene
            electrophile_atom_index.should.be.equal(9999)
            electrophile_molecule[electrophile_atom_index][0].should.be.equal("C")
            CAtom(nucleophile_molecule[nucleophile_atom_index], 0, nucleophile_molecule).isCarbocation(this.test_number).should.be.equal(true)
            nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("O")
            nucleophile_molecule.length.should.be.equal(4) // water
       
            nucleophile_atom_index.should.be.equal(2)
        }
        

        // push : (atoms_or_atomic_symbols, container, molecule_to_add_to_index, test_number, target_atom_index, source_atom_index) => {
        //[nucleophile_atom_index] = MoleculeController(nucleophile_molecule).push(electrophile_molecule.slice(1), container, molecule_to_add_to_index, test_number, electrophile_atom_index, nucleophile_atom_index )

        MoleculeController(nucleophile_molecule).push(electrophile_molecule.slice(1), container, molecule_to_add_to_index, test_number, electrophile_atom_index, nucleophile_atom_index )

        // Remove electrophile from container as it has been consumed by the nucleophile
        // container.splice(electrophile_molecule_index,1)
        // container[electrophile_molecule_index][1] is the number of units
        container[electrophile_molecule_index][1] = container[electrophile_molecule_index][1] -1
       
        return container

    }

    return {
        react : react
    }
}


module.exports = LewisAcidBaseReactions

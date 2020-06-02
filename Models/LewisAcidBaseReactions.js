const Set = require('../Models/Set')

const LewisAcidBaseReactions = (container, MoleculeController, test_number) => {

    const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, test_number) => {

        let nucleophile_molecule_index = null
        let electrophile_molecule_index = null
        
        if (test_number !==3 && test_number !==5) {
            console.log("Wrong section for test number " + test_number)
            process.exit()
        }

        // [Br-] (nucleophile) -----> carbocation
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8
        // Source atom index should be 1
        if (this.test_number === 5) {
            reaction.should.be.equal(false)
        }

        if (null === nucleophile_molecule) {

            const substrate_electrophile_atom_index = MoleculeController(container[1]).electrophileIndex(test_number) // AlCl3
            const reagent_electrophile_atom_index = MoleculeController(container[2]).electrophileIndex(test_number)

            // CO:C (nucleophile) ------> AlCl3 (electropile
            if (test_number === 3) {
                substrate_electrophile_atom_index.should.be.equal(1) // Al
                reagent_electrophile_atom_index.should.be.equal(1) // H
            }

            if (test_number ===5) {
                substrate_electrophile_atom_index.should.be.equal(1) // Nucleophile Br
                reagent_electrophile_atom_index.should.not.be.equal(1) // electrophile C[C+]CC
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

            nucleophile_molecule.length.should.be.equal(1) // Br
            electrophile_molecule.length.should.be.equal(88888) // CC[C+]C
            electrophile_atom_index.should.be.equal(8)
            nucleophile_atom_index.should.be.equal(1)

        }

        

        // push : (atoms_or_atomic_symbols, container, molecule_to_add_to_index, test_number, target_atom_index, source_atom_index) => {
        //[nucleophile_atom_index] = MoleculeController(nucleophile_molecule).push(electrophile_molecule.slice(1), container, molecule_to_add_to_index, test_number, electrophile_atom_index, nucleophile_atom_index )

        MoleculeController(nucleophile_molecule).push(electrophile_molecule.slice(1), container, molecule_to_add_to_index, test_number, electrophile_atom_index, nucleophile_atom_index )

        // Remove electrophile from container as it has been consumed by the nucleophile
        container.splice(electrophile_molecule_index,1)
       
        return container

    }

    return {
        react : react
    }
}


module.exports = LewisAcidBaseReactions

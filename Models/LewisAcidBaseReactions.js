const Set = require('../Models/Set')

const LewisAcidBaseReactions = (container, MoleculeController, test_number) => {

    const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, test_number) => {

        let nucleophile_atom_index = null
        let electrophile_atom_index = null
        
        if (test_number !==3) {
            console.log("Wrong section for test number " + test_number)
            process.exit()
        }

        if (null === nucleophile_molecule) {

            const substrate_electrophile_atom_index = MoleculeController(container[1]).electrophileIndex() // AlCl3
            const reagent_electrophile_atom_index = MoleculeController(container[2]).electrophileIndex()

            // CO:C (nucleophile) ------> AlCl3 (electropile
            if (test_number === 3) {
                substrate_electrophile_atom_index.should.be.equal(1) // Al
                reagent_electrophile_atom_index.should.be.equal(1) // H
            }

            // Container [false, [AlCl3], [COC]]
            if (substrate_electrophile_atom_index !==false) {
                electrophile_atom_index = substrate_electrophile_atom_index
                nucleophile_atom_index = 2
                electrophile_atom_index = 1
                electrophile_molecule = container[1]
                nucleophile_molecule = container[2]
                nucleophile_atom_index = MoleculeController(nucleophile_molecule).nucleophileIndex(3) // should be 5
                if (test_number ===3) {
                    nucleophile_molecule[nucleophile_atom_index][0].should.be.equal('O')
                    nucleophile_atom_index.should.be.equal(5)
                }
            } else if (reagent_electrophile_atom_index !==false) {
                electrophile_atom_index = reagent_electrophile_atom_index
                nucleophile_atom_index = 1
                electrophile_atom_index = 2
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


        // CO:C (nucleophile) ------> AlCl3 (electrophile)
        if (test_number === 3) {
            nucleophile_atom_index.should.be.equal(5)
            nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("O")
            electrophile_atom_index.should.be.equal(1)
            electrophile_molecule[electrophile_atom_index][0].should.be.equal("Al")
        }

        // push : (atoms_or_atomic_symbols, container, molecule_to_add_to_index, test_number, target_atom_index, source_atom_index) => {
        container[nucleophile_atom_index] = MoleculeController(nucleophile_molecule).push(electrophile_molecule.slice(1), container, molecule_to_add_to_index, test_number, electrophile_atom_index, nucleophile_atom_index )

        // Remove electrophile from container as it has been consumed by the nucleophile
        container.splice(1,1)
        return container

    }

    return {
        react : react
    }
}


module.exports = LewisAcidBaseReactions

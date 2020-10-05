const Set = require('../Models/Set')

const LewisAcidBaseReactions = (container, MoleculeController, test_number, verbose) => {

    const react = (substrate_molecule, reagent_molecule) => {

             
            const substrate_electrophile_atom_index = MoleculeController(container[1], verbose).electrophileIndex() // AlCl3

 

            const reagent_electrophile_atom_index = MoleculeController(container[2]).electrophileIndex()


            

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
        


        // AlCl3 (electrophile) <- C:OC (nucleophile)
        const molecule_to_add_to_index = 0
        

        
          
        

        
        MoleculeController(nucleophile_molecule).push(electrophile_molecule[0].slice(1), container, molecule_to_add_to_index, test_number, electrophile_atom_index, nucleophile_atom_index )

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

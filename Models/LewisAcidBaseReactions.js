const Set = require('../Models/Set')

const LewisAcidBaseReactions = (container, MoleculeController, test_number, verbose) => {

    const react = (substrate_molecule_index, reagent_molecule_index) => {

        const substrate_nucleophile_atom_index = MoleculeController(container[substrate_molecule_index]).nucleophileIndex()
        const reagent_nucleophile_atom_index = MoleculeController(container[reagent_molecule_index]).nucleophileIndex()
        
        const substrate_electrophile_atom_index = MoleculeController(container[substrate_molecule_index]).electrophileIndex()
        const reagent_electrophile_atom_index = MoleculeController(container[reagent_molecule_index]).electrophileIndex()
        
        if (substrate_nucleophile_atom_index !== false && reagent_nucleophile_atom_index !== false) {
            if (reagent_electrophile_atom_index === false) {
                nucleophile_molecule_index = reagent_molecule_index
                nucleophile_molecule_nucleophile_atom_index = reagent_nucleophile_atom_index     
                electrophile_molecule_index = substrate_molecule_index
                electrophile_molecule_electrophile_atom_index = substrate_nucleophile_atom_index               
            } else {
                // compare pKa values
                if (container[substrate_molecule_index][1][substrate_electrophile_atom_index][0] >
                    container[reagent_molecule_index][1][reagent_electrophile_atom_index][0]) {
                       nucleophile_molecule_index = reagent_molecule_index
                       nucleophile_molecule_nucleophile_atom_index = reagent_nucleophile_atom_index     
                       electrophile_molecule_index = substrate_molecule_index
                       electrophile_molecule_electrophile_atom_index = substrate_nucleophile_atom_index    
                 } else {
                       nucleophile_molecule_index = substrate_molecule_index
                       nucleophile_molecule_nucleophile_atom_index = substrate_nucleophile_atom_index     
                       electrophile_molecule_index = reagent_molecule_index
                       electrophile_molecule_electrophile_atom_index = reagent_nucleophile_atom_index    
                 }
                 
            }  
            
        }
        
        if (substrate_nucleophile_atom_index !== false && reagent_nucleophile_atom_index === false) {
            if (reagent_electrophile_atom_index === false) {
                return false
            }
            nucleophile_molecule_index = substrate_molecule_index
            nucleophile_molecule_nucleophile_atom_index = substrate_nucleophile_atom_index
        }
        
        if (substrate_nucleophile_atom_index === false && reagent_nucleophile_atom_index !== false) {
            if (substrate_electrophile_atom_index === false) {
                return false
            }
            nucleophile_molecule_index = reagent_molecule_index
            nucleophile_molecule_nucleophile_atom_index = reagent_nucleophile_atom_index
        }
        
        
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

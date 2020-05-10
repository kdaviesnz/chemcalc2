const LewisAcidBaseReactions = (container, MoleculeController, test_number) => {

    const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index) => {
    if (this.test_number !==3) {
        console.log("Wrong section")
        process.exit()
    }
        
     if (arguments.length === 0 ) {
         const substrate_electrophile_atom_index = MoleculeController(container[1]).electrophileIndex
         const reagent_electrophile_atom_index = MoleculeController(container[2]).electrophileIndex
         if (substrate_electrophile_atom_index !==false) {
             electrophile_atom_index = substrate_electrophile_atom_index
             electrophile_molecule = container[1]
             nucleophile_molecule = container[2]
             nucleophile_atom_index = MoleculeController(container[2]).electrophileIndex
         } elseif (reagent_electrophile_atom_index !==false) {
             electrophile_atom_index = reagent_electrophile_atom_index
             electrophile_molecule = container[2]
             nucleophile_molecule = container[1]
             nucleophile_atom_index = MoleculeController(container[1]).electrophileIndex
         } else {
             return false
         }
     }

    // Neither substrate or reagent has a proton.
    console.log("Neither substrate or reagent has a proton - Container.js")

    // AlCl3 <- C:OC  
        const reagent_atoms = electrophile_molecule.slice(1)
        const atom_to_push_to_index = nucleophile_atom_index
        const atom_to_push_index = electrophile_atom_index
        const molecule_to_add_to_index = 0
        this.MoleculeController(nucleophile_molecule).push(reagent_atoms, this.container, molecule_to_add_to_index, this.test_number, atom_to_push_index, atom_to_push_to_index )
    

    

    
        
    }
    
    return {
        react : react
    }
}


module.exports = LewisAcidBaseReactions

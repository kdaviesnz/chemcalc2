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

    // Check substrate for free slots
    // returns [index, atom] pairs
    const substrate_atoms_with_free_slots = this.MoleculeController(this.container[1]).atomsWithFreeSlots()

    // Check reagent for free slots
    // returns [index, atom] pairs
    const reagent_atoms_with_free_slots = this.MoleculeController(this.container[2]).atomsWithFreeSlots()

    if (this.test_number === 3) {
        substrate_atoms_with_free_slots.length.should.be.equal(1)
        reagent_atoms_with_free_slots.length.should.be.equal(0)
    }

    //  __atomsWithLonePairs
    // Check substrate for free slots
    // returns [index, atom] pairs
    const substrate_atoms_with_lone_pairs = CMolecule(this.container[1]).__atomsWithLonePairs()

    // Check reagent for free slots
    // returns [index, atom] pairs
    const reagent_atoms_with_lone_pairs = CMolecule(this.container[2]).__atomsWithLonePairs()

    if (this.test_number === 3) {
        substrate_atoms_with_lone_pairs.length.should.be.equal(0)
        reagent_atoms_with_lone_pairs.length.should.be.equal(1)
    }

    //const _makeCovalentBond = (atoms, atom2_index, test_number, atom_to_push_index) => {
    // push : (atoms_or_atomic_symbols, container, molecule_to_add_to_index, test_number, atom_to_push_index,atom_to_push_to_index)
    if (substrate_atoms_with_free_slots.length > 0 && reagent_atoms_with_lone_pairs.length === 0) {
        // substrate atom has a free slot and reagent has atom with lone pair
        // AlCl3 <- C:OC
        const reagent_atoms = this.container[2].slice(1)
        const atom_to_push_to_index = substrate_atoms_with_free_slots[0][0]
        const atom_to_push_index = reagent_atoms_with_lone_pairs[0][0]
        const molecule_to_add_to_index = 0
        this.MoleculeController(this.container[1]).push(reagent_atoms, this.container, molecule_to_add_to_index, this.test_number, atom_to_push_index, atom_to_push_to_index )
    } else if (substrate_atoms_with_free_slots.length > 0 && reagent_atoms_with_lone_pairs.length === 0) {

    } else if (substrate_atoms_with_free_slots.length === 0 && reagent_atoms_with_lone_pairs.length > 0) {

    }

    process.exit()
        
    }
    
    return {
        react : reacr
    }
}


module.exports = LewisAcidBaseReactions

const LewisAcidBaseReactions = (container, MoleculeController, test_number) => {

    const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, test_number) => {

        if (test_number !==3) {
            console.log("Wrong section for test number " + test_number)
            process.exit()
        }

        if (null === nucleophile_molecule) {
            const substrate_electrophile_atom_index = MoleculeController(container[1]).electrophileIndex
            const reagent_electrophile_atom_index = MoleculeController(container[2]).electrophileIndex
            if (substrate_electrophile_atom_index !==false) {
                electrophile_atom_index = substrate_electrophile_atom_index
                electrophile_molecule = container[1]
                nucleophile_molecule = container[2]
                nucleophile_atom_index = MoleculeController(container[2]).electrophileIndex
            } else if (reagent_electrophile_atom_index !==false) {
                electrophile_atom_index = reagent_electrophile_atom_index
                electrophile_molecule = container[2]
                nucleophile_molecule = container[1]
                nucleophile_atom_index = MoleculeController(container[1]).electrophileIndex
            } else {
                return false
            }
        }


        // AlCl3 (electrophile) <- C:OC (nucleophile)
        const molecule_to_add_to_index = 0
        if (test_number === 3) {
            nucleophile_molecule.length.should.be.equal(10)
            electrophile_molecule.length.should.be.equal(5)
            electrophile_molecule[electrophile_atom_index][0] === "Al"
            nucleophile_molecule[nucleophile_atom_index][0] === "O"
        }


        this.MoleculeController(nucleophile_molecule).push(electrophile_molecule.slice(1), container, molecule_to_add_to_index, test_number, electrophile_atom_index, nucleophile_atom_index )


    }

    return {
        react : react
    }
}


module.exports = LewisAcidBaseReactions

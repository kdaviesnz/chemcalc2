const Set = require('../Models/Set')

const LewisAcidBaseReactions = (container, MoleculeController, test_number, verbose) => {

    const react = (substrate_molecule_index, reagent_index) => {

        const reagents = container.slice(2, container.length)
        const reagent = reagents[reagent_index]
        const reagent_molecule_index = container.length - reagent_index - 1
        reagent_molecule_index.should.be.an.Number()
        container[reagent_molecule_index].should.be.an.Array()

        const substrate_nucleophile_atom_index = MoleculeController(container[substrate_molecule_index]).nucleophileIndex()
        const reagent_nucleophile_atom_index = MoleculeController(reagent).nucleophileIndex()

        const substrate_electrophile_atom_index = MoleculeController(container[substrate_molecule_index]).electrophileIndex()
        const reagent_electrophile_atom_index = MoleculeController(reagent).electrophileIndex()

        // At this point the reagent has not been added to the container array
        /*
        console.log('Reagent (Aluminium chloride) nucleophile atom index:');
        console.log(reagent_nucleophile_atom_index)
        console.log('Substrate (Aluminium chloride) nucleophile atom index:');
        console.log(substrate_nucleophile_atom_index)
        console.log('Reagent (Aluminium chloride) electrophile atom index:');
        console.log(reagent_electrophile_atom_index)
        console.log('Substrate (Aluminium chloride) electrophile atom index:');
        console.log(substrate_electrophile_atom_index)
        */

        if (substrate_nucleophile_atom_index !== undefined && substrate_nucleophile_atom_index!== false) {
            container[substrate_molecule_index][0][1][substrate_nucleophile_atom_index][0].should.be.an.String() // O
        }

        if (reagent_electrophile_atom_index !== undefined && reagent_electrophile_atom_index!== false) {
            reagent[0][1][reagent_electrophile_atom_index][0].should.be.an.String() // Al
        }



        if ((substrate_nucleophile_atom_index !== false && substrate_nucleophile_atom_index !== undefined) && reagent_nucleophile_atom_index !== false) {
            if (reagent_electrophile_atom_index === false) {
                nucleophile_molecule_index = reagent_molecule_index
                nucleophile_molecule_nucleophile_atom_index = reagent_nucleophile_atom_index
                electrophile_molecule_index = substrate_molecule_index
                electrophile_molecule_electrophile_atom_index = substrate_nucleophile_atom_index
            } else if (substrate_electrophile_atom_index === false) {
                nucleophile_molecule_index = substrate_molecule_index
                nucleophile_molecule_nucleophile_atom_index = substrate_nucleophile_atom_index
                electrophile_molecule_index = reagent_molecule_index
                electrophile_molecule_electrophile_atom_index = reagent_electrophile_atom_index
                electrophile_molecule = reagent
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

        } else if (substrate_nucleophile_atom_index !== false && reagent_nucleophile_atom_index === false) {
            if (reagent_electrophile_atom_index === false) {
                return false
            }
            nucleophile_molecule_index = substrate_molecule_index
            nucleophile_molecule_nucleophile_atom_index = substrate_nucleophile_atom_index
        } else if ((substrate_nucleophile_atom_index === false || substrate_nucleophile_atom_index === undefined) && (reagent_nucleophile_atom_index !== false)) {
            if (substrate_electrophile_atom_index === false || substrate_electrophile_atom_index === undefined) {
                return false
            }
            nucleophile_molecule_index = reagent_molecule_index
            nucleophile_molecule_nucleophile_atom_index = reagent_nucleophile_atom_index
        }

       // console.log(nucleophile_molecule_index) // Methyl ether (O, donates lone pair, substrate, already in container array)
        //console.log(electrophile_molecule_index) // Aluminum chloride (Al, accepts lone pair, reagent, not in container array)
//        process.exit()

        if (undefined !== container[nucleophile_molecule_index]) {
            const electrophile_atoms = electrophile_molecule[0][1]
            electrophile_atoms[0][0].should.be.an.String()
            //   push: (atoms_or_atomic_symbols, container, target_molecule_index, test_number, target_atom_index, source_atom_index, source_molecule_index) => {
            container = MoleculeController(container[nucleophile_molecule_index]).push(
                electrophile_atoms,
                container,
                electrophile_molecule_index, // target molecule index (always the electrophile)
                test_number,
                electrophile_molecule_electrophile_atom_index, // target atom index (always the electropile)
                nucleophile_molecule_nucleophile_atom_index, // source atom index (always the nucleophile)
                nucleophile_molecule_index // source molecule index (always the molecule containing the nucleophile)
            )
        }

        return container

    }

    return {
        react : react
    }
}


module.exports = LewisAcidBaseReactions

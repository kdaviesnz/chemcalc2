const BronstedLowryAcidBaseReactions = (container, MoleculeController, test_number) => {

    const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index) => {

        if (arguments.length === 0) {
            const substrate_proton_index = MoleculeController(nucleophile_molecule).indexOf("H")
            const reagent_proton_index = MoleculeController(electrophile_molecule).indexOf("H")
            if (substrate_proton_index!== false && reagent_proton_index === false) {
                electrophile_molecule = nucleophile_molecule
                electrophile_atom_index = substrate_proton_index
                nucleophile_molecule = electrophile_molecule
                nucleophile_atom_index = MoleculeController(electrophile_molecule).nucleophileIndex()
            } else if (substrate_proton_index=== false && reagent_proton_index !== false) {
                electrophile_molecule = electrophile_molecule
                electrophile_atom_index = reagent_proton_index
                nucleophile_molecule = nucleophile_molecule
                nucleophile_atom_index = MoleculeController(nucleophile_molecule).nucleophileIndex()
            } else {
                if (nucleophile_molecule[0] <= electrophile_molecule[0]) {
                    electrophile_molecule = nucleophile_molecule
                    electrophile_atom_index = substrate_proton_index

                    nucleophile_molecule = electrophile_molecule
                    nucleophile_atom_index = MoleculeController(electrophile_molecule).nucleophileIndex()
                } else {
                    electrophile_molecule = electrophile_molecule
                    electrophile_atom_index = reagent_proton_index
                    nucleophile_molecule = nucleophile_molecule
                    nucleophile_atom_index = MoleculeController(nucleophile_molecule).nucleophileIndex()

                }
            }
        }

        if (electrophile_atom_index === null) {
            electrophile_atom_index = MoleculeController(electrophile_molecule).indexOf("H")
        }

        // Check that we have a proton
        if (!AtomController(electrophile_molecule[electrophile_atom_index]).isProton()) {
            return false
        }

        if (test_number === 3) {
            // console.log(electrophile_molecule) // COC
            console.log("Wrong section for test 3 - reagent doesn't have a non-carbon hydrogen (Container.js)")
            process.exit()
        }

        // HCl (electrophile) <- H2O (nucleophile)
        if (test_number === 1) {
            nucleophile_molecule.length.should.be.equal(4)
            electrophile_molecule.length.should.be.equal(3)
            electrophile_molecule[electrophile_atom_index][0] === "H"
            nucleophile_molecule[nucleophile_atom_index][0] === "O"
        }

        // [Cl-] (nucleophile) <- H3O (electrophile)
        if (test_number === 2 ) {
            nucleophile_molecule.length.should.be.equal(1)
            electrophile_molecule.length.should.be.equal(5)
            electrophile_molecule[electrophile_atom_index][0] === "H"
            nucleophile_molecule[nucleophile_atom_index][0] === "Cl"
        }

        // react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index)
        // Here the substrate (base) has no proton and the reagent (acid) does.
        // So we remove the proton from the reagent and add it to the substrate.
        const proton_index = MoleculeController(electrophile_molecule).indexOf("H")
        proton_index.should.be.greaterThan(0);

        if (test_number === 2) {
            nucleophile_molecule[1][0].should.be.equal("Cl")
            electrophile_molecule.length.should.be.equal(5)
            proton_index.should.be.equal(4)
        }

        // remove proton
        container = MoleculeController(electrophile_molecule).removeProton(
            container,
            2,
            MoleculeController(electrophile_molecule).itemAt(proton_index)
        )

        if (test_number === 2) {
            container.length.should.be.equal(4)
            if (null !== container[container.length-1][0]) {
                console.log("Value should be null")
                process.exit()
            }
            container[container.length-1][1][0].should.be.equal("H")
            container[container.length-1][1].length.should.be.equal(4)
        }

        const proton = container[container.length-1][1]
        if (test_number === 2) {
            proton.should.be.Array()
            proton.length.should.be.equal(4)
            proton[0].should.be.String()
            proton[0].should.be.equal("H")
        }

        // Move the proton to first molecule
        container.splice(container.length-1,1) // remove proton from container
        // nucleophile_molecule is chlorine
        const atom_to_push_index = 0
        MoleculeController(nucleophile_molecule).push([proton], container, container.length-1, test_number, atom_to_push_index)

        if (test_number === 2) {
            container.length.should.be.equal(3)
            nucleophile_molecule.length.should.be.equal(3)
            electrophile_molecule.length.should.be.equal(4)
            nucleophile_molecule[1].length.should.be.equal(12)
            nucleophile_molecule[1][0].should.be.equal("Cl")
            nucleophile_molecule[2][0].should.be.equal("H")
            electrophile_molecule[1].length.should.be.equal(6)
            electrophile_molecule[1][0].should.be.equal("H")
            electrophile_molecule[2].length.should.be.equal(6)
            electrophile_molecule[2][0].should.be.equal("H")
            electrophile_molecule[3].length.should.be.equal(12)
            electrophile_molecule[3][0].should.be.equal("O")
        }

        if (test_number === 1) {
            container.length.should.be.equal(3)
            nucleophile_molecule.length.should.be.equal(2)
            nucleophile_molecule[1].length.should.be.equal(12)
            const lone_pairs = MoleculeController(nucleophile_molecule).lonePairs(
                nucleophile_molecule[1],
                1)
            lone_pairs.length.should.equal(8)
            nucleophile_molecule[1][0].should.be.equal("Cl")
            electrophile_molecule.length.should.be.equal(5)
            electrophile_molecule[1].should.be.an.Array()
            electrophile_molecule[1].length.should.be.equal(6)
            electrophile_molecule[1][0].should.be.equal("H")
            electrophile_molecule[1][1].should.be.equal(1)
            electrophile_molecule[1][2].should.be.equal(1)
            electrophile_molecule[1][3].should.be.equal(1)
            electrophile_molecule[1][4].should.be.a.String()
            electrophile_molecule[2].should.be.an.Array()
            electrophile_molecule[2].length.should.be.equal(6)
            electrophile_molecule[2][0].should.be.equal("H")
            electrophile_molecule[2][1].should.be.equal(1)
            electrophile_molecule[2][2].should.be.equal(1)
            electrophile_molecule[2][3].should.be.equal(1)
            container.length.should.be.equal(3)
            nucleophile_molecule.length.should.be.equal(2)
            nucleophile_molecule[1].length.should.be.equal(12)
            nucleophile_molecule[1][0].should.be.equal("Cl")
            electrophile_molecule.length.should.be.equal(5)
            electrophile_molecule[1].should.be.an.Array()
            electrophile_molecule[1].length.should.be.equal(6)
            electrophile_molecule[1][0].should.be.equal("H")
            electrophile_molecule[1][1].should.be.equal(1)
            electrophile_molecule[1][2].should.be.equal(1)
            electrophile_molecule[1][3].should.be.equal(1)
            electrophile_molecule[1][4].should.be.a.String()
            electrophile_molecule[2].should.be.an.Array()
            electrophile_molecule[2].length.should.be.equal(6)
            electrophile_molecule[2][0].should.be.equal("H")
            electrophile_molecule[2][1].should.be.equal(1)
            electrophile_molecule[2][2].should.be.equal(1)
            electrophile_molecule[2][3].should.be.equal(1)
            electrophile_molecule[2][4].should.be.a.String()
            electrophile_molecule[3].should.be.an.Array()
            electrophile_molecule[3].length.should.be.equal(12)
            electrophile_molecule[3][0].should.be.equal("O")
            electrophile_molecule[3][1].should.be.equal(8)
            electrophile_molecule[3][2].should.be.equal(6)
            electrophile_molecule[3][3].should.be.equal(2)
            electrophile_molecule[3][4].should.be.a.String()
            electrophile_molecule[4].should.be.an.Array()
            electrophile_molecule[4].length.should.be.equal(6)
            electrophile_molecule[4][0].should.be.equal("H")
            electrophile_molecule[4][1].should.be.equal(1)
            electrophile_molecule[4][2].should.be.equal(1)
            electrophile_molecule[4][3].should.be.equal(1)
            electrophile_molecule[4][4].should.be.a.String()
        }

    }

    return {
        react: react
    }

}

module.exports = BronstedLowryAcidBaseReactions

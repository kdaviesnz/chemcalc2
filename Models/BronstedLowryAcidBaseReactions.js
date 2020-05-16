const CAtom = require('../Controllers/Atom')

const BronstedLowryAcidBaseReactions = (container, MoleculeController, test_number) => {

    const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule,
                   electrophile_atom_index, nucleophile_molecule_index, electrophile_molecule_index) => {

        if (undefined === nucleophile_molecule) {
            const substrate_proton_index = MoleculeController(container[1]).indexOf("H")
            const reagent_proton_index = MoleculeController(container[2]).indexOf("H")

            if (test_number === 3) {
                substrate_proton_index.should.be.equal(false)
            }

            if (test_number === 3) {
                reagent_proton_index.should.be.equal(false) // hydrogens are attached to carbons
            }

            if (substrate_proton_index!== false && reagent_proton_index === false) {
                electrophile_molecule_index = 1
                electrophile_molecule = container[electrophile_molecule_index]
                electrophile_atom_index = substrate_proton_index
                nucleophile_molecule_index = 2
                nucleophile_molecule = container[nucleophile_molecule_index]
                nucleophile_atom_index = MoleculeController(electrophile_molecule).nucleophileIndex()
            } else if (substrate_proton_index=== false && reagent_proton_index !== false) {
                electrophile_molecule_index = 2
                electrophile_molecule = container[electrophile_molecule_index]
                electrophile_atom_index = reagent_proton_index
                nucleophile_molecule_index = 1
                nucleophile_molecule = container[nucleophile_molecule_index]
                nucleophile_atom_index = MoleculeController(nucleophile_molecule).nucleophileIndex()
            } else if (substrate_proton_index=== false && reagent_proton_index === false) {
                return false
            }else {
                // -6.3 HCl, 14 H2O
                // Test number 1
                // Container - [false, [HCl], [H2O]]
                if (container[1][0] <= container[2][0]) {
                    // HCl is the proton donator and is our electrophile as protons do not have electrons
                    // H2O (nucleophile) is the proton acceptor as the oxygen has lone pairs of electrons.
                    electrophile_molecule_index = 1
                    electrophile_molecule = container[electrophile_molecule_index]
                    electrophile_atom_index = substrate_proton_index
                    nucleophile_molecule_index = 2
                    nucleophile_molecule = container[nucleophile_molecule_index]
                    nucleophile_atom_index = MoleculeController(nucleophile_molecule).nucleophileIndex(test_number)
                    nucleophile_atom_index.should.be.equal(3)
                    nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("O")
                } else {
                    electrophile_molecule_index = 2
                    electrophile_molecule = container[electrophile_molecule_index]
                    electrophile_atom_index = reagent_proton_index
                    nucleophile_molecule_index = 1
                    nucleophile_molecule = container[nucleophile_molecule_index]
                    nucleophile_atom_index = MoleculeController(nucleophile_molecule).nucleophileIndex()

                }
            }
        }

        if (undefined === electrophile_molecule ) {
            console.log("BronstedLowryAcidBaseReactions::electrophile_molecule is undefined or null")
            process.exit()
        }

        if (electrophile_atom_index === null || electrophile_atom_index === undefined) {
            electrophile_atom_index = MoleculeController(electrophile_molecule).indexOf("H")
        }

        if (electrophile_atom_index === null || electrophile_atom_index === undefined) {
            console.log("BronstedLowryAcidBaseReactions::electrophile_atom_index is undefined or null")
            process.exit()
        }

        // Check that we have a proton
        if (test_number === 3) {
            electrophile_molecule[1][0].should.be.equal("Al")
        }

        if (electrophile_molecule[electrophile_atom_index][0] !== "H") {
            if (test_number === 1) {
                console.log("BronstedLowryAcidBaseReactions::Should have a proton")
                process.exit()
            }
            return false
        }

        if (test_number === 3) {
            // console.log(electrophile_molecule) // COC
            console.log("Wrong section for test 3 - reagent doesn't have a non-carbon hydrogen (Container.js)")
            process.exit()
        }

        // HCl (electrophile) <- H2O (nucleophile)
        if (test_number === 1) {
            // console.log(nucleophile_molecule)
            nucleophile_molecule.length.should.be.equal(4) // H2O
            electrophile_molecule.length.should.be.equal(3)  // HCl
            electrophile_molecule[electrophile_atom_index][0].should.be.equal("H")
            nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("O")
        }

        // [Cl-] (nucleophile) <- H3O (electrophile)
        if (test_number === 2 ) {
            nucleophile_molecule.length.should.be.equal(2)
            nucleophile_atom_index.should.be.equal(1)
            electrophile_molecule.length.should.be.equal(5)
            electrophile_molecule[electrophile_atom_index][0].should.be.equal("H")
            nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("Cl")
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
        if (test_number === 1) {
            electrophile_molecule_index.should.be.equal(1)
        }
        container = MoleculeController(electrophile_molecule).removeProton(
            container,
            electrophile_molecule_index,
            MoleculeController(electrophile_molecule).itemAt(proton_index),
            test_number
        )

        if (test_number === 2) {
            container.length.should.be.equal(4)
            if (null !== container[container.length-1][0]) {
                console.log("BronstedLowryAcidBaseReactions::Value should be null")
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
        const source_atom_index = 0
        if (test_number === 1) {
            nucleophile_molecule.length.should.be.equal(4)
        }
        // nucleophile_molecule is water
        MoleculeController(nucleophile_molecule).push([proton], container, container.length-1, test_number, source_atom_index)

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
            // H3O
            nucleophile_molecule.length.should.be.equal(5)
            nucleophile_molecule[3].length.should.be.equal(12)
            // [Cl-]
            electrophile_molecule[1][0].should.be.equal("Cl")
            electrophile_molecule.length.should.be.equal(2)
        }

        return container

    }

    return {
        react: react
    }

}

module.exports = BronstedLowryAcidBaseReactions

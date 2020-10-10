const CAtom = require('../../Controllers/Atom')
const _ = require('lodash');

const MoleculeAI = (container_molecule) => {

    container_molecule.length.should.be.equal(2) // molecule, units
    container_molecule[0].length.should.be.equal(2) // pKa, atoms
    container_molecule[0][0].should.be.an.Number() // pka
    container_molecule[0][1].should.be.an.Array()
    container_molecule[0][1][0].should.be.an.Array()
    container_molecule[0][1][0][0].should.be.an.String()


    // All required parameters should be passed by MoleculeAI()
    // No method should change state of container_molecule
    return {

        "findProtonIndex": () => {
            return _.findIndex(container_molecule[0][1], (atom, index)=>{

                if (atom[0] !== "H") {
                    return false
                }

                const hydrogen_atom_object = CAtom(atom, index, container_molecule)

                return hydrogen_atom_object.bondCount() === 1

            })
        },

        "findHydroxylOxygenIndex":() => {

            return _.findIndex(container_molecule[0][1], (oxygen_atom, oxygen_atom_index)=>{


                // @todo Famillies alcohol
                // Not an oxygen atom
                if (oxygen_atom[0] !== "O") {
                    return false
                }

                // Not -OH
                const oxygen_atom_object = CAtom(oxygen_atom, oxygen_atom_index, container_molecule)
                if(oxygen_atom_object.bondCount()!==2) { // 1 hydrogen bond plus 1 carbon atom
                    return false
                }


                const indexed_bonds = oxygen_atom_object.indexedBonds("")

                // Check we have 1 hydrogen attached to the oxygen atom
                if (indexed_bonds.filter((bond) => {
                        if (bond.atom[0] !== "H") {
                            return false
                        }
                        const hydrogen_atom = CAtom(bond.atom, bond.atom_index, container_molecule)
                        if (hydrogen_atom.bondCount() !== 1) {
                            return false
                        }
                        return true
                    }
                ).length !== 1) {
                    return false
                }


                // Check we have 1 carbon attached to the oxygen atom
                if (indexed_bonds.filter((bond) => {
                        return bond.atom[0] === "C"
                    }
                ).length !== 1) {
                    return false
                }

                return true
            })

        }


    }
}

module.exports = MoleculeAI

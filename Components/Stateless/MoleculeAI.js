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
        
        
        /*
        


        */
        "findNucleophileIndex": () => {

            // Look for negatively charged atom
            const negative_atom_index = _.findIndex(container_molecule[0][1], (atom, index)=>{
                const atom_object = CAtom(atom, index,container_molecule)
                return atom_object.isNegativelyCharged()
            })


            if (negative_atom_index > -1) {
                return negative_atom_index
            }

            // Look for double bond with most hydrogens
            let hydrogen_count = 0
            const nucleophile_index = container_molecule[0][1].reduce((carry, atom, index)=> {
                const atom_object = CAtom(atom, index,container_molecule)
                const double_bonds = atom_object.indexedDoubleBonds("").filter((double_bond)=>{
                    // Check that atom we are bonding to has more than the current number of hydrogens
                    if (double_bond.atom[0]!=="C") {
                        return false
                    }
                    const bonded_atom_object_hydrogen_bonds = CAtom(double_bond.atom, double_bond.atom_index, container_molecule).filter(
                        (bonded_atom_object_bonds)=>{
                            return bonded_atom_object_bonds.atom[0] === "H"
                        }
                    )
                    if (bonded_atom_object_hydrogen_bonds > hydrogen_count) {
                        hydrogen_count = bonded_atom_object_hydrogen_bonds.length
                        return true
                    } else {
                        return false
                    }
                })
                carry = double_bonds.length > 0? double_bonds[0].atom_index:carry
                return carry

            }, -1)

            // Verifications checks
            if (undefined === container_molecule[0][1][nucleophile_index]) {
                return -1
            }

            nucleophile_index.should.be.an.Number()

            const nucleophile_atom_object = CAtom(container_molecule[0][1][nucleophile_index], nucleophile_index, container_molecule)
            if (nucleophile_atom_object.isNegativelyCharged() === false && nucleophile_atom_object.doubleBondCount() === 0) {
                return -1
            }

            return nucleophile_index

        },

         "findElectrophileIndex": () => {
            return _.findIndex(container_molecule[0][1], (atom, index)=>{

                const atom_object = CAtom(atom, index,container_molecule)
               
                if (atom_object.isPositivelyCharged() ) {
                    return true
                }
                
                if (atom_object.freeSlots().length > 0) {
                    return true
                }
                
                if (atom[0]==="H" && atom_object.indexedBonds("").filter((bond)=>{
                    return bond.atom !== "C"
                }).length === 0) {
                    return true
                }
                
                return false

            })
        },

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

        },

        "findWaterOxygenIndex":() => {

            return _.findIndex(container_molecule[0][1], (oxygen_atom, oxygen_atom_index)=>{


                // Not an oxygen atom
                if (oxygen_atom[0] !== "O") {
                    return false
                }

                console.log("got here")

                // Not -OH2
                const oxygen_atom_object = CAtom(oxygen_atom, oxygen_atom_index, container_molecule)
                if(oxygen_atom_object.bondCount()< 3) { // 2 hydrogen bonds plus 1 carbon atom
                    return false
                }

                const indexed_bonds = oxygen_atom_object.indexedBonds("")

                // Check we have 2 hydrogens attached to the oxygen atom
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
                ).length !== 2) {
                    return false
                }

                return true
            })

        }


    }
}

module.exports = MoleculeAI
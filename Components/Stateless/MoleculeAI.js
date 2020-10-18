const CAtom = require('../../Controllers/Atom')
const _ = require('lodash');

const MoleculeAI = (container_molecule) => {

    container_molecule.length.should.be.equal(2) // molecule, units
    container_molecule[0].length.should.be.equal(2) // pKa, atoms
    container_molecule[0][0].should.be.an.Number() // pka
    container_molecule[0][1].should.be.an.Array()
    if (undefined !== container_molecule[0][1][0]) {
        container_molecule[0][1][0].should.be.an.Array()
        container_molecule[0][1][0][0].should.be.an.String()
    }


    // All required parameters should be passed by MoleculeAI()
    // No method should change state of container_molecule
    return {


        "chains": function(previous_atom_index, root_atom_index, chains, chain_index, col, depth) {

            console.log("Depth = " + depth)
            console.log(chains)
            // const benyzl_alcohol = MoleculeFactory("C1=CC=C(C=C1)CO")
            /*
            Depth = 1
[ [ 1 ] ]
Depth = 2
[ [ 1, 3 ] ]
Depth = 3
[ [ 1, 3, 6 ] ]
Depth = 4
[ [ 1, 3, 6, 2 ] ]
Depth = 5
[ [ 1, 3, 6, 2, 3 ] ]
Depth = 6
[ [ 1, 3, 6, 2, 3, 6 ] ]
Depth = 7
[ [ 1, 3, 6, 2, 3, 6, 2 ] ]
Depth = 8
[ [ 1, 3, 6, 2, 3, 6, 2, 3 ] ]
Depth = 9
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6 ] ]
Depth = 10
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6, 2 ] ]
Depth = 11
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3 ] ]
Depth = 12
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6 ] ]
Depth = 13
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2 ] ]
Depth = 14
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3 ] ]
Depth = 15
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6 ] ]
Depth = 16
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2 ] ]
Depth = 17
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3 ] ]
Depth = 18
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6 ] ]
Depth = 19
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2 ] ]
Depth = 20
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3 ] ]
Depth = 21
[ [ 1, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6, 2, 3, 6 ] ]

             */
            if (depth > 20) {
                console.log("MoleculeAI chains()")
                process.exit()
            }
            /*
            depth = 1 previous atom index= null root atom index=3
chain index= 0 col = 0
Chains=
[ [ 'C' ] ]
             */
            /*
            depth = 2 previous atom index= 3 root atom index=4
chain index= 0 col = 1
Chains=
[ [ 'C', 'O' ] ]

             */
          
                 // Recursively fetch chains of atoms where root_atom_index is the first atom
            

            
            const atoms = container_molecule[0][1].filter((atom)=>{
                return atom[0] !== 'H'
            })

            const root_atom_object = CAtom(container_molecule[0][1][root_atom_index], root_atom_index, container_molecule)

            // "C(O)N"
            // depth = 2 previous atom index= 3 root atom index=4
            const bonds = _.cloneDeep(root_atom_object).indexedBonds("").filter(
                (bond) => {
                    return bond.atom_index !== previous_atom_index && bond.atom[0] !== "H"
                }
            )

            if (bonds.length === 0) {
                return chains
            }
            
            
            
            _.cloneDeep(bonds).map(
                (bond, index) => {
                    
                    // 1a. bonds = [N],  col = 0         
                    // 1b. bonds = [O,C], col = 1
                    
                    // 1a. previous_atom_index = null, root_atom_index = C, chains = [[C]], col = 0   
                    // 1b previous_atom_index = C, root_atom_index = N  chains = [[C,N]], col = 2
                    // 1bb previous_atom_index = C, root_atom_index = N  chains = [[C,N,O]], col = 2


                    // "C(O)N"
                    const chain_index = chains.length+index-1 < 0?chains.length+index:chains.length+index-1

                     if (undefined === chains[chain_index]) {
                         if (undefined === chains[chain_index-1]) {
                             chains[chain_index] = []
                         } else {
                             chains[chain_index] = chains[chain_index-1].slice(0, col)
                         }
                     }

                     chains[chain_index].push(bond.atom_index)

                    col++


                     if (chains[chain_index][0] !== bond.atom_index) {
                         chains = this.chains(root_atom_index, bond.atom_index, chains, chain_index, col, depth + 1)
                     }

                }                
            )
            
            return chains
            
            
        },
        

        "isWater":() => {
            if  (container_molecule[0][1].length !== 3) {
                return false
            }
            const oxygen_atom_index = _.findIndex(_.cloneDeep(container_molecule[0][1]), (atom)=>{
                return atom[0] === "O"
            })
            if (oxygen_atom_index === -1) {
                return false
            }
            const oxygen_object = CAtom(container_molecule[0][1][oxygen_atom_index], oxygen_atom_index, container_molecule)
            const indexed_bonds = oxygen_object.indexedBonds("")
            if (indexed_bonds.length !==2 ) {
                return false
            }
            return indexed_bonds.filter((bond)=>{
                return bond.atom[0] === "H"
            }).length === 2
        },

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
            let nucleophile_index = container_molecule[0][1].reduce((carry, atom, index)=> {
                const atom_object = CAtom(atom, index,container_molecule)
                const double_bonds = atom_object.indexedDoubleBonds("").filter((double_bond)=>{
                    // Check that atom we are bonding to has more than the current number of hydrogens
                    if (double_bond.atom[0]!=="C") {
                        return false
                    }


                    const bonded_atom_object_hydrogen_bonds = CAtom(double_bond.atom, double_bond.atom_index, container_molecule).indexedBonds("").filter(
                        (bonded_atom_object_bonds)=>{
                            return bonded_atom_object_bonds.atom[0] === "H"
                        }
                    )

                    if (bonded_atom_object_hydrogen_bonds.length >= hydrogen_count) {
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
                nucleophile_index = -1
            }

            if (nucleophile_index > -1) {
                return nucleophile_index
            }

            // Check for atom with free electrons
            nucleophile_index = _.findIndex(container_molecule[0][1], (atom, atom_index) => {
                return atom[0] !== "H" && CAtom(atom, atom_index, container_molecule).freeElectrons().length > 0
            })

            nucleophile_index.should.be.an.Number()

            if (nucleophile_index === -1) {
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

        "findNonHydroxylOxygenIndex":() => {

            return _.findIndex(container_molecule[0][1], (oxygen_atom, oxygen_atom_index)=>{


                // Not an oxygen atom
                if (oxygen_atom[0] !== "O") {
                    return false
                }

                const oxygen_atom_object = CAtom(oxygen_atom, oxygen_atom_index, container_molecule)

                const bonds = oxygen_atom_object.indexedBonds("")

                // Get hydrogen_bonds
                const hydrogen_bonds = bonds.filter((bond)=>{
                    return bond.atom[0] === "H"
                })

                if (hydrogen_bonds.length === 1 && bonds.length === 2) {
                    return false
                }


                return true
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

                // Not -OH2
                const oxygen_atom_object = CAtom(oxygen_atom, oxygen_atom_index, container_molecule)
                if(oxygen_atom_object.bondCount()< 1) { // 2 hydrogen bonds plus optionally 1 carbon atom
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



        },

        "findNonWaterOxygenIndex":() => {

            return _.findIndex(container_molecule[0][1], (oxygen_atom, oxygen_atom_index)=>{

                // Not an oxygen atom
                if (oxygen_atom[0] !== "O") {
                    return false
                }

                const oxygen_atom_object = CAtom(oxygen_atom, oxygen_atom_index, container_molecule)
                if(oxygen_atom_object.bondCount() < 3) {
                    return false
                }



                return true
            })



        }



    }
}

module.exports = MoleculeAI

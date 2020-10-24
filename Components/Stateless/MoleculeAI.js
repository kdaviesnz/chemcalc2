const CAtom = require('../../Controllers/Atom')
const _ = require('lodash');
const VMolecule = require('../../Components/Stateless/Views/Molecule')

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

          //  console.log("Start chains from this.chains() depth=" + depth + '  chain index=' + chain_index)
          //  console.log(chains)
            if (depth > 20) {
                console.log(chains)
                console.log(depth)
                process.exit()
            }

            const root_atom_object = CAtom(container_molecule[0][1][root_atom_index], root_atom_index, container_molecule)

            const bonds = _.cloneDeep(root_atom_object).indexedBonds("").filter(
                (bond) => {
                    return bond.atom_index !== previous_atom_index && bond.atom[0] !== "H"
                }
            )

            if (bonds.length > 0) {

                _.cloneDeep(bonds).map(
                    (bond, index) => {

                        // Everytime index increments we create a new branch
                        var chain_index = chains.length + index - 1 < 0 ? chains.length + index : chains.length + index - 1

                        //const chain_index = chains.length  - 1 < 0 ? chains.length  : chains.length - 1

                        // console.log("Entering loop depth = " + depth + " chain index=" + chain_index + " index=" + index)

                        if (undefined === chains[chain_index]) {
                            // console.log("Adding new branch col=" + col + ' loop index=' + index + ' depth= ' + depth)
                            //console.log(chains)
                            // chains[chain_index] = chains[chain_index - 1].slice(0, col)
                            if (undefined === chains[chain_index - 1] ) {
                                // "C  O   C  (C) (C)   C   O")
                                //  3  4   5  (9) (13)  16  18
                                chain_index = chain_index - 1
                                //console.log(chain_index)
                                //console.log(chains)
                                //console.log(bond.atom_index)
                            }
                            chains[chain_index] = _.cloneDeep(chains[chain_index - 1]).slice(0, depth)
                            //console.log("Added new branch col=" + col )
                            //console.log(chains)
                        }

                        if (chain_index === 55555555) {
                            console.log("IN LOOP Index= " + index + " Col=" + col + " depth= " + depth + ' chain index=' + chain_index)
                            console.log("Bonds (root atom index = " + root_atom_index + ")")
                            console.log(bonds.map((bond) => {
                                return bond.atom_index
                            }))
                            console.log("Chains: ")
                            console.log(chains)
                            console.log("Adding atom " + bond.atom_index)
                        }


                        if (undefined === chains[chain_index]) {
                            // "C  O   C  (C) (C)   C   O")
                            //  3  4   5  (9) (13)  16  18
                            // [ [ 3, 4, 5, 9 ], [ 3, 4, 5, 13 ], [ 3, 4, 5, 16, 18 ] ]
                          //  console.log(chain_index)
                           // console.log(chains)
                           // console.log(bond.atom_index)
                        }
                        chains[chain_index].push(bond.atom_index)

                        col++

                        // Check we dont have a loop.
                        if (chains[chain_index].indexOf(bond.atom_index) === chains[chain_index].length-1)  {
                            chains = this.chains(root_atom_index, bond.atom_index, chains, chain_index, col, depth + 1)
                        }

                    }
                )

            }

            /*
                        // "C  O   C  (C) (C)   C   O")
            //  3  4   5  (9) (13)  16  18
            //console.log(this.compressed())
            /*
   [ [ 'C', 3, [ '4  O' ] ],
  [ 'O', 4, [ '3  C', '5  C' ] ],
  [ 'C', 5, [ '4  O', '9  C', '13  C', '16  C' ] ],
  [ 'C', 9, [ '5  C' ] ],
  [ 'C', 13, [ '5  C' ] ],
  [ 'C', 16, [ '5  C', '18  O' ] ],
  [ 'O', 18, [ '16  C' ] ] ]

 Start chains from this.chains() depth=1  chain index=0
[ [ 3 ] ]
Entering loop depth = 1 chain index=0
Start chains from this.chains() depth=2  chain index=0
[ [ 3, 4 ] ]
Entering loop depth = 2 chain index=0
Start chains from this.chains() depth=3  chain index=0
[ [ 3, 4, 5 ] ]
Entering loop depth = 3 chain index=0
Start chains from this.chains() depth=4  chain index=0
[ [ 3, 4, 5, 9 ] ]
Returning chains from this.chains() depth=4  chain index=0
[ [ 3, 4, 5, 9 ] ]
Entering loop depth = 3 chain index=1
Start chains from this.chains() depth=4  chain index=1
[ [ 3, 4, 5, 9 ], [ 3, 4, 5, 13 ] ]
Returning chains from this.chains() depth=4  chain index=1
[ [ 3, 4, 5, 9 ], [ 3, 4, 5, 13 ] ]
Entering loop depth = 3 chain index=3
Returning chains from this.chains() depth=3  chain index=0
[ [ 3, 4, 5, 9 ], [ 3, 4, 5, 13 ], <1 empty item>, [ 16 ] ]
Returning chains from this.chains() depth=2  chain index=0
[ [ 3, 4, 5, 9 ], [ 3, 4, 5, 13 ], <1 empty item>, [ 16 ] ]
Returning chains from this.chains() depth=1  chain index=0
[ [ 3, 4, 5, 9 ], [ 3, 4, 5, 13 ], <1 empty item>, [ 16 ] ]
[ [ 3, 4, 5, 9 ], [ 3, 4, 5, 13 ], <1 empty item>, [ 16 ] ]
VMolecule


             */
          //  console.log("Returning chains from this.chains() depth=" + depth + '  chain index=' + chain_index)
           // console.log(chains)
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

        "findElectrophileIndex": (filterBy) => {

            return _.findIndex(container_molecule[0][1], (atom, index)=>{

                const atom_object = CAtom(atom, index,container_molecule)

                if (atom_object.isPositivelyCharged() ) {
                    if (undefined === filterBy || atom[0] !== filterBy)
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

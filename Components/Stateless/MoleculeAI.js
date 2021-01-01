const CAtom = require('../../Controllers/Atom')
const _ = require('lodash');
const VMolecule = require('../../Components/Stateless/Views/Molecule')
const Set = require('../../Models/Set')
/*

findHydroxylOxygenIndex()
findOxygenAttachedToCarbonIndex()
findOxygenOnDoubleBondIndex()
findNonWaterOxygenIndex()
findIndexOfCarbonAtomDoubledBondedToNonCarbonBySymbol(symbol)
findNitrogenAttachedToCarbonAttachedToOxygenDoubleBondIndex
 */

const MoleculeAI = (container_molecule) => {

    container_molecule.length.should.be.equal(2) // molecule, units
    container_molecule[0].length.should.be.equal(2) // pKa, atoms
    container_molecule[0][0].should.be.an.Number() // pka
    container_molecule[0][1].should.be.an.Array()
    if (undefined !== container_molecule[0][1][0]) {
        container_molecule[0][1][0].should.be.an.Array()
        container_molecule[0][1][0][0].should.be.an.String()
    }

    const __findHydroxylOxygenIndex = () => {
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

    const __findElectrophileIndex = (filterBy, mustBe) => {



        // Look for N atom with no charge and two hydrogens
        // @see https://en.wikipedia.org/wiki/Leuckart_reaction (formamide, step 1)
        const nitrogen_index = _.findIndex((container_molecule[0][1]), (atom, index)=>{
            if (atom[0] !== 'N' || atom[4] !== "") {
                return false
            }
            const nitrogen_atom_object = CAtom(container_molecule[0][1][index], index, container_molecule)
            return nitrogen_atom_object.hydrogens().length > 0
        })
        if (nitrogen_index > -1) {
            return nitrogen_index
        }

        const i = _.findIndex((container_molecule[0][1]), (atom, index)=>{
            return atom[4] === '+'
        })
        if (i > -1) {
            return i
        }

        return _.findIndex(container_molecule[0][1], (atom, index)=>{

            let electrophile_index = null

            if (atom[4]==="-") {
                return false
            }
            // Ignore metals
            if (atom[0]==="Hg") {
                return false
            }

            const atom_object = CAtom(atom, index,container_molecule)

            if (undefined !== mustBe && atom[0] !== mustBe) {
                return false
            }

            if (atom_object.indexedDoubleBonds("").length > 0) {
                return false
            }

            if (atom_object.isPositivelyCharged() || atom[4] === "&+") {
                electrophile_index = atom_object.atomIndex
            }

            if (atom_object.freeSlots().length > 0) {
                electrophile_index = atom_object.atomIndex
            }


            if (atom[0]==="H" && atom_object.indexedBonds("").filter((bond)=>{
                return bond.atom !== "C"
            }).length === 0) {
                electrophile_index = atom_object.atomIndex
            }

            if (electrophile_index !== null) {
                if (filterBy !== undefined && typeof filterBy === 'function') {
                    return filterBy(electrophile_index) ? electrophile_index : false
                }
                return true
            }

            return false

        })
    }

    const __findLeastSubstitutedCarbon = (carbons) => {

        const c_sorted = carbons.sort((a_atom, b_atom) => {
            const a_hydrogens = a_atom.indexedBonds("").filter(
                (bond) => {
                    return bond.atom[0] === "H"
                }
            )
            const b_hydrogens = b_atom.indexedBonds("").filter(
                (bond) => {
                    return bond.atom[0] === "H"
                }
            )
            return a_hydrogens.length < b_hydrogens.length ? -1 : 0
        })

        return c_sorted.pop()
    }

    const __findMostSubstitutedCarbon = (carbons) => {

        // First look for a carbon with a positive charge and attached to another carbon
        const carbons_with_charge = _.cloneDeep(carbons).filter((atom_object)=>{
            return atom_object.symbol==="C" && atom_object.charge === "+" || atom_object.charge === "&+"
        })

        if (carbons_with_charge.length > 0) {
            return carbons_with_charge[0]
        }

        // Sort by most substituted
        const c_sorted = carbons.sort((a_atom, b_atom) => {
            const a_hydrogens = a_atom.indexedBonds("").filter(
                (bond) => {
                    return bond.atom[0] === "H"
                }
            )
            const b_hydrogens = b_atom.indexedBonds("").filter(
                (bond) => {
                    return bond.atom[0] === "H"
                }
            )
            return a_hydrogens.length < b_hydrogens.length ? -1 : 0
        })

        return c_sorted[0]
    }


    // All required parameters should be passed by MoleculeAI()
    // No method should change state of container_molecule
    return {

        findImineCarbonIndex: () =>{
            return _.findIndex(container_molecule[0][1], (atom, index)=>{
                if (atom[0]==="C" && atom[4] !== "+") {
                    const c_obj = CAtom(container_molecule[0][1][index], index, container_molecule)
                    const n_double_bonds = c_obj.indexedDoubleBonds("").filter((bond)=>{
                        return bond.atom[0] === "N"
                    })
                    return n_double_bonds.length === 1
                }
                return false
            })
        },

        validateMolecule: () => {
            return _.findIndex(container_molecule[0][1], (atom, index)=> {
                const a_obj = CAtom(container_molecule[0][1][index], index, container_molecule)

                // Charges
                if (atom[0] === "O") {

                    if ((a_obj.bondCount() + a_obj.doubleBondCount()) > 3) {
                        console.log("validateMolecule O")
                        console.log(index)
                        console.log('Too many bonds: ' + (a_obj.bondCount() + a_obj.doubleBondCount()))
                        return true
                    }

                    if ((a_obj.bondCount() + a_obj.doubleBondCount()) === 2 && (atom[4] !== "" && atom[4] !== 0)) {
                        console.log("validateMolecule() O")
                        console.log("Index:" + index)
                        console.log(a_obj.bondCount() + a_obj.doubleBondCount())
                        return true
                    }

                }

                if (atom[0]=== "N") {

                    if ((a_obj.bondCount() + a_obj.doubleBondCount()) > 4) {
                        // console.log(("validateMolecule N")
                        // console.log((index)
                        // console.log(('Too many bonds: ' + a_obj.bondCount())
                        return true
                    }

                    if ((a_obj.bondCount() + a_obj.doubleBondCount()) === 3 && (atom[4] !== "" && atom[4] !== 0)) {
                        // console.log(("validateMolecule N")
                        // console.log((index)
                        // console.log((a_obj.bondCount())
                        return true
                    }

                }

                if (atom[0]=== "C") {

                    if ((a_obj.bondCount() + a_obj.doubleBondCount()) > 5) {
                        console.log("validateMolecule C")
                        console.log(index)
                        console.log('Too many bonds: ' + a_obj.bondCount())
                        return true
                    }

                    if ((a_obj.bondCount() + a_obj.doubleBondCount()) === 4 && (atom[4] !== "" && atom[4] !== 0)) {
                        console.log("validateMolecule C")
                        console.log(index)
                        console.log(a_obj.bondCount())
                        return true
                    }

                }


                if (atom[0]=== "O") {

                    if ((a_obj.bondCount() + a_obj.doubleBondCount()) > 5) {
                        console.log("validateMolecule O")
                        console.log(index)
                        console.log('Too many bonds: ' + a_obj.bondCount())
                        return true
                    }

                    if ((a_obj.bondCount() + a_obj.doubleBondCount()) === 4 && (atom[4] !== "" && atom[4] !== 0)) {
                        console.log("validateMolecule C")
                        console.log(index)
                        console.log(a_obj.bondCount() + a_obj.doubleBondCount())
                        return true
                    }
                }
                return false
            }) === -1
        },

        findIndexOfCarbocationAttachedtoCarbon: ()=>{
            return _.findIndex(container_molecule[0][1], (atom, index)=>{
                if (atom[0] !== "C" || atom[4] !== "+") {
                    return false
                }
                const carbocation = CAtom(container_molecule[0][1][index], index, container_molecule)
                const bonds = carbocation.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === "C"
                })
                return bonds.length > 0
            })
        },

        findIndexOfCarbonAtomBondedToNonCarbonBySymbol: function(symbol) {
            return _.findIndex(container_molecule[0][1], (atom, index)=>{
                if (atom[0] !== 'C') {
                    return false
                }
                const carbon_atom_object = CAtom(container_molecule[0][1][index], index, container_molecule)
                const bonds = carbon_atom_object.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === symbol
                })

                if (bonds.length === 0) {
                    return false
                }
                return true
            })
        },


        findNitrogenAttachedToCarbonAttachedToOxygenDoubleBondIndex: function() {
            const c_index = this.findIndexOfCarbonAtomBondedToNonCarbonBySymbol('N')
            const carbon_atom_object = CAtom(container_molecule[0][1][c_index], c_index, container_molecule)
            const c_o_double_bonds = carbon_atom_object.indexedDoubleBonds("").filter((bond)=>{
                return bond.atom[0] === "O"
            })
            if (c_o_double_bonds.length === 0) {
                return -1
            }

            return carbon_atom_object.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "N"
            }).pop().atom_index


        },


        findIndexOfCarbonAtomDoubledBondedToNonCarbonBySymbol: (symbol) => {
            return _.findIndex(container_molecule[0][1], (atom, index)=>{
                if (atom[0] !== 'C') {
                    return false
                }
                const carbon_atom_object = CAtom(container_molecule[0][1][index], index, container_molecule)
                const double_bonds = carbon_atom_object.indexedDoubleBonds("")

                if (carbon_atom_object.doubleBondCount() !== 1) {
                  // console.log(('Wrong number of double bonds')
                   // console.log(("Index: " + index)
                   // console.log(('Double bonds length:' + double_bonds.length)
                    return false
                }

                if (double_bonds[0].atom[0] !== symbol) {
                    return false
                }
                return true
            })
        },

        findAtomWithFreeElectronsIndexBySymbol: (symbol) => {
            return _.findIndex(container_molecule[0][1], (atom, index)=>{
                if (atom[0] !== symbol) {
                    return false
                }
                atom_object = CAtom(container_molecule[0][1][index], index, container_molecule)
                if (atom_object.freeElectrons() === 0) {
                    return false
                }
                return true
            })
        },

        checkForBondedAtomsRecursive: function(groups, group_index, current_atom_index, atom_object, atoms, atom_indexes_added) {

            _.cloneDeep(atoms).map((a, i)=>{
                if (i !== current_atom_index && _.indexOf(atom_indexes_added, i) ===-1 && atom_object.isBondedTo(a)) {
                   // console.log(('Added atom')
                    groups[group_index].push(a)
                    atom_indexes_added.push(i)
                    bonded_atom_object = CAtom(a, i, container_molecule)
                    this.checkForBondedAtomsRecursive(groups, group_index, i, bonded_atom_object, _.cloneDeep(atoms), atom_indexes_added)
                }
                return a
            })
        },

        extractGroupsRecursive: function(groups, group_index, atoms, atom_indexes_added, current_atom_index) {

            if (atom_indexes_added.length === atoms.length) {
                return groups
            }

            if (undefined === atoms[current_atom_index]) {
                return groups
            }


            if (_.indexOf(atom_indexes_added, current_atom_index) ===-1) { // Don't process atom twice

                if (undefined === groups[group_index]) {
                    groups[group_index] = []
                }

                const atom = atoms[current_atom_index]
                // Check for bonded atoms
                atom_object = CAtom(atom, current_atom_index, container_molecule)
                // Modifies group, atom_indexes_added
                // groups, group_index, current_atom_index, atom_object, atoms, atom_indexes_added
                const bonds = atom_object.indexedBonds("")
                if (bonds.length === 0) {
                      // console.log(('adddded atom')
                      groups[group_index].push(atom)
                } else {
                    this.checkForBondedAtomsRecursive(groups, group_index, current_atom_index, atom_object, _.cloneDeep(atoms), atom_indexes_added)
                }
               // console.log((atom_indexes_added)
                //// console.log((groups[group_index])

               // console.log((VMolecule([[-1,groups[group_index]],1]).compressed())

                // process.exit()
               // console.log((group_index)
               // console.log((atom_indexes_added)
                return this.extractGroupsRecursive(groups, group_index +1, _.cloneDeep(atoms), atom_indexes_added, current_atom_index +1)

            } else {
               // console.log((group_index)
               // console.log((atom_indexes_added)
                return this.extractGroupsRecursive(groups, group_index, _.cloneDeep(atoms), atom_indexes_added, current_atom_index +1)
            }



        },

        extractGroups: function() {

            // console.log((VMolecule(container_molecule).compressed())

            const atom_indexes_added = []
            let atoms = _.cloneDeep(container_molecule[0][1])
            // Temporary
            /*
            atoms = atoms.filter((atom)=>{
                return atom[0] !== "H"
            })
            */
//            // console.log((atoms.length)
  //          process.exit()
            const groups = this.extractGroupsRecursive([], 0, _.cloneDeep(atoms), atom_indexes_added, 0)
           // console.log(('extractGroups()')
           // console.log((VMolecule([[-1,groups[0]],1]).compressed())
         //   // console.log((VMolecule([[-1,groups[1]],1]).compressed())
           // console.log((groups.length)
         //   process.exit()

            /*

            // Extract groups from molecule
            const groups = _.cloneDeep(container_molecule[0][1]).reduce((carry, atom, index)=>{
                if (carry.length ===0) {
                    carry.push([atom])
                    return carry
                }
                const atom_object = CAtom(atom, index, container_molecule)
                // Find atom from groups that current atom is bonded to
                const i = _.findIndex(carry, (group_atoms, group_atom_index)=> {
                    const k = _.findIndex(group_atoms, (group_atom, group_atom_index)=>{
                        return atom_object.isBondedTo(group_atom)
                    })
                    return k !==-1
                })
                if (i !== -1) {
                    carry[i].push(atom)
                } else {
                    carry.push([atom])
                }
                return carry
            }, [])

            // console.log(('GROUPS')
            // console.log((groups)

            // fix hydrogens
            const groups_saved = _.cloneDeep(groups)
            const hydrogens = _.cloneDeep(groups).filter((group)=> {
                return group.length === 1 && group[0][0] === 'H'
            }).map((group)=>{
                return group.pop()
            })
            _.cloneDeep(groups).map((group, index)=> {
                const i = _.findIndex(hydrogens, (hydrogen) => {
                    const k = _.findIndex(group, (atom) => {
                        if (atom[0]==="H") {
                            return false
                        }
                        return Set().intersection(hydrogen.slice(5), atom.slice(5)).length > 0
                    })
                    //// console.log((k)
                    if (k > -1) {
                        //// console.log((index)
                        groups_saved[index].push(hydrogen)
                        //// console.log(('hydrogen')
                        //// console.log((hydrogen)
                        //// console.log((groups_saved[index])
                        //process.exit()
                    }
                })
                return group
            })
 // molecule, units
 */

            const groups_filtered = groups.filter((group)=>{
                return group.length === 1 && group[0][0] === "H" ? false: true
            })

            return groups_filtered
        },

        findOxygenAttachedToCarbonIndex: function() {
            return _.findIndex(container_molecule[0][1], (atom, index) => {
                if (atom[0] !== "O") {
                    return false
                }
                const oxygen = CAtom(atom, index, container_molecule )
                // Check for carbon bonds
                const carbon_bonds = oxygen.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === "C"
                })
                return carbon_bonds.length > 0
            })
        },

        findOxygenAttachedToCarbonIndexNoDoubleBonds: function() {
            return _.findIndex(container_molecule[0][1], (atom, index) => {
                if (atom[0] !== "O") {
                    return false
                }
                const oxygen = CAtom(atom, index, container_molecule )

                if (oxygen.indexedDoubleBonds("").length > 0) {
                    return false
                }

                // Check for carbon bonds
                const carbon_bonds = oxygen.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === "C"
                })
                return carbon_bonds.length > 0
            })
        },

        findNitrogenAttachedToCarbonIndexNoDoubleBonds: function() {
            return _.findIndex(container_molecule[0][1], (atom, index) => {
                if (atom[0] !== "N") {
                    return false
                }
                const n = CAtom(atom, index, container_molecule )

                if (n.indexedDoubleBonds("").length > 0) {
                    return false
                }

                // Check for carbon bonds
                const carbon_bonds = n.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === "C"
                })
                return carbon_bonds.length > 0
            })
        },

        "chains": function(previous_atom_index, root_atom_index, chains, chain_index, col, depth) {

            // console.log(("Start chains from this.chains() depth=" + depth + '  chain index=' + chain_index)
            // console.log((chains)
            if (depth > 20) {
                // console.log((chains)
                // console.log((depth)
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

                        // console.log(("Entering loop depth = " + depth + " chain index=" + chain_index + " index=" + index)

                        if (undefined === chains[chain_index]) {
                            // console.log(("Adding new branch col=" + col + ' loop index=' + index + ' depth= ' + depth)
                            //// console.log((chains)
                            // chains[chain_index] = chains[chain_index - 1].slice(0, col)
                            if (undefined === chains[chain_index - 1] ) {
                                // "C  O   C  (C) (C)   C   O")
                                //  3  4   5  (9) (13)  16  18
                                chain_index = chain_index - 1
                                //// console.log((chain_index)
                                //// console.log((chains)
                                //// console.log((bond.atom_index)
                            }
                            chains[chain_index] = _.cloneDeep(chains[chain_index - 1]).slice(0, depth)
                            //// console.log(("Added new branch col=" + col )
                            //// console.log((chains)
                        }




                        if (undefined === chains[chain_index]) {
                            // "C  O   C  (C) (C)   C   O")
                            //  3  4   5  (9) (13)  16  18
                            // [ [ 3, 4, 5, 9 ], [ 3, 4, 5, 13 ], [ 3, 4, 5, 16, 18 ] ]
                            // console.log((chain_index)
                            // console.log((chains)
                            // console.log((bond.atom_index)
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
            //// console.log((this.compressed())
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
            // console.log(("Returning chains from this.chains() depth=" + depth + '  chain index=' + chain_index)
            // console.log((chains)
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

        "findNitrogenWithHydrogenIndex": () => {
            return _.findIndex(container_molecule[0][1], (atom, index)=>{
                if (atom[0]!=="N") {
                    return false
                }
                const atom_object = CAtom(atom, index,container_molecule)
                return atom_object.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === "H"
                }).length === 1
            })
        },


        "findNucleophileIndex": function() {

            //// console.log((VMolecule(container_molecule).compressed())

            // Look for negatively charged atom
            const negative_atom_index = _.findIndex(container_molecule[0][1], (atom, index)=>{
                if (atom[4]==="-") {
                    return true
                }
                const atom_object = CAtom(atom, index,container_molecule)
                return atom_object.isNegativelyCharged()
            })

          // console.log(('negative atom index:'+negative_atom_index)

            if (negative_atom_index > -1) {
                return negative_atom_index
            }

            // Look for =N atom
            // @see https://www.name-reaction.com/ritter-reaction
            const nitrogen_on_double_bond_index = _.findIndex((container_molecule[0][1]), (atom, index)=>{
                if (atom[0] !=="N") {
                    return false
                }
                const a = CAtom(container_molecule[0][1][index], index, container_molecule)
                return a.doubleBondCount() === 1
            })

            if (nitrogen_on_double_bond_index > -1) {
                return nitrogen_on_double_bond_index
            }

            // Look for OH
            const hyroxyl_oxygen_index = this.findHydroxylOxygenIndex()
          // console.log(('hyroxyl_oxygen_index:'+hyroxyl_oxygen_index)
            if (hyroxyl_oxygen_index > -1) {
                return hyroxyl_oxygen_index
            }

            // Look for N atom
            // @see https://en.wikipedia.org/wiki/Leuckart_reaction (formamide, step 1)
            // @see https://en.wikipedia.org/wiki/Ritter_reaction
            const nitrogen_index = _.findIndex((container_molecule[0][1]), (atom, index)=>{
                return atom[0] === 'N'
            })
         //   // console.log(('nitrogen_index:'+nitrogen_index)
            if (nitrogen_index > -1) {
                return nitrogen_index
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
            const atoms_with_free_electrons = container_molecule[0][1].map(
                (atom, atom_index) => {
                    return CAtom(atom, atom_index, container_molecule)
                }
            ).filter(
                (atom_object, atom_index) => {
                    return atom_object.symbol !== "H" && atom_object.freeElectrons().length > 0
                }
            ).sort(
                (a,b) => {
                    return a.symbol === 'Hg' ? -1 : 0
                }
            )

            nucleophile_index = atoms_with_free_electrons.length === 0? -1: atoms_with_free_electrons[0].atomIndex

            /*
            nucleophile_index = _.findIndex(container_molecule[0][1], (atom, atom_index) => {
                return atom[0] !== "H" && CAtom(atom, atom_index, container_molecule).freeElectrons().length > 0
            })
            */

            nucleophile_index.should.be.an.Number()

            if (nucleophile_index === -1) {
                return -1
            }

            return nucleophile_index

        },

        "findOverloadedAtoms": () => {
            // Check for atom with too many bonds  and return one of the bonds
            return atoms_with_too_many_bonds = container_molecule[0][1].map((atom, atom_index)=> {
                const atom_object = CAtom(atom, atom_index, container_molecule)
                atom_object.max_number_of_bonds = atom[3]
                return atom_object
            }).filter((o, atom_index)=>{
                if (o.symbol==='H' || o.charge === "-") {
                    return false
                }
                return o.indexedBonds("").length > o.max_number_of_bonds
            })

        },



        "findMostSubstitutedOxygenIndex": () => {

            const oxygens = container_molecule[0][1].map((atom, index) => {
                return CAtom(atom, index, container_molecule)
            }).filter((atom_object)=>{
                return atom_object.symbol === "O"
            })

            // Check for oxygens with no hydrogens
            const oxygens_with_no_hydrogens = oxygens.filter((oxygen)=>{
                return oxygen.hydrogens().length === 0
            })

            if (oxygens_with_no_hydrogens.length > 0) {
                return oxygens_with_no_hydrogens[0].atomIndex
            }

            // Sort by most substituted
            const o_sorted = oxygens.sort((a_atom, b_atom) => {
                const a_hydrogens = a_atom.indexedBonds("").filter(
                    (bond) => {
                        return bond.atom[0] === "H"
                    }
                )

                const b_hydrogens = b_atom.indexedBonds("").filter(
                    (bond) => {
                        return bond.atom[0] === "H"
                    }
                )


                return a_hydrogens.length < b_hydrogens.length ? -1 : 0
            })

            return o_sorted[0].atomIndex
        },

        "findMostSubstitutedCarbon": (carbons) => {
            return __findMostSubstitutedCarbon(carbons)
        },

        "findLeastSubstitutedCarbonPiBondIndex": () => {

            const carbons = container_molecule[0][1].map((atom, index) => {
                return CAtom(atom, index, container_molecule)
            }).filter((atom_object)=>{
                return atom_object.symbol === 'C' && atom_object.indexedDoubleBonds("").filter((bond)=>{
                    return bond.atom[0] === "C"
                }).length > 0
            })

            return __findLeastSubstitutedCarbon(carbons).atomIndex
        },

        "findMostSubstitutedCarbonIndex": () => {



            const carbons = container_molecule[0][1].map((atom, index) => {
                return CAtom(atom, index, container_molecule)
            }).filter((atom_object)=>{
                return atom_object.symbol === 'C' && atom_object.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === "C"
                }).length > 0
            })

            return __findMostSubstitutedCarbon(carbons).atomIndex
        },

        "findOxygenElectrophileIndex": () => {

            return _.findIndex(container_molecule[0][1], (atom, index)=>{

                // Ignore non oxygens
                if (atom[0]!=="O") {
                    return false
                }

                const atom_object = CAtom(atom, index,container_molecule)

                if (atom_object.isPositivelyCharged() || atom[4] === "&+") {
                        return true
                }
                return false

            })


        },

        "findIndexOfAtomToDeprotonate": (filterBy, mustBe) => {

            let i = __findElectrophileIndex(filterBy, mustBe)


            // Check for nitrogen atom with H (@see Ritter reaction)
            if (i===-1){
                i = _.findIndex(_.cloneDeep(container_molecule[0][1]), (atom, index)=> {
                    if (atom[0] !== "N") {
                        return false
                    }
                    const nitrogen_atom_object = CAtom(atom, index, container_molecule)
                    const bonds = nitrogen_atom_object.indexedBonds("").filter((bond)=>{
                        return bond.atom[0] === "H"
                    })

                    if (bonds.length !== 1) {
                        return false
                    }

                    return true

                })
            }

            // Look for oxygen with proton
            if (i === -1) {

                i = _.findIndex(container_molecule[0][1], (atom, index)=> {

                    if (atom[0] !== 'O') {
                        return false
                    }

                    const atom_object = CAtom(atom, index,container_molecule)

                    if (atom_object.hydrogens().length === 0) {
                        return false
                    }

                    return true


                })

            }

            // Look for carbon with 1 hydrogen - see Leuckart reaction
            /*
            if (i === -1) {

                i = _.findIndex(container_molecule[0][1], (atom, index)=> {

                    if (atom[0] !== 'C') {
                        return false
                    }

                    const atom_object = CAtom(atom, index,container_molecule)

                    if (atom_object.hydrogens().length !== 1) {
                        return false
                    }

                    return true


                })

            }
            */

            return i

        },


        "findElectrophileIndex": (filterBy, mustBe) => {

            let i= __findElectrophileIndex(filterBy, mustBe)


            // electrophiles cannot have a positive charge
            if (i !== -1 && container_molecule[0][1][i][4]==="-") {
                i = -1
            }

            if (i === -1) {

                // check for carbon double bond and return most substituted carbon
                const carbons = container_molecule[0][1].map((atom, index) => {
                    return CAtom(atom, index, container_molecule)
                }).filter((atom_object, index) => {
                    return atom_object.symbol === "C" && atom_object.indexedDoubleBonds("").filter((bond)=>{
                        return bond.atom[0] === "C"
                    }).length > 0
                }).sort(
                    (a, b) => {
                        return a.hydrogens().length < b.hydrogens().length ? -1 : 0
                    }
                )

              // console.log(('2MoleculeAI.js electrophile index: ' + i)
              // console.log((carbons.length)
               // process.exit()

                if (carbons.length > 0 && container_molecule[0][1][carbons[0].atomIndex][4] !=="-") {
                    return carbons[0].atomIndex
                }


                // Check if we have a metal
                i = _.findIndex(_.cloneDeep(container_molecule[0][1]), (atom, index)=> {
                    return atom[0] === "Hg" // @todo add isMetal() method to CAtom
                })

            }





            if (i===-1) {

                // Check for epoxide ring and return index of least substituted carbon
                i = _.findIndex(_.cloneDeep(container_molecule[0][1]), (atom, index)=> {

                    if (atom[0] !== 'O') {
                        return false
                    }

                    const oxygen_atom_object = CAtom(atom, index, container_molecule)
                    const bonds = oxygen_atom_object.indexedBonds("")


                    if (bonds.length !== 2) {
                        return false
                    }

                    // Carbon bonds
                    if (bonds.filter((bond)=>{
                        return bond.atom[0] === "C"
                    }).length !==2) {
                        return false
                    }



                    // Check carbon atoms are bonded together
                    const c1 = bonds[0].atom
                    const c2 = bonds[1].atom

                    if (Set().intersection(c1.slice(5), c2.slice(5)).length === 0) {
                        return false
                    }

                    return true


                })


                if (i !== -1) {
                    // i is the index of the oxygen atom on the epoxide ring
                    // we need to find index of the least substituted carbon attached to the oxygen atom
                    const oxygen_atom_object = CAtom(container_molecule[0][1][i], i, container_molecule)
                    const bonds = oxygen_atom_object.indexedBonds("")
                    // Have oxygen atom bonded to two carbons where the two carbons are bonded together
                    // Find least substituted carbon
                    const c1_atom_object = CAtom(bonds[0].atom, bonds[0].atom_index, container_molecule)
                    const c2_atom_object = CAtom(bonds[1].atom, bonds[1].atom_index, container_molecule)
                    i = c1_atom_object.hydrogens().length > c2_atom_object.hydrogens().length ? bonds[0].atom_index: bonds[1].atom_index

                    if (container_molecule[0][1][i][4]==="-") {
                        return -1
                    }
                }
            }


            return i

        },

        "findProtonIndexOnAtom": (atom) => {
            const protons =  atom.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "H"
            })

            return protons.length > 0 ? protons.pop().atom_index: -1
        },

        findIndexOfCarbonAtomAttachedToHydroxylGroup: () => {
            const electrophile_index = __findHydroxylOxygenIndex()
            const electrophile_atom_object = CAtom(container_molecule[0][1][electrophile_index], electrophile_index, container_molecule)
            const nucleophile_index = electrophile_atom_object.indexedBonds("").filter((bond)=>{
                if (bond.atom[0] === 'H') {
                    return false
                }
                return true
            }).pop().atom_index
            return nucleophile_index
        },

        "findProtonIndex": () => {

            let electrophile_index = __findElectrophileIndex()
            let proton_index = null
            if (electrophile_index === -1) {
                // look for OH
                electrophile_index = _.findIndex(container_molecule[0][1], (atom, index)=>{
                    if (atom[0] !== "O") {
                        return false
                    }
                    const oxygen_atom_object = CAtom(container_molecule[0][1][index], index, container_molecule)
                    if (oxygen_atom_object.indexedBonds("").filter((bond)=> {
                        return bond.atom[0] === 'H'
                    }).length === 0) {
                        return false
                    }
                    return true
                })
            }

            if (electrophile_index !== -1) {
                const oxygen_atom_object = CAtom(container_molecule[0][1][electrophile_index], electrophile_index, container_molecule)
                proton_bonds = oxygen_atom_object.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === 'H'
                })
                if (proton_bonds.length > 0) {
                    proton_index = proton_bonds[0].atom_index
                }
            } else {
                // look for C
                electrophile_index = _.findIndex(container_molecule[0][1], (atom, index)=>{
                    if (atom[0] !== "C") {
                        return false
                    }
                    const carbon_atom_object = CAtom(container_molecule[0][1][index], index, container_molecule)
                    if (carbon_atom_object.indexedBonds("").filter((bond)=> {
                        return bond.atom[0] === 'H'
                    }).length === 1) {
                        return true
                    }
                    return false
                })
            }

            if (electrophile_index !== -1) {
                const carbon_atom_object = CAtom(container_molecule[0][1][electrophile_index], electrophile_index, container_molecule)
                proton_bonds = carbon_atom_object.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === 'H'
                })
                if (proton_bonds.length > 0) {
                    proton_index = proton_bonds[0].atom_index
                }
            }

            if (proton_index !== null) {
                return proton_index
            }

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

            return __findHydroxylOxygenIndex()

        },

        "findWaterOxygenIndex": function() {

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

        "findOxygenOnDoubleBondIndex":() => {
            return _.findIndex(container_molecule[0][1], (oxygen_atom, oxygen_atom_index)=>{

                // Not an oxygen atom
                if (oxygen_atom[0] !== "O") {
                    return false
                }

                const oxygen_atom_object = CAtom(oxygen_atom, oxygen_atom_index, container_molecule)
                if(oxygen_atom_object.doubleBondCount() === 0) {
                    return false
                }
                return true
            })
        },

        "findNitrogenOnTripleBondIndex":() => {
            return _.findIndex(container_molecule[0][1], (nitrogen_atom, nitrogen_atom_index)=>{

                // Not a nitrogen atom
                if (nitrogen_atom[0] !== "N") {
                    return false
                }

                const nitrogen_atom_object = CAtom(nitrogen_atom, nitrogen_atom_index, container_molecule)
                if(nitrogen_atom_object.tripleBondCount() === 0) {
                    return false
                }
                return true
            })
        },

        "findNitrogenOnDoubleBondIndex":() => {
            return _.findIndex(container_molecule[0][1], (nitrogen_atom, nitrogen_atom_index)=>{

                // Not a nitrogen atom
                if (nitrogen_atom[0] !== "N") {
                    return false
                }

                const nitrogen_atom_object = CAtom(nitrogen_atom, nitrogen_atom_index, container_molecule)
                if(nitrogen_atom_object.doubleBondCount() === 0) {
                    return false
                }
                return true
            })
        },

        "findNonWaterOxygenIndex":(override_charge) => {

            return _.findIndex(container_molecule[0][1], (oxygen_atom, oxygen_atom_index)=>{

                // Not an oxygen atom
                if (oxygen_atom[0] !== "O" || oxygen_atom[4] === "-") {
                    return false
                }

                const oxygen_atom_object = CAtom(oxygen_atom, oxygen_atom_index, container_molecule)

                if (override_charge) {
                    // do nothing
                } else if(oxygen_atom_object.bondCount() < 3) {
                    return false
                }

                return true
            })



        },

        "findMetalAtomIndex":() => {

            return _.findIndex(container_molecule[0][1], (metal_atom, metal_atom_index)=>{

                // Not metal atom
                if (metal_atom[0] !== "Hg") {
                    return false
                }

                return true
            })



        }





    }
}

module.exports = MoleculeAI

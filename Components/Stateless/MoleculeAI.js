const CAtom = require('../../Controllers/Atom')
const _ = require('lodash');
const VMolecule = require('../../Components/Stateless/Views/Molecule')
const Set = require('../../Models/Set')
const ChargesAI = require('../../Components/State/ChargesAI')
const ProtonationAI = require('../../Components/State/ProtonationAI')
/*
   findCarbonylCarbonIndexOnDoubleBond()
   isStrongAcid()
   findCarbocationIndex()
   findCarbocationIndexReverse()
   findImineCarbonIndex()
   validateMolecule(trace, trace_id)
   findIndexOfCarbocationAttachedtoCarbon()
   findIndexOfCarbonAtomBondedToNonCarbonBySymbol(symbol)
   findNitrogenAttachedToCarbonAttachedToOxygenDoubleBondIndex()

   findIndexOfCarbonAtomDoubledBondedToNonCarbonBySymbol(symbol) - find index of carbon atom with double bond to non carbon atom. "symbol" is the
   atomic symbol of the non carbon atom. eg if we have CC=O then this method will return the index of second carbon.

   findIndexOfOxygenAtomDoubleBondedToCarbonByCarbonIndex(carbon_index) - find index of oxygen double bonded to a specific carbon atom. "carbon_index"
   is the index of the specific carbon.

   findIndexOfCarbonAtomBondedToCarbonByCarbonIndex(carbon_index) - find index of carbon atom bonded to a specific carbon atom. "carbon_index"
   is the index of the specific carbon.

   findAtomWithFreeElectronsIndexBySymbol(symbol)
   checkForBondedAtomsRecursive(groups, group_index, current_atom_index, atom_object, atoms, atom_indexes_added)
   checkForBondedAtomsRecursiveReverse(groups, group_index, current_atom_index, atom_object, atoms, atom_indexes_added)
   extractGroupsRecursive(groups, group_index, atoms, atom_indexes_added, current_atom_index)
   extractGroupsRecursiveReverse(groups, group_index, atoms, atom_indexes_added, current_atom_index)
   extractGroups()
   extractGroupsReverse()
   findOxygenAttachedToCarbonIndex()
   findOxygenAttachedToCarbonIndexNoDoubleBonds()
   findNitrogenAttachedToCarbonIndexNoDoubleBonds()
   findNitrogenAttachedToCarbonIndexDoubleBonds()
   chains(previous_atom_index, root_atom_index, chains, chain_index, col, depth)
   chains2(previous_atom_index, root_atom_index, chains, chain_index, col, depth)
   isWater()
   findNitrogenWithHydrogenIndex()
   findNucleophileIndex()
   findOverloadedAtoms()
   findMostSubstitutedOxygenIndex()
   findMostSubstitutedCarbon(carbons)
   findMostSubstitutedCarbonIndex()
   findOxygenElectrophileIndex()
   findIndexOfAtomToDeprotonate(filterBy, mustBe)
   findElectrophileIndex(filterBy, mustBe)

   findProtonIndexOnAtom() - find the index of a proton on specific atom.


   findIndexOfCarbonAtomAttachedToHydroxylGroup()
   findProtonIndex()
   findNonHydroxylOxygenIndex()
   findWaterOxygenIndex()
   findOxygenOnDoubleBondIndex()
   findNitrogenOnTripleBondIndex()
   findNitrogenOnDoubleBondIndex()
   findNonWaterOxygenIndex()
   findMetalAtomIndex()
   findCarbonylOxygenIndex
   findCarbonAttachedToNitrogenIndex(nitrogen_index)
   findAllCarbonIndexesAttachedToNitrogen(nitrogen_index) // single bonds
   __getCarbonBondsAttachedToNitrogen

   findKetoneCarbonIndex(DEBUG)
   */


const MoleculeAI = (container_molecule) => {

    container_molecule.length.should.be.equal(2) // molecule, units
    if (container_molecule[0] !== "B") {
        container_molecule[0].length.should.be.equal(2) // pKa, atoms
        container_molecule[0][0].should.be.an.Number() // pka
        container_molecule[0][1].should.be.an.Array()
        if (undefined !== container_molecule[0][1][0]) {
            container_molecule[0][1][0].should.be.an.Array()
            container_molecule[0][1][0][0].should.be.an.String()
        }
    }

    const __findKetoneCarbonIndex = function(DEBUG) {
        return _.findIndex(container_molecule[0][1], (atom, index)=>{
            if (DEBUG) {
                console.log("__findKetoneCarbonIndex substrate:")
                console.log(VMolecule(container_molecule).compressed())
            }
            const atom_object = CAtom(atom, index, container_molecule)
            if (atom_object.symbol !== "C") {
                return false
            }
            const single_bonds = atom_object.indexedBonds("").filter((b)=>{
                return b.atom[0] !=="H"
            })
            const double_bonds = atom_object.indexedDoubleBonds("").filter((b)=>{
                return b.atom[0] !=="H"
            })
            if (DEBUG) {
                console.log("__findKetoneCarbonIndex number of single bonds: " + single_bonds.length)
            }
            if (DEBUG) {
                console.log("__findKetoneCarbonIndex number of double bonds: " + double_bonds.length)
            }
            if (single_bonds.length > 0) {
                return false
            }
            if (double_bonds.length !==1) {
                return false
            }
            return double_bonds[0].atom[0] === "O"
        })
    }

    const __getCarbonBondsAttachedToNitrogen = function(nitrogen_index) {
        const nitrogen_atom = CAtom(container_molecule[0][1][nitrogen_index], nitrogen_index, container_molecule)
        const carbon_bonds = nitrogen_atom.indexedBonds("").filter((bond) => {
            return bond.atom[0] === "C"
        })
        return carbon_bonds
    }

    const __findAllCarbonIndexesAttachedToNitrogen = function(nitrogen_index) {
        const carbon_bonds = __getCarbonBondsAttachedToNitrogen(nitrogen_index)
        return carbon_bonds.map((bond)=>{
            return bond.atom_index
        })
    }

    const __findCarbonAttachedToNitrogenIndex = function(nitrogen_index) {
        const carbon_bonds = this.__getCarbonBondsAttachedToNitrogen(nitrogen_index)
        return carbon_bonds[0].atom_index
    }

    const __findCarbonylOxygenIndex = (DEBUG) => {
       return _.findIndex(container_molecule[0][1], (atom, index)=>{
           const atom_object = CAtom(atom, index, container_molecule)
           if (atom_object.symbol !== "O") {
               return false
           }
           if (atom_object.isPositivelyCharged() || atom_object.isNegativelyCharged() ){
               return false
           }
           const double_bonds = atom_object.indexedDoubleBonds("").filter((bond)=>{
               return bond.atom[0] === "C"
           })
           return double_bonds.length ===1
        })
    }

    const __findIndexOfCarbonWithNegativeCharge = (DEBUG) => {

        const carbon_index = _.findIndex(container_molecule[0][1], (atom, index)=>{
            const atom_object = CAtom(atom, index, container_molecule)
            if (atom_object.symbol !== "C") {
                return false
            }

            const single_bonds = atom_object.indexedBonds("").filter((bond)=>{
                return bond.atom[0] !== "H"
            })

            const double_bonds = atom_object.indexedDoubleBonds("").filter((bond)=>{
                return bond.atom[0] !== "H"
            })

            const triple_bonds = atom_object.indexedTripleBonds("").filter((bond)=>{
                return bond.atom[0] !== "H"
            })

            const bonds_count = atom_object.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3

            return bonds_count < 4
        })
        return carbon_index
    }

    const __findIndexOfOxygenAtomDoubleBondedToCarbonByCarbonIndex = (carbon_index) => {
        const carbon_atom_object = CAtom(container_molecule[0][1][carbon_index], carbon_index, container_molecule)
        const oxygen_carbon_double_bonds = carbon_atom_object.indexedDoubleBonds("").filter((bond)=>{
            return bond.atom[0] === "O"
        })
        return oxygen_carbon_double_bonds.length === 0?-1:oxygen_carbon_double_bonds[0].atom_index
    }

    const __findIndexOfCarbonAtomBondedToCarbonByCarbonIndex = (carbon_index, DEBUG) => {
        if (DEBUG) {
            console.log(VMolecule([container_molecule[0],1]).compressed())
            console.log("Carbon index:" + carbon_index)
        }

        const carbon_atom_object = CAtom(container_molecule[0][1][carbon_index], carbon_index, container_molecule)
        const carbon_bonds = carbon_atom_object.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        })
        return carbon_bonds.length === 0?-1:carbon_bonds[0].atom_index
    }

    const __findCarbonylCarbonIndexOnDoubleBond = (carbonyl_oxygen_index) => {

        let carbonyl_carbon_index = -1
        if (undefined !== carbonyl_oxygen_index) {
            const carbonyl_oxygen_object = CAtom(container_molecule[0][1][carbonyl_oxygen_index], carbonyl_oxygen_index, container_molecule)
            const double_bonds = carbonyl_oxygen_object.indexedDoubleBonds("").filter((bond) => {
                if (bond.atom[0] !== "C") {
                    return false
                }
                return true
            })
            carbonyl_carbon_index = double_bonds.length === 0?  -1: double_bonds[0].atom_index
        } else {
            carbonyl_carbon_index = _.findIndex(container_molecule[0][1], (atom, index) => {
                const atom_object = CAtom(atom, index, container_molecule)
                if (atom_object.symbol !== "C") {
                    return false
                }
                const double_bonds = atom_object.indexedDoubleBonds("").filter((bond) => {
                    if (bond.atom[0] !== "C") {
                        return false
                    }
                    return true
                })
                return double_bonds.length > 0
            })
        }
        return carbonyl_carbon_index
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

        "findCarbonylCarbonIndexOnDoubleBond":(carbonyl_oxygen_index) => {
            return __findCarbonylCarbonIndexOnDoubleBond(carbonyl_oxygen_index)
        },


        isStrongAcid: () => {
            const map = ["Cl", "OS(=O)(=O)O"] // hydrochloric acid, sulphuric acid
            //return map.indexOf(VMolecule(container_molecule).canonicalSMILES()) !== -1
            return false
        },


        findCarbocationIndex: () => {
            // Explanation: A carbocation is an organic molecule, an intermediate, that forms as a result of the loss of two valence electrons, normally shared electrons, from a carbon atom
            // that already has four bonds. This leads to the formation of a carbon atom bearing a positive charge and three bonds instead of four.
            // https://socratic.org/questions/how-is-carbocation-formed
            // Look for carbon with 4 bonds and at least 1 hydrogen
            return _.findIndex(container_molecule[0][1], (atom, index) => {
                return atom[0] === "C" && atom[4] === "+" && atom.slice(5).length === 6
            })
        },

        findCarbocationIndexReverse: () => {
            //Explanation: A carbocation is an organic molecule, an intermediate, that forms as a result of the loss of two valence electrons, normally shared electrons, from a carbon atom that already has four bonds. This leads to the formation of a carbon atom bearing a positive charge and three bonds instead of four.
            // https://socratic.org/questions/how-is-carbocation-formed
            // Look for carbon with 4 bonds and at least 1 hydrogen
            return _.findIndex(container_molecule[0][1], (atom, index) => {
                if (atom[0]!=="C") {
                    return false
                }
                carbon = CAtom(container_molecule[0][1][index], index, container_molecule)
                if (carbon.indexedBonds("").length + carbon.indexedDoubleBonds("").length + carbon.indexedTripleBonds("").length !==4) {
                    return false
                }
                c_h_bonds = carbon.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === "H"
                })
                return c_h_bonds.length === 1
            })
        },


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

        validateMolecule: (trace, trace_id) => {

            // Check atoms do not have more than 8 electrons and 2 electrons if H
            container_molecule[0][1].map((atom, index)=>{
                //const atom_object = CAtom(container_molecule[0][1][index], index, container_molecule)
                const electrons = atom.slice(5)
                switch(atom[0]) {
                    case "H":
                        if (electrons.length > 2) {
                           console.log("DEBUG: Atom has more than allowed number of electrons")
                           console.log("DEBUG: Atom " + atom[0])
                           console.log("DEBUG: Index " + index)
                           console.log(container_molecule[0][1][index])
                            throw new Error("Max number of electrons exceeded")
                        }
                        break;
                    case "O":
                        if (electrons.length > 8) {
                           console.log("DEBUG: Atom has more than allowed number of electrons")
                            console.log("DEBUG: Atom " + atom[0])
                            console.log("DEBUG: Index " + index)
                           console.log(VMolecule(container_molecule).compressed())
                            throw new Error("Max number of electrons exceeded")
                        }
                        break;
                    case "N":
                        if (electrons.length > 8) {
                           console.log("DEBUG: Atom has more than allowed number of electrons")
                            console.log("DEBUG: Atom " + atom[0])
                           console.log("DEBUG: Index " + index)
                            console.log(VMolecule(container_molecule).compressed())
                            throw new Error("Max number of electrons exceeded")
                        }
                        break;
                    case "C":
                        if (electrons.length > 10) { // if we are doing a reversal
                           console.log("DEBUG: Atom has more than allowed number of electrons")
                           console.log("DEBUG: Atom " + atom[0])
                            console.log("DEBUG: Index " + index)
                            console.log(VMolecule(container_molecule).compressed())
                            throw new Error("Max number of electrons exceeded")
                        }
                        break;
                    case "Br":
                        if (electrons.length > 8) {
                           // console.log("DEBUG: Atom has more than allowed number of electrons")
                           // console.log("DEBUG: Atom " + atom[0])
                           // console.log("DEBUG: Index " + index)
                            throw new Error("Max number of electrons exceeded")
                        }
                        break;
                }
            })

            return _.findIndex(container_molecule[0][1], (atom, index)=> {
                const chargesAI = new ChargesAI(null)
                return chargesAI.checkCharge(container_molecule, atom, index, trace, trace_id)
            }) === -1
        },


        findIndexOfCarbocationAttachedtoCarbon: ()=>{
         // console.log("MoleculeAI findIndexOfCarbocationAttachedtoCarbon()")
         // console.log(VMolecule(container_molecule).compressed())
            return _.findIndex(container_molecule[0][1], (atom, index)=>{
                if (atom[0] !== "C" || atom[4] !== "+") {
                    return false
                }
                const carbocation = CAtom(container_molecule[0][1][index], index, container_molecule)
                if (carbocation.doubleBondCount() > 0) {
                    return false
                }
                if (carbocation.bondCount()  > 4) {
                    return false
                }
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

        checkForBondedAtomsRecursiveReverse: function(groups, group_index, current_atom_index, atom_object, atoms, atom_indexes_added) {

            _.cloneDeep(atoms).map((a, i)=>{
                if (i !== current_atom_index && _.indexOf(atom_indexes_added, i) ===-1 && atom_object.isBondedTo(a)) {
                  // console.log(('Added atom')
                    groups[group_index].push(a)
                    atom_indexes_added.push(i)
                    bonded_atom_object = CAtom(a, i, container_molecule)
                    this.checkForBondedAtomsRecursiveReverse(groups, group_index, i, bonded_atom_object, _.cloneDeep(atoms), atom_indexes_added)
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
                ////// console.log((groups[group_index])

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

        extractGroupsRecursiveReverse: function(groups, group_index, atoms, atom_indexes_added, current_atom_index) {

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
                    groups[group_index].push(atom)
                } else {
                    this.checkForBondedAtomsRecursiveReverse(groups, group_index, current_atom_index, atom_object, _.cloneDeep(atoms), atom_indexes_added)
                }
                return this.extractGroupsRecursiveReverse(groups, group_index +1, _.cloneDeep(atoms), atom_indexes_added, current_atom_index +1)

            } else {
                return this.extractGroupsRecursiveReverse(groups, group_index, _.cloneDeep(atoms), atom_indexes_added, current_atom_index +1)
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
//          // console.log((atoms.length)
  //          process.exit()
            const groups = this.extractGroupsRecursive([], 0, _.cloneDeep(atoms), atom_indexes_added, 0)

            const groups_filtered = groups.filter((group)=>{
                return group.length === 1 && group[0][0] === "H" ? false: true
            })

            return groups_filtered
        },

        extractGroupsReverse: function() {

          // console.log((VMolecule(container_molecule).compressed())

            const atom_indexes_added = []
            let atoms = _.cloneDeep(container_molecule[0][1])
            const groups = this.extractGroupsRecursiveReverse([], 0, _.cloneDeep(atoms), atom_indexes_added, 0)


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

        findNitrogenAttachedToCarbonIndexDoubleBonds: function() {
            return _.findIndex(container_molecule[0][1], (atom, index) => {
                if (atom[0] !== "N") {
                    return false
                }
                const n = CAtom(atom, index, container_molecule )

                if (n.indexedDoubleBonds("").length === 0) {
                    return false
                }

                // Check for carbon bonds
                const carbon_bonds = n.indexedDoubleBonds("").filter((bond)=>{
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
                            ////// console.log((chains)
                            // chains[chain_index] = chains[chain_index - 1].slice(0, col)
                            if (undefined === chains[chain_index - 1] ) {
                                // "C  O   C  (C) (C)   C   O")
                                //  3  4   5  (9) (13)  16  18
                                chain_index = chain_index - 1
                                ////// console.log((chain_index)
                                ////// console.log((chains)
                                ////// console.log((bond.atom_index)
                            }

                            chains[chain_index] = _.cloneDeep(chains[chain_index - 1]).slice(0, depth)
                            ////// console.log(("Added new branch col=" + col )
                            ////// console.log((chains)
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
            ////// console.log((this.compressed())
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

        "__addChainRecursively": function(bonds, chains, chain_index, depth) {

            console.log('Depth:'+depth)
            console.log('Bonds:')
            console.log(bonds.map((b)=>{
                return b.atom_index
            }))
            console.log('Chains:')
            console.log(chains)

            if (bonds.length === 0) {
                console.log()
            }

            if (depth === 9) {
                console.log(addddd)
            }
            bonds.map((bond, i)=>{
                if (undefined === chains[chain_index+i] ) {
                    chains[chain_index+i] = chains[chain_index +i-1].slice(0,chains[chain_index +i-1].length-1)
                }
                chains[chain_index+i].push(bond.atom_index)
                const atom_object = CAtom(container_molecule[0][1][bond.atom_index], bond.atom_index, container_molecule)
                const child_bonds = atom_object.indexedBonds("").filter(
                    (child_bond) => {
                        return child_bond.atom_index > bond.atom_index && child_bond.atom_index !== bond.atom_index && child_bond.atom[0] !== "H"
                    }
                )
                console.log('child bonds for atom:' + bond.atom_index)
                console.log(child_bonds.map((cb)=>{
                    return cb.atom_index
                }))
                if (child_bonds.length === 0) {
                    chains[chain_index+i].push["|"]
                    console.log(chains)
                    console.log('end of chain (depth=' + depth + ")")
                } else {
                    this.__addChainRecursively(child_bonds, _.cloneDeep(chains), chain_index + i, depth + 1)
                }

            })

            return chains
        },


        "chains2": function(previous_atom_index, root_atom_index, chains, chain_index, col, depth) {
            if (undefined === chains[chain_index]) {
                chains[chain_index] = []
            }
            const root_atom_object = CAtom(container_molecule[0][1][root_atom_index], root_atom_index, container_molecule)
            chains[chain_index].push(root_atom_index)
            const bonds = _.cloneDeep(root_atom_object).indexedBonds("").filter(
                (bond) => {
                    return bond.atom_index !== previous_atom_index && bond.atom[0] !== "H" &&  bond.atom_index > root_atom_index
                }
            )
            console.log('Bonds:')
            console.log(bonds.map((bond)=>{
                return bond.atom_index
            }))
            chains = this.__addChainRecursively(bonds, _.cloneDeep(chains), chain_index, 0)
            console.log("Final chains:")
            console.log(chains)
            console.log(addchainrec)

            console.log('Chains:')
            console.log(chains)
            console.log(backup)
        },

        "chains2old": function(previous_atom_index, root_atom_index, chains, chain_index, col, depth) {

            if (depth > 200) {
                process.exit()
            }

            if (chains[chain_index][chains[chain_index].length-1]==="|") {
                console.log(bbbbb)
                chain_index = chain_index + 1
            }

            const root_atom_object = CAtom(container_molecule[0][1][root_atom_index], root_atom_index, container_molecule) //3,5, 24, 28
            const bonds = _.cloneDeep(root_atom_object).indexedBonds("").filter(
                (bond) => {
                    return bond.atom_index !== previous_atom_index && bond.atom[0] !== "H" &&  bond.atom_index > root_atom_index
                }
            )

            if (undefined=== chains[chain_index]) {
                chains[chain_index] = []
            }

            // chains[chain_index].push(root_atom_index)  // chains: [[3]] | [[3,5]] | [[3,5,24]] | [[3,5,24, 28]]


            // chain_index starts at 0
            // 3:[5], 5:[24,8], 24: [28], 28: []

            if (bonds.length === 0) {
                // Check if ring bond
                const b = _.cloneDeep(root_atom_object).indexedBonds("").filter(
                    (bond) => {
                        return bond.atom[0] !== "H" &&  bond.atom_index < root_atom_index && bond.atom_index !== previous_atom_index
                    }
                ).map((bond)=>{
                    return bond.atom_index
                }).pop()
                if (chains[chain_index].indexOf(b) !== -1) {
                    chains[chain_index].push(b)
                    chains[chain_index].push('R')
                } else {
                    // Flag end of branch
                    // depth 9
                    //console.log(bvvv)
                    chains[chain_index].push("|")
                }
            }

            console.log("---------------------------------------------")
            console.log('Depth:'+depth)
            console.log("Previous atom index:" + previous_atom_index)
            console.log("Root atom index:" + root_atom_index)
            console.log("Chain index:" + chain_index)
            console.log('chains:')
            console.log(chains)
            console.log('bonds:')
            console.log(bonds.map((b)=>{
                return b.atom_index
            }))
            console.log(chains[chain_index][chains[chain_index].length-1])
            console.log("---------------------------------------------")

            if (chains[chain_index][chains[chain_index].length-1] === "|") {
                chain_index = chain_index + 1
            }


            // previous_atom_index: null | null | null | null | null | null | null | 15 |
            // root_atom_index: 3 | 5 | 8 | 9 | 11 | 12 | 13 | 15 | 17
            // chain_index: 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0
            // chains: [[3]] | [[3, 5]] | [[3,5,8]] | [[3,5,8,9]] | [[3,5,8,9,11]] | [[3,5,8,9,11,12]] | [[3,5,8,9,11,12,13]] | [[3,5,8,9,11,12,13,15]] | [[3,5,8,9,11,12,13,15, 17]]
            // bonds: [5] | [8,24] | [9] | [11,17] | [12] | [13,22] | [15,18] | [17] | []

            if (bonds.length> 0) {

                _.cloneDeep(bonds).map(
                    (bond, index) => {
                        if (undefined ===  chains[chain_index+index]) {
                            chains[chain_index+index] = []
                        }
                        chains[chain_index+index].push(bonds[0].atom_index)
                        chains = this.chains2( root_atom_index, bonds[0].atom_index, chains, chain_index+index, col, depth + 1)
                    }
                )

                if (bonds.length === 10000) {
                    chains[chain_index].push(bonds[0].atom_index)
                    //                                             5,                   [[3]],  0
                    //                                             24,                  [[3,5]],  0
                    //                                             28,                  [[3,5,24]],  0
                    chains = this.chains2( root_atom_index, bonds[0].atom_index, chains, chain_index, col, depth + 1)
                } else {

                    //console.log(chains)
                    //console.log(bbbbb)
                    if (chain_index === 9999) {
                        _.cloneDeep(bonds).map(
                            (bond, index) => {
                                // depth 2 bonds [8,24] chains [3,5]
                                // index 0: chains ->  chains[[3,5]] atom index 8
                                // index 1: chains ->  chains[[3,5]] atom index 24
                                //console.log(bond.atom_index)
                                //console.log(abc)
                                if (index > 0) {
                                    if (depth === 222222) {
                                        console.log('D2 chains:')
                                        console.log(chains)
                                        console.log(chain_index)
                                        console.log(chains[chain_index])
                                        console.log('Previous atom index:' + previous_atom_index)
                                        console.log(bonds.map((bond) => {
                                            return bond.atom_index
                                        }))
                                        //const chain2 = chains[chain_index+ index - 1].slice(0,chains[chain_index+ index - 1].indexOf(previous_atom_index))
                                        const chain2 = chains[chain_index + index - 1].slice(0, previous_atom_index - 1)
                                        console.log(chain2)
                                        console.log(aaaa)
                                    }
                                    // const chain = chains[chain_index+ index - 1].slice(0,chains[chain_index+ index - 1].indexOf(previous_atom_index)+1)
                                    const chain = chains[chain_index + index - 1].slice(0, previous_atom_index - 1)
                                    // index 1
                                    // chain index 0
                                    // depth 7
                                    //console.log("Bond index:" + index) 1
                                    //console.log(chain_index) 0
                                    //console.log('root atom:' + root_atom_index) 13
                                    //console.log('atom:' + bond.atom_index) 18
                                    //console.log('Depth:' + depth) 7
                                    chains.push(chain)
                                    //console.log(chains)
                                    //console.log(aabbb)
                                    // index 1: chains -> [ chains[[3,5,8,9,11,12,13,15,17,9,|], [3,5,8,9,11,12,13]
                                } else {
                                    // index 1: chains -> [ chains[[3,5,8,9,11,12,13,15,17,9,|], [3,5,8,9,11,12,13]
                                    chains[chain_index + index].push(bond.atom_index)
                                }
                                // index 0: [[3,5,8]
                                chains = this.chains2(null, bond.atom_index, chains, chain_index + index, index, depth + 1)

                            }
                        )
                    }
                }
            }

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

            ////// console.log((VMolecule(container_molecule).compressed())

            // Look for negatively charged atom
            const negative_atom_index = _.findIndex(container_molecule[0][1], (atom, index)=>{
                if (atom[4]==="-") {
                    return true
                }
                const atom_object = CAtom(atom, index,container_molecule)
                return atom_object.isNegativelyCharged()
            })


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

            if (hyroxyl_oxygen_index > -1) {
                return hyroxyl_oxygen_index
            }

            // Look for N atom
            // @see https://en.wikipedia.org/wiki/Leuckart_reaction (formamide, step 1)
            // @see https://en.wikipedia.org/wiki/Ritter_reaction
            const nitrogen_index = _.findIndex((container_molecule[0][1]), (atom, index)=>{
                return atom[0] === 'N' && atom[4] !== "+"
            })
         // // console.log(('nitrogen_index:'+nitrogen_index)
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

            /*
            if (nucleophile_index === 15) {
               // console.log('nucleophile_index:'+nucleophile_index)
               // console.log(nnnnniiioooppp)

            }
            */


            // Verifications checks
            if (undefined === container_molecule[0][1][nucleophile_index]) {
                nucleophile_index = -1
            }

            if (nucleophile_index > -1) {
                return nucleophile_index
            }

         // console.log('MoleculeAI nuuu:'+nucleophile_index)

            // Check for atom with free electrons
            const atoms_with_free_electrons = container_molecule[0][1].map(
                (atom, atom_index) => {
                    return CAtom(atom, atom_index, container_molecule)
                }
            ).filter(
                (atom_object, atom_index) => {
                    if (atom_object.symbol === "O" && (atom_object.bondCount() + atom_object.doubleBondCount() > 2)) {
                        return false
                    }
                    return atom_object.symbol !== "H" && atom_object.freeElectrons().length > 0
                }
            ).sort(
                (a,b) => {
                    return a.symbol === 'Hg' ? -1 : 0
                }
            )

            nucleophile_index = atoms_with_free_electrons.length === 0? -1: atoms_with_free_electrons[0].atomIndex

         // console.log('MoleculeAI nuuu:'+nucleophile_index)

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
            const protonationAI = new ProtonationAI(this.reaction)
            return protonationAI.findProtonIndexOnAtom(atom)
        },

        "findCarbonAttachedToNitrogenIndex": (nitrogen_index) =>{
            return __findCarbonAttachedToNitrogenIndex(nitrogen_index)
        },

        "findCarbonylOxygenIndex": (DEBUG) => {
            return __findCarbonylOxygenIndex(DEBUG)
        },

        "findAllCarbonIndexesAttachedToNitrogen": function(nitrogen_index) {
            return __findAllCarbonIndexesAttachedToNitrogen(nitrogen_index)
        },

        "findIndexOfCarbonWithNegativeCharge": (DEBUG) => {
            return __findIndexOfCarbonWithNegativeCharge(DEBUG)
        },

        "findIndexOfOxygenAtomDoubleBondedToCarbonByCarbonIndex": (carbon_index) => {
            return __findIndexOfOxygenAtomDoubleBondedToCarbonByCarbonIndex(carbon_index)
        },

        "findIndexOfCarbonAtomBondedToCarbonByCarbonIndex": (carbon_index, DEBUG) =>{
            return __findIndexOfCarbonAtomBondedToCarbonByCarbonIndex(carbon_index, DEBUG)
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

        "findKetoneCarbonIndex": (DEBUG) => {
            return __findKetoneCarbonIndex(DEBUG)
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

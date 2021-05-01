//
const AtomFactory = require('../Models/AtomFactory')
const CAtom = require('./Atom')
const pKa = require('../Models/pKa')
const should = require('should')
const Set = require('../Models/Set')
const Families = require('../Models/Families')
const _ = require('lodash');
const VMolecule = require('../Components/Stateless/Views/Molecule')

const CMolecule = (mmolecule, verbose) => {

    const verifyMolecule = () => {
        const molecule_compressed = VMolecule([mmolecule, 1]).compressed()
        // "Atomic symbol / Hydrogens / Charge / Single bonds / Double bonds / Triple bonds/ # of electrons / # of free electrons"
        molecule_compressed.map((atom)=>{
            const atomic_symbol = atom[0]
            const number_of_hydrogens = atom[2].replace('H ', "") * 1
            const charge = atom[3].replace('Charge: ', "") * 1
            const number_of_single_bonds = atom[4].length
            const number_of_double_bonds = atom[5].length
            const number_of_triple_bonds = atom[6].length
            const number_of_electrons = atom[7]
            const number_of_free_electrons = atom[8]
            switch(atomic_symbol) {
                case 'O':
                    if (charge === 0) {
                        (number_of_single_bonds + number_of_hydrogens + number_of_double_bonds).should.be.equal(2)
                        number_of_electrons.should.be.equal(8)
                        number_of_free_electrons.should.be.equal(4)
                    }
                    break;
                case 'S':
                    if (charge === 0) {
                        (number_of_single_bonds + number_of_hydrogens + number_of_double_bonds).should.be.equal(6)
                        number_of_electrons.should.be.equal(12)
                        number_of_free_electrons.should.be.equal(0)
                    }
                    break;
            }
        })
    }

    const __checkContainer = (container) => {
        container.should.be.an.Array()
        container[0].should.be.an.Boolean()
        container.slice(1).map((molecule_plus_units) => {
            molecule_plus_units.should.be.an.Array()
            molecule_plus_units.length.should.be.equal(2)
            molecule_plus_units[0].should.be.an.Array() // the actual molecule
            if (molecule_plus_units[1] !==null) {
                molecule_plus_units[1].should.be.an.Number() // units
            }
            if (molecule_plus_units[0][0] !==null) {
                molecule_plus_units[0][0].should.be.an.Number() // pka
            }
            molecule_plus_units[0][1].should.be.an.Array() // atoms
            molecule_plus_units[0][1].map((atom)=>{
                atom[0].should.be.a.String() // eg 'O', 'C', 'H;
                atom[1].should.be.a.Number()
                atom[2].should.be.a.Number()
                atom[3].should.be.a.Number()
                if (atom[4] !== '+') {
                    atom[4].should.be.a.Number()
                }
            })
        })

    }

    // get the type of bond between two atoms
    const __bondType = (atom1, atom2) => {
        const shared_electrons = Set().intersection(atom1.slice(5), atom2.slice(5))
        // @todo triple bonds
        if (shared_electrons.length === 0) {
            return false
        }
        const map = ["","=", "#"]
        return map[shared_electrons.length / 2 - 1]
    }

    const __negativelyChargedAtoms = (test_number) => {

        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms
        mmolecule[0][0].should.be.an.Number() // pKa
        mmolecule[0][1].should.be.an.Array() // atoms

        const negatively_charged_atoms = mmolecule[0][1].reduce(
            (carry, atom, index) => {
                if (atom[0] !== "H" && CAtom(atom, index,mmolecule).isNegativelyCharged(test_number)) {
                    carry.push([
                        index,
                        atom
                    ])
                }
                return carry
            },
            []
        )
        return negatively_charged_atoms
    }

    const __positivelyChargedAtoms = (test_number) => {
        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        const positively_charged_atoms = molecule[1].reduce(
            (carry, atom, index) => {
                if (atom[0] !== "H" && CAtom(atom, index,mmolecule).isPositivelyCharged(test_number)) {
                    carry.push([
                        index,
                        atom
                    ])
                }
                return carry
            },
            []
        )

        return positively_charged_atoms
    }

    const __hydrogensNotAttachedToCarbons = (test_number) => {
        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        const hydrogens = molecule.slice(1).reduce(
            (carry, atom, index) => {
                if (atom[0] === "H" && CAtom(atom, index,molecule).carbons().length === 0) {
                    carry.push([
                        index,
                        atom
                    ])
                }
                return carry
            },
            []
        )
        if (test_number == 4.1) {
            hydrogens.length.should.be.equal(1)
        }
        return hydrogens
    }

    const determineElectrophileIndex = () => {

        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms

        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        let electrophile_index = false

        const hydrogens = __hydrogensNotAttachedToCarbons()

        // Get hydrogens not attached to carbons
        // Check atoms for free slots
        // returns [index, atom] pairs
        if (hydrogens.length > 0) {
            // See organic chemistry 8th edition ch 6 p 235
            // C=C (butene, nucleophile) -> HBr (H is electrophile)
            electrophile_index = hydrogens[0][0]
        } else {

            const positively_charged_atoms = __positivelyChargedAtoms()

            if (positively_charged_atoms.length > 0) {
                electrophile_index = positively_charged_atoms[0][0]
            } else {
                const atoms_with_free_slots = __atomsWithFreeSlots()

                // See organic chemistry 8th edition ch 6 p 235
                // C=C (butene, nucleophile) -> HBr (H is electrophile)
                if (atoms_with_free_slots.length === 0) {
                    return false
                } else {
                    electrophile_index =  atoms_with_free_slots[0][0]
                }
            }

        }
        // Check atom isnt negatively charged (nucleophile)
        // const CAtom = (atom, current_atom_index, mmolecule)
        const is_negatively_charged = CAtom(mmolecule[0][1][electrophile_index], electrophile_index, mmolecule).isNegativelyCharged()

        if (is_negatively_charged) {
            return false
        }

        return electrophile_index
    }

    const determineNucleophileIndex = (test_number) => {

        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms

        const molecule = mmolecule[0] // mmolecule[1] is the number of units

        // Check for negatively charged atoms
        const negatively_charged_atoms = __negativelyChargedAtoms(test_number)

        if (negatively_charged_atoms.length > 0) {
            return negatively_charged_atoms[0][0]
        } 
        
        const atoms_with_lone_pairs = __atomsWithLonePairs(test_number)

        if (atoms_with_lone_pairs.length === 0) {

            // Check for double bonds
            const double_bonds = Families(mmolecule).families.alkene()

            // test_number 6
            // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)

            if (double_bonds.length > 0) {
                // Determine carbon with most hydrogens
                const keys = Object.keys(double_bonds[0])
                // Get number of hydrogens for first carbon
                const carbon_1_hydrogens = CAtom(double_bonds[0][keys[0]], 0, mmolecule).hydrogens
                const carbon_2_hydrogens = CAtom(double_bonds[0][keys[1]], 1, mmolecule).hydrogens

                if (carbon_1_hydrogens.length >= carbon_2_hydrogens.length ) {
                    return keys[0]*1
                } else {
                    return keys[1]*1
                }
            }

            return // Find index of atom to bond to.
            // This must be atom with at least a lone pair.
            return molecule.reduce((carry, current_molecule_atom, current_molecule_atom_index) => {
                    if (typeof current_molecule_atom === "string" || typeof current_molecule_atom.length !== "number") {
                        return carry
                    }
                    const bond_count = _bondCount(current_molecule_atom)
                    const std_number_of_bonds = current_molecule_atom[3]
                    return current_molecule_atom[0] !== "H"
                    && std_number_of_bonds - bond_count < 0 ?
                        carry : current_molecule_atom_index
                }, false
            )

        } else {
            // H2O (nucleophile) <------- HCl (electrophile)

            return atoms_with_lone_pairs[0][0] + 1 // take into account pka
        }


    }

    const __atomsWithLonePairs =  (test_number) => {

        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms

        // Check nucleophile for lone pairs
        const atoms_with_lone_pairs = mmolecule[0][1].slice(1).map(
            (atom, index) => {
                if (atom[0] === "H" || CAtom(atom, index+1, mmolecule).lonePairs(test_number).length === 0) {
                    return null
                }
                return [index, atom]
            }
        ).filter(
            (item) => {
                return item !== null
            }
        )

        // H2O (nucleophile) <------- HCl (electrophile) __atomsWithLonePairs

        // Cl (nucleophile) <------- HCl (electrophile)


        return atoms_with_lone_pairs
    }

    const __atomsWithFreeSlots = () => {
        
        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        
        // Check substrate for free slots
        return molecule[1].map(
            (atom, index) => {
                if ((atom[0]==="H" && CAtom(atom, index,mmolecule).carbons().length > 0) || CAtom(atom, index,mmolecule).freeSlots() === 0 ) {
                    return null
                }
                return [index, atom]
            }
        ).filter(
            (item) => {
                return item !== null
            }
        )
    }

    const __lonePairs = (atoms, atom, current_atom_index) => {

        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        
        const atom_electrons = atom.slice(5)
        const lone_pairs = atom_electrons.filter(
            (atom_electron) => {
                return atoms.filter(
                    (_atom, _atom_index) => {
                        if (current_atom_index === _atom_index) {
                            return true
                        }
                        const _atom_electrons = _atom.slice(5)
                        return _atom_electrons.indexOf(atom_electron) > -1
                    }
                ).length === 1
            }
        )
        return lone_pairs
    }

    const __isShared = (electron) => {
        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        const shared_electrons =  molecule.filter(
            (molecule_atom) => {
                if ( typeof molecule_atom.length !== "number") {
                    return false
                }
                return molecule_atom.indexOf(electron) !== -1
            },
            false
        )


        return shared_electrons.length >1 // take into account electron counting itself
    }

    const __electronToShareIndex = (atom) => {
        atom.should.be.an.Array()
        const atom_valence_electrons = atom.slice(5)
        const atom_electron_to_share_index = atom_valence_electrons.reduce(
            (carry, atom_electron, index) => {
                const is_shared = __isShared(atom_electron)
                carry = is_shared?carry:index
                return carry
            },
            false
        )
        return atom_electron_to_share_index
    }

    const __electronToRemoveIndex = (atom) => {
        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        const atom_valence_electrons = atom.slice(5)
        const atom_electron_to_remove_index = atom_valence_electrons.reduce(
            (carry, atom_electron, index) => {
                const is_shared = __isShared(atom_electron)
                carry = is_shared?index:carry
                return carry
            },
            false
        )
        return atom_electron_to_remove_index
    }

    /*
     atoms is the molecule that the arrow would be pointing to and contains the target atom
     mmmolecue is the molecule taht the arrow would be pointing from and contains the source atom.
     target_atom_index is the index of the atom that the arrow would be pointing to (electrophile)
     source_atom_index is the index of the atom that the arrow would be pointing from (nucleophile)
     */
    const __makeCovalentBond = (
        container, source_molecule_index, target_molecule, target_molecule_index, source_atom_index, target_atom_index, test_number
    ) => {

        target_molecule_index.should.not.be.equal(source_molecule_index)

        __checkContainer(container)

        container[source_molecule_index].should.be.an.Array()
        container[source_molecule_index].length.should.be.equal(2)
        container[source_molecule_index][0].should.be.an.Array()
        container[source_molecule_index][1].should.be.an.Number()

        const source_molecule_before = _.cloneDeep(container[source_molecule_index])
        const target_molecule_before = _.cloneDeep(container[target_molecule_index])

        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms

        target_molecule.length.should.be.equal(2) // molecule, units
        target_molecule[0].length.should.be.equal(2) // pKa, atoms

        source_atom_index.should.be.greaterThan(-1)

        mmolecule[0][1][source_atom_index][0].should.be.an.String()



        /*
        @todo
        We subtract the number of units of the source molecule (mmolecule[1]) from
        the number of units of the target molecule (target_molecule[1]), rounding
        to 0 units if necessary.
        */

        // Now create the bond
        // Get index of first free electron on target atom (electrophile)
        // Brondsted Lowry reaction: target atom is proton
        let target_atom = target_molecule[0][1][target_atom_index]

        if (target_atom === undefined) {
            // proton will be the last element in container
            target_atom = container[container.length -1][0][target_atom_index]
        }

        target_atom.should.be.an.Array()
        target_atom[0].should.be.an.String()
        const target_atom_electron_to_share_index = __electronToShareIndex(target_atom)

        // Get index of first free electron on source atom
        // source atom is atom on nucleophile attacking the proton, mmolecule is the nucleophile
        const source_atom_electron_to_share_index = __electronToShareIndex(mmolecule[0][1][source_atom_index])

        // Get lone pair from source atom (atom arrow would be pointing from (nucleophile))
        const source_atom_lone_pairs = CAtom(mmolecule[0][1][source_atom_index], source_atom_index, mmolecule).lonePairs(test_number)
        source_atom_lone_pairs.should.be.an.Array()

        if (target_molecule[0][1][target_atom_index][0]==="H" && target_molecule[0][1][target_atom_index].length===5 ) {
            console.log("WARNING: Adding a proton using push(). Use addProton() instead.")
        }

        if (target_molecule[0][1][target_atom_index][0]==="H") {

            // proton has no electrons
            if (container[target_molecule_index][0][1][target_atom_index].length===5) {
                console.log("To do: Add hydrogen bond where hydrogen is not a proton")
            }

        } else {


            // Not hydrogen
            // Source atom should always have a lone pair (nucleophile)
            if (!target_atom_electron_to_share_index) {

                // Target atom has no free electrons so check if it has free slots ie that
                // the target atom has un unfillec valence shell
                // electrophile
                // free slots is a number
                // Target atom is what the arrow points to (attacks) and will
                // always be the proton atom from the electrophile.
                // Source atom is what the arrow points from (tail) and will
                // always be the atom from the nucleophile.
                target_molecule[0].should.be.an.Array() // the actual molecule (electrophile (mmolecule is our nucleophile)(
                target_molecule[1].should.be.an.Number() // units
                target_molecule[0][1][target_atom_index].should.be.an.Array() // atoms
                const free_slots = CAtom(target_molecule[0][1][target_atom_index], target_atom_index,  mmolecule).freeSlots()

                if (free_slots > 0) {

                    // add free electron from source atom to target atom
                    // mmolecule[target_atom_mmolecule_index].push(free_slots[0])
                    // add another free electron from source atom to target atom
                    // mmolecule[target_atom_mmolecule_index].push(free_slots[1])

                    // Target atom is what the arrow points to (attacks) and will
                    // always be the proton atom from the electrophile.
                    // Source atom is what the arrow points from (tail) and will
                    // always be the atom from the nucleophile.

                    // add free electron from source atom to target atom
                    container[target_molecule_index][0].should.be.an.Array() // the actual molecule
                    container[target_molecule_index][1].should.be.an.Number() // units
                    container[target_molecule_index][0][1][target_atom_index].should.be.an.Array() // atoms
                    mmolecule[0].should.be.an.Array() // the actual molecule
                    mmolecule[0].length.should.be.equal(2) // pKa, atoms
                    mmolecule[0][0].should.be.an.Number() // pka
                    mmolecule[0][1].should.be.an.Array() // atoms
                    // Push electrons
                    container[target_molecule_index][0][1][target_atom_index].push(mmolecule[0][1][source_atom_index][5 + source_atom_electron_to_share_index])
                    // add another free electron from source atom to target atom
                    container[target_molecule_index][0][1][target_atom_index].push(mmolecule[0][1][source_atom_index][6 + source_atom_electron_to_share_index])

                }

            } else {


                source_atom_lone_pairs.length.should.be.greaterThan(1)

                container[source_molecule_index][0][1][source_atom_index][0].should.be.an.String

                // add source atom electron lone pair from source atom to target atom
                target_molecule[0][1][target_atom_index].push(source_atom_lone_pairs[0])
                target_molecule[0][1][target_atom_index].push(source_atom_lone_pairs[1])

                //console.log(container[source_molecule_index][0][1][source_atom_index])
                //console.log(container[target_molecule_index][0][1][target_atom_index])

                container[target_molecule_index][0][1][target_atom_index][4] = 0

                // Bond target atom to source atom
                //container[target_molecule_index][0][1][target_atom_index].push()

                // Now add the atoms from the target molecule to the source molecule (target_molecule[0][1])
                container[source_molecule_index][0][1] = [...container[source_molecule_index][0][1], ...target_molecule[0][1] ] // COC, Al chloride


                // Remove target molecule from container if required as it has been absorbed by the source molecule
                if (undefined !== container[target_molecule_index]) {
                    if (container[target_molecule_index][1] > container[source_molecule_index][1]) {
                        container[target_molecule_index][1] = container[target_molecule_index][1] - container[source_molecule_index][1]
                    } else {
                        container.splice(target_molecule_index, 1)
                        if (source_molecule_index > target_molecule_index) {
                            source_molecule_index--
                        }
                    }
                }

                container[source_molecule_index].should.be.an.Array()
                container[source_molecule_index].length.should.be.equal(2)
                container[source_molecule_index][0].should.be.an.Array()
                container[source_molecule_index][1].should.be.an.Number()

                // container[source_molecule_index] should always be defined
                if (container[source_molecule_index][1] > target_molecule[1]) {
                    source_molecule_before[1] = container[source_molecule_index][1] - target_molecule[1]
                    container.push(source_molecule_before)
                }
                
            }
        }

        __checkContainer(container)

        // Set pKa
        container[source_molecule_index][0][0] = pKa(container[source_molecule_index][0][1])

        __checkContainer(container)

        return container

    }

    const _bondCount = (atom, verbose) => {

        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        
        const valence_electrons = atom.slice(5).filter(
            (electron) => {
                return null !== electron
            }
        )

        // Check each valence electron to see if it is being shared
        const shared_electrons_count = valence_electrons.reduce(
            (total, current_electron) => {
                // Look for current electron
                // Electron can only be shared once
                const shared =  molecule.reduce(
                    (atoms, molecule_atom) => {
                        if (typeof molecule_atom.length !== "number") {
                            return atoms
                        }
                        if (molecule_atom.indexOf(current_electron) !== -1) {
                            atoms.push(molecule_atom)
                        }
                        return atoms
                    },
                    []
                )  // take into account electron counting itself
                return total + shared.length -1 // shared_count should be either 0 or 1
            },
            0
        )

        return shared_electrons_count / 2;
    }

    return {
// MOLECULE MODEL
// pKa, atom, atom, atom ...
// ATOM MODEL
// atomic symbol, proton count, valence count, std number of bonds, velectron1, velectron2, velectron3
        indexOf: (atom_or_atomic_symbol, include_carbons, verbose) => {

            mmolecule[0].length.should.be.equal(2) // first element is pKA value, second element is arrayh of atoms
            const molecule = mmolecule[0][1] // mmolecule[1] is the number of units, mmolecule[0][0] is the pka value
            molecule.should.be.an.Array()

            if (atom_or_atomic_symbol === "H" || atom_or_atomic_symbol[0] === "H") {

                // get molecule atoms that have hydrogens, keeping track of hydrogen indexes
                const candidate_atoms = molecule.reduce((carry, current_molecule_atom, index) => {

                    if (current_molecule_atom[0] !== "H") {
                        if (typeof current_molecule_atom === "number") {
                            return carry
                        }

                        if (current_molecule_atom[0] === "C" && (undefined === include_carbons || include_carbons === false)) {
                            return carry // only count hydrogens not bounded to carbons
                        }

                        const current_molecule_atom_valence_electrons = current_molecule_atom.slice(5)

                        // check current atom for hydrogens
                        // find the index of hydrogen atom bonded to the current molecule atom
                        const H_index = molecule.reduce((_carry, _current, _index) => {
                            if (_current[0] === "H") {
                                const hydrogen_atom = _current
                                const hydrogen_atom_valence_electrons = hydrogen_atom.slice(5)
                                //if (hydrogen_atom_valence_electrons.intersect(current_molecule_atom_valence_electrons)>0) {
                                const array_intersection = hydrogen_atom_valence_electrons.filter(function (x) {
                                    // checking second array contains the element "x"
                                    if (current_molecule_atom_valence_electrons.indexOf(x) != -1)
                                        return true;
                                    else
                                        return false;
                                });
                                if (array_intersection.length > 0) {
                                    return _index // index of hydrogen bonded to current molecule atom
                                }
                            }
                            return _carry
                        }, -1)
                        if (H_index !== -1) {
                            carry.push([current_molecule_atom, H_index])
                        }
                        return carry


                    }
                    return carry
                }, [])

                // check for oxygen atom and if found return the index of hydrogen atom bonded to the oxygen atom
                const o = candidate_atoms.filter((candidate_atom) => {
                    return candidate_atom[0][0] === "O"
                })

                if (o.length > 0) {
                    return o[0][1]
                }

                if (candidate_atoms.length === 0) {
                    return false;
                }

                return candidate_atoms[0][1]

            }
            else { // we are not looking for hydrogen atom
                if (typeof atom_or_atomic_symbol === "string") {
                    // find index of atom in molecule with matching atomic symbol
                    const i = molecule.reduce((carry, current, index) => {
                        return typeof current.length === "number" && current[0] === atom_or_atomic_symbol ? index : carry
                    }, false)
                    return i
                } else {
                    const i = molecule.search(atom_or_atomic_symbol)
                    return i
                }
            }
        },
        push: (atoms_or_atomic_symbols, container, target_molecule_index, test_number, target_atom_index, source_atom_index, source_molecule_index) => {

            target_molecule_index.should.not.be.equal(source_molecule_index)

            mmolecule.length.should.be.equal(2) // molecule, units
            mmolecule[0].length.should.be.equal(2) // pKa, atoms

            // the nucleophile
            source_atom_index.should.be.greaterThan(-1)

            const atoms = atoms_or_atomic_symbols.map(
                (atom_or_atomic_symbol) => {
                    return typeof atom_or_atomic_symbol === "string" ? AtomFactory(atom_or_atomic_symbol, 0) : atom_or_atomic_symbol
                }
            )

            const target_molecule = container[target_molecule_index] === undefined ? [[pKa(atoms), atoms], 1]: container[target_molecule_index]

            // returns container
            return __makeCovalentBond(container, source_molecule_index, target_molecule, target_molecule_index, source_atom_index, target_atom_index, test_number)
            
        },
        remove: (container, molecule_index, atom_or_atomic_symbol) => {

            const molecule = mmolecule[0] // mmolecule[1] is the number of units

            var test_mode = false
            var test_mode_2 = false

            if (undefined !== container[1][2] && container[1][2][0] === "Cl" && container[2][3][0] === "O") {
                test_mode = true
            }

            if (container[1][1][0] === "Cl") {
                test_mode_2 = true
            }


            //  HCl + H2O <-> Cl- + H3O+
            // mmolecule is HCl
            // Removing hydrogen from HCl
            // HCl is the first molecule (molecule_index is 1)
            // H2O is the second molecule
            let atom = null
            if (typeof atom_or_atomic_symbol === "string") {
                // find index of atom in molecule with matching atomic symbol
                atom_index = mmolecule.reduce((carry, current, index) => {
                    return typeof current !== "string" && typeof current.length === "number" && current[0] === atom_or_atomic_symbol ? index : carry
                }, false)
                atom = AtomFactory(atom_or_atomic_symbol, 0)
            } else {
                atom_index = mmolecule.indexOf(atom_or_atomic_symbol)
                atom = atom_or_atomic_symbol
            }



            if (atom_index === false) {
                __checkContainer(container)
                return container
            }

            // Hydrogen atom from HCl / H3O

            const atom_to_remove = mmolecule[atom_index]

            const bond_count = _bondCount(atom_to_remove)
            if (test_mode) {
                bond_count.should.be.equal(1)
            }

            if (bond_count === 0) {
                __checkContainer(container)
                return container
            }

            // Remove electrons
            const electron_to_remove_index = __electronToRemoveIndex(mmolecule[atom_index])

            if (test_mode) {
                electron_to_remove_index.should.be.equal(1)
            }

            if (test_mode_2) {
                electron_to_remove_index.should.be.equal(1)
            }

            const electron = mmolecule[atom_index][4 + electron_to_remove_index]
            electron.should.be.a.String()

            if (mmolecule[atom_index][0] === 'H') {
                mmolecule[atom_index].splice(5)
            } else {
                mmolecule[atom_index].splice(5 + electron_to_remove_index, 1)
            }

            const bonded_atom_index = mmolecule.reduce((carry, current_molecule_atom, index) => {
                //electron is a string
                if (typeof current_molecule_atom === 'number') {
                    return carry
                }
                return typeof current_molecule_atom !== "string" && typeof current_molecule_atom.length === "number" && current_molecule_atom.indexOf(electron) !== false
                    ? index : carry
            }, false)


            if (bonded_atom_index === false) {
                __checkContainer(container)
                return container
            }

            // remove shared electron
            const bonded_atom = mmolecule[bonded_atom_index]


            bonded_atom.push(electron)

            // bonded_atom[bonded_atom.indexOf(electron)] = null
            // delete(bonded_atom[bonded_atom.indexOf(electron)])
            bonded_atom.splice(bonded_atom.indexOf(electron), 1)

            const bonded_atom_bonds_count = _bondCount(bonded_atom)

            mmolecule[bonded_atom_index] = bonded_atom

            mmolecule.splice(atom_index, 1)




            mmolecule[0] = pKa(mmolecule.slice(1))

            container[molecule_index] = mmolecule


            __checkContainer(container)
            return container

        },
        itemAt: (index) => {
            // mmolecule[item]
            return mmolecule[index]
        },
        bondCount: _bondCount,
        lonePairs: (atom, current_atom_index) => {
            return CAtom(atom, current_atom_index, mmolecule).lonePairs()
        },
        atomsWithFreeSlots: __atomsWithFreeSlots,
        nucleophileIndex: determineNucleophileIndex,
        electrophileIndex: determineElectrophileIndex,
        verifyMolecule: verifyMolecule,
        removeProton: (container,  proton_index, molecule_index, reactant_units) => {
            
            const mmolecule_before = _.cloneDeep(mmolecule)

            // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
            // mmolecule[0] is the molecule we are removing the proton from

            // Hydrogen atom from HCl
            const bond_count = _bondCount(mmolecule[0][1][proton_index])

            if (bond_count === 0) {
                __checkContainer(container)
                return container
            }

            // Remove all electrons from proton
            mmolecule[0][1][proton_index].splice(5)
            mmolecule[0][1][proton_index].length.should.be.equal(5)

            // Remove proton from molecule and add it to the container as a new molecule
            const proton = mmolecule[0][1][proton_index]
            mmolecule[0][1].splice(proton_index, 1)
            

            mmolecule[0][0] = pKa(mmolecule[0].slice(1))

            mmolecule[1] = reactant_units
            
            
            // reactant_units is the number of units of reactant that wr
            // are reacting the molecule witj
           
            if (mmolecule[1] > reactant_units) {
                mmolecule_before[1] = mmolecule[1] - reactant_units
                container.push(mmolecule_before)
            }
            
            container[molecule_index] = mmolecule
            
            // Make sure we push the proton to the container last
            container.push([[null, [proton]],mmolecule[1]]) // mmolecule[1] is units
                        
            __checkContainer(container)
            
            return container

        },

        bondType: __bondType,

        addProton: (atoms_or_atomic_symbols, container, target_molecule_index, test_number, target_atom_index, source_atom_index, source_molecule_index) => {

            mmolecule.length.should.be.equal(2) // molecule, units
            mmolecule[0].length.should.be.equal(2) // pKa, atoms

            source_atom_index.should.be.greaterThan(-1)

            const atoms = atoms_or_atomic_symbols.map(
                (atom_or_atomic_symbol) => {
                    return typeof atom_or_atomic_symbol === "string" ? AtomFactory(atom_or_atomic_symbol, 0) : atom_or_atomic_symbol
                }
            )

            __checkContainer(container)

            mmolecule.length.should.be.equal(2) // molecule, units
            mmolecule[0].length.should.be.equal(2) // pKa, atoms
            source_atom_index.should.be.greaterThan(-1)

            let atom = container[target_molecule_index][0]

            // Get number electrons the source atom has
            const source_atom_electrons = _.cloneDeep(container[source_molecule_index][0][1][source_atom_index]).slice(5).length

            if (atom === undefined) {
                // proton will be the last element in container
                atom = container[container.length -1][0][target_atom_index]
            }

            atom.should.be.an.Array()
            const target_atom_electron_to_share_index = __electronToShareIndex(atom)

            // Get index of first free electron on source atom
            // Brondsted Lowry reaction: source atom is atom on nucleophile attacking the proton, mmolecule is the nucleophile
            const source_atom_electron_to_share_index = __electronToShareIndex(mmolecule[0][1][source_atom_index])

            // Get lone pair from source atom (atom arrow would be pointing from (nucleophile))
            const source_atom_lone_pairs = CAtom(mmolecule[0][1][source_atom_index], source_atom_index, mmolecule).lonePairs(test_number)
            source_atom_lone_pairs.should.be.an.Array()

            // Protons are always target atoms (electrophiles) - where the arrow would be pointing to
            // Brondsted Lowry reaction: target atom is proton
            container[target_molecule_index].should.be.an.Array() // actual molecule, units
            container[target_molecule_index].length.should.be.equal(2)
            container[target_molecule_index][0].should.be.an.Array() // the actual molecule
            container[target_molecule_index][1].should.be.an.Number() // units
            container[target_molecule_index][0].length.should.be.equal(2) // pKa, atoms

            if (container[target_molecule_index][0][0] !== null) {
                container[target_molecule_index][0][0].should.be.an.Number() // pKa
            }

            container[target_molecule_index][0][1].should.be.an.Array() // atoms
            container[target_molecule_index][0][1][target_atom_index].should.be.an.Array() // target atom
            container[target_molecule_index][0][1][target_atom_index][0].should.be.equal("H")
            _.cloneDeep(container[target_molecule_index][0][1][target_atom_index]).slice(5).length.should.be.equal(0)

            // add electrons from source atom to target atom (proton)
            // target atom is a proton and has no electrons
            if (source_atom_lone_pairs.length > 0) {
                // container[target_molecule_index][target_atom_index] is a proton
                //  container[target_molecule_index][1] are the units
                //  container[target_molecule_index][0][1] are the atoms
                // process.exit()
                container[target_molecule_index][0][1][target_atom_index].push(source_atom_lone_pairs[0])
                container[target_molecule_index][0][1][target_atom_index].push(source_atom_lone_pairs[1])
                // Add proton to target molecule
                __checkContainer(container)
                container[source_molecule_index][0][1].push(container[target_molecule_index][0][1][target_atom_index])
                __checkContainer(container)
            } else {

                // Does the source atom have a double bond?
                // returns a set of electrons or false
                const double_bond = CAtom(mmolecule[0][1][source_atom_index], source_atom_index, mmolecule).doubleBond(test_number)

                // remove the double bond by removing electrons from bonded atom (turn into single bond)
                if (double_bond) {

                    //console.log("MOLECULE WITH DOUBLE BOND REMOVED B4")
                    //console.log(VMolecule(container[source_molecule_index]).canonicalSMILES())
                    const molecule_with_double_bond_removed = CAtom(_.cloneDeep(mmolecule[0][1][source_atom_index]), source_atom_index, _.clone(mmolecule)).removeDoubleBond(test_number)
                    //console.log("MOLECULE WITH DOUBLE BOND REMOVED")
                   // console.log(molecule_with_double_bond_removed)
                   // console.log(VMolecule([molecule_with_double_bond_removed,1]).canonicalSMILES())
                    container[source_molecule_index][0] =  molecule_with_double_bond_removed
                 //   container[source_molecule_index][0][1][source_atom_index][4] = 1

                    __checkContainer(container)
                    container[target_molecule_index][0][1][target_atom_index].push(double_bond[0])
                    container[target_molecule_index][0][1][target_atom_index].push(double_bond[1])

                    // Add proton to target molecule
                    __checkContainer(container)
                    container[source_molecule_index][0][1].push(container[target_molecule_index][0][1][target_atom_index])
                    __checkContainer(container)


                }

            }

            __checkContainer(container)




            // Set pKa
            container[target_molecule_index][0][0] = pKa(container[target_molecule_index][0].slice(1))


            __checkContainer(container)

            // Check source atom still has the same number of electrons
            //console.log(source_atom_index)
            //console.log(container[source_molecule_index][0][1])
            _.cloneDeep(container[source_molecule_index][0][1][source_atom_index]).slice(5).length.should.equal(source_atom_electrons)


            return container




        }
    }
}

module.exports = CMolecule


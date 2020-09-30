//
const AtomFactory = require('../Models/AtomFactory')
const CAtom = require('./Atom')
const pKa = require('../Models/pKa')
const should = require('should')
const Set = require('../Models/Set')
const Families = require('../Models/Families')

const CMolecule = (mmolecule, verbose) => {

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

        const negatively_charged_atoms = mmolecule[0][1].slice(1).reduce(
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
        const positively_charged_atoms = molecule.slice(1).reduce(
            (carry, atom, index) => {
                if (atom[0] !== "H" && CAtom(atom, index,molecule).isPositivelyCharged(test_number)) {
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
            positively_charged_atoms.length.should.be.equal(7777)
        }
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

    const determineElectrophileIndex = (test_number) => {

        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        let electrophile_index = false

        // [Br-] (nucleophile, electron donor) -----> carbocation
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1
        // substrate is [Br-]
        // reagent is carbocation
        // see organic chenistry 8th edition ch 6 p235
        // [Br-] (nucleophile) -----> carbocation
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8
        // Source atom index should be 1
        // Organic Chemistry 8th edition, P199
        // test_number 5
        // [Br-] + carbocation (alkane)
        // electrophile is [C+] cation on carbocation
        // nucleophile is [Br-]
        // carbocation is added to [Br-]
        // Br and C form bond
        // 5.1 test 5, [Br-] nucleophile so should return false
        // 5.2 test 5, carbocation electrophile so should not return false

        const hydrogens = __hydrogensNotAttachedToCarbons(test_number)


        if (test_number === 4.1) {
            hydrogens.length.should.be.equal(1)
        }

        if (test_number === 5.1) {  // mmolecle = [Br-]
            hydrogens.length.should.be.equal(0)
        }

        if (test_number * 1=== 7.1) {
            hydrogens.length.should.be.equal(2)
        }

        // Get hydrogens not attached to carbons

        // Check atoms for free slots
        // returns [index, atom] pairs
        if (test_number === 5.2) {
            hydrogens.length.should.be.equal(0)
        }
        if (hydrogens.length > 0) {
            // See organic chemistry 8th edition ch 6 p 235
            // C=C (butene, nucleophile) -> HBr (H is electrophile)
            if (test_number === 4.1) {
                hydrogens[0][0].should.be.equal(0)
            }
            electrophile_index = hydrogens[0][0]

        } else {

            const positively_charged_atoms = __positivelyChargedAtoms(test_number)

            if (test_number === 5.2) {
                    // [Br-] (nucleophile, electron donor) -----> carbocation
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1
        // substrate is [Br-]
        // reagent is carbocation
        // see organic chenistry 8th edition ch 6 p235
        // [Br-] (nucleophile) -----> carbocation
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8
        // Source atom index should be 1
        // Organic Chemistry 8th edition, P199
        // test_number 5
        // [Br-] + carbocation (alkane)
        // electrophile is [C+] cation on carbocation
        // nucleophile is [Br-]
        // carbocation is added to [Br-]
        // Br and C form bond
        // 5.1 test 5, [Br-] nucleophile so should return false
        // 5.2 test 5, carbocation electrophile so should not return false
                
                
                
               
                positively_charged_atoms.length.should.be.equal(1) // the carbocation
            }

            if (positively_charged_atoms.length > 0) {
                electrophile_index = positively_charged_atoms[0][0] + 1
            } else {
                const atoms_with_free_slots = __atomsWithFreeSlots(test_number)

                // See organic chemistry 8th edition ch 6 p 235
                // C=C (butene, nucleophile) -> HBr (H is electrophile)
                if (test_number == 4.1) {
                    
                    
                    atoms_with_free_slots.length.should.be.equal(1)
                }

                if (test_number == 5.1) {
                    atoms_with_free_slots.length.should.be.equal(1)
                }

                if (atoms_with_free_slots.length === 0) {
                    return false
                } else {
                    electrophile_index =  atoms_with_free_slots[0][0] + 1 // take into account pKa value
                }
            }

        }
        // Check atom isnt negatively charged (nucleophile)
        // const CAtom = (atom, current_atom_index, mmolecule)
        const is_negatively_charged = CAtom(molecule[electrophile_index + 1], 0, molecule).isNegativelyCharged(test_number)

        if (test_number *1 === 7.1) {
            is_negatively_charged.should.be.equal(false)
        }

        if (test_number === 5.1) {
            is_negatively_charged.should.be.equal(true)
        }

        if (is_negatively_charged) {
            if (verbose) {
                console.log("Controllers/Molecule.js::determineElectrophileIndex Atom is negatively charged so return false")
            }
            return false
        }

        if (verbose) {
            console.log("Controllers/Molecule.js::determineElectrophileIndex() Returning electrophile index " + electrophile_index)
            console.log("Molecule ->")
            console.log(molecule)
        }

        if (test_number *1 === 7.1) {
            electrophile_index.should.be.equal(0)
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
            return negatively_charged_atoms[0][0] + 1
        } 
        
        const atoms_with_lone_pairs = __atomsWithLonePairs(test_number)

        if (atoms_with_lone_pairs.length === 0) {

            // Check for double bonds
            const double_bonds = Families(molecule.slice(1)).families.alkene()

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
                const carbon_1_hydrogens = CAtom(double_bonds[0][keys[0]], 0, molecule).hydrogens
                const carbon_2_hydrogens = CAtom(double_bonds[0][keys[1]], 1, molecule).hydrogens
                if (test_number === 4) {
                    carbon_1_hydrogens.length.should.be.equal(1)
                    carbon_2_hydrogens.length.should.be.equal(1)
                }

                if (test_number === 6) {
                    keys[0].should.be.equal('5')
                    keys[1].should.be.equal('8')
                }

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

    const __atomsWithFreeSlots = (test_number) => {
        
        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        
        // Check substrate for free slots

        return molecule.slice(1).map(

            (atom, index) => {

                if ((atom[0]==="H" && CAtom(atom, index,molecule).carbons().length > 0) || CAtom(atom, index,mmolecule).freeSlots(test_number) === 0 ) {
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
        container, source_molecule_index, target_molecule_index, source_atom_index, target_atom_index, test_number
    ) => {

        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms
        source_atom_index.should.be.greaterThan(-1)

            // NOTES
            // Brondsted Lowry reactions:
            // atoms_or_atomic_symbols is the proton from the electrophile.
            // mmolecule is the nucleophile (molecule containing the atom
            // that attacks the proton from the electrophile).
            // Target atom is what the arrow points to (attacks) and will
            // always be the proton atom from the electrophile.
            // Source atom is what the arrow points from (tail) and will
            // always be the atom from the nucleophile.  
        
        /*
        @todo
        We subtract the number of units of the source molecule (mmolecule[1]) from
        the number of units of the target molecule (target_molecule[1]), rounding
        to 0 units if necessary.
        */

        // Now create the bond
        /*
        In the molecule H2, the hydrogen atoms share the two electrons via covalent bonding.[7] Covalency is greatest between atoms of similar electronegativities. Thus, covalent bonding does not necessarily require that the two atoms be of the same elements, only that they be of comparable electronegativity. Covalent bonding that entails sharing of electrons over more than two atoms is said to be delocalized.
         */
        // Get index of first free electron on target atom
        // Brondsted Lowry reaction: target atom is proton
        let atom = container[target_molecule_index][0]

        if (atom === undefined) {
            console.log("Fetching atom")
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

        if (container[target_molecule_index][0][1][target_atom_index][0]==="H") {

            // proton?
            // proton has no electrons
            if (container[target_molecule_index][0][1][target_atom_index].length===5) {

                // add electrons from source atom to target atom (proton)
                // target atom is a proton and has no electrons
                if (source_atom_lone_pairs.length > 0) {
                    // container[target_molecule_index][target_atom_index] is a proton
                    //  container[target_molecule_index][1] are the units
                    //  container[target_molecule_index][0][1] are the atoms
                   // console.log(container[target_molecule_index][target_atom_index])
                   // console.log(container[target_molecule_index][target_atom_index][1])
                   // process.exit()
                    container[target_molecule_index][0][1][target_atom_index].push(source_atom_lone_pairs[0])
                    container[target_molecule_index][0][1][target_atom_index].push(source_atom_lone_pairs[1])
                    // Add proton to target molecule
                    container[source_molecule_index][0][1].push(container[target_molecule_index][0][1])
                } else {

                    // Does the source atom have a double bond?
                    // returns a set of electrons or false
                    const double_bond = CAtom(mmolecule[0][1][source_atom_index], source_atom_index, mmolecule[0]).doubleBond(test_number)

                    // remove the double bond by removing electrons from bonded atom (turn into single bond)
                    if (double_bond) {
                        mmolecule[0] = CAtom(mmolecule[0][1][source_atom_index], source_atom_index,mmolecule[0]).removeDoubleBond(test_number)
                        container[target_molecule_index][0][1][target_atom_index].push(double_bond[0])
                        container[target_molecule_index][0][1][target_atom_index].push(double_bond[1])
                    }

                }

            } else {
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
                container[target_molecule_index][0].should.be.an.Array() // the actual molecule
                container[target_molecule_index][1].should.be.an.Number() // units
                container[target_molecule_index][0][1][target_atom_index].should.be.an.Array() // atoms
                const free_slots = CAtom(container[target_molecule_index][0][1][target_atom_index], target_atom_index,  mmolecule).freeSlots(test_number)

                //console.log("FREE SLOTS CMolecule.js")
                //console.log(free_slots)

                

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


                // add shared electron from target atom to source atom
                mmolecule[0][source_atom_index].push(mmolecule[0][target_atom_mmolecule_index][4 + target_atom_electron_to_share_index])

                // add shared electron from atom being pushed to target atom
                // test 5 - atom_to_push_molecule_index is undefined
                container[target_molecule_index][target_atom_index].push(mmolecule[0][atom_to_push_molecule_index][5 + source_atom_electron_to_share_index])



            }
        }

        container[target_molecule_index][0] = pKa(container[target_molecule_index][0].slice(1))

        //  CC=CC (nucleophile) ----> HBr (electrophile) (target)

        // Check there is a bond between nucleophile atom (source) and electrophile atom (target)

        return container

    }

    const _bondCount = (atom, verbose) => {

        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        
        if (verbose) {
            console.log('Controllers/Molecule.js:: Getting bond count for atom ->')
            console.log('Controllers/Molecule.js:: Molecule')
            console.log(mmolecule)
            console.log('Controllers/Molecule.js:: atom')
            console.log(atom)
        }

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

        if (verbose) {
            console.log('Controllers/Molecule.js:: Number of bonds ->' + shared_electrons_count / 2 );
        }
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

            mmolecule.length.should.be.equal(2) // molecule, units
            mmolecule[0].length.should.be.equal(2) // pKa, atoms

            source_atom_index.should.be.greaterThan(-1)

            // NOTES
            // Brondsted Lowry reactions:
            // atoms_or_atomic_symbols is the proton from the electrophile.
            // mmolecule is the nucleophile (molecule containing the atom
            // that attacks the proton from the electrophile).
            // Target atom is what the arrow points to (attacks) and will
            // always be the proton atom from the electrophile.
            // Source atom is what the arrow points from (tail) and will
            // always be the atom from the nucleophile.            
            
           
            // atoms_or_atomic_symbols are atoms from electrophile
            // mmolecule is the nucleophile
            // MOLECULE MODEL
// pKa, atom, atom, atom ...
// ATOM MODEL
// atomic symbol, proton count, valence count, std number of bonds, velectron1, velectron2, velectron3

            // atoms_or_atomic symbols is an array containing the atom we are
            // pushing and the atoms linked to that atom
            // atom_index is the index of the atom we are pushing
            //console.log(atoms_or_atomic_symbols)
            const atoms = atoms_or_atomic_symbols.map(
                (atom_or_atomic_symbol) => {
                    return typeof atom_or_atomic_symbol === "string" ? AtomFactory(atom_or_atomic_symbol, 0) : atom_or_atomic_symbol
                }
            )
            
            // returns container
            return __makeCovalentBond(container, source_molecule_index, target_molecule_index, source_atom_index, target_atom_index, test_number)           
            
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

            if (test_mode) {
                molecule_index.should.be.equal(1)
                atom_or_atomic_symbol[0].should.be.equal("H")
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

            if (test_mode) {
                atom_index.should.be.equal(1)
            }

            if (test_mode_2) {
                atom_index.should.be.equal(1)
            }


            if (atom_index === false) {
                return container
            }

            // Hydrogen atom from HCl / H3O

            const atom_to_remove = mmolecule[atom_index]
            if (test_mode) {
                atom_to_remove[0].should.be.equal("H")
            }

            if (test_mode_2) {
                atom_to_remove[0].should.be.equal("H")
            }

            const bond_count = _bondCount(atom_to_remove)
            if (test_mode) {
                bond_count.should.be.equal(1)
            }

            if (bond_count === 0) {
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

            if (test_mode) {
                bonded_atom_index.should.be.equal(2)
            }

            if (test_mode_2) {
                bonded_atom_index.should.be.equal(2)
            }

            if (bonded_atom_index === false) {
                return container
            }

            // remove shared electron
            const bonded_atom = mmolecule[bonded_atom_index]
            if (test_mode) {
                bonded_atom[0].should.be.equal("Cl")
            }


            bonded_atom.push(electron)

            // bonded_atom[bonded_atom.indexOf(electron)] = null
            // delete(bonded_atom[bonded_atom.indexOf(electron)])
            bonded_atom.splice(bonded_atom.indexOf(electron), 1)

            const bonded_atom_bonds_count = _bondCount(bonded_atom)

            mmolecule[bonded_atom_index] = bonded_atom

            mmolecule.splice(atom_index, 1)


            if (test_mode) {
                mmolecule.length.should.be.equal(2)
            }

            if (test_mode_2) {
                mmolecule.length.should.be.equal(2)
            }

            mmolecule[0] = pKa(mmolecule.slice(1))

            container[molecule_index] = mmolecule


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
        removeProton: (container,  proton_index, molecule_index) => {

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
                return container
            }

            // Remove all electrons from proton
            mmolecule[0][1][proton_index].splice(5)
            mmolecule[0][1][proton_index].length.should.be.equal(5)

            // Remove proton from molecule and add it to the container as a new molecule
            const proton = mmolecule[0][1][proton_index]
            mmolecule[0][1].splice(proton_index, 1)
            container.push([[null, [proton]],1]) // 1 is units

            mmolecule[0][0] = pKa(mmolecule[0].slice(1))


            container[molecule_index] = mmolecule


            return container

        },

        bondType: __bondType
    }
}

module.exports = CMolecule


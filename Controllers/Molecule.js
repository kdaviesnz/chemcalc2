//
const AtomFactory = require('../Models/AtomFactory')
const CAtom = require('./Atom')
const pKa = require('../Models/pKa')
const should = require('should')
const Set = require('../Models/Set')
const Families = require('../Models/Families')

const CMolecule = (mmolecule, verbose) => {

    const __negativelyChargedAtoms = (test_number) => {
        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        const negatively_charged_atoms = molecule.slice(1).reduce(
            (carry, atom, index) => {
                if (atom[0] !== "H" && CAtom(atom, index,molecule).isNegativelyCharged(test_number)) {
                    carry.push([
                        index,
                        atom
                    ])
                }
                return carry
            },
            []
        )
        if (test_number === 4.1) {
            negatively_charged_atoms.length.should.be.equal(7777)
        }
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
        
        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        
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
        // 5.1 test 5, [Br-] nucleophile so should return true
        // 5.2 test 5, carbocation electrophile so should return true


        // H2O (nucleophile) <------- HCl (electrophile)
        if (undefined !== test_number && test_number === 1) {
            molecule.length.should.be.equal(4)
            molecule[3][0].should.be.equal("O")
        }

        // Cl- (nucleophile) <------- H3O (electrophile)
        if (undefined !== test_number && test_number === 2) {
            molecule.length.should.be.equal(2)
            molecule[1][0].should.be.equal("Cl")
        }
        
        // Check for negatively charged atoms
         const negatively_charged_atoms = __negativelyChargedAtoms(test_number)
         if (undefined !== test_number && test_number === 5.1) {
             // 5.1 test 5, [Br-] nucleophile so should return 1
             negatively_charged_atoms.length.should.be.equal(1)
         }
        
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
            if (test_number === 6) {
                double_bonds.length.should.be.greaterThan(0)
            }

            if (test_number === 4) {
                double_bonds.length.should.be.greaterThan(0)
            }

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
            if (test_number === 1) {
                atoms_with_lone_pairs[0][0].should.be.equal(2)
                molecule[atoms_with_lone_pairs[0][0]+1][0].should.be.equal("O")
            }
            // Cl- (nucleophile) <------- H3O (electrophile)
            if (test_number === 2) {
                atoms_with_lone_pairs[0][0].should.be.equal(777)
                molecule[atoms_with_lone_pairs[0][0]+1][0].should.be.equal("Cl")
            }
            return atoms_with_lone_pairs[0][0] + 1 // take into account pka
        }


    }

    const __atomsWithLonePairs =  (test_number) => {

        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        
        // H2O (nucleophile) <------- HCl (electrophile)
        if (undefined !== test_number && test_number === 1) {
            molecule.length.should.be.equal(4)
            molecule[3][0].should.be.equal("O")
        }

        // Cl (nucleophile) <------- HCl (electrophile) __atomsWithLonePairs()
        if (undefined !== test_number && test_number === 2) {
            molecule.length.should.be.equal(2)
            molecule[1][0].should.be.equal("Cl")
        }

        // Check nucleophile for lone pairs
        const atoms_with_lone_pairs = molecule.slice(1).map(
            (atom, index) => {
                if (atom[0] === "H" || CAtom(atom, index+1, molecule).lonePairs(test_number).length === 0) {
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
        if (test_number === 1) {
            atoms_with_lone_pairs[0][0].should.be.equal(2)
            atoms_with_lone_pairs[0][1][0].should.be.equal("O")
        }

        // Cl (nucleophile) <------- HCl (electrophile)
        if (test_number === 2) {
            atoms_with_lone_pairs[0][0].should.be.equal(8888)
            atoms_with_lone_pairs[0][1][0].should.be.equal("Cl")
        }

        if (test_number === 3) {
            atoms_with_lone_pairs[0][0].should.be.equal(4)
            atoms_with_lone_pairs[0][1][0].should.be.equal("O")
        }

        return atoms_with_lone_pairs
    }

    const __atomsWithFreeSlots = (test_number) => {
        
        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        
        // Check substrate for free slots

        return molecule.slice(1).map(

            (atom, index) => {

                console.log('m' + test_number)

                if (test_number == 3.1) {
                    // AlCl3 , Al is an electrophile
                    if (atom[0] === 'Al') {
                        CAtom(atom, index, molecule).freeSlots(test_number).should.be.equal(6)
                    }
                }

                if (test_number == 5.1) {
                    // freeSlots() returns a number
                    
                    CAtom(atom, index ,molecule).freeSlots(test_number).should.be.equal(9) // Check
                }


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
        
        const atom_electrons = atom.slice(4)
        const lone_pairs = atom_electrons.filter(
            (atom_electron) => {
                return atoms.filter(
                    (_atom, _atom_index) => {
                        if (current_atom_index === _atom_index) {
                            return true
                        }
                        const _atom_electrons = _atom.slice(4)
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
        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        const atom_valence_electrons = atom.slice(4)
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
        const atom_valence_electrons = atom.slice(4)
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

        /*
        @todo
        We subtract the number of units of the source molecule (mmolecule[1]) from
        the number of units of the target molecule (target_molecule[1]), rounding
        to 0 units if necessary.
        */
        
        const molecule = mmolecule[0] // mmolecule[1] is the number of units
        // H+ (electrophile) <------- H:OH
        // atoms [[proton]]
        // mmolecule H2O
        // Proton is our electrophile, where the arrow would be pointing to
        // H2O is our nucleophile, where the arrow would be pointing from
        if (test_number === 1) {
            source_atom_index.should.be.equal(3)
            target_atom_index.should.be.equal(1)
            molecule.length.should.be.equal(4) // mmolecue should be the nucleophile (H2O)
            molecule[1][0].should.be.equal("H")
            molecule[2][0].should.be.equal("H")
            molecule[3][0].should.be.equal("O")
            molecule[source_atom_index][0].should.be.equal("O")
            atoms.length.should.be.equal(1)
            target_atom_index.should.be.equal(1) // proton so must be 1
            source_atom_index.should.be.equal(3) // oxygen atom on H2O (nucleophile) taking into account pKa
            atoms[target_atom_index][0].should.be.equal("H")
        }

        // H+ (electrophile) <------- Cl- (nucleophile) (source atom)
        // atoms [[proton]]
        // mmolecule Cl-
        // Proton is our electrophile, where the arrow would be pointing to
        // Cl- is our nucleophile, where the arrow would be pointing from
        if (test_number === 2) {
            source_atom_index.should.be.equal(1) // nucleophile
            molecule.length.should.be.equal(2) // mmolecule should be the nucleophile (Cl-)
            molecule[1][0].should.be.equal("Cl")
            molecule[source_atom_index][0].should.be.equal("Cl")
            atoms.length.should.be.equal(1)
            target_atom_index.should.be.equal(1) // proton so must be 1
            source_atom_index.should.be.equal(1) // Cl- atom on nucleophile taking into account pKa
            // atoms [ [ 'H', 1, 1, 1 ] ]
            atoms[target_atom_index][0].should.be.equal("H")
        }

        //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
        if (test_number === 4) {
            if(test_number === 4) {
                // atoms
                // source_atom_index 6 = Carbon on double bond
                // target_atom_index 1 = H
            }
            source_atom_index.should.be.equal(6) // nucleophile
            molecule.length.should.be.equal(13) // mmolecule should be the nucleophile
            molecule[source_atom_index][0].should.be.equal("C")
            atoms.length.should.be.equal(1)
            target_atom_index.should.be.equal(1) // proton so must be 1
            source_atom_index.should.be.equal(6) // C atom on double bond on mmolecule (nucleophile)
            // atoms [ [ 'H', 1, 1, 1 ] ]
            atoms[target_atom_index -1][0].should.be.equal("H")
        }

        // This is the index of the target atom after adding it to mmolecule
        const target_atom_mmolecule_index = molecule.length + target_atom_index -1

        // H2O (nucleophile) -------> H+ (electrophile)
        if (test_number === 1) {
            target_atom_mmolecule_index.should.be.equal(4)
        }

        // Cl- (nucleophile) -------> H+ (electrophile)
        if (test_number === 2) {
            target_atom_mmolecule_index.should.be.equal(2)
        }

        // C:OC (nucleophile) ---------> AlCl3 (electrophile)
        if (test_number === 3) {
            target_atom_mmolecule_index.should.be.equal(10) // Al
            atoms.length.should.be.equal(4) // AlCl3
            molecule.length.should.be.equal(10) // COC
        }

        //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
        if (test_number === 4) {
            // This is the proton
            target_atom_mmolecule_index.should.be.equal(13)
            atoms.length.should.be.equal(1)
            molecule.length.should.be.equal(13)
        }


        // [Br-] (nucleophile) -----> carbocation CC[C+]C
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1

        if (test_number === 5) {
            

            // [Br-] (nucleophile) -----> carbocation CC[C+]C
            // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8 (electrophile)
            // Source atom index should be 1
            target_atom_mmolecule_index.should.be.equal(9) // 1 + 8
            atoms.length.should.be.equal(13)
            molecule.length.should.be.equal(2) // [Br-] we havent added the electrophile yet
        }

        // Add atoms to molecule.
        // At this point main atom won't be bonded.
        atoms.map(
            (atom) => {
                molecule.push(atom)
                return atom
            }
        )

        // H2O (nucleophile) -------> H+ (electrophile)
        if (test_number === 1) {
            molecule[target_atom_mmolecule_index][0].should.be.equal("H")
            molecule.length.should.be.equal(5)
            molecule[1][0].should.be.equal("H")
            molecule[2][0].should.be.equal("H")
            molecule[3][0].should.be.equal("O")
            molecule[4][0].should.be.equal("H")
        }

        // Cl- (nucleophile) -------> H+ (electrophile)
        if (test_number === 2) {
            molecule[target_atom_mmolecule_index][0].should.be.equal("H")
            molecule.length.should.be.equal(3)
            molecule[1][0].should.be.equal("Cl")
            molecule[2][0].should.be.equal("H")
        }

        // C:OC (nucleophile) ---------> AlCl3 (electrophile)
        if (test_number === 3) {
            molecule[target_atom_mmolecule_index][0].should.be.equal("Al")
            molecule.length.should.be.equal(14)
            molecule[1][0].should.be.equal("H")
            molecule[2][0].should.be.equal("H")
            molecule[3][0].should.be.equal("H")
            molecule[4][0].should.be.equal("C")
        }

        //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
        if (test_number === 4) {
            // This is the proton
            molecule[target_atom_mmolecule_index][0].should.be.equal("H")
            molecule.length.should.be.equal(14)
            molecule[1][0].should.be.equal("H")
            molecule[2][0].should.be.equal("H")
            molecule[3][0].should.be.equal("H")
            molecule[4][0].should.be.equal("C")
        }

        // [Br-] (nucleophile) -----> carbocation CC[C+]C
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1
        if (test_number === 5) {
            target_atom_mmolecule_index.should.be.equal(9) // source atom index plus target atom index
            molecule[target_atom_mmolecule_index][0].should.be.equal("C")
            molecule.length.should.be.equal(15)

        }


        if (undefined === mmolecule[target_atom_mmolecule_index]) {
            console.log("mmolecule[target_atom_mmolecule_index] is undefined")
            console.log(mmolecule)
            console.log(target_atom_mmolecule_index)
            console.log("Molecule.js")
            process.exit()
        }


        // Now create the bond

        /*
        In the molecule H2, the hydrogen atoms share the two electrons via covalent bonding.[7] Covalency is greatest between atoms of similar electronegativities. Thus, covalent bonding does not necessarily require that the two atoms be of the same elements, only that they be of comparable electronegativity. Covalent bonding that entails sharing of electrons over more than two atoms is said to be delocalized.
         */
        // Get index of first free electron on target atom



        const target_atom_electron_to_share_index = __electronToShareIndex(mmolecule[target_atom_mmolecule_index])

        // H3O
        if (test_number === 1) {
            molecule[target_atom_mmolecule_index][0].should.be.equal("H")
            molecule[target_atom_mmolecule_index][0].slice(4).length.should.be.equal(0)
            // Target atom is a proton and so shouldnt have any electrons.
            target_atom_electron_to_share_index.should.be.equal(false)
        }

        // ClH
        if (test_number === 2) {
            molecule[target_atom_mmolecule_index][0].should.be.equal("H")
            molecule[target_atom_mmolecule_index][0].slice(4).length.should.be.equal(0)
            // Target atom is a proton and so shouldnt have any electrons.
            target_atom_electron_to_share_index.should.be.equal(false)
        }

        // C:OC (nucleophile) ---------> AlCl3 (electrophile)
        if (test_number === 3) {
            target_atom_electron_to_share_index.should.be.equal(false)
        }

        //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
        if (test_number === 4) {
            target_atom_electron_to_share_index.should.be.equal(false) // proton so no electrons
        }

        // [Br-] (nucleophile) -----> carbocation CC[C+]C
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1
        if (test_number === 5) {
            target_atom_electron_to_share_index.should.be.equal(false) // carbocation so no electrons to share

        }

        // Get index of first free electron on source atom
        const source_atom_electron_to_share_index = __electronToShareIndex(mmolecule[source_atom_index])

        // H3O
        if (test_number === 1) {
            target_atom_electron_to_share_index.should.be.equal(false)
            molecule[target_atom_mmolecule_index][0].should.be.equal("H")
            molecule[source_atom_index][0].should.be.equal("O")
            source_atom_electron_to_share_index.should.be.equal(5)
        }

        // HCl
        if (test_number === 2) {
            target_atom_electron_to_share_index.should.be.equal(false)
            molecule[target_atom_mmolecule_index][0].should.be.equal("H")
            molecule[source_atom_index][0].should.be.equal("Cl")
            source_atom_electron_to_share_index.should.be.equal(7)
        }

        // AlCl3 + C:OC
        if (test_number === 3) {
            target_atom_electron_to_share_index.should.be.equal(false)
            molecule[target_atom_mmolecule_index][0].should.be.equal("Al")
            molecule[source_atom_index][0].should.be.equal("O")
            source_atom_electron_to_share_index.should.be.equal(3)       // false
        }

        //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
        if (test_number === 4) {
            target_atom_electron_to_share_index.should.be.equal(false)
            molecule[target_atom_mmolecule_index][0].should.be.equal("H")
            molecule[source_atom_index][0].should.be.equal("C")
            source_atom_electron_to_share_index.should.be.equal(false) // false as double one
        }

        // [Br-] (nucleophile) -----> carbocation CC[C+]C
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1
        if (test_number === 5) {
            target_atom_electron_to_share_index.should.be.equal(false) // carbocation
            molecule[target_atom_mmolecule_index][0].should.be.equal("C")
            molecule[source_atom_index][0].should.be.equal("Br")
            source_atom_electron_to_share_index.should.be.equal(7) // should not be false

        }

        // Get lone pair from source atom (atom arrow would be pointing from (nucleophile))
        const source_atom_lone_pairs = CAtom(molecule[source_atom_index], source_atom_index, molecule).lonePairs(test_number)

        if (test_number === 4) {
            source_atom_lone_pairs.length.should.be.equal(0) // C=C double bond so no lone pairs
        }

        // [Br-] (nucleophile) -----> carbocation CC[C+]C
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1
        if (test_number === 5) {
            source_atom_lone_pairs.length.should.be.equal(8)
            molecule[target_atom_mmolecule_index][0].should.be.equal("C") //[C+]
        }

        // Protons are always target atoms (electrophiles) - where the arrow would be pointing to


        if (molecule[target_atom_mmolecule_index][0]==="H") {

            if (test_number === 5) {
                console.log("SHOULDNT BE HERE - molecule.js")
                process.exit()
            }

            // proton?
            if (molecule[target_atom_mmolecule_index].length===4) {
                // add electrons from source atom to target atom (proton)
                // target atom is a proton and has no electrons

                if (test_number ===1) {
                    source_atom_lone_pairs.length.should.be.equal(4)
                }

                if (test_number ===4) {
                    source_atom_lone_pairs.length.should.be.equal(0)
                }

                if (source_atom_lone_pairs.length > 0) {
                    // mmolecule[target_atom_mmolecule_index] is a proton
                    molecule[target_atom_mmolecule_index].push(source_atom_lone_pairs[0])
                    molecule[target_atom_mmolecule_index].push(source_atom_lone_pairs[1])
                } else {

                    // Does the source atom have a double bond?
                    // returns a set of electrons or false
                    const double_bond = CAtom(molecule[source_atom_index], source_atom_index, molecule).doubleBond(test_number)

                    // remove the double bond by removing electrons from bonded atom (turn into single bond)
                    if (test_number === 4) {
                        double_bond.should.not.be.equal(false)
                        double_bond.length.should.be.equal(4)
                    }

                    if (double_bond) {
                        molecule = CAtom(mmolecule[source_atom_index], source_atom_index, molecule).removeDoubleBond(test_number)
                        molecule[target_atom_mmolecule_index].push(double_bond[0])
                        molecule[target_atom_mmolecule_index].push(double_bond[1])
                    }

                }

            } else {
                console.log("To do: Add hydrogen bond where hydrogen is not a proton")
            }

        } else {

            // Not hydrogen
            // Source atom should always have a lone pair (nucleophile)

            if (test_number === 3) {
                // Target molecule should be AlCl3
                // Source molecule should be COC
                molecule[source_atom_index][0].should.be.equal("O")
                molecule[target_atom_mmolecule_index][0].should.be.equal("Al")
                source_atom_electron_to_share_index.should.be.equal(3)
                target_atom_electron_to_share_index.should.be.equal(false)
            }

            // [Br-] (nucleophile) -----> carbocation CC[C+]C
            // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8 (electrophile)
            // Source atom index should be 1
            if (test_number === 5) {
                molecule[source_atom_index][0].should.be.equal("Br")
                molecule[target_atom_mmolecule_index][0].should.be.equal("C")
                source_atom_electron_to_share_index.should.be.equal(7)
                target_atom_electron_to_share_index.should.be.equal(false)
            }

            if (!target_atom_electron_to_share_index) {

                // Target atom has no free electrons so check if it has free slots ie that
                // the target atom has un unfillec valence shell
                // electrophile
                // free slots is a number
                const free_slots = CAtom(molecule[target_atom_mmolecule_index], target_atom_mmolecule_index,  molecule).freeSlots(test_number)

                // [Br-] (nucleophile) -----> carbocation CC[C+]C
                // Br atom should bond to carbon that has three bonds
                // Target atom index should be 8 (electrophile)
                // Source atom index should be 1
                if (test_number === 5) {
                    free_slots.should.be.equal(0)
                }


                if (free_slots > 0) {

                    // add free electron from source atom to target atom
                    // mmolecule[target_atom_mmolecule_index].push(free_slots[0])
                    // add another free electron from source atom to target atom
                    // mmolecule[target_atom_mmolecule_index].push(free_slots[1])

                    // add free electron from source atom to target atom
                    molecule[target_atom_mmolecule_index].push(molecule[source_atom_index][4 + source_atom_electron_to_share_index])
                    // add another free electron from source atom to target atom
                    molecule[target_atom_mmolecule_index].push(molecule[source_atom_index][5 + source_atom_electron_to_share_index])


                    // test for bond
                    // [Br-] (nucleophile) -----> carbocation CC[C+]C
                    // Br atom should bond to carbon that has three bonds
                    // Target atom index should be 8 (electrophile)
                    // Source atom index should be 1
                    if (test_number === 5) {
                        Set().intersection(molecule[target_atom_mmolecule_index].slice(4), molecule[source_atom_index].slice(4)).length.should.be.equal(4444)

                    }



                }

            } else {

                if (test_number === 5) {
                    console.log("SHOULDNT BE HERE 2 - molecule.js")
                    process.exit()
                }

                // add shared electron from target atom to source atom
                molecule[source_atom_index].push(molecule[target_atom_mmolecule_index][4 + target_atom_electron_to_share_index])

                // add shared electron from atom being pushed to target atom
                // test 5 - atom_to_push_molecule_index is undefined
                molecule[target_atom_mmolecule_index].push(molecule[atom_to_push_molecule_index][5 + source_atom_electron_to_share_index])



            }
        }

        molecule[0] = pKa(molecule.slice(1))

        if (test_number === 1) {
            molecule[0].should.be.equal(-1.74)
        }

        if (test_number === 2) {
            molecule[0].should.be.equal(-6.3)
        }

        if (test_number === 3) {
            molecule.length.should.be.equal(14)
            molecule[1][0].should.be.equal("H")
            molecule[2][0].should.be.equal("H")
            molecule[3][0].should.be.equal("H")
            molecule[4][0].should.be.equal("C")
        }

        //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
        if (test_number === 4) {
            mmolecule.length.should.be.equal(14)
            mmolecule[1][0].should.be.equal("H")
            mmolecule[2][0].should.be.equal("H")
            mmolecule[3][0].should.be.equal("H")
            mmolecule[4][0].should.be.equal("C")
        }

        // Check there is a bond between nucleophile atom (source) and electrophile atom (target)
        if (test_number ===4 ) {
            
        }
        if (test_number !==5) {

        } else {
            
        }

        return mmolecule

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

        const valence_electrons = atom.slice(4).filter(
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
        indexOf : (atom_or_atomic_symbol, include_carbons, verbose) => {

            const molecule = mmolecule[0] // mmolecule[1] is the number of units
            
            if (verbose) {
                console.log("Controllers/Molecule.js Finding index of ->")
                console.log(atom_or_atomic_symbol)
                console.log("molecule ->")
                console.log(molecule)
            }

            if (atom_or_atomic_symbol === "H" || atom_or_atomic_symbol[0] === "H") {

                if (verbose) {
                    console.log("Controllers/Molecule.js Atom to get index of is hydrogen so getting atoms that have hydrogens")
                }

                // get molecule atoms that have hydrogens, keeping track of hydrogen indexes
                const candidate_atoms = molecule.reduce((carry, current_molecule_atom, index)=>{

                    if (current_molecule_atom[0] !== "H") {
                        if (typeof current_molecule_atom === "number" ) {
                            return carry
                        }

                        if (current_molecule_atom[0] === "C" && (undefined === include_carbons || include_carbons === false)) {
                            return carry // only count hydrogens not bounded to carbons
                        }

                        const current_molecule_atom_valence_electrons = current_molecule_atom.slice(4)

                        // check current atom for hydrogens
                        // find the index of hydrogen atom bonded to the current molecule atom
                        const H_index = molecule.reduce((_carry, _current, _index)=>{
                            if (_current[0] === "H") {
                                const hydrogen_atom = _current
                                const hydrogen_atom_valence_electrons = hydrogen_atom.slice(4)
                                //if (hydrogen_atom_valence_electrons.intersect(current_molecule_atom_valence_electrons)>0) {
                                const array_intersection = hydrogen_atom_valence_electrons.filter(function(x) {
                                    // checking second array contains the element "x"
                                    if(current_molecule_atom_valence_electrons.indexOf(x) != -1)
                                        return true;
                                    else
                                        return false;
                                });
                                if (array_intersection.length>0) {
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

                if (verbose) {
                    console.log("Controllers/Molecule.js Candidate atoms ->")
                    console.log(candidate_atoms)
                    console.log("molecule ->")
                    console.log(molecule)
                }

                // check for oxygen atom and if found return the index of hydrogen atom bonded to the oxygen atom
                const o = candidate_atoms.filter((candidate_atom)=>{
                    return candidate_atom[0]==="O"
                })

                if (o.length>0) {
                    if (verbose) {
                        console.log("Controllers/Molecule.js Returning index of oxygen atom ->")
                        console.log(o[0][1])
                        console.log("molecule ->")
                        console.log(molecule)
                    }
                    return o[0][1]
                }

                if (candidate_atoms.length === 0) {
                    if (verbose) {
                        console.log("Controllers/Molecule.js Atom index not found so returning false")
                    }
                    return false;
                }

                if (verbose) {
                    console.log("Controllers/Molecule.js Returning atom index ->")
                    console.log(candidate_atoms[0][1])
                    console.log("molecule ->")
                    console.log(molecule)
                }
                return candidate_atoms[0][1]

            }
            else { // we are not looking for hydrogen atom
                if (typeof atom_or_atomic_symbol === "string") {
                    // find index of atom in molecule with matching atomic symbol
                    const i = molecule.reduce((carry, current, index)=>{
                        return typeof current.length === "number" && current[0] === atom_or_atomic_symbol?index:carry
                    }, false)
                    if (verbose) {
                        console.log("Controllers/Molecule.js Returning atom index not hydrogen ->")
                        console.log(i)
                        console.log("molecule ->")
                        console.log(molecule)
                    }
                    return i
                } else {
                    const i = molecule.search(atom_or_atomic_symbol)
                    if (verbose) {
                        console.log("Controllers/Molecule.jss Returning atom index not hydrogen ->")
                        console.log(i)
                        console.log("molecule ->")
                        console.log(molecule)
                    }
                    return i
                }
            }
        },
        push : (atoms_or_atomic_symbols, container, target_molecule_index, test_number, target_atom_index, source_atom_index) => {

            const molecule = mmolecule[0] // mmolecule[1] is the number of units
            // atoms_or_atomic_symbols are atoms from electrophile
            // mmolecule is the nucleophile


            // MOLECULE MODEL
// pKa, atom, atom, atom ...
// ATOM MODEL
// atomic symbol, proton count, valence count, std number of bonds, velectron1, velectron2, velectron3

            // atoms_or_atomic symbols is an array containing the atom we are
            // pushing and the atoms linked to that atom
            // atom_index is the index of the atom we are pushing

            //  C:OC (nucleohile) ----> AlCl2 (electrophile) (target)
            // atoms_or_atomic_symbols AlCl3
            if (test_number === 3) {
                atoms_or_atomic_symbols.length.should.be.equal(4) // AlCl3
                mmolecule.length.should.be.equal(10) // COC (nucleophile)
                target_molecule_index.should.be.equal(0)
                target_atom_index.should.be.equal(1)
                atoms_or_atomic_symbols[target_atom_index -1][0].should.be.equal("Al")
            }

            //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
            // atoms_or_atomic_symbols HBr
            /*
[ [ 'H', 1, 1, 1, '1y5g42jkkahi190y', '1y5g42jkkahi190i' ], 1
[ 'H', 1, 1, 1, '1y5g42jkkahi190z', '1y5g42jkkahi190j' ], 2
[ 'H', 1, 1, 1, '1y5g42jkkahi1910', '1y5g42jkkahi190k' ], 3
[ 'C', 4, 6, 4, 4, '1y5g42jkkahi190i', '1y5g42jkkahi190j', '1y5g42jkkahi190k','1y5g42jkkahi190l'
,'1y5g42jkkahi190p','1y5g42jkkahi190y','1y5g42jkkahi190z', '1y5g42jkkahi1910' ],
[ 'H', 1, 1, 1, '1y5g42jkkahi1911', '1y5g42jkkahi190m' ], 5
[ 'C', 6,  4, 4,'1y5g42jkkahi190m','1y5g42jkkahi190n','1y5g42jkkahi190o', 6
'1y5g42jkkahi190p', '1y5g42jkkahi190l', '1y5g42jkkahi190t','1y5g42jkkahi190s', '1y5g42jkkahi1911' ],
[ 'H', 1, 1, 1, '1y5g42jkkahi1912', '1y5g42jkkahi190q' ], 7
[ 'C', 6, 4, 4, '1y5g42jkkahi190q','1y5g42jkkahi190r', '1y5g42jkkahi190s',
'1y5g42jkkahi190t', '1y5g42jkkahi190o','1y5g42jkkahi190n','1y5g42jkkahi190x',
'1y5g42jkkahi1912' ], 8
[ 'H', 1, 1, 1, '1y5g42jkkahi1913', '1y5g42jkkahi190u' ], 9
[ 'H', 1, 1, 1, '1y5g42jkkahi1914', '1y5g42jkkahi190v' ], 10
[ 'H', 1, 1, 1, '1y5g42jkkahi1915', '1y5g42jkkahi190w' ], 11
[ 'C', 6,4,4, '1y5g42jkkahi190u','1y5g42jkkahi190v','1y5g42jkkahi190w',
'1y5g42jkkahi190x','1y5g42jkkahi190r', '1y5g42jkkahi1913','1y5g42jkkahi1914',
'1y5g42jkkahi1915' ] 12
[ 'H', 1, 1, 1, '864335', '785456' ], 13
]
 */

            atoms_or_atomic_symbols.should.be.an.Array()
            // H+ (electrophile) <---------- H2O (nucleophile)
            if (test_number === 1) {
                atoms_or_atomic_symbols.length.should.be.equal(1)  // proton
                atoms_or_atomic_symbols[0][0].should.be.equal("H")
                atoms_or_atomic_symbols[0].length.should.be.equal(4)
                target_atom_index.should.be.equal(1)
            }


            // [Br-] (nucleophile) -----> carbocation CC[C+]C
            // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8 (electrophile)
            // Source atom index should be 1
            if (test_number === 5) {
                atoms_or_atomic_symbols.length.should.be.equal(13)  // CC[C+]C
                atoms_or_atomic_symbols[0][0].should.be.equal("H")
                atoms_or_atomic_symbols[0].length.should.be.equal(6)
                target_atom_index.should.be.equal(8)
            }

            const atoms = atoms_or_atomic_symbols.map(
                (atom_or_atomic_symbol) => {
                    return typeof atom_or_atomic_symbol === "string" ? AtomFactory(atom_or_atomic_symbol) : atom_or_atomic_symbol
                }
            )

            if (test_number===1) {
                const atom_is_proton = atoms[0][0] === "H" && atoms[0].length ===4
                atom_is_proton.should.be.equal(true)
                // H2O
                // mmolecue should be water
                mmolecule.length.should.be.equal(4)
                mmolecule[3][0].should.be.equal("O")
                mmolecule[2][0].should.be.equal("H")
                mmolecule[1][0].should.be.equal("H")
                target_molecule_index.should.be.equal(2)
            }

            //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
            if (test_number===4) {
                const atom_is_proton = atoms[0][0] === "H" && atoms[0].length ===4
                atom_is_proton.should.be.equal(true)
                mmolecule.length.should.be.equal(13)
                target_molecule_index.should.be.equal(2) // index of electrophile in container
            }

            // [Br-] (nucleophile) -----> carbocation CC[C+]C
            // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8 (electrophile)
            // Source atom index should be 1
            if (test_number === 5) {
                const atom_is_proton = atoms[0][0] === "H" && atoms[0].length ===4 // H
                atom_is_proton.should.be.equal(false)
                mmolecule.length.should.be.equal(2) // Br
            }

            if (undefined === source_atom_index) {
                source_atom_index = determineNucleophileIndex(test_number)
                if(test_number === 1) {
                    source_atom_index.should.be.equal(3) // Oxygen atom on H2O
                }
            }

            if(test_number === 1) {
                // Note at this point we have removed the proton from HCl
                // We are pushing a proton to H2O
                source_atom_index.should.be.equal(3) // Should be 3
            }

            //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
            /*
        [ [ 'H', 1, 1, 1, '1y5g42jkkahi190y', '1y5g42jkkahi190i' ], 1
  [ 'H', 1, 1, 1, '1y5g42jkkahi190z', '1y5g42jkkahi190j' ], 2
  [ 'H', 1, 1, 1, '1y5g42jkkahi1910', '1y5g42jkkahi190k' ], 3
  [ 'C', 4, 6, 4, 4, '1y5g42jkkahi190i', '1y5g42jkkahi190j', '1y5g42jkkahi190k','1y5g42jkkahi190l'
  ,'1y5g42jkkahi190p','1y5g42jkkahi190y','1y5g42jkkahi190z', '1y5g42jkkahi1910' ],
  [ 'H', 1, 1, 1, '1y5g42jkkahi1911', '1y5g42jkkahi190m' ], 5
  [ 'C', 6,  4, 4,'1y5g42jkkahi190m','1y5g42jkkahi190n','1y5g42jkkahi190o', 6
    '1y5g42jkkahi190p', '1y5g42jkkahi190l', '1y5g42jkkahi190t','1y5g42jkkahi190s', '1y5g42jkkahi1911' ],
  [ 'H', 1, 1, 1, '1y5g42jkkahi1912', '1y5g42jkkahi190q' ], 7
  [ 'C', 6, 4, 4, '1y5g42jkkahi190q','1y5g42jkkahi190r', '1y5g42jkkahi190s',
    '1y5g42jkkahi190t', '1y5g42jkkahi190o','1y5g42jkkahi190n','1y5g42jkkahi190x',
    '1y5g42jkkahi1912' ], 8
  [ 'H', 1, 1, 1, '1y5g42jkkahi1913', '1y5g42jkkahi190u' ], 9
  [ 'H', 1, 1, 1, '1y5g42jkkahi1914', '1y5g42jkkahi190v' ], 10
  [ 'H', 1, 1, 1, '1y5g42jkkahi1915', '1y5g42jkkahi190w' ], 11
  [ 'C', 6,4,4, '1y5g42jkkahi190u','1y5g42jkkahi190v','1y5g42jkkahi190w',
    '1y5g42jkkahi190x','1y5g42jkkahi190r', '1y5g42jkkahi1913','1y5g42jkkahi1914',
    '1y5g42jkkahi1915' ] 12
      [ 'H', 1, 1, 1, '864335', '785456' ], 13
    ]
         */
            if(test_number === 4) {
                // double check 5???
                source_atom_index.should.be.equal(6) // carbon on double bond

            }

            // [Br-] (nucleophile) -----> carbocation CC[C+]C
            // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8 (electrophile)
            // Source atom index should be 1
            if (test_number === 5) {
                source_atom_index.should.be.equal(1) // Br
            }

            if (source_atom_index !== false) {
                if(test_number === 4) {
                    // atoms
                    // [ [ 'H', 1, 1, 1 ] ]
                    // mmolecule
                    /*
                    [ 12345,
  [ 'H', 1, 1, 1, '26f114qhkavwca5i', '26f114qhkavwca52' ],
  [ 'H', 1, 1, 1, '26f114qhkavwca5j', '26f114qhkavwca53' ],
  [ 'H', 1, 1, 1, '26f114qhkavwca5k', '26f114qhkavwca54' ],
  [ 'C',
    6,
    4,
    4,
    '26f114qhkavwca52',
    '26f114qhkavwca53',
    '26f114qhkavwca54',
    '26f114qhkavwca55',
    '26f114qhkavwca59',
    '26f114qhkavwca5i',
    '26f114qhkavwca5j',
    '26f114qhkavwca5k' ],
  [ 'H', 1, 1, 1, '26f114qhkavwca5l', '26f114qhkavwca56' ],
  [ 'C',
    6,
    4,
    4,
    '26f114qhkavwca56',
    '26f114qhkavwca57',
    '26f114qhkavwca58',
    '26f114qhkavwca59',
    '26f114qhkavwca55',
    '26f114qhkavwca5d',
    '26f114qhkavwca5c',
    '26f114qhkavwca5l' ],
  [ 'H', 1, 1, 1, '26f114qhkavwca5m', '26f114qhkavwca5a' ],
  [ 'C',
    6,
    4,
    4,
    '26f114qhkavwca5a',
    '26f114qhkavwca5b',
    '26f114qhkavwca5c',
    '26f114qhkavwca5d',
    '26f114qhkavwca58',
    '26f114qhkavwca57',
    '26f114qhkavwca5h',
    '26f114qhkavwca5m' ],
  [ 'H', 1, 1, 1, '26f114qhkavwca5n', '26f114qhkavwca5e' ],
  [ 'H', 1, 1, 1, '26f114qhkavwca5o', '26f114qhkavwca5f' ],
  [ 'H', 1, 1, 1, '26f114qhkavwca5p', '26f114qhkavwca5g' ],
  [ 'C',
    6,
    4,
    4,
    '26f114qhkavwca5e',
    '26f114qhkavwca5f',
    '26f114qhkavwca5g',
    '26f114qhkavwca5h',
    '26f114qhkavwca5b',
    '26f114qhkavwca5n',
    '26f114qhkavwca5o',
    '26f114qhkavwca5p' ] ]

                     */
                    // source_atom_index 6 = Carbon on double bond
                    // target_atom_index 1 = H
                }

                // [Br-] (nucleophile) -----> carbocation CC[C+]C
                // Br atom should bond to carbon that has three bonds
                // Target atom index should be 8 (electrophile)
                // Source atom index should be 1
                if (test_number === 5) {
                    target_atom_index.should.be.equal(8) // [C+]
                }
                // returns container
                return __makeCovalentBond(container, source_molecule_index, target_molecule_index, source_atom_index, target_atom_index, test_number) // return molecule
            }

            molecule[0] = pKa(molecule.slice(1))

            return molecule
        },
        remove : (container, molecule_index, atom_or_atomic_symbol) => {

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
                atom_index = mmolecule.reduce((carry, current, index)=>{
                    return typeof current !== "string" && typeof current.length === "number" && current[0] === atom_or_atomic_symbol?index:carry
                }, false)
                atom = AtomFactory(atom_or_atomic_symbol)
            } else {
                atom_index =  mmolecule.indexOf(atom_or_atomic_symbol)
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

            if (bond_count===0) {
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

            const electron = mmolecule[atom_index][4+electron_to_remove_index]
            electron.should.be.a.String()

            if (mmolecule[atom_index][0]==='H') {
                mmolecule[atom_index].splice(4)
            } else {
                mmolecule[atom_index].splice(4 + electron_to_remove_index, 1)
            }

            const bonded_atom_index = mmolecule.reduce((carry, current_molecule_atom, index)=>{
                //electron is a string
                if (typeof current_molecule_atom === 'number') {
                    return carry
                }
                return typeof current_molecule_atom !== "string" && typeof current_molecule_atom.length === "number" && current_molecule_atom.indexOf(electron) !== false
                    ?index:carry
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

            mmolecule.splice(atom_index,1)


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
        itemAt : (index) => {
            // mmolecule[item]
            return mmolecule[index]
        },
        bondCount : _bondCount,
        lonePairs: (atom, current_atom_index) => {
            return CAtom(atom, current_atom_index, mmolecule).lonePairs()
        },
        atomsWithFreeSlots: __atomsWithFreeSlots,
        nucleophileIndex: determineNucleophileIndex,
        electrophileIndex: determineElectrophileIndex,
        removeProton: (container, molecule_index, atom_or_atomic_symbol, test_number, verbose) => {

             // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
         /*   
        container = MoleculeController(electrophile_molecule).removeProton(
            container,
            electrophile_molecule_index,
            MoleculeController(electrophile_molecule).itemAt(proton_index),
            test_number,
            verbose
        )
        */
            
            if (verbose) {
                console.log('Controllers/Molecle.js removeProton()')
                console.log("Container: ->")
                console.log(container)
                console.log("mmolecule-->")
                console.log(mmolecule) // H2O
                console.log("Molecule index ->")
                console.log(molecule_index)
                console.log("Atom or atomic symbol")
                console.log(atom_or_atomic_symbol)
                console.log("Test number")
                console.log(test_number)
                /*
                Controllers/Molecle.js removeProton()
Container: ->
[ false,
  [ 12345,
    [ 'H', 1, 1, 1, 'bqdtz0hsckdkzprx7', 'bqdtz0hsckdkzprwv' ],
    [ 'H', 1, 1, 1, 'bqdtz0hsckdkzprx8', 'bqdtz0hsckdkzprww' ],
    [ 'H', 1, 1, 1, 'bqdtz0hsckdkzprx9', 'bqdtz0hsckdkzprwx' ],
    [ 'C',
      6,
      4,
      4,
      'bqdtz0hsckdkzprwv',
      'bqdtz0hsckdkzprww',
      'bqdtz0hsckdkzprwx',
      'bqdtz0hsckdkzprwy',
      'bqdtz0hsckdkzprx2',
      'bqdtz0hsckdkzprx7',
      'bqdtz0hsckdkzprx8',
      'bqdtz0hsckdkzprx9' ],
    [ 'H', 1, 1, 1, 'bqdtz0hsckdkzprxa', 'bqdtz0hsckdkzprwz' ],
    [ 'C',
      6,
      4,
      4,
      'bqdtz0hsckdkzprwz',
      'bqdtz0hsckdkzprx0',
      'bqdtz0hsckdkzprx1',
      'bqdtz0hsckdkzprx2',
      'bqdtz0hsckdkzprwy',
      'bqdtz0hsckdkzprx6',
      'bqdtz0hsckdkzprx5',
      'bqdtz0hsckdkzprxa' ],
    [ 'H', 1, 1, 1, 'bqdtz0hsckdkzprxb', 'bqdtz0hsckdkzprx3' ],
    [ 'H', 1, 1, 1, 'bqdtz0hsckdkzprxc', 'bqdtz0hsckdkzprx4' ],
    [ 'C',
      6,
      4,
      4,
      'bqdtz0hsckdkzprx3',
      'bqdtz0hsckdkzprx4',
      'bqdtz0hsckdkzprx5',
      'bqdtz0hsckdkzprx6',
      'bqdtz0hsckdkzprx1',
      'bqdtz0hsckdkzprx0',
      'bqdtz0hsckdkzprxb',
      'bqdtz0hsckdkzprxc' ] ] ]
Molecule index ->
2
Atom or atomic symbol
[ 'H', 1, 1, 1, 'bqdtz0hsckdkzprwr', 'bqdtz0hsckdkzprwj' ]
Test number
6

                 */
            }

            var test_mode = false
            var test_mode_2 = false

            if (undefined !== container[1][2] && container[1][2][0] === "Cl" && container[2][3][0] === "O") {
                test_mode = true
            }

            if (container[1][1][0] === "Cl") {
                test_mode_2 = true
            }

            if (test_number === 1) {
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
                atom_index = mmolecule.reduce((carry, current, index)=>{
                    return typeof current !== "string" && typeof current.length === "number" && current[0] === atom_or_atomic_symbol?index:carry
                }, false)
                atom = AtomFactory(atom_or_atomic_symbol)
            } else {
                atom_index =  mmolecule.indexOf(atom_or_atomic_symbol)
                atom = atom_or_atomic_symbol
            }

            if (test_mode) {
                atom_index.should.be.equal(1)
            }

            if (test_mode_2) {
                atom_index.should.be.equal(4)
            }

            if (atom_index === false) {
                return container
            }

            // Hydrogen atom from HCl
            const atom_to_remove = mmolecule[atom_index]
            if (test_mode) {
                atom_to_remove[0].should.be.equal("H")
            }

            const bond_count = _bondCount(atom_to_remove)

            if (test_mode) {
                bond_count.should.be.equal(1)
            }

            if (test_mode_2) {
                bond_count.should.be.equal(1)
            }

            if (bond_count===0) {
                return container
            }

            // Remove all electrons from proton
            mmolecule[atom_index].splice(4)
            mmolecule[atom_index].length.should.be.equal(4)

            // Remove proton from molecule and add it to the container as a new molecule
            const proton = mmolecule[atom_index]
            mmolecule.splice(atom_index, 1)
            container.push([null, proton])

            if (test_mode) {
                mmolecule.length.should.be.equal(2)
            }

            if (test_mode_2) {
                mmolecule.length.should.be.equal(4)
            }

            mmolecule[0] = pKa(mmolecule.slice(1))

            //  container[molecule_index] = mmolecule

            return container

        }
    }
}

module.exports = CMolecule


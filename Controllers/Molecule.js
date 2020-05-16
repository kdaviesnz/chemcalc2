//
const AtomFactory = require('../Models/AtomFactory')
const CAtom = require('./Atom')
const pKa = require('../Models/pKa')
const should = require('should')

const CMolecule = (mmolecule) => {

    const determineElectrophileIndex = (test_number) => {
    
       // Check atoms for free slots
       // returns [index, atom] pairs
       const atoms_with_free_slots = __atomsWithFreeSlots()

        if (test_number ===1){
            console.log(atoms_with_free_slots)
            process.exit()
        }

       if (atoms_with_free_slots.length === 0) {
           return false
       } else {
           return atoms_with_free_slots[0][0] + 1 // take into account pKa value
       }

    }
    
    const determineNucleophileIndex = (test_number) => {

        if (undefined !== test_number && test_number === 1) {
            mmolecule.length.should.be.equal(4)
            mmolecule[3][0].should.be.equal("O")
        }

        const atoms_with_lone_pairs = __atomsWithLonePairs(test_number)

        if (atoms_with_lone_pairs.length === 0) {
           return // Find index of atom to bond to.
                // This must be atom with at least a lone pair.
                return mmolecule.reduce((carry, current_molecule_atom, current_molecule_atom_index) => {
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
           return atoms_with_lone_pairs[0][0] + 1 // take into account pka
        }
        
        
    }
    
    const __atomsWithLonePairs =  (test_number) => {

        if (undefined !== test_number && test_number === 1) {
            mmolecule.length.should.be.equal(4)
            mmolecule[3][0].should.be.equal("O")
        }

        // Check substrate for lone pairs
        const atoms_with_lone_pairs = mmolecule.slice(1).map(
            (atom, index) => {
                if (atom[0] === "H" || CAtom(atom, index, mmolecule).lonePairs().length === 0) {
                    return null
                }
                return [index, atom]
            }
        ).filter(
            (item) => {
                return item !== null
            }
        )

        if (test_number === 3) {
            atoms_with_lone_pairs[0][0].should.be.equal(4)
            atoms_with_lone_pairs[0][1][0].should.be.equal("O")
        }

        return atoms_with_lone_pairs
    }
    
    const __atomsWithFreeSlots = () => {
      // Check substrate for free slots
                return mmolecule.slice(1).map(
                    (atom, index) => {
                        if (CAtom(atom, index,mmolecule).freeSlots() === 0 ) {
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
        const shared_electrons =  mmolecule.filter(
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
    const _makeCovalentBond = (atoms, source_atom_index, test_number, target_atom_index) => {

        if (test_number === 1) {

        }
        const atom_to_push_molecule_index = mmolecule.length + atom_to_push_index -1
        if (test_number === 1) {
            // Proton is our electrophile
            // H2O is our nucleophile
            console.log(mmolecule.length.should.be.equal(4))
            console.log(mmolecule[1][0].should.be.equal("H"))
            console.log(atom_to_push_molecule_index)
            console.log(atom_to_push_index)
            console.log(atom_to_push_index)
            // atoms [[proton]]
            // mmolecule H2O
            atom_to_push_molecule_index.should.be.equal(3)
        }

        if (test_number === 3) {
            atom_to_push_molecule_index.should.be.equal(11)
            mmolecule[atom_to_push_molecule_index][0].should.be.equal("Al")
        }

        if (test_number === 1) {
            mmolecule.length.should.be.equal(4)
            mmolecule[1][0].should.be.equal("H")
            mmolecule[2][0].should.be.equal("H")
            mmolecule[3][0].should.be.equal("O")
        }

        // AlCl3 <- C:OC
        if (test_number === 3) {
            atoms.length.should.be.equal(4) // AlCl3
            mmolecule.length.should.be.equal(10) // COC
            atom_to_push_index.should.be.equal(1) // Al on AlCl3
        }

        // Add atoms to molecule.
        // At this point main atom won't be bonded.
        atoms.map(
            (atom) => {
                mmolecule.push(atom)
                return atom
            }
        )

        if (test_number === 1) {
            mmolecule.length.should.be.equal(5)
            mmolecule[1][0].should.be.equal("H")
            mmolecule[2][0].should.be.equal("H")
            mmolecule[3][0].should.be.equal("O")
            mmolecule[4][0].should.be.equal("H")
        }

        if (test_number === 3) {
            mmolecule.length.should.be.equal(14)
            mmolecule[1][0].should.be.equal("H")
            mmolecule[2][0].should.be.equal("H")
            mmolecule[3][0].should.be.equal("H")
            mmolecule[4][0].should.be.equal("C")
        }

        // Now create the bond
        
/*
In the molecule H2, the hydrogen atoms share the two electrons via covalent bonding.[7] Covalency is greatest between atoms of similar electronegativities. Thus, covalent bonding does not necessarily require that the two atoms be of the same elements, only that they be of comparable electronegativity. Covalent bonding that entails sharing of electrons over more than two atoms is said to be delocalized.
 */
        // Get index of first free electron on atom being pushed

        if (undefined === mmolecule[atom_to_push_molecule_index]) {
            console.log("mmolecule[atom_to_push_molecule_index] is undefined")
            console.log(mmolecule)
            console.log(atom_to_push_molecule_index)
            console.log("Molecule.js")
            /*
            [ -3.5,
  [ 'H', 1, 1, 1, '2iwcg1s83ka7siwd1', '2iwcg1s83ka7siwcn' ],
  [ 'H', 1, 1, 1, '2iwcg1s83ka7siwd2', '2iwcg1s83ka7siwco' ],
  [ 'H', 1, 1, 1, '2iwcg1s83ka7siwd3', '2iwcg1s83ka7siwcp' ],
  [ 'C',
    6,
    4,
    4,
    '2iwcg1s83ka7siwcn',
    '2iwcg1s83ka7siwco',
    '2iwcg1s83ka7siwcp',
    '2iwcg1s83ka7siwcq',
    '2iwcg1s83ka7siwcw',
    '2iwcg1s83ka7siwd1',
    '2iwcg1s83ka7siwd2',
    '2iwcg1s83ka7siwd3' ],
  [ 'O',
    8,
    6,
    2,
    '2iwcg1s83ka7siwcr',
    '2iwcg1s83ka7siwcs',
    '2iwcg1s83ka7siwct',
    '2iwcg1s83ka7siwcu',
    '2iwcg1s83ka7siwcv',
    '2iwcg1s83ka7siwcw',
    '2iwcg1s83ka7siwcq',
    '2iwcg1s83ka7siwd0' ],
  [ 'H', 1, 1, 1, '2iwcg1s83ka7siwd4', '2iwcg1s83ka7siwcx' ],
  [ 'H', 1, 1, 1, '2iwcg1s83ka7siwd5', '2iwcg1s83ka7siwcy' ],
  [ 'H', 1, 1, 1, '2iwcg1s83ka7siwd6', '2iwcg1s83ka7siwcz' ],
  [ 'C',
    6,
    4,
    4,
    '2iwcg1s83ka7siwcx',
    '2iwcg1s83ka7siwcy',
    '2iwcg1s83ka7siwcz',
    '2iwcg1s83ka7siwd0',
    '2iwcg1s83ka7siwcv',
    '2iwcg1s83ka7siwd4',
    '2iwcg1s83ka7siwd5',
    '2iwcg1s83ka7siwd6' ],
  [ 'Al',
    13,
    3,
    3,
    '2iwcg1s83ka7siwbz',
    '2iwcg1s83ka7siwc0',
    '2iwcg1s83ka7siwc1',
    '2iwcg1s83ka7siwc8',
    '2iwcg1s83ka7siwcf',
    '2iwcg1s83ka7siwcm' ],
  [ 'Cl',
    17,
    7,
    1,
    '2iwcg1s83ka7siwc2',
    '2iwcg1s83ka7siwc3',
    '2iwcg1s83ka7siwc4',
    '2iwcg1s83ka7siwc5',
    '2iwcg1s83ka7siwc6',
    '2iwcg1s83ka7siwc7',
    '2iwcg1s83ka7siwc8',
    '2iwcg1s83ka7siwc1' ],
  [ 'Cl',
    17,
    7,
    1,
    '2iwcg1s83ka7siwc9',
    '2iwcg1s83ka7siwca',
    '2iwcg1s83ka7siwcb',
    '2iwcg1s83ka7siwcc',
    '2iwcg1s83ka7siwcd',
    '2iwcg1s83ka7siwce',
    '2iwcg1s83ka7siwcf',
    '2iwcg1s83ka7siwc0' ],
  [ 'Cl',
    17,
    7,
    1,
    '2iwcg1s83ka7siwcg',
    '2iwcg1s83ka7siwch',
    '2iwcg1s83ka7siwci',
    '2iwcg1s83ka7siwcj',
    '2iwcg1s83ka7siwck',
    '2iwcg1s83ka7siwcl',
    '2iwcg1s83ka7siwcm',
    '2iwcg1s83ka7siwbz' ] ]
14
Molecule.js

             */
            process.exit()
        }

        const atom_to_push_electron_to_share_index = __electronToShareIndex(mmolecule[atom_to_push_molecule_index])
        if (test_number === 1) {
            atom_to_push_electron_to_share_index.should.be.equal(false)
        }
        
        // AlCl3 <- C:OC
        if (test_number === 3) {
            atom_to_push_electron_to_share_index.should.be.equal(2)
        }

        // Get index of first free electron on atom being pushed to
        const atom_being_being_pushed_to_electron_to_share_index = __electronToShareIndex(mmolecule[atom_to_push_to_index])
        
        
        if (test_number === 1) {
            atom_being_being_pushed_to_electron_to_share_index.should.be.equal(5)
            mmolecule[atom_to_push_molecule_index][0].should.be.equal("H")
        }

        // AlCl3 <- C:OC
        if (test_number === 3) {
            atom_being_being_pushed_to_electron_to_share_index.should.be.equal(false)
            mmolecule[atom_to_push_molecule_index][0].should.be.equal("Al")
        }
        

        if (mmolecule[atom_to_push_molecule_index][0]==="H") {

            // proton?
            if (mmolecule[atom_to_push_molecule_index].length===4) {
                // add electrons from second_atom to atom we are pushing
                mmolecule[atom_to_push_molecule_index].push(mmolecule[atom_to_push_to_index][4 + atom_being_being_pushed_to_electron_to_share_index -1])
                // @todo needs checking
                const atom2_electron_to_share_next_index = __electronToShareIndex(mmolecule[atom_to_push_to_index]) + 1
                if (test_number ===1) {
                    atom2_electron_to_share_next_index.should.be.equal(6)
                }
                mmolecule[atom_to_push_molecule_index].push(mmolecule[atom_to_push_to_index][4 + atom2_electron_to_share_next_index -1])
            } else {
                console.log("To do: Add hydrogen bond where hydrogen is not a proton")
            }

            // add shared electron from second_atom to first atom
           // mmolecule[atom1_index].push(mmolecule[atom2_index][4 + atom2_electron_to_share_next_index -1])

            // add shared electron from second atom to first atom
           // mmolecule[atom1_index].push(mmolecule[atom2_index][4 + atom2_electron_to_share_index])

        } else {

            // Not hydrogen
            
            // Atom being pushed should always have a lone pair
            
            if (test_number === 3) {
                atom_to_push_electron_to_share_index.should.be.equal(9999)
                atom_being_being_pushed_to_electron_to_share_index.should.be.equal(false)
            }
            
            if (!atom_being_being_pushed_to_electron_to_share_index) {
                // Atom being pushed to has no free electrons so check if it has free slots.
                if (CAtom(mmolecule[atom_to_push_molecule_index], null, null).freeSlots.length > 0) {
                    // add free electron from atom beng pushed to target atom
                    mmolecule[atom_to_push_to_index].push(mmolecule[atom_to_push_molecule_index][4 + atom_to_push_electron_to_share_index])
                    // add another free electron from atom beng pushed to target atom
                    mmolecule[atom_to_push_to_index].push(mmolecule[atom_to_push_molecule_index][5 + atom_to_push_electron_to_share_index])

                }
            } else {
            
                // add shared electron from target atom to atom beng pushed
                mmolecule[atom_to_push_molecule_index].push(mmolecule[atom_to_push_to_index][4 + atom_being_being_pushed_to_electron_to_share_index])

                // add shared electron from atom being pushed to target atom
                mmolecule[atom_to_push_to_index].push(mmolecule[atom_to_push_molecule_index][4 + atom_to_push_electron_to_share_index])

            }
        }

        mmolecule[0] = pKa(mmolecule.slice(1))

        if (test_number === 1) {
            mmolecule[0].should.be.equal(-1.74)
        }
        
        if (test_number === 3) {
            mmolecule.length.should.be.equal(14)
            mmolecule[1][0].should.be.equal("H")
            mmolecule[2][0].should.be.equal("H")
            mmolecule[3][0].should.be.equal("O")
            mmolecule[4][0].should.be.equal("H")
        }

        return mmolecule

    }

    const _bondCount = (atom) => {

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
                const shared =  mmolecule.reduce(
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
        indexOf : (atom_or_atomic_symbol, include_carbons) => {
            if (atom_or_atomic_symbol === "H" || atom_or_atomic_symbol[0] === "H") {
                // get molecule atoms that have hydrogens, keeping track of hydrogen indexes
                const candidate_atoms = mmolecule.reduce((carry, current_molecule_atom, index)=>{


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
                        const H_index = mmolecule.reduce((_carry, _current, _index)=>{
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
                /*


                 */
                // check for oxygen atom and if found return the index of hydrogen atom bonded to the oxygen atom
                const o = candidate_atoms.filter((candidate_atom)=>{
                    return candidate_atom[0]==="O"
                })
                if (o.length>0) {
                    return o[0][1]
                }
                /*
                 */
                if (undefined === candidate_atoms[0] ) {

                }

                if (candidate_atoms.length === 0) {
                    return false;
                }
                return candidate_atoms[0][1]
            }
            else { // we are not looking for hydrogen atom
                if (typeof atom_or_atomic_symbol === "string") {
                    // find index of atom in molecule with matching atomic symbol
                    return mmolecule.reduce((carry, current, index)=>{
                        return typeof current.length === "number" && current[0] === atom_or_atomic_symbol?index:carry
                    }, false)
                } else {
                    return mmolecule.search(atom_or_atomic_symbol)
                }
            }
        },
        push : (atoms_or_atomic_symbols, container, molecule_to_add_to_index, test_number, atom_to_push_index, atom_to_bond_to_index) => {


            // MOLECULE MODEL
// pKa, atom, atom, atom ...
// ATOM MODEL
// atomic symbol, proton count, valence count, std number of bonds, velectron1, velectron2, velectron3

            // atoms_or_atomic symbols is an array containing the atom we are
            // pushing and the atoms linked to that atom
            // atom_index is the index of the atom we are pushing

            // AlCl3 <- C:OC
            if (test_number === 3) {
                atoms_or_atomic_symbols.length.should.be.equal(4) // AlCl3
                mmolecule.length.should.be.equal(10) // COC (nucleophile)
                molecule_to_add_to_index.should.be.equal(1) 
                atom_to_push_index.should.be.equal(1)
                atoms_or_atomic_symbols[atom_to_push_index][0].should.be.equal("Al")
            }
            
            atoms_or_atomic_symbols.should.be.an.Array()
            if (test_number === 1) {
                atoms_or_atomic_symbols.length.should.be.equal(1)  // proton
                atoms_or_atomic_symbols[0][0].should.be.equal("H")
                atoms_or_atomic_symbols[0].length.should.be.equal(4)
                atom_to_push_index.should.be.equal(0)
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
                molecule_to_add_to_index.should.be.equal(2)
            }

            if (undefined === atom_to_bond_to_index) {
                atom_to_bond_to_index = determineNucleophileIndex(test_number)
                if(test_number === 1) {
                    atom_to_bond_to_index.should.be.equal(3) // Oxygen atom on H2O
                }
            } 

            if(test_number === 1) {
                // Note at this point we have removed the proton from HCl
                // We are pushing a proton to H2O
                //console.log(container) // [false, [2.86, [Cl...]], [2.86, [14, [H],[H],[O]...]
                //console.log(mmolecule) //H2O
                // console.log(mmolecule[3]) // Oxygen atom
                atom_to_bond_to_index.should.be.equal(3) // Should be 3
            }

            if (atom_to_bond_to_index !== false) {

                 if(test_number === 3) {
                     atom_to_bond_to_index.should.be.equal(5) // oxygen atom on COC
                     mmolecule[atom_to_bond_to_index][0].should.be.equal("Al")
                     atom_to_push_index.should.be.equal(1) // // Al atom on AlCl3
                 }
                
                return _makeCovalentBond(atoms, atom_to_bond_to_index, test_number, atom_to_push_index) // return molecule

                // push electron
                // AtomController(atom).push(mmolecule[atom_to_bond_to_index])
                // atom.push(mmolecule[atom_to_bond_to_index][mmolecule[atom_to_bond_to_index].length - 1])
                
               // mmolecule[atom_to_bond_to_index].push(atom[atom.length - 2])
                // AtomController(mmolecule[atom_to_bond_to_index]).push(atom)
                
               // mmolecule.push(atom)


            }
            
            mmolecule[0] = pKa(mmolecule.slice(1))
            
            return mmolecule
        },
        remove : (container, molecule_index, atom_or_atomic_symbol) => {

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
        removeProton: (container, molecule_index, atom_or_atomic_symbol, test_number) => {

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


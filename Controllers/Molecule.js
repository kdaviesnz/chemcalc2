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

        // H2O (nucleophile) <------- HCl (electrophile)
        if (undefined !== test_number && test_number === 1) {
            mmolecule.length.should.be.equal(4)
            mmolecule[3][0].should.be.equal("O")
        }
        
        // Cl- (nucleophile) <------- H3O (electrophile)
        if (undefined !== test_number && test_number === 2) {
            mmolecule.length.should.be.equal(2)
            mmolecule[1][0].should.be.equal("Cl")
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
            // H2O (nucleophile) <------- HCl (electrophile)
            if (test_number === 1) {
                atoms_with_lone_pairs[0][0].should.be.equal(2)
                mmolecule[atoms_with_lone_pairs[0][0]+1][0].should.be.equal("O")
            }
            // Cl- (nucleophile) <------- H3O (electrophile)
            if (test_number === 2) {
                atoms_with_lone_pairs[0][0].should.be.equal(777)
                mmolecule[atoms_with_lone_pairs[0][0]+1][0].should.be.equal("Cl")
            }
           return atoms_with_lone_pairs[0][0] + 1 // take into account pka
        }
        
        
    }
    
    const __atomsWithLonePairs =  (test_number) => {

        // H2O (nucleophile) <------- HCl (electrophile)
        if (undefined !== test_number && test_number === 1) {
            mmolecule.length.should.be.equal(4)
            mmolecule[3][0].should.be.equal("O")
        }

        // Cl (nucleophile) <------- HCl (electrophile)
        if (undefined !== test_number && test_number === 2) {
            mmolecule.length.should.be.equal(2)
            mmolecule[1][0].should.be.equal("Cl")
        }
              
        // Check nucleophile for lone pairs
        const atoms_with_lone_pairs = mmolecule.slice(1).map(
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
        
        // H2O (nucleophile) <------- HCl (electrophile)
        if (test_number === 1) {
            atoms_with_lone_pairs[0][0].should.be.equal(4)
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

        // H+ (electrophile) <------- H:OH
        // atoms [[proton]]
        // mmolecule H2O
        // Proton is our electrophile, where the arrow would be pointing to
        // H2O is our nucleophile, where the arrow would be pointing from
        if (test_number === 1) {
            source_atom_index.should.be.equal(3)
            target_atom_index.should.be.equal(1)           
            mmolecule.length.should.be.equal(4) // mmolecue should be the nucleophile (H2O)
            mmolecule[1][0].should.be.equal("H")
            mmolecule[2][0].should.be.equal("H")
            mmolecule[3][0].should.be.equal("O")
            mmolecule[source_atom_index][0].should.be.equal("O")
            atoms.length.should.be.equal(1)
            target_atom_index.should.be.equal(1) // proton so must be 1
            source_atom_index.should.be.equal(3) // oxygen atom on H2O (nucleophile) taking into account pKa
            atoms[target_atom_index -1][0].should.be.equal("H")
        }
        
        // H+ (electrophile) <------- Cl- (nucleophile) (source atom)
        // atoms [[proton]]
        // mmolecule Cl-
        // Proton is our electrophile, where the arrow would be pointing to
        // Cl- is our nucleophile, where the arrow would be pointing from
        if (test_number === 2) {
            source_atom_index.should.be.equal(1) // nucleophile
            target_atom_index.should.be.equal(1)           
            mmolecule.length.should.be.equal(2) // mmolecue should be the nucleophile (Cl-)
            mmolecule[1][0].should.be.equal("Cl")            
            mmolecule[source_atom_index][0].should.be.equal("Cl")
            atoms.length.should.be.equal(1)
            target_atom_index.should.be.equal(1) // proton so must be 1
            source_atom_index.should.be.equal(1) // Cl- atom on nucleophile taking into account pKa
            atoms[target_atom_index -1][0].should.be.equal("H")
        }

        // This is the index of the target atom after adding it to mmolecule
        const target_atom_mmolecule_index = mmolecule.length + target_atom_index -1

        // H2O (nucleophile) -------> H+ (electrophile)
        if (test_number === 1) {
            target_atom_mmolecule_index.should.be.equal(4)
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
        }
        
        // Cl- (nucleophile) -------> H+ (electrophile)
        if (test_number === 2) {
            target_atom_mmolecule_index.should.be.equal(2)
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
        }
                
        // C:OC (nucleophile) ---------> AlCl3 (electrophile)  
        if (test_number === 3) {
            target_atom_mmolecule_index.should.be.equal(999999)
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("O")
            atoms.length.should.be.equal(4) // AlCl3
            mmolecule.length.should.be.equal(10) // COC
            target_atom_mmolecule_index.should.be.equal(1) // Al on AlCl3
        }
        
        if (test_number === 5) {
            target_atom_mmolecule_index.should.be.equal(4)
        }
           

        // Add atoms to molecule.
        // At this point main atom won't be bonded.
        atoms.map(
            (atom) => {
                mmolecule.push(atom)
                return atom
            }
        )

        // H2O (H+) (nucleophile) -------> H+ (nucleophile) note: weve just added a proton
        if (test_number === 1) {
            mmolecule.length.should.be.equal(5)
            mmolecule[1][0].should.be.equal("H")
            mmolecule[2][0].should.be.equal("H")
            mmolecule[3][0].should.be.equal("O")
            mmolecule[4][0].should.be.equal("H")
        }
          
        // Cl (H+) (nucleophile) -------> H+ (nucleophile) note: weve just added a proton
        if (test_number === 2) {
            mmolecule.length.should.be.equal(3)
            mmolecule[1][0].should.be.equal("Cl")
            mmolecule[2][0].should.be.equal("H")       
        }
        
        // C:OC (nucleophile) ---------> AlCl3 (electrophile) 
        if (test_number === 3) {
            mmolecule.length.should.be.equal(88888)
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

        if (undefined === mmolecule[target_atom_mmolecule_index]) {
            console.log("mmolecule[target_atom_mmolecule_index] is undefined")
            console.log(mmolecule)
            console.log(target_atom_mmolecule_index)
            console.log("Molecule.js")
            process.exit()
        }

        const target_atom_electron_to_share_index = __electronToShareIndex(mmolecule[target_atom_mmolecule_index])

        // H3O
        if (test_number === 1) {
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
            mmolecule[target_atom_mmolecule_index][0].slice(4).length.should.be.equal(0)
            // Target atom is a proton and so shouldnt have any electrons.
            target_atom_electron_to_share_index.should.be.equal(false)
        }
        
        // ClH
        if (test_number === 2) {
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
            mmolecule[target_atom_mmolecule_index][0].slice(4).length.should.be.equal(0)
            // Target atom is a proton and so shouldnt have any electrons.
            target_atom_electron_to_share_index.should.be.equal(false)
        }
        
        // C:OC (nucleophile) ---------> AlCl3 (electrophile)
        if (test_number === 3) {
            target_atom_electron_to_share_index.should.be.equal(77777)
        }

        const source_atom_electron_to_share_index = __electronToShareIndex(mmolecule[source_atom_index])
        
        // H3O
        if (test_number === 1) {
            target_atom_electron_to_share_index.should.be.equal(false)
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
            mmolecule[source_atom_index][0].should.be.equal("O")
            source_atom_electron_to_share_index.should.be.equal(false)
        }
              
        // HCl
        if (test_number === 2) {
            target_atom_electron_to_share_index.should.be.equal(false)
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
            mmolecule[source_atom_index][0].should.be.equal("O")
            source_atom_electron_to_share_index.should.be.equal(false)
        }
        
        // AlCl3 + C:OC
        if (test_number === 3) {
            target_atom_electron_to_share_index.should.be.equal(false)
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
            mmolecule[source_atom_index][0].should.be.equal("O")
            source_atom_electron_to_share_index.should.be.equal(false)                    
        }
        
        // Get lone pair from source atom (atom arrow would be pointing from (nucleophile))
        const source_atom_lone_pairs = CAtom(mmolecule[source_atom_index], source_atom_index, mmolecule).lonePairs(9999)
                       
        // Protons are always target atoms - where the arrow would be pointing to
        if (mmolecule[target_atom_mmolecule_index][0]==="H") {

            // proton?
            if (mmolecule[target_atom_mmolecule_index].length===4) {
                // add electrons from source atom to target atom (proton)
                // target atom is a proton and has no electrons
                
                if (test_number ===1) {
                    sources_atom_lone_pairs.length.should.be.equal(4)
                }
                mmolecule[target_atom_mmolecule_index].push(source_atom_lone_pairs[0])
                mmolecule[target_atom_mmolecule_index].push(source_atom_lone_pairs[1])
                
            } else {
                console.log("To do: Add hydrogen bond where hydrogen is not a proton")
            }

            // add shared electron from second_atom to first atom
           // mmolecule[atom1_index].push(mmolecule[atom2_index][4 + atom2_electron_to_share_next_index -1])

            // add shared electron from second atom to first atom
           // mmolecule[atom1_index].push(mmolecule[atom2_index][4 + atom2_electron_to_share_index])

        } else {

            // Not hydrogen
            
            // Source atom should always have a lone pair (nucleophile)
            
            if (test_number === 3) {
                source_atom_electron_to_share_index.should.be.equal(9999)
                target_atom_electron_to_share_index.should.be.equal(false)
            }
            
            if (!target_atom_electron_to_share_index) {
                // Target atom has no free electrons so check if it has free slots.
                // electrophile
                const free_slots = CAtom(mmolecule[target_atom_mmolecule_index], null, null).freeSlots
                if (free_slots.length > 0) {
                    
                    // add free electron from source atom to target atom
                    // mmolecule[target_atom_mmolecule_index].push(free_slots[0])
                    // add another free electron from source atom to target atom
                    // mmolecule[target_atom_mmolecule_index].push(free_slots[1])

                    // add free electron from source atom to target atom
                    mmolecule[target_atom_mmolecule_index].push(mmolecule[source_atom_index][4 + source_atom_electron_to_share_index])
                    // add another free electron from source atom to target atom
                    mmolecule[target_atom_mmolecule_index].push(mmolecule[source_atom_index][5 + source_atom_electron_to_share_index])

                }
            } else {
                
                // add shared electron from target atom to source atom
                mmolecule[source_atom_index].push(mmolecule[target_atom_mmolecule_index][4 + target_atom_electron_to_share_index])

                // add shared electron from atom being pushed to target atom
                mmolecule[target_atom_mmolecule_index].push(mmolecule[atom_to_push_molecule_index][5 + source_atom_electron_to_share_index])

            
                // add shared electron from target atom to source atom
                //mmolecule[source_atom_index][4 + source_atom_electron_to_share_index])].push(mmolecule[target_atom_mmolecule_index][4 + target_atom_electron_to_share_index])

                // add shared electron from atom being pushed to target atom
                //mmolecule[target_atom_mmolecule_index][5 + target_atom_electron_to_share_index])].push(mmolecule[atom_to_push_molecule_index][5 + source_atom_electron_to_share_index])

            }
        }

        mmolecule[0] = pKa(mmolecule.slice(1))

        if (test_number === 1) {
            mmolecule[0].should.be.equal(-1.74)
        }
        
        if (test_number === 2) {
            mmolecule[0].should.be.equal(999999)
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
        push : (atoms_or_atomic_symbols, container, molecule_to_add_to_index, test_number, target_atom_index, source_atom_index) => {


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
                target_atom_index.should.be.equal(1)
                atoms_or_atomic_symbols[target_atom_index][0].should.be.equal("Al")
            }
            
            atoms_or_atomic_symbols.should.be.an.Array()
            // H+ (electrophile) <---------- H2O (nucleophile)
            if (test_number === 1) {
                atoms_or_atomic_symbols.length.should.be.equal(1)  // proton
                atoms_or_atomic_symbols[0][0].should.be.equal("H")
                atoms_or_atomic_symbols[0].length.should.be.equal(4)
                target_atom_index.should.be.equal(1)
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

            if (undefined === source_atom_index) {
                source_atom_index = determineNucleophileIndex(test_number)
                if(test_number === 1) {
                    source_atom_index.should.be.equal(3) // Oxygen atom on H2O
                }
            } 

            if(test_number === 1) {
                // Note at this point we have removed the proton from HCl
                // We are pushing a proton to H2O
                //console.log(container) // [false, [2.86, [Cl...]], [2.86, [14, [H],[H],[O]...]
                //console.log(mmolecule) //H2O
                // console.log(mmolecule[3]) // Oxygen atom
                source_atom_index.should.be.equal(3) // Should be 3
            }

            if (source_atom_index !== false) {

                 if(test_number === 3) {
                     source_atom_index.should.be.equal(5) // oxygen atom on COC
                     mmolecule[source_atom_index][0].should.be.equal("Al")
                     atom_to_push_index.should.be.equal(1) // // Al atom on AlCl3
                 }
                
                return _makeCovalentBond(atoms, source_atom_index, test_number, target_atom_index) // return molecule

                // push electron
                // AtomController(atom).push(mmolecule[source_atom_index])
                // atom.push(mmolecule[source_atom_index][mmolecule[source_atom_index].length - 1])
                
               // mmolecule[source_atom_index].push(atom[atom.length - 2])
                // AtomController(mmolecule[source_atom_index]).push(atom)
                
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


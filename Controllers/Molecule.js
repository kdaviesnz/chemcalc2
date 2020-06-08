//
const AtomFactory = require('../Models/AtomFactory')
const CAtom = require('./Atom')
const pKa = require('../Models/pKa')
const should = require('should')
const Set = require('../Models/Set')
const Families = require('../Models/Families')

const CMolecule = (mmolecule) => {

    const __hydrogensNotAttachedToCarbons = (test_number) => {
        const hydrogens = mmolecule.slice(1).reduce(
            (carry, atom, index) => {
                if (atom[0] === "H" && CAtom(atom, index,mmolecule).carbons().length === 0) {
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

        // 5.1 test 5, [Br-] nucleophile so should return false
        // 5.1 test 5, carbocation electrophile so should not return false

        console.log(test_number)

        const hydrogens = __hydrogensNotAttachedToCarbons(test_number)


        if (test_number == 4.1) {
            hydrogens.length.should.be.equal(1)
        }

        if (test_number == 5.1) {  // mmolecle = [Br-]
             hydrogens.length.should.be.equal(0)
        }


        // Get hydrogens not attached to carbons

        // @todo do not count hydrogens attached to carbons
        // Check atoms for free slots
        // returns [index, atom] pairs




        if (hydrogens.length > 0) {
            // See organic chemistry 8th edition ch 6 p 235
            // C=C (butene, nucleophile) -> HBr (H is electrophile)
            if (test_number == 4.1) {
                hydrogens[0][0].should.be.equal(0)
            }
            return hydrogens[0][0] + 1

        } else {

            const atoms_with_free_slots = __atomsWithFreeSlots(test_number)

            // See organic chemistry 8th edition ch 6 p 235
            // C=C (butene, nucleophile) -> HBr (H is electrophile)
            if (test_number == 4.1) {
                // mmolecule
                /*
                        [ 12345, 0
                          [ 'H', 1, 1, 1, '2edg3og5gokb4ofslh', '2edg3og5gokb4ofsla' ], 1
                          [ 'Br', 35,7,1,'2edg3og5gokb4ofsla','2edg3og5gokb4ofslb', 2
                            '2edg3og5gokb4ofslc','2edg3og5gokb4ofsld','2edg3og5gokb4ofsle',
                            '2edg3og5gokb4ofslf','2edg3og5gokb4ofslg','2edg3og5gokb4ofslh' ]
                            ]
                         */
                atoms_with_free_slots.length.should.be.equal(1)
            }

            if (test_number == 5.1) {
                atoms_with_free_slots.length.should.be.equal(3333) // should be 0
            }

            if (atoms_with_free_slots.length === 0) {
                return false
            } else {
                return atoms_with_free_slots[0][0] + 1 // take into account pKa value
            }

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

            // Check for double bonds
            const double_bonds = Families(mmolecule.slice(1)).families.alkene()
            if (test_number === 4) {
                double_bonds.length.should.be.greaterThan(0)
            }
            if (double_bonds.length > 0) {
                // Determine carbon with most hydrogens
                const keys = Object.keys(double_bonds[0])
                // Get number of hydrogens for first carbon
                const carbon_1_hydrogens = CAtom(double_bonds[0][keys[0]], 0, mmolecule).hydrogens
                const carbon_2_hydrogens = CAtom(double_bonds[0][keys[1]], 1, mmolecule).hydrogens
                if (test_number === 4) {
                    carbon_1_hydrogens.length.should.be.equal(1)
                    carbon_2_hydrogens.length.should.be.equal(1)
                }
                if (carbon_1_hydrogens.length >= carbon_2_hydrogens.length ) {
                    return keys[0]*1 +1
                } else {
                    return keys[1]*1 +1
                }
            }

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

        // Cl (nucleophile) <------- HCl (electrophile) __atomsWithLonePairs()
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
      // Check substrate for free slots

                return mmolecule.slice(1).map(

                    (atom, index) => {

                        console.log('m' + test_number)

                        if (test_number == 3.1) {
                            // AlCl3 , Al is an electrophile
                            if (atom[0] === 'Al') {
                                CAtom(atom, index, mmolecule).freeSlots(test_number).should.be.equal(6)
                            }
                        }

                        if (test_number == 5.1) {
                            // freeSlots() returns a number
                            //console.log(atom)
                            /*
                            [ 'Br',
  35,
  7,
  1,
  '2edg3og4hskb46emmt',
  '2edg3og4hskb46emmu',
  '2edg3og4hskb46emmv',
  '2edg3og4hskb46emmw',
  '2edg3og4hskb46emmx',
  '2edg3og4hskb46emmy',
  '2edg3og4hskb46emmz',
  '2edg3og4hskb46emn0' ]

                             */
                            CAtom(atom, index ,mmolecule).freeSlots(test_number).should.be.equal(0) // Check
                        }


                        if ((atom[0]==="H" && CAtom(atom, index,mmolecule).carbons().length > 0) || CAtom(atom, index,mmolecule).freeSlots(test_number) === 0 ) {
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
    const __makeCovalentBond = (atoms, source_atom_index, test_number, target_atom_index) => {

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
            mmolecule.length.should.be.equal(2) // mmolecule should be the nucleophile (Cl-)
            mmolecule[1][0].should.be.equal("Cl")            
            mmolecule[source_atom_index][0].should.be.equal("Cl")
            atoms.length.should.be.equal(1)
            target_atom_index.should.be.equal(1) // proton so must be 1
            source_atom_index.should.be.equal(1) // Cl- atom on nucleophile taking into account pKa
            // atoms [ [ 'H', 1, 1, 1 ] ]
            atoms[target_atom_index -1][0].should.be.equal("H")
        }
        
        //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
        if (test_number === 4) {
            if(test_number === 4) {
                // atoms
                // [ [ 'H', 1, 1, 1 ] ]
                // mmolecule
                /*
                [ 12345,
[ 'H', 1, 1, 1, '26f114qhkavwca5i', '26f114qhkavwca52' ],
[ 'H', 1, 1, 1, '26f114qhkavwca5j', '26f114qhkavwca53' ],
[ 'H', 1, 1, 1, '26f114qhkavwca5k', '26f114qhkavwca54' ],
[ 'C',6,4,4,'26f114qhkavwca52','26f114qhkavwca53','26f114qhkavwca54','26f114qhkavwca55',
'26f114qhkavwca59','26f114qhkavwca5i','26f114qhkavwca5j','26f114qhkavwca5k' ],
[ 'H', 1, 1, 1, '26f114qhkavwca5l', '26f114qhkavwca56' ],
[ 'C',6,4,4,'26f114qhkavwca56','26f114qhkavwca57','26f114qhkavwca58','26f114qhkavwca59',
'26f114qhkavwca55','26f114qhkavwca5d','26f114qhkavwca5c','26f114qhkavwca5l' ],
[ 'H', 1, 1, 1, '26f114qhkavwca5m', '26f114qhkavwca5a' ],
[ 'C',6,4,4,'26f114qhkavwca5a','26f114qhkavwca5b','26f114qhkavwca5c','26f114qhkavwca5d',
'26f114qhkavwca58','26f114qhkavwca57','26f114qhkavwca5h','26f114qhkavwca5m' ],
[ 'H', 1, 1, 1, '26f114qhkavwca5n', '26f114qhkavwca5e' ],
[ 'H', 1, 1, 1, '26f114qhkavwca5o', '26f114qhkavwca5f' ],
[ 'H', 1, 1, 1, '26f114qhkavwca5p', '26f114qhkavwca5g' ],
[ 'C',6,4,4,'26f114qhkavwca5e','26f114qhkavwca5f','26f114qhkavwca5g','26f114qhkavwca5h',
'26f114qhkavwca5b','26f114qhkavwca5n','26f114qhkavwca5o','26f114qhkavwca5p' ] ]
                 */
                // source_atom_index 6 = Carbon on double bond
                // target_atom_index 1 = H
            }
            source_atom_index.should.be.equal(6) // nucleophile
            mmolecule.length.should.be.equal(13) // mmolecule should be the nucleophile
            mmolecule[source_atom_index][0].should.be.equal("C")
            atoms.length.should.be.equal(1)
            target_atom_index.should.be.equal(1) // proton so must be 1
            source_atom_index.should.be.equal(6) // C atom on double bond on mmolecule (nucleophile)
            // atoms [ [ 'H', 1, 1, 1 ] ]
            atoms[target_atom_index -1][0].should.be.equal("H")
        }

        // This is the index of the target atom after adding it to mmolecule
        const target_atom_mmolecule_index = mmolecule.length + target_atom_index -1

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
            mmolecule.length.should.be.equal(10) // COC
        }

        //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
        if (test_number === 4) {
            // This is the proton
            target_atom_mmolecule_index.should.be.equal(13)
            atoms.length.should.be.equal(1)
            mmolecule.length.should.be.equal(13)
        }


        // [Br-] (nucleophile) -----> carbocation CC[C+]C
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1         

        if (test_number === 5) {
            //console.log(mmolecule)
            /*
            [Br-] nucleophile
            [ 12345,
  [ 'Br',
    35,
    7,
    1,
    '26f1152ukavyw78g',
    '26f1152ukavyw78h',
    '26f1152ukavyw78i',
    '26f1152ukavyw78j',
    '26f1152ukavyw78k',
    '26f1152ukavyw78l',
    '26f1152ukavyw78m',
    '26f1152ukavyw78n' ] ]
             */
           // console.log(atoms)
            /*
            [ [ 'H', 1, 1, 1, '26f1152xkavyx3lh', '26f1152xkavyx3l1' ],
  [ 'H', 1, 1, 1, '26f1152xkavyx3li', '26f1152xkavyx3l2' ],
  [ 'H', 1, 1, 1, '26f1152xkavyx3lj', '26f1152xkavyx3l3' ],
  [ 'C',
    6,
    4,
    4,
    '26f1152xkavyx3l1',
    '26f1152xkavyx3l2',
    '26f1152xkavyx3l3',
    '26f1152xkavyx3l4',
    '26f1152xkavyx3l8',
    '26f1152xkavyx3lh',
    '26f1152xkavyx3li',
    '26f1152xkavyx3lj' ],
  [ 'H', 1, 1, 1, '26f1152xkavyx3lk', '26f1152xkavyx3l5' ],
  [ 'C',
    6,
    4,
    4,
    '26f1152xkavyx3l5',
    '26f1152xkavyx3l6',
    '26f1152xkavyx3l7',
    '26f1152xkavyx3l8',
    '26f1152xkavyx3l4',
    '26f1152xkavyx3lc',
    '26f1152xkavyx3lb',
    '26f1152xkavyx3lk' ],
  [ 'H', 1, 1, 1, '26f1152xkavyx3ll', '26f1152xkavyx3l9' ],
  [ 'C',
    6,
    4,
    4,
    '26f1152xkavyx3l9',
    '26f1152xkavyx3la',
    '26f1152xkavyx3lb',
    '26f1152xkavyx3lc',
    '26f1152xkavyx3lg',
    '26f1152xkavyx3ll' ],
  [ 'H', 1, 1, 1, '26f1152xkavyx3lm', '26f1152xkavyx3ld' ],
  [ 'H', 1, 1, 1, '26f1152xkavyx3ln', '26f1152xkavyx3le' ],
  [ 'H', 1, 1, 1, '26f1152xkavyx3lo', '26f1152xkavyx3lf' ],
  [ 'C',
    6,
    4,
    4,
    '26f1152xkavyx3ld',
    '26f1152xkavyx3le',
    '26f1152xkavyx3lf',
    '26f1152xkavyx3lg',
    '26f1152xkavyx3la',
    '26f1152xkavyx3lm',
    '26f1152xkavyx3ln',
    '26f1152xkavyx3lo' ],
  [ 'H', 1, 1, 1, '26f1152xkavyx3l6', '26f1152xkavyx3l7' ] ]


             */
            // [Br-] (nucleophile) -----> carbocation CC[C+]C
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1         
            target_atom_mmolecule_index.should.be.equal(9) // 1 + 8
            atoms.length.should.be.equal(8888)
            mmolecule.length.should.be.equal(2) // [Br-] we havent added the electrophile yet
        }

        // Add atoms to molecule.
        // At this point main atom won't be bonded.
        atoms.map(
            (atom) => {
                mmolecule.push(atom)
                return atom
            }
        )

        // H2O (nucleophile) -------> H+ (electrophile)
        if (test_number === 1) {
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
            mmolecule.length.should.be.equal(5)
            mmolecule[1][0].should.be.equal("H")
            mmolecule[2][0].should.be.equal("H")
            mmolecule[3][0].should.be.equal("O")
            mmolecule[4][0].should.be.equal("H")
        }

        // Cl- (nucleophile) -------> H+ (electrophile)
        if (test_number === 2) {
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
            mmolecule.length.should.be.equal(3)
            mmolecule[1][0].should.be.equal("Cl")
            mmolecule[2][0].should.be.equal("H")
        }

        // C:OC (nucleophile) ---------> AlCl3 (electrophile)
        if (test_number === 3) {
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("Al")
            mmolecule.length.should.be.equal(14)
            mmolecule[1][0].should.be.equal("H")
            mmolecule[2][0].should.be.equal("H")
            mmolecule[3][0].should.be.equal("H")
            mmolecule[4][0].should.be.equal("C")
        }

        //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
        if (test_number === 4) {
            // This is the proton
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
            mmolecule.length.should.be.equal(14)
            mmolecule[1][0].should.be.equal("H")
            mmolecule[2][0].should.be.equal("H")
            mmolecule[3][0].should.be.equal("H")
            mmolecule[4][0].should.be.equal("C")
        }
        
        // [Br-] (nucleophile) -----> carbocation CC[C+]C
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1   
        if (test_number === 5) {
            target_atom_mmolecule_index.should.be.equal(9) // source atom index plus target atom index
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("C")
            mmolecule.length.should.be.equal(44444)
            
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
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
            mmolecule[source_atom_index][0].should.be.equal("O")
            source_atom_electron_to_share_index.should.be.equal(5)
        }
              
        // HCl
        if (test_number === 2) {
            target_atom_electron_to_share_index.should.be.equal(false)
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
            mmolecule[source_atom_index][0].should.be.equal("Cl")
            source_atom_electron_to_share_index.should.be.equal(7)
        }
        
        // AlCl3 + C:OC
        if (test_number === 3) {
            target_atom_electron_to_share_index.should.be.equal(false)
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("Al")
            mmolecule[source_atom_index][0].should.be.equal("O")
            source_atom_electron_to_share_index.should.be.equal(3)       // false
        }
        
        //  CC=CC (nucleophile) ----> HBr (electrophile) (target)
        if (test_number === 4) {
            target_atom_electron_to_share_index.should.be.equal(false)
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("H")
            mmolecule[source_atom_index][0].should.be.equal("C")
            source_atom_electron_to_share_index.should.be.equal(false) // false as double one
        }
        
        // [Br-] (nucleophile) -----> carbocation CC[C+]C
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1   
        if (test_number === 5) {
            target_atom_electron_to_share_index.should.be.equal(false) // carbocation
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("C")
            mmolecule[source_atom_index][0].should.be.equal("Br")
            source_atom_electron_to_share_index.should.be.equal(8888) // should not be false
   
        }
        
        // Get lone pair from source atom (atom arrow would be pointing from (nucleophile))
        const source_atom_lone_pairs = CAtom(mmolecule[source_atom_index], source_atom_index, mmolecule).lonePairs(test_number)

        if (test_number === 4) {
            source_atom_lone_pairs.length.should.be.equal(0) // C=C double bond so no lone pairs
        }

         // [Br-] (nucleophile) -----> carbocation CC[C+]C
        // Br atom should bond to carbon that has three bonds
        // Target atom index should be 8 (electrophile)
        // Source atom index should be 1   
        if (test_number === 5) {
            source_atom_lone_pairs.length.should.be.equal(7777) // [Br-] // we should have a lone pair
            mmolecule[target_atom_mmolecule_index][0].should.be.equal("C") //[C+]
        }

        // Protons are always target atoms (eklectrophiles) - where the arrow would be pointing to
        
        
        if (mmolecule[target_atom_mmolecule_index][0]==="H") {
            
            if (test_number === 5) {
                console.log("SHOULDNT BE HERE - molecule.js")
                process.exit()
            }

            // proton?
            if (mmolecule[target_atom_mmolecule_index].length===4) {
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
                    mmolecule[target_atom_mmolecule_index].push(source_atom_lone_pairs[0])
                    mmolecule[target_atom_mmolecule_index].push(source_atom_lone_pairs[1])
                } else {

                    // Does the source atom have a double bond?
                    // returns a set of electrons or false
                    const double_bond = CAtom(mmolecule[source_atom_index], source_atom_index, mmolecule).doubleBond(test_number)

                    // remove the double bond by removing electrons from bonded atom (turn into single bond)
                    if (test_number === 4) {
                        double_bond.should.not.be.equal(false)
                        double_bond.length.should.be.equal(4)
                    }

                    if (double_bond) {
                        mmolecule = CAtom(mmolecule[source_atom_index], source_atom_index, mmolecule).removeDoubleBond(test_number)
                        mmolecule[target_atom_mmolecule_index].push(double_bond[0])
                        mmolecule[target_atom_mmolecule_index].push(double_bond[1])
                    }

                }
                
                if (test_number === 4) {
                    //console.log(mmolecule)
                    /*
                    [ 12345, 0
  [ 'H', 1, 1, 1, '26f114zhkavy3hau', '26f114zhkavy3hae' ], 1
  [ 'H', 1, 1, 1, '26f114zhkavy3hav', '26f114zhkavy3haf' ], 2
  [ 'H', 1, 1, 1, '26f114zhkavy3haw', '26f114zhkavy3hag' ], 3
  [ 'C', 6,4,4,'26f114zhkavy3hae','26f114zhkavy3haf','26f114zhkavy3hag','26f114zhkavy3hah',
   '26f114zhkavy3hal','26f114zhkavy3hau','26f114zhkavy3hav','26f114zhkavy3haw' ], 4
  [ 'H', 1, 1, 1, '26f114zhkavy3hax', '26f114zhkavy3hai' ], 5
  [ 'C',6,4,4,'26f114zhkavy3hai','26f114zhkavy3haj','26f114zhkavy3hak','26f114zhkavy3hal',
    '26f114zhkavy3hah','26f114zhkavy3hap','26f114zhkavy3hao','26f114zhkavy3hax' ], 6
  [ 'H', 1, 1, 1, '26f114zhkavy3hay', '26f114zhkavy3ham' ], 7
  [ 'C',6,4,4,'26f114zhkavy3ham','26f114zhkavy3han','26f114zhkavy3hao','26f114zhkavy3hap','26f114zhkavy3hak','26f114zhkavy3haj',
    '26f114zhkavy3hat','26f114zhkavy3hay' ], 8
  [ 'H', 1, 1, 1, '26f114zhkavy3haz', '26f114zhkavy3haq' ], 9
  [ 'H', 1, 1, 1, '26f114zhkavy3hb0', '26f114zhkavy3har' ], 10
  [ 'H', 1, 1, 1, '26f114zhkavy3hb1', '26f114zhkavy3has' ], 11
  [ 'C',6,4,4,'26f114zhkavy3haq','26f114zhkavy3har','26f114zhkavy3has','26f114zhkavy3hat','26f114zhkavy3han',
    '26f114zhkavy3haz','26f114zhkavy3hb0','26f114zhkavy3hb1' ], 12
  [ 'H', 1, 1, 1, '26f114zhkavy3haj', '26f114zhkavy3hak' ] ] 13
                     */
                    // verify we no longer have double bond
                    if (test_number === 4) {
                        Set().intersection(mmolecule[6].slice(4), mmolecule[8].slice(4)).length.should.be.equal(2)
                        mmolecule[target_atom_mmolecule_index].slice(4).length.should.be.equal(2)
                        mmolecule[target_atom_mmolecule_index][4].should.be.a.String()
                        mmolecule[target_atom_mmolecule_index][5].should.be.a.String()
                        Set().intersection(mmolecule[6].slice(4), mmolecule[target_atom_mmolecule_index].slice(4)).length.should.be.equal(2)
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
                mmolecule[source_atom_index][0].should.be.equal("O")
                mmolecule[target_atom_mmolecule_index][0].should.be.equal("Al")
                source_atom_electron_to_share_index.should.be.equal(3)
                target_atom_electron_to_share_index.should.be.equal(false)
            }
            
            // [Br-] (nucleophile) -----> carbocation CC[C+]C
             // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8 (electrophile)
            // Source atom index should be 1   
            if (test_number === 5) {
                mmolecule[source_atom_index][0].should.be.equal("Br")
                mmolecule[target_atom_mmolecule_index][0].should.be.equal("C")
                source_atom_electron_to_share_index.should.be.equal(88888)
                target_atom_electron_to_share_index.should.be.equal(false)
            }
            
            if (!target_atom_electron_to_share_index) {
                
                // Target atom has no free electrons so check if it has free slots ie that 
                // the target atom has un unfillec valence shell
                // electrophile
                // free slots is a number
                const free_slots = CAtom(mmolecule[target_atom_mmolecule_index], target_atom_mmolecule_index, mmolecule).freeSlots(test_number)
              
                // [Br-] (nucleophile) -----> carbocation CC[C+]C
             // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8 (electrophile)
            // Source atom index should be 1   
                if (test_number === 5) {
                     free_slots.should.be.greaterThan("Br")
                
                }
                
                
                if (free_slots > 0) {
                    
                    // add free electron from source atom to target atom
                    // mmolecule[target_atom_mmolecule_index].push(free_slots[0])
                    // add another free electron from source atom to target atom
                    // mmolecule[target_atom_mmolecule_index].push(free_slots[1])

                    // add free electron from source atom to target atom
                    mmolecule[target_atom_mmolecule_index].push(mmolecule[source_atom_index][4 + source_atom_electron_to_share_index])
                    // add another free electron from source atom to target atom
                    mmolecule[target_atom_mmolecule_index].push(mmolecule[source_atom_index][5 + source_atom_electron_to_share_index])

                    
                    // test for bond
                    // [Br-] (nucleophile) -----> carbocation CC[C+]C
             // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8 (electrophile)
            // Source atom index should be 1   
                if (test_number === 5) {
                     Set().intersection(mmolecule[target_atom_mmolecule_index].slice(4), mmolecule[source_atom_index].slice(4)).length.should.be.equal(4444)
                
                }
                    
                    
                    
                }

            } else {
                
                if (test_number === 5) {
                console.log("SHOULDNT BE HERE 2 - molecule.js")
                process.exit()
            }
                
                // add shared electron from target atom to source atom
                mmolecule[source_atom_index].push(mmolecule[target_atom_mmolecule_index][4 + target_atom_electron_to_share_index])

                // add shared electron from atom being pushed to target atom
                // test 5 - atom_to_push_molecule_index is undefined
                mmolecule[target_atom_mmolecule_index].push(mmolecule[atom_to_push_molecule_index][5 + source_atom_electron_to_share_index])

            
             
            }
        }

        mmolecule[0] = pKa(mmolecule.slice(1))

        if (test_number === 1) {
            mmolecule[0].should.be.equal(-1.74)
        }
        
        if (test_number === 2) {
            mmolecule[0].should.be.equal(-6.3)
        }
        
        if (test_number === 3) {
            mmolecule.length.should.be.equal(14)
            mmolecule[1][0].should.be.equal("H")
            mmolecule[2][0].should.be.equal("H")
            mmolecule[3][0].should.be.equal("H")
            mmolecule[4][0].should.be.equal("C")
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
            /*
            Source atom index:6
target_atom_mmolecule_index:13
mmolecule
[ 12345,
  [ 'H', 1, 1, 1, '1y5g43iwkaixyrog', '1y5g43iwkaixyro0' ],
  [ 'H', 1, 1, 1, '1y5g43iwkaixyroh', '1y5g43iwkaixyro1' ],
  [ 'H', 1, 1, 1, '1y5g43iwkaixyroi', '1y5g43iwkaixyro2' ],
  [ 'C',
    6,
    4,
    4,
    '1y5g43iwkaixyro0',
    '1y5g43iwkaixyro1',
    '1y5g43iwkaixyro2',
    '1y5g43iwkaixyro3',
    '1y5g43iwkaixyro7',
    '1y5g43iwkaixyrog',
    '1y5g43iwkaixyroh',
    '1y5g43iwkaixyroi' ],
  [ 'H', 1, 1, 1, '1y5g43iwkaixyroj', '1y5g43iwkaixyro4' ],
  [ 'C',
    6,
    4,
    4,
    '1y5g43iwkaixyro4',
    '1y5g43iwkaixyro5',
    '1y5g43iwkaixyro6',
    '1y5g43iwkaixyro7',
    '1y5g43iwkaixyro3',
    '1y5g43iwkaixyrob',
    '1y5g43iwkaixyroa',
    '1y5g43iwkaixyroj' ],
  [ 'H', 1, 1, 1, '1y5g43iwkaixyrok', '1y5g43iwkaixyro8' ],
  [ 'C',
    6,
    4,
    4,
    '1y5g43iwkaixyro8',
    '1y5g43iwkaixyro9',
    '1y5g43iwkaixyroa',
    '1y5g43iwkaixyrob',
    '1y5g43iwkaixyro6',
    '1y5g43iwkaixyro5',
    '1y5g43iwkaixyrof',
    '1y5g43iwkaixyrok' ],
  [ 'H', 1, 1, 1, '1y5g43iwkaixyrol', '1y5g43iwkaixyroc' ],
  [ 'H', 1, 1, 1, '1y5g43iwkaixyrom', '1y5g43iwkaixyrod' ],
  [ 'H', 1, 1, 1, '1y5g43iwkaixyron', '1y5g43iwkaixyroe' ],
  [ 'C',
    6,
    4,
    4,
    '1y5g43iwkaixyroc',
    '1y5g43iwkaixyrod',
    '1y5g43iwkaixyroe',
    '1y5g43iwkaixyrof',
    '1y5g43iwkaixyro9',
    '1y5g43iwkaixyrol',
    '1y5g43iwkaixyrom',
    '1y5g43iwkaixyron' ],
  [ 'H', 1, 1, 1, undefined, undefined ] ]
Molecule.js

             */
        }
        if (test_number !==5) {
            Set().intersection(mmolecule[source_atom_index].slice(4), mmolecule[target_atom_mmolecule_index].slice(4)).length.should.not.be.equal(0)
        } else {
           // console.log(mmolecule)
            /*
            [ 12345,
  [ 'Br',
    35,
    7,
    1,
    '26f1153lkavz4feb',
    '26f1153lkavz4fec',
    '26f1153lkavz4fed',
    '26f1153lkavz4fee',
    '26f1153lkavz4fef',
    '26f1153lkavz4feg',
    '26f1153lkavz4feh',
    '26f1153lkavz4fei' ],
  [ 'H', 1, 1, 1, '26f1153lkavz4fez', '26f1153lkavz4fej' ],
  [ 'H', 1, 1, 1, '26f1153lkavz4ff0', '26f1153lkavz4fek' ],
  [ 'H', 1, 1, 1, '26f1153lkavz4ff1', '26f1153lkavz4fel' ],
  [ 'C',
    6,
    4,
    4,
    '26f1153lkavz4fej',
    '26f1153lkavz4fek',
    '26f1153lkavz4fel',
    '26f1153lkavz4fem',
    '26f1153lkavz4feq',
    '26f1153lkavz4fez',
    '26f1153lkavz4ff0',
    '26f1153lkavz4ff1' ],
  [ 'H', 1, 1, 1, '26f1153lkavz4ff2', '26f1153lkavz4fen' ],
  [ 'C',
    6,
    4,
    4,
    '26f1153lkavz4fen',
    '26f1153lkavz4feo',
    '26f1153lkavz4fep',
    '26f1153lkavz4feq',
    '26f1153lkavz4fem',
    '26f1153lkavz4feu',
    '26f1153lkavz4fet',
    '26f1153lkavz4ff2' ],
  [ 'H', 1, 1, 1, '26f1153lkavz4ff3', '26f1153lkavz4fer' ],
  [ 'C',
    6,
    4,
    4,
    '26f1153lkavz4fer',
    '26f1153lkavz4fes',
    '26f1153lkavz4fet',
    '26f1153lkavz4feu',
    '26f1153lkavz4fey',
    '26f1153lkavz4ff3' ],
  [ 'H', 1, 1, 1, '26f1153lkavz4ff4', '26f1153lkavz4fev' ],
  [ 'H', 1, 1, 1, '26f1153lkavz4ff5', '26f1153lkavz4few' ],
  [ 'H', 1, 1, 1, '26f1153lkavz4ff6', '26f1153lkavz4fex' ],
  [ 'C',
    6,
    4,
    4,
    '26f1153lkavz4fev',
    '26f1153lkavz4few',
    '26f1153lkavz4fex',
    '26f1153lkavz4fey',
    '26f1153lkavz4fes',
    '26f1153lkavz4ff4',
    '26f1153lkavz4ff5',
    '26f1153lkavz4ff6' ],
  [ 'H', 1, 1, 1, '26f1153lkavz4feo', '26f1153lkavz4fep' ] ]

             */
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
        push : (atoms_or_atomic_symbols, container, target_molecule_index, test_number, target_atom_index, source_atom_index) => {

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
                console.log(atoms_or_atomic_symbols)
                atoms_or_atomic_symbols.length.should.be.equal(55555)  // CC[C+]C
                atoms_or_atomic_symbols[0][0].should.be.equal("H")
                atoms_or_atomic_symbols[0].length.should.be.equal(7777)
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
                target_molecule_index.should.be.equal(2) // index of electrophile in container
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
                return __makeCovalentBond(atoms, source_atom_index, test_number, target_atom_index) // return molecule
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


//
const AtomFactory = require('../Models/AtomFactory')
const pKa = require('../Models/pKa')

const CMolecule = (mmolecule) => {

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

    const _makeCovalentBond = (atom, atom2_index) => {


        mmolecule.push(atom)

        const atom1_index = mmolecule.length -1
        
/*
In the molecule H2, the hydrogen atoms share the two electrons via covalent bonding.[7] Covalency is greatest between atoms of similar electronegativities. Thus, covalent bonding does not necessarily require that the two atoms be of the same elements, only that they be of comparable electronegativity. Covalent bonding that entails sharing of electrons over more than two atoms is said to be delocalized.
 */
        // Get index of first free electron on first atom
        const atom1_electron_to_share_index = __electronToShareIndex(mmolecule[atom1_index])
        
        // Get index of first free electron on second atom
        const atom2_electron_to_share_index = __electronToShareIndex(mmolecule[atom2_index])

        if (mmolecule[atom1_index][0]==="H") {

            // Get index of next free electron on second atom
            const atom2_electron_to_share_next_index = __electronToShareIndex(mmolecule[atom2_index]) // O

           // console.log(atom2_electron_to_share_next_index) // 5
           // process.exit()

            // add shared electron from second_atom to first atom
            mmolecule[atom1_index].push(mmolecule[atom2_index][4 + atom2_electron_to_share_next_index -1])

            // add shared electron from second atom to first atom
            mmolecule[atom1_index].push(mmolecule[atom2_index][4 + atom2_electron_to_share_index])

        } else {
            // add shared electron from first atom to second atom
            mmolecule[atom2_index].push(mmolecule[atom1_index][4 + atom1_electron_to_share_index])

            // add shared electron from second atom to first atom
            mmolecule[atom1_index].push(mmolecule[atom2_index][4 + atom2_electron_to_share_index])

        }

      //  console.log(mmolecule)
       // process.exit()
        // pKa
        mmolecule[0] = pKa(mmolecule.splice(1)
       
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
        indexOf : (atom_or_atomic_symbol) => {
            if (atom_or_atomic_symbol === "H" || atom_or_atomic_symbol[0] === "H") {
                // get molecule atoms that have hydrogens, keeping track of hydrogen indexes
                const candidate_atoms = mmolecule.reduce((carry, current_molecule_atom, index)=>{
                    if (current_molecule_atom[0] !== "H") {
                        if (typeof current_molecule_atom === "number" ) {
                            return carry
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
                [ [[ 'Cl',
    17,
    7,
    1,
    'cfo6d12rk94vnif6',
    'cfo6d12rk94vnif7',
    'cfo6d12rk94vnif8',
    'cfo6d12rk94vnif9',
    'cfo6d12rk94vnifa',
    'cfo6d12rk94vnifb',
    'cfo6d12rk94vnifc',
    'cfo6d12rk94vnifd' ],
  1 ]]

                 */
                // check for oxygen atom and if found return the index of hydrogen atom bonded to the oxygen atom
                const o = candidate_atoms.filter((candidate_atom)=>{
                    return candidate_atom[0]==="O"
                })
                if (o.length>0) {
                    return o[0][1]
                }
                /*
H
[ 9999,
  [ 'H', 1, 1, 1, 'cfo6d171k957iopn', 'cfo6d171k957iopg' ],
  [ 'Cl',
    17,
    7,
    1,
    'cfo6d171k957iopg',
    'cfo6d171k957ioph',
    'cfo6d171k957iopi',
    'cfo6d171k957iopj',
    'cfo6d171k957iopk',
    'cfo6d171k957iopl',
    'cfo6d171k957iopm',
    'cfo6d171k957iopn' ] ]
[ [ [ 'Cl',
      17,
      7,
      1,
      'cfo6d171k957iopg',
      'cfo6d171k957ioph',
      'cfo6d171k957iopi',
      'cfo6d171k957iopj',
      'cfo6d171k957iopk',
      'cfo6d171k957iopl',
      'cfo6d171k957iopm',
      'cfo6d171k957iopn' ],
    1 ] ]

                 */
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
        push : (atom_or_atomic_symbol) => {

            // MOLECULE MODEL
// pKa, atom, atom, atom ...
// ATOM MODEL
// atomic symbol, proton count, valence count, std number of bonds, velectron1, velectron2, velectron3

            // Find index of atom to bond to.
            // This must be atom with at least a lone pair.
            const atom =  typeof atom_or_atomic_symbol === "string" ? AtomFactory(atom_or_atomic_symbol) : atom_or_atomic_symbol
            const atom_to_bond_to_index = mmolecule.reduce((carry, current_molecule_atom, current_molecule_atom_index)=>{

                    if (typeof current_molecule_atom === "string" || typeof current_molecule_atom.length !== "number") {
                        return carry
                    }
                    const bond_count = _bondCount(current_molecule_atom)
                    const std_number_of_bonds = current_molecule_atom[3]
                    return current_molecule_atom[0] !== "H"
                    && std_number_of_bonds - bond_count < 0?
                        carry:current_molecule_atom_index
                }, false
            )
            if (atom_to_bond_to_index !== false) {

                return _makeCovalentBond(atom, atom_to_bond_to_index) // return molecule

                // push electron
                // AtomController(atom).push(mmolecule[atom_to_bond_to_index])
                // atom.push(mmolecule[atom_to_bond_to_index][mmolecule[atom_to_bond_to_index].length - 1])
                
               // mmolecule[atom_to_bond_to_index].push(atom[atom.length - 2])
                // AtomController(mmolecule[atom_to_bond_to_index]).push(atom)
                
               // mmolecule.push(atom)


            }
            
            mmolecule[0] = pKa(mmolecule.splice(1))
            
            return mmolecule
        },
        remove : (container, molecule_index, atom_or_atomic_symbol) => {
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

            if (atom_index === false) {
                return container
            }

            // Hydrogen atom from HCl
            const atom_to_remove = mmolecule[atom_index]

            const bond_count = _bondCount(atom_to_remove)

            if (bond_count===0) {
                return container
            }

            // Remove electrons
            const electron_to_remove_index = __electronToRemoveIndex(mmolecule[atom_index])
            const electron = mmolecule[atom_index][4+electron_to_remove_index]
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

            if (bonded_atom_index === false) {
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

            mmolecule.splice(atom_index,1)            
          
            mmolecule[0] = pKa(mmolecule.splice(1))

            container[molecule_index] = mmolecule

            return container

        },
        itemAt : (index) => {
            // mmolecule[item]
            return mmolecule[index]
        },
        bondCount : _bondCount
    }
}

module.exports = CMolecule


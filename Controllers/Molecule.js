//

const CMolecule = (mmolecule) => {

    const _bondCount = (atom) => {
        const valence_electrons = atom.slice(4)
        // Check each valence electron to see if it is being shared
        return valence_electrons.reduce(
            (total, current_electron) => {
                // Look for current electron
                // Electron can only be shared once
                const shared_count =  mmolecule.filter(
                    (molecule_atom) => {
                        if (typeof molecule_atom.length !== "number") {
                            return false
                        }
                        return molecule_atom.indexOf(current_electron) !==false
                    }
                ).length -1 // take into account electron counting itself
                return total + shared_count // shared_count should be either 0 or 1
            },
            0
        )
    }

    return {
// MOLECULE MODEL
// pKa, atom, atom, atom ...
// ATOM MODEL
// atomic symbol, proton count, valence count, std number of bonds, velectron1, velectron2, velectron3
        indexOf : (atom_or_atomic_symbol) => {
            // console.log(atom_or_atomic_symbol) "H"
            // console.log(mmolecule)
            /*
            [ 9999,
  [ 'H', 1, 1, 1, 'cfo6d11fk94vfzw0', 'cfo6d11fk94vfzvt' ],
  [ 'Cl',
    17,
    7,
    1,
    'cfo6d11fk94vfzvt',
    'cfo6d11fk94vfzvu',
    'cfo6d11fk94vfzvv',
    'cfo6d11fk94vfzvw',
    'cfo6d11fk94vfzvx',
    'cfo6d11fk94vfzvy',
    'cfo6d11fk94vfzvz',
    'cfo6d11fk94vfzw0' ] ]

             */
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
                        return typeof current === "array" && current[0] === atom_or_atomic_symbol?index:carry
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
            const atom_to_bond_to_index = mmolecule.reduce((carry, current_molecule_atom, index)=>{
                    return typeof current === "array"
                    && current_molecule_atom[0] !== "H"
                    && current_molecule_atom[3] - current_molecule_atom.length - 3 > 0?
			    current_molecule_atom_index:carry
                }, false
            )
            if (atom_to_bond_to_index !== false) {

                // Check atom to bond to has at least one lone pair
                if ((8 - (mmolecule[atom_to_bond_to_index].length-4))/2 > 0) {

                    atom.push(mmolecule[atom_to_bond_to_index][mmolecule[atom_to_bond_to_index].length - 1])
                    mmolecule[atom_to_bond_to_index].push(atom[atom.length - 2])
                    mmolecule.push(atom)

                }
            }
            // mmolecule.push(atom)
            return mmolecule
        },
        remove : (atom_or_atomic_symbol) => {
            // mmolecule.delete(atom)
            if (typeof atom_or_atomic_symbol === "string") {
                // find index of atom in molecule with matching atomic symbol
                const atom_index = mmolecule.reduce((carry, current, index)=>{
                    return typeof current === "array" && current[0] === atom_or_atomic_symbol?index:carry
                }, false)

            } else {
                const atom_index =  mmolecule.indexOf(atom_or_atomic_symbol[0])
            }

            if (atom_index === false || mmolecule[atom_index][3] - mmolecule[atom_index].length - 3 === 0 ) {
                return mmolecule
            }
            // Remove bond
            const electron = mmolecule[atom_index].pop()
            const bonded_atom_index = mmolecule.reduce((carry, current_atom, index)=>{
                return typeof current_atom === "array" && current_atom.indexof(electron) !== false
            }, false)
            if (bonded_atom_index === false) {
                // throw an error todo

            }
            // remove shared electron
            delete(mmolecule[bonded_atom_index][current_atom.indexof(electron)])
            if ( mmolecule[atom_index][3] - mmolecule[atom_index].length - 3 === 0 ) {
                delete(mmolecule[atom_index] )
            }


            return mmolecule
        },
        itemAt : (index) => {
            // mmolecule[item]
            return mmolecule
        },
        bondCount : _bondCount
    }
}

module.exports = CMolecule


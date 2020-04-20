//
const AtomFactory = require('../Models/AtomFactory')

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
            const atom_to_bond_to_index = mmolecule.reduce((carry, current_molecule_atom, index)=>{

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

                // push electrons
                atom.push(mmolecule[atom_to_bond_to_index][mmolecule[atom_to_bond_to_index].length - 1])
                mmolecule[atom_to_bond_to_index].push(atom[atom.length - 2])
                mmolecule.push(atom)


            }
            // mmolecule.push(atom)
            return mmolecule
        },
        remove : (container, molecule_index, atom_or_atomic_symbol) => {
            // 2
            // this.MoleculeController(this.container[2]).itemAt(proton_index)
            // [ 'H', 1, 1, 1, 'w2uspk96mjnji', 'w2uspk96mjnjc' ],
            let atom_index = null
            if (typeof atom_or_atomic_symbol === "string") {
                // find index of atom in molecule with matching atomic symbol
                atom_index = mmolecule.reduce((carry, current, index)=>{
                    return typeof current !== "string" && typeof current.length === "number" && current[0] === atom_or_atomic_symbol?index:carry
                }, false)

            } else {
                atom_index =  mmolecule.indexOf(atom_or_atomic_symbol)
            }

            if (atom_index === false) {
                console.log("Returning container 1")
                return container
            }

            const atom_to_remove = mmolecule[atom_index]
            const bond_count = _bondCount(atom_to_remove)
            if (bond_count===0) {
                console.log("Returning container 2")
                return container
            }

            // Remove electrons
            const electron = mmolecule[atom_index].pop()
            const bonded_atom_index = mmolecule.reduce((carry, current_molecule_atom, index)=>{
                //electron is a string
                if (typeof current_molecule_atom === 'number') {
                    return false
                }
                return typeof current_molecule_atom !== "string" && typeof current_molecule_atom.length === "number" && current_molecule_atom.indexOf(electron) !== false
                    ?carry:index
            }, false)

            if (bonded_atom_index === false) {
                console.log("Returning container 3")
                return container
            }

            // remove shared electron
            const bonded_atom = mmolecule[bonded_atom_index]
            delete(bonded_atom[bonded_atom.indexOf(electron)])

            const bonded_atom_bonds_count = _bondCount(bonded_atom)

            mmolecule[bonded_atom_index] = bonded_atom
            if (bonded_atom_bonds_count === 0) {
                delete(mmolecule[bonded_atom_index])
                container.push(bonded_atom)
            }

            container[molecule_index] = mmolecule

            console.log("Returning container 4")
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


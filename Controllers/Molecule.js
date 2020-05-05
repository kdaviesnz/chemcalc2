//
const AtomFactory = require('../Models/AtomFactory')
const CAtom = require('./Atom')
const pKa = require('../Models/pKa')
const should = require('should')

const CMolecule = (mmolecule) => {

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

        mmolecule[0] = pKa(mmolecule.slice(1))

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
                    //console.log(atom_or_atomic_symbol) // H
                    //console.log(candidate_atoms) // []
                    //console.log(mmolecule)
                    //console.log("Molecule.js")
                    //process.exit()
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

            if (bond_count===0) {
                return container
            }

            // Remove electrons
            const electron_to_remove_index = __electronToRemoveIndex(mmolecule[atom_index])
            if (test_mode) {
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
        removeProton: (container, molecule_index, atom_or_atomic_symbol) => {

            var test_mode = false
            if (container[1][2][0] === "Cl" && container[2][3][0] === "O") {
                test_mode = true
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

            mmolecule[0] = pKa(mmolecule.slice(1))

          //  container[molecule_index] = mmolecule

            return container

        }
    }
}

module.exports = CMolecule


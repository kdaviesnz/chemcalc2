const PeriodicTable = require('../Models/PeriodicTable')
const Set = require('../Models/Set')
const _ = require('lodash');
const AtomFactory = require('../Models/AtomFactory')

const CAtom = (atom, current_atom_index, mmolecule) => {

    mmolecule.length.should.be.equal(2) // molecule, units
    mmolecule[0].length.should.be.equal(2) // pKa, atoms
    atom.should.be.an.Array()
    atom.length.should.be.greaterThan(3)
    
    const __Bonds = () => {

        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(5)
        
        const r =  atoms.map(
            
            (_atom, _atom_index) => {

                if (current_atom_index === _atom_index) {
                    return false
                }

                const shared_electrons = Set().intersection(atom_electrons, _atom.slice(5))

                return shared_electrons.reduce(
                    (carry, electron) => {
                        carry.push(
                            [
                                electron
                            ]
                        )
                        return carry;
                    },
                    []
                )

            }
        ).filter(
            (item) => {
                return item !== false
            }
        )

        return r
    }

    const __bondCount = (test_number) => {
        return __Bonds().filter((item)=>{
            return item.length > 0
        }).length
    }

    const __numberOfProtons = () => {

        // Get number of protons
        const info = PeriodicTable[atom[0]]
        return number_of_protons = info['atomic_number'] * 1

    }

    const __numberOfElectrons = () => {

        // Get number of electrons
        const info = PeriodicTable[atom[0]]
        return atom.slice(5).length + ((info["electrons_per_shell"].split("-")).slice(0, -1).reduce((a, b) => a*1 + b*1, 0)) * 1

    }

    // Number of bonds atom can have and be neutral
    const __neutralAtomMaxBondCount = () => {
        const info = PeriodicTable[atom[0]]
        const valence_electrons_count = info["electrons_per_shell"].split("-").pop()
        return valence_electrons_count < 3 ? 2 - valence_electrons_count : 8 - valence_electrons_count

    }


    const __isPositivelyCharged = (test_number) => {

        // Get number of bonds and if greater than the number of max bonds for a neutral atom
        // then return true
        return __bondCount(test_number) > __neutralAtomMaxBondCount() || __numberOfElectrons() < __numberOfProtons()

    }

    const __isNegativelyCharged = (test_number) => {
        
        // Get total number of electrons and if greater than the number of protons return true
        if (__bondCount(test_number) > __neutralAtomMaxBondCount() ) {
            return false
        }
        return __numberOfElectrons() - __bondCount() > __numberOfProtons()
        
    }
    
    const __carbons = (test_number) => {
        const atoms = mmolecule[0][1]
        return atoms.filter(
            (__atom) => {
                if (__atom[0] === "C") {
                    return Set().intersection(__atom.slice(5), atom.slice(5)).length > 0
                }
                return false
            }
        )
    }
    
    const __removeDoubleBond = (test_number) => {
        const atoms = mmolecule[0][1].slice(1)
        const atom_electrons = atom.slice(5)
        const atoms_double_bond_removed =  atoms.map(
            (__atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return __atom
                }

                const shared_electrons = Set().intersection(atom_electrons, __atom.slice(5))

                if (shared_electrons.length !== 5) {
                    return __atom
                }

                // removed shared_electrons from __atom
                // lodash
                _.remove(__atom, (item) => {
                    return item === shared_electrons[0] || item === shared_electrons[1]
                })

                return __atom

            }
        )

        return [mmolecule[0][0], ...atoms_double_bond_removed]

    }

    const __doubleBond = (test_number) => {
        const atoms = mmolecule[0][1].slice(1)
        const atom_electrons = atom.slice(5)
        const r =  atoms.map(
            (__atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return false
                }

                const shared_electrons = Set().intersection(atom_electrons, __atom.slice(5))

                if (shared_electrons.length !== 5) {
                    return false
                }

                return shared_electrons

            }
        ).filter(
            (item) => {
                return item !== false
            }
        )

        if (test_number === 4) {
            r.length.should.be.equal(1)
        }

        return r.length > 0?r[0]:false

    }

    const __doubleBondCount = (test_number) => {
        const double_bonds = __doubleBond(test_number)

        return double_bonds === false ? 0 : double_bonds.length / 4
    }

    const __hydrogens = () => {
        if (typeof atom !== 'object') {
            console.log('Atom.js Atom must be an object. Got ' + atom + ' instead')
            throw new Error("Atom is not an object")
        }
        const atoms = mmolecule[0][1]
        return atoms.filter(
            (__atom) => {
                if (__atom[0] === "H") {
                    return Set().intersection(__atom.slice(5), atom.slice(5)).length > 0
                }
                return false
            }
        )
    }

    const __isProton = () => {
        return atom[0] === "H" && atom.length === 5
    }



    const __electron_haystack = (test_number) => {
        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(5)
        return atoms.reduce(
            (carry, __atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return carry
                }
                return [...carry, ...__atom.slice(5)]
            },
            []
        )
    }


    const __freeElectrons = (test_number) => {

        const atom_electrons = atom.slice(5)
        const electron_haystack = __electron_haystack(test_number)

        return atom_electrons.filter(
            (electron) => {
                return electron_haystack.indexOf(electron) === -1
            }
        )
    }

    const __usedElectrons = (test_number) => {

        const atom_electrons = atom.slice(5)
        const electron_haystack = __electron_haystack(test_number)

        return atom_electrons.filter(
            (electron) => {
                return electron_haystack.indexOf(electron) !== -1
            }
        )
    }
    
    
/*
First we determine the number of electrons the atom has in its outer shell.
Then we determine the maximum number of electrons the atom can have in its valence shell (2,8,18)
We then get the total number of free slots by subtracting number of electrons the atom has
in its outer shell * 2 from the maximum number of electrons the atom can have in its valence shell.
We then return the total number of free slots minus the number of slots already taken
*/
    const __freeSlots = (test_number) => {

        // Basic checks
        atom.should.not.be.null()
        atom.length.should.not.be.equal(0)
        current_atom_index.should.not.be.null()

        // C, 2 - 4 , max 4 bonds 0 free slots
        // N, 2-5  max 3 bonds, 1 free slot
        //O, 2-6 2 max 2 bonds  2 free slots
        // Al 2-8-3 ? max ?bonds free slots
        // the third shell can hold up to 18
        /*
        { group: 17,
  column: 'VIIA',
  atomic_number: 17,
  name: 'chlorine',
  atomic_weight: 35.45,
  electrons_per_shell: '2-8-7',
  state_of_matter: 'gas',
  subcategory: 'reactive nonmetal' }
         */
        const info = PeriodicTable[atom[0]]

        const number_of_shells = info["electrons_per_shell"].split("-").length
        const m = [2,8,18,32]

        // This is the maximum number of electrons the atom can have in its outer shell
        // For chlorine this is 18
        const max_possible_number_of_electrons = m[number_of_shells-1]

        // This is the number of bonds where the atom shares one of its outershell electrons
        // eg for oxygen this number is 2
        const electrons_per_shell = info["electrons_per_shell"].split("-")
        // eg oxygen m[1] - 6 = 8 - 6 so oxygen can form 2 bonds.
        const max_possible_number_of_shared_electron_bonds = m[electrons_per_shell.length-1] - electrons_per_shell.pop() * 1

        return max_possible_number_of_shared_electron_bonds - __bondCount()

    }
    
    const __isCarbocation = (test_number) => {
        // atom, current_atom_index, mmolecule
        return atom[0] === "C" && __isPositivelyCharged(test_number)
    }


    return {
        isCarbocation: __isCarbocation,
        isNegativelyCharged: __isNegativelyCharged,
        isPositivelyCharged: __isPositivelyCharged,
        isProton: __isProton,
        bonds: __Bonds,
        freeElectrons:  __freeElectrons,
        lonePairs: (test_number) => {


            // Remove current atom
            const molecule_minus_current_atom = mmolecule[0][1].filter(
                (atom , index) => {
                    return index !== current_atom_index
                }
            )

            // Get electrons from atoms (this won't include atoms from current atom)
            const electrons_from_other_atoms = molecule_minus_current_atom.reduce(
                (carry, __atom) => {
                    if (__atom === null || undefined === __atom.slice) {
                        return carry
                    }
                    __atom.slice(5).map(
                        (electron) => {
                            carry.push(electron)
                            return electron
                        }
                    )
                    return carry
                },
                []
            )

            // Check current atom electrons to see if they're being used
            const lone_electrons = atom.slice(5).filter(
                (electron, index) => {
                    return electrons_from_other_atoms.indexOf(electron) === -1
                }
            )

            return lone_electrons

        },
        doubleBond: __doubleBond,
        removeDoubleBond: __removeDoubleBond,
        hydrogens: __hydrogens,
        carbons: __carbons,
        freeSlots: __freeSlots,
        bondCount:__bondCount,
        doubleBondCount:__doubleBondCount,
        numberOfProtons:__numberOfProtons,
        numberOfElectrons:__numberOfElectrons
    }
}


module.exports = CAtom

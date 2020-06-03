const PeriodicTable = require('../Models/PeriodicTable')
const Set = require('../Models/Set')
const _ = require('lodash');

const CAtom = (atom, current_atom_index, mmolecule) => {

    const __carbons = (test_number) => {
        const atoms = mmolecule.slice(1)
        return atoms.filter(
            (__atom) => {
                if (__atom[0] === "C") {
                    return Set().intersection(__atom.slice(4), atom.slice(4)).length > 0
                }
                return false
            }
        )
    }
    
    const __removeDoubleBond = (test_number) => {
        const atoms = mmolecule.slice(1)
        const atom_electrons = atom.slice(4)
        const atoms_double_bond_removed =  atoms.map(
            (__atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return __atom
                }

                const shared_electrons = Set().intersection(atom_electrons, __atom.slice(4))

                if (shared_electrons.length !== 4) {
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

        return [mmolecule[0], ...atoms_double_bond_removed]

    }

    const __doubleBond = (test_number) => {
        const atoms = mmolecule.slice(1)
        const atom_electrons = atom.slice(4)
        const r =  atoms.map(
            (__atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return false
                }

                const shared_electrons = Set().intersection(atom_electrons, __atom.slice(4))

                if (shared_electrons.length !== 4) {
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

    const __hydrogens = () => {
        const atoms = mmolecule.slice(1)
        return atoms.filter(
            (__atom) => {
                if (__atom[0] === "H") {
                    return Set().intersection(__atom.slice(4), atom.slice(4)).length > 0
                }
                return false
            }
        )
    }

    const __isProton = () => {
        return atom[0] === "H" && atom.length === 4
    }

    const __Bonds = (atomic_symbol) => {
        const atoms = mmolecule.slice(1)
        const atom_electrons = atom.slice(4)
        const r =  atoms.map(
            (_atom, _atom_index) => {

                if (current_atom_index === _atom_index) {
                    return false
                }
                const shared_electrons = Set().intersection(atom_electrons, _atom.slice(4))

                return shared_electrons.reduce(
                    (c, electron) => {
                        c.push(
                            [
                                electron
                            ]
                        )
                        return c;
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

    const __electron_haystack = (test_number) => {
        const atoms = mmolecule.slice(1)
        const atom_electrons = atom.slice(4)
        return atoms.reduce(
            (carry, __atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return carry
                }
                return [...carry, ...__atom.slice(4)]
            },
            []
        )
    }


    const __freeElectrons = (test_number) => {

        const atom_electrons = atom.slice(4)
        const electron_haystack = __electron_haystack(test_number)

        return atom_electrons.filter(
            (electron) => {
                return electron_haystack.indexOf(electron) === -1
            }
        )
    }

    const __usedElectrons = (test_number) => {

        const atom_electrons = atom.slice(4)
        const electron_haystack = __electron_haystack(test_number)

        return atom_electrons.filter(
            (electron) => {
                return electron_haystack.indexOf(electron) !== -1
            }
        )
    }

    const __freeSlots = (test_number) => {
        /*
                          "C": {
        "group":14,
        "column":"IVA",
        "atomic_number":6,
        "name":"carbon",
        "atomic_weight":12.001,
        "electrons_per_shell": "2-4",
        "state_of_matter":"solid",
        "subcategory":"reactive nonmetal"
    },

    2 bonds, 2 free slots
       "O": {
        "group":16,
        "column":"VIA",
        "atomic_number":8,
        "name":"oxygen",
        "atomic_weight":15.999,
        "electrons_per_shell": "2-6",
        "state_of_matter":"gas",
        "subcategory":"reactive nonmetal"
    },

    3 bonds, 1 free slot
        "N": {
        "group":15,
        "column":"VA",
        "atomic_number":7,
        "name":"nitrogen",
        "atomic_weight":14.007,
        "electrons_per_shell": "2-5",
        "state_of_matter":"gas",
        "subcategory":"reactive nonmetal"
    },


        "Al": {
        "group":13,
        "column":"111A",
        "atomic_number":13,
        "name":"aluminium",
        "atomic_weight":26.982,
        "electrons_per_shell": "2-8-3",
        "state_of_matter":"solid",
        "subcategory":"post transition metal"
    },

    */
        // Basic checks
        atom.should.not.be.null()
        atom.length.should.not.be.equal(0)
        current_atom_index.should.not.be.null()
        mmolecule.should.not.be.null
        // C, 2 - 4 , max 4 bonds 0 free slots
        // N, 2-5  max 3 bonds, 1 free slot
        //O, 2-6 2 max 2 bonds  2 free slots
        // Al 2-8-3 ? max ?bonds free slots
        // the third shell can hold up to 18
        const info = PeriodicTable[atom[0]]
        const number_of_shells = info["electrons_per_shell"].split("-").length
        const max_number_of_electrons = number_of_shells === 1?2:number_of_shells==2?8:18
        const used_electrons = __usedElectrons(test_number)
        return max_number_of_electrons - used_electrons.length / 2
    }

    return {
        isProton: __isProton,
        bonds: __Bonds,
        freeElectrons:  __freeElectrons,
        lonePairs: (test_number) => {


            // Remove current atom
            const molecule_minus_current_atom = mmolecule.filter(
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
                    __atom.slice(4).map(
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
            const lone_electrons = atom.slice(4).filter(
                (electron, index) => {
                    return electrons_from_other_atoms.indexOf(electron) === -1
                }
            )

            return lone_electrons

        },
        doubleBond: __doubleBond,
        removeDoubleBond: __removeDoubleBond,
        hydrogens: __hydrogens(),
        carbons: __carbons(),
        freeSlots: __freeSlots
    }
}


module.exports = CAtom

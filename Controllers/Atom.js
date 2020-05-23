const PeriodicTable = require('../Models/PeriodicTable')
const Set = require('../Models/Set')

const CAtom = (atom, current_atom_index, mmolecule) => {

    const __removeDoubleBond = (test_number) => {
        const atoms = mmolecule.slice(1)
        const atom_electrons = atom.slice(4)
        const atoms_double_bond_removed =  atoms.map(
            (__atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return false
                }
                
                const shared_electrons = Set().intersection(atom_electrons, __atom.slice(4))

                if (test_number === 4) {
                    shared_electrons.length.should.be.equal(4)
                }
                
                if (shared_electrons.length !== 4) {
                    return __atom
                }
                
                // removed shared_electrons from __atom
                // lodash
                _.remove(__atom, (item) => {
                    item === shared_electrons[0] || item === shared_electrons[1]
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

                if (test_number === 4) {
                    shared_electrons.length.should.be.equal(4)
                }
                
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

    return {
        isProton: __isProton,
        bonds: __Bonds,
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
        hydrogens: __hydrogens(),
        freeSlots: (test_number) => {

            // Basic checks
            atom.should.not.be.null()
            atom.length.should.not.be.equal(0)
            current_atom_index.should.not.be.null()
            mmolecule.should.not.be.null


            const b = __Bonds(atom[0])
            if (atom[0]==="Cl") {
                b.length.should.be.equal(3)
            }
            const info = PeriodicTable[atom[0]]

            if (test_number ===3) {
                atom[0].should.be.equal("Al")
            }
            
            if (test_number ===4) {
                atom[0].should.be.equal("C")
                b.length.should.be.equal(4)
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
    */
            }

            // info[3] is the number of valence electron pairs
            // 8 - (3*2) / 2
            const number_of_valence_electrons = info["electrons_per_shell"].split("-").pop() *1
            const number_of_free_slots = 8 - (b*2)
            if (test_number ===4) {
                number_of_valence_electrons.should.be.equal(4)
                number_of_free_slots.should.be.equal(0)
            }
            return number_of_free_slots
           // return (8 - (info["electrons_per_shell"].split("-").pop()*2)) / 2
        }
    }
}


module.exports = CAtom

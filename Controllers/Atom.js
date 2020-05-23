const PeriodicTable = require('../Models/PeriodicTable')
const Set = require('../Models/Set')

const CAtom = (atom, current_atom_index, mmolecule) => {

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

            // info[3] is the number of valence electron pairs
            // 8 - (3*2) / 2
            return (8 - (info["electrons_per_shell"].split("-").pop()*2)) / 2
        }
    }
}


module.exports = CAtom

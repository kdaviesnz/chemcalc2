const PeriodicTable = require('../Models/PeriodicTable')
const Set = require('../Models/Set')

const CAtom = (atom, current_atom_index, mmolecule) => {

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

            if (test_number === 9999) {
                current_atom_index.should.be.equal(3)
            }

            if (test_number === 555) {
                current_atom_index.should.be.equal(2)
            }

            // Remove current atom
            const molecule_minus_current_atom = mmolecule.filter(
                (atom , index) => {
                    return index !== current_atom_index
                }
            )
            
            if (test_number === 9999) {
                molecule_minus_current_atom.length.should.be.equal(3) // 2 hydrogens + pKa
                molecule_minus_current_atom[2][0].should.be.equal(0)
            }

            // Get electrons from atoms (this won't include atoms from current atom)
            const electrons_from_other_atoms = molecule_minus_current_atom.reduce(
                (carry, __atom) => {
                    if (
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

            if (test_number === 9999) {
                console.log(current_atom_index)
                console.log(molecule_minus_current_atom)
                console.log(electrons_from_other_atoms)
                console.log(atom)
                console.log("ATTTom.js")
                process.exit()
            }

            // Check current atom electrons to see if they're being used
            const lone_electrons = atom.slice(4).filter(
                (electron, index) => {
                    return electrons_from_other_atoms.indexOf(electron) === -1
                }
            )

            return lone_electrons

        },
        freeSlots: () => {
            /*
  [ 'Al',13,3,3,'2iwcg1p9ek9z2dl8r','2iwcg1p9ek9z2dl8s','2iwcg1p9ek9z2dl8t','*2iwcg1p9ek9z2dl90*','2iwcg1p9ek9z2dl97','2iwcg1p9ek9z2dl9e' ],
   [ 'Cl',17,7,1,'2iwcg1p9ek9z2dl8u','2iwcg1p9ek9z2dl8v','2iwcg1p9ek9z2dl8w','2iwcg1p9ek9z2dl8x','2iwcg1p9ek9z2dl8y','2iwcg1p9ek9z2dl8z','*2iwcg1p9ek9z2dl90*','2iwcg1p9ek9z2dl8t'],
  [ 'Cl',17,7,1,'2iwcg1p9ek9z2dl91','2iwcg1p9ek9z2dl92','2iwcg1p9ek9z2dl93','2iwcg1p9ek9z2dl94','2iwcg1p9ek9z2dl95','2iwcg1p9ek9z2dl96','2iwcg1p9ek9z2dl97','*2iwcg1p9ek9z2dl90*' ],
  [ 'Cl',17,7,1,'2iwcg1p9ek9z2dl98','2iwcg1p9ek9z2dl99','2iwcg1p9ek9z2dl9a','2iwcg1p9ek9z2dl9b','2iwcg1p9ek9z2dl9c','2iwcg1p9ek9z2dl9d','2iwcg1p9ek9z2dl9e','2iwcg1p9ek9z2dl97' ]
             */
            const b = __Bonds(atom[0])
            if (atom[0]==="Cl") {
                b.length.should.be.equal(3)
            }
            const info = PeriodicTable[atom[0]]
            // info[3] is the number of valence electron pairs
            return (8 - (info[3]*2)) / 2
        }
    }
}


module.exports = CAtom

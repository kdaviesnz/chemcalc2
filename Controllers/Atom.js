const PeriodicTable = require('../Models/PeriodicTable')
const Set = require('../Models/Set')
const _ = require('lodash');
const AtomFactory = require('../Models/AtomFactory')

const CAtom = (atom, current_atom_index, mmolecule) => {

    mmolecule.length.should.be.equal(2) // molecule, units
    mmolecule[0].length.should.be.equal(2) // pKa, atoms

    if (atom === undefined) {
        console.log("Atom.js Warning: atom is undefined")
    }
    atom.should.be.an.Array()

    if (atom.length < 3) {
        console.log("Atom length is not greater than 3")
        console.log("Atom:")
        console.log(atom)
        throw new Error()
        process.exit()
    }
    atom.length.should.be.greaterThan(3)
    current_atom_index.should.be.Number()

    const __indexedTripleBonds = (filter_by) => {

        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(5)

        filter_by.should.be.an.String()

        const r =  _.cloneDeep(atoms).reduce(

            (bonds, _atom, _atom_index) => {


                if ((_.isEqual(_.cloneDeep(atom).sort(), _.cloneDeep(_atom).sort())) || _atom[0]=== filter_by) {
                    return bonds
                }

                const shared_electrons = Set().intersection(atom_electrons, _atom.slice(5))


                if (atom[0]==="N" && _atom[0]==="C") {
                   // console.log('shared_electrons')
                    // console.log(shared_electrons)
                    // console.log('Atom.js')
                }


                if (shared_electrons.length !==6) {
                    return bonds
                }

                bonds.push({
                    'atom': _atom,
                    'atom_index': _atom_index,
                    'shared_electrons': shared_electrons
                })


                if (atom[0]==="N" && _atom[0]==="C") {
                   // console.log(bonds)
                 //   console.log('Atom.js')
                   // process.exit()
                }

                return bonds

            },
            []
        )

        return r



    }


    const __indexedDoubleBonds = (filter_by) => {

        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(5)

        filter_by.should.be.an.String()

        let r =  _.cloneDeep(atoms).reduce(

            (bonds, _atom, _atom_index) => {

                if ((_.isEqual(_.cloneDeep(atom).sort(), _.cloneDeep(_atom).sort())) || _atom[0]=== filter_by) {
                    return bonds
                }

                const shared_electrons = Set().intersection(atom_electrons, _atom.slice(5))


                if (shared_electrons.length !==4) {
                    return bonds
                }

                bonds.push({
                    'atom': _atom,
                    'atom_index': _atom_index,
                    'shared_electrons': shared_electrons
                })

                return bonds

            },
            []
        )

/*
        if (r.length > 0) {
            console.log("_indexedDoubleBonds()")
            console.log(r)
            process.error()
        }
 */
        /*
        r:
        [
  {
    atom: [
      'O',
      8,
      6,
      2,
      0,
      '2yyvqtf2zxko6cfqsg',
      '2yyvqtf2zxko6cfqsh',
      '2yyvqtf2zxko6cfqsi',
      '2yyvqtf2zxko6cfqsj',
      '2yyvqtf2zxko6cfqsk',
      '2yyvqtf2zxko6cfqsl',
      '2yyvqtf2zxko6cfqse',
      '2yyvqtf2zxko6cfqsd'
    ],
    atom_index: 3,
    shared_electrons: [
      '2yyvqtf2zxko6cfqsd',
      '2yyvqtf2zxko6cfqse',
      '2yyvqtf2zxko6cfqsl',
      '2yyvqtf2zxko6cfqsk'
    ]
  },
  {
    atom: [
      'O',
      8,
      6,
      2,
      0,
      '2yyvqtf2zxko6cfqsm',
      '2yyvqtf2zxko6cfqsn',
      '2yyvqtf2zxko6cfqso',
      '2yyvqtf2zxko6cfqsp',
      '2yyvqtf2zxko6cfqsq',
      '2yyvqtf2zxko6cfqsr',
      '2yyvqtf2zxko6cfqsc',
      '2yyvqtf2zxko6cfqsb'
    ],
    atom_index: 4,
    shared_electrons: [
      '2yyvqtf2zxko6cfqsb',
      '2yyvqtf2zxko6cfqsc',
      '2yyvqtf2zxko6cfqsr',
      '2yyvqtf2zxko6cfqsq'
    ]
  }
]


         */


        // Filter out "double" bonds that are actually triple bonds
        const t_bonds = __indexedTripleBonds("H")
        if (t_bonds.length>0) {
            // Get indexes of the double bonds
            const t_bond_indexes = t_bonds.map((b)=>{
                return b.atom_index
            })
            // Filter doublke bonds that have indexes in t_bond_indexes
            //console.log(t_bond_indexes)
            r = r.filter((db)=>{
                return t_bond_indexes.indexOf(db.atom_index)===-1
            })
        }

        return r


    }


    const __indexedBonds = function(filter_by)  {

        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(5)

        filter_by.should.be.an.String()


        let r =  _.cloneDeep(atoms).reduce(

            (bonds, _atom, _atom_index) => {

                if (undefined === _atom.sort) {
                    return bonds
                }

                if ((_.isEqual(_.cloneDeep(atom).sort(), _.cloneDeep(_atom).sort())) || _atom[0]=== filter_by) {
                    return bonds
                }

                const shared_electrons = Set().intersection(atom_electrons, _atom.slice(5))

                if (shared_electrons.length === 0) {
                    return bonds
                }

                bonds.push({
                    'atom': _atom,
                    'atom_index': _atom_index,
                    'shared_electrons': shared_electrons,
                    'bond_type': shared_electrons.length === 2? "":"="
                })

                return bonds

            },
            []
        )

        // Filter out "single" bonds that are actually double bonds
        const d_bonds = __indexedDoubleBonds("H")
        if (d_bonds.length>0) {
            // Get indexes of the double bonds
            const d_bond_indexes = d_bonds.map((b)=>{
                return b.atom_index
            })
            // Filter single bonds that have indexes in d_bond_indexes
            //console.log(d_bond_indexes)
            r = r.filter((sb)=>{
                //console.log(sb.atom_index)
                //console.log(d_bond_indexes.indexOf(sb.atom_index))
                //console.log(d_bond_indexes.indexOf(sb.atom_index)===-1)
                // 3,4 are double bond indexes
                return d_bond_indexes.indexOf(sb.atom_index)===-1
            })
            //process.error()
        }

        // Filter out "single" bonds that are actually triple bonds
        const t_bonds = __indexedTripleBonds("H")
        if (t_bonds.length>0) {
            // Get indexes of the double bonds
            const t_bond_indexes = t_bonds.map((b)=>{
                return b.atom_index
            })
            // Filter single bonds that have indexes in t_bont_indexes
            //console.log(t_bond_indexes)
            r = r.filter((sb)=>{
                return t_bond_indexes.indexOf(sb.atom_index)===-1
            })
        }

        return r


    }

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
        /*
        if (atom[0] === 'C') {
            console.log(atom)
            console.log("atom.js Is positively charged bond count: " + __bondCount(test_number) + " neutral atom max bond count:" + __neutralAtomMaxBondCount() + " number of electrons " + __numberOfElectrons() + ' number of protons ' + __numberOfProtons())
        }*/
        //return atom[4] === '+' || (__bondCount(test_number) > __neutralAtomMaxBondCount() || __numberOfElectrons() < __numberOfProtons())
        return atom[4] === '+' || atom[4] === 1
    }

    const __isNegativelyCharged = (test_number) => {

        if (atom[4] === -1 || atom[4] === "-") {
            return true
        }

        return false

        const double_bonds = __doubleBond(test_number)
        const number_of_double_bonds = double_bonds.length > 3 ? double_bonds.length / 4 : 0

        // Get total number of electrons and if greater than the number of protons return true
        console.log(current_atom_index)
        console.log('Bond count' +__bondCount())
        console.log('number_of_double_bonds' +number_of_double_bonds)
        console.log('__neutralAtomMaxBondCount' + __neutralAtomMaxBondCount())
        console.log('__numberOfProtons' + __numberOfProtons())
        console.log('__numberOfHydrogens' + __hydrogens().length)
        console.log('__numberOfElectrons' + __numberOfElectrons())

       // return __bondCount(test_number) + (number_of_double_bonds) < __neutralAtomMaxBondCount()

        if ((__bondCount(test_number) + (number_of_double_bonds)) > __neutralAtomMaxBondCount() ) {
            return false
        }
        return __numberOfElectrons() - (__bondCount() + number_of_double_bonds )  > __numberOfProtons()
        
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
        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(5)
        const atoms_double_bond_removed =  atoms.map(
            (__atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return __atom
                }

                const shared_electrons = Set().intersection(atom_electrons, __atom.slice(5))

                // Double bond not found
                if (shared_electrons.length !== 4) {
                    return __atom
                }

                // removed shared_electrons from __atom
                // lodash
                // Change bond to a single bond
                // Do not remove electrons from source atom (atom)
                _.remove(__atom, (item) => {
                    return item === shared_electrons[0] || item === shared_electrons[1]
                })

                // Mark atom as positively charged
                __atom[4] = '+'

                return __atom

            }
        )

        // Atom we are removing the double bond from should still have the same number of electrons
        atom.slice(5).length.should.be.equal(atom_electrons.length)

        // We should still have the same number of atoms
        atoms.length.should.be.equal(mmolecule[0][1].length)

        return [mmolecule[0][0], atoms_double_bond_removed]

    }

    const __doubleBond = () => {

        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(5)
        const r =  atoms.map(
            (__atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return false
                }

                const shared_electrons = Set().intersection(atom_electrons, __atom.slice(5))

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

        return r.length > 0?r[0]:false

    }

    const __tripleBond = () => {

        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(5)
        const r =  atoms.map(
            (__atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return false
                }

                const shared_electrons = Set().intersection(atom_electrons, __atom.slice(5))

                if (shared_electrons.length !== 6) {
                    return false
                }

                return shared_electrons

            }
        ).filter(
            (item) => {
                return item !== false
            }
        )

        return r.length > 0?r[0]:false

    }


    const __doubleBondCount = (test_number) => {
        const double_bonds = __doubleBond(test_number)

        return double_bonds === false ? 0 : double_bonds.length / 4
    }


    const __tripleBondCount = (test_number) => {
        const triple_bonds = __tripleBond(test_number)
        return triple_bonds === false ? 0 : triple_bonds.length / 4
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


                if (undefined === __atom.slice) {
                    return carry
                }

                if (current_atom_index === __atom_index ) {
                    return carry
                }
                return [...carry, ...__atom.slice(5)]
            },
            []
        )
    }


    const __freeElectrons = (test_number) => {


        const atom_electrons = atom.slice(5)
        const electron_haystack = atom[0] === "Hg"?__electron_haystack(test_number).slice(0,3):__electron_haystack(test_number)

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
    const __freeSlots = function(test_number)  {

        // Basic checks
        atom.should.not.be.null()
        atom.length.should.not.be.equal(0)
        current_atom_index.should.not.be.null()

        if (atom[0]==="N") {
            if (this.indexedBonds("").length + this.indexedDoubleBonds("").length === 3) {
                return 1
            }
        }

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

        atom[0].should.be.an.String()
        const info = PeriodicTable[atom[0]]

        const number_of_shells = info["electrons_per_shell"].split("-").length
        const m = [2,8,18,32,50,72,98]

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
        isBondedTo: (sibling_atom) => {
            const shared_electrons = Set().intersection(atom.slice(5), sibling_atom.slice(5))
            return shared_electrons.length > 0
        },
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
        tripleBond: __tripleBond,
        removeDoubleBond: __removeDoubleBond,
        hydrogens: __hydrogens,
        carbons: __carbons,
        freeSlots: __freeSlots,
        bondCount:__bondCount,
        doubleBondCount:__doubleBondCount,
        tripleBondCount:__tripleBondCount,
        numberOfProtons:__numberOfProtons,
        numberOfElectrons:__numberOfElectrons,
        indexedBonds: __indexedBonds,
        indexedDoubleBonds: __indexedDoubleBonds,
        indexedTripleBonds: __indexedTripleBonds,
        atom: atom,
        symbol:  atom[0],
        atomIndex: current_atom_index,
        charge: atom[4]
    }
}


module.exports = CAtom

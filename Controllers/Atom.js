const PeriodicTable = require('../Models/PeriodicTable')
const Set = require('../Models/Set')
const _ = require('lodash');
const AtomFactory = require('../Models/AtomFactory')

const CAtom = (atom, current_atom_index, mmolecule) => {

    mmolecule.length.should.be.equal(2) // molecule, units
    mmolecule[0].length.should.be.equal(2) // pKa, atoms
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

    const __isPositivelyCharged = (test_number) => {
        
       /*
How to determine if an atom is positively charged (cation)
Eg Carbon
A neutral carbon atom has 4 free slots.
If we remove one of the slots we now have a carbocation.
Neutral carbon free slots count (4) > carbon with a free slot removed free slots count (3).
const neutral_carbon = AtomFactory(“C”, 0)
const neutral_carbon_free_slot_count = neutral_carbon.__freeSlots().length
const is_positively_charged = neutral_carbon_free_slot_count  > atom.__freeSlots().length
But what if the free slot was removed by a bond? In that case we have lost an electron but gained another:
Neutral carbon free slots count (4) > carbon with a free slot removed free slots count (3) + number of bonds atom has (1)
And if two bonds:
Neutral carbon free slots count (4) > carbon with two free slots removed free slots count (2) + number of bonds atom has (2)
And if three bonds:
Neutral carbon free slots count (4) > carbon with three free slots removed free slots count (1) + number of bonds atom has (3)
Taking the last example if we remove the last free slot without adding a bond:
Neutral carbon free slots count (4) > carbon with four free slots removed free slots count (0) + number of bonds atom has (3)
Hence:
const neutral_atom= AtomFactory(atom[0], 0)
const neutral_atom_free_slot_count = neutral_atom.__freeSlots().length
const is_positively_charged = neutral_atom_free_slot_count  > (atom.__freeSlots().length + atom.__bonds.length)

Example oxygen with 2 bonds
2 > (0 + 2)
*/ 
        
        // atomic symbol, proton count, valence count,  number of bonds, velectron1, velectron2, velectron3
        // Electrophile
        // 5.2 test 5, [C+] carbocation electrophile so should return true
         // We need to also take into account electrons used in bonds
        // __Bonds = (atomic_symbol)
        //const electrons_used_in_bonds_count = __Bonds(atom[0])
        //const is_positively_charged = (atom[3]*2) > (atom.slice(4).length)

        const neutral_atom= AtomFactory(atom[0], 0)
        const neutral_atom_free_slot_count = neutral_atom[3]
       // console.log(neutral_atom)
       // console.log(atom)
       // console.log(neutral_atom_free_slot_count)
       // console.log(__bondCount(test_number))
        //const is_positively_charged = neutral_atom_free_slot_count  > (__freeSlots(test_number) + __bondCount(atom[0], test_number) + __doubleBondCount(test_number))
        // eg H3)
        const is_positively_charged =  neutral_atom_free_slot_count  < __bondCount(test_number)

        return is_positively_charged
    }
    
    const __isNegativelyCharged = (test_number) => {
        
      /*
How to determine if an atom is negatively charged (ion)
Eg [Br-]
A neutral Br atom has 7 valence electrons.
Hence a Br atom that has more than 7 valence electrons is negatively charged.
But what if the Bromine atom has more than 7 valence electrons because of a bond?
In that case we need to take into account that bond.
Hence:
const is_negatively_charged = (atom.slice(4).length - atom.__bonds.length) > atom[2]

Example oxygen with 2 bonds
(8 - 2) > 6
*/
        // Nucleophile
        // 5.1 test 5, [Br-] nucleophile so should return true
        // atomic symbol, proton count, valence count,  number of bonds, velectron1, velectron2, velectron3
        // @todo
        // We need to also take into account electrons used in bonds
        // __Bonds = (atomic_symbol)
        //const electrons_used_in_bonds_count = __Bonds(atom[0])
        // const is_negatively_charged = (atom[3] *2) < (atom.slice(4).length)
        // const is_negatively_charged = atom.slice(4).length > 8
        const is_negatively_charged =  (atom.slice(5).length - __Bonds(atom[0]).length) > atom[2]
        if (test_number == 3.2) {
            // CO:C (nucleophile) ------> AlCl3 (electrophile) O: is the nucleophile (base, donates an electron pair), Al is the electrophile (acid, accepts an electron pair) See 2.12 Organic Chemistry 8th Edition P76
/*
[ 'O',
  8,
  6,
  2,
  'bqdtz06g6kdjb9unn',
  'bqdtz06g6kdjb9uno',
  'bqdtz06g6kdjb9unp',
  'bqdtz06g6kdjb9unq',
  'bqdtz06g6kdjb9unr',
  'bqdtz06g6kdjb9uns',
  'bqdtz06g6kdjb9unm',
  'bqdtz06g6kdjb9unw' ]

 */
            is_negatively_charged.should.be.equal(false)
        }
        if (test_number === 5.1) {
            is_negatively_charged.should.be.equal(true)
        }
        return is_negatively_charged
        
    }
    
    const __carbons = (test_number) => {
        const atoms = mmolecule[0][1].slice(1)
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
        const atoms = mmolecule[0][1].slice(1)
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
        const atoms = mmolecule.slice(1)
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

        if (test_number == 3.1) {
            /*
            electrophile should have free slots
{ group: 13,
  column: '111A',
  atomic_number: 13,
  name: 'aluminium',
  atomic_weight: 26.982,
  electrons_per_shell: '2-8-3',
  state_of_matter: 'solid',
  subcategory: 'post transition metal' }


             */
        }

        if (test_number == 5.1) {
            /*
            { group: 17,
  column: 'VIIA',
  atomic_number: 35,
  name: 'bromine',
  atomic_weight: 79.904,
  electrons_per_shell: '2-8-18-7',
  state_of_matter: 'liquid',
  subcategory: 'reactive nonmetal' }

             */
        }
        const number_of_shells = info["electrons_per_shell"].split("-").length
        const m = [2,8,18,32]

        // This is the maximum number of electrons the atom can have in its outer shell
        const max_possible_number_of_electrons = m[number_of_shells-1]

        if (test_number == 3.1) {
            max_possible_number_of_electrons.should.be.equal(18)
        }
        if (test_number == 5.1) {
            max_possible_number_of_electrons.should.be.equal(32)
        }

        // This is the number of bonds where the atom shares one of its outershell electrons
        const max_possible_number_of_shared_electron_bonds = info["electrons_per_shell"].split("-").pop() * 1

        if (test_number == 3.1 ) {
            if (atom[0] === 'Al') {
                max_possible_number_of_shared_electron_bonds.should.be.equal(3)
            }
        }

        if (test_number == 5.1) {
            max_possible_number_of_shared_electron_bonds.should.be.equal(7)
        }

        const used_electrons = __usedElectrons(test_number)

        if (test_number == 3.1) {
            if (atom[0] === 'Al') {
                used_electrons.length.should.be.equal(6)
            }
        }

        if (test_number == 5.1) {
            used_electrons.length.should.be.equal(0)
        }

        let free_slots = null

        if (used_electrons.length <= max_possible_number_of_shared_electron_bonds *2) {
            // 18 - 6 / 2
            free_slots = (max_possible_number_of_electrons - (max_possible_number_of_shared_electron_bonds*2)) / 2
        } else {
            free_slots = (max_possible_number_of_electrons - used_electrons.length) / 2
        }

        if (test_number == 3.1) { // AlCl3
            if (atom[0] === 'Al') {
                free_slots.should.be.equal(6)
            }
        }

        if (test_number == 5.1) { //[Br-]
            used_electrons.length.should.be.equal(0)
        }

        return free_slots < 0? 0 : free_slots
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
        hydrogens: __hydrogens(),
        carbons: __carbons,
        freeSlots: __freeSlots,
        bondCount:__bondCount,
        doubleBondCount:__doubleBondCount,
    }
}


module.exports = CAtom

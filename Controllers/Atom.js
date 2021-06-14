const PeriodicTable = require('../Models/PeriodicTable')
const Set = require('../Models/Set')
const _ = require('lodash');
const AtomFactory = require('../Models/AtomFactory')
const uniqid = require('uniqid')
const Typecheck = require('../Typecheck')
const Constants = require("../Constants")

const CAtom = (atom, current_atom_index, mmolecule) => {

    Typecheck(
        {name:"atom", value:atom, type:"array"},
        {name:"current_atom_index", value:current_atom_index, type:"number"},
        {name:"mmolecule", value:mmolecule, type:"array"},
    )

    mmolecule.length.should.be.equal(2) // molecule, units
    mmolecule[0].length.should.be.equal(2) // pKa, atoms

    if (atom === undefined) {
        console.log("Atom.js Warning: atom is undefined")
    }

    atom.slice(0, Constants().electron_index).length.should.be.greaterThan(4)
    atom.slice(Constants().electron_index).length.should.be.lessThanOrEqual(Constants().max_valence_electrons[atom[0]])

    const __atomId =  function() {
        return this.atom.atomId()
    }

    const __shared_electrons = () => {

        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(Constants().electron_index)

        const total_shared_electrons =  _.cloneDeep(atoms).reduce(

            (shared_electrons, _atom, _atom_index) => {
                shared_electrons = shared_electrons.concat(Set().intersection(atom_electrons, _atom.slice(Constants().electron_index)))
                return shared_electrons
            },
            []
        )

        return Set().unique(total_shared_electrons);

    }

    const __indexedTripleBonds = (filter_by) => {

        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(Constants().electron_index)

        filter_by.should.be.an.String()

        const r =  _.cloneDeep(atoms).reduce(

            (bonds, _atom, _atom_index) => {


                if ((_.isEqual(_.cloneDeep(atom).sort(), _.cloneDeep(_atom).sort())) || _atom[0]=== filter_by) {
                    return bonds
                }

                const shared_electrons = Set().intersection(atom_electrons, _atom.slice(Constants().electron_index))


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
        const atom_electrons = atom.slice(Constants().electron_index)

        filter_by.should.be.an.String()

        let r =  _.cloneDeep(atoms).reduce(

            (bonds, _atom, _atom_index) => {

                if(_atom.type !== undefined) {
                    return bonds
                }

                if(atom.type !== undefined) {
                    return bonds
                }

                if ((_.isEqual(_.cloneDeep(atom).sort(), _.cloneDeep(_atom).sort())) || _atom[0]=== filter_by) {
                    return bonds
                }

                const shared_electrons = Set().intersection(atom_electrons, _atom.slice(Constants().electron_index))


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
        const atom_electrons = atom.slice(Constants().electron_index)

        filter_by.should.be.an.String()


        let r =  _.cloneDeep(atoms).reduce(

            (bonds, _atom, _atom_index) => {

                if (undefined === _atom.sort) {
                    return bonds
                }

                if ((_.isEqual(_.cloneDeep(atom).sort(), _.cloneDeep(_atom).sort())) || _atom[0]=== filter_by) {
                    return bonds
                }

                const shared_electrons = Set().intersection(atom_electrons, _atom.slice(Constants().electron_index))

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

     const __Bonds = function(DEBUG)  {

        const atoms = mmolecule[0][1]

         atoms.map((_atom)=>{
             Typecheck(
                 {name:"_atom", value:_atom, type:"array"},
             )
         })

        const atom_electrons = this.atom.slice(Constants().electron_index)

        Typecheck(
            {name:"atoms", value:atoms, type:"array"},
            {name:"atom_electrons", value:atom_electrons, type:"array"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        const r =  atoms.map(

            (_atom, _atom_index) => {

                if (current_atom_index === _atom_index) {
                    return false
                }

                Typecheck(
                    {name:"_atom", value:_atom, type:"array"}
                )

                const _atomObject = CAtom(_atom, _atom_index, mmolecule)
                const shared_electrons = this.electronsSharedWithSibling(_atomObject, DEBUG)

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

    const __bondCount = function(test_number) {

        mmolecule[0][1].map((_atom)=>{
            Typecheck(
                {name:"_atom", value:_atom, type:"array"},
            )
        })

        return this.bonds().filter((item)=>{
            return item.length > 0
        }).length

    }

    const __numberOfProtons = () => {
        // Get number of protons
        const info = PeriodicTable[atom[0]]
        return number_of_protons = info['atomic_number'] * 1
    }

    const __numberOfElectrons = function() {

        // Get number of electrons
        const info = PeriodicTable[this.atom[0]]
        return this.atom.slice(Constants().electron_index).length + ((info["electrons_per_shell"].split("-")).slice(0, -1).reduce((a, b) => a*1 + b*1, 0)) * 1

    }

    const __numberOfElectronsV2 = () => {
        return atom.slice(Constants().electron_index).length
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
        return atom[4] === '+' || atom[4] === 1
    }

    const __isNegativelyCharged = function(test_number) {

        if (atom[4] === -1 || atom[4] === "-") {
            return true
        }

        return false

        const double_bonds = __doubleBond(test_number)
        const number_of_double_bonds = double_bonds.length > 3 ? double_bonds.length / 4 : 0

        // Get total number of electrons and if greater than the number of protons return true
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
                    return Set().intersection(__atom.slice(Constants().electron_index), atom.slice(Constants().electron_index)).length > 0
                }
                return false
            }
        )
    }

    const __removeDoubleBond = (test_number) => {
        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(Constants().electron_index)
        const atoms_double_bond_removed =  atoms.map(
            (__atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return __atom
                }

                const shared_electrons = Set().intersection(atom_electrons, __atom.slice(Constants().electron_index))

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
        atom.slice(Constants().electron_index).length.should.be.equal(atom_electrons.length)

        // We should still have the same number of atoms
        atoms.length.should.be.equal(mmolecule[0][1].length)

        return [mmolecule[0][0], atoms_double_bond_removed]

    }

    const __doubleBond = () => {

        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(Constants().electron_index)
        const r =  atoms.map(
            (__atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return false
                }

                const shared_electrons = Set().intersection(atom_electrons, __atom.slice(Constants().electron_index))

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
        const atom_electrons = atom.slice(Constants().electron_index)
        const r =  atoms.map(
            (__atom, __atom_index) => {

                if (current_atom_index === __atom_index) {
                    return false
                }

                const shared_electrons = Set().intersection(atom_electrons, __atom.slice(Constants().electron_index))

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
                    return Set().intersection(__atom.slice(Constants().electron_index), atom.slice(Constants().electron_index)).length > 0
                }
                return false
            }
        )
    }

    const __isProton = () => {
        return atom[0] === "H" && atom.length === Constants().electron_index
    }



    const __electron_haystack = (test_number) => {
        const atoms = mmolecule[0][1]
        const atom_electrons = atom.slice(Constants().electron_index)
        return atoms.reduce(
            (carry, __atom, __atom_index) => {


                if (undefined === __atom.slice) {
                    return carry
                }

                if (current_atom_index === __atom_index ) {
                    return carry
                }
                return [...carry, ...__atom.slice(Constants().electron_index)]
            },
            []
        )
    }


    const __freeElectrons = (test_number) => {


        const atom_electrons = atom.slice(Constants().electron_index)
        const electron_haystack = atom[0] === "Hg"?__electron_haystack(test_number).slice(0,3):__electron_haystack(test_number)

        return atom_electrons.filter(
            (electron) => {
                return electron_haystack.indexOf(electron) === -1
            }
        )
    }

    const __usedElectrons = (test_number) => {

        const atom_electrons = atom.slice(Constants().electron_index)
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
        this.atom.should.not.be.null()
        this.atom.length.should.not.be.equal(0)

        const maximum_number_of_electrons = Constants().max_valence_electrons[this.symbol]
        maximum_number_of_electrons.should.not.be.undefined()

        if (maximum_number_of_electrons - this.electrons().length === 0) {
            return 0
        } else {
            return (maximum_number_of_electrons - this.electrons().length) / 2
        }

    }

    const __isCarbocation = (test_number) => {
        // atom, current_atom_index, mmolecule
        return atom[0] === "C" && __isPositivelyCharged(test_number)
    }

    const __removeFreeElectrons = (number_of_electrons_to_remove) => {
        let i = 0
        for (i=0;i<number_of_electrons_to_remove;i++) {
            _.remove(atom, (electron) => {
                const free_electrons = __freeElectrons()
                return free_electrons.indexOf(electron) !==-1
            })
        }
    }

    const __addElectronsFromOtherAtom = function(electrons) {

        Typecheck(
            {name:"electrons", value:electrons, type:"array"},
        )

        electrons.typeCheck('electron', 'string')
        this.atom.addElectrons(electrons)

    }

    const __addElectrons = (number_of_electrons_to_add) => {
        let i = 0
        for (i=0;i<number_of_electrons_to_add;i++) {
            atom.push(uniqid())
        }
    }

    const __neutralAtomMaxNumberOfBonds = () => {
        const map = {
            "H":1,
            "O":2,
            "N":3,
            "C":4
        }
        return map[atom[0]]
    }

    const __numberOfBondsNoHydrogens = () => {
        const single_bonds = __indexedBonds("").filter((b)=> {
            return b.atom[0] !== "H"
        })
        const double_bonds = __indexedDoubleBonds("").filter((d)=> {
            return d.atom[0] !== "H"
        })
        const triple_bonds = __indexedTripleBonds("").filter((t)=> {
            return t.atom[0] !== "H"
        })
        return single_bonds.length + (double_bonds.length*2) + (triple_bonds.length*3)
    }

    const __numberOfBonds = () => {
        return __hydrogens().length + __numberOfBondsNoHydrogens()
    }

    const __isCoordinateCovalentBond = function(sibling_atom, DEBUG) {

        Typecheck(
            {name:"sibling_atom", value:sibling_atom, type:"object"},
            {name:"sibling_atom.atom", value:sibling_atom.atom, type:"array"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        // In a coordinate covalent bond one of the atoms donates both of the shared electrons
        const shared_electrons = this.electronsSharedWithSibling(sibling_atom)
        if (shared_electrons.length === 0) {
            return false
        }

        // If there is a coordinate covalent bond then one of the atoms will have more than neutral number of electrons.
        return ((this.neutralAtomMaxNumberOfBonds() > Constants().max_valence_electrons[this.symbol]) || (sibling_atom.neutralAtomMaxNumberOfBonds() > Constants().max_valence_electrons[sibling_atom[sibling_atom.symbol]]))

    }

    const __electronsSharedWithSibling = function(sibling_atom, DEBUG) {

        Typecheck(
            {name:"sibling_atom", value:sibling_atom, type:"object"},
            {name:"sibling_atom.atom", value:sibling_atom.atom, type:"array"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        if (undefined === sibling_atom) {
            throw new Error("sibling atom object is undefined")
        }

        if (undefined === sibling_atom.atom) {
            throw new Error("sibling atom is undefined")
        }

        return Set().intersection(this.atom.slice(Constants().electron_index), sibling_atom.atom.slice(Constants().electron_index))

    }

    const __isBondedTo = function(sibling_atom, DEBUG) {

        Typecheck(
            {name:"sibling_atom", value:sibling_atom, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        if (undefined === sibling_atom) {
            throw new Error("sibling atom object is undefined")
        }

        if (undefined === sibling_atom.atom) {
            throw new Error("sibling atom is undefined")
        }

        const shared_electrons = this.electronsSharedWithSibling(sibling_atom)


        return shared_electrons.length === 2

    }

    const __isDoubleBondedTo = function(sibling_atom, DEBUG) {

        Typecheck(
            {name:"sibling_atom", value:sibling_atom, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        if (undefined === sibling_atom) {
            throw new Error("sibling atom object is undefined")
        }

        if (undefined === sibling_atom.atom) {
            throw new Error("sibling atom is undefined")
        }

        const shared_electrons = this.electronsSharedWithSibling(sibling_atom)

        if (DEBUG) {
            console.log("CAtom __isDoubleBondedTo() Got " + shared_electrons.length + " shared electrons")
        }

        return shared_electrons.length === 4
    }

    const __isTripleBondedTo = function(sibling_atom, DEBUG) {

        Typecheck(
            {name:"sibling_atom", value:sibling_atom, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        if (undefined === sibling_atom) {
            throw new Error("sibling atom object is undefined")
        }

        if (undefined === sibling_atom.atom) {
            throw new Error("sibling atom is undefined")
        }

        const shared_electrons = this.electronsSharedWithSibling(sibling_atom)

        if (DEBUG) {
            console.log("CAtom __isDoubleBondedTo() Got " + shared_electrons.length + " shared electrons")
        }

        return shared_electrons.length === 6
    }

    const __isCoordinateCovalentBondDonator = function(sibling_atom)  {

        Typecheck(
            {name:"sibling_atom", value:sibling_atom, type:"object"}
        )

        if(!this.isCoordinateCovalentBond(sibling_atom)) {
            return false
        }
        return this.neutralAtomMaxNumberOfBonds() > Constants().max_valence_electrons[this.symbol]
    }

    const __removeElectrons = function(electrons) {

        Typecheck(
            {name: "electrons", value: electrons, type: "array"},
            {name: "this.atom", value: this.atom, type: "array"}
        )

        const atom_length_at_start = _.cloneDeep(this.atom.length)
        this.atom.removeElectrons(electrons)
        atom_length_at_start.should.be.greaterThan(this.atom.length, "Failed to remove electrons")
    }

    const __removeHydrogenOnCarbonBond = function(hydrogen_atom, DEBUG) {

        Typecheck(
            {name:"hydrogen_atom", value:hydrogen_atom, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        const number_of_hydrogens_at_start = _.cloneDeep(this.getHydrogenBonds().length)
        const number_of_carbons_on_hydrogen_at_start = _.cloneDeep(hydrogen_atom.carbonBonds().length)

        const hydrogen_shared_electrons = this.electronsSharedWithSibling(hydrogen_atom).filter((electron) => {
            Typecheck(
                {name:"electron", value:electron, type: "string"},
            )
            return electron[0] === "H"
        })

        const carbon_shared_electrons = this.electronsSharedWithSibling(hydrogen_atom).filter((electron) => {
            Typecheck(
                {name:"electron", value:electron, type: "string"},
            )
            return electron[0] === "C"
        })

        const atom_starting_length = _.cloneDeep(this.atom.length)

        if (DEBUG) {
            console.log(this.atom)
            console.log("Removing " + hydrogen_shared_electrons[0])
        }

        if (carbon_shared_electrons.length === 1 && hydrogen_shared_electrons.length === 1) {
            this.removeElectrons([hydrogen_shared_electrons[0]])
            hydrogen_atom.removeElectrons([carbon_shared_electrons[0]])
        } else if(DEBUG) {
            console.log("CAtom __removeHydrogenBond() No shared electrons found")
        }

        if (DEBUG) {
            console.log(this.atom)
        }

        atom_starting_length.should.be.greaterThan(this.atom.length)
        number_of_hydrogens_at_start.should.be.greaterThan(this.getHydrogenBonds().length)
        number_of_carbons_on_hydrogen_at_start.should.be.greaterThan(hydrogen_atom.carbonBonds().length)

    }

    const __removeHydrogenOnNitrogenBond = function(hydrogen_atom, DEBUG) {

        Typecheck(
            {name:"hydrogen_atom", value:hydrogen_atom, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        const number_of_hydrogens_at_start = _.cloneDeep(this.getHydrogenBonds().length)
        const number_of_nitrogens_on_hydrogen_at_start = _.cloneDeep(hydrogen_atom.nitrogenBonds().length)

        const hydrogen_shared_electrons = this.electronsSharedWithSibling(hydrogen_atom).filter((electron) => {
            Typecheck(
                {name:"electron", value:electron, type: "string"},
            )
            return electron[0] === "H"
        })

        const nitrogen_shared_electrons = this.electronsSharedWithSibling(hydrogen_atom).filter((electron) => {
            Typecheck(
                {name:"electron", value:electron, type: "string"},
            )
            return electron[0] === "N"
        })

        const atom_starting_length = _.cloneDeep(this.atom.length)

        if (DEBUG) {
            console.log(this.atom)
            console.log("Removing " + hydrogen_shared_electrons[0])
        }

        if (nitrogen_shared_electrons.length === 1 && hydrogen_shared_electrons.length === 1) {
            this.removeElectrons([hydrogen_shared_electrons[0]])
            hydrogen_atom.removeElectrons([nitrogen_shared_electrons[0]])
        } else if(DEBUG) {
            console.log("CAtom __removeHydrogenBond() No shared electrons found")
        }

        if (DEBUG) {
            console.log(this.atom)
        }

        atom_starting_length.should.be.greaterThan(this.atom.length)
        number_of_hydrogens_at_start.should.be.greaterThan(this.getHydrogenBonds().length)
        number_of_nitrogens_on_hydrogen_at_start.should.be.greaterThan(hydrogen_atom.nitrogenBonds().length)

    }

    const __removeCovalentBond = function(sibling_atom, DEBUG) {

        Typecheck(
            {name:"sibling_atom", value:sibling_atom, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        const shared_electrons = this.electronsSharedWithSibling(sibling_atom)
        if (shared_electrons.length > 0) {
            this.removeElectrons([shared_electrons[0]])
            sibling_atom.removeElectrons([shared_electrons[1]])
        } else if(DEBUG) {
            console.log("CAtom __removeCovalentBond() No shared electrons found")
        }

    }

    const __getPositiveCarbonBonds = function()  {
        return this.indexedBonds("").filter((bond) => {
            return bond.atom[0] === "C" && bond.atom[4] === "+"
        })
    }

    const __electrons = function() {
        return this.atom.slice(Constants().electron_index)
    }

    const __carbonBonds = function()  {
        return this.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        })
    }

    const __nitrogenBonds = function()  {
        return this.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "N"
        })
    }

    const __singleBondsNoHydrogens  = function() {
        return this.indexedBonds("").filter((bond)=>{
            return bond.atom[0] !== "H"
        })
    }

    __singleBondsNoHydrogensOrCarbons  = function() {
        return this.indexedBonds("").filter((bond)=>{
            return bond.atom[0] !== "H" && bond.atom[0] !== "C"
        })
    }

    const __doubleBondsNoHydrogens  = function() {
        return this.indexedDoubleBonds("").filter((bond)=>{
            return bond.atom[0] !== "H"
        })
    }

    const __doubleBondsNoHydrogensOrCarbons  = function() {
        return this.indexedDoubleBonds("").filter((bond)=>{
            return bond.atom[0] !== "H" && bond.atom[0] !== "C"
        })
    }

    const __tripleBondsNoHydrogens  = function() {
        return this.indexedTripleBonds("").filter((bond)=>{
            return bond.atom[0] !== "H"
        })
    }

    const __checkNumberOfElectrons = function() {
        return this.electrons.length <= Constants().max_valence_electrons[this.symbol]
    }

    const __getHydrogenBonds = function() {
        return this.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        })
    }

    const __getHydrogen = function() {
        const hydrogens = this.getHydrogens()
        return hydrogens[0].atom
    }

    const __getTerminalAtom = function() {

        const terminal_atoms_single_bonds = this.singleBondsNoHydrogens().map((bond) => {
            return CAtom(mmolecule[0][1][bond.atom_index], bond.atom_index, mmolecule)
        }).filter((atom) => {
            // Check that there is only one bond
            return atom.singleBondsNoHydrogens().length === 1
        })

        if (terminal_atoms_single_bonds > 0) {
            return terminal_atoms_single_bonds[0]
        }

        const terminal_atoms_double_bonds = this.doubleBondsNoHydrogens().map((bond) => {
            return CAtom(mmolecule[0][1][bond.atom_index], bond.atom_index, mmolecule)
        }).filter((atom) => {
            // Check that there is only one bond
            return atom.doubleBondsNoHydrogens().length === 1
        })

        if (terminal_atoms_double_bonds > 0) {
            return terminal_atoms_double_bonds[0]
        }

        const terminal_atoms_triple_bonds = this.tripleBondsNoHydrogens().map((bond) => {
            return CAtom(mmolecule[0][1][bond.atom_index], bond.atom_index, mmolecule)
        }).filter((atom) => {
            // Check that there is only one bond
            return atom.tripleBondsNoHydrogens().length === 1
        })

        if (terminal_atoms_triple_bonds > 0) {
            return terminal_atoms_triple_bonds[0]
        }
        
    }

    __oxygenDoubleBonds =  function() {
        return this.indexedDoubleBonds("").filter((b)=>{
            return b.atom[0] === "O"
        })
    }

    __carbonDoubleBonds =  function() {
        return this.indexedDoubleBonds("").filter((b)=>{
            return b.atom[0] === "C"
        })
    }

    return {

        oxygenDoubleBonds: __oxygenDoubleBonds,
        carbonDoubleBonds: __carbonDoubleBonds,
        carbonBonds: __carbonBonds,
        nitrogenBonds: __nitrogenBonds,
        electrons: __electrons,
        getPositiveCarbonBonds: __getPositiveCarbonBonds,
        removeCovalentBond: __removeCovalentBond,
        removeElectrons:__removeElectrons,
        isCoordinateCovalentBondDonator:__isCoordinateCovalentBondDonator,
        isBondedTo: __isBondedTo,
        isDoubleBondedTo: __isDoubleBondedTo,
        isTripleBondedTo: __isTripleBondedTo,
        electronsSharedWithSibling: __electronsSharedWithSibling,
        isCoordinateCovalentBond: __isCoordinateCovalentBond,
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
                    __atom.slice(Constants().electron_index).map(
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
            const lone_electrons = atom.slice(Constants().electron_index).filter(
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
        numberOfElectronsV2:__numberOfElectronsV2,
        indexedBonds: __indexedBonds,
        indexedDoubleBonds: __indexedDoubleBonds,
        indexedTripleBonds: __indexedTripleBonds,
        atom: atom,
        symbol:  atom[0],
        atomIndex: current_atom_index,
        charge: atom[4],
        sharedElectrons: __shared_electrons,
        removeFreeElectrons: __removeFreeElectrons,
        addElectrons: __addElectrons,
        numberOfBonds: __numberOfBonds,
        numberOfBondsNoHydrogens: __numberOfBondsNoHydrogens,
        neutralAtomMaxNumberOfBonds: __neutralAtomMaxNumberOfBonds,
        atomId: __atomId,
        singleBondsNoHydrogens: __singleBondsNoHydrogens,
        doubleBondsNoHydrogens: __doubleBondsNoHydrogens,
        tripleBondsNoHydrogens: __tripleBondsNoHydrogens,
        checkNumberOfElectrons: __checkNumberOfElectrons,
        addElectronsFromOtherAtom: __addElectronsFromOtherAtom,
        singleBondsNoHydrogensOrCarbons: __singleBondsNoHydrogensOrCarbons,
        doubleBondsNoHydrogensOrCarbons: __doubleBondsNoHydrogensOrCarbons,
        getHydrogen: __getHydrogen,
        getHydrogenBonds: __getHydrogenBonds,
        removeHydrogenOnCarbonBond:__removeHydrogenOnCarbonBond,
        removeHydrogenOnNitrogenBond:__removeHydrogenOnNitrogenBond,
        getTerminalAtom: __getTerminalAtom
    }
}


module.exports = CAtom

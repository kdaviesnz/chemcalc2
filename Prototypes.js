
const Constants = require("./Constants")
const Typecheck = require("./Typecheck")
const _ = require('lodash');
const Set = require('./Models/Set')

const Prototypes = () => {
    Object.defineProperty(Array.prototype, 'electrons', {
        value: function() {
            return this.slice(Constants().electron_index)
        }
    })
    Object.defineProperty(Array.prototype, 'sharedElectrons', {
        value: function(atom) {
            Typecheck(
                {name:"atom", value:atom, type:"array"},
            )
            if (atom === undefined || atom === null) {
                throw new Error("Atom is undefined or null")
            }
            return Set().intersection(this.electrons(), atom.electrons())
        }
    })
    Object.defineProperty(Array.prototype, 'freeSlots', {
        value: function() {
            Typecheck(
                {name:"symbol", value:this[0], type:"string"},
            )
            const symbol = this[0]
            const maximum_number_of_electrons = Constants().max_valence_electrons[symbol]
            maximum_number_of_electrons.should.not.be.undefined()
            if (maximum_number_of_electrons - this.electrons().length === 0) {
                return 0
            } else {
                return (maximum_number_of_electrons - this.electrons().length) / 2
            }
        }
    })
    Object.defineProperty(Array.prototype, 'electronHaystack', {
        value: function(atoms, atom_id) {
            Typecheck(
                {name:"atom_id", value:atom_id, type:"string"},
                {name:"atoms", value:atoms, type:"array"}
            )

            if (atom_id === null || atom_id === undefined) {
                throw new Error("Atom id is null or undefined")
            }

            if (atoms === null || atoms === undefined) {
                throw new Error("Atoms are null or undefined")
            }

            const electron_haystack = atoms.reduce(
                (carry, __atom, __atom_index) => {
                    if (undefined === __atom.slice) {
                        return carry
                    }

                    if (atom_id === __atom[5] ) {
                        return carry
                    }
                    return [...carry, ...__atom.slice(Constants().electron_index)]
                },
                []
            )

            return electron_haystack
        }
    })
    Object.defineProperty(Array.prototype, 'freeElectrons', {
        value: function(atoms) {

            Typecheck(
                {name:"symbol", value:this[0], type:"string"},
                {name:"atom_id", value:this[5], type:"string"},
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === null || atoms === undefined) {
                throw new Error("Atoms are null or undefined")
            }

            const symbol = this[0]
            const atom_id = this[5]
            const atom_electrons = this.electrons()

            const electron_haystack = (
                symbol === "Hg"?
                    this.electronHaystack(atoms, atom_id, this).slice(0,3):
                    this.electronHaystack(atoms, atom_id, this)
            )

            const free_electrons = atom_electrons.filter(
                (electron) => {
                    return electron_haystack.indexOf(electron) === -1
                }
            )

            return free_electrons
        }
    })
    Object.defineProperty(Array.prototype, 'isBondedTo', {
        value: function(sibling_atom) {
            Typecheck(
                {name:"sibling_atom", value:sibling_atom, type:"array"},
            )
            if (sibling_atom === undefined || sibling_atom === null) {
                throw new Error("sibling_atom is undefined or null")
            }
            if (_.isEqual(this, sibling_atom)) {
                throw new Error("Atom and sibling atom are the same.")
            }
            return this.sharedElectrons(sibling_atom).length === 2
        }
    })
    Object.defineProperty(Array.prototype, 'removeCovalentBond', {
        value: function(sibling_atom) {
            Typecheck(
                {name:"sibling_atom", value:sibling_atom, type:"array"},
            )
            if (sibling_atom === undefined || sibling_atom === null) {
                throw new Error("sibling_atom is undefined or null")
            }
            if (_.isEqual(this, sibling_atom)) {
                throw new Error("Atom and sibling atom are the same.")
            }
            const shared_electrons = this.sharedElectrons(sibling_atom)


//console.log("Prototypes removeCovalentBond()")
  //          console.log(VMolecule(this.reaction.container_substrate).compressed())
    //        console.log("covalent ***********************************************")

            if (shared_electrons.length > 1) {
                this.removeElectrons([shared_electrons[0]])
                sibling_atom.removeElectrons([shared_electrons[1]])
            }
        }
    })
    Object.defineProperty(Array.prototype, 'isDoubleBondedTo', {
        value: function(sibling_atom) {
            Typecheck(
                {name:"sibling_atom", value:sibling_atom, type:"array"},
            )
            if (sibling_atom === undefined || sibling_atom === null) {
                throw new Error("sibling_atom is undefined or null")
            }
            if (_.isEqual(this, sibling_atom)) {
                throw new Error("Atom and sibling atom are the same.")
            }
            return this.sharedElectrons(sibling_atom).length === 4
        }
    })
    Object.defineProperty(Array.prototype, 'isTripleBondedTo', {
        value: function(sibling_atom) {
            Typecheck(
                {name:"sibling_atom", value:sibling_atom, type:"array"},
            )
            if (sibling_atom === undefined || sibling_atom === null) {
                throw new Error("sibling_atom is undefined or null")
            }
            if (_.isEqual(this, sibling_atom)) {
                throw new Error("Atom and sibling atom are the same.")
            }
            return this.sharedElectrons(sibling_atom).length === 6
        }
    })
    Object.defineProperty(Array.prototype, 'addElectron', {
        value: function(electron, symbol) {
            Typecheck(
                {name:"electron", value:electron, type:"string"},
                {name:"symbol", value:symbol, type:"string"}
            )
            if (symbol === null) {
                throw new Error("Symbol is null")
            }
            const length_before = this.length
            this.push(electron)
            if (this.electrons().length > (symbol === undefined?8:(Constants().max_valence_electrons[symbol]))) {
                throw new Error("Atom has more than the allowed number of electrons")
            }
            this.length.should.be.equal(length_before + 1)
        }
    })
    Object.defineProperty(Array.prototype, 'addElectrons', {
        value: function(electrons, symbol) {
            Typecheck(
                {name:"electrons", value:electrons, type:"array"},
                {name:"symbol", value:symbol, type:"string"}
            )
            if (electrons === undefined || electrons === null) {
                throw new Error("Electrons are undefined or null")
            }
            electrons.map((electron) => {
                Typecheck(
                    {name:"electron", value:electron, type:"string"}
                )
                // this should be an atom
                this.push(electron)
                if (this.electrons().length > (symbol === undefined?8:(Constants().max_valence_electrons[symbol]))) {
                    throw new Error("Atom has more than the allowed number of electrons")
                }
            })
        }
    })
    Object.defineProperty(Array.prototype, 'removeElectrons', {
        value: function(electrons) {
            Typecheck(
                {name:"electrons", value:electrons, type:"array"},
            )
            if (electrons === undefined || electrons === null) {
                throw new Error("Electrons are undefined or null")
            }
            const array_before_length = _.cloneDeep(this.length)
            _.remove(this, (electron) => {
                return electrons.indexOf(electron) !== -1
            })
            array_before_length.should.be.greaterThan(this.length)
            return this
        }
    })
    Object.defineProperty(Array.prototype, 'removeAllElectrons', {
        value: function() {
            return this.slice(0,Constants().electron_index)
        }
    })
    Object.defineProperty(Array.prototype, 'addAtom', {
        value: function(atom) {
            Typecheck(
                {name:"atom", value:atom, type:"array"},
            )
            if (atom === undefined || atom === null) {
                throw new Error("Atom is undefined or null")
            }
            this.push(atom)
        }
    })
    Object.defineProperty(Array.prototype, 'addAtoms', {
        value: function(atoms) {
            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )
            if (atoms === undefined || atoms === null) {
                throw new Error("Atoms are undefined or null")
            }
            atoms.map(
                (atom) => {
                    Typecheck(
                        {name:"atom", value:atom, type:"array"},
                    )
                    this.addAtom(atom)
                    return atom
                }
            )
        }
    })
    Object.defineProperty(Array.prototype, 'removeAtom', {
        value: function(atom, atom_index) {

            const number_of_atoms_at_start = this.length

            Typecheck(
                {name:"atom", value:atom, type:"array"},
                {name:"atom_index", value:atom_index, type:"number"},
            )

            if (atom === undefined || atom === null) {
                throw new Error("Atom is undefined or null")
            }

            if (atom_index === undefined || atom_index === null) {
                throw new Error("atom_index is undefined or null")
            }

            if (atom.length === undefined) {
                throw new Error("Atom must be an array")
            }

            // Remove atom from molecule
            _.remove(this, (a, i) => {
                    return i === atom_index
                }
            )
            this.length.should.be.equal(number_of_atoms_at_start -1)

        }
    })
    Object.defineProperty(Array.prototype, 'removeAtomsByIndex', {
        value: function(atoms) {
            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )
            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }
            // Remove atom from molecule
            _.remove(this, (a, i) => {
                return atoms.indexOf(i) > -1
            })
        }
    })
    Object.defineProperty(Array.prototype, 'typeCheck', {
        value: function(name, type) {
            this.map((item)=>{
                Typecheck(
                    {name:name, value:item, type:type},
                )
                if (item === undefined || item === null) {
                    throw new Error(name + " is undefined or null")
                }
            })

        }
    })
    Object.defineProperty(Array.prototype, 'atomIds', {
        value: function() {
            return this.map((atom)=>{
                Typecheck(
                    {name:atom, value:atom, type:"array"},
                )
                return atom.atomId()
            })
        }
    })
    Object.defineProperty(Array.prototype, 'atomId', {
        value: function() {
            const atomId = this[5]
            Typecheck(
                {name:"atomId", value:atomId, type:"string"},
            )
            if (atomId === undefined || atomId === null) {
                throw new Error("Atom id is undefined or null")
            }
            return atomId
        }
    })
    Object.defineProperty(Array.prototype, 'getAtomById', {
        value: function(atomId) {
            Typecheck(
                {name:"atomId", value:atomId, type:"string"},
            )
            const atom_as_array =_.find(this, (v)=>{
                return v[5] === atomId
            })
            Typecheck(
                {name:"atom_as_array", value:atom_as_array, type:"array"},
            )
            return atom_as_array
        }
    })
    Object.defineProperty(Array.prototype, 'getAtomIndexById', {
        value: function(atom_id, allow_failed_searches) {
            // "this" is a molecule (array of atoms)
            Typecheck(
                {name:"atomId", value:atom_id, type:"string"},
                {name:"allow_failed_searches", value:allow_failed_searches, type:"boolean"}
            )
            if (atom_id === null || atom_id === undefined) {
                throw new Error("atom id is null or undefined")
            }
            const atom_index =_.findIndex(this, (v, i )=>{
                return v[5] === atom_id
            })
            this[0].should.be.an.Array()
            this[0][0].should.be.a.String()
            Typecheck(
                {name:"atom_index", value:atom_index, type:"number"},
            )
            // "this" is an array of atoms
            if (atom_index === -1 && (allow_failed_searches !==null && allow_failed_searches !==undefined)) {
                throw new Error('Unable to find atom index using atom id ' + atom_id)
            }
            return atom_index !==-1?atom_index:false
        }
    })
    Object.defineProperty(Array.prototype, 'indexedBonds', {
        value: function(atoms) {

            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }


            // "this" is an atom
            const atom_electrons = this.slice(Constants().electron_index)

            let r =  _.cloneDeep(atoms).reduce (

                (bonds, _atom, _atom_index) => {

                    /*
                    if (_atom[0] === "H") {
                        return bonds
                    }
                     */
                    if (undefined === _atom.sort) {
                        return bonds
                    }

                    if ((_.isEqual(_.cloneDeep(this).sort(), _.cloneDeep(_atom).sort()))) {
                        return bonds
                    }

                    const shared_electrons = Set().intersection(atom_electrons, _atom.slice(Constants().electron_index))

                    if (shared_electrons.length === 0) {
                        return bonds
                    }

                    bonds.push({
                        'parent': this[0],
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
            const d_bonds = this.indexedDoubleBonds(atoms)
            if (d_bonds.length>0) {
                // Get indexes of the double bonds
                const d_bond_indexes = d_bonds.map((b)=>{
                    return b.atom_index
                })
                r = r.filter((sb)=>{
                    // 3,4 are double bond indexes
                    return d_bond_indexes.indexOf(sb.atom_index)===-1
                })
            }

            // Filter out "single" bonds that are actually triple bonds
            const t_bonds = this.indexedTripleBonds(atoms)
            if (t_bonds.length>0) {
                // Get indexes of the double bonds
                const t_bond_indexes = t_bonds.map((b)=>{
                    return b.atom_index
                })
                r = r.filter((sb)=>{
                    return t_bond_indexes.indexOf(sb.atom_index)===-1
                })
            }

            return r
        }
    })
    Object.defineProperty(Array.prototype, 'indexedDoubleBonds', {
        value: function(atoms) {
            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )
            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }
            // "this" is an atom
            const atom_electrons = this.slice(Constants().electron_index)

            let r =  _.cloneDeep(atoms).reduce(

                (bonds, _atom, _atom_index) => {


                    if ((_.isEqual(_.cloneDeep(this).sort(), _.cloneDeep(_atom).sort()))) {
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



            // Filter out "double" bonds that are actually triple bonds
            const t_bonds = this.indexedTripleBonds(atoms)
            if (t_bonds.length>0) {
                // Get indexes of the double bonds
                const t_bond_indexes = t_bonds.map((b)=>{
                    return b.atom_index
                })
                // Filter double bonds that have indexes in t_bond_indexes
                //console.log(t_bond_indexes)
                r = r.filter((db)=>{
                    return t_bond_indexes.indexOf(db.atom_index)===-1
                })
            }

            return r
        }
    })
    Object.defineProperty(Array.prototype, 'indexedTripleBonds', {
        value: function(atoms) {
            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )
            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            // "this" is an atom
            const atom_electrons = this.slice(Constants().electron_index)


            const r =  _.cloneDeep(atoms).reduce(

                (bonds, _atom, _atom_index) => {


                    if ((_.isEqual(_.cloneDeep(this).sort(), _.cloneDeep(_atom).sort()))) {
                        return bonds
                    }

                    const shared_electrons = Set().intersection(atom_electrons, _atom.slice(Constants().electron_index))

                    if (shared_electrons.length !==6) {
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

            return r


        }
    })
    Object.defineProperty(Array.prototype, 'hydrogens', {
        value: function(atoms) {

            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )
            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            this[0].should.be.a.String()
            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()

            // "this" is an atom
            return atoms.filter(
                (__atom) => {
                    if (__atom[0] === "H") {
                        return Set().intersection(__atom.slice(Constants().electron_index), this.slice(Constants().electron_index)).length > 0
                    }
                    return false
                }
            )
        }
    })
    Object.defineProperty(Array.prototype, 'singleBondsNoHydrogens', {
        value: function(atoms) {

            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )
            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }
            return this.indexedBonds(atoms).filter((bond)=>{
                return bond.atom[0] !== "H"
            })
        }
    })
    Object.defineProperty(Array.prototype, 'doubleBondsNoHydrogens', {
        value: function(atoms) {

            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            return this.indexedDoubleBonds(atoms).filter((bond)=>{
                return bond.atom[0] !== "H"
            })
        }
    })
    Object.defineProperty(Array.prototype, 'tripleBondsNoHydrogens', {
        value: function(atoms) {

            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            return this.indexedTripleBonds(atoms).filter((bond)=>{
                return bond.atom[0] !== "H"
            })
        }
    })
    Object.defineProperty(Array.prototype, 'checkNumberOfElectrons', {
        value: function() {
            // "this" is an atom
            return this.electrons().length <= Constants().max_valence_electrons[this[0]]
        }
    })
    Object.defineProperty(Array.prototype, 'bondCount', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            return this.bonds(atoms).filter((item)=>{
                return item.length > 0
            }).length

        }
    })
    Object.defineProperty(Array.prototype, 'doubleBondCount', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()

            const double_bonds = this.doubleBond(atoms)

            return double_bonds === false ? 0 : double_bonds.length / 4

        }
    })
    Object.defineProperty(Array.prototype, 'doubleBond', {
        value: function(atoms) {

            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            this[0].should.be.a.String()
            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()

            const atom_electrons = this.slice(Constants().electron_index)
            const current_atom_index = atoms.getAtomIndexById(this.atomId())

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
    })
    Object.defineProperty(Array.prototype, 'bonds', {
        value: function(atoms) {

            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()
            this[0].should.be.a.String()

            // "this" is an atom
            const atom_electrons = this.electrons()
            const current_atom_index = atoms.getAtomIndexById(this.atomId())

            const r =  atoms.map(

                (_atom, _atom_index) => {

                    if (current_atom_index === _atom_index) {
                        return false
                    }

                    Typecheck(
                        {name:"_atom", value:_atom, type:"array"}
                    )

                    const _atomObject = _atom
                    const shared_electrons = this.electronsSharedWithSibling(_atomObject, atoms)

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
    })
    Object.defineProperty(Array.prototype, 'electronsSharedWithSibling', {
        value: function(sibling_atom, atoms) {
            // "this" is an atom
            Typecheck(
                {name:"sibling_atom", value:sibling_atom, type:"array"},
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()

            if (undefined === sibling_atom) {
                throw new Error("sibling atom object is undefined")
            }

            if (_.isEqual(this, sibling_atom)) {
                throw new Error("Atom and sibling atom are the same.")
            }

            return Set().intersection(this.slice(Constants().electron_index), sibling_atom.slice(Constants().electron_index))

        }
    })
    Object.defineProperty(Array.prototype, 'isCoordinateCovalentBond', {
        value: function(sibling_atom, atoms) {
            // "this" is an atom
            Typecheck(
                {name:"sibling_atom", value:sibling_atom, type:"array"},
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()
            this[0].should.be.a.String()

            if (undefined === sibling_atom) {
                throw new Error("sibling atom object is undefined")
            }

            if (_.isEqual(this, sibling_atom)) {
                throw new Error("Atom and sibling atom are the same.")
            }

            if (this.isDoubleBondedTo(sibling_atom)) {
                return false
            }

            // In a coordinate covalent bond one of the atoms donates both of the shared electrons
            const shared_electrons = this.electronsSharedWithSibling(sibling_atom, atoms)

            if (shared_electrons.length === 0) {
                return false
            }

            if ((this[0]==="N" && sibling_atom[0] === "C") || (this[0]==="C" && sibling_atom[0] === "N")) {
                return true
            }

            // If there is a coordinate covalent bond then one of the atoms will have more than neutral number of electrons.
            return ((this.neutralAtomMaxNumberOfBonds() > Constants().max_valence_electrons[this.symbol]) || (sibling_atom.neutralAtomMaxNumberOfBonds() > Constants().max_valence_electrons[sibling_atom[sibling_atom.symbol]]))

        }
    })
    Object.defineProperty(Array.prototype, 'neutralAtomMaxNumberOfBonds', {
        value: function(sibling_atom, atoms) {

            // "this" is an atom
            this[0].should.be.a.String()
            const map = {
                "H":1,
                "O":2,
                "N":3,
                "C":4
            }
            return map[this[0]]

        }
    })
    Object.defineProperty(Array.prototype, 'getHydrogenBonds', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()
            this[0].should.be.a.String()

            return this.indexedBonds(atoms).filter((bond)=>{
                return bond.atom[0] === "H"
            })
        }
    })
    Object.defineProperty(Array.prototype, 'removeHydrogenOnCarbonBond', {
        value: function(hydrogen_atom, atoms) {

            // "this" is an atom
            Typecheck(
                {name:"hydrogen", value:hydrogen_atom, type:"array"},
                {name:"atoms", value:atoms, type:"array"}
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            if (hydrogen_atom === undefined || hydrogen_atom === null) {
                throw new Error("Hydrogen is  undefined or null")
            }

            if (_.isEqual(this, hydrogen_atom)) {
                throw new Error("Atom and hydrogen atom are the same.")
            }

            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()
            hydrogen_atom[0].should.be.equal("H")
            this[0].should.be.a.String()

            const number_of_hydrogens_at_start = (this.getHydrogenBonds(atoms).length)
            const number_of_carbons_on_hydrogen_at_start = (hydrogen_atom.carbonBonds(atoms).length)

            const hydrogen_shared_electrons = this.electronsSharedWithSibling(hydrogen_atom, atoms).filter((electron) => {
                Typecheck(
                    {name:"electron", value:electron, type: "string"},
                )
                return electron[0] === "H"
            })

            const carbon_shared_electrons = this.electronsSharedWithSibling(hydrogen_atom, atoms).filter((electron) => {
                Typecheck(
                    {name:"electron", value:electron, type: "string"},
                )
                return electron[0] === "C"
            })

            const atom_starting_length = (this.length)

            if (carbon_shared_electrons.length === 1 && hydrogen_shared_electrons.length === 1) {
                this.removeElectrons([hydrogen_shared_electrons[0]])
                hydrogen_atom.removeElectrons([carbon_shared_electrons[0]])
            }

            atom_starting_length.should.be.greaterThan(this.length)
            number_of_hydrogens_at_start.should.be.greaterThan(this.getHydrogenBonds(atoms).length)
            number_of_carbons_on_hydrogen_at_start.should.be.greaterThan(hydrogen_atom.carbonBonds(atoms).length)

        }
    })
    Object.defineProperty(Array.prototype, 'carbonBonds', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()
            this[0].should.be.a.String()

            return this.indexedBonds(atoms).filter((bond)=>{
                return bond.atom[0] === "C"
            })
        }
    })
    Object.defineProperty(Array.prototype, 'nitrogenBonds', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()
            this[0].should.be.a.String()

            return this.indexedBonds(atoms).filter((bond)=>{
                return bond.atom[0] === "N"
            })
        }
    })
    Object.defineProperty(Array.prototype, 'oxygenDoubleBonds', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()
            this[0].should.be.a.String()

            return this.indexedDoubleBonds(atoms).filter((b)=>{
                return b.atom[0] === "O"
            })
        }
    })
    Object.defineProperty(Array.prototype, 'carbonDoubleBonds', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()
            this[0].should.be.a.String()

            return this.indexedDoubleBonds(atoms).filter((b)=>{
                return b.atom[0] === "C"
            })
        }
    })
    Object.defineProperty(Array.prototype, 'removeHydrogenOnNitrogenBond', {
        value: function(hydrogen_atom, atoms) {
            // "this" is an atom
            Typecheck(
                {name:"hydrogen_atom", value:hydrogen_atom, type:"array"},
            {name:"atoms", value:atoms, type:"array"}
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            if (hydrogen_atom === undefined || hydrogen_atom=== null) {
                throw new Error("Hydrogen atom is undefined or null")
            }

            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()
            this[0].should.be.a.String()
            hydrogen_atom[0].should.be.a.String()
            hydrogen_atom[0].should.be.equal("H")

            const number_of_hydrogens_at_start = (this.getHydrogenBonds(atoms).length)
            const number_of_nitrogens_on_hydrogen_at_start = (hydrogen_atom.nitrogenBonds(atoms).length)

            const hydrogen_shared_electrons = this.electronsSharedWithSibling(hydrogen_atom, atoms).filter((electron) => {
                Typecheck(
                    {name:"electron", value:electron, type: "string"},
                )
                return electron[0] === "H"
            })

            const nitrogen_shared_electrons = this.electronsSharedWithSibling(hydrogen_atom, atoms).filter((electron) => {
                Typecheck(
                    {name:"electron", value:electron, type: "string"},
                )
                return electron[0] === "N"
            })

            const atom_starting_length = (this.length)

            if (nitrogen_shared_electrons.length === 1 && hydrogen_shared_electrons.length === 1) {
                this.removeElectrons([hydrogen_shared_electrons[0]])
                hydrogen_atom.removeElectrons([nitrogen_shared_electrons[0]])
            }

            atom_starting_length.should.be.greaterThan(this.length)
            number_of_hydrogens_at_start.should.be.greaterThan(this.getHydrogenBonds(atoms).length)
            number_of_nitrogens_on_hydrogen_at_start.should.be.greaterThan(hydrogen_atom.nitrogenBonds(atoms).length)

        }
    })
}

module.exports = Prototypes
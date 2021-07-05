
const Constants = require("./Constants")
const Typecheck = require("./Typecheck")
const _ = require('lodash');
const Set = require('./Models/Set')
// [symbol, atomic number, number of valence electrons, charge, atom_id, bonded_atom_id ...]

// removeSingleBond(sibling_atom)
// bondMoleculeToMolecule(target_atom, source_atom, source_atoms)
// bondAtomToAtom(source_atom, atoms)
// bondAtomToMolecule(target_atom, source_atom)
// bondCount(atoms)
// removeHydrogenOnCarbonBond(hydrogen_atom, atoms)
// carbonBonds(atoms)
// nitrogenBonds(atoms)
// oxygenDoubleBonds(atoms)
// carbonDoubleBonds(atoms)
// removeHydrogenOnNitrogenBond(hydrogen_atom, atoms)
// atomMaxNumberOfBonds()
// neutralAtomMaxNumberOfBonds()
// doubleBondCount(atoms)
// tripleBondsNoHydrogens(atoms)
// doubleBondsNoHydrogens(atoms)
// singleBondsNoHydrogens(atoms)
// hydrogens(atoms)
// indexedTripleBonds(atoms)
// indexedDoubleBonds(atoms)
// indexedBonds(atoms)
// atomId()
// getAtomById(atom_id)
// getAtomIndexById(atom_id, allow_failed_searches)
// removeAtomsByIndex(atoms)
// typeCheck(name, type)
// atomIds(atoms)
// removeAtom(atom, atom_index)
// addAtoms(atoms)
// isTripleBondedTo(sibling_atom)
// isDoubleBondedTo(sibling_atom)
// isBondedTo(sibling_atom)
const Prototypes = () => {

    Object.defineProperty(Array.prototype, 'removeSingleBond', {
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

            const sibling_atom_parent_id_index = _.indexOf(sibling_atom, this.atomId())

            if (sibling_atom_parent_id_index === -1) {
                throw new Error("sibling_atom_parent_id_index not found")
            }

            const parent_atom_sibling_id_index = _.indexOf(this, sibling_atom.atomId())

            if (parent_atom_sibling_id_index === -1) {
                throw new Error("parent_atom_sibling_id_index not found")
            }

            this.splice(parent_atom_sibling_id_index,1)
            sibling_atom.splice(sibling_atom_parent_id_index,1)


            return this

        }
    })

    Object.defineProperty(Array.prototype, 'removeDoubleBond', {
        value: function(sibling_atom) {

            Typecheck(
                {name:"sibling_atom", value:sibling_atom, type:"array"},
            )

            this.removeSingleBond(sibling_atom).removeSingleBond(sibling_atom)

            return this

        }
    })

    Object.defineProperty(Array.prototype, 'removeTripleBond', {
        value: function(sibling_atom) {

            Typecheck(
                {name:"sibling_atom", value:sibling_atom, type:"array"},
            )

            return this.removeSingleBond(sibling_atom).removeSingleBond(sibling_atom).this.removeSingleBond(sibling_atom)

        }
    })

    Object.defineProperty(Array.prototype, 'bondMoleculeToMolecule', {
        value: function(target_atom, source_atom, source_atoms) {
            // "this" is a array of atoms
            // target_atom is an atom in "this" atoms.
            Typecheck(
                {name:"target_atom", value:target_atom, type:"array"},
                {name:"source_atom", value:source_atom, type:"array"},
                {name:"source_atoms", value:source_atoms, type:"array"},
            )

            if (target_atom === undefined || target_atom=== null) {
                throw new Error("target_atom is  undefined or null")
            }

            if (source_atom === undefined || source_atom=== null) {
                throw new Error("target_atom is  undefined or null")
            }

            if (source_atoms === undefined || source_atoms=== null) {
                throw new Error("Source atoms are undefined or null")
            }

            target_atom[0].should.be.a.String()
            source_atom[0].should.be.a.String()

            // Source atom should have at least one non hydrogen bond
            if(source_atom.singleBondsNoHydrogens(this).length === 0 && source_atom.doubleBondsNoHydrogens(this).length === 0 && source_atom.doubleBondsNoHydrogens(this).length === 0) {
                throw new Error("Source atom must not have at least one non-hydrogen bond.")
            }

            target_atom.bondAtomToAtom(source_atom)

            if (_find(this, (_atom)=>{
                return _.isEqual(_atom, source_atom)
            }).length === 0) {
                this.addAtom(source_atom)
                source_atom.map((atom)=>{
                    this.addAtom(atom)
                })
            }


        }
    })
    Object.defineProperty(Array.prototype, 'bondAtomToAtom', {
        value: function(source_atom, atoms) {
            // "this" is target atom
            Typecheck(
                {name:"source_atom", value:source_atom, type:"array"},
                {name:"atoms", value:atoms, type:"array"}
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("atoms are undefined or null")
            }

            source_atom[0].should.be.a.String()
            this[0].should.be.a.String()

            // Check we can add a bond
            const target_atom_max_number_bonds_allowed = this.atomMaxNumberOfBonds() === undefined?this.neutralAtomMaxNumberOfBonds():this.atomMaxNumberOfBonds
            const source_atom_max_number_bonds_allowed = source_atom.atomMaxNumberOfBonds() === undefined?source_atom.neutralAtomMaxNumberOfBonds():source_atom.atomMaxNumberOfBonds

            source_atom[0].should.be.a.String()
            this[0].should.be.a.String()

            // @todo charges

            if (this.bondCount(atoms) + 1 > target_atom_max_number_bonds_allowed) {
                throw new Error("Target atom already has enough bonds")
            }
            source_atom[0].should.be.a.String()
            this[0].should.be.a.String()

            if (source_atom.bondCount(atoms) + 1 > source_atom_max_number_bonds_allowed) {
                throw new Error("Source atom already has enough bonds")
            }

            // All checks done. Add source atom to "this".
            // Note: This will add a double or triple bond if there is already a bond.
            this.push(source_atom.atomId())
            source_atom.push(this.atomId())

            source_atom[0].should.be.a.String()
            this[0].should.be.a.String()

        }
    })
    Object.defineProperty(Array.prototype, 'bondAtomToMolecule', {
        value: function(target_atom, source_atom) {
            // "this" is a array of atoms
            Typecheck(
                {name:"target_atom", value:target_atom, type:"array"},
                {name:"source_atom", value:source_atom, type:"array"},
            )

            if (target_atom === undefined || target_atom=== null) {
                throw new Error("target_atom is  undefined or null")
            }

            if (source_atom === undefined || source_atom=== null) {
                throw new Error("target_atom is  undefined or null")
            }

            target_atom[0].should.be.an.Array()
            target_atom[0][0].should.be.a.String()
            source_atom[0].should.be.an.Array()
            source_atom[0][0].should.be.a.String()

            // Source atom should have no bonds except hydrogen as otherwise we're bonding to molecules together.
            if(source_atom.singleBondsNoHydrogens(this).length > 0 || source_atom.doubleBondsNoHydrogens(this).length > 0 || source_atom.doubleBondsNoHydrogens(this).length > 0) {
                throw new Error("Source atom must not have any bonds except hydrogen")
            }

            target_atom.bondAtomToAtom(source_atom)

            if (_find(this, (_atom)=>{
                return _.isEqual(_atom, source_atom)
            }).length === 0) {
                this.addAtom(source_atom)
            }


        }
    })
    Object.defineProperty(Array.prototype, 'bondCount', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are undefined or null")
            }

            this[0].should.be.a.String()

            //console.log('prototype.js bondCount() '+ this[0])
            //console.log("hydrogens " + this.hydrogens(atoms).length)

            return this.indexedBonds(atoms).length + (this.indexedDoubleBonds(atoms).length * 2)  + (this.indexedTripleBonds(atoms).length * 3)
        }
    })
    Object.defineProperty(Array.prototype, 'removeHydrogenOnCarbonBond', {
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
            this[0].should.be.equal("C")
            hydrogen_atom[0].should.be.a.String()
            hydrogen_atom[0].should.be.equal("H")

            if (this.isBondedTo(hydrogen_atom)) {
                _.remove(this,(_atom_id)=>{
                    return _atom_id === hydrogen_atom.atomId()
                })
            }
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
            this[0].should.be.equal("N")
            hydrogen_atom[0].should.be.a.String()
            hydrogen_atom[0].should.be.equal("H")

            if (this.isBondedTo(hydrogen_atom)) {
                _.remove(this,(_atom_id)=>{
                    return _atom_id === hydrogen_atom.atomId()
                })
            }
        }
    })
    Object.defineProperty(Array.prototype, 'atomMaxNumberOfBonds', {
        value: function() {
            // "this" is an atom
            this[0].should.be.a.String()
            const map = {
                "O":3,
                "N":4,
            }
            return map[this[0]]

        }
    })
    Object.defineProperty(Array.prototype, 'neutralAtomMaxNumberOfBonds', {
        value: function() {

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
    Object.defineProperty(Array.prototype, 'tripleBondsNoHydrogens', {
        value: function(atoms) {

            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            // "this" is an atom
            return atoms.filter(
                (__atom) => {
                    if (__atom[0] !== "H") {
                        return _atom.isTripleBondedTo(this)
                    }
                    return false
                }
            )
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

            // "this" is an atom
            return atoms.filter(
                (__atom) => {
                    if (__atom[0] !== "H") {
                        return _atom.isDoubleBondedTo(this)
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

            // "this" is an atom
            return atoms.filter(
                (__atom) => {
                    if (__atom[0] !== "H") {
                        return _atom.isBondedTo(this)
                    }
                    return false
                }
            )

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

            // "this
            this[0].should.be.a.String()
            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()

            // "this" is an atom
            return atoms.filter(
                (__atom) => {
                    if (__atom[0] === "H" && !_.isEqual(__atom, this)) {
                        return __atom.isBondedTo(this)
                    }
                    return false
                }
            )
        }
    })
    Object.defineProperty(Array.prototype, 'indexedTripleBonds', {
        value: function(atoms) {
            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            // "this" is an atom
            let r =  atoms.reduce (

                (bonds, _atom, _atom_index) => {

                    // not an array
                    if (undefined === _atom.sort) {
                        return bonds
                    }

                    if(_atom[0]==="H") {
                        return bonds
                    }

                    // current atom is equal to parent atom (this)
                    if ((_.isEqual(_.cloneDeep(this).sort(), _.cloneDeep(_atom).sort()))) {
                        return bonds
                    }

                    // No bonds
                    if (!this.isBondedTo(_atom) && !this.isDoubleBondedTo(_atom) && !this.isTripleBondedTo(_atom)) {
                        return bonds
                    }

                    if(this.isTripleBondedTo(_atom)) {
                        bonds.push({
                            'parent': this[0],
                            'atom': _atom,
                            'atom_index': _atom_index,
                            'bond_type': "#"
                        })
                    }

                    return bonds

                },
                []
            )

            return r
        }
    })
    Object.defineProperty(Array.prototype, 'indexedDoubleBonds', {
        value: function(atoms) {
            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            // "this" is an atom
            let r =  atoms.reduce (

                (bonds, _atom, _atom_index) => {


                    // not an array
                    if (undefined === _atom.sort) {
                        return bonds
                    }

                    if(_atom[0]==="H") {
                        return bonds
                    }

                    // current atom is equal to parent atom (this)
                    if ((_.isEqual(_.cloneDeep(this).sort(), _.cloneDeep(_atom).sort()))) {
                        return bonds
                    }

                    // No bonds
                    if (!this.isBondedTo(_atom) && !this.isDoubleBondedTo(_atom) && !this.isTripleBondedTo(_atom)) {
                        return bonds
                    }

                    if(this.isDoubleBondedTo(_atom)) {
                        bonds.push({
                            'parent': this[0],
                            'atom': _atom,
                            'atom_index': _atom_index,
                            'bond_type': "="
                        })
                    }

                    return bonds

                },
                []
            )

            return r

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
            let r =  atoms.reduce (

                (bonds, _atom, _atom_index) => {

                    // not an array
                    if (undefined === _atom.sort) {
                        return bonds
                    }

                    if(_atom[0]==="H") {
                        return bonds
                    }

                    // current atom is equal to parent atom (this)
                    if ((_.isEqual(_.cloneDeep(this).sort(), _.cloneDeep(_atom).sort()))) {
                        return bonds
                    }

                    // No bonds
                    if (!this.isBondedTo(_atom) && !this.isDoubleBondedTo(_atom) && !this.isTripleBondedTo(_atom)) {
                        return bonds
                    }

                    if(this.isBondedTo(_atom)) {
                        //console.log("isBondedTo()")
                        //process.error()
                        bonds.push({
                            'parent': this[0],
                            'atom': _atom,
                            'atom_index': _atom_index,
                            'bond_type': ""
                        })
                    }

                    this[0].should.be.a.String()


                    return bonds

                },
                []
            )

           // console.log("prototype.js indexedBonds() "+this[0])
           // console.log(r)
           // process.error()
            this[0].should.be.a.String()
            return r
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
            return this.filter((atom_id)=>{
                return atom_id === sibling_atom.atomId()
            }).length === 3
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

            return this.filter((atom_id)=>{
                return atom_id === sibling_atom.atomId()
            }).length === 2
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
            return this.filter((atom_id)=>{
                return atom_id === sibling_atom.atomId()
            }).length === 1
        }
    })

    Object.defineProperty(Array.prototype, 'electronsx', {
        value: function() {
            return this.slice(Constants().electron_index)
        }
    })
    Object.defineProperty(Array.prototype, 'sharedElectronxs', {
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
    Object.defineProperty(Array.prototype, 'freeSlotsx', {
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
    Object.defineProperty(Array.prototype, 'electronHaystackx', {
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
    Object.defineProperty(Array.prototype, 'freeElectronsx', {
        value: function(atoms) {


            Typecheck(
                {name:"symbol", value:this[0], type:"string"},
                {name:"atom_id", value:this[5], type:"string"},
                {name:"atoms", value:atoms, type:"array"},
            )

            if (false && this[0] !== "H" && this.hydrogens(atoms).length > 0) {
                console.log(this[0])
                console.log(this.hydrogens(atoms).length)
                console.log("atoms")
                console.log(atoms)
                console.log("bonds")
                console.log(this.bonds(atoms))
                process.error()
            }

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

    Object.defineProperty(Array.prototype, 'removeCovalentBondx', {
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


    Object.defineProperty(Array.prototype, 'addElectronx', {
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
    Object.defineProperty(Array.prototype, 'addElectronsx', {
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
    Object.defineProperty(Array.prototype, 'removeElectronsx', {
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
    Object.defineProperty(Array.prototype, 'removeAllElectronsx', {
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





    Object.defineProperty(Array.prototype, 'checkNumberOfElectronsx', {
        value: function() {
            // "this" is an atom
            return this.electrons().length <= Constants().max_valence_electrons[this[0]]
        }
    })




    Object.defineProperty(Array.prototype, 'electronsSharedWithSiblingx', {
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
    Object.defineProperty(Array.prototype, 'isCoordinateCovalentBondx', {
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




}

module.exports = Prototypes
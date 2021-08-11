
const Constants = require("./Constants")
const Typecheck = require("./Typecheck")
const _ = require('lodash');
const Set = require('./Models/Set')
// [symbol, atomic number, number of valence electrons, charge, atom_id, bonded_atom_id ...]

// freeSlots(atoms)
// removeSingleBond(sibling_atom)
// removeDoubleBond(sibling_atom)
// removeTripleBond(sibling_atom)
// bondMoleculeToMolecule(target_atom, source_atom, source_atoms)
// bondAtomToAtom(source_atom, atoms)
// bondAtomToMolecule(target_atom, source_atom)
// bondCount(atoms)
// removeHydrogenOnCarbonBond(hydrogen_atom, atoms)
// carbonBonds(atoms)
// nitrogenBonds(atoms)
// oxygenDoubleBonds(atoms)
// nitrogenDoubleBonds(atoms)
// carbonDoubleBonds(atoms)
// removeHydrogenOnNitrogenBond(hydrogen_atom, atoms)
// atomMaxNumberOfBonds()
// neutralAtomMaxNumberOfBonds()
// doubleBondCount(atoms)
// tripleBondsNoHydrogens(atoms)
// doubleBondsNoHydrogens(atoms)
// singleBondsNoHydrogens(atoms)
// hydrogens(atoms)
// nonHydrogens(atoms)
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
// hydroxylOxygenIndex()
// hydroxylCarbonIndex()
// nucleophileIndex()
// removeProtonFromOxygen()
// addAtom(atom)
// findCarbonCarbocationIndexes(no_hydrogens_on_carbon)
// extractAkylGroups(chains, trunk)
// branches(atoms)
// branch(branch)
// atomsWithNoHydrogens()
// subsequentAtomsNotBondedToCurrentAtom(atoms)
// ringBondAtoms(atoms_after_current_atom)
// isAlcohol()
// isKetone()
// isCarboxylicAcid()
// carbonylCarbonIndex()
// carbonylOxygenIndex()
// nitrogenIndex()
// carbonAttachedToNitrogenSingleBondIndex(nitrogen_index)
// terminalCarbonAttachedToNitrogenSingleBondIndex(nitrogen_index)
// carbonAttachedToNitrogenDoubleBondIndex(nitrogen_index)
// nitrogenOnCarbonDoubleBondIndex()
// carbocationIndex()
// waterOxygenIndex()
// removeHydrogenOnOxygenBond(hydrogen_atom, atoms)
// childAtoms(atoms)
// removeAtomsById()
const Prototypes = () => {
    Object.defineProperty(Array.prototype, 'removeAtomsById', {
        value: function(atoms) {

            // "this" is an array of atoms that we are going to remove the atoms from
            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are undefined or null")
            }

            if(atoms.length === 0) {
                throw new Error("No atoms to remove.")
            }

            atoms[0][0].should.be.a.String()

            if(this.length === 0) {
                throw new Error("Molecule has no atoms.")
            }

            const molecule_atoms_ids = this.map((molecule_atom)=>{
                return molecule_atom.atomId()
            })

            if(this.length === 0) {
                throw new Error("Atoms have been removed from the molecule.")
            }

            const atoms_ids = atoms.map((atom)=>{
                return atom.atomId()
            })

            if(this.length === 0) {
                throw new Error("Atoms have been removed from the molecule.")
            }

            // Remove atom from molecule
            _.remove(this, (molecule_atom, i) => {
                return _.findIndex(atoms_ids, (atom_id)=>{
                    return molecule_atom.atomId() === atom_id
                }) !== -1
            })

            if(this.length === 0) {
                throw new Error("Molecule is now empty.")
            }

        }
    })
    Object.defineProperty(Array.prototype, 'carbocationIndex', {
        value: function() {
            // "this" is an array of atoms
            this[0][0].should.be.a.String()
            const carbocation_index = _.findIndex(this, (atom)=> {
                if (atom[0] !== "C" || atom[4] !== "+") {
                    return false
                }
                return true
            })
            if (carbocation_index === -1) {
                throw new Error("Could not find carbocation")
            }
            this[carbocation_index][0].should.be.equal("C")
            this[carbocation_index][4].should.be.equal("+")
            return carbocation_index
        }
    })
    Object.defineProperty(Array.prototype, 'nitrogenOnCarbonDoubleBondIndex', {
        value: function() {
            // "this" is an array of atoms
            this[0][0].should.be.a.String()
            const atoms = this
            const nitrogen_index = _.findIndex(this, (atom)=> {
                if (atom[0] !== "N") {
                    return false
                }
                const carbon_bonds = atom.indexedDoubleBonds(atoms).filter((bond)=>{
                    return bond.atom[0] === "C"
                })
                return carbon_bonds.length > 0
            })
            if (nitrogen_index === -1) {
                throw new Error("Could not find nitrogen")
            }
            this[nitrogen_index][0].should.be.equal("N")
            return nitrogen_index
        }
    })
    Object.defineProperty(Array.prototype, 'nitrogenIndex', {
        value: function() {
            // "this" is an array of atoms
            this[0][0].should.be.a.String()
            const nitrogen_index = _.findIndex(this, (atom)=> {
                if (atom[0] !== "N") {
                    return false
                }
                return true
            })
            if (nitrogen_index === -1) {
                throw new Error("Could not find nitrogen")
            }
            this[nitrogen_index][0].should.be.equal("N")
            return nitrogen_index
        }
    })
    Object.defineProperty(Array.prototype, 'carbonAttachedToNitrogenSingleBondIndex', {
        value: function(nitrogen_index) {
            // "this" is an array of atoms
            this[0][0].should.be.a.String()
            if (nitrogen_index === undefined) {
                nitrogen_index = this.nitrogenIndex()
            }
            if (nitrogen_index === -1) {
                throw new Error("Could not find nitrogen")
            }
            const carbon_bonds = this[nitrogen_index].indexedBonds(this).filter((bond)=>{
                return bond.atom[0] === "C"
            })
            if (carbon_bonds.length === 0){
                throw new Error("Could not find carbon attached to nitrogen")
            }
            return carbon_bonds[0].atom_index
        }
    })
    Object.defineProperty(Array.prototype, 'terminalCarbonAttachedToNitrogenSingleBondIndex', {
        value: function(nitrogen_index) {
            // "this" is an array of atoms
            this[0][0].should.be.a.String()
            if (nitrogen_index === undefined) {
                nitrogen_index = this.nitrogenIndex()
            }
            if (nitrogen_index === -1) {
                throw new Error("Could not find nitrogen")
            }
            const atoms = this
            const carbon_bonds = this[nitrogen_index].indexedBonds(this).filter((bond)=>{
                return bond.atom[0] === "C" && bond.atom.hydrogens(atoms).length === 3
            })
            if (carbon_bonds.length === 0){
                throw new Error("Could not find carbon attached to nitrogen")
            }
            return carbon_bonds[0].atom_index
        }
    })
    Object.defineProperty(Array.prototype, 'carbonAttachedToNitrogenDoubleBondIndex', {
        value: function(nitrogen_index) {
            // "this" is an array of atoms
            this[0][0].should.be.a.String()
            if (nitrogen_index === undefined) {
                nitrogen_index = this.nitrogenIndex()
            }
            if (nitrogen_index === -1) {
                throw new Error("Could not find nitrogen")
            }
            const carbon_bonds = this[nitrogen_index].indexedDoubleBonds(this).filter((bond)=>{
                return bond.atom[0] === "C"
            })
            if (carbon_bonds.length === 0){
                throw new Error("Could not find carbon double bonded to nitrogen")
            }
            return carbon_bonds[0].atom_index
        }
    })
    Object.defineProperty(Array.prototype, 'isEster', {
        value: function() {
            // https://www.compoundchem.com/2020/02/21/functional-groups/
            // "this" is an array of atoms
            // CC(=O)ON
            const atoms = this
            this[0][0].should.be.a.String()
            const carbonyl_carbon_index = this.carbonylCarbonIndex()
            if (carbonyl_carbon_index === -1 || carbonyl_carbon_index === false) {
                return false
            }
            const carbonyl_atom = this[carbonyl_carbon_index]
            carbonyl_atom[0].should.be.equal("C")
            const carbonyl_single_bonds = carbonyl_atom.indexedBonds(this)
            if (carbonyl_single_bonds.length !==2) {
                return false
            }

            const oxygen_single_bonds_attached_to_carbonyl_carbon = carbonyl_single_bonds.filter((carbonyl_single_bond)=>{
                return carbonyl_single_bond.atom[0] === "O"
            })


            if (oxygen_single_bonds_attached_to_carbonyl_carbon.length === 0) {
                return false
            }

            const oxygen = oxygen_single_bonds_attached_to_carbonyl_carbon[0].atom

            //Check that we have at least one non-hydrogen attached to the oxygen
            const bonds_to_oxygen = oxygen.indexedBonds(this)
            return bonds_to_oxygen.length > 1 // (counting the carbonyl carbon)

        }
    })
    Object.defineProperty(Array.prototype, 'carbonylOxygenIndex', {
        value: function() {
            // "this" is an array of atoms
            this[0][0].should.be.a.String()
            const carbonyl_oxygen_index = _.findIndex(this, (atom)=> {
                if (atom[0] !== "C") {
                    return false
                }
                const bonds = atom.indexedDoubleBonds(this)
                if (bonds.length !==1) {
                    return false
                }
                return bonds[0].atom[0] === "O"
            })
            if (carbonyl_oxygen_index == -1) {
                throw new Error("Could not find carbonyl oxygen")
            }
            this[carbonyl_oxygen_index][0].should.be.equal("O")
            return carbonyl_oxygen_index
        }
    })
    Object.defineProperty(Array.prototype, 'carbonylCarbonIndex', {
        value: function() {
            // "this" is an array of atoms
            this[0][0].should.be.a.String()
            const carbonyl_carbon_index = _.findIndex(this, (atom)=> {
                if (atom[0] !== "C" && atom[4] !== "") {
                    return false
                }
                const oxygen_bonds = atom.indexedDoubleBonds(this).filter((bond)=>{
                    return bond.atom[0] === "O"
                })
                if (oxygen_bonds.length !==1) {
                    return false
                }
                return true
            })
            if (carbonyl_carbon_index===-1) {
                return false
            }
            this[carbonyl_carbon_index][0].should.be.equal("C")
            this[carbonyl_carbon_index].indexedDoubleBonds(this).length.should.be.equal(1)
            return carbonyl_carbon_index
        }
    })
    Object.defineProperty(Array.prototype, 'isCarboxylicAcid', {
        value: function() {
            // https://www.compoundchem.com/2020/02/21/functional-groups/
            // "this" is an array of atoms
            // RC(=O)O
            const atoms = this
            this[0][0].should.be.a.String()
            const carbonyl_carbon_index = this.carbonylCarbonIndex()
            if (carbonyl_carbon_index === -1 || carbonyl_carbon_index === false) {
                return false
            }
            const carbonyl_atom = this[carbonyl_carbon_index]
            carbonyl_atom[0].should.be.equal("C")
            const carbonyl_single_bonds = carbonyl_atom.indexedBonds(this)
            if (carbonyl_single_bonds.length !==2) {
                return false
            }
            // Check that we have an -OH group bonded to the carbonyl atom
            return carbonyl_single_bonds.filter((carbonyl_single_bond)=>{
                return carbonyl_single_bond.atom[0] === "O" && carbonyl_single_bond.atom.hydrogens(atoms).length === 1
            }).length === 1
        }
    })
    Object.defineProperty(Array.prototype, 'isKetone', {
        value: function() {
            // "this" is an array of atoms
            // RC(=O)C
            this[0][0].should.be.a.String()
            const carbonyl_carbon_index = this.carbonylCarbonIndex()
            if (carbonyl_carbon_index === -1) {
                return false
            }
            const carbonyl_atom = this[carbonyl_carbon_index]
            carbonyl_atom[0].should.be.equal("C")
            const carbonyl_single_bonds = carbonyl_atom.indexedBonds(this)
            if (carbonyl_single_bonds.length !==2) {
                return false
            }
            // Check that we have an two carbons bonded to the carbonyl atom
            return carbonyl_single_bonds[0].atom[0] === "C" && carbonyl_single_bonds[1].atom[0] === "C"
        }
    })
    Object.defineProperty(Array.prototype, 'isAlcohol', {
        value: function() {
            // "this" is an array of atoms
            this[0][0].should.be.a.String()
            // find oxygen atom with two bonds, one hydrogen and one carbon
            return _.findIndex(this, (atom)=>{
                if (atom[0]!=="O" || atom.hydrogens(this).length !==1) {
                    return false
                }
                const bonds = atom.indexedBonds(this)
                return bonds.length === 1
            }) !== -1
        }
    })
    Object.defineProperty(Array.prototype, 'ringBondAtoms', {
        value: function(atoms_after_current_atom) {
            // "this" is an atom
            // Check if "this" is the start / end  of a ringbond
            Typecheck(
                {name:"atoms after current atom", value:atoms_after_current_atom, type:"array"}
            )
            this[0].should.be.a.String()

        }
    })
    Object.defineProperty(Array.prototype, 'subsequentAtomsNotBondedToCurrentAtom', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )
            this[0].should.be.a.String()
            const current_atom_index = atoms.getAtomIndexById(this.atomId())
            const subsequent_atoms = atoms.slice(current_atom_index+1)
            const current_atom = this
            const first_atom_not_bonded_to_current_atom_index = _.findIndex(subsequent_atoms, (atom) => {
                return !atom.isBondedTo(current_atom) && !atom.isDoubleBondedTo(current_atom) && !atom.isTripleBondedTo(current_atom)
            })
            return first_atom_not_bonded_to_current_atom_index === -1? []:subsequent_atoms.slice(first_atom_not_bonded_to_current_atom_index)
        }
    })
    Object.defineProperty(Array.prototype, 'atomsWithNoHydrogens', {
        value: function() {
            // "this" is an array of atoms
            if (this.length>0) {
                this[0][0].should.be.a.String()
            }
            return this.filter((atom)=>{
                return atom[0] !== "H"
            })
        }
    })
    Object.defineProperty(Array.prototype, 'addAtomToBranch', {
        value: function(atom) {

            // "this" is an array of branches
            Typecheck(
                {name:"atom", value:atom, type:"array"}
            )
            atom[0].should.be.a.String()

            const i = this.length === 0?0:this.length-1

            this[i].push(atom)
        }
    })
    Object.defineProperty(Array.prototype, 'getBonds', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )
            this[0].should.be.a.String()
            return [...this.indexedBonds(atoms), ...this.indexedDoubleBonds(atoms), ...this.indexedTripleBonds(atoms)]
        }
    })
    Object.defineProperty(Array.prototype, 'isTerminalAtom', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )
            this[0].should.be.a.String()
            const bonds = this.getBonds(atoms)
            return bonds.length < 2
        }
    })
    Object.defineProperty(Array.prototype, 'isInBranches', {
        value: function(branches) {
            // "this" is an atom
            Typecheck(
                {name:"branches", value:branches, type:"array"}
            )
            this[0].should.be.a.String()
            throw new Error("@todo Prototype isInBranches()")
        }
    })
    Object.defineProperty(Array.prototype, 'branchesv2', {
        value: function(branches, atom_index) {

            Typecheck(
                {name:"branches", value:branches, type:"array"}
            )

            // "this" is an array of atoms
            if (this.length>0) {
                this[0][0].should.be.a.String()
            }

            const atom = this[atom_index]

            if (atom === undefined) {
                return branches
            }

            if (atom_index ===0) {
                branches.addAtomToBranch(atom)
            }

            const atoms = this
            const child_bonds = this.getBonds(atoms).filter((bond)=>{
                return !bond.atom.isTerminalAtom(atoms) && !bond.atom.isInBranches(branches)
            })

            if (child_bonds.length === 0) {
                // Start new branch and process
                branches.push([])

            } else {
                // add bond atom to branch
                branches.addAtomToBranch(child_bonds[0].atom)
            }

            this.branchesv2(branches, atom_index + 1)

        }

    })
    Object.defineProperty(Array.prototype, 'branch', {
        value: function(branch, atoms, DEBUG) { // recursive function
            // "this" is an atom
            Typecheck(
                {name:"branch", value:branch, type:"array"},
                {name:"atoms", value:atoms, type:"array"}
            )

            if (atoms === undefined) {
                throw new Error("Atoms is undefined")
            }

            if (atoms.length ===0){
                throw new Error("No atoms")
            }

          //  console.log(this.indexedBonds(atoms))
           // process.error()

            const bonds = [...this.indexedBonds(atoms), ...this.indexedDoubleBonds(atoms), ...this.indexedTripleBonds(atoms)]

            // If all hydrogen bonds then quit (@todo ring branches)
            if (bonds.filter((bond)=>{
                return bond.atom[0] !== "H"
            }).length < 2) { // count parent atom
                return branch
            }

           // process.error()
            bonds.map((bond)=>{
                branch.push(bond.atom)
                //console.log(bond.atom)
                //console.log(atoms.getAtomIndexById(bond.atom.atomId()))
                //process.error()
                bond.atom.branch(branch, atoms.slice(atoms.getAtomIndexById(bond.atom.atomId())), DEBUG)
            })
        }
    })
    Object.defineProperty(Array.prototype, 'branches', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )
            if (atoms === undefined) {
                throw new Error("Atoms are undefined")
            }
            // Slice atoms starting from "this" index
           // const parent_atom_index = this.getAtomIndexById(this.atomId())
           // const child_atoms = atoms.slice(parent_atom_index +1)
            const branches =[]
            const bonds = [...this.indexedBonds(atoms), ...this.indexedDoubleBonds(atoms), ...this.indexedTripleBonds(atoms)]
            //console.log(bonds)
            //process.error()
            bonds.map((bond)=>{
                if (bond.atom === undefined) {
                    throw new Error("Bond has no atom")
                }
                const branch = bond.atom.branch([bond.atom], atoms.slice(atoms.getAtomIndexById(this.atomId())), true) // array of bonded atoms
                if (branch === undefined) {
                    console.log(this.atomId())
                    console.log(atoms.getAtomIndexById(this.atomId()))
                    console.log(bonds)
                    throw new Error("Branch is undefined")
                }
                branch.should.be.an.Array()
                branches.push(branch)
                //console.log(branches)
                //process.error()
            })
           // console.log(branches)
            return branches
        }
    })
    Object.defineProperty(Array.prototype, 'extractAkylGroups', {
        value: function(chains, trunk) {
            // "this" is array of atoms
            Typecheck(
                {name:"trunk", value:trunk, type:"array"},
                {name:"chains", value:chains, type:"array"}
            )
            if(this.length === 1) {
                throw new Error("No akyl groups as only one chain")
            }

            // @todo check that we get only groups that have only single bonds
            // An akyl group contains only carbons and hydrogens and only single bonds
            // Trace through each branch of atoms coming off "this" until an akyl group if found
            //console.log("Prototype.js extractAkylGroups()")
            //console.log(chains)
            // For each atom in the trunk find chains containing that atom and that from where the atom is, contains no atoms in the trunk
            let branches = []
            trunk.map((atom)=>{
                const chains_cached = _.cloneDeep(chains)
                const trunk_cached = _.cloneDeep(trunk)
                const atom_branches = chains_cached.map((chain)=>{
                    const atom_in_chain_index = _.findIndex(chain, (a)=>{
                        return a.atomId() === atom.atomId()
                    })
                    if (atom_in_chain_index=== -1) {
                        return null
                    }
                    const branch =  chain.splice(atom_in_chain_index)
                    const atoms_in_branch_that_are_also_in_trunk = _.cloneDeep(branch).filter((a)=>{
                       return _.cloneDeep(trunk_cached).filter((trunk_atom)=>{
                           return _.isEqual(a, trunk_atom)
                       }).length > 0
                    })
                    if (atoms_in_branch_that_are_also_in_trunk.length !== 1) {
                        return null
                    }
                    return branch
                }).filter((b)=>{
                    return null !== b
                })
                if (atom_branches.length>0) {
                    branches = [...branches, ...atom_branches]
                }
            })

            // Return only branches with only carbons or hydrogens
            return branches.filter((branch)=>{
                return branch.filter((atom)=>{
                    atom[0].should.be.a.String()
                    return atom[0] === "C" || atom[0] === "H"
                }).length > 0
            }).filter((b)=>{
                return b.length > 1
            })

        }
    })
    Object.defineProperty(Array.prototype, 'findCarbonCarbocationIndexes', {
        value: function(no_hydrogens_on_carbocation) {
            // "this" is an array of atoms
            Typecheck(
                {name:"no_hydrogens_on_carbocation", value:no_hydrogens_on_carbocation, type:"boolean"}
            )

            let carbocation_index = null // a carbocation is a positively charged carbon

            const atoms = this
            let carbon_index = _.findIndex(this, (atom)=>{
                if (atom[0] !== "C" || atom[4] !== "") {
                    return false
                }
                const bonds = atom.indexedBonds(this).filter((b)=>{
                    if (b.atom[0] === "C" && b.atom[4]==="+") {
                        if (no_hydrogens_on_carbocation && b.atom.hydrogens(atoms).length > 0) {
                            return false
                        }
                        carbocation_index = b.atom_index
                        return true
                    }
                    return false
                })
                return bonds.length > 0
            })
            if (carbon_index === -1) {
                throw new Error("Could not find carbon attached to carbocation")
            }
            return [carbon_index, carbocation_index]
        }
    })
    Object.defineProperty(Array.prototype, 'removeProtonFromOxygen', {
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
            this[0].should.be.equal("O")
            hydrogen_atom[0].should.be.a.String()
            hydrogen_atom[0].should.be.equal("H")

            const number_of_hydrogens_before_removing_hydrogen_from_atom = this.hydrogens(atoms).length
            this.removeSingleBond(hydrogen_atom)
            this.hydrogens(atoms).length.should.be.equal(number_of_hydrogens_before_removing_hydrogen_from_atom -1)

            const number_of_atoms_before_removing_proton = atoms.length
            // removeAtom(atom, atom_index)
            atoms.removeAtom(hydrogen_atom, atoms.getAtomIndexById(hydrogen_atom.atomId()))
            atoms.length.should.be.equal(number_of_atoms_before_removing_proton -1)


        }
    })

    Object.defineProperty(Array.prototype, 'waterOxygenIndex', {
        value: function() {

            // "this" is an array of atoms
            Typecheck(
                {name:"first atom symbol", value:this[0][0], type:"string"}
            )

            const water_oxygen_index =  _.findIndex(this, (oxygen_atom)=>{
                if (oxygen_atom[0]==="O") {
                    return oxygen_atom.hydrogens(this).length === 2
                }
                return false
            })

            if (water_oxygen_index === -1){
               return false
            }

            this[water_oxygen_index][0].should.be.equal("O")

            return water_oxygen_index
        }
    })
    Object.defineProperty(Array.prototype, 'electrophileIndex', {
        value: function(atoms, mustBe, filterBy) {

            // "this" is an array of atoms
            Typecheck(
                {name:"first atom symbol", value:this[0][0], type:"string"},
                {name:"Must be", value:mustBe, type:"string"},
                {name:"filterBy", value:filterBy, type:"function"},
            )

            let i = -1
            //let i= __findElectrophileIndex(filterBy, mustBe)
            // Look for N atom with no charge and two hydrogens
            // @see https://en.wikipedia.org/wiki/Leuckart_reaction (formamide, step 1)
            i = _.findIndex((this), (atom, index)=>{
                if (atom[0] !== 'N' || atom[4] !== "") {
                    return false
                }
                const nitrogen_atom_object = this[index]
                return nitrogen_atom_object.hydrogens(this).length > 0
            })

            if (i === -1) {

                i = _.findIndex((this), (atom, index) => {
                    return atom[4] === '+'
                })

                if (i === -1) {

                    i =  _.findIndex(this, (atom, index) => {

                        let electrophile_index = null

                        if (atom[4] === "-") {
                            return false
                        }
                        // Ignore metals
                        if (atom[0] === "Hg") {
                            return false
                        }

                        const atom_object = atom

                        if (undefined !== mustBe && atom[0] !== mustBe) {
                            return false
                        }

                        if (atom_object.indexedDoubleBonds(this).length > 0) {
                            return false
                        }

                        if (atom_object[4] === "+" || atom[4] === "&+") {
                            electrophile_index = atom_object.getAtomIndexById(this, atom_object.atomId(this))
                        }

                        if (atom_object.freeSlots(this).length > 0) {
                            electrophile_index = atom_object.atomIndex
                        }

                        if (atom[0] === "H" && atom_object.indexedBonds(this).filter((bond) => {
                            return bond.atom[0] !== "C"
                        }).length === 0) {
                            electrophile_index = atom_object.atomIndex
                        }

                        if (electrophile_index !== null) {
                            if (filterBy !== undefined && typeof filterBy === 'function') {
                                return filterBy(electrophile_index) ? electrophile_index : false
                            }
                            return true
                        }

                        return false

                    })

                }

            }


            // electrophiles cannot have a positive charge
            if (i !== -1 && this[i][4]==="-") {
                i = -1
            }

            if (i === -1) {

                // check for carbon double bond and return most substituted carbon
                const carbons = this.filter((atom_object, index) => {
                    return atom_object.symbol === "C" && atom_object.indexedDoubleBonds(this).filter((bond)=>{
                        return bond.atom[0] === "C"
                    }).length > 0
                }).sort(
                    (a, b) => {
                        return a.hydrogens(this).length < b.hydrogens(this).length ? -1 : 0
                    }
                )

                if (carbons.length > 0 && this[carbons[0].atomIndex][4] !=="-") {
                    return carbons[0].getAtomIndexById(this, carbons[0].atomIndex())
                }


                // Check if we have a metal
                i = _.findIndex(_.cloneDeep(this), (atom, index)=> {
                    return atom[0] === "Hg" // @todo add isMetal() method to CAtom
                })

            }

            if (i===-1) {

                // Check for epoxide ring and return index of least substituted carbon
                i = _.findIndex(_.cloneDeep(this), (atom, index)=> {

                    if (atom[0] !== 'O') {
                        return false
                    }

                    const oxygen_atom_object = atom
                    const bonds = oxygen_atom_object.indexedBonds(this)


                    if (bonds.length !== 2) {
                        return false
                    }

                    // Carbon bonds
                    if (bonds.filter((bond)=>{
                        return bond.atom[0] === "C"
                    }).length !==2) {
                        return false
                    }

                    // Check carbon atoms are bonded together
                    if(!bond[0].atom.isBondedTo(bonds[1].atom)) {
                        return false
                    }
                    const c1 = bonds[0].atom
                    const c2 = bonds[1].atom

                    return true


                })


                if (i !== -1) {
                    // i is the index of the oxygen atom on the epoxide ring
                    // we need to find index of the least substituted carbon attached to the oxygen atom
                    const oxygen_atom_object = this[i]
                    const bonds = oxygen_atom_object.indexedBonds(this)
                    // Have oxygen atom bonded to two carbons where the two carbons are bonded together
                    // Find least substituted carbon
                    const c1_atom_object = bonds[0].atom
                    const c2_atom_object = bonds[1].atom
                    i = c1_atom_object.hydrogens(this).length > c2_atom_object.hydrogens(this).length ? bonds[0].getAtomIndexById(this, bonds[0].atomId())
                        : bonds[1].getAtomIndexById(this, bonds[1].atomId())

                    if (this[i][4]==="-") {
                        i = -1
                    }
                }
            }


            return i

        }
    })
    Object.defineProperty(Array.prototype, 'nucleophileIndex', {

        value: function() {

            // "this" is an array of atoms
            Typecheck(
                {name:"first atom symbol", value:this[0][0], type:"string"},
            )


            // Look for negatively charged atom
            const negative_atom_index = _.findIndex(this, (atom, index)=>{
                return atom[4]==="-"
            })


            if (negative_atom_index !== -1) {
                return negative_atom_index
            }

            // Look for =N atom
            // @see https://www.name-reaction.com/ritter-reaction
            const nitrogen_on_double_bond_index = _.findIndex((this), (atom, index)=>{
                if (atom[0] !=="N") {
                    return false
                }
                //const a = CAtom(container_molecule[0][1][index], index, container_molecule)
                const a = this[index]
                return a.doubleBondCount(this) === 1
            })

            if (nitrogen_on_double_bond_index > -1) {
                return nitrogen_on_double_bond_index
            }

            // Look for OH
            //const hyroxyl_oxygen_index = this.findHydroxylOxygenIndex()
            const hyroxyl_oxygen_index = this.hydroxylOxygenIndex()

            if (hyroxyl_oxygen_index > -1) {
                return hyroxyl_oxygen_index
            }

            // Look for N atom
            // @see https://en.wikipedia.org/wiki/Leuckart_reaction (formamide, step 1)
            // @see https://en.wikipedia.org/wiki/Ritter_reaction
            const nitrogen_index = _.findIndex((this[0][1]), (atom, index)=>{
                return atom[0] === 'N' && atom[4] !== "+"
            })

            // // console.log(('nitrogen_index:'+nitrogen_index)
            if (nitrogen_index > -1) {
                return nitrogen_index
            }

            // Look for double bond with most hydrogens
            let hydrogen_count = 0
            let nucleophile_index = this.reduce((carry, atom, index)=> {
                //const atom_object = CAtom(atom, index,container_molecule)
                const atom_object = atom
                const double_bonds = atom_object.indexedDoubleBonds(this).filter((double_bond)=>{
                    // Check that atom we are bonding to has more than the current number of hydrogens
                    if (double_bond.atom[0]!=="C") {
                        return false
                    }
                    // CAtom(double_bond.atom, double_bond.atom_index, container_molecule)
                    const bonded_atom_object_hydrogen_bonds = double_bond.atom.indexedBonds(this).filter(
                        (bonded_atom_object_bonds)=>{
                            return bonded_atom_object_bonds.atom[0] === "H"
                        }
                    )
                    if (bonded_atom_object_hydrogen_bonds.length >= hydrogen_count) {
                        hydrogen_count = bonded_atom_object_hydrogen_bonds.length
                        return true
                    } else {
                        return false
                    }

                })
                carry = double_bonds.length > 0? double_bonds[0].atom_index:carry
                return carry

            }, -1)

            // Verifications checks
            if (undefined === this[nucleophile_index]) {
                nucleophile_index = -1
            }

            if (nucleophile_index > -1) {
                return nucleophile_index
            }

            nucleophile_index.should.be.an.Number()

            if (nucleophile_index === -1) {
                return -1
            }

            return nucleophile_index
        }
    })
    Object.defineProperty(Array.prototype, 'hydroxylOxygenIndex', {
        value: function(charge) {
            // "this" is an array of atoms
            Typecheck(
                {name:"first atom symbol", value:this[0][0], type:"string"},
                {name:"charge", value:charge, type:"string"},
            )

            return _.findIndex(this, (oxygen_atom)=>{
                if (oxygen_atom[0]==="O" && (undefined === charge || oxygen_atom[4] === charge)) {
                    return oxygen_atom.hydrogens(this).length === 1
                }
                return false
            })
        }
    })

    Object.defineProperty(Array.prototype, 'hydroxylOxygenAttachedToCarbonIndex', {
        value: function(charge) {
            // "this" is an array of atoms
            Typecheck(
                {name:"first atom symbol", value:this[0][0], type:"string"},
                {name:"charge", value:charge, type:"string"},
            )

            return _.findIndex(this, (oxygen_atom)=>{
                if (oxygen_atom[0]==="O" && (undefined === charge || oxygen_atom[4] === charge)) {
                    return oxygen_atom.carbonBonds(this).length === 1
                }
                return false
            })
        }
    })
    Object.defineProperty(Array.prototype, 'hydroxylCarbonIndex', {
        value: function(oxygen_charge) {

            // "this" is an array of atoms
            Typecheck(
                {name:"first atom symbol", value:this[0][0], type:"string"},
                {name:"oxygen charge", value:oxygen_charge, type:"string"},
            )

            const oxygen_index = this.hydroxylOxygenAttachedToCarbonIndex(oxygen_charge)
            const carbon_bonds = this[oxygen_index].carbonBonds(this)

            if (carbon_bonds.length === 0) {
                return -1
            }
            return carbon_bonds[0].atom_index
        }
    })
    Object.defineProperty(Array.prototype, 'freeSlots', {
        value: function(atoms) {

            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )

            if (atoms === undefined || atoms=== null) {
                throw new Error("atoms are undefined or null")
            }

            // "this" is an atom
            return this.neutralAtomMaxNumberOfBonds() - this.bondCount(atoms)

        }
    })
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

            sibling_atom[0].should.be.a.String()

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
                console.log(this)
                console.log(source_atom)
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

            return this.indexedBonds(atoms).length + (this.indexedDoubleBonds(atoms).length * 2)  + (this.indexedTripleBonds(atoms).length * 3)
        }
    })
    Object.defineProperty(Array.prototype, 'removeHydrogen', {
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

            if (this.isBondedTo(hydrogen_atom)) {
                _.remove(this,(_atom_id)=>{
                    return _atom_id === hydrogen_atom.atomId()
                })
            }
        }
    })
    Object.defineProperty(Array.prototype, 'removeHydrogenOnOxygenBond', {
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
            this[0].should.be.equal("O")
            hydrogen_atom[0].should.be.a.String()
            hydrogen_atom[0].should.be.equal("H")

            if (this.isBondedTo(hydrogen_atom)) {
                _.remove(this,(_atom_id)=>{
                    return _atom_id === hydrogen_atom.atomId()
                })
            }
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

            this[0].should.be.a.String()

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
    Object.defineProperty(Array.prototype, 'nitrogenDoubleBonds', {
        value: function(atoms) {
            // "this" is an atom
            Typecheck(
                {name:"atoms", value:atoms, type:"array"}
            )

            this[0].should.be.a.String()

            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()
            this[0].should.be.a.String()

            return this.indexedDoubleBonds(atoms).filter((b)=>{
                return b.atom[0] === "N"
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
                "C":5,
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
    Object.defineProperty(Array.prototype, 'tripleBondCount', {
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

            const triple_bonds = this.tripleBond(atoms)

            return triple_bonds === false ? 0 : triple_bond.length / 4

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

            const double_bonds = this.indexedDoubleBonds(atoms)

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
                    if (__atom[0] !== "H" && !_.isEqual(this, __atom)) {
                        return __atom.isTripleBondedTo(this)
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
                    if (__atom[0] !== "H" && !_.isEqual(this, __atom)) {
                        return __atom.isDoubleBondedTo(this)
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
                    if (__atom[0] !== "H" && !_.isEqual(this, __atom)) {
                        return __atom.isBondedTo(this)
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
    Object.defineProperty(Array.prototype, 'nonHydrogens', {
        value: function(atoms) {

            Typecheck(
                {name:"atoms", value:atoms, type:"array"},
            )
            if (atoms === undefined || atoms=== null) {
                throw new Error("Atoms are  undefined or null")
            }

            // "this" is an atom
            this[0].should.be.a.String()
            atoms[0].should.be.an.Array()
            atoms[0][0].should.be.a.String()

            // "this" is an atom
            return atoms.filter(
                (__atom) => {
                    if (__atom[0] !== "H" && !_.isEqual(__atom, this)) {
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
                console.log("-----")
                console.log(this)
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
    Object.defineProperty(Array.prototype, 'removeAtomById', {
        value: function(atom) {

            Typecheck(
                {name:"atom", value:atom, type:"array"},
                {name:"First atom", value:this[0], type:"array"}
            )

            if (atom === undefined || atom === null) {
                throw new Error("Atom is undefined or null")
            }

            const atom_index = this.getAtomIndexById(atom.atomId())
            this.removeAtom(atom, atom_index)

        }
    })
    Object.defineProperty(Array.prototype, 'removeAtom', {
        value: function(atom, atom_index) {

            const number_of_atoms_at_start = this.length

            Typecheck(
                {name:"atom", value:atom, type:"array"},
                {name:"atom_index", value:atom_index, type:"number"},
                {name:"First atom", value:this[0], type:"array"}
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
            // "this" is an array of atoms
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
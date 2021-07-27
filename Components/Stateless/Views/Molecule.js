const CMolecule = require('../../../Controllers/Molecule')
const CAtom = require('../../../Controllers/Atom')
const VAtom = require('../../../Components/Stateless/Views/Atom')
const _ = require('lodash');
const Set = require('../../../Models/Set')
const Constants = require("../../../Constants")
const Typecheck = require("../../../Typecheck")

/*
__isRing()
__determineIfEndOfBranch()
__getBondType()
__addBrackets()
__endOfBranch()
__getAtomAsSMILE()
__addBranches()
__getIndexOfNextAtom()
__getBondIds()
__getChildAtoms()
__SMILES_recursive()
__getEndOfBranchIdRecursive()
.JSON()
.compressed()
.formatted()
.nextAtomIndex(chain, current_index)
.previousAtomIndex(chain, current_index)
.rootAtomIndex(current_index)
.addBrackets(symbol, charge)
.getBond(chain, atom_index, i)
.isBranch(compressed_atom, start_of_branch_index, previous_atom_id)
.canonicalSMILES()
.render()
*/
const VMolecule = (mmolecule) => {

    Typecheck(
        {name:"mmolecule", value:mmolecule, type:"array"},
    )

    if (mmolecule === undefined || mmolecule === undefined) {
        throw new Error("Molecule is null or undefined")
    }

    mmolecule.length.should.be.equal(2) // molecule, units
    if (mmolecule[0] !=="B") {
        mmolecule[0].length.should.be.equal(2) // pKa, atoms
    }

    const MoleculeAI = require("../../../Components/Stateless/MoleculeAI")(mmolecule)

    const __isRing = (current_atom) => {
        __getIndexOfNextAtom(current_atom, current_atom_index)
    }

    const __determineIfEndOfBranch = (i, current_atom, branch_depth, ring_bond_ids, branch_tracker, testing) => {
        if (testing) {
            console.log("Determining if end of branch")
            console.log(current_atom)
            console.log(branch_depth)
            console.log(branch_tracker)
        }
        if (branch_depth === -1 || branch_tracker[branch_depth] === 1) {
            return false
        }
        if (i !==0 &&  current_atom[4].length + current_atom[5].length + current_atom[6].length===1) {
            return true
        }
        if (ring_bond_ids[current_atom[1]+""] !== undefined) {
            // Child ring bond?
            const bond_ids = __getBondIds(current_atom[4]).concat(__getBondIds(current_atom[5])).concat(__getBondIds(current_atom[6]))
            let is_child_ring_bond = false
            bond_ids.map((b_id)=>{
                if (ring_bond_ids[b_id] !== undefined && b_id < current_atom[1]) {
                    is_child_ring_bond = true
                }
            })
            return is_child_ring_bond
        }
        return false
    }

    const __getBondType = (current_atom, previous_atom) => {

        if (previous_atom === null) {
            return ""
        }

        const b = Set().intersection(current_atom.slice(Constants().electron_index), previous_atom.slice(Constants().electron_index))
        const m = ["", "", "", "", "="]
        return m[[b.length]]
    }

    const __addBrackets = (atomic_symbol) => {
        return atomic_symbol === "Al"
    }

    const __endOfBranch = (current_atom, index, mmolecule_sans_hydrogens) => {
        const catom_current = CAtom(current_atom, index, mmolecule)
        if (catom_current.bondCount() === 1) {
            return true
        }
        return false
    }

    const __getAtomAsSMILE = (catom, current_atom, processed_atoms_indexes, current_atom_index) => {

        if (processed_atoms_indexes.includes(current_atom)) {
            return "X"
        }

        const indexed_bonds = catom.indexedBonds("")
        const indexed_double_bonds = catom.indexedDoubleBonds("")
        const hydrogens = indexed_bonds.filter((bond)=>{
            return bond.atom[0] === "H"
        })

        if (catom.isPositivelyCharged()) {
            if (indexed_bonds.length + indexed_double_bonds.length !== current_atom[3]) {
                if (hydrogens.length > 0) {
                    return "[" + current_atom[0] + "H" + hydrogens.length + "+]"
                }
            }
            return "[" + current_atom[0] + "+]"
        } else if (catom.isNegativelyCharged()) {

            if (indexed_bonds.length + indexed_double_bonds.length !== current_atom[3]) {
                if (hydrogens.length > 0) {
                    return "[" + current_atom[0] + "H" + hydrogens.length + "-]"
                }
            }

            return "[" + current_atom[0] + "-]"

        } else {

            // Check the number of hydrogen bonds
            if (indexed_bonds.length + indexed_double_bonds.length < current_atom[3]) {
                if (hydrogens.length > 0) {
                    return "[" + current_atom[0] + "H" + hydrogens.length + "]"
                }
            }

            return  (__addBrackets(current_atom[0])?"[":"") + current_atom[0] + (__addBrackets(current_atom[0])?"]":"") // eg "" + "C"
        }


    }

    const __addBranches = (bonds, branch_index, processed_atoms_indexes, previous_atom) => {
        let branch = ""

        bonds.map((bond, index)=> {
            /*
            {
                atom: ['Cl', ....]
                index:3 // index of the current atom is bonded to
                shared_electrons: ["il8089098","8909809uu"]
            },
            */
            if (processed_atoms_indexes.includes(bond.atom_index)) {
                //  return
            }
            const current_atom = mmolecule[0][1][bond.atom_index]
            if (!processed_atoms_indexes.includes(bond.atom_index)) {
                processed_atoms_indexes.push(bond.atom_index)
            } else {
                //     console.log('WARNING 6: atom already added')
            }
            //   console.log(5)
            branch =  branch + "(" + __getBondType(current_atom, previous_atom) + __SMILES_recursive("", current_atom, null, bond.atom_index, branch_index, processed_atoms_indexes) + ")"
            // console.log ("ADD branches  branch:" + branch_index + " " + current_atom[0] + " " + current_atom[5] + branch)
        })

        return branch
    }

    const __getIndexOfNextAtom = (current_atom, current_atom_index) => {
        const atoms =  mmolecule[0][1]
        return _.cloneDeep(atoms).reduce((carry, _atom, i)=> {
            if (i === current_atom_index || _atom[0]==='H') {
                return carry
            }
            if (Set().intersection(_atom.slice(Constants().electron_index),current_atom.slice(Constants().electron_index) ).length > 1) {
                return i;
            }
            return carry
        }, null)
    }

    const __getBondIds = function(bonds) {

        Typecheck(
            {name:"bonds", value:bonds, type:"array"},
        )

        return bonds.map((b)=>{
            b = b.split(" ")
            return b[0] * 1
        })

    }

    const __getChildAtoms = (atoms, current_atom) => {
        /*
        Benzene compressed: C1=CC=CC=C1
[
  [ 'C', 1, 'H 1', 'Charge: 0', [ '11  C' ], [ '3  C' ], [], 8, 0 ],
  [ 'C', 3, 'H 1', 'Charge: 0', [ '5  C' ], [ '1  C' ], [], 8, 0 ],
  [ 'C', 5, 'H 1', 'Charge: 0', [ '3  C' ], [ '7  C' ], [], 8, 0 ],
  [ 'C', 7, 'H 1', 'Charge: 0', [ '9  C' ], [ '5  C' ], [], 8, 0 ],
  [ 'C', 9, 'H 1', 'Charge: 0', [ '7  C' ], [ '11  C' ], [], 8, 0 ],
  [ 'C', 11, 'H 1', 'Charge: 0', [ '1  C' ], [ '9  C' ], [], 8, 0 ]
]
         */
        const current_atom_id = current_atom[1]
        // Get index of first atom that is not bonded to the current atom
        const start_index = _.findIndex(atoms, (atom, i)=>{
            // Atom: [ 'C', 3, 'H 3', 0, '[ '4  C' ], [], [], 8, 0, pvep', ]
            const bonds_ids = __getBondIds(atom[4]).concat(__getBondIds(atom[5])).concat(__getBondIds(atom[6]))
            return bonds_ids.indexOf(current_atom_id) === -1 && atom[1] > current_atom_id
        })

//        console.log(start_index)
  //      process.error()

        return start_index == -1? []: atoms.slice(start_index)
    }

    const __SMILES_recursive = (carry, current_atom, previous_atom, index, branch_index, processed_atoms_indexes) => {

        //   console.log('Recursion ' + branch_index)
        // Index: 3 Bonds: 3 1
        // Loop atom is the bottom one on the benzene ring
        // AssertionError: expected 'C(=CCC(C=C)(CO))(C)' to be 'C1=CC=C(C=C1)CO'
        // VMolecule([benyzl_alcohol, 1]).canonicalSMILES().should.be.equal("C1=CC=C(C=C1)CO")

        processed_atoms_indexes.should.be.an.Array()

        let next_atom_index = null

        if (current_atom === undefined) {
            return carry
        }

        current_atom[0].should.be.an.String()
        if (current_atom[0]==='H') {
            next_atom_index = __getIndexOfNextAtom(current_atom, index)
            //console.log(1)
            if (processed_atoms_indexes.includes(next_atom_index)) {
                return carry
            }
            // processed_atoms_indexes.push(next_atom_index)
            return __SMILES_recursive(carry, mmolecule[0][1][next_atom_index], previous_atom, next_atom_index, branch_index, processed_atoms_indexes)
        }

        if (typeof current_atom !== 'object') {
            console.log('Molecule.js Atom must be an object. Got ' + current_atom + ' instead')
            throw new Error("Atom is not an object")
        }
        current_atom.should.be.an.Array()

        const catom = CAtom(current_atom, index, mmolecule)

        const bonds = catom.indexedBonds('H').filter((bond)=> {
            return !processed_atoms_indexes.includes(bond.atom_index)
        })

        if (bonds.length === 0) {
            //console.log(index)
            if (carry !== "" && processed_atoms_indexes.includes(index)) {
                return __getBondType(current_atom, previous_atom) + carry
            }
            if (!processed_atoms_indexes.includes(index)) {
                processed_atoms_indexes.push(index)
                carry = carry + __getBondType(current_atom, previous_atom) + __getAtomAsSMILE(catom, current_atom, processed_atoms_indexes, index)
                //console.log ("5 CARRY branch:" + branch_index + " " + carry + ' ' + current_atom[0] + ' ' + current_atom[5])
                return  carry
            } else {
                //console.log('WARNING 1: atom already added')
                if (carry==="") {
                    carry = carry + __getBondType(current_atom, previous_atom) + __getAtomAsSMILE(catom, current_atom, processed_atoms_indexes, index)
                }
                return carry
            }

        }


        // First non-hydrogen atom?
        if (carry === "") {


            // Index: 3 Bonds: 3 1
            // Loop atom is the bottom one on the benzene ring
            // AssertionError: expected 'C(=CCC(C=C)(CO))(C)' to be 'C1=CC=C(C=C1)CO'
            // VMolecule([benyzl_alcohol, 1]).canonicalSMILES().should.be.equal("C1=CC=C(C=C1)CO")

            // Get how many atoms are attached to the atom, but don't include hydrogens

            if (bonds.length < 2) {
                // COC
                //carry = carry + __getAtomAsSMILE(catom, current_atom)
                // C
                carry = carry + __getAtomAsSMILE(catom, current_atom, processed_atoms_indexes,index)
                // console.log ("4 CARRY branch:" + branch_index + " " + carry)
                next_atom_index = __getIndexOfNextAtom(current_atom, index)
                if (!processed_atoms_indexes.includes(index)) {
                    processed_atoms_indexes.push(index)
                } else {
                    //  console.log('WARNING 2: atom already added')
                }
                //console.log ("4 CARRY branch:" + branch_index + " (carry)" + carry + ' (carry) ' + current_atom[0] + ' ' + current_atom[5])
                //console.log(2)
                return __SMILES_recursive(carry, mmolecule[0][1][next_atom_index], current_atom, next_atom_index, branch_index, processed_atoms_indexes)

            } else {

                // First atom but has more than one atom attached to it eg C(C)O
                // Therefore we need start recursively branching
                //  console.log ("6 CARRY branch:" + branch_index + " " + carry)
                if (!processed_atoms_indexes.includes(index)) {
                    processed_atoms_indexes.push(index)
                    // Branch or ring?
                    carry = carry + __getAtomAsSMILE(catom, current_atom, processed_atoms_indexes, index) + __addBranches(bonds, branch_index+1, processed_atoms_indexes, current_atom)
                    //console.log ("3 CARRY branch:" + branch_index + " " + carry + ' ' + current_atom[0] + ' ' + current_atom[5])
                    return carry
                } else {
                    //console.log('WARNING 3: atom already added')
                    return  carry
                }

            }

        } else {

            // COC
            // Get how many atoms are attached to the atom, but don't include hydrogens
            if (bonds.length < 2) {
                // O atom in COC bonds.length = 1 as we do not count the first C-O bond
                carry = carry + __getBondType(current_atom, previous_atom) + __getAtomAsSMILE(catom, current_atom, processed_atoms_indexes, index)
                next_atom_index = __getIndexOfNextAtom(current_atom, index)
                if (!processed_atoms_indexes.includes(index)) {
                    processed_atoms_indexes.push(index)
                    //console.log ("2 CARRY branch:" + branch_index + " " + carry + ' ' + current_atom[0] + ' ' + current_atom[5])
                    //console.log(3)
                    //console.log("next atom index=" + next_atom_index)
                    //console.log(processed_atoms_indexes)
                    return __SMILES_recursive(carry, mmolecule[0][1][next_atom_index], current_atom, next_atom_index , branch_index, processed_atoms_indexes)
                } else {
                    //console.log('WARNING 4: atom already added')
                    return carry
                }

            } else {
                // First atom but has more than one atom attached to it eg C(C)O
                // Therefore we need start recursively branching
                //console.log ("2 CARRY branch:" + branch_index + " " + carry)
                if (!processed_atoms_indexes.includes(index)) {
                    processed_atoms_indexes.push(index)
                    //console.log('b2')
                    carry = carry +  __getAtomAsSMILE(catom, current_atom, processed_atoms_indexes, index) + __addBranches(bonds, branch_index+1, processed_atoms_indexes, current_atom)
                    //  console.log ("1 CARRY branch:" + branch_index + " " + carry + ' ' + current_atom[0] + ' ' + current_atom[5])
                    return carry
                } else {
                    //    console.log('WARNING 5: atom already added')
                    return carry
                }

            }

        }

        //      return carry



    }

    const __getEndOfBranchIdRecursive = function(start_of_branch_ids, ring_bond_ids, atoms_compressed, start_of_branch_id, current_position, depth) {
        // CC(=O)C(C)(C)C
        if (undefined === atoms_compressed[current_position]){
            return -1
        }
        const atom_at_current_position = atoms_compressed[current_position]
        const bond_ids = __getBondIds(atom_at_current_position[4]).concat(__getBondIds(atom_at_current_position[5])).concat(atom_at_current_position(child_atom[6]))
        if (start_of_branch_ids.indexOf(atoms_compressed[0][1]!==-1)){
            //depth = depth + 1
        }
        if (bond_ids.length > 1) {
            // Try next atom
            return __getEndOfBranchIdRecursive(start_of_branch_ids, ring_bond_ids, atoms_compressed, start_of_branch_id, current_position+1, depth)
        } else {
            if (depth === 0) {
                return current_position
            } else {
                depth = depth -1
                return __getEndOfBranchIdRecursive(start_of_branch_ids, ring_bond_ids, atoms_compressed, start_of_branch_id, current_position+1, depth)
            }
        }
    }

    const __chainAtoms = function(cache, chain, atom, atoms, terminal_atoms, fixed_number_of_atoms, depth) {

        console.log("__chainAtoms()")
        Typecheck(
            {name:"cache", value:cache, type:"array"},
            {name:"chain", value:chain, type:"array"},
            {name:"atom", value:atom, type:"array"},
            {name:"atoms", value:atoms, type:"array"},
            {name:"terminal_atoms", value:terminal_atoms, type:"array"},
            {name:"fixed_number_of_atoms", value:fixed_number_of_atoms, type:"number"},
            {name:"depth", value:depth, type:"number"}
        )
        if (undefined === cache) {
            throw new Error("Cache is undefined")
        }
        if (undefined === chain) {
            throw new Error("Chain is undefined")
        }
        if (undefined === atom) {
            throw new Error("Atom is undefined")
        }
        if (undefined === atoms) {
            throw new Error("Atoms are undefined")
        }
        if (undefined === depth) {
            throw new Error("Depth is undefined")
        }

        atom[0].should.be.a.String()

        fixed_number_of_atoms.should.be.equal(atoms.length)

        if(depth > 20) {
            throw new Error("To much recursion")
        }

        // chain check
        //chain.length.should.be.equal(depth)
        if (chain.length > 1) {
            if (!chain[chain.length-1].isBondedTo(chain[chain.length-2]) && !chain[chain.length-1].isDoubleBondedTo(chain[chain.length-2]) && !chain[chain.length-1].isTripleBondedTo(chain[chain.length-2])) {
                throw new Error("Last atom in chain should be bonded to second to last atom")
            }
        }

        // "C(OCC)(C)(N)"
        const atom_index =  atoms.getAtomIndexById(atom.atomId())
        const bonds = [...atom.indexedBonds(atoms), ...atom.indexedDoubleBonds(atoms), ...atom.indexedTripleBonds(atoms)].filter((bond)=>{
            return bond.atom_index > atom_index
        })

        if(bonds.length === 0) { // We don't count the parent
            // Terminal atom
            chain.push(atom)
            cache.push(chain)
            console.log("Terminal atom")
            console.log(atom)
            console.log("chain:")
            console.log(chain)
           // console.log(VMolecule(mmolecule).compressed())
            console.log("===================================================")
            return
            //throw new Error("To do: Terminal atom")
        }
        else if(bonds.length === 1) { // We don't count the parent
            chain.push(atom)
            console.log("Atom with no additional bonds apart from parent and sibling.")
            console.log("chain")
            console.log(chain)
            console.log("atom")
            console.log(atom)
            console.log(".................................................................")
            __chainAtoms(cache, chain, bonds[0].atom, atoms, terminal_atoms, fixed_number_of_atoms, depth +1)
            //throw new Error("To do: atom with no additional bonds apart from parent and sibling.")
        } else {
            console.log("atom index = " + atom_index)
            chain.push(atom)
            cache.push(chain)
            bonds.map((bond)=>{
                const a = bond.atom
                console.log("Depth =" + depth)
                console.log("Chain:")
                console.log(chain)
                console.log(chain.map((chain_atom)=>{
                    chain_atom.push(atoms.getAtomIndexById(chain_atom.atomId()))
                    return chain_atom
                }))
                console.log("MAP1 cache")
                console.log(cache.length)
                console.log(chain.length)
                // changes "cache"
                __chainAtoms(cache, _.cloneDeep(chain), a, atoms, terminal_atoms, fixed_number_of_atoms, depth)
                console.log("MAP2 cache")
                console.log(cache.length)
                console.log(chain.length)
            })
        }

    }

    return {

        'JSON': function()  {

            /*
                mmolecule.length.should.be.equal(2) // molecule, units
    mmolecule[0].length.should.be.equal(2) // pKa, atoms
             */

            return {
                "id": "",
                "SMILES": this.canonicalSMILES(false),
                "atoms": _.cloneDeep(mmolecule[0][1]).map((atom, index) => {
                        const c = CAtom(atom, index, _.cloneDeep(mmolecule))
                        return VAtom(c)
                    }
                ),
                "name": "",
                "units":mmolecule[1],
                "pKa":mmolecule[0][0]
            }

        },

        'compressed': () => {

            if (mmolecule[0] ==="B") {
                return mmolecule
            }

            return (mmolecule[0][1]).map(
                (atom, index) => {
                    //const c = CAtom(atom, index, _.cloneDeep(mmolecule))
                    const c = atom
                    const h = c.hydrogens(mmolecule[0][1])

                    const bonds = c.indexedBonds(_.cloneDeep(mmolecule[0][1])).filter((bond)=>{
                        return bond.atom[0] !== 'H'
                    }).map(
                        (bond)=>{
                            return bond.atom_index + "  " + bond.atom[0]
                        }
                    )
                    const double_bonds = c.indexedDoubleBonds(_.cloneDeep(mmolecule[0][1])).filter((bond)=>{
                        return bond.atom[0] !== 'H'
                    }).map(
                        (bond)=>{
                            return bond.atom_index + "  " + bond.atom[0]
                        }
                    )
                    const triple_bonds = c.indexedTripleBonds(_.cloneDeep(mmolecule[0][1])).filter((bond)=>{
                        return bond.atom[0] !== 'H'
                    }).map(
                        (bond)=>{
                            return bond.atom_index + "  " + bond.atom[0]
                        }
                    )

                    return [atom[0], index, "H " + h.length, "Charge: " + atom[4], bonds, double_bonds, triple_bonds, null, null, atom[5]]
                }
            ).filter(
                (atom) => {
                    return atom[0] !== "H"
                }
            )
        },

        'formatted': () => {

            return _.cloneDeep(mmolecule[0][1]).map(
                (atom, index) => {
                    const c = CAtom(atom, index, _.cloneDeep(mmolecule))
                    const h = c.indexedBonds("").filter((bond)=>{
                        return bond.atom[0] === "H"
                    })
                    const bonds = c.indexedBonds("").filter((bond)=>{
                        return bond.atom[0] !== 'H'
                    }).map(
                        (bond)=>{
                            return bond.atom_index
                        }
                    )
                    const double_bonds = c.indexedDoubleBonds("").filter((bond)=>{
                        return bond.atom[0] !== 'H'
                    }).map(
                        (bond)=>{
                            return bond.atom_index
                        }
                    )
                    const triple_bonds = c.indexedTripleBonds("").filter((bond)=>{
                        return bond.atom[0] !== 'H'
                    }).map(
                        (bond)=>{
                            return bond.atom_index
                        }
                    )

                    const electrons = atom.slice(Constants().electron_index)
                    const free_electrons = c.freeElectrons()

                    return [(atom[4]===0?"":"[") + atom[0]+(atom[4]===0?"":atom[4] + (atom[4]===0?"":"]")), index,  bonds, double_bonds, triple_bonds]
                }
            ).filter(
                (atom) => {
                    return atom[0] !== "H" && atom[0] !== "[H]"
                }
            )
        },

        nextAtomIndex: function(chain, current_index) {
            if (undefined === chain[current_index]) {
                return false
            }
            if (typeof chain[current_index]==='number') {
                return chain[current_index]
            } else {
                return this.nextAtomIndex(chain, current_index+1)
            }
        },
        previousAtomIndex: function(chain, current_index) {
            if (undefined === chain[current_index]) {
                return false
            }
            if (typeof chain[current_index]==='number') {
                return chain[current_index]
            } else {
                return this.previousAtomIndex(chain, current_index-1)
            }
        },
        rootAtomIndex: function(current_index) {
            if (mmolecule[0][1][current_index][0] !== 'H') {
                return current_index
            } else {
                return this.rootAtomIndex(current_index+1)
            }
        },
        addBrackets: function(symbol, charge) {
            return charge !== "" || symbol === "Br"  || symbol === "Al" || symbol === "Hg" || symbol === "Ac"
        },
        getBond: function(chain, atom_index, i) {

            let symbol = mmolecule[0][1][atom_index][0]

            if (i < 0) {
                return ""
            }
            if (typeof chain[i] !== "number") {
                return this.getBond(chain, atom_index, i-1)
            } else {

                const previous_atom_object = CAtom(mmolecule[0][1][chain[i]], chain[i], mmolecule)
                const bonds = previous_atom_object.indexedBonds("").filter(
                    (bond) => {
                        return bond.atom_index === atom_index
                    }
                )


                if (bonds.length === 0) {
                    return this.getBond(chain, atom_index, i - 1)
                } else {
                    return bonds[0].bond_type
                }

            }

        },

        isBranch: function(compressed_atom, start_of_branch_index, previous_atom_id) {
            let number_of_branches = 0
            const compressed_atom_from_start_of_branch = compressed_atom.slice(start_of_branch_index)
            let is_branch = false
            if (previous_atom_id === 1) {
                console.log(compressed_atom_from_start_of_branch)
//                process.error()
            }
            compressed_atom_from_start_of_branch.map((atom, k)=> {
                // merge bonds
                const bonds = atom[4].concat(atom[5]).concat(atom[6])
                // Format
                const bond_indexes = bonds.map((b)=>{
                    return b[0] *1
                }).filter((id)=>{
                    return id !==previous_atom_id
                })
                if (bond_indexes.length ===0) {
                    is_branch = true
                }
                previous_atom_id = atom[1]
            })

            return is_branch
        },

        chains: function() {
            const cache = []
            const chain = []
            const atoms = mmolecule[0][1].atomsWithNoHydrogens()
            const terminal_atoms = atoms.filter((atom)=>{
                return atom.indexedBonds(atoms).length + atom.indexedDoubleBonds(atoms).length + atom.indexedTripleBonds(atoms).length === 1
            })
            console.log(terminal_atoms)
            process.error()
            const atom = terminal_atoms[0]
            // Modifies cache
            // @Todo we can only form chains starting from a terminal atom
            __chainAtoms(cache, chain, atom, atoms, terminal_atoms, atoms.length, 0)
            // @todo filter out chains where the last atom in the chain is not a terminal atom (has only parent bond)
            process.error()
            return cache.filter((chain)=>{
                const last_atom_in_chain = chain[chain.length-1]
                return last_atom_in_chain.indexedBonds(atoms).length + last_atom_in_chain.indexedDoubleBonds(atoms).length + last_atom_in_chain.indexedTripleBonds(atoms).length === 1
            })
        },

        canonicalSMILES: function(testing) {

            if (mmolecule[0] ==="B") {
                return "B"
            }

            const ring_bond_ids = {}
            let ring_bond_id = 1
            let start_of_branches_ids = []
            let end_of_branches_ids = []

            const compressedMolecule = this.compressed()

            const last_atom = compressedMolecule[compressedMolecule.length -1]

            compressedMolecule.map((current_atom, i)=>{

                // Ring bonds
                // Get atoms from the first atom that is not bonded to the current atom
                const child_atoms = __getChildAtoms(compressedMolecule, current_atom)

                if (testing) {
                    console.log("Current atom id: " + current_atom[1])
                    console.log("Child atoms")
                    console.log(child_atoms.map((a)=>{
                        return a[1]
                    }))
                    console.log("Ring bond ids:")
                    console.log(ring_bond_ids)
                }

                if (child_atoms.length > 0) {

                    // Identify ring bonds
                    // Ring bond if current atom id in list of child atoms
                    const ring_bond_child_atoms = child_atoms.filter((child_atom,i)=>{
                        const bonds_ids = __getBondIds(child_atom[4]).concat(__getBondIds(child_atom[5])).concat(__getBondIds(child_atom[6]))
                        const current_atom_bond_index = bonds_ids.indexOf(current_atom[1])
                        if (current_atom_bond_index !== -1) {
                            if (testing) {
                                //console.log("current atom bond index:")
                                //console.log(current_atom_bond_index)
                                //console.log("child atom")
                                //console.log(child_atom)
                                //console.log("bond ids")
                                //console.log(bonds_ids)
                            }
                            // Filter out current bond id and bond ids > child bond id
                            const bond_ids_to_test = _.cloneDeep(bonds_ids).filter((b_id)=>{
                                return b_id !== current_atom[1] && b_id < child_atom[1]
                            })
                            return bond_ids_to_test.length > 0
                        } else {
                            return false
                        }

                    })
                    if (testing) {
                        console.log("ring bond child atoms")
                        console.log(ring_bond_child_atoms)
                    }
                    if (ring_bond_child_atoms.length > 0) {
                        const ring_bond_child_atom = ring_bond_child_atoms[0]
                        const parent_item = {}
                        const child_atom_id = ring_bond_child_atom[1]
                        parent_item[current_atom[1]] = ring_bond_id
                        ring_bond_ids[current_atom[1]+""] = ring_bond_id
                        ring_bond_ids[child_atom_id] = ring_bond_id
                        ring_bond_id = ring_bond_id + 1
                    }
                }

                // Branches
                // A bond is a start of a branch if
                // Bond id is not less than the current atom id
                // current atom is a ring bond id and the number of bonds is greater than 2 OR current atom is
                // not a ring bond id and the number of bonds > 1

                // Get ids of bonded atoms
                const bond_ids = __getBondIds(current_atom[4]).concat(__getBondIds(current_atom[5])).concat(__getBondIds(current_atom[6]))


                const min_number_of_bonds = ring_bond_ids[current_atom[1]+""] === undefined?1:1

                // Remove ring bond ids
                const bond_ids_no_ring_bond_ids = bond_ids.filter((bond_id)=>{
                    return ring_bond_ids[bond_id+""] === undefined
                })



                // Remove bond ids < current atom bond id and if last atom in the molecule
                const bond_ids_final = bond_ids_no_ring_bond_ids.filter((bond_id)=>{
                    return bond_id > current_atom[1]
                })


                // Sort and pop last bond_id as this is the last branch attached to the current atom
                bond_ids_final.sort((a, b) => a - b).pop()

                if (bond_ids_final.length > (min_number_of_bonds - 1)) { // we've removed the last bond_id
                    bond_ids_final.map((bond_id, k) => {
                        if (bond_id !== last_atom[1]) { // not last branch on the current atom and bond is not last atom on the molecule
                            start_of_branches_ids.push(bond_id)
                        }
                    })
                }

                if (testing && current_atom[1] === 6) {
                    console.log(bond_ids_final)
                }



                if (testing) {
                    console.log("Start of branches -bond_ids_final, current atom = " + current_atom[1])
                    console.log(bond_ids_final)
                }

                // End of bond ids
                bond_ids.sort((a, b) => a - b)
                if (bond_ids.length === 1 && i !==0 && i < compressedMolecule.length -1) {
                    end_of_branches_ids.push(current_atom[1])
                }

                // Ring bond atoms
                if(undefined !==ring_bond_ids[current_atom[1] +'']) {
                    const bond_ids_filtered = bond_ids.filter((b_id)=>{
                        return b_id < current_atom[1] && undefined !== ring_bond_ids[b_id+""]
                    })
                    if (bond_ids_filtered.length ==1) {
                        end_of_branches_ids.push(current_atom[1])
                    }
                }

                // Last atom
                end_of_branches_ids = end_of_branches_ids.filter((b_id)=>{
                    return b_id !== last_atom[1]
                })

                // First atom
                /*
                if (i === 0) {
                    if (bond_ids_final.length > 1) {
                        // Branch
                        bond_ids_final.map((bond_id) => {
                            start_of_branches_ids.push(bond_id)
                        })
                    }
                } else {
                    // Not first atom
                    if (bond_ids_final.length > 1) {
                        // Branch
                        bond_ids_final.map((bond_id) => {
                            start_of_branches_ids.push(bond_id)
                        })
                    }
                }
                 */

            })


            if (testing) {
                console.log("compressedMolecule")
                console.log(compressedMolecule)
                console.log("Ring bonds")
                console.log(ring_bond_ids)
                console.log("Branches")
                console.log(start_of_branches_ids)
                console.log("end")
                console.log(end_of_branches_ids)
                //process.error()
            }


            let single_bond_indexes = []
            let bond_indexes = []
            let branch_depth = -1
            let previous_branch_depth = 0
            let branch_tracker = []
            let previous_atom = null
            const smiles = compressedMolecule.reduce((s, current_atom, i)=> {

                // Start of branch
                if (start_of_branches_ids.indexOf(current_atom[1]) > -1) {
                    s = s + "("
                }

                // Determine bond type
                let bond_type = ""
                const double_parent_bond_ids = current_atom[5].filter((id)=>{
                    id = id.split(" ")
                    return (id[0] * 1) < current_atom[1]
                })
                if (double_parent_bond_ids.length > 0) {
                    bond_type = "="
                }
                const triple_parent_bond_ids = current_atom[6].filter((id)=>{
                    id = id.split(" ")
                    return (id[0] * 1) < current_atom[1]
                })
                if (triple_parent_bond_ids.length > 0) {
                    bond_type = "#"
                }

                // square brackets if required
                let add_square_brackets = false
                // Charge
                // Hydrogens
                const number_of_hydrogens = current_atom[2].replace(/H /, "") * 1 + current_atom[4].length + (current_atom[5].length*2)
                switch(current_atom[0]) {
                    case "C":
                        if (number_of_hydrogens !== 4) {
                            add_square_brackets = true
                            current_atom[0] = current_atom[0] + ((current_atom[2].replace(/H /, "") * 1 ===0?"":"H"+current_atom[2].replace(/H /, "") * 1))
                            if (number_of_hydrogens > 4) {
                                current_atom[0] = current_atom[0] + "+"
                            }
                        }
                        break
                    case "O":
                        if (number_of_hydrogens !== 2) {
                            add_square_brackets = true
                            current_atom[0] = current_atom[0] + ((current_atom[2].replace(/H /, "") * 1 ===0?"":"H"+current_atom[2].replace(/H /, "") * 1))
                            if (number_of_hydrogens > 2) {
                                current_atom[0] = current_atom[0] + "+"
                            }
                            if (number_of_hydrogens < 2) {
                                current_atom[0] = current_atom[0] + "-"
                            }
                        }
                        break
                    case "N":
                        if (number_of_hydrogens !== 3) {
                            add_square_brackets = true
                            current_atom[0] = current_atom[0] + ((current_atom[2].replace(/H /, "") * 1 ===0?"":"H"+current_atom[2].replace(/H /, "") * 1))
                            if (number_of_hydrogens > 3) {
                                current_atom[0] = current_atom[0] + "+"
                            }
                            if (number_of_hydrogens < 3) {
                                current_atom[0] = current_atom[0] + "-"
                            }
                        }
                        break
                }
                const charge = current_atom[3].replace("Charge: ", "")

                if (charge !== " " && charge !== "0" && current_atom[0][current_atom[0].length -1] != "+" &&  current_atom[0][current_atom[0].length -1] != "-") {
                    current_atom[0] = current_atom[0] + charge
                    add_square_brackets = true
                }
                if (add_square_brackets === true) {
                    current_atom[0] = "[" + current_atom[0] + "]"
                }
                s = s + bond_type + current_atom[0]

                // Ring bond ids
                if (ring_bond_ids[current_atom[1]+""] !== undefined) {
                    s = s + ring_bond_ids[current_atom[1]+""]
                }

                if (end_of_branches_ids.indexOf(current_atom[1]) > -1) {
                    s = s + ")"
                }
                // End of branch

                return s

            }, "").replace(/\[C\]/g, "C").replace(/\[O\]/g, "O").replace(/\[N\]/g, "N")

            if (testing) {
                console.log(smiles)
                process.error()
            }

            //process.error()
            return smiles

        },

        canonicalSMILESold: function() {
            // const m = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
// const benzene = MoleculeFactory("C1=CC=CC=C1")
            /*

pinacolone
CC(=O)C(C)(C)C
[
  [ '', 'C', 3, [ 4 ], [], [] ],
  [ '', 'C', 4, [ 3, 5, 6 ], [ 5 ], '=' ],
  [ '', 'O', 5, [ 4 ], [ 4 ], [] ],
  [ '', 'C', 6, [ 4, 10, 14, 18 ], [], [] ],
  [ '', 'C', 10, [ 6 ], [], [] ],
  [ '', 'C', 14, [ 6 ], [], [] ],
  [ '', 'C', 18, [ 6 ], [], [] ]
]


            three_Methylamino_phenol
            CNC1=CC(=CC=C1)O
[
  [ '', 'C', 3, [ 5 ], [], [] ],
  [ '', 'N', 5, [ 3, 6 ], [], [] ],
  [ '', 'C', 6, [ 5, 8, 15 ], '=', [] ],
  [ '', 'C', 8, [ 6, 9 ], [ 6 ], [] ],
  [ '', 'C', 9, [ 8, 11, 17 ], '=', [] ],
  [ '', 'C', 11, [ 9, 13 ], [ 9 ], [] ],
  [ '', 'C', 13, [ 11, 15 ], '=', [] ],
  [ '', 'C', 15, [ 6, 13 ], [ 13 ], [] ],
  [ '', 'O', 17, [ 9 ], [], [] ]
]


           cyclohexanamine "C1=C(NC)C=CC=C1"
           [
  [ 'C', 1, [ 2, 16 ], '=', [] ],
  [ 'C', 2, [ 1, 4, 10 ], [ 1 ], [] ],
  [ 'N', 4, [ 2, 8 ], [], [] ],
  [ 'C', 8, [ 4 ], [], [] ],
  [ 'C', 10, [ 2, 12 ], '=', [] ],
  [ 'C', 12, [ 10, 14 ], [ 10 ], [] ],
  [ 'C', 14, [ 12, 16 ], '=', [] ],
  [ 'C', 16, [ 1, 14 ], [ 14 ], [] ]
]

[

Benzene C1=CC=CC=C1
[
  [ 'C', 1, [ 3, 11 ], '=', [] ],
  [ 'C', 3, [ 1, 5 ], [ 1 ], [] ],
  [ 'C', 5, [ 3, 7 ], '=', [] ],
  [ 'C', 7, [ 5, 9 ], [ 5 ], [] ],
  [ 'C', 9, [ 7, 11 ], '=', [] ],
  [ 'C', 11, [ 1, 9 ], [ 9 ], [] ]
]


]

[
  [ 'C', 3, [ 5 ], [], [] ],
  [ 'C', 5, [ 3, 8, 21 ], [], [], '', '(' ], - correct
  [ 'C', 8, [ 5, 9 ], [], [], '', '' ],
  [ 'C', 9, [ 8, 11, 19 ], '=', [], '', '(' ], * ring bond
  [ 'C', 11, [ 9, 13 ], [ 9 ], [], '', '' ],
  [ 'C', 13, [ 11, 15 ], '=', [], '', '' ],
  [ 'C', 15, [ 13, 17 ], [ 13 ], [], '', '' ],
  [ 'C', 17, [ 15, 19 ], '=', [], '', '' ],
  [ 'C', 19, [ 9, 17 ], [ 17 ], [], '', '' ], - should have "9' at end (ring bond)
  [ 'N', 21, [ 5, 25 ], [], [], '', '' ],
  [
    'C', 25, [ 21 ],
    [],  [], ')',
    '',  ''
  ]
]


             */
            // Get atoms formatted and add bond type
            const atoms = this.formatted().map((atom, i, arr)=>{
                if (atom[3].length > 0) {
                    const bond_number = atom[3][0]
                    if (bond_number > atom[1]) {
                        atom[4] = "="
                    }
                }
                return atom
            }).map((atom)=>{
                atom.unshift("")
                return atom
            })


            /*

[
  pinacolone
CC(=O)C(C)(C)C
CC(=O)C(C)C)C incorrect
[
  ['', 'C', 3, [ 4 ], [],  [],''],
  [ '', 'C', 4, [ 3, 5, 6 ], [ 5 ], '=', '(' ],
  [')', 'O',5,[ 4 ], [ 4 ], [],''],
  [ ')', 'C', 6, [ 4, 10, 14, 18 ], [], [], '(' ],
  [')',   'C', 10, [ 6 ], [],  [],''],

  [')(','C', 14, [ 6 ], [],  [], '', ')'],
  [')', 'C', 18,[ 6 ], [],  [], '']
]



*/
            const atoms_with_branches = atoms.map((atom,i)=>{
                // Start of branch if atom is first atom and has more than 1 bond
                // or if atom is not the first atom has more than 2 bonds
                if ((i === 0 && atom[3].length > 1) || atom[3].length > 2) {
                    // Add ")" to each bond > atom number
                    atom[3].map((bond_number) => {
                        if (bond_number > atom[2]) {
                            const bond_atom_index = _.findIndex(atoms, (a) => {
                                return a[2] === bond_number
                            })
                            // Add ")"
                            atoms[bond_atom_index][0] = ")"
                        }
                    })
                    atom.push("(")
                } else {
                    atom.push("")
                }
                return atom
            }).map((atom)=>{
                if (atom[0]!==")") {
                    atom[0] = ""
                }
                return atom
            }).map((atom, i )=>{
                if (i < atoms.length -1 && atom[3].length===1 && atom[0]===")") {
                    atom[0] = ")("
                    atom.push(")")
                }
                return atom
            })

           // console.log(atoms_with_branches)
            //console.log(ddd)
            /*

             */
            let ring_bond_number = 1

            const atoms_with_ringbonds = atoms_with_branches.reduce((carry, atom,i,arr)=>{
                // Ring bond if atom has ")" in front, one of the bond is not previous atom
                // and < atom number and all bonds < atom number
                if (i === 0) {
                    carry.push(atom)
                    return carry
                }
                if (atom[0] === ")" && atom[3].length > 1) {
                    const next_bonds =  atom[3].filter((bond_number)=>{
                        // filter
                        return bond_number > atom[2]
                    })
                    if (next_bonds.length > 0) {
                        // Not all the bonds are previous bonds
                        carry.push(atom)
                        return carry
                    }
                    const bonds = atom[3].filter((bond_number)=>{
                        // filter
                        return bond_number < atom[2] && bond_number !== atoms[i-1][1]  && bond_number !== atoms[i-1][2]
                    })
                    if (bonds.length > 0) {
                        const bond_atom_index = _.findIndex(carry, (a)=> {
                            // findIndex
                            return a[2] === bonds[0]
                        })
                        // Remove ")" from next atom
                        carry[bond_atom_index+1][0] = ""
                        // Remove ")" from previous atom
                        if (bond_atom_index > 0) {
                            carry[bond_atom_index - 1][0] = ""
                        }
                        // Remove "("
                        carry[bond_atom_index] = carry[bond_atom_index].map((item)=>{
                            // Map
                            if (item==="("){
                                item = ''
                            }
                            return item
                        })
                        // Mark where start of ring is so we don't remove the ring number
                        carry[bond_atom_index][2] = '<<' + ring_bond_number + '>>'
                        atom[0] = "" // Remove ")" from start of string
                        atom[2] = "" // Remove the atom number
                        atom.push('{{'+ (ring_bond_number) +'}}') // Add ring number
                        ring_bond_number = ring_bond_number + 1
                    }
                } else {
                    atom.push("")
                }
                carry.push(atom)
                return carry
            }, []).map((atom)=>{
                if (atom[5]==="=" && atom[6]==="("){
                    atom[6] = "(" + atom[5]
                    atom[5] = ""
                }
                return atom
            })


            //console.log(atoms_with_ringbonds)
            //console.log(abc)

            /*


[
  [
    '',    'C', 3,
    [ 5 ], [],  [],
    ''
  ],
  [ '', 'N', 5, [ 3, 6 ], [], [], '', '' ],
  [ '', 'C', '<<6>>', [ 5, 8, 15 ], [ 8 ], '=', '', '' ],
  [ '', 'C', 8, [ 6, 9 ], [ 6 ], [], '' ],
  [ '', 'C', 9, [ 8, 11, 17 ], [ 11 ], '=', '(', '' ],
  [ ')', 'C', 11, [ 9, 13 ], [ 9 ], [], '' ],
  [ '', 'C', 13, [ 11, 15 ], [ 15 ], '=', '', '' ],
  [ '', 'C', '', [ 6, 13 ], [ 13 ], [], '', '{{6}}' ],
  [
    ')',   'O', 17,
    [ 9 ], [],  [],
    '',    ''
  ]
]

CNC1=CC(=C  C =C1)   O

CNC6=CC=(

             */


            const atoms_numbers_removed = atoms_with_ringbonds.map((a)=>{
                if (typeof a[2] === "number") { // if ring bond then string
                    a[2] = ""
                }
                return a
            })

            return ((atoms_numbers_removed.map((a,i)=>{
                return a.filter((item)=>{
                        return typeof item !== 'object'
                    }
                ).join('')
            }).join('')).replace(/<</g, "").replace(/>>/g, "").replace(/{{/g, "").replace(/}}/g, "").replace(/\(\)/g, "("))
                .replace(/\(\=\)/,"(=").replace(/\)\)/g, ")").replace(/\(\(/g, "(").replace(/\(=\(/g, "(=")
                .replace(/\[C\]/g, "C")
                .replace(/\[O\]/g, "O")
                .replace(/\[N\]/g, "N")

        },

        canonicalSMILESOld2: function(chains) {


            const root_atom_index = this.rootAtomIndex(0)
            chains = MoleculeAI.chains(null, root_atom_index, [[root_atom_index]], 0, 0, 1)
            //console.log('Views/Molecule.js chains')
            //console.log(chains)
            // 3,  5,  8,  *9, 11, 12, 13, 15, 17,  *9
            //  3,  5,  8,  9, 11, *12, 13, 18, 21, 22, *12

            let ring_bond_number = 1

            /*
            Add ring bond numbers to atoms.
            An atom is a ring bond if it's index number (row[1]) occurs more than once
            in a chain. The end ring index of a ring bond row is the second to last item in the matching chain.
             */
            const formatted_with_ringbonds = this.formatted().reduce((carry, row, i, arr)=>{
                const ring_chain_index = _.findIndex((chains), (chain)=>{
                    return chain.filter((item)=>{
                        return item === row[1] * 1
                    }).length > 1
                })
                if (ring_chain_index > -1 && ring_bond_number < 3) { // todo
                    row[0] = row[0] + ring_bond_number
                    row.push(true)
                    const end_ring_index = _.findIndex(arr, (r)=>{
                        return r[1] === chains[ring_chain_index][chains[ring_chain_index].length - 2]
                    })
                    arr[end_ring_index][0] = arr[end_ring_index][0] + ring_bond_number
                    arr[end_ring_index].push(true)
                    ring_bond_number++
                }
                carry.push(row)
                return carry
            }, [])






            const formatted_with_branches = formatted_with_ringbonds.reduce((carry, row, i, arr)=>{
                if ((i===0 && row[2].length > 1) || (row[2].length > 2 && row[row.length-1]!==true)) { // todo row[row.length-1 is true if ring bond atom
                    row[0] = row[0] + "("
                    const end_branch_index = _.findIndex(arr, (r)=>{
                        return r[1] === row[2][row[2].length-1]
                    })
                    arr[end_branch_index][0] = ")" + arr[end_branch_index][0]
                }
                carry.push(row)
                return carry
            }, [])

            //console.log(formatted_with_branches)
            //console.log(ppp)
            // CC(=O)C(C)(C)C
            // CC(=O)C(CC)C
            console.log(formatted_with_branches)

            console.log(jjj)
            // Atoms
            /*
[
  [ 'C', 3, [ 4 ], [], [] ],
  [ 'C', 4, [ 3, 5, 6 ], [ 5 ], [] ],
  [ 'O', 5, [ 4 ], [ 4 ], [] ],
  [ 'C', 6, [ 4, 10, 14, 18 ], [], [] ],
  [ 'C', 10, [ 6 ], [], [] ],
  [ 'C', 14, [ 6 ], [], [] ],
  [ 'C', 18, [ 6 ], [], [] ]
]
             */

            const formatted_with_bonds = formatted_with_branches.map((row)=>{
                if (row[3].length > 0) {
                    const double_bonds = row[3].filter((b_index)=>{
                        return b_index > row[1]
                    })
                    if (double_bonds.length > 0) {
                        row[0] = row[0] + "="
                    }
                }
                return row
            })

            //console.log(formatted_with_bonds)
            //console.log(iii)

            return formatted_with_bonds.map((r)=>{
                return r[0]
            }).join('')




        },

        canonicalSMILESold: function(chains) {


            const root_atom_index = this.rootAtomIndex(0)
            chains = MoleculeAI.chains(null, root_atom_index, [[root_atom_index]], 0, 0, 1)
            console.log('Views/Molecule.js chains')
            console.log(chains)
            console.log(abc)


            //if (undefined === chains) {
            if (false) {
                // Get chains
                /* If compare(a,b) is less than zero, the sort() method sorts a to a lower index than b. In other words, a will come first.
If compare(a,b) is greater than zero, the sort() method sort b to a lower index than a, i.e., b will come first.
If compare(a,b) returns zero, the sort() method considers a equals b and leaves their positions unchanged.*/
                chains = MoleculeAI.chains(null, root_atom_index, [[root_atom_index]], 0, 0, 1).sort((a,b)=> {
                    return  a[a.length-1]  > b[b.length-1] ? -1: 1
                }).sort((a,b)=>{
                    return a.length > b.length  ? -1: 1
                })

            }

            //  if (undefined === chains2) {
            // Get chains2
            /* If compare(a,b) is less than zero, the sort() method sorts a to a lower index than b. In other words, a will come first.
If compare(a,b) is greater than zero, the sort() method sort b to a lower index than a, i.e., b will come first.
If compare(a,b) returns zero, the sort() method considers a equals b and leaves their positions unchanged.*/
            // console.log(root_atom_index)
            //console.log(mnj)

            //chains2 = MoleculeAI.chains2(null, root_atom_index, [], 0, 0, 1).sort((a,b)=> {
            /*
                chains2 = MoleculeAI.chains2(null, root_atom_index, [[root_atom_index]], 0, 0, 1).sort((a,b)=> {
                    return  a[a.length-1]  > b[b.length-1] ? -1: 1
                }).sort((a,b)=>{
                    return a.length > b.length  ? -1: 1
                })
                */

            //console.log('VMolecule')
            // apple [ [ 1, 2, 6 ], [ 1, 2, 4 ], [ 1, 2, 3 ] ]
            // [ [ 1, 2, 3 ], [ 1, 2, 4 ], [ 1, 2, 6 ] ]
            //   }



            // "C  O   C  (C) (C)   C   O")
            //  3  4   5  (9) (13)  16  18
            //console.log(this.compressed())
            /*
   [ [ 'C', 3, [ '4  O' ] ],
  [ 'O', 4, [ '3  C', '5  C' ] ],
  [ 'C', 5, [ '4  O', '9  C', '13  C', '16  C' ] ],
  [ 'C', 9, [ '5  C' ] ],
  [ 'C', 13, [ '5  C' ] ],
  [ 'C', 16, [ '5  C', '18  O' ] ],
  [ 'O', 18, [ '16  C' ] ] ]

             */

            // [ 3, 4, 5, 9 ]
            // [ 3, 4, 5, 13 ],
            // <1 empty item>,
            // [ 16 ]
            //   console.log(chains)
            //   console.log('VMolecule')
            //   process.exit()
            /*

             */
            if (chains.length===0) {
                return ""
            }

            let chain = ""
            let branch_atom_index = null


            if (chains.length === 1) {
                // Replace atom indexes with symbols
                // console.log(chains[0])
                //process.exit()
                /*
                Apple [ 1, 2, '(', 3, ')', '(', 4, ')', 6 ]
                [  1,   2, '(', 6, ')', '(', 4, ')', 3 ]
                 */

                /*
                [
      [
        0,   '(', 1, ')', '(', 19,
        ')', 5,   6, 7,   8,   9,
        10,  11,  6
      ]
    ]

                 */
                const smiles = _.cloneDeep(chains[0]).reduce(
                    (carry, atom_index, i, arr) => {

                        if (typeof atom_index !== "number") {
                            return carry + atom_index
                        }

                        let symbol = mmolecule[0][1][atom_index][0]

                        const bond = this.getBond(_.cloneDeep(chains[0]), atom_index, i)

                        const atom_object = CAtom(mmolecule[0][1][atom_index], atom_index, mmolecule)

                        const charge = atom_object.isNegativelyCharged()?"-":(atom_object.isPositivelyCharged()?"+":"")


                        const next_atom_index = this.nextAtomIndex(chains[0], i+1)

                        let add_brackets = this.addBrackets(symbol, charge)

                        const hydrogen_bonds = atom_object.indexedBonds("").filter((bond)=>{
                            return bond.atom[0] === "H"
                        })

                        let hydrogens=""
                        //console.log(atom_object.indexedBonds("").length +atom_object.indexedDoubleBonds("").length)
                        //console.log(mmolecule[0][1][atom_index][3])
                        //console.log(hydrogen_bonds.length)
                        if (atom_object.indexedBonds("").length +atom_object.indexedDoubleBonds("").length < mmolecule[0][1][atom_index][3]) {
                            if (hydrogen_bonds.length > 0) {
                                hydrogens = "H" + hydrogen_bonds.length
                                add_brackets = true
                            }
                        }

                        if (next_atom_index === false) {
                            return carry + bond + (add_brackets?"[":"") + symbol + hydrogens + charge + (add_brackets?"]":"")
                        }

                        const bonds = atom_object.indexedBonds("").filter((bond)=>{
                            return bond.atom_index === next_atom_index
                        })


                        // Check if we have a loop
                        const last_index_of = chains[0].lastIndexOf(atom_index)
                        if (last_index_of !== i) {
                            // We have a loop
                            arr[last_index_of] = chains[0][last_index_of] + ""
                            return carry + (add_brackets?"[":"") + bond + symbol + hydrogens + charge + (add_brackets?"]":"") + atom_index
                        } else {
                            return carry + (add_brackets?"[":"") + bond + symbol + hydrogens + charge + (add_brackets?"]":"")
                        }


                    },
                    ""
                )
                // should be OS(=O)(=O)O
                // OS(O)(=O)O
                return smiles
                // return smiles.replace(/\=\(/g, "(=")

            } else {
                // Get atom indexes in the second row which are not in the first row
                const atom_indexes_diff = Set().difference(_.cloneDeep(chains[1]), _.cloneDeep(chains[0]))
                if (atom_indexes_diff.length !== 0) {
                    // Inject atom indexes that are not in the second row into the first row
                    const insertion_point = Set().arraysDifferAt(_.cloneDeep(chains[1]), _.cloneDeep(chains[0]))
                    chains[0] = Set().insertIntoArray(_.cloneDeep(chains[0]), ["(",...atom_indexes_diff,")"], insertion_point)
                }
                // Remove second row as it has been merged into the first row
                chains.splice(1,1)
                // console.log("VMolecule --")
                // console.log(chains)
                return this.canonicalSMILES(chains)
            }



            /*
            // Index: 3 Bonds: 3 1
            // Loop atom is the bottom one on the benzene ring
            // AssertionError: expected 'C(=CCC(C=C)(CO))(C)' to be 'C1=CC=C(C=C1)CO'
           // VMolecule([benyzl_alcohol, 1]).canonicalSMILES().should.be.equal("C1=CC=C(C=C1)CO")

            mmolecule[0][1][0].should.be.an.Array()
            mmolecule[0][1][0][0].should.be.an.String()
           // console.log(4)
            SMILES =  __SMILES_recursive("", mmolecule[0][1][0], null, 0, 0, [])

            return  SMILES
            */


        },
        'render' : () => {
            console.log('{' + mmolecule[0][1].reduce((working, current, i, arr)=>{
                if (i > 0) {
                    working += current[0] // atomic symbol
                }
                return working
            }, '') + ' X ' + mmolecule[1] + '}')
        }
    }
}
module.exports = VMolecule

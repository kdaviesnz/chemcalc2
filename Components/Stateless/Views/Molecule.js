const CMolecule = require('../../../Controllers/Molecule')
const CAtom = require('../../../Controllers/Atom')
const _ = require('lodash');
const Set = require('../../../Models/Set')

const VMolecule = (mmolecule) => {


    mmolecule.length.should.be.equal(2) // molecule, units
    mmolecule[0].length.should.be.equal(2) // pKa, atoms

    const MoleculeAI = require("../../../Components/Stateless/MoleculeAI")(mmolecule)

    const __isRing = (current_atom) => {
        __getIndexOfNextAtom(current_atom, current_atom_index)
    }

    const __getBondType = (current_atom, previous_atom) => {

        if (previous_atom === null) {
            return ""
        }

        const b = Set().intersection(current_atom.slice(5), previous_atom.slice(5))
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
            if (Set().intersection(_atom.slice(5),current_atom.slice(5) ).length > 1) {
                return i;
            }
            return carry
        }, null)
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

    return {

        'compressed': () => {

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
                            return bond.atom_index + "  " + bond.atom[0]
                        }
                    )
                    const double_bonds = c.indexedDoubleBonds("").filter((bond)=>{
                        return bond.atom[0] !== 'H'
                    }).map(
                        (bond)=>{
                            return bond.atom_index + "  " + bond.atom[0]
                        }
                    )
                    const triple_bonds = c.indexedTripleBonds("").filter((bond)=>{
                        return bond.atom[0] !== 'H'
                    }).map(
                        (bond)=>{
                            return bond.atom_index + "  " + bond.atom[0]
                        }
                    )

                    const electrons = atom.slice(5)
                    const free_electrons = c.freeElectrons()

                    return [atom[0], index, "H " + h.length, 'Charge: '+ atom[4],  bonds, double_bonds, triple_bonds, electrons.length, free_electrons.length]
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

                    const electrons = atom.slice(5)
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
        canonicalSMILES: function(testing) {

            // sulphuric acid compressed
            // OS(=O)(=O)O
            /*
           [
  [ 'O', 1, 'H 1', 'Charge: 0', [ '2  S' ], [], [], 8, 4 ],
  [
    'S',
    2,
    'H 0',
    'Charge: 0',
    [ '1  O', '6  O' ],
    [ '3  O', '4  O' ],
    [],
    12,
    0
  ],
  [ 'O', 3, 'H 0', 'Charge: 0', [], [ '2  S' ], [], 8, 4 ],
  [ 'O', 4, 'H 0', 'Charge: 0', [], [ '2  S' ], [], 8, 4 ],
  [ 'O', 6, 'H 1', 'Charge: 0', [ '2  S' ], [], [], 8, 4 ]
]
*/
            // for each atom we need to get if it's the end of the chain or part of a chain, what atoms it is attached to, whether we start a new branch etc
            // Atomic symbol / id / Hydrogens / Charge / Single bonds / Double bonds / Triple bonds/ # of electrons / # of free electrons
            const compressedMolecule = this.compressed()
            // (OS(=O)(=O)O)

            // Ring bonds
            /*
            C1=CC=CC=C1
[
  [ 'C', 1, 'H 1', 'Charge: 0', [ '11  C' ], [ '3  C' ], [], 8, 0 ],
  [ 'C', 3, 'H 1', 'Charge: 0', [ '5  C' ], [ '1  C' ], [], 8, 0 ],
  [ 'C', 5, 'H 1', 'Charge: 0', [ '3  C' ], [ '7  C' ], [], 8, 0 ],
  [ 'C', 7, 'H 1', 'Charge: 0', [ '9  C' ], [ '5  C' ], [], 8, 0 ],
  [ 'C', 9, 'H 1', 'Charge: 0', [ '7  C' ], [ '11  C' ], [], 8, 0 ],
  [ 'C', 11, 'H 1', 'Charge: 0', [ '1  C' ], [ '9  C' ], [], 8, 0 ]
]

             */


            // Rules
            // An atom has a branch if it has more than 2 bonds.

            let start_of_branches_ids = []
            compressedMolecule.map((atom, i)=> {
                const single_bonds = atom[4].length
                const double_bonds = atom[5].length
//                const_single_bonds_
                const number_of_branches = atom[4].length + atom[5].length
                if (number_of_branches > 2 ) {
                    // s = s + "("
                    // Add start of branch ids
                    atom[4].map((id)=>{
                        id = id.split(" ")
                        if (testing) {
                            console.log(atom)
                            console.log(id)
                        }
                        id = id[0] * 1
                        // Check for ring bond
                        const child_atom = compressedMolecule.filter((a)=>{
                            return a[1] === id
                        }).pop()
                        const child_bond_ids = child_atom[4].map((b)=>{
                            b = b.split(" ")
                            return b[0] * 1
                        })
                        if (testing) {
                            console.log("child bond ids")
                            console.log(child_bond_ids)
                            console.log(atom[1])
                            console.log(child_bond_ids.indexOf(atom[1]))
                        }
                     //  if (child_bond_ids.indexOf(atom[1])) {
                            start_of_branches_ids.push(id)  // "1 0"
                       // }
                    })
                    atom[5].map((id)=>{
                        id = id.split(" ")
                        start_of_branches_ids.push(id[0]*1) // "1 0"
                    })
                    atom[6].map((id)=>{
                        id = id.split(" ")
                        start_of_branches_ids.push(id[0]*1) // "1 0"
                    })
                }
            })

            if (testing) {
                console.log("start of branch ids")
                console.log(start_of_branches_ids)
            }

           // process.error()
            // Get ids of ring bonds
            const ring_bond_ids = {}
            let ring_bond_id = 1
            compressedMolecule.map((parent_atom, i) => {
                const child_atoms = compressedMolecule.slice(i + 2)
                // Check other atoms for a bond with the same id as the current atom
                if (child_atoms.length > 1) {
                    child_atoms.map((child_atom, k) => {
                        if (start_of_branches_ids.indexOf(child_atom[1]) === -1) {
                            const child_atom_single_bonds = child_atom[4].length == 0 ? [] : child_atom[4].map((a) => {
                                a = a.split(" ")
                                return a[0] * 1
                            })
                            const child_atom_double_bonds = child_atom[5].length === 0 ? [] : child_atom[5].map((b) => {
                                b = b.split(" ")
                                return b[0] * 1
                            })
                            if (child_atom_single_bonds.indexOf(parent_atom[1]) > -1 || child_atom_double_bonds.indexOf(parent_atom[1]) > -1) {
                                const parent_item = {}
                                const child_atom_id = child_atom[1]
                                parent_item[parent_atom[1]] = ring_bond_id

                               // ring_bond_ids[parent_item[parent_atom[1]]] = ring_bond_id
                                ring_bond_ids[parent_atom[1]+""] = ring_bond_id
                                ring_bond_ids[child_atom_id] = ring_bond_id

                                if (testing) {
                                    console.log(parent_item)
                                    console.log(parent_item[parent_atom[1]])
                                    console.log(parent_item[parent_atom[0]])
                                    console.log(ring_bond_ids)
                                    //process.error()
                                }
                            }
                        }
                    })
                }
            })


            if (testing) {
                console.log("ring bond ids")
                console.log(ring_bond_ids)
                //process.error()
            }

            const atoms_with_ring_bond_ids = compressedMolecule.map((atom) => {
                if (undefined !== ring_bond_ids[atom[1] + '']) {
                    atom[0] = atom[0] + ring_bond_ids[atom[1] + '']
                    atom.push("is_ring_bond")
                }
                return atom
            })


            /*
[
  [ 'C', 1, 'H 1', 'Charge: 0', [ '11  C' ], [ '3  C' ], [], 8, 0 ],
  [ 'C', 3, 'H 1', 'Charge: 0', [ '5  C' ], [ '1  C' ], [], 8, 0 ],
  [ 'C', 5, 'H 1', 'Charge: 0', [ '3  C' ], [ '7  C' ], [], 8, 0 ],
  [ 'C', 7, 'H 1', 'Charge: 0', [ '9  C' ], [ '5  C' ], [], 8, 0 ],
  [ 'C', 9, 'H 1', 'Charge: 0', [ '7  C' ], [ '11  C' ], [], 8, 0 ],
  [ 'C', 11, 'H 1', 'Charge: 0', [ '1  C' ], [ '9  C' ], [], 8, 0 ]
]
C1=CC=CC=C1
 */

           // const start_of_branches_ids = []
            start_of_branches_ids = []
            let single_bond_indexes = []
            let bond_indexes = []
            const smiles = compressedMolecule.reduce((s, atom, i)=> {
                const number_of_branches = atom[4].length + atom[5].length
                if (number_of_branches > 2 || (i===0 && number_of_branches > 1) ) {
                    // s = s + "("
                    // Add start of branch ids
                    atom[4].map((id)=>{
                        id = id.split(" ")
                        start_of_branches_ids.push(id[0]*1)  // "1 0"
                    })
                    atom[5].map((id)=>{
                        id = id.split(" ")
                        start_of_branches_ids.push(id[0]*1) // "1 0"
                    })
                    atom[6].map((id)=>{
                        id = id.split(" ")
                        start_of_branches_ids.push(id[0]*1) // "1 0"
                    })
                }
                if (testing) {
                   // console.log("start of branches ids")
                    //console.log(start_of_branches_ids)
                    //process.error()
                }
                if (start_of_branches_ids.indexOf(atom[1]) > -1) {
                    if (testing) {
                        //console.log(atom)
                      //  process.log()
                    }
                    s = s + "("
                }
                // Determine bond type
                let bond_type = ""
                const double_parent_bond_ids = atom[5].filter((id)=>{
                    id = id.split(" ")
                    if (testing) {
                        //console.log("Id: " + id)
                    }
                    return (id[0] * 1) < atom[1]
                })
                if (testing) {
                    //console.log("double_parent_bond_ids")
                    //console.log(atom)
                    //console.log(double_parent_bond_ids)
                }
                if (double_parent_bond_ids.length > 0) {
                    bond_type = "="
                }

                // square brackets if required
                switch(atom[0]) {
                    case "C":
                        if (atom[2].replace(/H /, "") * 1 + atom[4].length + (atom[5].length*2) !== 4) {
                            atom[0] = "[" + atom[0] + "H" + atom[1] + "]"
                        }
                        break
                }
                s = s + bond_type + atom[0]
                // End of branch
                // if (i !==0 && i!==compressedMolecule.length-1 && atom[4].length + atom[5].length + atom[6].length===1) {
                if (i !==0 &&  atom[4].length + atom[5].length + atom[6].length===1) {
                    s = s + ")"
                }
                return s
            }, "")

            if (testing) {
                console.log(smiles)
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

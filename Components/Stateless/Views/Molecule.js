const CMolecule = require('../../../Controllers/Molecule')
const CAtom = require('../../../Controllers/Atom')
const _ = require('lodash');
const Set = require('../../../Models/Set')

const VMolecule = (mmolecule) => {

    mmolecule.length.should.be.equal(2) // molecule, units
    mmolecule[0].length.should.be.equal(2) // pKa, atoms

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
                    //console.log('b1')
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

        canonicalSMILES: () => {

            mmolecule[0][1][0].should.be.an.Array()
            mmolecule[0][1][0][0].should.be.an.String()
           // console.log(4)
            SMILES =  __SMILES_recursive("", mmolecule[0][1][0], null, 0, 0, [])

            return  SMILES
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
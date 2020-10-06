const CMolecule = require('../Controllers/Molecule')
const CAtom = require('../Controllers/Atom')
const _ = require('lodash');
const Set = require('../Models/Set')

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

    const __getAtomAsSMILE = (catom, current_atom) => {

        if (catom.isPositivelyCharged()) {
           return "[" + current_atom[0] + "+]"
        } else if (catom.isNegativelyCharged()) {
            return "[" + current_atom[0] + "-]"
        } else {
            return  (__addBrackets(current_atom[0])?"[":"") + current_atom[0] + (__addBrackets(current_atom[0])?"]":"") // eg "" + "C"
        }
        /*
        if (catom.isPositivelyCharged()) {
            carry = carry + "[" + current_atom[0] + "+]"
        } else if (catom.isNegativelyCharged()) {
            carry = carry + "[" + current_atom[0] + "-]"
        } else {
            carry += (__addBrackets(current_atom[0])?"[":"") + current_atom[0] + (__addBrackets(current_atom[0])?"]":"") // eg "" + "C"
        }
        // Get the type of bond between the current atom and the next non - hydrogen atom
        const next_atom = mmolecule_sans_hydrogens[index + 1]
        if (next_atom) {
            carry = carry + CMolecule(mmolecule_sans_hydrogens).bondType(current_atom, next_atom)
        }
        */

    }

    const __addBranches = (bonds, branch_index) => {
        let branch = ""

        bonds.map((bond)=> {
            /*
            {
                atom: ['Cl', ....]
                index:3 // index of the current atom is bonded to
                shared_electrons: ["il8089098","8909809uu"]
            },
            */
            const current_atom = mmolecule[0][1][bond.atom_index]
            branch =  branch + "(" + __SMILES_recursive("", current_atom, null, bond.atom_index, branch_index) + ")"
        })

        return branch
    }

    const __SMILES_recursive = (carry, current_atom, previous_atom, index, branch_index) => {


        if (current_atom === undefined) {
            return carry
        }

        current_atom[0].should.be.an.String()

        if (current_atom[0]==='H') {
            return __SMILES_recursive(carry, mmolecule[0][1][index+1], previous_atom, index+1, branch_index)
        }

        if (typeof current_atom !== 'object') {
            console.log('Molecule.js Atom must be an object. Got ' + current_atom + ' instead')
            throw new Error("Atom is not an object")
        }
        current_atom.should.be.an.Array()

//        console.log(current_atom[0])

        const catom = CAtom(current_atom, index, mmolecule)
        const bonds = catom.indexedBonds('H').filter((bond)=> {
            return bond.atom_index > index
        })



        //console.log('bonds:')
        //console.log(current_atom[0])
        //console.log(bonds)
        if (bonds.length === 0) {
            //console.log ("5 CARRY branch:" + branch_index + " " + carry)
            carry =  carry + __getBondType(current_atom, previous_atom) + __getAtomAsSMILE(catom, current_atom)
            return  carry
        }


        // First non-hydrogen atom?
        if (carry === "") {

            // Get how many atoms are attached to the atom, but don't include hydrogens
            if (bonds.length < 2) {
                // COC
                //carry = carry + __getAtomAsSMILE(catom, current_atom)
                // C
                carry = carry + __getAtomAsSMILE(catom, current_atom)
               // console.log ("4 CARRY branch:" + branch_index + " " + carry)
                return __SMILES_recursive(carry, mmolecule[0][1][index+1], current_atom, index+1, branch_index)

            } else {

                // First atom but has more than one atom attached to it eg C(C)O
                // Therefore we need start recursively branching
              //  console.log ("6 CARRY branch:" + branch_index + " " + carry)
                carry = carry + __getAtomAsSMILE(catom, current_atom) + __addBranches(bonds, branch_index+1)
            }

        } else {

            // COC
            // Get how many atoms are attached to the atom, but don't include hydrogens
            if (bonds.length < 2) {
                // O atom in COC bonds.length = 1 as we do not count the first C-O bond
                carry = carry + __getBondType(current_atom, previous_atom) + __getAtomAsSMILE(catom, current_atom)
                //console.log ("3 CARRY branch:" + branch_index + " " + carry)
                return __SMILES_recursive(carry, mmolecule[0][1][index+1], current_atom, index+1, branch_index)
            } else {
                // First atom but has more than one atom attached to it eg C(C)O
                // Therefore we need start recursively branching
                //console.log ("2 CARRY branch:" + branch_index + " " + carry)
                carry = carry +  __getAtomAsSMILE(catom, current_atom) + __addBranches(bonds, branch_index+1)
            }

        }

       //console.log ("1 CARRY branch:" + branch_index + " " + carry)
        return carry



    }

    return {

        canonicalSMILES: () => {

            mmolecule[0][1][0].should.be.an.Array()
            mmolecule[0][1][0][0].should.be.an.String()
            SMILES =  __SMILES_recursive("", mmolecule[0][1][0], null, 0, 0)

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

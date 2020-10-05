const CMolecule = require('../Controllers/Molecule')
const CAtom = require('../Controllers/Atom')
const _ = require('lodash');

const VMolecule = (mmolecule) => {

    mmolecule.length.should.be.equal(2) // molecule, units
    mmolecule[0].length.should.be.equal(2) // pKa, atoms


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

    const __addBranches = (bonds) => {
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
            branch =  branch + "(" + __SMILES_recursive("", current_atom, null, bond.atom_index) + ")"
        })

        return branch
    }

    const __SMILES_recursive = (carry, current_atom, previous_atom, index, outer) => {

        if (current_atom === undefined) {
            return carry
        }

        current_atom[0].should.be.an.String()

        if (current_atom[0]==='H') {
            return __SMILES_recursive(carry, mmolecule[0][1][index+1], current_atom, index+1)
        }


        if (typeof current_atom !== 'object') {
            console.log('Molecule.js Atom must be an object. Got ' + current_atom + ' instead')
            throw new Error("Atom is not an object")
        }
        current_atom.should.be.an.Array()

        const catom = CAtom(current_atom, index, mmolecule)
        const bonds = catom.indexedBonds('H').filter((bond)=> {
            return bond.atom_index > index
        })

        //console.log('bonds:')
        //console.log(current_atom[0])
        //console.log(bonds)
        if (bonds.length === 0) {
            carry = carry + __getAtomAsSMILE(catom, current_atom)
            //return __SMILES_recursive(carry, mmolecule[0][1][index+1], current_atom, index+1)
            return carry
        }


        // First non-hydrogen atom?
        if (carry === "") {

            // Get how many atoms are attached to the atom, but don't include hydrogens
            if (bonds.length < 2) {
                // COC
                //carry = carry + __getAtomAsSMILE(catom, current_atom)
                // C
                carry = carry + __getAtomAsSMILE(catom, current_atom)
                return __SMILES_recursive(carry, mmolecule[0][1][index+1], current_atom, index+1)

            } else {

                // First atom but has more than one atom attached to it eg C(C)O
                // Therefore we need start recursively branching
                carry = carry + __getAtomAsSMILE(catom, current_atom) + __addBranches(bonds)
            }

        } else {

            // COC
            // Get how many atoms are attached to the atom, but don't include hydrogens
            if (bonds.length < 2) {
                // O atom in COC bonds.length = 1 as we do not count the first C-O bond
                carry = carry + __getAtomAsSMILE(catom, current_atom)
                return __SMILES_recursive(carry, mmolecule[0][1][index+1], current_atom, index+1)
            } else {
                // First atom but has more than one atom attached to it eg C(C)O
                // Therefore we need start recursively branching
                carry = carry + __addBranches(bonds)
            }

        }

        return carry

        //return __SMILES_recursive(carry, mmolecule[0][1][index+1], current_atom, index+1)



        /*

        if (undefined === mmolecule_sans_hydrogens) {
            return carry
        }

        if (typeof current_atom !== 'object') {
            console.log('Molecule.js Atom must be an object. Got ' + current_atom + ' instead')
            throw new Error("Atom is not an object")
        }

        const catom = CAtom(current_atom, index, mmolecule)
        const proton_count = catom.numberOfProtons()
        const bond_count = catom.bondCount()
        const electron_count = catom.numberOfElectrons()

        // New branch?
        if (__newBranch(previous_atom, current_atom, index, mmolecule_sans_hydrogens)) {
            carry += "("
            branch_level++
        }

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
        
        // End of branch?
        if (branch_level > 0 && __endOfBranch(current_atom, index, mmolecule_sans_hydrogens)) {
            carry += ")"
            branch_level--
        }

        return  __SMILES_recursive(mmolecule_sans_hydrogens, carry, mmolecule_sans_hydrogens[index], mmolecule_sans_hydrogens[index+1], branch_level, index +1)

*/


    }

    return {

        canonicalSMILES: () => {

/*
            const mmolecule_sans_hydrogens = _.cloneDeep(mmolecule[0][1]).filter((atom)=>{
                return atom[0] !== 'H'
            })

            */

            // mmolecule_sans_hydrogens
            /*
[ [ 'Al',
    13,
    3,
    3,
    0,
    'app9gf1n4ekfuo74fe',
    'app9gf1n4ekfuo74ff',
    'app9gf1n4ekfuo74fg',
    'app9gf1n4ekfuo74fn',
    'app9gf1n4ekfuo74fu',
    'app9gf1n4ekfuo74g1' ],
  [ 'Cl',
    17,
    7,
    1,
    0,
    'app9gf1n4ekfuo74fh',
    'app9gf1n4ekfuo74fi',
    'app9gf1n4ekfuo74fj',
    'app9gf1n4ekfuo74fk',
    'app9gf1n4ekfuo74fl',
    'app9gf1n4ekfuo74fm',
    'app9gf1n4ekfuo74fn',
    'app9gf1n4ekfuo74fg' ],
  [ 'Cl',
    17,
    7,
    1,
    0,
    'app9gf1n4ekfuo74fo',
    'app9gf1n4ekfuo74fp',
    'app9gf1n4ekfuo74fq',
    'app9gf1n4ekfuo74fr',
    'app9gf1n4ekfuo74fs',
    'app9gf1n4ekfuo74ft',
    'app9gf1n4ekfuo74fu',
    'app9gf1n4ekfuo74ff' ],
  [ 'Cl',
    17,
    7,
    1,
    0,
    'app9gf1n4ekfuo74fv',
    'app9gf1n4ekfuo74fw',
    'app9gf1n4ekfuo74fx',
    'app9gf1n4ekfuo74fy',
    'app9gf1n4ekfuo74fz',
    'app9gf1n4ekfuo74g0',
    'app9gf1n4ekfuo74g1',
    'app9gf1n4ekfuo74fe' ] ]

             */
            // 'AlClfalseClfalseCl' -> should be [Al](Cl)(Cl)Cl


            // Convert molecule to CanonicalSmiles
            // @todo branches, rings
            /*
            const SMILES = _.cloneDeep(mmolecule_sans_hydrogens).reduce((carry, current_atom, index, arr)=> {

                if (typeof current_atom !== 'object') {
                    console.log('Molecule.js Atom must be an object. Got ' + current_atom + ' instead')
                    throw new Error("Atom is not an object")
                }

                const catom = CAtom(current_atom, index, mmolecule)
                const proton_count = catom.numberOfProtons()
                const bond_count = catom.bondCount()
                const electron_count = catom.numberOfElectrons()

                // Are we on a branch?
                if (index > 0) {
                    __newBranch(mmolecule_sans_hydrogens[index-1], current_atom, index, mmolecule_sans_hydrogens)
                }

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
                return carry
            }, "")
            */
           // SMILES =  __SMILES_recursive(mmolecule_sans_hydrogens, "", mmolecule_sans_hydrogens[0], null, 0, index)
            mmolecule[0][1][0].should.be.an.Array()
            mmolecule[0][1][0][0].should.be.an.String()
            SMILES =  __SMILES_recursive("", mmolecule[0][1][0], null, 0, true)

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

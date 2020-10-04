const CMolecule = require('../Controllers/Molecule')
const CAtom = require('../Controllers/Atom')
const _ = require('lodash');

const VMolecule = (mmolecule) => {

    mmolecule.length.should.be.equal(2) // molecule, units
    mmolecule[0].length.should.be.equal(2) // pKa, atoms


    const __addBrackets = (atomic_symbol) => {
        return atomic_symbol === "Al"
    }

    const __newBranch = (previous_atom, current_atom, index, mmolecule_sans_hydrogens) => {
        if (previous_atom === null) {
            return false
        }
        const previous_atom_electrons = _.cloneDeep(previous_atom.slice(5))
        const current_atom_electrons = _.cloneDeep(current_atom.slice(5))
        const catom_current = CAtom(current_atom, index, mmolecule)
        // @todo branches consisting of more than one atom)
        if (catom_current.bondCount() === 1 
            && Set.intersect(previous_atom_electrons,current_atom_electrons)===1) {
               return true)
        }
        return false
    }
    
    const __endOfBranch = (current_atom, index, mmolecule_sans_hydrogens) => {
        const catom_current = CAtom(current_atom, index, mmolecule)
        if (catom_current.bondCount() === 1) {
               return true)
        }
        return false
    }

    __SMILES_recursive = (mmolecule_sans_hydrogens, carry, current_atom, previous_atom, branch_level, index) => {

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


    }

    return {

        canonicalSMILES: () => {


            const mmolecule_sans_hydrogens = _.cloneDeep(mmolecule[0][1]).filter((atom)=>{
                return atom[0] !== 'H'
            })

            

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
            SMILES =  __SMILES_recursive(mmolecule_sans_hydrogens, "", mmolecule_sans_hydrogens[0], null, 0, index)



            return SMILES
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

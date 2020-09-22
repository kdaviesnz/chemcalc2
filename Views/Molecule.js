const CMolecule = require('../Controllers/Molecule')
const CAtom = require('../Controllers/Atom')
const _ = require('lodash');

const VMolecule = (mmolecule) => {
    return {
        canonicalSMILES: (units) => {

            const mmolecule_sans_hydrogens = _.cloneDeep(mmolecule).slice(1).filter((atom)=>{
                return atom[0] !== 'H'
            })

            // Convert molecule to CanonicalSmiles
            // @todo branches, rings
            const SMILES = _.cloneDeep(mmolecule_sans_hydrogens).reduce((carry, current_atom, index, arr)=> {
                if (CAtom(current_atom, index, mmolecule).isPositivelyCharged()) {
                    carry = carry + "[" + current_atom[0] + "+]"
                } else if (CAtom(current_atom, index, mmolecule).isNegativelyCharged()) {
                    carry = carry + "[" + current_atom[0] + "-]"
                } else {
                    carry += current_atom[0] // eg "" + "C"
                }
                // Get the type of bond between the current atom and the next non - hydrogen atom
                const next_atom = mmolecule_sans_hydrogens[index + 1]
                if (next_atom) {
                   carry = carry + CMolecule(mmolecule_sans_hydrogens).bondType(current_atom, next_atom)
                }
                return carry
            }, "")

            return SMILES
        },
        'render' : (units) => {
            console.log('{' + mmolecule.reduce((working, current, i, arr)=>{
                if (i > 0) {
                    working += current[0] // atomic symbol
                }
                return working
            }, '') + ' X ' + units + '}')
        }
    }
}
module.exports = VMolecule
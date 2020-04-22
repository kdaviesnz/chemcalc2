const uniqid = require('uniqid')
const AtomFactory = require('./AtomFactory')
const CMolecule = require('../Controllers/Molecule')
const range = require("range");
// range.range(1,10,2)

const AtomsFactory = (canonicalSMILES) => {

    // https://www.npmjs.com/package/smiles
    const smiles = require('smiles')

    // parse a SMILES string, returns an array of SMILES tokens [{type: '...', value: '...'}, ...]
    const smiles_tokens = smiles.parse(canonicalSMILES.replace("H",""))

    /*
    HCl
    [ { type: 'AliphaticOrganic', value: 'Cl' } ]
     */

    //  Convert rows to atom objects
    const atoms_and_tokens = smiles_tokens.map(
        (row, i, arr) => {
            // row.value is the atomic symbol
            // If item is AliphaticOrganic add an atom.
            // If item is ring bond add electron to previous atom.
            // If item is bond add electron to previous atom and share same electron to current atom, then
            // share an electron from current atom to previous atom
            // If item is branch and item value is not "end" then add bond.
            return row.type === "AliphaticOrganic"?AtomFactory(row.value):
                (
                    row.type === "Ringbond"? arr[i-1].addRingBond(row.value, arr[i-1].branchId) : (
                        row.type === "Bond"? arr[i-1].addBond(row.value): (
                            row.type === "Branch"? (
                                row.value === "end"?arr[i-1].isTerminal(true):
                                    arr[i-1].startNewBranch() // add new branch id to current atom
                            ): row
                        )
                    )
                )
        }
    )

    // Add hydrogens
    const atoms_and_tokens_with_hydrogens = atoms_and_tokens.reduce(
        (carry, current, index, arr) => {
            if (typeof current.length === "number" && current[0]!=='H') { // we have an atom
                // Check how many bonds it currently has
                const valence_electrons = current.slice(4)
                // Check each valence electron to see if it is being shared
                const actual_number_of_bonds = CMolecule(atoms_and_tokens).bondCount(current)
                // current[3] is the number of electrons the atom has when it is neutrally charged
                const number_of_hydrogens_required = current[3] - actual_number_of_bonds
                if (number_of_hydrogens_required > 0) {
                    range.range(0, number_of_hydrogens_required,1).map(
                        (e_index) => {
                            const hydrogen = AtomFactory('H')
                            hydrogen.push(valence_electrons[e_index])
                            current.push(hydrogen[hydrogen.length-2])
                            carry.push(hydrogen)
                        }
                    )
                }
            }
            carry.push(current)
            return carry
        },
        []
    )
    //  atomic symbol, proton count, valence count, number of bonds, velectron1, velectron2, velectron3

    return atoms_and_tokens_with_hydrogens

}

module.exports = AtomsFactory










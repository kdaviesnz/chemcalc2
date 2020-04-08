const uniqid = require('uniqid')
const AtomFactory = require('AtomFactory')

const AtomsFactory = (canonicalSMILES) => {

    // https://www.npmjs.com/package/smiles
    const smiles = require('smiles')

    // parse a SMILES string, returns an array of SMILES tokens [{type: '...', value: '...'}, ...]
    const smiles_tokens = smiles.parse(canonicalSMILES)

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

    return [
       ...atoms_and_tokens
    ]


}

module.exports = AtomsFactory










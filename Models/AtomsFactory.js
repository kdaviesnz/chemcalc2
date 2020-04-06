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

        // ATOM MODEL
       // atomic symbol, proton count, max valence count*, max number of bonds, velectron1, velectron2, velectron3
// electrons are unique strings, v=valence
// * Maximum number of electrons in valence shell.


    ]


}

module.exports = AtomsFactory










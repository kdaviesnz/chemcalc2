const uniqid = require('uniqid')
const AtomFactory = require('./AtomFactory')
const CMolecule = require('../Controllers/Molecule')
const range = require("range");
// range.range(1,10,2)

const AtomsFactory = (canonicalSMILES) => {

    // https://www.npmjs.com/package/smiles
    const smiles = require('smiles')

    const prevAtomIndexByBranch = (atoms_with_tokens_no_brackets,index,depth) => {
        
         // @todo depth only works for depth 1
        if (undefined === atoms_with_tokens_no_brackets[index].type && depth === 0) {
            
            
            return index
        }
           /*
    [ [ 'Al',13,3,5,'2iwcg3xsk9wb0ng8','2iwcg3xsk9wb0ng9','2iwcg3xsk9wb0nga' ],
      { type: 'Branch', value: 'begin' },
      [ 'Cl',17,7,1,'2iwcg3xsk9wb0ngb','2iwcg3xsk9wb0ngc','2iwcg3xsk9wb0ngd','2iwcg3xsk9wb0nge','2iwcg3xsk9wb0ngf','2iwcg3xsk9wb0ngg','2iwcg3xsk9wb0ngh' ],
     { type: 'Branch', value: 'end' },
     { type: 'Branch', value: 'begin' },
     [ 'Cl',17,7,1,'2iwcg3xsk9wb0ngi','2iwcg3xsk9wb0ngj','2iwcg3xsk9wb0ngk','2iwcg3xsk9wb0ngl','2iwcg3xsk9wb0ngm','2iwcg3xsk9wb0ngn','2iwcg3xsk9wb0ngo' ],
     { type: 'Branch', value: 'end' },
      [ 'Cl',17,7,1,'2iwcg3xsk9wb0ngp','2iwcg3xsk9wb0ngq','2iwcg3xsk9wb0ngr','2iwcg3xsk9wb0ngs','2iwcg3xsk9wb0ngt','2iwcg3xsk9wb0ngu','2iwcg3xsk9wb0ngv' ] ]
     */
        if (atoms_with_tokens_no_brackets[index].type === "Branch" 
           && atoms_with_tokens_no_brackets[index].value === "end") {
            // @todo depth only works for depth 1
            return prevAtomIndexByBranch(atoms_with_tokens_no_brackets,index--,depth--)
        }
        
        return prevAtomIndexByBranch(atoms_with_tokens_no_brackets,index--,depth)
    }
    
    const prevAtomIndexByAtomicSymbol = (atomic_symbol, current_atoms, index) => {
        if (current_atoms[index][0] === atomic_symbol) {
            return index
        } else {
            return prevAtomIndexByAtomicSymbol(atomic_symbol, current_atoms, index -1)
        }
    }
    const prevAtomIndex = (smiles_tokens, current_atoms, index) => {
        if (smiles_tokens[index].type === "AliphaticOrganic" || smiles_tokens[index].type === "ElementSymbol") {
            const atomic_symbol = smiles_tokens[index].value
            // Find the index of last atom in current atoms with atomic symbol matching atomic_symbol
            return prevAtomIndexByAtomicSymbol(atomic_symbol, current_atoms, current_atoms.length-1)
        } else {
            return prevAtomIndex(smiles_tokens, current_atoms,  index -1)
        }
    }

    // parse a SMILES string, returns an array of SMILES tokens [{type: '...', value: '...'}, ...]
    const smiles_tokens = smiles.parse(canonicalSMILES.replace("H",""))

    if (canonicalSMILES === "[Al](Cl)(Cl)Cl") {
        /*
        [Al](Cl)(Cl)Cl
[ { type: 'BracketAtom', value: 'begin' },
  { type: 'ElementSymbol', value: 'Al' },
  { type: 'BracketAtom', value: 'end' },
  { type: 'Branch', value: 'begin' },
  { type: 'AliphaticOrganic', value: 'Cl' },
  { type: 'Branch', value: 'end' },
  { type: 'Branch', value: 'begin' },
  { type: 'AliphaticOrganic', value: 'Cl' },
  { type: 'Branch', value: 'end' },
  { type: 'AliphaticOrganic', value: 'Cl' } ]
         */
       // console.log(smiles_tokens)
    }

    const atoms_with_tokens = smiles_tokens.map(
        (row) => {
            if (row.type === "AliphaticOrganic" || row.type === "ElementSymbol") {
                return AtomFactory(row.value)
            }
            return row
        }
    )


     // Filter out brackets
    const atoms_with_tokens_no_brackets = atoms_with_tokens.filter(
        (row) => {
            if (undefined !== row.type && row.type === "BracketAtom") {
                return false
            }
            return true
        }
    )

   // console.log(atoms_with_tokens_no_brackets)
    /*
    [ [ 'Al',13,3,5,'2iwcg3xsk9wb0ng8','2iwcg3xsk9wb0ng9','2iwcg3xsk9wb0nga' ],
      { type: 'Branch', value: 'begin' },
      [ 'Cl',17,7,1,'2iwcg3xsk9wb0ngb','2iwcg3xsk9wb0ngc','2iwcg3xsk9wb0ngd','2iwcg3xsk9wb0nge','2iwcg3xsk9wb0ngf','2iwcg3xsk9wb0ngg','2iwcg3xsk9wb0ngh' ],
     { type: 'Branch', value: 'end' },
     { type: 'Branch', value: 'begin' },
     [ 'Cl',17,7,1,'2iwcg3xsk9wb0ngi','2iwcg3xsk9wb0ngj','2iwcg3xsk9wb0ngk','2iwcg3xsk9wb0ngl','2iwcg3xsk9wb0ngm','2iwcg3xsk9wb0ngn','2iwcg3xsk9wb0ngo' ],
     { type: 'Branch', value: 'end' },
      [ 'Cl',17,7,1,'2iwcg3xsk9wb0ngp','2iwcg3xsk9wb0ngq','2iwcg3xsk9wb0ngr','2iwcg3xsk9wb0ngs','2iwcg3xsk9wb0ngt','2iwcg3xsk9wb0ngu','2iwcg3xsk9wb0ngv' ] ]
     */

    // Add the bonds
    let depth = 0
    const atoms = atoms_with_tokens_no_brackets.map(
        (row, index) => {
            if (index === 0) {
                // first atom
                return row
            }
            
            if (undefined !== row.type && row.type === "Branch" && row.value === "begin") {
                depth++
                return null
            }
            
            if (undefined !== row.type && row.type === "Branch" && row.value === "end") {
                depth--
                return null
            }
            
            // Get index of previous atom om same branch
            const prev_atom_index = prevAtomIndexByBranch(atoms_with_tokens_no_brackets,index -1
                                                         ,depth)
            const e1 = getFreeElectron(atoms_with_tokens_no_brackets[prev_atom_index])
            const e2 = getFreeElectron(row)
            row.push(e1)
            atoms_with_tokens_no_brackets[prev_atom_index].push(e2)
        }
    )
    console.log(atoms)
    console.log("AtomsFactory.js 2")
    process.exit();

    //  Convert rows to atom objects
    const atoms_and_tokens = smiles_tokens.reduce(
        (carry, row, i, arr) => {

          //  console.log("carry")
            //console.log(carry)
            //process.exit()
            // row.value is the atomic symbol
            // If item is BracketAtom ignore
            // If item is AliphaticOrganic add an atom.
            // If item is ring bond add electron to previous atom.
            // If item is bond add electron to previous atom and share same electron to current atom, then
            // share an electron from current atom to previous atom
            // If item is branch and item value is not "end" then add bond.

            if (row.type === "BracketAtom") {
                return carry
            }

            if (row.type === "AliphaticOrganic" || row.type === "ElementSymbol") {
                carry.push(AtomFactory(row.value))
                return carry
            } else if (row.type === "Ringbond") {
                //const prev_atom = arr[i-1].type === "BracketAtom"?arr[i-2]:arr[i-1]
                //carry.push(prev_atom.addRingBond(row.value, prev_atom.branchId))
                return carry
            } else if(row.type === "Branch" && row.value !== "end") {
                const prev_atom_index = prevAtomIndex(arr, carry, i)
                const electron = uniqid()
                carry[prev_atom_index].push(electron)
                console.log(carry[prev_atom_index])
                console.log("AtomsFactory.js 1")
                process.exit()
               // carry.push(carry[prev_atom_index])
                return carry
            } else {
                return carry
            }
        },
        []
    )

    if (canonicalSMILES === "[Al](Cl)(Cl)Cl") {

        console.log(atoms_and_tokens)
        console.log("AtomsFactory")
        process.exit()
    }

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










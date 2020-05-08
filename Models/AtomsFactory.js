const uniqid = require('uniqid')
const AtomFactory = require('./AtomFactory')
const CMolecule = require('../Controllers/Molecule')
const range = require("range");
// range.range(1,10,2)
const Set = require('./Set')

const AtomsFactory = (canonicalSMILES) => {

    // https://www.npmjs.com/package/smiles
    const smiles = require('smiles')
    
    const getFreeElectron = (atoms_with_tokens_no_brackets, atom, prev_atom_index ) => {
         const electrons = atom.slice(4).filter(
             (electron) => {
                 return atoms_with_tokens_no_brackets.filter(
                     (_atom, i ) => {
                         if ( undefined !== _atom.type) {
                             return false
                         }
                         return i === prev_atom_index || _atom.indexOf(electron) === -1
                     }
                 ).length > 0
             }
         )

        if (electrons.length === 0) {
            console.log(atoms_with_tokens_no_brackets)
            console.log(atom)
            console.log(prev_atom_index) // 0
            console.log("AtomsFactory.js Critical error: Electrons are empty")
            process.exit()
        }

         return electrons.pop()
    }

    const prevAtomIndexByBranch = (atoms_with_tokens_no_brackets,index,depth) => {
        
         // @todo depth only works for depth 1
        //console.log(atoms_with_tokens_no_brackets[index]) // { type: 'Branch', value: 'begin' }
        //console.log(index) //1
        if (undefined === atoms_with_tokens_no_brackets[index]) {
            return 0
        }

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
           && atoms_with_tokens_no_brackets[index].value === "begin") {
            // @todo depth only works for depth 1
            return prevAtomIndexByBranch(atoms_with_tokens_no_brackets,--index,--depth)
        }
        return prevAtomIndexByBranch(atoms_with_tokens_no_brackets,--index,--depth)
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
            // [[Al],[branch begin]
            const prev_atom_index = prevAtomIndexByBranch(atoms_with_tokens_no_brackets,index -1,depth)
            const e1 = getFreeElectron(atoms_with_tokens_no_brackets.slice(0,index),atoms_with_tokens_no_brackets[prev_atom_index], prev_atom_index)

            if (undefined === e1) {
                console.log("Critical error: Electron is undefined (e1)")
                process.exit()
            }
            const e2 = getFreeElectron(atoms_with_tokens_no_brackets.slice(0,index), row)

            if (undefined === e2) {
                console.log("Critical error: Electron is undefined (e2)")
                process.exit()
            }

            row.push(e1)
            atoms_with_tokens_no_brackets[prev_atom_index].push(e2)

            return row
        }
    ).filter(
        (atom) => {
            return null !== atom
        }
    )

    if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
        atoms.length.should.be.equal(4)
        atoms[0][0].should.be.equal("Al")
        atoms[0].length.should.be.equal(10)
        const al_electrons = atoms[0].slice(4)
        al_electrons.length.should.be.equal(6)
        atoms[1][0].should.be.equal("Cl")
        atoms[1].length.should.be.equal(12)
        const cl1_electrons = atoms[1].slice(4)
        cl1_electrons.length.should.be.equal(8)
        Set().intersection(al_electrons, cl1_electrons).length.should.be.equal(2)
        atoms[2][0].should.be.equal("Cl")
        atoms[2].length.should.be.equal(12)
        const cl2_electrons = atoms[2].slice(4)
        cl2_electrons.length.should.be.equal(8)
        Set().intersection(al_electrons, cl2_electrons).length.should.be.equal(2)
        atoms[3][0].should.be.equal("Cl")
        atoms[3].length.should.be.equal(12)
        const cl3_electrons = atoms[3].slice(4)
        cl3_electrons.length.should.be.equal(8)
        Set().intersection(al_electrons, cl3_electrons).length.should.be.equal(2)
    }



    // Add hydrogens
    const atoms_with_hydrogens = atoms.reduce(
        (carry, current, index, arr) => {
            if (typeof current.length === "number" && current[0]!=='H') { // we have an atom
                // Check how many bonds it currently has
                const valence_electrons = current.slice(4)
                // Check each valence electron to see if it is being shared
                const actual_number_of_bonds = CMolecule(atoms).bondCount(current)
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


    if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
        atoms.length.should.be.equal(4)
    }

    if ("COC" === canonicalSMILES) {
        atoms_with_hydrogens.length.should.be.equal(9)
        // Get the electrons of the oxygen atom
        const oxygen_electons = atoms.filter(
            (atom) => {
                return atom[0] === "O"
            }
        ).pop().slice(4)
        // Get the electrons of first of the carbon atoms
        const carbon_electons = atoms.filter(
            (atom) => {
                return atom[0] === "C"
            }
        ).pop().slice(4)
        // Check if electrons are shared
        Set().intersection(oxygen_electons, carbon_electons).length.should.be.equal(2)
        // Get the electrons of second of the carbon atoms
        const carbon_electons_2 = atoms.filter(
            (atom) => {
                return atom[0] === "C"
            }
        )[1].slice(4)
        // Check if electrons are shared
        Set().intersection(oxygen_electons, carbon_electons_2).length.should.be.equal(2)

    }

    return atoms_with_hydrogens

}

module.exports = AtomsFactory










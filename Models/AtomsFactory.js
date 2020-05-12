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

    const prevAtomIndexByBranch = (atoms_with_tokens_no_brackets,index,depth, round_number) => {


        //console.log(round_number) //1
        //console.log(index) // 1
        //console.log(depth) //1
        //process.exit()
        if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {

            if (round_number === 1) {
                index.should.be.equal(1)
                depth.should.be.equal(1)
                atoms_with_tokens_no_brackets[index].type.should.be.equal("Branch")
                atoms_with_tokens_no_brackets[index].value.should.be.equal("begin")
            }

            if (round_number === 2) {
                index.should.be.equal(0)
                depth.should.be.equal(0)
                atoms_with_tokens_no_brackets[index][0].should.be.equal("Al")
                atoms_with_tokens_no_brackets[index].slice(4).length.should.be.equal(3)
            }

            if (round_number === 3) {
               depth.should.be.equal(1) //1
               index.should.be.equal(1) //1
               atoms_with_tokens_no_brackets[0][0].should.be.equal("Al") // Al, 3 electrons
               atoms_with_tokens_no_brackets[0].slice(4).length.should.be.equal(3) // Al, 3 electrons                                        
               atoms_with_tokens_no_brackets[1].type === 'Branch'
               atoms_with_tokens_no_brackets[1].value === 'begin'
                   
            }

            if (round_number === 4) {
                 
                 depth.should.be.equal(0) 
                 index.should.be.equal(0) 
                 
                  atoms_with_tokens_no_brackets[0][0].should.be.equal("Al") 
                  atoms_with_tokens_no_brackets[0].slice(4).length.should.be.equal(3)                                        
                  atoms_with_tokens_no_brackets[1].type === 'Branch'
                  atoms_with_tokens_no_brackets[1].value === 'begin'
                
                  atoms_with_tokens_no_brackets[2][0].should.be.equal("Cl") 
                  atoms_with_tokens_no_brackets[2].slice(4).length.should.be.equal(7) 
                
                  console.log(atoms_with_tokens_no_brackets[2]) //Cl, 7 electrons
                  process.exit()
            }
            
            
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



        // index
        // 1 -> begin -> 0 -> Al
        // 4 begin  -> 3 (d0) -> end 2 (d1) -> begin 1 (d1) -> 0 (d0)
        
        /*
        index    depth     row  
        4        1        { type: 'Branch', value: 'begin' },
        3        0         { type: 'Branch', value: 'end' },
        2        1         [ 'Cl',17,7,1,'2iwcg3xsk9wb0ngb','2iwcg3xsk9wb0ng...],
        1        1        { type: 'Branch', value: 'begin' },
        0        0        [ 'Al',13,3,5,'2iwcg3xsk9wb0ng8','2iwcg3xsk9wb0ng9','2iwcg3xsk9wb0nga' ],
        */
        
         // @todo depth only works for depth 1
        //console.log(atoms_with_tokens_no_brackets[index]) // { type: 'Branch', value: 'begin' }
        //console.log(index) //1
        if (undefined === atoms_with_tokens_no_brackets[index]) {
            return 0
        }

        if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
            if (round_number === 2) {
                if (undefined !==  atoms_with_tokens_no_brackets[index].type) {
                    console.log("atoms_with_tokens_no_brackets[index].type should be undefined")
                    process.exit()
                }
            }
        }

        if (undefined === atoms_with_tokens_no_brackets[index].type && depth === 0) {
            if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                if (round_number===4) {
                    // index and depth are 0
                    process.exit()
                }
                round_number.should.be.oneOf([2, 4])
            }
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
            return prevAtomIndexByBranch(atoms_with_tokens_no_brackets,--index,--depth, round_number+1)
        }
        
        if (atoms_with_tokens_no_brackets[index].type === "Branch" 
           && atoms_with_tokens_no_brackets[index].value === "end") {
            // @todo depth only works for depth 1
            return prevAtomIndexByBranch(atoms_with_tokens_no_brackets,--index, ++depth, round_number+1)
        }
        
        return prevAtomIndexByBranch(atoms_with_tokens_no_brackets,--index,depth, round_number+1)
        
        
        
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

    // tracker
    // last row is current parent with available valence electrons
    const tracker = [
      [0, ...atoms_with_tokens_no_brackets[0].slice(4)]
    ]
    const atoms = atoms_with_tokens_no_brackets.map(
        (row, index, processed_atoms) => {

            if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                switch (index) {
                    case 0:
                        tracker.length.should.be.equal(1)
                        tracker[0].length.should.be.equal(4)
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(0) // ok
                        break;
                    case 1:
                        tracker.length.should.be.equal(1)
                        tracker[0].length.should.be.equal(4)
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok

                        break;
                    case 2:
                        tracker.length.should.be.equal(2)
                        tracker[0].length.should.be.equal(4)
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok
                        break;
                    case 3:
                        tracker.length.should.be.equal(2)
                        processed_atoms[0].slice(4).length.should.be.equal(4)
                        processed_atoms[2].slice(4).length.should.be.equal(8)
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok
                        break;
                    case 4:
                        tracker.length.should.be.equal(1)
                        processed_atoms[0].slice(4).length.should.be.equal(4)
                        processed_atoms[2].slice(4).length.should.be.equal(8)
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok
                        break;
                    case 5: // Second Chlorine atom
                        tracker.length.should.be.equal(2)
                        processed_atoms[0].slice(4).length.should.be.equal(4)
                        processed_atoms[2].slice(4).length.should.be.equal(8)
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok
                        break;
                    case 6: // { type: 'Branch', value: 'end' }
                        tracker.length.should.be.equal(2)
                        processed_atoms[0].slice(4).length.should.be.equal(5)
                        processed_atoms[2].slice(4).length.should.be.equal(8)
                        processed_atoms[5].slice(4).length.should.be.equal(8)
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // not ok
                        break;
                    case 7: // Last chlorine atom
                        tracker.length.should.be.equal(1)
                        processed_atoms[0].slice(4).length.should.be.equal(5)
                        processed_atoms[2].slice(4).length.should.be.equal(8)
                        processed_atoms[5].slice(4).length.should.be.equal(8)
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // not ok
                        break;

                }
            }

            if (index === 0) {

                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                    atoms_with_tokens_no_brackets[index][0].should.be.equal("Al")
                }
                // first atom
                return row
            }

            // An atom
            if (undefined === row.type ) {
                
                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                    index.should.be.oneOf([2, 5, 7])
                }
                              
                const tracker_index = tracker[tracker.length-1][0]
                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES && index ===5) {
                    tracker_index.should.be.equal(0);
                }

                // Share electrons
                const current_atom_electron = row[row.length-1]
                current_atom_electron.should.be.a.String()
                
                // Add electron to current atom
                const parent_electron = tracker[tracker_index].pop()
                parent_electron.should.be.a.String()
                row.push(parent_electron)
                
                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                    if (index === 2) {
                        tracker[tracker.length-1][0].should.be.equal(0)
                    }
                }

                // Add electron to parent atom
                atoms_with_tokens_no_brackets[tracker_index].push(current_atom_electron)

                return row

            }

            
            if (undefined !== row.type && row.type === "Branch" && row.value === "begin") {

                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                    index.should.be.oneOf([1, 4])
                    if (index===1) {
                        atoms_with_tokens_no_brackets[index -1][0].should.be.equal('Al')
                    }
                }

                // Change tracker to show new parent atom
                const tracker_index = 0 // to do - should be index of previous atom on same branch

                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES && index === 4) {
                    tracker_index.should.be.equal(0)
                }

                tracker.push([ tracker_index, ...atoms_with_tokens_no_brackets[tracker_index].slice(4)])

                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES && index === 1) {
                    tracker.length.should.be.equal(2)
                    tracker[1][0].should.be.equal(0)
                    tracker[1].length.should.be.equal(4)
                }

                // Change row to null as it's not an atom row
                return null
            }
            
            if (undefined !== row.type && row.type === "Branch" && row.value === "end") {

                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                    index.should.be.oneOf([3,6])
                }

                // Change tracker to show previous parent atom
                tracker.pop()

                // Change row to null as it's not an atom row
                return null
            }
            
        }
    ).filter(
        (atom) => {
            return null !== atom
        }
    )



    if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {

        console.log(atoms)

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
        atoms_with_hydrogens.length.should.be.equal(4)
        /*
        [ [ 'Al',13, 3,3,'2iwcgt9oka1zdp2w','2iwcgt9oka1zdp2x','2iwcgt9oka1zdp2y','2iwcgt9oka1zdp35','2iwcgt9oka1zdp3c','2iwcgt9oka1zdp3j' ],
          [ 'Cl',17,7,1,'2iwcgt9oka1zdp2z','2iwcgt9oka1zdp30', '2iwcgt9oka1zdp31','2iwcgt9oka1zdp32','2iwcgt9oka1zdp33','2iwcgt9oka1zdp34','2iwcgt9oka1zdp35','2iwcgt9oka1zdp2y' ],
          [ 'Cl',17,7,1,'2iwcgt9oka1zdp36','2iwcgt9oka1zdp37','2iwcgt9oka1zdp38','2iwcgt9oka1zdp39','2iwcgt9oka1zdp3a','2iwcgt9oka1zdp3b','2iwcgt9oka1zdp3c','2iwcgt9oka1zdp35' ],
          [ 'Cl',17,7,1,'2iwcgt9oka1zdp3d','2iwcgt9oka1zdp3e','2iwcgt9oka1zdp3f','2iwcgt9oka1zdp3g','2iwcgt9oka1zdp3h','2iwcgt9oka1zdp3i','2iwcgt9oka1zdp3j','2iwcgt9oka1zdp3c' ] ]
         */
        console.log("-----------------------")
        console.log(atoms_with_hydrogens[1].slice(4))
        console.log(atoms_with_hydrogens[0].slice(4))
        console.log(Set().intersection(atoms_with_hydrogens[1].slice(1), atoms_with_hydrogens[0].slice(1)))
        console.log(atoms_with_hydrogens[1].slice(4))
        console.log(atoms_with_hydrogens[2].slice(4))
        console.log(Set().intersection(atoms_with_hydrogens[1].slice(4), atoms_with_hydrogens[2].slice(4)))

        console.log("-----------------------")
       // process.exit()
        Set().intersection(atoms_with_hydrogens[1].slice(4), atoms_with_hydrogens[0].slice(4)).length.should.be.equal(2)
        Set().intersection(atoms_with_hydrogens[1].slice(4), atoms_with_hydrogens[2].slice(4)).length.should.be.equal(0) // 4 but should be 0
        Set().intersection(atoms_with_hydrogens[1].slice(4), atoms_with_hydrogens[3].slice(4)).length.should.be.equal(0)
        Set().intersection(atoms_with_hydrogens[3].slice(4), atoms_with_hydrogens[2].slice(4)).length.should.be.equal(0)
        Set().intersection(atoms_with_hydrogens[2].slice(4), atoms_with_hydrogens[0].slice(4)).length.should.be.equal(1)
        Set().intersection(atoms_with_hydrogens[3].slice(4), atoms_with_hydrogens[0].slice(4)).length.should.be.equal(1)
        /*
  [ 'Al',13,3,3,'2iwcg1p9ek9z2dl8r','2iwcg1p9ek9z2dl8s','!2iwcg1p9ek9z2dl8t!','*2iwcg1p9ek9z2dl90*','2iwcg1p9ek9z2dl97','2iwcg1p9ek9z2dl9e' ],
   [ 'Cl',17,7,1,'2iwcg1p9ek9z2dl8u','2iwcg1p9ek9z2dl8v','2iwcg1p9ek9z2dl8w','2iwcg1p9ek9z2dl8x','2iwcg1p9ek9z2dl8y','2iwcg1p9ek9z2dl8z','*2iwcg1p9ek9z2dl90*','!2iwcg1p9ek9z2dl8t!'],
  [ 'Cl',17,7,1,'2iwcg1p9ek9z2dl91','2iwcg1p9ek9z2dl92','2iwcg1p9ek9z2dl93','2iwcg1p9ek9z2dl94','2iwcg1p9ek9z2dl95','2iwcg1p9ek9z2dl96','2iwcg1p9ek9z2dl97','*2iwcg1p9ek9z2dl90*' ],
  [ 'Cl',17,7,1,'2iwcg1p9ek9z2dl98','2iwcg1p9ek9z2dl99','2iwcg1p9ek9z2dl9a','2iwcg1p9ek9z2dl9b','2iwcg1p9ek9z2dl9c','2iwcg1p9ek9z2dl9d','2iwcg1p9ek9z2dl9e','2iwcg1p9ek9z2dl97' ]
             */
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










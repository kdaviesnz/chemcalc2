const uniqid = require('uniqid')
const AtomFactory = require('./AtomFactory')
const CAtom = require('../Controllers/Atom')
const CMolecule = require('../Controllers/Molecule')
const range = require("range");
// range.range(1,10,2)
const Set = require('./Set')

const AtomsFactory = (canonicalSMILES) => {

    // https://www.npmjs.com/package/smiles
    const smiles = require('smiles')


    const getFreeElectron = (used_electrons, atom, atom_index ) => {
         const electrons = atom.slice(4).filter(
             (electron) => {
                 return used_electrons.indexOf(electron) === -1
             }
         )

         return electrons.pop()
    }

    // parse a SMILES string, returns an array of SMILES tokens [{type: '...', value: '...'}, ...]
    const smiles_tokens = smiles.parse(canonicalSMILES.replace("H",""))

    if (canonicalSMILES === "CC=CC") {
        /*
        [ { type: 'AliphaticOrganic', value: 'C' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'Bond', value: '=' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'AliphaticOrganic', value: 'C' } ]
         */
    }

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


    if (canonicalSMILES === "CC=CC") {
        console.log(atoms_with_tokens_no_brackets)
        process.exit()
        /*
[ [ 'C',
    6,
    4,
    4,
    '71l417okadoo9mk',
    '71l417okadoo9ml',
    '71l417okadoo9mm',
    '71l417okadoo9mn' ],
  [ 'C',
    6,
    4,
    4,
    '71l417okadoo9mo',
    '71l417okadoo9mp',
    '71l417okadoo9mq',
    '71l417okadoo9mr' ],
  { type: 'Bond', value: '=' },
  [ 'C',
    6,
    4,
    4,
    '71l417okadoo9ms',
    '71l417okadoo9mt',
    '71l417okadoo9mu',
    '71l417okadoo9mv' ],
  [ 'C',
    6,
    4,
    4,
    '71l417okadoo9mw',
    '71l417okadoo9mx',
    '71l417okadoo9my',
    '71l417okadoo9mz' ] ]
         */
    }

    // Add the bonds and branches
    let branch_number = 0

    // tracker
    // last row is current parent with available valence electrons
    const tracker = []
    const used_electrons = []
    const branch_tracker = {}
    let is_new_branch = false

    if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
        Set().intersection(atoms_with_tokens_no_brackets[2].slice(4), atoms_with_tokens_no_brackets[5].slice(4)).length.should.be.equal(0)    }


    const atoms = atoms_with_tokens_no_brackets.map(
        (row, index, processed_atoms) => {

            let res = null
                  
            if (index === 0) {
                
                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                    processed_atoms[index][0].should.be.equal("Al")
                }    
                
                if ("COC" === canonicalSMILES) {
                    processed_atoms[index][0].should.be.equal("C")
                }

                if ("CC=CC" === canonicalSMILES) {
                    processed_atoms[index][0].should.be.equal("C")
                }
                
                if (undefined === branch_tracker[0]) {
                    branch_tracker[0] = []
                }

                branch_tracker[0].push([0, row[0]])
                
                // first atom, no branches
                res = row
                
            } else if (undefined === row.type ) {
                
                const bond_type = processed_atoms[index -1].type === "Bond" 
                    && processed_atoms[index -1].value === "="? "=":""
                
                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                    index.should.be.oneOf([2, 5, 7])
                }
                        
                if ("CC=CC" === canonicalSMILES) {
                    index.should.be.oneOf([1, 3, 4])
                }
                
                const tracker_index = tracker.length ===0 ? 0: tracker[tracker.length-1][0]
                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES && index ===5) {
                    tracker_index.should.be.equal(0);
                }

                // Share electrons
                const current_atom_electrons_to_share = []
                current_atom_electrons_to_share.push(getFreeElectron(used_electrons, row, index )) // row[row.length-1]
                used_electrons.push(current_atom_electrons_to_share[0]
                                    
                if ( bond_type === =" ) {                  
                     current_atom_electrons_to_share.push(getFreeElectron(used_electrons, row, index ))   
                     used_electrons.push(current_atom_electrons_to_share[1])  
                }
              
            
                current_atom_electrons_to_share[0].should.be.a.String()
                current_atom_electrons_to_share[1].should.be.a.String()
                
                // Add electron to current atom
                let parent_atom_index = null
                if (index === 0) {
                    parent_atom_index = 0
                } else {
                    if (is_new_branch) {
                         parent_atom_index = branch_tracker[branch_number -1][branch_tracker[branch_number - 1].length -1][0]
 
                    } else {
                         parent_atom_index = branch_tracker[branch_number][branch_tracker[branch_number].length -1][0]
   
                    }
                }
                // const parent_atom_index = branch_tracker[branch_number][branch_tracker[branch_number].length][0]
               
               if ("COC" === canonicalSMILES) {
                   switch (index) {
                       case 1:
                           parent_atom_index.should.be.equal(0)
                           break
                       case 2:
                           parent_atom_index.should.be.equal(1)
                           break
                       
                   }                
                }
                
                if ("CC=CC" === canonicalSMILES) {
                   // index.should.be.oneOf([1, 3, 4])
                    switch (index) {
                       case 1:
                           parent_atom_index.should.be.equal(0)
                           break
                       case 3:
                           parent_atom_index.should.be.equal(1)
                           break
                       case 4:
                           parent_atom_index.should.be.equal(3)
                           break     
                       
                   }      
                    
                }
                
                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                   switch (index) {
                       case 2:
                           is_new_branch.should.be.equal(true)
                           branch_number.should.be.equal(1)
                           parent_atom_index.should.be.equal(0)
                           break
                       case 5:
                           is_new_branch.should.be.equal(true)
                           branch_number.should.be.equal(1)
                           parent_atom_index.should.be.equal(0)
                           break
                       case 7:
                           is_new_branch.should.be.equal(false)
                           branch_number.should.be.equal(0)
                           parent_atom_index.should.be.equal(0)
                           break    
                   }
               }
                
                let parent_electrons_to_share = null
                parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index ))
                used_electrons.push(parent_electrons_to_share[0])
                if ( bond_type === "=" ) {                  
                     parent_electrons_to_share.push(getFreeElectron(used_electrons, row, index ))   
                     used_electrons.push(parent_electrons_to_share[1])  
                }
            
                parent_electrons_to_share[0].should.be.a.String()
                processed_atoms[parent_atom_index].indexOf(parent_electrons_to_share[0]).should.not.be.equal(-1)
               
                row.push(parent_electrons_to_share[0])
                if ( bond_type === "=" ) {                  
                     row.push(parent_electrons_to_share[1])
                }
   
   
                // Add electron(s) to parent atom
                processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[0])
                if ( bond_type === "=" ) {                  
                     row.push(parent_electrons_to_share[1])
                }

                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                    switch (index) {
                        case 2: // first chlorine
                            branch_number.should.be.equal(1)
                            tracker[tracker.length-1][0].should.be.equal(0)
                            parent_atom_index.should.be.equal(0)
                            processed_atoms[parent_atom_index].slice(4).length.should.be.equal(4) // Al
                            processed_atoms[2].slice(4).length.should.be.equal(8) // first chlorine
                            processed_atoms[5].slice(4).length.should.be.equal(7) // second chlorine
                            processed_atoms[7].slice(4).length.should.be.equal(7) // third chlorine
                            break
                        case 5: // second chlorine
                            branch_number.should.be.equal(1)
                            tracker[tracker.length-1][0].should.be.equal(0)
                            parent_atom_index.should.be.equal(0) // fail
                            processed_atoms[parent_atom_index].slice(4).length.should.be.equal(5) // Al
                            processed_atoms[2].slice(4).length.should.be.equal(8) // first chlorine
                            processed_atoms[5].slice(4).length.should.be.equal(8) // second chlorine
                            processed_atoms[7].slice(4).length.should.be.equal(7) // third chlorine
                            break
                        case 7: // third chlorine
                            branch_number.should.be.equal(0)
                            parent_atom_index.should.be.equal(0)
                            processed_atoms[parent_atom_index].slice(4).length.should.be.equal(6) // Al
                            processed_atoms[2].slice(4).length.should.be.equal(8) // first chlorine
                            processed_atoms[5].slice(4).length.should.be.equal(8) // second chlorine
                            processed_atoms[7].slice(4).length.should.be.equal(8) // third chlorine
                            break
                    }
                }


                used_electrons.push(current_atom_electron)

                if (undefined === branch_tracker[branch_number]) {
                    branch_tracker[branch_number] = []
                }
                branch_tracker[branch_number].push([index, row[0]])

                is_new_branch = false

                if ("COC" === canonicalSMILES) {
                    switch (index) {
                        case 1:
                            is_new_branch.should.be.equal(false)
                            parent_atom_index.should.be.equal(0)
                            Set().intersection(processed_atoms[0].slice(4), processed_atoms[1].slice(4)).length.should.be.equal(2)
                            break
                        case 2:
                            is_new_branch.should.be.equal(false)
                            parent_atom_index.should.be.equal(1)
                            Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(2)
                            break
                    }
                }

                res = row // is an atom
                
            } else if (row.type === 'Bond') {
        
                 res = row
                //   { type: 'Bond', value: '=' },
                /*
                switch (row.value) {
                    case '=':
                        
                        break
                }
                */
               //   { type: 'Bond', value: '=' },
            } else if (undefined !== row.type && row.type === "Branch" && row.value === "begin") {

                is_new_branch.should.be.equal(false)

                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                    index.should.be.oneOf([1, 4])
                    if (index===1) {
                        processed_atoms[index -1][0].should.be.equal('Al')
                    }
                }

                // Change tracker to show new parent atom
                const tracker_index = 0 // @todo - should be index of previous atom on same branch

                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES && index === 4) {
                    tracker_index.should.be.equal(0)
                }

                tracker.push([ tracker_index, ...atoms_with_tokens_no_brackets[tracker_index].slice(4)])

                branch_number++
                
                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                    switch (index) {
                       case 1:     
                            tracker.length.should.be.equal(1)
                            tracker[0][0].should.be.equal(0)
                            tracker[0].length.should.be.equal(4)
                            branch_number.should.be.equal(1)
                            break
                       case 4:
                           branch_number.should.be.equal(1)
                           break
                   }
                }

                is_new_branch = true

                // Change row to null as it's not an atom row
                res = null
                
            } else if (undefined !== row.type && row.type === "Branch" && row.value === "end") {

                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                    index.should.be.oneOf([3,6])
                }

                // Change tracker to show previous parent atom
                tracker.pop()
                
                branch_number--
                
                if ("[Al](Cl)(Cl)Cl" === canonicalSMILES && index === 1) {
                    switch (index) {
                       case 3:
                            branch_number.should.be.equal(0)
                            break
                       case 6:
                           branch_number.should.be.equal(0)
                           break
                   }
                }

                is_new_branch = false

                // Change row to null as it's not an atom row
                res = null
            }
            
            if ("COC" === canonicalSMILES) {
                switch (index) {
                    case 0: // [C]
                        processed_atoms[0].slice(4).length.should.be.equal(4)
                        processed_atoms[1].slice(4).length.should.be.equal(6)
                        processed_atoms[2].slice(4).length.should.be.equal(4)
                        Set().intersection(processed_atoms[0].slice(4), processed_atoms[1].slice(4)).length.should.be.equal(0)
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(0)
                        break;
                    case 1: // [O]
                        processed_atoms[0].slice(4).length.should.be.equal(5)
                        processed_atoms[1].slice(4).length.should.be.equal(7)
                        processed_atoms[2].slice(4).length.should.be.equal(4)
                        Set().intersection(processed_atoms[0].slice(4), processed_atoms[1].slice(4)).length.should.be.equal(2)
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(0)
                        break;
                    case 2: // [C]
                        processed_atoms[0].slice(4).length.should.be.equal(5)
                        processed_atoms[1].slice(4).length.should.be.equal(8)
                        processed_atoms[2].slice(4).length.should.be.equal(5)
                        Set().intersection(processed_atoms[0].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(0)
                        Set().intersection(processed_atoms[0].slice(4), processed_atoms[1].slice(4)).length.should.be.equal(2)
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(2)
                        break;
                }
            }
            
            if ("[Al](Cl)(Cl)Cl" === canonicalSMILES) {
                switch (index) {
                    case 0: // [ 'Al',13,3,5,'2iwcg3xsk9wb0ng8','2iwcg3xsk9wb0ng9','2iwcg3xsk9wb0nga' ]
                        tracker.length.should.be.equal(0)
                        // Check aluminum atom has 3 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(3)
                        // Check chlorine atoms have 7 electrons each
                        processed_atoms[2].slice(4).length.should.be.equal(7)
                        processed_atoms[5].slice(4).length.should.be.equal(7)
                        processed_atoms[7].slice(4).length.should.be.equal(7)
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok
                        break;
                    case 1: // { type: 'Branch', value: 'begin' },
                        tracker.length.should.be.equal(1)
                        // Check aluminum atom now has 3 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(3)
                        // Check chlorine atoms have 7 electrons each
                        processed_atoms[2].slice(4).length.should.be.equal(7)
                        processed_atoms[5].slice(4).length.should.be.equal(7)
                        processed_atoms[7].slice(4).length.should.be.equal(7)
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok
                        break;
                    case 2: // [ 'Cl',17,7,1,'2iwcg3xsk9wb0ngb','2iwcg3xsk9wb0ngc','2iwcg3xsk9wb0ngd','2iwcg3xsk9wb0nge','2iwcg3xsk9wb0ngf','2iwcg3xsk9wb0ngg','2iwcg3xsk9wb0ngh' ],
                        tracker.length.should.be.equal(1)
                        tracker[0].length.should.be.equal(4)
                        tracker[0][0].should.be.equal(0)
                        // Check aluminum atom now has 4 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(4)
                        // Check first chlorine atom has 8 electrons and other chlorine atoms still have 7 electrons each
                        processed_atoms[2].slice(4).length.should.be.equal(8)
                        processed_atoms[5].slice(4).length.should.be.equal(7)
                        processed_atoms[7].slice(4).length.should.be.equal(7)
                        // Check first chlorine atom and aluminum atom share 2 electrons
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        // Check no electrons are shared between chlorine atoms
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[7].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[5].slice(4), processed_atoms[7].slice(4)).length.should.be.equal(0) // ok
                        break;
                    case 3: // { type: 'Branch', value: 'end' },
                        tracker.length.should.be.equal(0)
                        // Check aluminum atom  has 4 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(4)
                        // Check first chlorine atom has 8 electrons and other chlorine atoms still have 7 electrons each
                        processed_atoms[2].slice(4).length.should.be.equal(8)
                        processed_atoms[5].slice(4).length.should.be.equal(7)
                        processed_atoms[7].slice(4).length.should.be.equal(7)
                        // Check first chlorine atom and aluminum atom share 2 electrons
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        // Check no electrons are shared between chlorine atoms
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[7].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[5].slice(4), processed_atoms[7].slice(4)).length.should.be.equal(0) // ok
                        break;
                    case 4: // { type: 'Branch', value: 'begin' },
                        tracker.length.should.be.equal(1)
                        tracker[0].length.should.be.equal(5)
                        tracker[0][0].should.be.equal(0)
                        // Check aluminum atom  has 4 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(4)
                        // Check first chlorine atom has 8 electrons and other chlorine atoms still have 7 electrons each
                        processed_atoms[2].slice(4).length.should.be.equal(8)
                        processed_atoms[5].slice(4).length.should.be.equal(7)
                        processed_atoms[7].slice(4).length.should.be.equal(7)
                        // Check first chlorine atom and aluminum atom share 2 electrons
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        // Check no electrons are shared between chlorine atoms
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[7].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[5].slice(4), processed_atoms[7].slice(4)).length.should.be.equal(0) // ok
                        break;
                    case 5: // [ 'Cl',17,7,1,'2iwcg3xsk9wb0ngi','2iwcg3xsk9wb0ngj','2iwcg3xsk9wb0ngk','2iwcg3xsk9wb0ngl','2iwcg3xsk9wb0ngm','2iwcg3xsk9wb0ngn','2iwcg3xsk9wb0ngo' ],
                        tracker.length.should.be.equal(1)
                        // Check aluminum atom now has 5 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(5)
                        // Check first and second chlorine atoms have 8 electrons and other chlorine atom still has 7 electrons
                        processed_atoms[2].slice(4).length.should.be.equal(8)
                        processed_atoms[5].slice(4).length.should.be.equal(8)
                        processed_atoms[7].slice(4).length.should.be.equal(7)
                        // Check first chlorine atom and aluminum atom share 2 electrons
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        // Check second chlorine atom and aluminum atom share 2 electrons
                        Set().intersection(processed_atoms[5].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // fail
                        // Check last chlorine atom and aluminum atom share no electrons
                        Set().intersection(processed_atoms[7].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(0) // ok
                        // Check no electrons are shared between chlorine atoms
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[7].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[5].slice(4), processed_atoms[7].slice(4)).length.should.be.equal(0) // ok
                        break;
                    case 6: // { type: 'Branch', value: 'end' }
                        tracker.length.should.be.equal(0)
                        // Check aluminum atom still has 5 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(5)
                        // Check first and second chlorine atoms have 8 electrons and other chlorine atom still has 7 electrons
                        processed_atoms[2].slice(4).length.should.be.equal(8)
                        processed_atoms[5].slice(4).length.should.be.equal(8)
                        processed_atoms[7].slice(4).length.should.be.equal(7)
                        // Check first chlorine atom and aluminum atom share 2 electrons
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        // Check second chlorine atom and aluminum atom share 2 electrons
                        Set().intersection(processed_atoms[5].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        // Check last chlorine atom and aluminum atom share no electrons
                        Set().intersection(processed_atoms[7].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(0) // ok
                        // Check no electrons are shared between chlorine atoms
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[7].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[5].slice(4), processed_atoms[7].slice(4)).length.should.be.equal(0) // ok
                        break;
                    case 7: // [ 'Cl',17,7,1,'2iwcg3xsk9wb0ngp','2iwcg3xsk9wb0ngq','2iwcg3xsk9wb0ngr','2iwcg3xsk9wb0ngs','2iwcg3xsk9wb0ngt','2iwcg3xsk9wb0ngu','2iwcg3xsk9wb0ngv' ] ]
                        tracker.length.should.be.equal(0)
                        // Check aluminum atom now has 6 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(6)
                        // Check all chlorine atoms have 8 electrons
                        processed_atoms[2].slice(4).length.should.be.equal(8)
                        processed_atoms[5].slice(4).length.should.be.equal(8)
                        processed_atoms[7].slice(4).length.should.be.equal(8)
                        // Check first chlorine atom and aluminum atom share 2 electrons
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        // Check second chlorine atom and aluminum atom share 2 electrons
                        Set().intersection(processed_atoms[5].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        // Check last chlorine atom and aluminum atom now share 2 electrons
                        Set().intersection(processed_atoms[7].slice(4), processed_atoms[0].slice(4)).length.should.be.equal(2) // ok
                        // Check no electrons are shared between chlorine atoms
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[5].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[2].slice(4), processed_atoms[7].slice(4)).length.should.be.equal(0) // ok
                        Set().intersection(processed_atoms[5].slice(4), processed_atoms[7].slice(4)).length.should.be.equal(0) // ok
                        break;
                }
                
                

            }
            
            if ("CC=CC" === canonicalSMILES) {
                switch (index) {
                    case 0: // first carbon
                        tracker.length.should.be.equal(0)
                        // Check first carbon atom has 5 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(5)
                        // Check second carbon atom has 7 electrons
                        processed_atoms[1].slice(4).length.should.be.equal(7)
                        // Check third carbon atom has 7 electrons
                        processed_atoms[2].slice(4).length.should.be.equal(7)
                        // Check last carbon atom has 5 electrons
                        processed_atoms[3].slice(4).length.should.be.equal(5)
                        // Check there is no bond between first and second carbon
                        Set().intersection(processed_atoms[0].slice(4), processed_atoms[1].slice(4)).length.should.be.equal(0) 
                        // Check there is no bonds between second and third carbon
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(0)
                        // Check there is no bonds between third and last carbon
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(0)
                        
                        break;
                  
                    case 1: // second carbon
                        tracker.length.should.be.equal(0)
                        // Check first carbon atom has 5 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(5)
                        // Check second carbon atom has 7 electrons
                        processed_atoms[1].slice(4).length.should.be.equal(7)
                        // Check third carbon atom has 7 electrons
                        processed_atoms[2].slice(4).length.should.be.equal(7)
                        // Check last carbon atom has 5 electrons
                        processed_atoms[3].slice(4).length.should.be.equal(5)
                        // Check there is one bond between first and second carbon
                        Set().intersection(processed_atoms[0].slice(4), processed_atoms[1].slice(4)).length.should.be.equal(2) 
                        // Check there is no bonds between second and third carbon
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(0)
                        // Check there is no bonds between third and last carbon
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(0)
                        
                        break;      
                          
                      
                    case 2: // double bond
                        tracker.length.should.be.equal(0)
                        // Check first carbon atom has 5 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(5)
                        // Check second carbon atom has 7 electrons
                        processed_atoms[1].slice(4).length.should.be.equal(7)
                        // Check third carbon atom has 7 electrons
                        processed_atoms[2].slice(4).length.should.be.equal(7)
                        // Check last carbon atom has 5 electrons
                        processed_atoms[3].slice(4).length.should.be.equal(5)
                        // Check there is one bond between first and second carbon
                        Set().intersection(processed_atoms[0].slice(4), processed_atoms[1].slice(4)).length.should.be.equal(2) 
                        // Check there is two bonds between second and third carbon
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(4)
                        // Check there is no bonds between third and last carbon
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(0)
                        
                        break;
   
   
                    case 3: // third carbon
                        tracker.length.should.be.equal(0)
                        // Check first carbon atom has 5 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(5)
                        // Check second carbon atom has 7 electrons
                        processed_atoms[1].slice(4).length.should.be.equal(7)
                        // Check third carbon atom has 7 electrons
                        processed_atoms[2].slice(4).length.should.be.equal(7)
                        // Check last carbon atom has 5 electrons
                        processed_atoms[3].slice(4).length.should.be.equal(5)
                        // Check there is one bond between first and second carbon
                        Set().intersection(processed_atoms[0].slice(4), processed_atoms[1].slice(4)).length.should.be.equal(2) 
                        // Check there is two bonds between second and third carbon
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(4)
                        // Check there is no bonds between third and last carbon
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(0)
                        
                        break;                 
                        
                     case 4: // last carbon
                        tracker.length.should.be.equal(0)
                        // Check first carbon atom has 5 electrons
                        processed_atoms[0].slice(4).length.should.be.equal(5)
                        // Check second carbon atom has 7 electrons
                        processed_atoms[1].slice(4).length.should.be.equal(7)
                        // Check third carbon atom has 7 electrons
                        processed_atoms[2].slice(4).length.should.be.equal(7)
                        // Check last carbon atom has 5 electrons
                        processed_atoms[3].slice(4).length.should.be.equal(5)
                        // Check there is one bond between first and second carbon
                        Set().intersection(processed_atoms[0].slice(4), processed_atoms[1].slice(4)).length.should.be.equal(2) 
                        // Check there is two bonds between second and third carbon
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(4)
                        // Check there is one bonds between third and last carbon
                        Set().intersection(processed_atoms[1].slice(4), processed_atoms[2].slice(4)).length.should.be.equal(4)
                        
                        break;        
                        
                        
                }
                
            }
            
                        
            return res
            
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
        // Set().intersection(al_electrons, cl2_electrons).length.should.be.equal(2) // not ok
        atoms[3][0].should.be.equal("Cl")
        atoms[3].length.should.be.equal(12)
        const cl3_electrons = atoms[3].slice(4)
        cl3_electrons.length.should.be.equal(8)
        Set().intersection(al_electrons, cl3_electrons).length.should.be.equal(2)
    }

    if ("COC" === canonicalSMILES) {

        atoms[0].slice(4).length.should.be.equal(5)
        atoms[1].slice(4).length.should.be.equal(8)
        atoms[2].slice(4).length.should.be.equal(5)
        Set().intersection(atoms[0].slice(4), atoms[1].slice(4)).length.should.be.equal(2)
       // Set().intersection(atoms[2].slice(4), atoms[1].slice(4)).length.should.be.equal(2)
    }

    if ("CC=CC" === canonicalSMILES) {
        atoms[0].slice(4).length.should.be.equal(5)
        atoms[1].slice(4).length.should.be.equal(7)
        atoms[2].slice(4).length.should.be.equal(7)
        atoms[3].slice(4).length.should.be.equal(7)
        Set().intersection(atoms[0].slice(4), atoms[1].slice(4)).length.should.be.equal(2)
        Set().intersection(atoms[1].slice(4), atoms[2].slice(4)).length.should.be.equal(4)
        Set().intersection(atoms[2].slice(4), atoms[3].slice(4)).length.should.be.equal(2)
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
        atoms_with_hydrogens.length.should.be.equal(4) // not ok
        Set().intersection(atoms_with_hydrogens[1].slice(4), atoms_with_hydrogens[0].slice(4)).length.should.be.equal(2)
        Set().intersection(atoms_with_hydrogens[1].slice(4), atoms_with_hydrogens[2].slice(4)).length.should.be.equal(0)
        Set().intersection(atoms_with_hydrogens[1].slice(4), atoms_with_hydrogens[3].slice(4)).length.should.be.equal(0)
        Set().intersection(atoms_with_hydrogens[3].slice(4), atoms_with_hydrogens[2].slice(4)).length.should.be.equal(0)
        Set().intersection(atoms_with_hydrogens[2].slice(4), atoms_with_hydrogens[0].slice(4)).length.should.be.equal(2)
        Set().intersection(atoms_with_hydrogens[3].slice(4), atoms_with_hydrogens[0].slice(4)).length.should.be.equal(2)
    }

    if ("COC" === canonicalSMILES) {

        atoms_with_hydrogens.length.should.be.equal(9)
        // Get the electrons of the oxygen atom
        const oxygen_electrons = atoms_with_hydrogens.filter(
            (atom) => {
                return atom[0] === "O"
            }
        ).pop().slice(4)
        // Get the electrons of first of the carbon atoms
        const carbon_electrons = atoms_with_hydrogens.filter(
            (atom) => {
                return atom[0] === "C"
            }
        ).pop().slice(4)

        // Check if electrons are shared
        Set().intersection(oxygen_electrons, carbon_electrons).length.should.be.equal(2)
        // Get the electrons of second of the carbon atoms

        const carbons = atoms_with_hydrogens.filter(
            (atom) => {
                return atom[0] === "C"
            }
        )
        
        // Check carbons have no lone pairs and have 8 electrons each
        const mmolecule = [null, ...atoms_with_hydrogens]
        atoms_with_hydrogens.map(
            (atom, current_atom_index) => {
                if (atom[0] === "C") {
                     atom.slice(4).length = 8
                     CAtom(atom, current_atom_index, mmolecule).lonePairs().length.should.be.equal(0)
                }
                return atom
            }
        )
        
        // CAtom = (atom, current_atom_index, mmolecule)
        
        

    }
    
    if ("CC=CC" === canonicalSMILES) {
        
        atoms_with_hydrogens.filter(
            (atom) => {
                return atom[0] === "H"
            }
        ).length.should.be.equal(10)
        
        atoms_with_hydrogens.length.should.be.equal(14)
        const carbon_atoms = atoms_with_hydrogens.filter(
            (atom) => {
                return atom[0] === "C"
            }
        )
        
        // Check electrons
        carbon_atoms[0].slice(4).length.should.be.equal(8)
        carbon_atoms[1].slice(4).length.should.be.equal(8)
        carbon_atoms[2].slice(4).length.should.be.equal(8)
        carbon_atoms[3].slice(4).length.should.be.equal(8)
        
        // Check bonds
        Set().intersection(carbon_atoms[0].slice(4), carbon_atoms[1].slice(4)).should.be.equal(2)
        Set().intersection(carbon_atoms[1].slice(4), carbon_atoms[2].slice(4)).should.be.equal(4)
        Set().intersection(carbon_atoms[2].slice(4), carbon_atoms[3].slice(4)).should.be.equal(2)
    }

    return atoms_with_hydrogens

}

module.exports = AtomsFactory










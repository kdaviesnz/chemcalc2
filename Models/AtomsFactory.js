const uniqid = require('uniqid')
const AtomFactory = require('./AtomFactory')
const CAtom = require('../Controllers/Atom')
const CMolecule = require('../Controllers/Molecule')
const range = require("range");
// range.range(1,10,2)
const Set = require('./Set')
const _ = require('lodash');
const VMolecule = require('../Components/Stateless/Views/Molecule')
const Typecheck = require('../Typecheck')
const Constants = require('../Constants')

const AtomsFactory = (canonicalSMILES, verbose) => {

    Typecheck(
        {name:"canonicalSMILES", value:canonicalSMILES, type:"string"}
    )

    // https://www.npmjs.com/package/smiles
    const smiles = require('smiles')

    const electrons = (atom) => {
        Typecheck(
            {name:"atom", value:atom, type:"array"}
        )
        return atom.slice(Constants().electron_index)
    }

    const getFreeElectron = (used_electrons, atom, atom_index, electron_index ) => {
        Typecheck(
            {name:"used_electrons", value:used_electrons, type:"array"},
            {name:"atom", value:atom, type:"array"},
            {name:"atom_index", value:atom_index, type:"number"},
            {name:"electron_index", value:electron_index, type:"number"}
        )
        const electrons = atom.slice(Constants().electron_index).filter(
            (electron) => {
                return used_electrons.indexOf(electron) === -1
            }
        )

        return electron_index === undefined ? electrons.pop(): electrons[electrons.length - 1 - electron_index]
    }

    // parse a SMILES string, returns an array of SMILES tokens [{type: '...', value: '...'}, ...]
    const smiles_tokens = smiles.parse(canonicalSMILES)


    /*
    [O-]
[
  { type: 'BracketAtom', value: 'begin' },
  { type: 'ElementSymbol', value: 'O' },
  { type: 'Charge', value: -1 },
  { type: 'BracketAtom', value: 'end' }
]
     */
//    console.log(smiles_tokens)
//    process.error()


    const atoms_with_tokens = _.cloneDeep(smiles_tokens).map(
        (row, i, arr) => {
            if (row.type === "AliphaticOrganic" || row.type === "ElementSymbol") {
                return AtomFactory(row.value, 0, i+1)
            }
            return row
        }
    )

/* CN
[
  [
    'C', - 4 valence electrons
    6,
    4,
    4,
    0,
    'rn1',
    'rn1_1_1agfb3jkqfrjrn3',
    'rn1_1_1agfb3jkqfrjrn4',
    'rn1_1_1agfb3jkqfrjrn5',
    'rn1_1_1agfb3jkqfrjrn6'
  ],
  [
    'N', - 5 valence electrons
    7,
    5,
    3,
    0,
    'rn7',
    'rn7_2_1agfb3jkqfrjrn9',
    'rn7_2_1agfb3jkqfrjrna',
    'rn7_2_1agfb3jkqfrjrnb',
    'rn7_2_1agfb3jkqfrjrnc',
    'rn7_2_1agfb3jkqfrjrnd'
  ]
]

 */

   // console.log(atoms_with_tokens)
   // process.error()

    // Filter out brackets
    const atoms_with_tokens_no_brackets = _.cloneDeep(atoms_with_tokens).filter(
        (row) => {
            if (undefined !== row.type && (row.type === "BracketAtom")) {
                return false
            }
            return true
        }
    )

    /* CN
[
  [
    'C', - 4 valence electrons
    6,
    4,
    4,
    0,
    'nxy',
    'nxy_1_1agfbe8kqfrnny0',
    'nxy_1_1agfbe8kqfrnny1',
    'nxy_1_1agfbe8kqfrnny2',
    'nxy_1_1agfbe8kqfrnny3'
  ],
  [
    'N', - 5 valence electrson
    7,
    5,
    3,
    0,
    'ny4',
    'ny4_2_1agfbe8kqfrnny6',
    'ny4_2_1agfbe8kqfrnny7',
    'ny4_2_1agfbe8kqfrnny8',
    'ny4_2_1agfbe8kqfrnny9',
    'ny4_2_1agfbe8kqfrnnya'
  ]
]

     */
   // console.log(atoms_with_tokens_no_brackets)
   // process.error()



    // Add the bonds and branches
    let branch_number = 0

    // tracker
    // last row is current parent with available valence electrons
    const tracker = []
    const used_electrons = []
    const branch_tracker = {}
    let is_new_branch = false




    const atoms_with_bonds = (atoms_with_tokens_no_brackets).map(
        (row, index, processed_atoms) => {
            // Example rows:

            Typecheck(
                {name:"index", value:index, type:"number"},
                {name:"tracker", value:tracker, type:"array"},
                {name:"used_electrons", value:used_electrons, type:"array"},
                {name:"branch_tracker", value:branch_tracker, type:"object"},
                {name:"is_new_branch", value:is_new_branch, type:"boolean"},
            )

            let res = null

            if (index === 0) {
                if (undefined === branch_tracker[0]) {
                    branch_tracker[0] = []
                }
                branch_tracker[0].push([0, row[0]])
                // first atom, no branches
                res = row


            } else if (undefined === row.type ) {



                const tracker_index = tracker.length ===0 ? 0: tracker[tracker.length-1][0]
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



                // Get electrons

                const bond_type = processed_atoms[index -1].type === "Bond"
                && processed_atoms[index -1].value === "="? "=":(processed_atoms[index -1].type === "Bond"
                    && processed_atoms[index -1].value === "#"?"#":"")
                // Shared electrons
                const current_atom_electrons_to_share = []
                current_atom_electrons_to_share.push(getFreeElectron(used_electrons, row, index )) // row[row.length-1]
                used_electrons.push(current_atom_electrons_to_share[0])
                let parent_electrons_to_share = []
                parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index ))
                used_electrons.push(parent_electrons_to_share[0])

                if ( bond_type === "=" ) {
                    current_atom_electrons_to_share.push(getFreeElectron(used_electrons, row, index ))
                    used_electrons.push(current_atom_electrons_to_share[1])
                    parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index ))
                    used_electrons.push(parent_electrons_to_share[1])
                }

                if ( bond_type === "#") {


                    current_atom_electrons_to_share.push(getFreeElectron(used_electrons, row, index ))
                    current_atom_electrons_to_share.push(getFreeElectron(used_electrons, row, index, 1 ))
                    //  current_atom_electrons_to_share.push(getFreeElectron(used_electrons, row, index, 2 ))

                    used_electrons.push(current_atom_electrons_to_share[1])
                    used_electrons.push(current_atom_electrons_to_share[2])

                    parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index ))
                    parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index, 1 ))


                    used_electrons.push(parent_electrons_to_share[1])
                    used_electrons.push(parent_electrons_to_share[2])



                }
                processed_atoms[parent_atom_index].indexOf(parent_electrons_to_share[0]).should.not.be.equal(-1)

                // Create bonds
               // console.log(row)
                Typecheck(
                    {name:"row", value:row, type:"array"},
                    {name:"tracker", value:tracker, type:"array"},
                    {name:"used_electrons", value:used_electrons, type:"array"},
                    {name:"branch_tracker", value:branch_tracker, type:"object"},
                    {name:"is_new_branch", value:is_new_branch, type:"boolean"},
                )
                /*
                Example row
                [
  'N',
  7,
  5,
  3,
  0,
  'N_3_1agf8nhkphils3a',
  'N_3_1agf8nhkphils3b',
  'N_3_1agf8nhkphils3c',
  'N_3_1agf8nhkphils3d',
  'N_3_1agf8nhkphils3e'
]

                 */

                // Check if we are making a coordinate or standard covalent bond
                // In a coordinate covalent bond one of the atoms donates both electrons.
                // In a standard covalent bond each atom donates an electron.
                // A coordinate covalent bond is formed if the atom already has a full octet
                // and can donate a lone pair
                current_atom_electrons = electrons(row)
                parent_atom_electrons = electrons(processed_atoms[parent_atom_index])
                processed_atoms[parent_atom_index][0].should.be.a.String()  // O, N, etc
                processed_atoms[parent_atom_index].should.be.a.Array()
                if (current_atom_electrons.length === Constants().max_valence_electrons[row[0]]) {

                    process.error()
                    // coordinate covalent bond - current atom  (row) donates both electrons
                    current_atom_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[current_atom_atom_index], index+1))
                    used_electrons.push(current_atom_electrons_to_share[current_atom_electrons_to_share.length-1])
                    if (bond_type === "=") {
                        current_atom_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[current_atom_atom_index], index+2))
                        used_electrons.push(current_atom_electrons_to_share[current_atom_electrons_to_share.length-1])
                        current_atom_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[current_atom_atom_index], index+3))
                        used_electrons.push(current_atom_electrons_to_share[current_atom_electrons_to_share.length-1])
                    }
                    if (bond_type === "#") {
                        current_atom_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[current_atom_atom_index], index+2))
                        used_electrons.push(current_atom_electrons_to_share[current_atom_electrons_to_share.length-1])
                        current_atom_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[current_atom_atom_index], index+3))
                        used_electrons.push(current_atom_electrons_to_share[current_atom_electrons_to_share.length-1])
                        current_atom_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[current_atom_atom_index], index+4))
                        used_electrons.push(current_atom_electrons_to_share[current_atom_electrons_to_share.length-1])
                        current_atom_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[current_atom_atom_index], index+5))
                        used_electrons.push(current_atom_electrons_to_share[current_atom_electrons_to_share.length-1])
                    }


                    if (current_atom_electrons_to_share.length < 2 || (bond_type === "=" && current_atom_electrons_to_share.length < 4 ) | (bond_type === "#" && current_atom_electrons_to_share.length < 6 )) {
                        throw new Error("Parent electron does not have enough electrons to share")
                    }

                    row.push(current_atom_electrons_to_share[0])
                    row.push(current_atom_electrons_to_share[1])
                    if (bond_type === "=") {
                        row.push(current_atom_electrons_to_share[2])
                        row.push(current_atom_electrons_to_share[3])
                    }

                    if (bond_type === "#") {
                        row.push(current_atom_electrons_to_share[2])
                        row.push(current_atom_electrons_to_share[3])
                        row.push(current_atom_electrons_to_share[4])
                        row.push(current_atom_electrons_to_share[5])
                    }

                } else if((bond_type === "" && (processed_atoms[0][0] === "C" && processed_atoms[1][0] === "N") || (processed_atoms[0][0] === "N" && processed_atoms[1][0] === "C"))
                    || parent_atom_electrons.length === Constants().max_valence_electrons[processed_atoms[parent_atom_index][0]]) {


                    if (processed_atoms[0][0] === "C" && processed_atoms[1][0] === "N") {
                       // console.log(index)
                       // console.log(parent_atom_index)
                        //console.log(processed_atoms)
                        // Clear electrons
                        parent_electrons_to_share = []
                        parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[index], parent_atom_index))
                        used_electrons.push(parent_electrons_to_share[parent_electrons_to_share.length - 1])
                        parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[index], parent_atom_index))
                        used_electrons.push(parent_electrons_to_share[parent_electrons_to_share.length - 1])
                        //console.log(row)
                        //console.log(parent_electrons_to_share)
                        processed_atoms[0].push(parent_electrons_to_share[0])
                      //  processed_atoms[0].push(parent_electrons_to_share[1])
                      //  process.error()

                    } else if(processed_atoms[0][0] === "N" && processed_atoms[1][0] === "C") {
                        // console.log(index)
                        // console.log(parent_atom_index)
                        //console.log(processed_atoms)
                        // Clear electrons
                        parent_electrons_to_share = []
                        parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index))
                        used_electrons.push(parent_electrons_to_share[parent_electrons_to_share.length - 1])
                        parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index))
                        used_electrons.push(parent_electrons_to_share[parent_electrons_to_share.length - 1])
                        //console.log(row)
                        //console.log(parent_electrons_to_share)
                        processed_atoms[1].push(parent_electrons_to_share[0])
                        processed_atoms[1].push(parent_electrons_to_share[1])
                       // process.error()
                    } else {

                        // coordinate covalent bond - parent donates both electrons
                        parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index + 1))
                        used_electrons.push(parent_electrons_to_share[parent_electrons_to_share.length - 1])
                        if (bond_type === "=") {
                            parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index + 2))
                            used_electrons.push(parent_electrons_to_share[parent_electrons_to_share.length - 1])
                            parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index + 3))
                            used_electrons.push(parent_electrons_to_share[parent_electrons_to_share.length - 1])
                        }
                        if (bond_type === "#") {
                            parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index + 2))
                            used_electrons.push(parent_electrons_to_share[parent_electrons_to_share.length - 1])
                            parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index + 3))
                            used_electrons.push(parent_electrons_to_share[parent_electrons_to_share.length - 1])
                            parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index + 4))
                            used_electrons.push(parent_electrons_to_share[parent_electrons_to_share.length - 1])
                            parent_electrons_to_share.push(getFreeElectron(used_electrons, atoms_with_tokens_no_brackets[parent_atom_index], index + 5))
                            used_electrons.push(parent_electrons_to_share[parent_electrons_to_share.length - 1])
                        }


                        if (parent_electrons_to_share.length < 2 || (bond_type === "=" && parent_electrons_to_share.length < 4) | (bond_type === "#" && parent_electrons_to_share.length < 6)) {
                            throw new Error("Parent electron does not have enough electrons to share")
                        }

                        row.push(parent_electrons_to_share[0])
                       // row.push(parent_electrons_to_share[1])
                        if (bond_type === "=") {
                            row.push(parent_electrons_to_share[2])
                           // row.push(parent_electrons_to_share[3])
                        }

                        if (bond_type === "#") {
                            row.push(parent_electrons_to_share[2])
                            row.push(parent_electrons_to_share[3])
                           // row.push(parent_electrons_to_share[4])
                           // row.push(parent_electrons_to_share[5])
                        }

                    }

                } else {

                    // Standard covalent bond - both atoms donate an electron
                    row.push(parent_electrons_to_share[0])

                    if (bond_type === "=") {
                        row.push(parent_electrons_to_share[1])
                    }

                    if (bond_type === "#") {
                        row.push(parent_electrons_to_share[1])
                        row.push(parent_electrons_to_share[2])
                    }

                    // Push electrons to parent atom
                    processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[0])

                    if (bond_type === "=") {
                        processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[1])
                    }

                    if (bond_type === "#") {
                        processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[1])
                        processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[2])
                    }

                }


                if (undefined === branch_tracker[branch_number]) {
                    branch_tracker[branch_number] = []
                }
                branch_tracker[branch_number].push([index, row[0]])
                is_new_branch = false
                res = row // is an atom

            } else if (row.type === 'Bond') {
                res = row // remove row in the next phase as we still need it
            } else if (undefined !== row.type && row.type === "Branch" && row.value === "begin") {
                is_new_branch.should.be.equal(false)
                // Change tracker to show new parent atom
                const tracker_index = 0 // @todo - should be index of previous atom on same branch
                tracker.push([ tracker_index, ...atoms_with_tokens_no_brackets[tracker_index].slice(Constants().electron_index)])
                branch_number++
                is_new_branch = true
                // Change row to null as it's not an atom row
                res = null
            } else if (undefined !== row.type && row.type === "Branch" && row.value === "end") {
                // Change tracker to show previous parent atom
                tracker.pop()
                branch_number--
                is_new_branch = false
                // Change row to null as it's not an atom row
                res = null
            } else if (undefined !== row.type && row.type === "HydrogenCount") {
                res = row

            } else if (undefined !== row.type && row.type === "Charge") {
                res = row
            }  else if (undefined !== row.type && row.type === "Ringbond") {
                res = row
            }
            return res

        }
    ).filter(
        (atom) => {
            return null !== atom
        }
    )

    //console.log(atoms_with_bonds)
    //process.error()
    /* CN, coordinate covalent bond
[
  [
    'C', - 4 valence bonds + 1 from N
    6,
    4,
    4,
    0,
    'dyh',
    'dyh_1_1agfbllkqfrqdyj',
    'dyh_1_1agfbllkqfrqdyk',
    'dyh_1_1agfbllkqfrqdyl',
    'dyh_1_1agfbllkqfrqdym',
    'dyn_2_1agfbllkqfrqdys',
  ],
  [
    'N',
    7,
    5,
    3,
    0,
    'dyn',
    'dyn_2_1agfbllkqfrqdyp',
    'dyn_2_1agfbllkqfrqdyq',
    'dyn_2_1agfbllkqfrqdyr',
    'dyn_2_1agfbllkqfrqdys',
    'dyn_2_1agfbllkqfrqdyt'
  ]
]
     */
   // console.log(atoms_with_bonds)
   // process.error()



    // Remove bonds using filter
// @todo
    const atoms = (atoms_with_bonds).filter(
        (row) => {
            return row.type !== 'Bond'
        }
    )

    /*
    CN coordinate covalent bond
[
  [
    'C', - 4 valence electrons + 1 from N
    6,
    4,
    4,
    0,
    'myr',
    'myr_1_1agfbwokqfrumyt',
    'myr_1_1agfbwokqfrumyu',
    'myr_1_1agfbwokqfrumyv',
    'myr_1_1agfbwokqfrumyw',
    'myx_2_1agfbwokqfrumz2',
  ],
  [
    'N', - 5 valence electrons
    7,
    5,
    3,
    0,
    'myx',
    'myx_2_1agfbwokqfrumyz',
    'myx_2_1agfbwokqfrumz0',
    'myx_2_1agfbwokqfrumz1',
    'myx_2_1agfbwokqfrumz2',
    'myx_2_1agfbwokqfrumz3'
  ]
]

     */

  //  console.log(atoms)
  //  process.error()


    let ring_bond_atom_index = null

    const ringbond_atom_indexes = atoms.reduce((carry, row, ring_bond_index) =>{
        if (row.type === 'Ringbond') {
            const matching_ringbond_index = _.findIndex(atoms, (r, j)=>{
                return r.type === 'Ringbond' && r.value === row.value && j !== ring_bond_index
            })
            carry.push([ring_bond_index -1, matching_ringbond_index -1])
        }
        return carry
    }, [])


    // Make the ring bonds
    ringbond_atom_indexes.map((indexes)=>{
        if (indexes[0]>indexes[1]) {
            return indexes
        }
        //// console.log(indexes)
        const e = uniqid()
        const m = [[12345,atoms],1]
        const parent_atom = m[0][1][indexes[0]]
        const child_atom = m[0][1][indexes[1]]
        const parent_free_electrons = parent_atom.freeElectrons(m[0][1])
        const child_free_electrons = child_atom.freeElectrons(m[0][1])
        if (child_free_electrons[0] !== undefined) {
            atoms[indexes[0]].addElectron(child_free_electrons[0])
        }
        if (parent_free_electrons[0] !== undefined) {
            atoms[indexes[1]].addElectron(parent_free_electrons[0])
        }
        return indexes
    })

    const atoms_with_ring_bonds = _.cloneDeep(atoms).filter((atom)=>{
       return atom.type !== "Ringbond"
    })



    /*
    CN coordinate covalent bond
[
  [
    'C', - 4 valence electrons + 1 from N
    6,
    4,
    4,
    0,
    'myr',
    'myr_1_1agfbwokqfrumyt',
    'myr_1_1agfbwokqfrumyu',
    'myr_1_1agfbwokqfrumyv',
    'myr_1_1agfbwokqfrumyw',
    'myx_2_1agfbwokqfrumz2',
  ],
  [
    'N', - 5 valence electrons
    7,
    5,
    3,
    0,
    'myx',
    'myx_2_1agfbwokqfrumyz',
    'myx_2_1agfbwokqfrumz0',
    'myx_2_1agfbwokqfrumz1',
    'myx_2_1agfbwokqfrumz2',
    'myx_2_1agfbwokqfrumz3'
  ]
]

     */


    //console.log(atoms_with_ring_bonds)
    //process.error()



    const atoms_with_hydrogen_counts = atoms_with_ring_bonds

    const atoms_with_charges = atoms_with_hydrogen_counts.reduce(
        (carry, current, index, atoms) => {
            if (current['type'] !== undefined && current['type'] === "HydrogenCount") {
                carry.push(current)
            } else if (typeof current[0]==="string") {
                if (undefined !== atoms[index+1] && atoms[index+1].type === "Charge") {
                    current[4] =  atoms[index+1].value === 1 ? "+":"-"
                }
                carry.push(current)
            }
            return carry
        }, []
    )

/*
CN coordinate covalent bond
[
  [
    'C', - 4 valence electrons + 1 from N
    6,
    4,
    4,
    0,
    'myr',
    'myr_1_1agfbwokqfrumyt',
    'myr_1_1agfbwokqfrumyu',
    'myr_1_1agfbwokqfrumyv',
    'myr_1_1agfbwokqfrumyw',
    'myx_2_1agfbwokqfrumz2',
  ],
  [
    'N', - 5 valence electrons
    7,
    5,
    3,
    0,
    'myx',
    'myx_2_1agfbwokqfrumyz',
    'myx_2_1agfbwokqfrumz0',
    'myx_2_1agfbwokqfrumz1',
    'myx_2_1agfbwokqfrumz2',
    'myx_2_1agfbwokqfrumz3'
  ]
]
 */
   // console.log(atoms_with_charges)
   // process.error()

    // Add hydrogens
    const molecule = [[12345,atoms_with_charges],1]
    const atoms_with_hydrogens = atoms_with_charges.reduce(
        (carry, current, index, arr) => {

            /*
            [
  'C',
  6,
  4,
  4,
  0,
  'zwv',
  'C_1_3bdk46sbkq4rjzwx',
  'C_1_3bdk46sbkq4rjzwy',
  'C_1_3bdk46sbkq4rjzwz',
  'C_1_3bdk46sbkq4rjzx0',
  'C_2_3bdk46sbkq4rjzx6'
]
             */
        //    process.error()

            if (typeof current.length === "number" && current[0]!=='H') { // we have an atom



                const free_electrons = current.freeElectrons(atoms_with_charges)

                // Add hydrogens where we have a hydrogen count
                if (atoms_with_charges[index+1] !== undefined && atoms_with_charges[index+1]['type'] !== undefined && atoms_with_charges[index+1]['type'] === "HydrogenCount") {

                    range.range(0, atoms_with_charges[index+1]['value'],1).map(
                        (e_index) => {
                            if (undefined !== free_electrons[e_index]) { // free electrons from the current atom (not hydrogen)
                                const current_electrons = electrons(current)
                                const hydrogen = AtomFactory('H', "", e_index + 1)
                                hydrogen.addElectron(free_electrons[e_index])
                                if (current_electrons.length < Constants().max_valence_electrons[current[0]]) {
                                    current.push(hydrogen[hydrogen.length - 2])
                                }
                                carry.push(hydrogen)
                            } else {
                            }
                        }
                    )
                }  else {

                    // [O+]
                    /*
                    [
  'O',
  8,
  6,
  2,
  '+',
  'gns',
  'O_2_1agf8uikq5rugnu',
  'O_2_1agf8uikq5rugnv',
  'O_2_1agf8uikq5rugnw',
  'O_2_1agf8uikq5rugnx',
  'O_2_1agf8uikq5rugny',
  'O_2_1agf8uikq5rugnz'
]
3 hydrogens
                     */
                    //console.log(atoms_with_charges)
                    //console.log(current)
                    //console.log(free_electrons)
                    //process.error()

                    // ignore
                    if (false) {
                        let base_number_of_hydrogens_required = 0
                        if (current[0] === "Hg" || current[0] === "Ac") {
                            base_number_of_hydrogens_required = 0
                        } else {
                            base_number_of_hydrogens_required = free_electrons.length
                        }
                        //
                    }

                    // @todo assumes atom is one of C,N,O
                    const offset_map = {
                        "O": 6,
                        "N": 5,
                        "C": 4,
                    }
                    let number_of_hydrogens_req = Constants().max_valence_electrons[current[0]] - (offset_map[current[0]] + current.indexedBonds(atoms_with_charges).length)
                    if (current[4] === "+") {
                        number_of_hydrogens_req = number_of_hydrogens_req + 1
                    } else if (current[4] === "-") {
                        number_of_hydrogens_req = number_of_hydrogens_req - 1
                    }

                    if (false && current[0] === "N") {
                        console.log(current[0])
                        console.log(number_of_hydrogens_req)
                        process.error()
                    }
                    range.range(0, number_of_hydrogens_req, 1).map(
                        (e_index) => {
                            if (undefined !== free_electrons[e_index]) {
                                const current_electrons =  current.electrons()
                                const hydrogen = AtomFactory('H', "", e_index + 1)
                                hydrogen.addElectron(free_electrons[e_index])
                                if (current_electrons.length < Constants().max_valence_electrons[current[0]]) {
                                    current.addElectron(hydrogen[hydrogen.length - 2])
                                }
                                carry.addAtom(hydrogen)
                            } else {
                            }
                        }
                    )

                    // ignore
                    if (false) {
                        if (base_number_of_hydrogens_required > 0) {
                            const offset_map = {
                                "O": 4,
                                "N": 2,
                                "C": 0,
                            }
                            let number_of_hydrogens_required = base_number_of_hydrogens_required - offset_map[current[0]]
                            if (current[4] === "+") {
                                number_of_hydrogens_required = number_of_hydrogens_required + 1
                            } else if (current[4] === "-") {
                                number_of_hydrogens_required = number_of_hydrogens_required - 1
                            }
                            range.range(0, number_of_hydrogens_required, 1).map(
                                (e_index) => {
                                    if (undefined !== free_electrons[e_index]) {
                                        const current_electrons = electrons(current)
                                        const hydrogen = AtomFactory('H', "", e_index + 1)
                                        hydrogen.addElectron(free_electrons[e_index])
                                        if (current_electrons.length < Constants().max_valence_electrons[current[0]]) {
                                            current.addElectron(hydrogen[hydrogen.length - 2])
                                        }
                                        carry.addAtom(hydrogen)
                                    } else {
                                    }
                                }
                            )
                        }
                    }
                    // ignore

                }

            }

            if(current['type'] === undefined) {
                carry.addAtom(current)
            }
            return carry
        },
        []
    )

    /* CN coordinate covalent bond
    C = xs8, N = xse
[
  [
    'H',
    1,
    1,
    1,
    '',
    'xsl',
    'xsl_1_1agfcdakqfs0xsn',
    'xs8_1_1agfcdakqfs0xsa' (C bond)
  ],
  [
    'H',
    1,
    1,
    1,
    '',
    'xso',
    'xso_2_1agfcdakqfs0xsq',
    'xs8_1_1agfcdakqfs0xsb' (C bond)
  ],
  [
    'H',
    1,
    1,
    1,
    '',
    'xsr',
    'xsr_3_1agfcdakqfs0xst', * missing bond to C
    'xs8_1_1agfcdakqfs0xsc' (C bond)
  ],
  [
    'H',
    1,
    1,
    1,
    '',
    'xsu',
    'xsu_4_1agfcdakqfs0xsw', * missing bond to C, additional H
    'xs8_1_1agfcdakqfs0xsd' (C bond)
  ],
  [
    'C', 4 valence electrons + 1 from N, 4 bonds (3 hydrogen, 1 Nitrogen)
    6,
    4,
    4,
    0,
    'xs8',
    'xs8_1_1agfcdakqfs0xsa',
    'xs8_1_1agfcdakqfs0xsb',
    'xs8_1_1agfcdakqfs0xsc',
    'xs8_1_1agfcdakqfs0xsd',
    'xse_2_1agfcdakqfs0xsj',
    'xsl_1_1agfcdakqfs0xsn', (H bond 1)
    'xso_2_1agfcdakqfs0xsq' (H bond 2)
  ],
  [
    'H',
    1,
    1,
    1,
    '',
    'xsx',
    'xsx_1_1agfcdakqfs0xsz',
    'xse_2_1agfcdakqfs0xsg' (bond to N)
  ],
  [
    'N',  5 valence electrons, 3 bonds (2 hydrogen, 1 C) - missing second carbon bond
    7,
    5,
    3,
    0,
    'xse',
    'xse_2_1agfcdakqfs0xsg',
    'xse_2_1agfcdakqfs0xsh',
    'xse_2_1agfcdakqfs0xsi',
    'xse_2_1agfcdakqfs0xsj',
    'xse_2_1agfcdakqfs0xsk',
    'xsx_1_1agfcdakqfs0xsz' (Bond to H)
  ]
]

     */
 //   console.log(atoms_with_hydrogens)
 //   process.error()
    const atoms_electrons_checked = []
    let i = 0
    for(i in atoms_with_hydrogens) {
        const atom = atoms_with_hydrogens[i]
        const bond_count = atom.indexedBonds((atoms_with_hydrogens)).length
            + atom.indexedDoubleBonds((atoms_with_hydrogens)).length
            + atom.indexedTripleBonds((atoms_with_hydrogens)).length
        const free_electrons = atom.freeElectrons(atoms_with_hydrogens)
        const electrons = atom.slice(Constants().electron_index)

        if (atom[4] === "" || atom[4] === 0) {
            switch (atom[0]) {
                case "O":
                    if (bond_count > 3) {
                        if (atom.hydrogens(atoms_with_hydrogens).length > 0) {
                            // Remove a hydrogen
                            const h_bonds = atom.indexedBonds(atoms_with_hydrogens).filter((bond) => {
                                return bond.atom[0] === "H"
                            })
                            _.remove(atom, (electron) => {
                                return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                            })
                            atom.push(uniqid())
                        }
                    }
                    if (bond_count > 2) {
                        atom[4] = "+"
                    }
                    break;
                case "N":

                    if (bond_count > 4) {
                        if (atom.hydrogens(atoms_with_hydrogens).length > 0) {
                            // Remove a hydrogen
                            const h_bonds = atom.indexedBonds(atoms_with_hydrogens).filter((bond) => {
                                return bond.atom[0] === "H"
                            })
                            _.remove(atom, (electron) => {
                                return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                            })
                            atom.push(uniqid())
                        }
                    }
                    if (bond_count > 3) {
                        atom[4] = "+"
                    }
                    if (bond_count === 2) {
                        // @see BondsAI addHydrogen()
                        const hydrogen_arr = AtomFactory("H", "")
                        const hydrogen_electron_to_share = hydrogen_arr[hydrogen_arr.length - 1]
                        const atom_free_electrons = atom.freeElectrons(atoms_with_hydrogens)
                        atom.addElectron(hydrogen_electron_to_share)
                        hydrogen_arr.addElectron(atom_free_electrons[0], "H")
                        atoms_electrons_checked.addAtom(hydrogen_arr)

                    }
                    break;
                case "C":
                    // // console.log('Bond count on C:'+bond_count+" " + index)
                    if (bond_count === 5) {
                        if (atom.hydrogens(atoms_with_hydrogens).length > 0) {
                            // Remove a hydrogen
                            const h_bonds = atom.indexedBonds(atoms_with_hydrogens).filter((bond) => {
                                return bond.atom[0] === "H"
                            })
                            _.remove(atom, (electron) => {
                                return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                            })
                            atom.push(uniqid())
                        }
                    }
                    if (bond_count === 4) {
                        if (atom.freeElectrons((atoms_with_hydrogens)).length !== 0) {
                            // // console.log(atom.indexedBonds(""))
                            atom.indexedBonds((atoms_with_hydrogens)).map((bond) => {
                                // // console.log("Bond type:"+bond.bond_type)
                                // // console.log(bond.shared_electrons)
                                return bond
                            })
                            // // console.log(atom)
                            // // console.log(jjklkjkl)
                        }
                    }
                    break;
            }
        }
        if (atom[4] === "+") {
            switch (atom[0]) {
                case "O":
                    if (6 + bond_count === electrons.length) {
                        _.remove(atom, (item)=>{
                            return item === free_electrons[0]
                        })
                    }
                    break
                case "N":
                    if (5 + bond_count === electrons.length) {
                        _.remove(atom, (item)=>{
                            return item === free_electrons[0]
                        })
                    }
                    break
                case "C":
                    // @see https://socratic.org/questions/how-is-carbocation-formed
                    /*
                    A carbocation is an organic molecule, an intermediate, that forms as a result of the loss of two valence electrons, normally shared electrons, from a carbon atom that already has four bonds. This leads to the formation of a carbon atom bearing a positive charge and three bonds instead of four. The whole molecule holding the positively charged carbon atom is referred to as a carbocation intermediate.
                     */
                    if (bond_count === 4 && (4 + bond_count) === electrons.length) {
                        _.remove(atom, (item)=>{
                            return item === electrons[0]
                        })
                        _.remove(atom, (item)=>{
                            return item === electrons[1]
                        })
                    }
                    break

            }
        }
        if (atom[4] === "-") {
            switch (atom[0]) {
                case "O":
                    if (6 + bond_count === electrons.length && electrons.length + 1 < 9) {
                        atom.push(uniqid())
                    }
                    if (bond_count === 2) {
                        // Remove a hydrogen
                        const h_bonds = atom.indexedBonds("").filter((bond)=>{
                            return bond.atom[0] === "H"
                        })
                        _.remove(atom, (electron)=>{
                            return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                        })
                        atom.push(uniqid())
                        atom.push(uniqid())
                    }
                    break
                case "N":
                    if (5 + bond_count === electrons.length && electrons.length + 1 < 9) {
                        atom.push(uniqid())
                    }
                    if (bond_count === 3) {
                        // Remove a hydrogen
                        const h_bonds = atom.indexedBonds("").filter((bond)=>{
                            return bond.atom[0] === "H"
                        })
                        _.remove(atom, (electron)=>{
                            return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                        })
                        atom.push(uniqid())
                        atom.push(uniqid())
                    }
                    break
                case "C":
                    if (4 + bond_count === electrons.length) {
                        atom.push(uniqid())
                    }
                    break

            }
        }

        atoms_electrons_checked.addAtom(atom)
        //console.log(atom[0] + atom.hydrogens(atoms_electrons_checked).length)


    }


    if (false) {
        const xatoms_electrons_checked = atoms_with_hydrogens.map((atom, index, arr) => {
            const o_atom = atom

            const bond_count = o_atom.indexedBonds((atoms_with_hydrogens)).length
                + o_atom.indexedDoubleBonds((atoms_with_hydrogens)).length
                + o_atom.indexedTripleBonds((atoms_with_hydrogens)).length
            const free_electrons = o_atom.freeElectrons(atoms_with_hydrogens)
            const electrons = atom.slice(Constants().electron_index)

            if (atom[4] === "" || atom[4] === 0) {
                switch (atom[0]) {
                    case "O":
                        if (bond_count > 3) {
                            if (o_atom.hydrogens(atoms_with_hydrogens).length > 0) {
                                // Remove a hydrogen
                                const h_bonds = o_atom.indexedBonds(atoms_with_hydrogens).filter((bond) => {
                                    return bond.atom[0] === "H"
                                })
                                _.remove(atom, (electron) => {
                                    return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                                })
                                atom.push(uniqid())
                            }
                        }
                        if (bond_count > 2) {
                            atom[4] = "+"
                        }
                        break;
                    case "N":

                        if (bond_count > 4) {
                            if (o_atom.hydrogens(atoms_with_hydrogens).length > 0) {
                                // Remove a hydrogen
                                const h_bonds = o_atom.indexedBonds(atoms_with_hydrogens).filter((bond) => {
                                    return bond.atom[0] === "H"
                                })
                                _.remove(atom, (electron) => {
                                    return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                                })
                                atom.push(uniqid())
                            }
                        }
                        if (bond_count > 3) {
                            atom[4] = "+"
                        }
                        if (bond_count === 2) {
                            // @see BondsAI addHydrogen()
                            const hydrogen_arr = AtomFactory("H", "")
                            const hydrogen_electron_to_share = hydrogen_arr[hydrogen_arr.length - 1]
                            const atom_free_electrons = atom.freeElectrons(atoms_with_hydrogens)
                            atom.addElectron(hydrogen_electron_to_share)
                            hydrogen_arr.addElectron(atom_free_electrons[0], "H")
                            arr.addAtom(hydrogen_arr)

                        }
                        break;
                    case "C":
                        // // console.log('Bond count on C:'+bond_count+" " + index)
                        if (bond_count === 5) {
                            if (o_atom.hydrogens(atoms_with_hydrogens).length > 0) {
                                // Remove a hydrogen
                                const h_bonds = o_atom.indexedBonds(atoms_with_hydrogens).filter((bond) => {
                                    return bond.atom[0] === "H"
                                })
                                _.remove(atom, (electron) => {
                                    return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                                })
                                atom.push(uniqid())
                            }
                        }
                        if (bond_count === 4) {
                            if (o_atom.freeElectrons((atoms_with_hydrogens)).length !== 0) {
                                // // console.log(o_atom.indexedBonds(""))
                                o_atom.indexedBonds((atoms_with_hydrogens)).map((bond) => {
                                    // // console.log("Bond type:"+bond.bond_type)
                                    // // console.log(bond.shared_electrons)
                                    return bond
                                })
                                // // console.log(atom)
                                // // console.log(jjklkjkl)
                            }
                        }
                        break;
                }
            }
            if (atom[4] === "+") {
                switch (atom[0]) {
                    case "O":
                        if (6 + bond_count === electrons.length) {
                            _.remove(atom, (item) => {
                                return item === free_electrons[0]
                            })
                        }
                        break
                    case "N":
                        if (5 + bond_count === electrons.length) {
                            _.remove(atom, (item) => {
                                return item === free_electrons[0]
                            })
                        }
                        break
                    case "C":
                        // @see https://socratic.org/questions/how-is-carbocation-formed
                        /*
                        A carbocation is an organic molecule, an intermediate, that forms as a result of the loss of two valence electrons, normally shared electrons, from a carbon atom that already has four bonds. This leads to the formation of a carbon atom bearing a positive charge and three bonds instead of four. The whole molecule holding the positively charged carbon atom is referred to as a carbocation intermediate.
                         */
                        if (bond_count === 4 && (4 + bond_count) === electrons.length) {
                            _.remove(atom, (item) => {
                                return item === electrons[0]
                            })
                            _.remove(atom, (item) => {
                                return item === electrons[1]
                            })
                        }
                        break

                }
            }
            if (atom[4] === "-") {
                switch (atom[0]) {
                    case "O":
                        if (6 + bond_count === electrons.length && electrons.length + 1 < 9) {
                            atom.push(uniqid())
                        }
                        if (bond_count === 2) {
                            // Remove a hydrogen
                            const h_bonds = o_atom.indexedBonds("").filter((bond) => {
                                return bond.atom[0] === "H"
                            })
                            _.remove(atom, (electron) => {
                                return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                            })
                            atom.push(uniqid())
                            atom.push(uniqid())
                        }
                        break
                    case "N":
                        if (5 + bond_count === electrons.length && electrons.length + 1 < 9) {
                            atom.push(uniqid())
                        }
                        if (bond_count === 3) {
                            // Remove a hydrogen
                            const h_bonds = o_atom.indexedBonds("").filter((bond) => {
                                return bond.atom[0] === "H"
                            })
                            _.remove(atom, (electron) => {
                                return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                            })
                            atom.push(uniqid())
                            atom.push(uniqid())
                        }
                        break
                    case "C":
                        if (4 + bond_count === electrons.length) {
                            atom.push(uniqid())
                        }
                        break

                }
            }

            console.log(atom[0] + atom.hydrogens(arr).length)

            return atom
        })
    }

    /*
    atoms_electrons_checked.map((a)=>{
      console.log(a[0] + a.hydrogens(atoms_electrons_checked).length)
    })
    */
//    process.error()

    /*
    CN - Nitrogen should have 7 electrons as coordinate bond with C + 2 hydrogens (5 + 0 + 2)
[
  [
    'H',
    1,
    1,
    1,
    '',
    'zhv',
    'zhv_1_1agfj5akqfv4zhx',
    'zhi_1_1agfj5akqfv4zhk'
  ],
  [
    'H',
    1,
    1,
    1,
    '',
    'zhy',
    'zhy_2_1agfj5akqfv4zi0',
    'zhi_1_1agfj5akqfv4zhl'
  ],
  [
    'H',
    1,
    1,
    1,
    '',
    'zi1',
    'zi1_3_1agfj5akqfv4zi3',
    'zhi_1_1agfj5akqfv4zhm'
  ],
  [
    'C',
    6,
    4,
    4,
    0,
    'zhi',
    'zhi_1_1agfj5akqfv4zhk',
    'zhi_1_1agfj5akqfv4zhl',
    'zhi_1_1agfj5akqfv4zhm',
    'zhi_1_1agfj5akqfv4zhn',
    'zho_2_1agfj5akqfv4zht',
    'zhv_1_1agfj5akqfv4zhx',
    'zhy_2_1agfj5akqfv4zi0',
    'zi1_3_1agfj5akqfv4zi3'
  ],
  [
    'H',
    1,
    1,
    1,
    '',
    'zi4',
    'zi4_1_1agfj5akqfv4zi6',
    'zho_2_1agfj5akqfv4zhq'
  ],
  [
    'H',
    1,
    1,
    1,
    '',
    'zi7',
    'zi7_2_1agfj5akqfv4zi9',
    'zho_2_1agfj5akqfv4zhr'
  ],
  [
    'N',
    7,
    5,
    3,
    0,
    'zho',
    'zho_2_1agfj5akqfv4zhq',
    'zho_2_1agfj5akqfv4zhr',
    'zho_2_1agfj5akqfv4zhs',
    'zho_2_1agfj5akqfv4zht',
    'zho_2_1agfj5akqfv4zhu',
    'zi4_1_1agfj5akqfv4zi6',
    'zi7_2_1agfj5akqfv4zi9'
  ]
]

     */
   //console.log(atoms_electrons_checked)
   // process.error()

    // Remove hydrogens with no bonds
    const atoms_with_redundant_hydrogens_removed = _.remove(atoms_electrons_checked, (atom, i)=>{
        if (atom[0] !== "H") {
            return atom
        }
        //const h = CAtom(atom, i, [['12345', atoms_electrons_checked], 1])
        const h = atom
        return h.indexedBonds(atoms_electrons_checked).length > 0
    })

//    console.log(atoms_with_redundant_hydrogens_removed)
  //  process.error()

   const molecule4 = [[12345,atoms_with_redundant_hydrogens_removed],1]
   //// console.log(VMolecule(molecule4).compressed())

  //const moleculeAI = require("../Components/Stateless/MoleculeAI")(molecule4)
   // moleculeAI.validateMolecule()

     //console.log(VMolecule(molecule4).compressed())
      //process.error()

    return atoms_with_redundant_hydrogens_removed

    // We can't do this
    // Sort atoms by atom and number of elements so that they return the same canonical smiles
    const atoms_sorted =  _.sortBy(atoms_electrons_checked, (o)=>{
        return o[0]
    }).sort(function (a, b) {
        return b.length - a.length;
    })

/*
    // console.log(atoms_sorted.map((a, i)=>{
        a.push(i)
        return a
    }))

*/
    //return atoms_sorted


}

module.exports = AtomsFactory










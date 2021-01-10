const uniqid = require('uniqid')
const AtomFactory = require('./AtomFactory')
const CAtom = require('../Controllers/Atom')
const CMolecule = require('../Controllers/Molecule')
const range = require("range");
// range.range(1,10,2)
const Set = require('./Set')
const _ = require('lodash');
const VMolecule = require('../Components/Stateless/Views/Molecule')

const AtomsFactory = (canonicalSMILES, verbose) => {

    // https://www.npmjs.com/package/smiles
    const smiles = require('smiles')

    const getFreeElectron = (used_electrons, atom, atom_index, electron_index ) => {
        const electrons = atom.slice(5).filter(
            (electron) => {
                return used_electrons.indexOf(electron) === -1
            }
        )

        return electron_index === undefined ? electrons.pop(): electrons[electrons.length - 1 - electron_index]
    }

    // parse a SMILES string, returns an array of SMILES tokens [{type: '...', value: '...'}, ...]
    const smiles_tokens = smiles.parse(canonicalSMILES)

    // [O+]
  // console.log(smiles_tokens)
   // console.log(oplus)
    /*
   [ { type: 'AliphaticOrganic', value: 'C' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'Branch', value: 'begin' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'Ringbond', value: 1 },
  { type: 'Bond', value: '=' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'Bond', value: '=' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'Bond', value: '=' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'Ringbond', value: 1 },
  { type: 'Branch', value: 'end' },
  { type: 'AliphaticOrganic', value: 'N' },
  { type: 'AliphaticOrganic', value: 'C' } ]

     */




    // [C1=CC=C(C=C1)CO]
    /*
[ { type: 'AliphaticOrganic', value: 'C' }, 1 anti clockwise
  { type: 'Ringbond', value: 1 },
  { type: 'Bond', value: '=' },
  { type: 'AliphaticOrganic', value: 'C' }, 2
  { type: 'AliphaticOrganic', value: 'C' }, 3
  { type: 'Bond', value: '=' },
  { type: 'AliphaticOrganic', value: 'C' }, 4
  { type: 'Branch', value: 'begin' }, ?
  { type: 'AliphaticOrganic', value: 'C' },  5
  { type: 'Bond', value: '=' },
  { type: 'AliphaticOrganic', value: 'C' }, 6
  { type: 'Ringbond', value: 1 }, 7 - carbon 2
  { type: 'Branch', value: 'end' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'AliphaticOrganic', value: 'O' } ]

     */
    const atoms_with_tokens = _.cloneDeep(smiles_tokens).map(
        (row, i, arr) => {
            if (row.type === "AliphaticOrganic" || row.type === "ElementSymbol") {
             //   const charge = undefined !== arr[i+1] && arr[i+1]['type']==='Charge'?arr[i+1]['value']*1:0
              //  console.log(arr[i+1])
              //  console.log("Charge:" + charge)
                return AtomFactory(row.value, 0)
            }
            return row
        }
    )

    // [O+]
    // console.log(atoms_with_tokens)
    // console.log(oplus)
    /*
[ { type: 'BracketAtom', value: 'begin' },
  [ 'O',
    8,
    6,
    2,
    0,
    '4r7b8138ukjjjyjat',
    '4r7b8138ukjjjyjau',
    '4r7b8138ukjjjyjav',
    '4r7b8138ukjjjyjaw',
    '4r7b8138ukjjjyjax',
    '4r7b8138ukjjjyjay' ],
  { type: 'Charge', value: 1 },
  { type: 'BracketAtom', value: 'end' } ]

     */



    // Filter out brackets
    const atoms_with_tokens_no_brackets = _.cloneDeep(atoms_with_tokens).filter(
        (row) => {
            if (undefined !== row.type && (row.type === "BracketAtom")) {
                return false
            }
            return true
        }
    )

    // [O+]
    console.log(atoms_with_tokens_no_brackets)
   // console.log(oplus)
    /*
[ [ 'C',
    6,
    4,
    4,
    0,
    '4r7b81s1gkjqmv8or',
    '4r7b81s1gkjqmv8os',
    '4r7b81s1gkjqmv8ot',
    '4r7b81s1gkjqmv8ou' ],
  [ 'C',
    6,
    4,
    4,
    0,
    '4r7b81s1gkjqmv8ov',
    '4r7b81s1gkjqmv8ow',
    '4r7b81s1gkjqmv8ox',
    '4r7b81s1gkjqmv8oy' ],
  { type: 'Branch', value: 'begin' },
  [ 'C',
    6,
    4,
    4,
    0,
    '4r7b81s1gkjqmv8oz',
    '4r7b81s1gkjqmv8p0',
    '4r7b81s1gkjqmv8p1',
    '4r7b81s1gkjqmv8p2' ],
  [ 'C',
    6,
    4,
    4,
    0,
    '4r7b81s1gkjqmv8p3',
    '4r7b81s1gkjqmv8p4',
    '4r7b81s1gkjqmv8p5',
    '4r7b81s1gkjqmv8p6' ],
  { type: 'Ringbond', value: 1 },
  { type: 'Bond', value: '=' },
  [ 'C',
    6,
    4,
    4,
    0,
    '4r7b81s1gkjqmv8p7',
    '4r7b81s1gkjqmv8p8',
    '4r7b81s1gkjqmv8p9',
    '4r7b81s1gkjqmv8pa' ],
  [ 'C',
    6,
    4,
    4,
    0,
    '4r7b81s1gkjqmv8pb',
    '4r7b81s1gkjqmv8pc',
    '4r7b81s1gkjqmv8pd',
    '4r7b81s1gkjqmv8pe' ],
  { type: 'Bond', value: '=' },
  [ 'C',
    6,
    4,
    4,
    0,
    '4r7b81s1gkjqmv8pf',
    '4r7b81s1gkjqmv8pg',
    '4r7b81s1gkjqmv8ph',
    '4r7b81s1gkjqmv8pi' ],
  [ 'C',
    6,
    4,
    4,
    0,
    '4r7b81s1gkjqmv8pj',
    '4r7b81s1gkjqmv8pk',
    '4r7b81s1gkjqmv8pl',
    '4r7b81s1gkjqmv8pm' ],
  { type: 'Bond', value: '=' },
  [ 'C',
    6,
    4,
    4,
    0,
    '4r7b81s1gkjqmv8pn',
    '4r7b81s1gkjqmv8po',
    '4r7b81s1gkjqmv8pp',
    '4r7b81s1gkjqmv8pq' ],
  { type: 'Ringbond', value: 1 },
  { type: 'Branch', value: 'end' },
  [ 'N',
    7,
    5,
    3,
    0,
    '4r7b81s1gkjqmv8pr',
    '4r7b81s1gkjqmv8ps',
    '4r7b81s1gkjqmv8pt',
    '4r7b81s1gkjqmv8pu',
    '4r7b81s1gkjqmv8pv' ],
  [ 'C',
    6,
    4,
    4,
    0,
    '4r7b81s1gkjqmv8pw',
    '4r7b81s1gkjqmv8px',
    '4r7b81s1gkjqmv8py',
    '4r7b81s1gkjqmv8pz' ] ]
/Users/kevindavies/Development/chemcalc2/Models/AtomsFactory.js:108
    console.log(oplus)

     */


    // Add the bonds and branches
    let branch_number = 0

    // tracker
    // last row is current parent with available valence electrons
    const tracker = []
    const used_electrons = []
    const branch_tracker = {}
    let is_new_branch = false

    const atoms_with_bonds = _.cloneDeep(atoms_with_tokens_no_brackets).map(
        (row, index, processed_atoms) => {
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

                const bond_type = processed_atoms[index -1].type === "Bond"
                && processed_atoms[index -1].value === "="? "=":(processed_atoms[index -1].type === "Bond"
                    && processed_atoms[index -1].value === "#"?"#":"")
                // Shared electrons
                const current_atom_electrons_to_share = []
                current_atom_electrons_to_share.push(getFreeElectron(used_electrons, row, index )) // row[row.length-1]
                used_electrons.push(current_atom_electrons_to_share[0])
                const  parent_electrons_to_share = []
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
                // Push electrons to current atom

                row.push(parent_electrons_to_share[0])

                if ( bond_type === "=" ) {
                    row.push(parent_electrons_to_share[1])
                }

                if ( bond_type === "#" ) {
                    row.push(parent_electrons_to_share[1])
                    row.push(parent_electrons_to_share[2])
                }

                // Push electrons to parent atom
                processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[0])

                if ( bond_type === "=" ) {
                    processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[1])
                }

                if ( bond_type === "#" ) {
                    processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[1])
                    processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[2])
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
                tracker.push([ tracker_index, ...atoms_with_tokens_no_brackets[tracker_index].slice(5)])
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



    // [O+]
   //  console.log(atoms_with_bonds)
   //  console.log(oplus)
    /*
    [ [ 'O',
    8,
    6,
    2,
    0,
    '4r7b813cxkjjk6d2p',
    '4r7b813cxkjjk6d2q',
    '4r7b813cxkjjk6d2r',
    '4r7b813cxkjjk6d2s',
    '4r7b813cxkjjk6d2t',
    '4r7b813cxkjjk6d2u' ],
  { type: 'Charge', value: 1 } ]
     */

    // Remove bonds using filter
// @todo
    const atoms = _.cloneDeep(atoms_with_bonds).filter(
        (row) => {
            return row.type !== 'Bond'
        }
    )


    // [O+]
    // console.log(atoms)
    // console.log(oplus)
    /*
    [ [ 'O',
    8,
    6,
    2,
    0,
    '4r7b813d9kjjk7r82',
    '4r7b813d9kjjk7r83',
    '4r7b813d9kjjk7r84',
    '4r7b813d9kjjk7r85',
    '4r7b813d9kjjk7r86',
    '4r7b813d9kjjk7r87' ],
  { type: 'Charge', value: 1 } ]
     */

    let ring_bond_atom_index = null

    const free_electrons = (atoms, current_atom_index) => {
        const atom_electrons = atoms[current_atom_index].slice(5)
        const electron_haystack = atoms.reduce(
            (carry, __atom, __atom_index) => {
                if (__atom.type !== undefined || current_atom_index === __atom_index) {
                    return carry
                }
                return [...carry, ...__atom.slice(5)]
            },
            []
        )
        const free_electrons = atom_electrons.filter(
            (electron) => {
                return electron_haystack.indexOf(electron) === -1
            }
        )
        free_electrons.should
        return free_electrons
    }

    console.log(ringbondssss)

    (atoms).map(
        (current, index) => {
            if (current.type === "Ringbond") {
                const current_atom_index = index - 1
                if (ring_bond_atom_index === null) {
                    ring_bond_atom_index = current_atom_index
                } else {
                    // @todo sub rings
                    // Close the ring
                    const parent_atom_free_electrons = free_electrons(atoms, ring_bond_atom_index)
                    parent_atom_free_electrons.should.be.an.Array()
                    parent_atom_free_electrons.length.should.be.greaterThan(0)
                    parent_atom_free_electrons[0].should.be.an.String()
                    const child_atom_free_electrons =  free_electrons(atoms, current_atom_index)
                    child_atom_free_electrons.should.be.an.Array()
                    child_atom_free_electrons.length.should.be.greaterThan(0)
                    child_atom_free_electrons[0].should.be.an.String()
                    atoms[current_atom_index].push(parent_atom_free_electrons[0])
                    atoms[ring_bond_atom_index].push(child_atom_free_electrons[0])
                    ring_bond_atom_index = null
                }
            }
            return current
        }, []
    )

    const atoms_with_ring_bonds = _.cloneDeep(atoms).filter((atom)=>{
       return atom.type !== "Ringbond"
    })


    // [O+]
   //  console.log(atoms_with_ring_bonds)
   //  console.log(oplus)
    /*
    [ [ 'O',
    8,
    6,
    2,
    0,
    '4r7b813dfkjjk9rlq',
    '4r7b813dfkjjk9rlr',
    '4r7b813dfkjjk9rls',
    '4r7b813dfkjjk9rlt',
    '4r7b813dfkjjk9rlu',
    '4r7b813dfkjjk9rlv' ],
  { type: 'Charge', value: 1 } ]
     */

    //console.log(atoms_with_ring_bonds)
    //const mmolecule = [[12345,atoms_with_ring_bonds],1]

    /*
    atoms_with_ring_bonds.map(
        (atom, index) => {
            const c =  CAtom(atoms_with_ring_bonds[index], index, mmolecule)
            console.log ("Index: " + index + " Bonds: " + c.bondCount() +  " " + c.doubleBondCount())
        }
    )
*/





    const atoms_with_hydrogen_counts = _.cloneDeep(atoms_with_ring_bonds).reduce(
        (carry, current, index, atoms) => {
            if (undefined === current.type || current.type === 'Charge') {
                if (undefined !== atoms[index+1] && atoms[index+1].type === "HydrogenCount") {
                    current.push(atoms[index+1].value)
                }
                carry.push(current)
            }
            return carry
        }, []
    )

    // [CH5+]
   //  console.log(atoms_with_hydrogen_counts)
    // console.log(oplus)
    /*
    [ [ 'C',
    6,
    4,
    4,
    0,
    '4r7b815ltkjkguxld',
    '4r7b815ltkjkguxle',
    '4r7b815ltkjkguxlf',
    '4r7b815ltkjkguxlg',
    5 ],
  { type: 'Charge', value: 1 } ]


     */

    const atoms_with_charges = _.cloneDeep(atoms_with_hydrogen_counts).reduce(
        (carry, current, index, atoms) => {
            if (typeof current[0]==="string") {
                if (undefined !== atoms[index+1] && atoms[index+1].type === "Charge") {
                    current[4] =  atoms[index+1].value === 1 ? "+":"-"
                }
                carry.push(current)
            }
            return carry
        }, []
    )

    // [CH5+]
    // console.log(atoms_with_charges)
    // console.log(oplus)
    /*
    [ [ 'C',
    6,
    4,
    4,
    '+',
    '4r7b815m7kjkgw5in',
    '4r7b815m7kjkgw5io',
    '4r7b815m7kjkgw5ip',
    '4r7b815m7kjkgw5iq',
    5 ] ]

     */

   //const molecule3 = [[12345,atoms_with_charges],1]
   //console.log(VMolecule(molecule3).compressed())
   // console.log(qwe)

    // Add hydrogens
    const molecule = [[12345,atoms_with_charges],1]
    const atoms_with_hydrogens = _.cloneDeep(atoms_with_charges).reduce(
        (carry, current, index, arr) => {

            if (typeof current.length === "number" && current[0]!=='H') { // we have an atom
                // if last element of atom is a number then this is the number of hydrogens
                let number_of_hydrogens_required = 0
                let valence_electrons = []
                if (typeof current[current.length-1] === "number") {
                    number_of_hydrogens_required = current[current.length-1]
                    current.pop()
                    valence_electrons = current.slice(5)
                } else {

                    if (current[0] === "Hg" || current[0] === "Ac") {
                        number_of_hydrogens_required = 0
                    } else {


                        // Check how many bonds it currently has
                        valence_electrons = current.slice(5)
                        // Check each valence electron to see if it is being shared
                        const catom = CAtom(_.cloneDeep(current), index, molecule)

                        const actual_number_of_bonds = catom.bondCount() - catom.doubleBondCount() + (catom.doubleBondCount() * 2)  - catom.tripleBondCount() + (catom.tripleBond() * 3)


                        // current[3] is the number of electrons the atom has when it is neutrally charged
                        number_of_hydrogens_required = current[3] - actual_number_of_bonds + (current[4]) // current[4] is the charge

                     //   console.log("Index: " + index + " Bond count: " + actual_number_of_bonds + " Hydrogens req: " + number_of_hydrogens_required)
                    }
                }

                if (number_of_hydrogens_required > 0) {
                    range.range(0, number_of_hydrogens_required,1).map(
                        (e_index) => {
                            if (undefined !== valence_electrons[e_index]) {
                                const hydrogen = AtomFactory('H', 0)
                                hydrogen.push(valence_electrons[e_index])
                                current.push(hydrogen[hydrogen.length - 2])
                                carry.push(hydrogen)
                            } else {
                               // console.log(valence_electrons)
                               // console.log('Valence electron not found:' + e_index)
                            }
                        }
                    )
                }
            }
            carry.push(current)
            return carry
        },
        []
    )


    // [CH5+]
  // console.log(atoms_with_hydrogens)
  // console.log(oplus)
    /*
    [ [ 'O',
    8,
    6,
    2,
    '+',
    '4r7b813elkjjkg4q2',
    '4r7b813elkjjkg4q3',
    '4r7b813elkjjkg4q4',
    '4r7b813elkjjkg4q5',
    '4r7b813elkjjkg4q6',
    '4r7b813elkjjkg4q7' ] ]

     */

    // const molecule2 = [[12345,atoms_with_hydrogens],1]
    // console.log(VMolecule(molecule2).compressed())
    //console.log(oikk)

    const atoms_electrons_checked = atoms_with_hydrogens.map((atom, index)=>{
        const o_atom = CAtom(atom, index, [['12345', atoms_with_hydrogens], 1])

        const bond_count = o_atom.indexedBonds("").length + o_atom.indexedDoubleBonds("").length + o_atom.indexedTripleBonds("").length
        const free_electrons = o_atom.freeElectrons()
        const electrons = atom.slice(5)

        if (atom[4] === "" || atom[4] === 0) {
            switch(atom[0]) {
                case "O":
                    if (bond_count ===3){
                        if (o_atom.hydrogens().length > 0) {
                            // Remove a hydrogen
                            const h_bonds = o_atom.indexedBonds("").filter((bond)=>{
                                return bond.atom[0] === "H"
                            })
                            _.remove(atom, (electron)=>{
                                return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                            })
                            atom.push(uniqid())
                        }
                    }
                    break;
                case "N":
                    if (bond_count ===4){
                        if (o_atom.hydrogens().length > 0) {
                            // Remove a hydrogen
                            const h_bonds = o_atom.indexedBonds("").filter((bond)=>{
                                return bond.atom[0] === "H"
                            })
                            _.remove(atom, (electron)=>{
                                return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                            })
                            atom.push(uniqid())
                        }
                    }
                    break;
                case "C":
                    // console.log('Bond count on C:'+bond_count+" " + index)
                    if (bond_count ===5){
                        if (o_atom.hydrogens().length > 0) {
                            // Remove a hydrogen
                            const h_bonds = o_atom.indexedBonds("").filter((bond)=>{
                                return bond.atom[0] === "H"
                            })
                            _.remove(atom, (electron)=>{
                                return electron === h_bonds[0].shared_electrons[0] || electron === h_bonds[0].shared_electrons[1]
                            })
                            atom.push(uniqid())
                        }
                    }
                    if (bond_count === 4) {
                        if (o_atom.freeElectrons().length !== 0) {
                            console.log(o_atom.indexedBonds(""))
                            o_atom.indexedBonds("").map((bond)=>{
                                console.log("Bond type:"+bond.bond_type)
                                console.log(bond.shared_electrons)
                                return bond
                            })
                            // console.log(atom)
                            console.log(jjklkjkl)
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
                    if (6 + bond_count === electrons.length) {
                        atom.push(uniqid())
                    }
                    break
                case "N":
                    if (5 + bond_count === electrons.length) {
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
        return atom
    })

   // const molecule4 = [[12345,atoms_electrons_checked],1]
   // console.log(VMolecule(molecule4).compressed())

    //console.log(atomsfactoryyy)
    /*
    console.log(atoms_with_hydrogens.filter((atom)=>{
        return atom[0] === "H"
    }).length)
    console.log("AtomsFactory.js")
    process.exit()
*/
    //  atomic symbol, proton count, valence count, number of bonds, charge, velectron1, velectron2, velectron3
    return atoms_electrons_checked

}

module.exports = AtomsFactory










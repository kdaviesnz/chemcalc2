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

    //[CH2]
    // console.log(smiles_tokens)
    /*
    [
  { type: 'BracketAtom', value: 'begin' },
  { type: 'ElementSymbol', value: 'C' },
  { type: 'HydrogenCount', value: 2 },
  { type: 'BracketAtom', value: 'end' }
]

     */
    const atoms_with_tokens = _.cloneDeep(smiles_tokens).map(
        (row, i, arr) => {
            if (row.type === "AliphaticOrganic" || row.type === "ElementSymbol") {
             //   const charge = undefined !== arr[i+1] && arr[i+1]['type']==='Charge'?arr[i+1]['value']*1:0
                return AtomFactory(row.value, 0)
            }
            return row
        }
    )

    // [CH2]
    // console.log(atoms_with_tokens)
  /*
[
  { type: 'BracketAtom', value: 'begin' },
  [
    'C',
    6,
    4,
    4,
    0,
    '2yyvqtf2aunko9hbud5',
    '2yyvqtf2aunko9hbud6',
    '2yyvqtf2aunko9hbud7',
    '2yyvqtf2aunko9hbud8'
  ],
  { type: 'HydrogenCount', value: 2 },
  { type: 'BracketAtom', value: 'end' }
]
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

    // [CH2]
    // console.log(atoms_with_tokens_no_brackets)
    /*
     // atomic symbol, proton count, valence count,  number of bonds, velectron1, velectron2, velectron3 ...
[
  [
    'C',
    6,
    4,
    4,
    0,
    '2yyvqtf2axako9hdlq1',
    '2yyvqtf2axako9hdlq2',
    '2yyvqtf2axako9hdlq3',
    '2yyvqtf2axako9hdlq4'
  ],
  { type: 'HydrogenCount', value: 2 }
]
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



    // [CH2]
    // console.log(atoms_with_bonds)
    /*
[
  [
    'C',
    6,
    4,
    4,
    0,
    '2yyvqtf2b1eko9hjmzb',
    '2yyvqtf2b1eko9hjmzc',
    '2yyvqtf2b1eko9hjmzd',
    '2yyvqtf2b1eko9hjmze'
  ],
  { type: 'HydrogenCount', value: 2 }
]

     */

    // Remove bonds using filter
// @todo
    const atoms = _.cloneDeep(atoms_with_bonds).filter(
        (row) => {
            return row.type !== 'Bond'
        }
    )

    // [CH2]
    // console.log(atoms)
    /*
[
  [
    'C',
    6,
    4,
    4,
    0,
    '2yyvqtf2b1eko9hjmzb',
    '2yyvqtf2b1eko9hjmzc',
    '2yyvqtf2b1eko9hjmzd',
    '2yyvqtf2b1eko9hjmze'
  ],
  { type: 'HydrogenCount', value: 2 }
]

     */

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
        const parent_atom = CAtom(m[0][1][indexes[0]], indexes[0], m)
        const child_atom = CAtom(m[0][1][indexes[1]], indexes[1], m)
        const parent_free_electrons = parent_atom.freeElectrons()
        const child_free_electrons = child_atom.freeElectrons()
        //// console.log(parent_free_electrons) // [ 'bqdtz0rmfkkhrfctm' ]
        //// console.log(child_free_electrons) // [ 'bqdtz0rmfkkhrfcu6', 'bqdtz0rmfkkhrfcu7' ]
        atoms[indexes[0]].push(child_free_electrons[0])
        atoms[indexes[1]].push(parent_free_electrons[0])
        //// console.log(parent_atom.indexedBonds(""))
        //// console.log(child_atom.indexedBonds(""))
        return indexes
    })


    const atoms_with_ring_bonds = _.cloneDeep(atoms).filter((atom)=>{
       return atom.type !== "Ringbond"
    })

    // [CH2]
    // console.log(atoms_with_ring_bonds)
    /*
    [
  [
    'C',
    6,
    4,
    4,
    0,
    '2yyvqtf2b36ko9hlpky',
    '2yyvqtf2b36ko9hlpkz',
    '2yyvqtf2b36ko9hlpl0',
    '2yyvqtf2b36ko9hlpl1'
  ],
  { type: 'HydrogenCount', value: 2 }
]

     */

    const atoms_with_hydrogen_counts = _.cloneDeep(atoms_with_ring_bonds)
    // [CH2]
    // console.log(atoms_with_hydrogen_counts)
    /*
    [
  [
    'C',
    6,
    4,
    4,
    0,
    '2yyvqtf2b5zko9hs0qm',
    '2yyvqtf2b5zko9hs0qn',
    '2yyvqtf2b5zko9hs0qo',
    '2yyvqtf2b5zko9hs0qp'
  ],
  { type: 'HydrogenCount', value: 2 }
]
     */
   // const molecule_with_hydrogen_counts = [[12345,atoms_with_hydrogen_counts],1]


    const atoms_with_charges = _.cloneDeep(atoms_with_hydrogen_counts).reduce(
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

    //console.log(atoms_with_charges)
    //process.error()
    // [NH4+]
    /*
[
  [
    'O',
    8,
    6,
    2,
    0,
    '2yyvqtf44gkoddrx1e',
    '2yyvqtf44gkoddrx1f',
    '2yyvqtf44gkoddrx1g',
    '2yyvqtf44gkoddrx1h',
    '2yyvqtf44gkoddrx1i',
    '2yyvqtf44gkoddrx1j'
  ],
  { type: 'HydrogenCount', value: 3 }
]

     */


    // Add hydrogens
    const molecule = [[12345,atoms_with_charges],1]
    const atoms_with_hydrogens = _.cloneDeep(atoms_with_charges).reduce(
        (carry, current, index, arr) => {

            if (typeof current.length === "number" && current[0]!=='H') { // we have an atom

                const catom = CAtom(_.cloneDeep(current), index, molecule)

                const free_electrons = catom.freeElectrons()

                if (atoms_with_charges[index+1] !== undefined && atoms_with_charges[index+1]['type'] !== undefined && atoms_with_charges[index+1]['type'] === "HydrogenCount") {
                    range.range(0, atoms_with_charges[index+1]['value'],1).map(
                        (e_index) => {
                            if (undefined !== free_electrons[e_index]) {
                                const hydrogen = AtomFactory('H', "")
                                hydrogen.push(free_electrons[e_index])
                                current.push(hydrogen[hydrogen.length - 2])
                                carry.push(hydrogen)
                            } else {
                            }
                        }
                    )
                }  else {


                    let number_of_hydrogens_required = 0
                    if (current[0] === "Hg" || current[0] === "Ac") {
                        number_of_hydrogens_required = 0
                    } else {
                        number_of_hydrogens_required = free_electrons.length
                    }

                    if (number_of_hydrogens_required > 0) {
                        const offset_map = {
                            "O":4,
                            "N":2,
                            "C":0,
                        }
                        range.range(0, number_of_hydrogens_required - offset_map[current[0]],1).map(
                            (e_index) => {
                                if (undefined !== free_electrons[e_index]) {
                                    const hydrogen = AtomFactory('H', "")
                                    hydrogen.push(free_electrons[e_index])
                                    current.push(hydrogen[hydrogen.length - 2])
                                    carry.push(hydrogen)
                                } else {
                                }
                            }
                        )
                    }


                }

            }

            if(current['type'] === undefined) {
                carry.push(current)
            }
            return carry
        },
        []
    )


    // [NH4+]
  //  console.log(atoms_with_hydrogens)
//    process.error()
  /*
[
  [ 'H', 1, 1, 1, '', '2yyvqtf7eukodgfth2', '2yyvqtf7eukodgftgx' ],
  [ 'H', 1, 1, 1, '', '2yyvqtf7eukodgfth3', '2yyvqtf7eukodgftgy' ],
  [ 'H', 1, 1, 1, '', '2yyvqtf7eukodgfth4', '2yyvqtf7eukodgftgz' ],
  [ 'H', 1, 1, 1, '', '2yyvqtf7eukodgfth5', '2yyvqtf7eukodgfth0' ],
  [
    'N',
    7,
    5,
    3,
    0,
    '2yyvqtf7eukodgftgx',
    '2yyvqtf7eukodgftgy',
    '2yyvqtf7eukodgftgz',
    '2yyvqtf7eukodgfth0',
    '2yyvqtf7eukodgfth1',
    '2yyvqtf7eukodgfth2',
    '2yyvqtf7eukodgfth3',
    '2yyvqtf7eukodgfth4',
    '2yyvqtf7eukodgfth5'
  ]
]

     */

    const atoms_electrons_checked = atoms_with_hydrogens.map((atom, index)=>{
        const o_atom = CAtom(atom, index, [['12345', atoms_with_hydrogens], 1])

        const bond_count = o_atom.indexedBonds("").length + o_atom.indexedDoubleBonds("").length + o_atom.indexedTripleBonds("").length
        const free_electrons = o_atom.freeElectrons()
        const electrons = atom.slice(5)

        if (atom[4] === "" || atom[4] === 0) {
            switch(atom[0]) {
                case "O":
                    if (bond_count > 3){
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
                    if (bond_count > 2) {
                        atom[4] = "+"
                    }
                    break;
                case "N":
                    if (bond_count >4){
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
                    if (bond_count > 3) {
                        atom[4] = "+"
                    }
                    break;
                case "C":
                    // // console.log('Bond count on C:'+bond_count+" " + index)
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
                            // // console.log(o_atom.indexedBonds(""))
                            o_atom.indexedBonds("").map((bond)=>{
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
                        const h_bonds = o_atom.indexedBonds("").filter((bond)=>{
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
                        const h_bonds = o_atom.indexedBonds("").filter((bond)=>{
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
        return atom
    })

    // Remove hydrogens with no bonds
    const atoms_with_redundant_hydrogens_removed = _.remove(atoms_electrons_checked, (atom, i)=>{
        if (atom[0] !== "H") {
            return false
        }
        const h = CAtom(atom, i, [['12345', atoms_electrons_checked], 1])
        return h.indexedBonds("").length === 0
    })

   const molecule4 = [[12345,atoms_with_redundant_hydrogens_removed],1]
   //// console.log(VMolecule(molecule4).compressed())

    const moleculeAI = require("../Components/Stateless/MoleculeAI")(molecule4)
    moleculeAI.validateMolecule()

   //// console.log(atomsfactoryyy)

    /*
    // // console.log(atoms_with_hydrogens.filter((atom)=>{
        return atom[0] === "H"
    }).length)
    // // console.log("AtomsFactory.js")
    process.exit()
*/
    //  atomic symbol, proton count, valence count, number of bonds, charge, velectron1, velectron2, velectron3
    //console.log("[NH4+]")
    //console.log(atoms_electrons_checked)
    //process.error()

    return atoms_electrons_checked

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
    // console.log(atomssorted)
*/
    //return atoms_sorted


}

module.exports = AtomsFactory










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

    // parse a SMILES string, returns an array of SMILES tokens [{type: '...', value: '...'}, ...]
    const smiles_tokens = smiles.parse(canonicalSMILES)


    /*
    [CH2+]C
    [
  { type: 'BracketAtom', value: 'begin' },
  { type: 'ElementSymbol', value: 'C' },
  { type: 'HydrogenCount', value: 2 },
  { type: 'Charge', value: 1 },
  { type: 'BracketAtom', value: 'end' },
  { type: 'AliphaticOrganic', value: 'C' }
]

     */
  //  console.log(smiles_tokens)
  //  process.error()
    const atoms_with_tokens = _.cloneDeep(smiles_tokens).map(
        (row, i, arr) => {
            if (row.type === "AliphaticOrganic" || row.type === "ElementSymbol") {
                return AtomFactory(row.value, 0, i+1)
            }
            return row
        }
    )

    // Check that there are no bonds
    atoms_with_tokens.map((atom)=>{
        if (atom.length !==undefined) {
            if (atom.bondCount(atoms_with_tokens.filter((a)=>{
                return a.length !==undefined
            })) !==0) {
                throw new Error("Atom should have no bonds")
            }
        }
    })

/*  [CH2+]C
[
  { type: 'BracketAtom', value: 'begin' },
  { type: 'ElementSymbol', value: 'C' },
  { type: 'HydrogenCount', value: 2 },
  { type: 'Charge', value: 1 },
  { type: 'BracketAtom', value: 'end' },
  { type: 'AliphaticOrganic', value: 'C' }
]
 */
 //  console.log(atoms_with_tokens)
 //   process.error()

    // Filter out brackets
    const w = _.cloneDeep(atoms_with_tokens).filter(
        (row) => {
            if (undefined !== row.type && (row.type === "BracketAtom")) {
                return false
            }
            return true
        }
    )

    // Filter out brackets
    const atoms_with_tokens_no_brackets = _.cloneDeep(atoms_with_tokens).filter(
        (row) => {
            if (undefined !== row.type && (row.type === "BracketAtom")) {
                return false
            }
            return true
        }
    )
    /* [CH2+]C
[
  [ 'C', 6, 4, 4, 0, 'ij2' ],
  { type: 'HydrogenCount', value: 2 },
  { type: 'Charge', value: 1 },
  [ 'C', 6, 4, 4, 0, 'ij4' ]
]
     */
   //   console.log(atoms_with_tokens_no_brackets)
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
                if ( bond_type === "=" ) {
                }
                if ( bond_type === "#") {
                }
                //processed_atoms[parent_atom_index].indexOf(parent_electrons_to_share[0]).should.not.be.equal(-1)
                Typecheck(
                    {name:"row", value:row, type:"array"},
                    {name:"tracker", value:tracker, type:"array"},
                    {name:"used_electrons", value:used_electrons, type:"array"},
                    {name:"branch_tracker", value:branch_tracker, type:"object"},
                    {name:"is_new_branch", value:is_new_branch, type:"boolean"},
                )
                // Check if we are making a coordinate or standard covalent bond
                // In a coordinate covalent bond one of the atoms donates both electrons.
                // In a standard covalent bond each atom donates an electron.
                // A coordinate covalent bond is formed if the atom already has a full octet
                // and can donate a lone pair
                processed_atoms[parent_atom_index][0].should.be.a.String()  // O, N, etc
                processed_atoms[parent_atom_index].should.be.a.Array()
                if (false) {
                    if (bond_type === "=") {
                    }
                    if (bond_type === "#") {
                    }
                    if (current_atom_electrons_to_share.length < 2 || (bond_type === "=" && current_atom_electrons_to_share.length < 4 ) | (bond_type === "#" && current_atom_electrons_to_share.length < 6 )) {
                    }
                    //row.push(current_atom_electrons_to_share[0])
                    //row.push(current_atom_electrons_to_share[1])
                    if (bond_type === "=") {
                        //row.push(current_atom_electrons_to_share[2])
                        //row.push(current_atom_electrons_to_share[3])
                    }
                    if (bond_type === "#") {
                        //row.push(current_atom_electrons_to_share[2])
                        //row.push(current_atom_electrons_to_share[3])
                        //row.push(current_atom_electrons_to_share[4])
                        //row.push(current_atom_electrons_to_share[5])
                    }
                } else if(false) {
                    if (processed_atoms[0][0] === "C" && processed_atoms[1][0] === "N") {
                        //processed_atoms[0].push(parent_electrons_to_share[0])
                    } else if(processed_atoms[0][0] === "N" && processed_atoms[1][0] === "C") {
                        //processed_atoms[1].push(parent_electrons_to_share[0])
                        //processed_atoms[1].push(parent_electrons_to_share[1])
                    } else {
                        // coordinate covalent bond - parent donates both electrons
                        if (bond_type === "=") {
                        }
                        if (bond_type === "#") {
                        }

                        if (parent_electrons_to_share.length < 2 || (bond_type === "=" && parent_electrons_to_share.length < 4) | (bond_type === "#" && parent_electrons_to_share.length < 6)) {
                            throw new Error("Parent electron does not have enough electrons to share")
                        }
                        //row.push(parent_electrons_to_share[0])
                        if (bond_type === "=") {
                            //row.push(parent_electrons_to_share[2])
                        }
                        if (bond_type === "#") {
                            //row.push(parent_electrons_to_share[2])
                            //row.push(parent_electrons_to_share[3])
                        }
                    }
                } else {
                    // Standard covalent bond - both atoms donate an electron
                    //row.push(parent_electrons_to_share[0])
                    row.bondAtomToAtom(processed_atoms[parent_atom_index], processed_atoms)
                    row[0].should.be.a.String()
                    if (bond_type === "=") {
                        //row.push(parent_electrons_to_share[1])
                        row.bondAtomToAtom(processed_atoms[parent_atom_index], processed_atoms)
                    }
                    if (bond_type === "#") {
                        //row.push(parent_electrons_to_share[1])
                        //row.push(parent_electrons_to_share[2])
                        row.bondAtomToAtom(processed_atoms[parent_atom_index], processed_atoms)
                    }
                    // Push electrons to parent atom
                    //processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[0])
                    // Done above
                    if (bond_type === "=") {
                        //processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[1])
                    }
                    if (bond_type === "#") {
                        //processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[1])
                        //processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[2])
                    }
                }
                if (undefined === branch_tracker[branch_number]) {
                    branch_tracker[branch_number] = []
                }
                branch_tracker[branch_number].push([index, row[0]])
                is_new_branch = false
                row[0].should.be.a.String()
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

    /* [CH2+]C
[
  [
    'C',   6, 4,
    4,     0, '4z1',
    '4z3'
  ],
  { type: 'HydrogenCount', value: 2 },
  { type: 'Charge', value: 1 },
  [
    'C',   6, 4,
    4,     0, '4z3',
    '4z1'
  ]
]

     */
    //console.log(atoms_with_bonds)
    //process.error()
    if(canonicalSMILES==="CN"){
        atoms_with_bonds[0].bondCount(atoms_with_bonds).should.be.equal(1)
        atoms_with_bonds[1].bondCount(atoms_with_bonds).should.be.equal(1)
    }


    // Remove bonds using filter
// @todo
    const atoms = (atoms_with_bonds).filter(
        (row) => {
            return row.type !== 'Bond'
        }
    )



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
       // const e = uniqid()
        //const m = [[12345,atoms],1]
        //const parent_atom = m[0][1][indexes[0]]
        //const child_atom = m[0][1][indexes[1]]
        //const parent_free_electrons = parent_atom.freeElectrons(m[0][1])
        //const child_free_electrons = child_atom.freeElectrons(m[0][1])
        /*
        if (child_free_electrons[0] !== undefined) {
            atoms[indexes[0]].addElectron(child_free_electrons[0])
        }
        if (parent_free_electrons[0] !== undefined) {
            atoms[indexes[1]].addElectron(parent_free_electrons[0])
        }*/
        atoms[indexes[0]].bondAtomToAtom(atoms[indexes[1]], atoms)
        return indexes

    })

    const atoms_with_ring_bonds = _.cloneDeep(atoms).filter((atom)=>{
       return atom.type !== "Ringbond"
    })

    /* [CH2+]C
[
  [
    'C',   6, 4,
    4,     0, 'byk',
    'bym'
  ],
  { type: 'HydrogenCount', value: 2 },
  { type: 'Charge', value: 1 },
  [
    'C',   6, 4,
    4,     0, 'bym',
    'byk'
  ]
]
     */
   // console.log(atoms_with_ring_bonds)
   // process.error()





    const atoms_with_hydrogen_counts = atoms_with_ring_bonds

    const atoms_with_charges = atoms_with_hydrogen_counts.reduce(
        (carry, current, index, atoms) => {
            if (current['type'] !== undefined && current['type'] === "HydrogenCount") {
                carry.push(current)
            } else if (typeof current[0]==="string") {
                if (undefined !== atoms[index+1] && atoms[index+1].type === "Charge") {
                    current[4] =  atoms[index+1].value === 1 ? "+":"-"
                } else if (undefined !== atoms[index+2] && atoms[index+2].type === "Charge") {
                    current[4] =  atoms[index+2].value === 1 ? "+":"-"
                }
                carry.push(current)
            }
            return carry
        }, []
    )

    /* [CH2+]C
[
  [
    'C',   6,   4,
    4,     '+', 'tcd',
    'tcf'
  ],
  { type: 'HydrogenCount', value: 2 },
  [
    'C',   6, 4,
    4,     0, 'tcf',
    'tcd'
  ]
]
     */
    if (canonicalSMILES === "[CH2+]C") {
        atoms_with_charges[0][4].should.be.equal("+")
    }
   // console.log(atoms_with_charges)
   // process.error()

    // Add hydrogens
    const molecule = [[12345,atoms_with_charges],1]
    const atoms_with_hydrogens = atoms_with_charges.reduce(
        (carry, current, index, arr) => {

            if (typeof current.length === "number" && current[0]!=='H') {
                // we have an atom
                // Add hydrogens where we have a hydrogen count
                if (atoms_with_charges[index+1] !== undefined && atoms_with_charges[index+1]['type'] !== undefined && atoms_with_charges[index+1]['type'] === "HydrogenCount") {
                    range.range(0, atoms_with_charges[index+1]['value'],1).map(
                        (i) => {
                            const hydrogen = AtomFactory('H', "", i + 1)
                            //hydrogen.addElectron(free_electrons[i])
                            //current.push(hydrogen[hydrogen.length - 2])
                            current.bondAtomToAtom(hydrogen, atoms_with_charges)
                            carry.addAtom(hydrogen)
                        }
                    )
                }  else {
                    // @todo assumes atom is one of C,N,O
                    const offset_map = {
                        "O": 6,
                        "N": 5,
                        "C": 4,
                    }
                   // console.log(current)
                    //let number_of_hydrogens_req = Constants().max_valence_electrons[current[0]] - (offset_map[current[0]] + current.indexedBonds(atoms_with_charges).length)
                    let number_of_hydrogens_req = current.neutralAtomMaxNumberOfBonds()  - current.bondCount(atoms_with_charges)

                    if (current[4] === "+") {
                        number_of_hydrogens_req = number_of_hydrogens_req + 1
                    } else if (current[4] === "-") {
                        number_of_hydrogens_req = number_of_hydrogens_req - 1
                    }
                    range.range(0, number_of_hydrogens_req, 1).map(
                        (e_index) => {
                            const hydrogen = AtomFactory('H', "", e_index + 1)
                            //hydrogen.addElectron(free_electrons[e_index])
                            //current.addElectron(hydrogen[hydrogen.length - 2])
                            current.bondAtomToAtom(hydrogen, atoms_with_charges)
                            carry.addAtom(hydrogen)
                        }
                    )
                }
            }
            if(current['type'] === undefined) {
                carry.addAtom(current)
            }
            return carry
        },
        []
    )

    /* CN
[
  [
    'H',   1,  1,
    1,     '', 'c2c',
    'c1z'
  ],
  [
    'H',   1,  1,
    1,     '', 'c2e',
    'c1z'
  ],
  [
    'H',   1,  1,
    1,     '', 'c2g',
    'c1z'
  ],
  [
    'C',   6,     4,
    4,     0,     'c1z',
    'c21', 'c2c', 'c2e',
    'c2g'
  ],
  [
    'H',   1,  1,
    1,     '', 'c2m',
    'c21'
  ],
  [
    'H',   1,  1,
    1,     '', 'c2o',
    'c21'
  ],
  [
    'N',   7,     5,
    3,     0,     'c21',
    'c1z', 'c2m', 'c2o'
  ]
]

     */

    // Check each hydrogen only has one bond
    atoms_with_hydrogens.map((atom)=>{
        if (atom[0]==="H") {
            atom.bondCount(atoms_with_hydrogens).should.be.equal(1)
        }
    })

//  console.log(atoms_with_hydrogens)
  // process.error()




//       const molecule4 = [[12345,atoms_with_redundant_hydrogens_removed],1]
   //// console.log(VMolecule(molecule4).compressed())

  //const moleculeAI = require("../Components/Stateless/MoleculeAI")(molecule4)
   // moleculeAI.validateMolecule()

     //console.log(VMolecule(molecule4).compressed())
      //process.error()

    return atoms_with_hydrogens

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










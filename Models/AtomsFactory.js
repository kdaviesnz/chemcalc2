const uniqid = require('uniqid')
const AtomFactory = require('./AtomFactory')
const CAtom = require('../Controllers/Atom')
const CMolecule = require('../Controllers/Molecule')
const range = require("range");
// range.range(1,10,2)
const Set = require('./Set')
const _ = require('lodash');

const AtomsFactory = (canonicalSMILES, verbose) => {

    // https://www.npmjs.com/package/smiles
    const smiles = require('smiles')

    const getFreeElectron = (used_electrons, atom, atom_index ) => {
        const electrons = atom.slice(5).filter(
            (electron) => {
                return used_electrons.indexOf(electron) === -1
            }
        )

        return electrons.pop()
    }

    // parse a SMILES string, returns an array of SMILES tokens [{type: '...', value: '...'}, ...]
    const smiles_tokens = smiles.parse(canonicalSMILES)
    //const smiles_tokens = smiles.parse(canonicalSMILES)




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




    // Filter out brackets
    const atoms_with_tokens_no_brackets = _.cloneDeep(atoms_with_tokens).filter(
        (row) => {
            if (undefined !== row.type && (row.type === "BracketAtom")) {
                return false
            }
            return true
        }
    )




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
                && processed_atoms[index -1].value === "="? "=":""
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
                processed_atoms[parent_atom_index].indexOf(parent_electrons_to_share[0]).should.not.be.equal(-1)
                // Push electrons to current atom

                row.push(parent_electrons_to_share[0])

                if ( bond_type === "=" ) {
                    row.push(parent_electrons_to_share[1])
                }
                // Push electrons to parent atom
                processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[0])
                if ( bond_type === "=" ) {
                    processed_atoms[parent_atom_index].push(current_atom_electrons_to_share[1])
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


    // Remove bonds using filter
// @todo
    const atoms = _.cloneDeep(atoms_with_bonds).filter(
        (row) => {
            return row.type !== 'Bond'
        }
    )



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
        return free_electrons
    }

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

    const atoms_with_charges = _.cloneDeep(atoms_with_hydrogen_counts).reduce(
        (carry, current, index, atoms) => {
            if (typeof current[0]==="string") {
                if (undefined !== atoms[index+1] && atoms[index+1].type === "Charge") {
                    current[4] =  atoms[index+1].value === 1 ? "+":-1
                }
                carry.push(current)
            }
            return carry
        }, []
    )

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
                    // Check how many bonds it currently has
                    valence_electrons = current.slice(5)
                    // Check each valence electron to see if it is being shared
                    const catom = CAtom(_.cloneDeep(current), index, molecule)
                   // const actual_number_of_bonds = catom.indexedBonds("").length + (catom.indexedDoubleBonds("").length * 2)
                  //  console.log(current[0])
                   // console.log(catom.indexedBonds(""))
                    /*
[C1=CC=C(C=C1)CO]
Index: 0 Bonds: 2 1
Index: 1 Bonds: 2 1
Index: 2 Bonds: 2 1
Index: 3 Bonds: 3 1
Index: 4 Bonds: 2 1
Index: 5 Bonds: 2 1
Index: 6 Bonds: 2 0
Index: 7 Bonds: 1 0
 */
                    const actual_number_of_bonds = catom.bondCount() - catom.doubleBondCount() + (catom.doubleBondCount() * 2)

                    // current[3] is the number of electrons the atom has when it is neutrally charged
                    number_of_hydrogens_required = current[3] - actual_number_of_bonds + (current[4]) // current[4] is the charge

                   // console.log("Index: " + index + " Bond count: " + actual_number_of_bonds + " Hydrogens req: " + number_of_hydrogens_required)
                }
             //   console.log(number_of_hydrogens_required)
                if (number_of_hydrogens_required > 0) {
                    range.range(0, number_of_hydrogens_required,1).map(
                        (e_index) => {
                            const hydrogen = AtomFactory('H', 0)
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

    /*
    console.log(atoms_with_hydrogens.filter((atom)=>{
        return atom[0] === "H"
    }).length)
    console.log("AtomsFactory.js")
    process.exit()
*/
    //  atomic symbol, proton count, valence count, number of bonds, charge, velectron1, velectron2, velectron3
    return atoms_with_hydrogens

}

module.exports = AtomsFactory










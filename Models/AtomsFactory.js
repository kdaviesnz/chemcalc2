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


    // [Cl-]
    /*
    [ { type: 'BracketAtom', value: 'begin' },
  { type: 'ElementSymbol', value: 'Cl' },
  { type: 'Charge', value: -1 },
  { type: 'BracketAtom', value: 'end' } ]
     */
    const atoms_with_tokens = _.cloneDeep(smiles_tokens).map(
        (row, i, arr) => {
            if (row.type === "AliphaticOrganic" || row.type === "ElementSymbol") {
                const charge = undefined !== arr[i+1] && arr[i+1]['type']==='Charge'?arr[i+1]['value']*1:0
                return AtomFactory(row.value, charge)
            }
            return row
        }
    )

    // Filter out brackets
    const atoms_with_tokens_no_brackets = _.cloneDeep(atoms_with_tokens).filter(
        (row) => {
            if (undefined !== row.type && (row.type === "BracketAtom" || row.type === "Charge")) {
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

                if (typeof processed_atoms[processed_atoms.length -2][0] === "string") {
                    processed_atoms[processed_atoms.length -2].push(row.value)
                }
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


    // Add hydrogens
    const atoms_with_hydrogens = _.cloneDeep(atoms).reduce(
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
                    const actual_number_of_bonds = CMolecule([atoms, 1]).bondCount(current)
                    // current[3] is the number of electrons the atom has when it is neutrally charged
                    number_of_hydrogens_required = current[3] - actual_number_of_bonds + (current[4]) // current[4] is the charge
                }
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
    //  atomic symbol, proton count, valence count, number of bonds, charge, velectron1, velectron2, velectron3

    return atoms_with_hydrogens

}

module.exports = AtomsFactory










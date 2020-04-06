const uniqid = require('uniqid')

const AtomsFactory = (canonical_SMILES) => {

    // https://www.npmjs.com/package/smiles
    const smiles = require('smiles')

    // parse a SMILES string, returns an array of SMILES tokens [{type: '...', value: '...'}, ...]
    const t = smiles.parse('C1OC2=C(O1)C=C(C=C2)CC(=O)O')

    //  Convert rows to atom objects
    const ta = t.map(
        (row, i, arr) => {
            return row.type === "AliphaticOrganic"?AtomFactory(row.value):
                (
                    row.type === "Ringbond"? arr[i-1].addRingBond(row.value, arr[i-1].branchId) : (
                        row.type === "Bond"? arr[i-1].addBond(row.value): (
                            row.type === "Branch"? (
                                row.value === "end"?arr[i-1].isTerminal(true):
                                    arr[i-1].startNewBranch() // add new branch id to current atom
                            ): row
                        )
                    )
                )
        }
    )

    // Remove rows that are Branch, Ringbond or Bond
    const atoms_only = ta.filter(
        (row) => {
            return row.atomicSymbol !== undefined
        }
    )

    const atoms_indexed = atoms_only.reduce(
        (carry, atom, i) => {
            carry[uniqid()] = atom
            return carry
        },
        {}
    )
// Add unique ids as indexes
        /*
        Array (27 items)
        0: Object {type: "AliphaticOrganic", value: "C"}
        1: Object {type: "Ringbond", value: 1}
        2: Object {type: "AliphaticOrganic", value: "O"}
        3: Object {type: "AliphaticOrganic", value: "C"}
        4: Object {type: "Ringbond", value: 2}
        5: Object {type: "Bond", value: "="}
        6: Object {type: "AliphaticOrganic", value: "C"}
        7: Object {type: "Branch", value: "begin"}
        8: Object {type: "AliphaticOrganic", value: "O"}
        9: Object {type: "Ringbond", value: 1}
        10: Object {type: "Branch", value: "end"}
        11: Object {type: "AliphaticOrganic", value: "C"}
        12: Object {type: "Bond", value: "="}
        13: Object {type: "AliphaticOrganic", value: "C"}
        14: Object {type: "Branch", value: "begin"}
        15: Object {type: "AliphaticOrganic", value: "C"}
        16: Object {type: "Bond", value: "="}
        17: Object {type: "AliphaticOrganic", value: "C"}
        18: Object {type: "Ringbond", value: 2}
        19: Object {type: "Branch", value: "end"}
        20: Object {type: "AliphaticOrganic", value:
        "C"}
        21: Object {type: "AliphaticOrganic", value: "C"}
        22: Object {type: "Branch", value: "begin"}
        23: Object {type: "Bond", value: "="}
        24: Object {type: "AliphaticOrganic", value: "O"}
        25: Object {type: "Branch", value: "end"}
        26: Object {type: "AliphaticOrganic", value: "O"}
         */
// serializes an array of SMILES tokens into a SMILES string
    const smilesString = smiles.serialize(tokens)


    const AtomFactory = require("./AtomFactory")
    const uniqid = require('uniqid');

    const Canonical_SMILESParser = require("../CanonicalSMILESParser")
    const parsed = Canonical_SMILESParser(canonical_SMILES)
    const tokens = parsed.tokens

    const addProtonsRecursive = (atom, protons_added_count, max_number_protons_to_add)=> {

        if (protons_added_count===max_number_protons_to_add){
            return atom
        }

        const atom_with_proton_added = AtomFactory(atom.atomicSymbol, atom.outer_shell_electrons, atom.protons.push({__id:uniqid()}), atom.__id)

        return addProtonsRecursive (atom_with_proton_added, protons_added_count+1, max_number_protons_to_add)

    }


    const previousRingBondIndex = (tokens, currentIndex, value_to_match) => {
        // Get the index of the previous ringbond
        // We do this by recursively searching up the tokens.
        return currentIndex === 0 ? null
            :(
                undefined !== tokens[currentIndex - 1].type && tokens[currentIndex - 1].type === 'Ringbond' && tokens[currentIndex - 1].value === value_to_match ? currentIndex - 1
                    :previousRingBondIndex(tokens, currentIndex - 1, value_to_match)
            )
    }

    const addRef = (ref, atom, bonded_atom) => {
        let ref_not_added = true;
        const outer_shell_electrons = atom.outer_shell_electrons.map(
            (outer_shell_electron) => {
                if (undefined === outer_shell_electron.ref && ref_not_added) {
                    outer_shell_electron.ref = ref
                    ref_not_added = false
                }
                if (undefined !== outer_shell_electron.ref && undefined ===outer_shell_electron.bonded_atom) {
                    outer_shell_electron.bonded_atom = {
                        atomicSymbol:bonded_atom.atomicSymbol,
                        bonded_atom__id: bonded_atom.__id
                    }
                }
                return outer_shell_electron
            }
        )
        return AtomFactory(atom.atomicSymbol, outer_shell_electrons, atom.protons, atom.__id)
    }

    const indexOfParentAtom = (tokens, currentIndex) => {

        // Get the index of the atom located just before the last branch start
        // We do this by recursively searching up the tokens.
        if (undefined === tokens[currentIndex - 1]) {
            return null
        }

        if (tokens[currentIndex -1].type==="Branch" && tokens[currentIndex - 1].value === 'begin') {
            return indexOfPreviousAtom(tokens, currentIndex -1);
        }

        return currentIndex === -1 ? null
            :(
                indexOfParentAtom(tokens, currentIndex - 1)
            )
    }

    const indexOfPreviousAtom = (tokens, currentIndex) => {
        // Get the index of the previous element that is an atom
        // We do this by recursively searching up the tokens.
        return currentIndex === 0 ? -1
            :(
                tokens[currentIndex - 1].__id && tokens[currentIndex - 1].atomicSymbol !== 'H'? currentIndex - 1
                    :indexOfPreviousAtom(tokens, currentIndex - 1)
            )
    }

    const indexOfNextAtom = (tokens, currentIndex) => {
        // Get the index of the next element that is an atom
        // We do this by recursively searching down the tokens.
        return currentIndex === tokens.length -1?null
            :(
                tokens[currentIndex + 1].__id && tokens[currentIndex + 1].atomicSymbol !== 'H'? currentIndex +1
                    :indexOfNextAtom(tokens, currentIndex +1)
            )
    }



    /*
    [ { type: 'AliphaticOrganic', value: 'Cl' },
  { type: 'AliphaticOrganic', value: 'Cl' } ]
     */

    // console.log("canonical_SMILES:")
    //console.log(canonical_SMILES)
    // HNO3
    // [N+](=O)(O)[O-]
    //console.log("tokens:")
    //console.log(tokens)
    /*
    [ { type: 'BracketAtom', value: 'begin' },
  { type: 'ElementSymbol', value: 'N' },
  { type: 'Charge', value: 1 },
  { type: 'BracketAtom', value: 'end' },
  { type: 'Branch', value: 'begin' },
  { type: 'Bond', value: '=' },
  { type: 'AliphaticOrganic', value: 'O' },
  { type: 'Branch', value: 'end' },
  { type: 'Branch', value: 'begin' },
  { type: 'AliphaticOrganic', value: 'O' },
  { type: 'Branch', value: 'end' },
  { type: 'BracketAtom', value: 'begin' },
  { type: 'ElementSymbol', value: 'O' },
  { type: 'Charge', value: -1 },
  { type: 'BracketAtom', value: 'end' } ]
     */


    // C=C tokens
    /*
    [ { type: 'AliphaticOrganic', value: 'C' },
  { type: 'Bond', value: '=' },
  { type: 'AliphaticOrganic', value: 'C' } ]
     */

    // Start here
    /*
     CCC(C)CC
    [ { type: 'AliphaticOrganic', value: 'C' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'Branch', value: 'begin' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'Branch', value: 'end' },
  { type: 'AliphaticOrganic', value: 'C' },
  { type: 'AliphaticOrganic', value: 'C' } ]
     */
    const tokensToAtoms = tokens.map(
        // tokens rows to atoms
        (token, index) => {
            if (token.type === 'AliphaticOrganic' || token.type === "ElementSymbol") {
                return AtomFactory(token.value, [], null)
            }
            return token
        }
    )

    /*
        tokensToAtoms.map(
        (atom) => console.log(atom.outer_shell_electrons)
    )
    [ { __id: '17doegpajut4tn4h' },
  { __id: '17doegpajut4tn4i' },
  { __id: '17doegpajut4tn4j' },
  { __id: '17doegpajut4tn4k' } ]
[ { __id: '17doegpajut4tn4s' },
  { __id: '17doegpajut4tn4t' },
  { __id: '17doegpajut4tn4u' },
  { __id: '17doegpajut4tn4v' } ]
[ { __id: '17doegpajut4tn53' },
  { __id: '17doegpajut4tn54' },
  { __id: '17doegpajut4tn55' },
  { __id: '17doegpajut4tn56' } ]
undefined
[ { __id: '17doegpajut4tn5e' },
  { __id: '17doegpajut4tn5f' },
  { __id: '17doegpajut4tn5g' },
  { __id: '17doegpajut4tn5h' } ]
undefined
[ { __id: '17doegpajut4tn5p' },
  { __id: '17doegpajut4tn5q' },
  { __id: '17doegpajut4tn5r' },
  { __id: '17doegpajut4tn5s' } ]
[ { __id: '17doegpajut4tn60' },
  { __id: '17doegpajut4tn61' },
  { __id: '17doegpajut4tn62' },
  { __id: '17doegpajut4tn63' } ]
     */
    const addHydrogensRecursive = (tokensToAtoms, atom, hydrogen_atoms_added_count, number_of_hydrogen_atoms) => {

        if (hydrogen_atoms_added_count === number_of_hydrogen_atoms) {
            return atoms
        }

        const hydrogen_atom = AtomFactory('H', [], null)
        tokensToAtoms.push(hydrogen_atom)
        return addHydrogensRecursive(atoms, atom, hydrogen_atoms_added_count+1, number_of_hydrogen_atoms)
    }

    const atomsWithHydrogensFromSMILES = tokensToAtoms.reduce(
        (accumulator, el, index) => {
            if (el.type === 'HydrogenCount') {
                const atomIndex = indexOfPreviousAtom(tokensToAtoms, index)
                if (null !== atomIndex) {
                    // Add hydrogens recursively just after the parent atom
                    accumulator = addHydrogensRecursive(accumulator, tokensToAtoms[atomIndex], 0, el.value);
                }
            } else {
                accumulator.push(el)
            }
            return accumulator
        }, []
    )


    const atomsWithChargesProcessed = atomsWithHydrogensFromSMILES.map(
        (el, index)  => {
            if (undefined !==el.type && el.type === "Charge" && el.value > 0) {
                const index_of_atom_to_add_charge_to = indexOfParentAtom(atomsWithHydrogensFromSMILES, index)
                if (index_of_atom_to_add_charge_to !== null) {
                    // Add proton(s) to parent atom.
                    atomsWithHydrogensFromSMILES[index_of_atom_to_add_charge_to] = addProtonsRecursive(atomsWithHydrogensFromSMILES[index_of_atom_to_add_charge_to], 0, el.value)
                }
                return el
            }
            return el
        },
        atomsWithHydrogensFromSMILES
    )

    const atomsWithBonds = atomsWithChargesProcessed.map(
        // Add bonds
        (el, index) => {
            if (index > 0) {
                if (el.__id) {
                    const ref = uniqid()
                    if ('H' === el.atomicSymbol) {
                        const atomIndex = indexOfPreviousAtom(atomsWithChargesProcessed, index)
                        if (null !== atomIndex) {
                            atomsWithChargesProcessed[atomIndex] = addRef(ref, atomsWithChargesProcessed[atomIndex], el)
                            el = addRef(ref, el, atomsWithChargesProcessed[atomIndex])
                        }
                    } else if (atomsWithChargesProcessed[index-1].__id) {
                        // Single bond
                        // Add ref to one of the electrons for both atoms.
                        atomsWithChargesProcessed[index -1] = addRef(ref, atomsWithChargesProcessed[index -1], el)
                        el = addRef(ref, el, atomsWithChargesProcessed[index -1])
// verification check (HCL)

                    } else if (atomsWithChargesProcessed[index-1].type && atomsWithChargesProcessed[index-1].type === "Branch") {
                        // Branch
                        // index = 4
                        if (atomsWithChargesProcessed[index-1].value === 'begin') {
                            // Start of branch
                            const atomIndex = indexOfPreviousAtom(atomsWithChargesProcessed, index)
                            atomsWithChargesProcessed[atomIndex] = addRef(ref, atomsWithChargesProcessed[atomIndex],el)
                            el = addRef(ref, el, atomsWithChargesProcessed[atomIndex])
                        } else if (atomsWithChargesProcessed[index-1].value === 'end') { // end of branch
                            // End of branch
                            const atomIndex = indexOfParentAtom(atomsWithChargesProcessed, index)
                            atomsWithChargesProcessed[atomIndex] = addRef(ref, atomsWithChargesProcessed[atomIndex], el)
                            el = addRef(ref, el, atomsWithChargesProcessed[atomIndex])
                        }
                    } else if (atomsWithChargesProcessed[index-1].type && atomsWithHydrogensFromSMILES[index-1].type === "Bond") {
                        // Bond
                        switch(atomsWithChargesProcessed[index-1].value) {
                            case "=":
                                // Double bond
                                const atomIndex = indexOfPreviousAtom(atomsWithChargesProcessed, index)
                                el = addRef(ref, el, atomsWithChargesProcessed[atomIndex])
                                atomsWithChargesProcessed[atomIndex] = addRef(ref, atomsWithChargesProcessed[atomIndex],el)
                                atomsWithChargesProcessed[atomIndex] = addRef(ref, tokensToAtoms[atomIndex],el)
                                el = addRef(ref, el, atomsWithChargesProcessed[atomIndex])
                                break;
                        }
                    } else {
                        // Current atom is an atom but we haven't been able to bond it yet.
                        const previous_atom_index = indexOfPreviousAtom(atomsWithChargesProcessed, index)
                        if (-1 !== previous_atom_index) {
                            atomsWithChargesProcessed[previous_atom_index] = addRef(ref, atomsWithChargesProcessed[previous_atom_index],el)
                            el = addRef(ref, el, atomsWithChargesProcessed[previous_atom_index])
                        } else if (atomsWithChargesProcessed[0].__id) {
                            atomsWithChargesProcessed[0] = addRef(ref, atomsWithChargesProcessed[0],el)
                            el = addRef(ref, el, atomsWithChargesProcessed[0])
                        }
                    }
                }
            }
            return el
        },
        atomsWithChargesProcessed
    )


    /*
    atomsWithBonds.map(
        (atom) => {
            console.log("Atom id: " + atom.__id)
            console.log(atom.outer_shell_electrons===undefined?atom.type:atom.outer_shell_electrons)
        }
    )

    CCC(C)CC
Atom id: 17doehayjut5z4cg
[ { __id: '17doehayjut5z4ch',
    ref: '17doehayjut5z4ea',
    bonded_atom: { atomicSymbol: 'C', bonded_atom__id: '17doehayjut5z4cr' } },
  { __id: '17doehayjut5z4ci' },
  { __id: '17doehayjut5z4cj' },
  { __id: '17doehayjut5z4ck' } ]

Atom id: 17doehayjut5z4cr
[ { __id: '17doehayjut5z4cs',
    ref: '17doehayjut5z4ea',
    bonded_atom: { atomicSymbol: 'C', bonded_atom__id: '17doehayjut5z4cg' } },
  { __id: '17doehayjut5z4ct',
    ref: '17doehayjut5z4eb',
    bonded_atom: { atomicSymbol: 'C', bonded_atom__id: '17doehayjut5z4d2' } },
  { __id: '17doehayjut5z4cu' },
  { __id: '17doehayjut5z4cv' } ]

Atom id: 17doehayjut5z4d2 THIRD ATOM
[ { __id: '17doehayjut5z4d3',
    ref: '17doehayjut5z4eb',
    bonded_atom: { atomicSymbol: 'C', bonded_atom__id: '17doehayjut5z4cr' (second atom) } },
  { __id: '17doehayjut5z4d4',
    ref: '17doehayjut5z4ec',
    bonded_atom: { atomicSymbol: 'C', bonded_atom__id: '17doehayjut5z4dd' (fourth atom)} },
  { __id: '17doehayjut5z4d5',
    ref: '17doehayjut5z4ed',
    bonded_atom: { atomicSymbol: 'C', bonded_atom__id: '17doehayjut5z4do' (fifth atom) } },
  { __id: '17doehayjut5z4d6' } ]

Atom id: undefined
Branch


Atom id: 17doehayjut5z4dd  FOURTH ATOM
[ { __id: '17doehayjut5z4de',
    ref: '17doehayjut5z4ec',
    bonded_atom: { atomicSymbol: 'C', bonded_atom__id: '17doehayjut5z4d2' (third atom) } },
  { __id: '17doehayjut5z4df' },
  { __id: '17doehayjut5z4dg' },
  { __id: '17doehayjut5z4dh' } ]

Atom id: undefined
Branch

Atom id: 17doehayjut5z4do FIFTH ATOM
[ { __id: '17doehayjut5z4dp',
    ref: '17doehayjut5z4ed',
    bonded_atom: { atomicSymbol: 'C', bonded_atom__id: '17doehayjut5z4d2' } },
  { __id: '17doehayjut5z4dq',
    ref: '17doehayjut5z4ee',
    bonded_atom: { atomicSymbol: 'C', bonded_atom__id: '17doehayjut5z4dz' } },
  { __id: '17doehayjut5z4dr' },
  { __id: '17doehayjut5z4ds' } ]

Atom id: 17doehayjut5z4dz
[ { __id: '17doehayjut5z4e0',
    ref: '17doehayjut5z4ee',
    bonded_atom: { atomicSymbol: 'C', bonded_atom__id: '17doehayjut5z4do' } },
  { __id: '17doehayjut5z4e1' },
  { __id: '17doehayjut5z4e2' },
  { __id: '17doehayjut5z4e3' } ]



     */

// console.log("Electrons are negatively charged")
    const atomsWithRingbonds = atomsWithBonds.map(
        // ring bonds
        (el, index) => {
            const ref= uniqid()
            if (el.type && el.type==="Ringbond") {
                // look for previous ring bond
                const previous_ring_bond_index = previousRingBondIndex(atomsWithBonds, index, el.value)
                if (previous_ring_bond_index!==null){
                    // get next ringbond atom index
                    const next_ringbond_atom_index = indexOfNextAtom(atomsWithBonds, index)
                    // get previous ringbond atom index
                    const previous_ringbond_atom_index = indexOfPreviousAtom(atomsWithBonds, previous_ring_bond_index)
                    atomsWithBonds[next_ringbond_atom_index] = addRef(ref,atomsWithBonds[next_ringbond_atom_index],atomsWithBonds[previous_ringbond_atom_index])
                    atomsWithBonds[previous_ringbond_atom_index] = addRef(ref,atomsWithBonds[previous_ringbond_atom_index],atomsWithBonds[next_ringbond_atom_index])
                    // bond type
                    if (atomsWithBonds[next_ringbond_atom_index-1].type && atomsWithBonds[next_ringbond_atom_index-1].type=== "Bond") {
                        switch(atomsWithBonds[index-1].value) {
                            case "=":
                                atomsWithBonds[next_ringbond_atom_index] = addRef(ref,atomsWithBonds[next_ringbond_atom_index],atomsWithBonds[previous_ringbond_atom_index])
                                break
                        }
                    }
                    if (atomsWithBonds[previous_ringbond_atom_index-1].type && atomsWithBonds[previous_ringbond_atom_index-1].type=== "Bond") {
                        switch(atomsWithBonds[index-1].value) {
                            case "=":
                                atomsWithBonds[previous_ringbond_atom_index] = addRef(ref,atomsWithBonds[previous_ringbond_atom_index],atomsWithBonds[next_ringbond_atom_index])
                                break
                        }
                    }
                }
            }
            return el
        },
        atomsWithBonds
    )

    atoms = atomsWithRingbonds.filter(
        (el) => {
            // Only atoms will have ids.
            return undefined !== el.__id;
        }
    )


    if (add_hydrogens) {

        /*The number of bonds for a neutral atom is equal to the number of electrons in the full valence shell (2 or 8 electrons) minus the number of valence electrons. This method works because each covalent bond that an atom forms adds another electron to an atoms valence shell without changing its charge.
        */

        const hydrogen_atoms = []

        const atoms_with_hydrogens_added = atoms.map(
            (atom,index) =>{

                if(atom.atomicSymbol==="H"){
                    return atom
                }

                const number_of_bonds_available =  atom.properties.maxBonds - atom.outer_shell_electrons.filter(
                    (electron)=>undefined!==electron.ref
                ).length
                let number_hydrogens_added = 0

                // add hydrogens to lone outer shell electrons
                atom.outer_shell_electrons = atom.outer_shell_electrons.map(
                    (electron)=>{
                        if(undefined!==electron.ref ||number_hydrogens_added===number_of_bonds_available){
                            return electron
                        }
                        const ref = uniqid()
                        electron.ref=ref
                        const hydrogen_atom_id = uniqid()
                        electron.bonded_atom = {atomicSymbol:"H", bonded_atom__id:hydrogen_atom_id}
                        hydrogen_atoms.push(AtomFactory("H",[{__id:hydrogen_atom_id,ref:ref, bonded_atom:{atomicSymbol:atom.atomicSymbol, bonded_atom__id: atom.__id }}],null, hydrogen_atom_id))
                        number_hydrogens_added++
                        return electron
                    }
                )

                /*
                if (atomsWithChargesProcessed.length === 2 && atomsWithChargesProcessed[0].atomicSymbol==="H" && atomsWithChargesProcessed[1].atomicSymbol==="CL" && atomsWithChargesProcessed[0].filter((electron)=>undefined !== electron.bonded_atom && electron.bonded_atom.atomicSymbol==="Cl").length===0) {
                            console.log("AtomsFactory.js Failed to add bonded atom to Hydrogen")
                            process.exit()
                        }
                        if (atomsWithChargesProcessed.length === 2 && atomsWithChargesProcessed[0].atomicSymbol==="H" && atomsWithChargesProcessed[1].atomicSymbol==="CL" && atomsWithChargesProcessed[1].filter((electron)=>undefined !== electron.bonded_atom && electron.bonded_atom.atomicSymbol==="H").length===0) {
                            console.log("AtomsFactory.js Failed to add bonded atom to chlorine")
                            process.exit()
                        }
                 */

                return AtomFactory(atom.atomicSymbol, atom.outer_shell_electrons, atom.protons, atom.__id)
            })

        return [...atoms_with_hydrogens_added,...hydrogen_atoms]


    } else {
//    console.log("atoms")
//    console.log(atoms.map((atom)=>atom.atomicSymbol))
        /*
        MOLECULELOOKUP HNO3
    Successfully looked up pubchem
    canonical_SMILES:
    [N+](=O)(O)[O-]
    atoms
    [ 'N', 'O', 'O', 'O' ]
         */

        return atoms
    }

    // ATOM MODEL
// atomic symbol, proton count, max valence count*, velectron1, velectron2, velectron3
// electrons are unique strings, v=valence
// * Maximum number of electrons in valence shell.


}

module.exports = AtomsFactory










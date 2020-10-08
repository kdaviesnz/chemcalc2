//HalfArrowPushReaction
const MoleculeControllerFactory = require("../factories/MoleculeControllerFactory")
const ReactionFactory = require('../factories/ReactionFactory.js')
const AtomFactory = require('../factories/AtomFactory.js')
const MoleculeFactory = require('../factories/MoleculeFactory.js')
const uniqid = require('uniqid');

/*

Half arrow push reaction: source atoms
[ { __id: 'ni05h6jqjzs595',
    as: 'Cl',
    outer_shell_electrons:
     [ 'ref = undefined bonded atom id = ni05h6jqjzs59w',
       'ref = undefined bonded atom id = ',
       'ref = undefined bonded atom id = ',
       'ref = undefined bonded atom id = ',
       'ref = undefined bonded atom id = ',
       'ref = undefined bonded atom id = ',
       'ref = undefined bonded atom id = ' ] },
  { __id: 'ni05h6jqjzs59w',
    as: 'H',
    outer_shell_electrons: [ 'ref = ni05h6jqjzs59v bonded atom id = ni05h6jqjzs595' ] } ]
 */

/*
Source molecule is the molecule that the arrow head points to and is the source of the electron to move.
*/
const HalfArrowPushReaction =

    (source_molecule, source_atom_index, target_molecule, target_atom_index, source_atom_electron_ref, do_verification_checks, callback) => {

        const process = () => () => {

            /*
          "Half-headed arrow: Used to show the movement of one electron."
"Organic chemists use half- and full-headed arrows to show the movement of electrons (sometimes half-headed arrows are called fishhook arrows because they look like fishhooks). Full-headed arrows are much more common than half-headed arrows, simply because most reactions involve the movement of lone pairs and bonds — each of which contains two electrons. Half-headed arrows are used for describing free radical reactions (described in Chapter 8), because these reactions involve the movement of single electrons. You’ll need to become as good as Robin Hood at using these types of arrows.

Excerpt from
Organic Chemistry I For Dummies
Arthur Winter
This material may be protected by copyright.

             */
            let source_atoms = source_molecule.atoms

            const source_molecule_controller = MoleculeControllerFactory(source_molecule)

            if (source_atom_index === null) {
                source_atom_index = source_molecule_controller.findAtomByAtomicSymbolIndex(source_atoms, source_atom_atomic_symbol, 0)

                if (null === source_atom_index) {
                    console.log("HalfArrowPushReaction::Could not get source atom")
                    console.log("source_atom_atomic_symbol")
                    console.log(source_atom_atomic_symbol)
                    console.log("source_atoms")
                    console.log(source_atoms.map(
                        (atom) => atom.atomicSymbol
                    ))
                    return [source_molecule, target_molecule]
                }
            }

            // Get the number of source atom electrons at start. We use this as a check as after the half arrow push the source atom should have exactly one less electron than at the start.
            const count_source_electrons_at_start = source_atoms[source_atom_index].outer_shell_electron_count

            // Get the source atom ref of first electron
            if (null === source_atom_electron_ref) {
                source_atom_electron_ref = source_atoms[source_atom_index].outer_shell_electrons.filter(
                    (electron) => undefined !== electron.ref
                )[0].ref
            }

            // Remove ref from all electrons in source molecule atom where ref = source_atom_electron_ref
            // This breaks the bond between the source and target atom
            source_atoms[source_atom_index].outer_shell_electrons = source_atoms[source_atom_index].outer_shell_electrons.map(
                (electron) => {
                    if (undefined!==electron.ref && electron.ref === source_atom_electron_ref) {
                        const ref = electron.ref
                        const bonded_atom__id = electron.bonded_atom.bonded_atom__id
                        delete(electron.ref)
                        delete(electron.bonded_atom)
// bonded atom
                        if (null === target_molecule) {
                            source_atoms = source_atoms.map(
                                (atom)=>{
                                    if (atom.__id===bonded_atom__id){
                                        atom.outer_shell_electrons=atom.outer_shell_electrons.map(
                                            (bond_electron)=>{
                                                if (undefined!==bond_electron.ref && bond_electron.ref === ref) {
                                                    delete(bond_electron.ref)
                                                    delete(bond_electron.bonded_atom)
                                                }
                                                return bond_electron
                                            }
                                        )
                                        return AtomFactory(atom.atomicSymbol, atom.outer_shell_electrons, atom.protons, atom.__id)
                                    }
                                    return atom
                                }
                            )
                        }
                    }
                    return electron
                }
            )

            //console.log("HalfArrowPushReaction::Checking source atom has no bonds")
            //console.log(source_atoms[target_atom_index].outer_shell_electrons)
            //process.exit()
            // Reset source atom
            source_atoms[source_atom_index] = AtomFactory(source_atoms[source_atom_index].atomicSymbol, source_atoms[source_atom_index].outer_shell_electrons, source_atoms[source_atom_index].protons, source_atoms[source_atom_index].__id)

            const target_atoms = target_molecule===null?source_atoms:target_molecule.atoms
            const target_molecule_controller = MoleculeControllerFactory(target_molecule===null?source_molecule:target_molecule)

            if (null===target_atom_index) {
                const target_atom_index = target_molecule_controller.findFreeRadicalAtomByAtomicSymbolIndex(target_atoms, target_atom_atomic_symbol, 0)
                if (null === target_atom_index) {
                    console.log("HalfArrowPushReaction::Could not get target atom")
                    return [source_molecule, target_molecule]
                }
            }

            // Checks
            /*
            // Target atom should have at least one outer shell electron without a ref
            if (target_atoms[target_atom_index].outer_shell_electrons.filter(
                (electron) => undefined === electron.ref
            ).length === 0) {
                console.log("Target molecule atom does not have a lone electron")
                return [source_molecule_controller, target_molecule]
            }
            */


            // add a ref to target electron that doesn’t have ref
            /*
            const ref = uniqid()
            target_atoms[target_atom_index].outer_shell_electrons.filter(
                (electron)=>undefined ===electron.ref
            )[0].ref = ref
            target_atoms[target_atom_index] = AtomFactory(target_atoms[target_atom_index].atomicSymbol,target_atoms[target_atom_index].outer_shell_electrons,target_atoms[target_atom_index].protons, target_atoms[target_atom_index].__id)
            */

            // Check if source atom still has electrons with refs. If yes then we return a single molecule. If no then the source atom has no bonds to the source molecule and so we return the modified source and target molecules
            /*
            console.log("Half arrow push reaction: source atoms")
            console.log(source_atoms.map(
                (atom) => {
                    return {
                        "__id": atom.__id,
                        "as":atom.atomicSymbol,
                        "outer_shell_electrons":atom.outer_shell_electrons.map(
                            (electron) => {
                                const bonded_atom_id = undefined !==electron.bonded_atom?electron.bonded_atom.bonded_atom__id:""
                                return "ref = " + electron.ref + " bonded atom id = " + bonded_atom_id
                            }
                        )
                    }
                }
            ))
            */


            if(do_verification_checks){
                if((target_molecule === null && source_atoms[source_atom_index].outer_shell_electrons.filter(
                    (electron)=>undefined!==electron.ref).length >0 )|| source_atoms[source_atom_index].outer_shell_electrons.filter(
                    (electron)=>undefined!==electron.ref).length >0) {
                    console.error("HalfArrowPushReaction:Reaction should split source molecule")
                }
            }

            if ((target_molecule === null && source_atoms[source_atom_index].outer_shell_electrons.filter(
                (electron)=>undefined!==electron.ref).length >0 )|| source_atoms[source_atom_index].outer_shell_electrons.filter(
                (electron)=>undefined!==electron.ref).length >0){
                // source atom still bonded to source molecule so add ref to the source electron that doesn’t have a ref
                /*
                source_atoms[source_atom_index].outer_shell_electrons.filter(
                    (electron)=>undefined ===electron.ref
                )[0].ref = ref
                source_atoms[source_atom_index] = AtomFactory(source_atoms[source_atom_index].atomicSymbol,source_atoms[source_atom_index].outer_shell_electrons,source_atoms[source_atom_index].protons, source_atoms[source_atom_index].__id)
*/
                // Source atom should have one less electron than at start
                if (count_source_electrons_at_start - source_atoms[source_atom_index].outer_shell_electron_count !==1) {
                    console.error("Failed half arrow push - source atom has wrong number of electrons after push")
                    console.error(count_source_electrons_at_start)
                    console.error(source_atoms[source_atom_index].outer_shell_electron_count)
                    process.exit()
                }
                return [MoleculeFactory([],[...source_atoms,...target_atoms])]

            } else {
                // Source atom should have one less electron than at start
                if (count_source_electrons_at_start - source_atoms[source_atom_index].outer_shell_electron_count !==1) {
                    console.error("Failed half arrow push - source atom has wrong number of electrons after push")
                    console.error(count_source_electrons_at_start)
                    console.error(source_atoms[source_atom_index].outer_shell_electron_count)
                    process.exit()
                }

                //console.log("HalfArrowPushReaction::Checking target atom has no bonds 2")
                //console.log(source_atoms[target_atom_index].outer_shell_electrons)
                //process.exit()


                if (target_molecule === null) {
                    source_atoms_target_atom_removed = source_atoms.filter(
                        (atom, index) => index !== target_atom_index
                    )
                    target_atoms_source_atom_removed = source_atoms.filter(
                        (atom, index) => index !== source_atom_index
                    )
                    return [MoleculeFactory([],source_atoms_target_atom_removed),MoleculeFactory([],target_atoms_source_atom_removed)]
                } else {
                    // move atom from source to target
                    target_atoms.push(source_atoms[source_atom_index])
                    source_atoms_source_atom_removed = source_atoms.filter(
                        (atom, index) => index !== source_atom_index
                    )
                    return [MoleculeFactory([],source_atoms_source_atom_removed),MoleculeFactory([],target_atoms)]
                }
            }

        }

        const reaction = ReactionFactory([source_molecule,target_molecule], "reaction", process())

        callback(reaction.products.length ===0?new Error("Failed half arrow push"):null,reaction)

    }

module.exports = HalfArrowPushReaction

















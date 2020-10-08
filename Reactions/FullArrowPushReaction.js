//FullArrowPushReaction
const MoleculeControllerFactory = require("../factories/MoleculeControllerFactory")
const ReactionFactory = require('../factories/ReactionFactory.js')
const AtomFactory = require('../factories/AtomFactory.js')
const MoleculeFactory = require('../factories/MoleculeFactory.js')
const uniqid = require('uniqid');

const FullArrowPushReaction = (source_molecule, source_atom_index, target_molecule, target_atom_index,  do_verification_checks, callback) => {

        const react = () => () => {

            source_molecule.should.be.a.Object()
            source_atom_index.should.be.a.Number()
            target_molecule.should.be.a.Object()
            target_atom_index.should.be.a.Number()
            source_molecule.should.have.property("atoms")
            target_molecule.should.have.property("atoms")

            source_molecule.atoms[source_atom_index].should.be.a.Object()
            target_molecule.atoms[target_atom_index].should.be.a.Object()
            target_molecule.atoms[target_atom_index].should.have.property("__id")
            source_molecule.atoms[source_atom_index].should.have.property("__id")


            /*
          "Half-headed arrow: Used to show the movement of one electron."
"Organic chemists use half- and full-headed arrows to show the movement of electrons (sometimes half-headed arrows are called fishhook arrows because they look
like fishhooks). Full-headed arrows are much more common than half-headed arrows, simply because most reactions involve the movement of lone pairs and bonds — each of
 which contains two electrons. Half-headed arrows are used for describing free radical reactions (described in Chapter 8), because these reactions involve the movement of
 single electrons. You’ll need to become as good as Robin Hood at using these types of arrows.

Excerpt from
Organic Chemistry I For Dummies
Arthur Winter
This material may be protected by copyright.

             */
            const target_molecule_controller = MoleculeControllerFactory(target_molecule)
            const source_molecule_controller = MoleculeControllerFactory(source_molecule)


// source molecule has the hydrogen atom to be added to target molecules
// Check
// target atom should have at least one bond to a non hydrogen atom
            if(target_molecule.atoms[target_atom_index].outer_shell_electrons.filter(
                (electron)=>"H"!==electron.bonded_atom.atomicSymbol
            ).length===0) {
                console.error("FullArrowPushReaction::target atom must have at least one bond to a non hydrogen")
                return [source_molecule, target_molecule]
            }

            // Get the number of target atom electrons at start. We use this as a check as after the full arrow push the target atom should have same number of electrons at the start.
            const count_target_atoms_at_start = target_molecule.atoms[target_atom_index].outer_shell_electron_count

            // Get the number of source atom electrons at start. We use this as a check as after the full arrow push the source atom should have two more electrons at the start.
            const count_source_atoms_at_start = source_molecule.atoms[source_atom_index].outer_shell_electron_count

            // Remove bond between the source atom and non hydrogen atom
            delete(target_molecule.atoms[target_atom_index].outer_shell_electrons.filter(
                (electron)=>"H"!==electron.bonded_atom.atomicSymbol
            )[0])

            // Add bond between source atom and target atom
            const ref = uniqid()

            source_molecule.atoms[source_atom_index].outer_shell_electrons = source_molecule_controller.addBond (source_molecule.atoms[source_atom_index].outer_shell_electrons, target_molecule.atoms[target_atom_index], ref, 0)

            target_molecule.atoms[source_atom_index].outer_shell_electrons = source_molecule_controller.addBond (target_molecule.atoms[target_atom_index].outer_shell_electrons, source_molecule.atoms[source_atom_index], ref, 0)


            // Reset source atom
            source_molecule.atoms[source_atom_index] = AtomFactory(source_molecule.atoms[source_atom_index].atomicSymbol,source_molecule.atoms[source_atom_index].outer_shell_electrons,source_molecule.atoms[source_atom_index].protons, source_molecule.atoms[source_atom_index].__id)

            // Reset target atom
            target_molecule.atoms[target_atom_index] = AtomFactory(target_molecule.atoms[target_atom_index].atomicSymbol,target_molecule.atoms[target_atom_index].outer_shell_electrons,target_molecule.atoms[target_atom_index].protons, target_molecule.atoms[target_atom_index].__id)

            // checks
            if (target_molecule.atoms[target_atom_index].outer_shell_electron_count -count_target_atoms_at_start !==0 ) {
                console.error("FullArrowPushReaction:Failed full arrow push - target atom has wrong number of electrons after push")
                console.log(count_target_atoms_at_start)
                console.log(target_atoms[target_atom_index].outer_shell_electron_count)
                console.log(target_atoms[target_atom_index].atomicSymbol)
                return null
            } else {
                // console.error("FullArrowPushReaction: Got correct number of target atoms electrons after push")
                // console.log(target_atoms[target_atom_index].atomicSymbol)
            }

            // source atom should have one more bond than at start
            if (source_molecule.atoms[source_atom_index].outer_shell_electron_count -count_source_atoms_at_start !==1) {
                console.error("Failed full arrow push - source atom has wrong number of electrons after push")
                return null
            }

            return  [MoleculeFactory([],[...source_molecule.atoms,... target_molecule.atoms])]


        }

        const reaction = ReactionFactory([source_molecule,target_molecule], "reaction", react())

        callback(null === reaction || reaction.products.length === 0?new Error("Failed full arrow push"):null,reaction)


    }

module.exports = FullArrowPushReaction
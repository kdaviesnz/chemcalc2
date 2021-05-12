//DeprotonationReaction
/*
@see note 20

Deprotonation is the removal of a proton from a Brønsted–Lowry acid in an acid-base reaction. The species formed is the conjugate base of that acid. The complementary process, when a proton is added to a Brønsted–Lowry base, is protonation. The species formed is the conjugate acid of that base.

A Brønsted-Lowry acid is a molecule that donates a proton (H+) to a base; a Brønsted-Lowry base is a molecule that accepts a proton from an acid.

"An H+ ion is called a proton because the hydrogen atom has no neutrons or electrons — just a single proton at the nucleus.

To keep the terminology straight, the deprotonated acid becomes what is known as the conjugate base (usually negatively charged, but not always), while the protonated base becomes the conjugate acid.
*/
const ReactionFactory = require('../factories/ReactionFactory.js')
const MoleculeFactory = require('../factories/MoleculeFactory.js')
const FullArrowPushReaction = require('./FullArrowPushReaction.js')

const DeprotonationReaction =

    (target_molecule, source_molecule, source_atom, do_verification_checks, callback) => {


        const process = () => () => {

// target molecule is the molecule the arrow points to and is the molecule that donates the proton. It is the Brønsted-Lowry acid.
// source molecule is the molecule the arrow points from and is the molecule that accepts the proton. It is the Brønsted-Lowry base.

            const target_molecule_controller = MoleculeController(target_molecule)

// Get the hydrogen atom
// This will be the hydrogen atom in the target molecule that is bonded to a atom with too many bonds.
// @todo this should get the hydrogen bonded to an atom with too many bonds and should return the modified target atom
// reaction object
            const proton = target_molecule_controller.proton()
            const target_molecule_minus_proton = proton[0]
            const hydrogen_atom = proton[1]

            source_molecule[source_atom.index].addBond(hydrogen_atom)
            return [target_molecule_minus_proton, source_molecule]

        } // const process

        const reaction = ReactionFactory([hydrogen_source, target_molecule], "reaction", process())
        callback(null === reaction || reaction.products.length !== 2?new Error("Failed DeprotonationReaction"):null,reaction)

    }

module.exports = DeprotonationReaction














//HomolyticCleavageReaction
const ReactionFactory = require('../factories/ReactionFactory.js')
const AtomFactory = require('../factories/AtomFactory.js')

// acid and base are JSON molecule objects
const HomolyticCleavageReaction =

    (molecule, callback) => {

        const process = () => () => {

            // returns a reaction json object
// A reaction json object consists of reactants, products and type fields

            /*

            In the initiation step, light is shone on the reaction and the radiation is absorbed by the chlorine (Cl2). The light provides enough energy for the married chlorines to divorce — that is, for the chlorine-chlorine bond to break apart to form two chloride radicals, as shown in Figure 8-21. (Recall that free radicals are compounds that contain unpaired electrons.) This kind of bond dissociation is called homolytic cleavage, because the bond breaks symmetrically — one electron from the bond goes to one side, and the other electron goes to the other side, just as half of the shared property goes to each person in a divorce (theoretically). Note that you use one-headed fishhook arrows to show the movement of only one electron. See Chapter 3 for more on using arrows in organic chemistry."

            Excerpt from
            Organic Chemistry I For Dummies
            Arthur Winter
            This material may be protected by copyright.
            */

            if (molecule.atoms.length!==2 || molecule.atoms[0].atomicSymbol!==molecule.atoms[1].atomicSymbol) {
                return [molecule]
            }

            // Remove bond
            delete(molecule.atoms[0].outer_shell_electrons[0].ref)
            delete(molecule.atoms[1].outer_shell_electrons[0].ref)

            return [
                AtomFactory(molecule.atoms[0].atomicSymbol, molecule.atoms[0].outer_shell_electrons, molecule.atoms[0].protons, molecule.atoms[0].__id),
                AtomFactory(molecule.atoms[1].atomicSymbol, molecule.atoms[1].outer_shell_electrons, molecule.atoms[1].protons, molecule.atoms[0].__id)
            ]

        }
        const reaction = ReactionFactory([molecule], "photochemical", process())

        callback(reaction.products.length !==2 || reaction.products[0].atomicSymbol === undefined || reaction.products[1].atomicSymbol === undefined || reaction.products[0].atomicSymbol !== reaction.products[1].atomicSymbol?new Error("Molecule must consist of two bonded atoms of the same chemical"):null,reaction)

    }

module.exports = HomolyticCleavageReaction






//BronstedLowryAcidBaseReaction
const MoleculeControllerFactory = require("../factories/MoleculeControllerFactory")
const ReactionFactory = require('../factories/ReactionFactory.js')

// acid and base are JSON molecule objects
const BronstedLowryAcidBaseReaction =

    (acid, base, callback) => {

        const process = () => () => {

            /*
"The most commonly used acid-base definition in organic chemistry is the Brønsted-Lowry definition of acids and bases. A Brønsted-Lowry acid is a molecule that donates a proton (H+) to a base; a Brønsted-Lowry base is a molecule that accepts a proton from an acid."

"To keep the terminology straight, the deprotonated acid becomes what is known as the conjugate base (usually negatively charged, but not always), while the protonated base becomes the conjugate acid,"

Excerpt from
Organic Chemistry I For Dummies
Arthur Winter
This material may be protected by copyright.

             */

            // returns a reaction json object
            // A reaction json object consists of reactants, products and type fields
            const acid_molecule_controller = MoleculeControllerFactory(acid)

            const acid_base_reaction = acid_molecule_controller.proton()

            const products = acid_base_reaction.products
            if (products.length === 1) {
                return products
            }

            const proton = products[1]

            const conjugate_base = products[0]

            const conjugate_acid= MoleculeControllerFactory(base).addProton(proton).products.pop()

            return [conjugate_base, conjugate_acid]

        }
        const reaction = ReactionFactory([acid,base], "reaction", process())

        callback(reaction.products.length <2?new Error("Molecule is not an acid"):null,reaction)

    }

module.exports = BronstedLowryAcidBaseReaction











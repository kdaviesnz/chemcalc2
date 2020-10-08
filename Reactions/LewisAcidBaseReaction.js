//LewisAcidBaseReaction
const MoleculeControllerFactory = require("../factories/MoleculeControllerFactory")
const ReactionFactory = require('../factories/ReactionFactory.js')

// acid and base are JSON molecule objects
const LewisAcidBaseReaction =

    (acid, base, callback) => {

        const process = () => () => {

            /*
            The most general method for classifying acids and bases is the Lewis acid and base definition. A Lewis acid is a molecule that accepts a pair of electrons to make a covalent bond, and a Lewis base is a molecule that donates electrons to make a covalent bond.
Borane (BH3) is an example of a Lewis acid. Borane is a very unhappy molecule because it doesn’t have a full octet of valence electrons (see Chapter 2). Because it doesn’t have a full octet of electrons, it can accept a lone pair from a molecule like methylamine (CH3NH2), which has a lone pair of electrons"
Excerpt From: Arthur Winter. "Organic Chemistry I For Dummies." Apple Books.
             */

            // returns a reaction json object
            // A reaction json object consists of reactants, products and type fields
            const acid_molecule_controller = MoleculeControllerFactory(acid)

            const acid_base_reaction = acid_molecule_controller.acceptElectronPair(base)

            const products = acid_base_reaction.products
            if (products.length === 1) {
                return products
            }

            const proton = products[1]
            const acid_minus_proton = products[0]
            const base_with_proton = MoleculeControllerFactory(base).addProton(proton).products.pop()
            return [acid_minus_proton, base_with_proton]

        }
        const reaction = ReactionFactory([acid,base], "reaction", process())

        callback(reaction.products.length <2?new Error("Molecule is not an acid"):null,reaction)

    }

module.exports = LewisAcidBaseReaction











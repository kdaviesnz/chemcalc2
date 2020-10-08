const ArrheniusBaseReaction = (base) => {

// base is a JSON molecule object
    /*
    "Arrhenius bases, on the other hand, are molecules that dissociate to make hydroxide ions, OH–. As is the case with acids, bases that dissociate completely to generate hydroxide ions are strong bases, while bases that only partially dissociate to generate hydroxide ions are weak bases."

    Excerpt from
        Organic Chemistry I For Dummies
        Arthur Winterh
        This material may be protected by copyright.

        // Example
        // KOH    ->     K+      +    OH-
        // Potassium hydroxide -> Potassium +  hydroxide anion
        // Reaction = used to show the change of molecules by a reaction
        // Note that because the potassium hydroxide loses an atom (K) it ends up having more electrons than protons and hence becomes a negatively charged anion.

    "A WORD ABOUT ACIDS AND BASES
        It’s easy to call a molecule an acid or a base, and say, "That’s all there is to it, folks." But the terms acid and base are a little more elusive. A molecule is an acid only in comparison to another molecule, and likewise for a base. When the terms acid or base are used when discussing a particular molecule, they’re used in comparison to a reference molecule — water. Water is capable of acting both as an acid and as a base. Any molecule that’s more acidic than water is generally considered an acid, and any molecule that’s more basic than water is generally considered a base.

            But keep in mind that these terms are general. Most people would agree that nitric acid is an acid; its name even includes the word acid. But even nitric acid can act as a base under the right conditions! In the presence of the more acidic sulfuric acid, nitric acid acts as a base (you see this reaction in the nitration of benzene in Chapter 15). "This reaction is an extreme case, but I hope it makes you wary of
    rigidly classifying a molecule as an acid or a base, even though doing so is convenient. Whether a molecule acts as an acid or as a base really depends on what’s thrown into the reaction pot along with it."
    */

    // returns a reaction json object
    // A reaction json object consists of reactants, products and type fields
    // MoleculeControllerFactory() creates a MoleculeController object.
    // popMolecule() returns a reaction JSON object
    console.log("ARRHENIUSBASEREACTION")


    const MoleculeLookup = require('../MoleculeLookup.js')
    MoleculeLookup("OH").then(
        // "resolves" callback

        (hydroxide_molecule) => {
           // process.exit()
            const MoleculeControllerFactory = require('../factories/MoleculeControllerFactory.js')
            const reaction = MoleculeControllerFactory(base).popMolecule(hydroxide_molecule)
            console.log("Reaction:")
            console.log(reaction.products.map(
                (product) => {
                    return {
                        "atoms":product.atoms.map(
                            (atom)=> atom.atomicSymbol
                        )
                    }
                }
            ))
            process.exit()
        },
        // "rejects" callback
        (Err) => {
            console.error(new Error("Cannot load molecule OH"))
        }
    )

}

module.exports = ArrheniusBaseReaction









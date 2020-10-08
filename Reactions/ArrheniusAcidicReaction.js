//ArrheniusAcidicReaction
const MoleculeControllerFactory = require("../factories/MoleculeControllerFactory")
const ReactionFactory = require('../factories/ReactionFactory.js')

// acid and water are JSON molecule objects
const ArrheniusAcidicReaction=

    (acid, water) => {


        const process = () => () => {
            // "Svante Arrhenius, a prominent chemist from the early 20th century (whose ideas on acids and bases later earned him the Nobel Prize), defined acids as molecules that dissociate in water to make the hydronium ion, H3O+. Strong Arrhenius acids are those that completely dissociate in water to make hydronium ions, while acids that only partially dissociate in water are said to be weak Arrhenius acids"

            // Excerpt from
            // Organic Chemistry I For Dummies
            // Arthur Winter

            // In chemistry, hydronium is the common name for the aqueous cation  H3O+, the type of oxonium ion produced by protonation of water. It is the positive ion present when an Arrhenius acid is dissolved in water, as Arrhenius acid molecules in solution give up a proton (a positive hydrogen ion, H+) to the surrounding water molecules (H2O).
            // Example
            // HNO3     +    H2O ->     NO3-   +  H3O+
            // Nitric acid + water =
            // Reaction = used to show the change of molecules by a reaction
            // Note that because the nitric acid loses a proton (H+) it ends up having more electrons than protons and hence becomes a negatively charged anion.
            // CH3COOH.   +   H2O <->. CH3OO-  +  H30*
            // Equilibrium : used to show change of molecules governed by equilibriums

            // get the proton from the acid molecule

            if("H2O"===water.MolecularFormula) {
                return [acid, water]
            }


            // returns a reaction json object
            // A reaction json object consists of reactants, products and type fields
            const molecule_controller = MoleculeControllerFactory(acid)
            if (molecule_controller === null) {
                console.error("Error creating MoleculeController")
                return [acid, water]
            }

            const protonReaction = molecule_controller.proton()
            if (protonReaction === null) {
                console.error("Error creating protonReaction")
                return [acid, water]
            }

            const products = protonReaction.products
            if (products === null) {
                console.error("Error creating products")
                return [acid, water]
            }

            const proton = products[1]
            if (proton === null) {
                console.error("Error getting proton")
                return [acid, water]
            }

            const acid_minus_proton = products[0]

            const water_molecue_with_proton = MoleculeControllerFactory(water).addProton(proton).products.pop()

            return [acid_minus_proton, water_molecue_with_proton]

        }
        const reaction = ReactionFactory([acid,water], "reaction", process())
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
    }

module.exports = ArrheniusAcidicReaction











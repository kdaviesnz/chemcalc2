const VMolecule = require('../../../Components/Stateless/Views/Molecule')
const _ = require('lodash');

const VReaction = (reactions, container_end_product) => {

    return {

        "render": () => {

            /*
                results.push({
                "command": _.cloneDeep(command_reversed),
                "reagent": _.cloneDeep( container_reagent),
                "substrate": _.cloneDeep(container_substrate),
                "products": _.cloneDeep(products)
            })
             */

            _.cloneDeep(reactions).reverse().map(
                (reaction) => {
                    console.log("[" + reaction.command + "] "
                        + VMolecule(reaction.products[0]).canonicalSMILES()
                    + " + " + VMolecule(reaction.products[1]).canonicalSMILES()
                    + " = " + VMolecule(reaction.substrate))
                }
            )



        }

    }
}

module.exports = VReaction
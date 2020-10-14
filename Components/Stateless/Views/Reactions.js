const VMolecule = require('../../../Components/Stateless/Views/Molecule')
const _ = require('lodash');
const colors = require('colors')

const VReaction = (reactions, container_end_product, rule) => {

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

            console.log(VMolecule(container_end_product).canonicalSMILES() + " synthesis")
            console.log("Mechanism: " + rule.mechanism)

            _.cloneDeep(reactions).reverse().map(
                (reaction) => {
                    console.log("[" + reaction.command.bold.red + "] "
                        + VMolecule(reaction.products[0]).canonicalSMILES().green
                    + " + " + VMolecule(reaction.products[1]).canonicalSMILES().yellow
                    + " = " + VMolecule(reaction.substrate).canonicalSMILES().bold)
                }
            )


        }

    }
}

module.exports = VReaction
const VMolecule = require('../../../Components/Stateless/Views/Molecule')
const _ = require('lodash');
const colors = require('colors')

const VReaction = (reactions, container_end_product, rule) => {

    return {

        "render": () => {

            _.cloneDeep(reactions).map(
                (reaction) => {
                    console.log("[" + reaction.command.bold.red + "] "
                        + VMolecule(reaction.substrate).canonicalSMILES().green
                    + " + " + (reaction.reagent=== undefined  ? "No reagent" : VMolecule(reaction.reagent).canonicalSMILES().yellow)
                    + " = " + VMolecule(reaction.product).canonicalSMILES().bold + " + " + VMolecule(reaction.finish_reagent).canonicalSMILES())
                }
            )



        }

    }
}

module.exports = VReaction
const VMolecule = require('../../../Components/Stateless/Views/Molecule')
const _ = require('lodash');
const colors = require('colors')

const VReaction = (reactions, container_end_product, rule) => {

    return {

        "render": () => {

            //console.log(reactions)

            _.cloneDeep(reactions).map(
                (reaction) => {
                    console.log("[" + reaction.command.bold.red + "] "
                        + VMolecule(reaction.substrate).canonicalSMILES().green
                    + " + " + (reaction.reagent=== undefined  ? "No reagent" : typeof reaction.reagent[0] === "string"?reaction.reagent[0]:VMolecule(reaction.reagent).canonicalSMILES().yellow)
                    + " = " + VMolecule(reaction.product).canonicalSMILES().bold  + (typeof reaction.finish_reagent[0] === "string"?" + " + reaction.finish_reagent[0]:" + " + VMolecule(reaction.finish_reagent).canonicalSMILES()))
                }
            )



        }

    }
}

module.exports = VReaction
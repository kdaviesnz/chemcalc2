const VMolecule = require('../../../Components/Stateless/Views/Molecule')
const _ = require('lodash');
const colors = require('colors')

const MoleculeLookup = require('../../../Controllers/MoleculeLookup')
const PubChemLookup = require('../../../Controllers/PubChemLookup')
const pubchem = require("pubchem-access").domain("compound");


const VReaction = (reactions, container_end_product, rule) => {

    const renderReactionsRecursive = function(reactions, index) {
        const reaction = reactions[index]

        if (reaction !== undefined) {

            if (reaction.command === "Dehydrate") {
                reaction.reagent = null
                reaction.finish_reagent = ["water", reaction.finish_reagent[0]]
            }
            if (reaction.command === "Make carbon-nitrogen double bond") {
                reaction.reagent = null
            }


            MoleculeLookup(db, VMolecule(reaction.substrate).canonicalSMILES(), true).then(
                (json_obj) => {

                    console.log(json_obj)
                    console.log(jjjj)

                    console.log("[" + reaction.command.bold.red + "] "
                        + VMolecule(reaction.substrate).canonicalSMILES().green
                        + (reaction.reagent === undefined || reaction.reagent === null ? " (no reagent)" : typeof reaction.reagent[0] === "string" ? ' + ' + reaction.reagent[0] : ' + ' + VMolecule(reaction.reagent).canonicalSMILES().yellow)
                        + " -> " + VMolecule(reaction.product).canonicalSMILES().bold + (typeof reaction.finish_reagent[0] === "string" ? " + " + reaction.finish_reagent[0] : " + " + VMolecule(reaction.finish_reagent).canonicalSMILES()))
                    renderReactionsRecursive(reactions, index + 1)


                   // callback(Err, reaction)
                },
                (Err) => {
                    if (null !== Err) {
                        should.ifError(Err);
                    }
                    console.log(Err)
                    console.log('VReaction')
                    process.exit()
                }
            )



        }
    }

    return {


        "render": () => {

            //console.log(reactions)
            renderReactionsRecursive(reactions, 0)
        }

    }
}

module.exports = VReaction
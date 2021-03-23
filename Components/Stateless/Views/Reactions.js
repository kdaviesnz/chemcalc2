const VMolecule = require('../../../Components/Stateless/Views/Molecule')
const _ = require('lodash');
const colors = require('colors')

const MoleculeLookup = require('../../../Controllers/MoleculeLookup')
const PubChemLookup = require('../../../Controllers/PubChemLookup')
const MoleculeFactory = require('../../../Models/MoleculeFactory')
const pubchem = require("pubchem-access").domain("compound");


const VReaction = (db, reactions, container_end_product, rule) => {


    const onErrorLookingUpMoleculeInDB = (Err) => {
        console.log(Err)
        process.exit()
    }

    const addFinishReagent = function(lines, reactions, index, reaction, substrate, product, reagent) {
        if (typeof reaction.finish_reagent[0] === "string") {
            const finish_reagent = reaction.finish_reagent[0]
            renderLine(lines, reactions, index, reaction, substrate, product, reagent, finish_reagent)
        } else {
            MoleculeLookup(db, VMolecule(reaction.finish_reagent).canonicalSMILES(), "SMILES", true).then(
                (finish_reagent_json_obj) => {
                   // console.log("Finish Reagent:")
                   // console.log(finish_reagent_json_obj)
                    const finish_reagent = undefined === finish_reagent_json_obj.IUPACName?finish_reagent_json_obj.search:finish_reagent_json_obj.IUPACName
                    renderLine(lines, reactions, index, reaction, substrate, product, reagent, finish_reagent)
                },
                onErrorLookingUpMoleculeInDB
            )
        }
    }

    const renderLine = function(lines, reactions, index, reaction, substrate, product, reagent, finish_reagent) {

        lines.push("[" + reaction.command.bold.red + "] "
            + substrate.green
            +  ' + ' + reagent.yellow
            + " -> " + product.bold +  ' + ' + finish_reagent)
        renderReactionsRecursive(lines, reactions, index + 1)

    }

    const renderReactionsRecursive = function(lines, reactions, index) {

        const reaction = reactions[index]

        if (reaction !== undefined) {

            if (reaction.command === "Dehydrate") {
                reaction.reagent = null
                reaction.finish_reagent = ["water", reaction.finish_reagent[0]]
            }
            if (reaction.command === "Make carbon-nitrogen double bond") {
                reaction.reagent = null
            }


            MoleculeLookup(db, VMolecule(reaction.substrate).canonicalSMILES(), "SMILES", true).then(
                // "resolves" callback
                (substract_json_obj) => {

                    const substrate = (undefined === substract_json_obj.IUPACName?substract_json_obj.search:substract_json_obj.IUPACName)

                    MoleculeLookup(db,VMolecule(reaction.product).canonicalSMILES(), "SMILES", true).then(

                        (product_json_obj) => {

                           // console.log("Product:")
                           // console.log(product_json_obj)
                            const product = undefined === product_json_obj.IUPACName?product_json_obj.search:product_json_obj.IUPACName

                            if (reaction.reagent === undefined || reaction.reagent === null) {
                                const reagent = "no reagent"
                                addFinishReagent(lines, reactions, index, reaction, substrate, product, reagent)
                            } else if(typeof reaction.reagent[0] === "string") {
                                const reagent = reaction.reagent[0]
                                addFinishReagent(lines, reactions, index, reaction, substrate, product, reagent)
                            } else {
                                MoleculeLookup(db, VMolecule(reaction.reagent).canonicalSMILES(), "SMILES", true).then(
                                    (reagent_json_obj) => {
                                      //  console.log("Reagent:")
                                      //  console.log(reagent_json_obj)
                                        const reagent = undefined === reagent_json_obj.IUPACName?reagent_json_obj.search:reagent_json_obj.IUPACName
                                        addFinishReagent(lines, reactions, index, reaction, substrate, product, reagent)
                                    },
                                    // "rejects" callback
                                    onErrorLookingUpMoleculeInDB
                                )
                            }

                        },
                        onErrorLookingUpMoleculeInDB

                    )

                },
                // "rejects" callback
                onErrorLookingUpMoleculeInDB
            )


        } else {

            console.log("============================================================")
            lines.map((line)=>{
                console.log(line)
            })
            console.log("============================================================")

        }
    }

    return {


        "render": () => {

            //console.log(reactions)
            renderReactionsRecursive([], reactions, 0)
        }

    }
}

module.exports = VReaction
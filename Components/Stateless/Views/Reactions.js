const VMolecule = require('../../../Components/Stateless/Views/Molecule')
const _ = require('lodash');
const colors = require('colors')

const MoleculeLookup = require('../../../Controllers/MoleculeLookup')
const PubChemLookup = require('../../../Controllers/PubChemLookup')
const MoleculeFactory = require('../../../Models/MoleculeFactory')
const pubchem = require("pubchem-access").domain("compound");


const VReaction = (reactions, container_end_product, rule) => {


    const onErrorLookingUpMoleculeInDB = (Err) => {
        console.log(Err)
        process.exit()
    }

    const addFinishReagent = function(db, lines, reactions, index, reaction, substrate, product, reagent) {
        if (typeof reaction.finish_reagent[0] === "string") {
            const finish_reagent = reaction.finish_reagent[0]
            renderLine(db, lines, reactions, index, reaction, substrate, product, reagent, finish_reagent)
        } else {

/*
            (async () => {
                // await
                let response =  MoleculeLookup(db, VMolecule(reaction.finish_reagent).canonicalSMILES(), "SMILES", true)
                return response
            })().then((finish_reagent_json_obj)=>{
                const finish_reagent = undefined === finish_reagent_json_obj.IUPACName?finish_reagent_json_obj.search:finish_reagent_json_obj.IUPACName
                renderLine(db, lines, reactions, index, reaction, substrate, product, reagent, finish_reagent)
            }).catch((Err)=>{
                onErrorLookingUpMoleculeInDB(Err)
            })
*/

            MoleculeLookup(db, VMolecule(reaction.finish_reagent).canonicalSMILES(), "SMILES", true).then(
                (finish_reagent_json_obj) => {

                    const finish_reagent = undefined === finish_reagent_json_obj.names && undefined === finish_reagent_json_obj.IUPACName ? finish_reagent_json_obj.search : ((undefined === finish_reagent_json_obj.names?finish_reagent_json_obj.IUPACName:finish_reagent_json_obj.names[0]) + ' (' + finish_reagent_json_obj.MolecularFormula + ')')

                    renderLine(db, lines, reactions, index, reaction, substrate, product, reagent, finish_reagent)
                },
                onErrorLookingUpMoleculeInDB
            )

        }
    }

    const renderLine = function(db, lines, reactions, index, reaction, substrate, product, reagent, finish_reagent) {

        lines.push("[" + reaction.command.bold.red + "] "
            + substrate.green
            +  ' + ' + reagent.yellow
            + " -> " + product.bold +  ' + ' + finish_reagent
            + "\nDescription: " + reaction.description)
        renderReactionsRecursive(db, lines, reactions, index + 1)

    }

    const renderReactionsRecursive = function(db, lines, reactions, index) {

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
                (substrate_json_obj) => {

                    // We only want reactions with known starting substrates
                    if (index === 0 && undefined === substrate_json_obj.IUPACName) {
                        // Do nothing
                    } else {

                        const substrate = undefined === substrate_json_obj.names && undefined === substrate_json_obj.IUPACName ? substrate_json_obj.search : ((undefined === substrate_json_obj.names?substrate_json_obj.IUPACName:substrate_json_obj.names[0]) + (undefined !== substrate_json_obj.MolecularFormula?' (' + substrate_json_obj.MolecularFormula + ')':""))


                        MoleculeLookup(db, VMolecule(reaction.product).canonicalSMILES(), "SMILES", true).then(
                            (product_json_obj) => {

                                // console.log("Product:")
                                // console.log(product_json_obj)
                                const product = undefined === product_json_obj.names && undefined === product_json_obj.IUPACName ? product_json_obj.search : ((undefined === product_json_obj.names?product_json_obj.IUPACName:product_json_obj.names[0]) + (undefined !== product_json_obj.MolecularFormula?' (' + product_json_obj.MolecularFormula + ')':""))

                                if (reaction.reagent === undefined || reaction.reagent === null) {
                                    const reagent = "no reagent"
                                    addFinishReagent(db, lines, reactions, index, reaction, substrate, product, reagent)
                                } else if (typeof reaction.reagent[0] === "string") {
                                    const reagent = reaction.reagent[0]
                                    addFinishReagent(db, lines, reactions, index, reaction, substrate, product, reagent)
                                } else {

                                    /*
                                    (async () => {
                                        // await
                                        let response =  MoleculeLookup(db, VMolecule(reaction.reagent).canonicalSMILES(), "SMILES", true)
                                        return response
                                    })().then((reagent_json_obj)=>{
                                        const reagent = undefined === reagent_json_obj.IUPACName?reagent_json_obj.search:reagent_json_obj.IUPACName
                                        addFinishReagent(db, lines, reactions, index, reaction, substrate, product, reagent)
                                    }).catch( onErrorLookingUpMoleculeInDB
                                    )
    */

                                    MoleculeLookup(db, VMolecule(reaction.reagent).canonicalSMILES(), "SMILES", true).then(
                                        (reagent_json_obj) => {
                                            //  console.log("Reagent:")
                                            //  console.log(reagent_json_obj)
                                            const reagent = undefined === reagent_json_obj.names && undefined === reagent_json_obj.IUPACName ? reagent_json_obj.search : ((undefined === reagent_json_obj.names?reagent_json_obj.IUPACName:reagent_json_obj.names[0]) + ' (' + reagent_json_obj.MolecularFormula + ')')
                                            
                                            
                                            addFinishReagent(db, lines, reactions, index, reaction, substrate, product, reagent)
                                        },
                                        // "rejects" callback
                                        onErrorLookingUpMoleculeInDB
                                    )

                                }

                            },
                            onErrorLookingUpMoleculeInDB
                        )

                    }

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


        "render": (db) => {
            renderReactionsRecursive(db, [], reactions, 0)
        }

    }
}

module.exports = VReaction
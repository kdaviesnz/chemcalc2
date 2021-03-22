const VMolecule = require('../../../Components/Stateless/Views/Molecule')
const _ = require('lodash');
const colors = require('colors')

const MoleculeLookup = require('../../../Controllers/MoleculeLookup')
const PubChemLookup = require('../../../Controllers/PubChemLookup')
const MoleculeFactory = require('../../../Models/MoleculeFactory')
const pubchem = require("pubchem-access").domain("compound");


const VReaction = (db, reactions, container_end_product, rule) => {

    const pkl = PubChemLookup((err)=>{
        console.log(err)
        process.exit()
    })

    const onErrorLookingUpMoleculeInDB = (Err) => {
        console.log(Err)
        client.close();
        process.exit()
    }

    const onMoleculeNotFound =  (onMoleculeAddedToDBCallback) => {
        return (search) => {
            console.log("Molecule not found " + search)
            pkl.searchBySMILES(search.replace(/\(\)/g, ""), db, (molecule_from_pubchem) => {
                if (molecule_from_pubchem !== null) {
                    console.log("Molecule found in pubchem")
                    molecule_from_pubchem['json'] = MoleculeFactory(search)
                    molecule_from_pubchem['search'] = search
                    db.collection("molecules").insertOne(molecule_from_pubchem, (err, result) => {
                        console.log("Inserted molecule")
                        console.log(molecule_from_pubchem)
                        //console.log(aaalll)
                        //process.exit()
                        if (err) {
                            console.log(err)
                            process.exit()
                        } else {
                            onMoleculeAddedToDBCallback(search)
                        }
                    })

                }
            })
        }
    }

    const addFinishReagent = function(reaction, substrate, product, reagent) {
        if (typeof reaction.finish_reagent[0] === "string") {
            const finish_reagent = reaction.finish_reagent[0]
            renderLine(reaction, substrate, product, reagent, finish_reagent)
        } else {
            MoleculeLookup(db, VMolecule(reaction.finish_reagent).canonicalSMILES(), "SMILES", true).then(
                (finish_reagent_json_obj) => {
                    console.log("Finish Reagent:")
                    console.log(finish_reagent_json_obj)
                    const finish_reagent = undefined === finish_reagent_json_obj.IUPACName?finish_reagent_json_obj.search:finish_reagent_json_obj.IUPACName
                    renderLine(reaction, substrate, product, reagent, finish_reagent)
                }
            )
        }
    }

    const renderLine = function(reaction, substrate, product, reagent, finish_reagent) {
        console.log("[" + reaction.command.bold.red + "] "
            + substrate.green
            +  ' + ' + reagent.yellow
            + " -> " + product.bold +  ' + ' + finish_reagent)
        console.log(linnki)
        // renderReactionsRecursive(reactions, index + 1)
        // callback(Err, reaction)
    }

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

            MoleculeLookup(db, VMolecule(reaction.substrate).canonicalSMILES(), "SMILES", true).then(
                // "resolves" callback
                (substract_json_obj) => {

                    console.log("Substrate:")
                    console.log(substract_json_obj)
                    const substrate = undefined === substract_json_obj.IUPACName?substract_json_obj.search:substract_json_obj.IUPACName

                    MoleculeLookup(db,VMolecule(reaction.product).canonicalSMILES(), "SMILES", true).then(

                        (product_json_obj) => {

                            console.log("Product:")
                            console.log(product_json_obj)
                            const product = undefined === product_json_obj.IUPACName?product_json_obj.search:product_json_obj.IUPACName

                            if (reaction.reagent === undefined || reaction.reagent === null) {
                                const reagent = "no reagent"
                                addFinishReagent(reaction, substrate, product, reagent)
                            } else if(typeof reaction.reagent[0] === "string") {
                                const reagent = reaction.reagent[0]
                                addFinishReagent(reaction, substrate, product, reagent)
                            } else {
                                MoleculeLookup(db, VMolecule(reaction.reagent).canonicalSMILES(), "SMILES", true).then(
                                    (reagent_json_obj) => {
                                        console.log("Reagent:")
                                        console.log(reagent_json_obj)
                                        const reagent = undefined === reagent_json_obj.IUPACName?reagent_json_obj.search:reagent_json_obj.IUPACName
                                        addFinishReagent(reaction, substrate, product, reagent)
                                    },
                                    onMoleculeNotFound((search) => {
                                        console.log("Molecule " + search + " added to database")
                                        process.exit()
                                    }),
                                    // "rejects" callback
                                    onErrorLookingUpMoleculeInDB
                                )
                            }

                        },
                        onMoleculeNotFound((search) => {
                            console.log("Molecule " + search + " added to database")
                            process.exit()
                        }),
                        // "rejects" callback
                        onErrorLookingUpMoleculeInDB
                    )

                },
                // Nothing found callback
                onMoleculeNotFound((search) => {
                    console.log("Molecule " + search + " added to database")
                    process.exit()
                }),
                // "rejects" callback
                onErrorLookingUpMoleculeInDB
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
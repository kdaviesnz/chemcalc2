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
                        if (err) {
                            console.log(err)
                            client.close()
                            process.exit()
                        } else {
                            onMoleculeAddedToDBCallback(search)
                        }
                    })

                }
            })
        }
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
                (json_obj) => {

                    console.log(json_obj)
                    //console.log(jjjj)

                    console.log("[" + reaction.command.bold.red + "] "
                        + json_obj.IUPACName.green
                        + (reaction.reagent === undefined || reaction.reagent === null ? " (no reagent)" : typeof reaction.reagent[0] === "string" ? ' + ' + reaction.reagent[0] : ' + ' + VMolecule(reaction.reagent).canonicalSMILES().yellow)
                        + " -> " + VMolecule(reaction.product).canonicalSMILES().bold + (typeof reaction.finish_reagent[0] === "string" ? " + " + reaction.finish_reagent[0] : " + " + VMolecule(reaction.finish_reagent).canonicalSMILES()))
                    // renderReactionsRecursive(reactions, index + 1)

                    // callback(Err, reaction)


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
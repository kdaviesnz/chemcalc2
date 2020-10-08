const MoleculeLookup = require('../../lib/MoleculeLookup')


const AkylHalideDehydration = (molecule_json_object, db, rule, child_reaction_as_string, render, Err) => {

    const reaction = (callback) => {

    }

    const reverse  = (callback)=> {
        if (false) {
            console.log('calling AkylHalideDehydration reverse')
        }

        const lookup_err = (err) => {
            console.log('AkylHalideDehydration reverse. Error looking up substrate(s)')
            console.log('End product - ' + molecule_json_object.CanonicalSMILES)
            Err(err)
        }

        //["Br"]
        const halides = ["I", "Br", "Cl"]
        halides.map(
            (X) => {

                let substrate_SMILES = false

                // @todo inner "="
                if (molecule_json_object.CanonicalSMILES.substr(molecule_json_object.CanonicalSMILES.length-3) === "C=C") {
                    substrate_SMILES = molecule_json_object.CanonicalSMILES.replace(/C\=C$/, "C" + X)
                } else if (molecule_json_object.CanonicalSMILES.substr(0,3) === "C=C") {
                    substrate_SMILES = molecule_json_object.CanonicalSMILES.replace(/^C\=C/, X + "C")
                }

                if (undefined !== substrate_SMILES) {

                    if (substrate_SMILES === false) {
                        return false
                    }

                    MoleculeLookup(db, (substrate_SMILES), "SMILES", true, "AkylHalideDehydration reverse", lookup_err).then(
                        (substrate) => {

                            callback ? callback(
                                rule,
                                molecule_json_object,
                                substrate,
                                rule.reagents,
                                child_reaction_as_string,
                                "AkylHalideDehydration reverse"
                            ) : render(
                                rule,
                                molecule_json_object,
                                substrate,
                                rule.reagents,
                                child_reaction_as_string,
                                "AkylHalideDehydration reverse"
                            )
                        },
                        (err) => {
                            lookup_err(err)
                        }
                    )

                }
            }
        )

    }

    return {
        reaction: reaction,
        reverse: reverse
    }

}

module.exports = AkylHalideDehydration


const MoleculeLookup = require('../../lib/MoleculeLookup')


const AlcoholDehydration = (molecule_json_object, db, rule, child_reaction_as_string, render, Err) => {

    const reaction = (callback) => {

    }

    const reverse  = (callback)=> {
        if (false) {
            console.log('calling AlcoholDehydration reverse')
        }

        const lookup_err = (err) => {
            console.log('AlcoholDehydration reverse. Error looking up substrate(s)')
            console.log('End product - ' + molecule_json_object.CanonicalSMILES)
            Err(err)
        }

        //console.log(molecule_json_object.CanonicalSMILES)
        // C=CCC1=CC2=C(C=C1)OCO2
        //console.log(molecule_json_object.CanonicalSMILES.substr(molecule_json_object.CanonicalSMILES.length-3))
        // CO2
  //      console.log(molecule_json_object.CanonicalSMILES.substr(0,3))

        let substrate_SMILES = false

        // @todo inner "="
        if (molecule_json_object.CanonicalSMILES.substr(molecule_json_object.CanonicalSMILES.length-3) === "C=C") {
            substrate_SMILES = molecule_json_object.CanonicalSMILES.replace(/C\=C$/, "CCO")
        } else if (molecule_json_object.CanonicalSMILES.substr(0,3) === "C=C") {
            substrate_SMILES = molecule_json_object.CanonicalSMILES.replace(/^C\=C/, "OCC")
        }

        if (undefined === molecule_json_object.CanonicalSMILES) {
            return false
        }

        if (substrate_SMILES === false) {
            return false
        }

        MoleculeLookup(db, (substrate_SMILES), "SMILES", true, "AlcoholDehydration reverse", lookup_err).then(
            (substrate) => {

                callback?callback(
                    rule,
                    molecule_json_object,
                    substrate,
                    rule.reagents,
                    child_reaction_as_string,
                    "AlcoholDehydration reverse"
                ):render(
                    rule,
                    molecule_json_object,
                    substrate,
                    rule.reagents,
                    child_reaction_as_string,
                    "AlcoholDehydration reverse"
                )
            },
            (err) => {
                lookup_err(err)
            }
        )

    }

    return {
        reaction: reaction,
        reverse: reverse
    }

}

module.exports = AlcoholDehydration


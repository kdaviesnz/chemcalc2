const MoleculeLookup = require('../../lib/MoleculeLookup')


const ReductiveAmination = (molecule_json_object, db, rule, child_reaction_as_string, render, Err) => {

    const reaction = (callback) => {

    }

    const reverse = (callback)=>{

        //  process.exit()

        if (false) {
            console.log('calling ReductiveAmination reverse')
        }

        const lookup_err = (err) => {
            console.log('ReductiveAmination reverse. Error looking up substrate(s)')
            console.log('End product - ' + molecule_json_object.CanonicalSMILES)
            Err(err)
        }


        if (undefined===rule.reagents) {
            rule.reagents = []
        }

        const secondary_amine_minus_hydrogen = molecule_json_object.functionalGroups.secondary_amine.filter(
            (branch) => {
                return branch !== "H"
            }
        )

        const y = molecule_json_object.CanonicalSMILES.match(/N.*/)
        const x = molecule_json_object.CanonicalSMILES.match(/(.*N)/)


        const y_reagents = rule.reagents
        y_reagents.push(y[0])

        //console.log("ReductiveAmination Looking up " + molecule_json_object.CanonicalSMILES.replace(y[0], "=O"))
        // Synthesising methamphetamine
        // Substrate CC(CC1=CC=CC=C1)=O - phenylacetone
        // console.log(y_reagents)
        // y_reagents: [ 'NC' ] methylamine

        if (molecule_json_object.CanonicalSMILES === false) {
            return false
        }

        MoleculeLookup(db, molecule_json_object.CanonicalSMILES.replace(y[0], "=O"), "SMILES", true, "reductiveAminationReverse", lookup_err).then(
            (substrate) => {
                callback?callback(
                    rule,
                    molecule_json_object,
                    substrate,
                    y_reagents,
                    child_reaction_as_string,
                    "reductiveAminationReverse"
                    ):
                    render(
                        rule,
                        molecule_json_object,
                        substrate,
                        y_reagents,
                        child_reaction_as_string,
                        "reductiveAminationReverse() A"
                    )
            },
            (err) => {
                console.log('There was an error')
                lookup_err(err)
            }
        )


        const x_reagents = rule.reagents

        x_reagents.push(x[0])
        //console.log(x_reagents)
        // x_reagents: [ 'NC', 'CC(CC1=CC=CC=C1)N' ] - methylamine, amphetamine
        //console.log(molecule_json_object.CanonicalSMILES.replace(x[0], "O="))
        // Looking up substrate O=C
        //process.exit()

        // should be O=C
        if (molecule_json_object.CanonicalSMILES === false) {
            return false
        }

        MoleculeLookup(db, molecule_json_object.CanonicalSMILES.replace(x[0], "O="), 'SMILES', true, lookup_err).then(
            (substrate) => {
                callback?callback(
                    rule,
                    molecule_json_object,
                    substrate,
                    x_reagents,
                    child_reaction_as_string,
                    "reductiveAminationReverse"
                    ):
                    render(
                        rule,
                        molecule_json_object,
                        substrate,
                        x_reagents,
                        child_reaction_as_string,
                        "reductiveAminationReverse"
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

module.exports = ReductiveAmination

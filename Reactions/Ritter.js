

const Ritter = (molecule_json_object, db, rule, child_reaction_as_string, render, Err) => {

    const reaction = (callback) => {

    }

    const reverse = (callback) => {
        if (false) {
            console.log('calling ritterReactionReverse()')
        }

        const lookup_err = (err) => {
            console.log('ritterReactionReverse(). Error looking up substrate(s)')
            console.log('End product - ' + molecule_json_object.CanonicalSMILES)
            Err(err)
        }

        /*
               const amine_parsed = CanonicalSmilesParserV2(this.amide[1].indexOf("N")===-1?this.amide[2].indexOf("N"):this.amide[1].indexOf("N"))
        */
        if (functionalGroups.amide===false) {
            return false
        }
        const N_Branch = functionalGroups.amide[1][0]==="N"?molecule_json_object.functionalGroups.amide[1]:molecule_json_object.functionalGroups.amide[2]
        const R_Branch = functionalGroups.amide[1][0]==="N"?molecule_json_object/functionalGroups.amide[2]:molecule_json_object.functionalGroups.amide[1]

        // Replace N group containing carboxyl group wth =C
        MoleculeLookup(db, "*C=" + N_Branch.substr(1),
            "SMILES", true, "ritterReactionReverse", lookup_err).then(
            (substrate) => {
                callback?
                    callback(
                        rule,
                        molecule_json_object,
                        substrate,
                        rule.reagents,
                        child_reaction_as_string,
                        "ritterReactionReverse"
                    ):
                    render(
                        rule,
                        molecule_json_object,
                        substrate,
                        rule.reagents,
                        child_reaction_as_string,
                        "ritterReactionReverse"
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

module.exports = Ritter

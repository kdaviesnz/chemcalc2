const MoleculeLookup = require('../../lib/MoleculeLookup')
const range = require("range");

const NagaiMethod = (molecule_json_object, db, rule, child_reaction_as_string, render, Err) => {

    const reaction = (callback) => {

    }

    const reverse  = (callback) =>{
        if (false) {
            console.log('calling NagaiMethod reverse')
        }

        const lookup_err = (err) => {
            // CC(CC1=CC=CC=C1)NC ->  CC(CC(O)1=CC=CC=C1)NC
            console.log('NagaiMethod reverse. Error looking up substrate')
            console.log('End product - ' + molecule_json_object.CanonicalSMILES)
            Err(err)
        }

        // molecule_json_object.CanonicalSMILES
        // CC(CC1=CC=CC=C1)NC

        const r = range.range(1, molecule_json_object.CanonicalSMILES.length)
        r.map(
            (i) => {
                const S = molecule_json_object.CanonicalSMILES.substr(0, i) + "(O)" + molecule_json_object.CanonicalSMILES.substr(i)
                /*
                1
S:C(O)C(CC1=CC=CC=C1)NC
2
S:CC(O)(CC1=CC=CC=C1)NC
3
S:CC((O)CC1=CC=CC=C1)NC
4
S:CC(C(O)C1=CC=CC=C1)NC
5
S:CC(CC(O)1=CC=CC=C1)NC
6
S:CC(CC1(O)=CC=CC=C1)NC
7
S:CC(CC1=(O)CC=CC=C1)NC
8
S:CC(CC1=C(O)C=CC=C1)NC
9
S:CC(CC1=CC(O)=CC=C1)NC
10
S:CC(CC1=CC=(O)CC=C1)NC
11
S:CC(CC1=CC=C(O)C=C1)NC
12
S:CC(CC1=CC=CC(O)=C1)NC
13
S:CC(CC1=CC=CC=(O)C1)NC
14
S:CC(CC1=CC=CC=C(O)1)NC
15
S:CC(CC1=CC=CC=C1(O))NC
16
S:CC(CC1=CC=CC=C1)(O)NC
17
S:CC(CC1=CC=CC=C1)N(O)C

                 */

                MoleculeLookup(db, S, "SMILES", true, "nagaiMethodReverse", null).then(
                    (substrate) => {
                        callback?
                            callback(
                                rule,
                                molecule_json_object,
                                substrate,
                                rule.reagents,
                                child_reaction_as_string,
                                "NagaiMethod reverse"
                            ):
                            render(
                                rule,
                                molecule_json_object,
                                substrate,
                                rule.reagents,
                                child_reaction_as_string,
                                "NagaiMethod reverse"
                            )
                    },
                    (err) => {
                        lookup_err(err, 'NagaiMethod reverse. Error looking up substrate')
                    }
                )
            }
        )

    }


    return {
        reaction: reaction,
        reverse: reverse
    }

}

module.exports = NagaiMethod

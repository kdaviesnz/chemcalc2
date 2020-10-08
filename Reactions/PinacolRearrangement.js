const MoleculeLookup = require('../../lib/MoleculeLookup')


const PinacolRearrangement = (molecule_json_object, db, rule, child_reaction_as_string, render, Err) => {

    const reaction = (callback) => {

    }


    const reverse = (callback)=> {
        if (false) {
            console.log('calling pinacolRearrangemenReverse()')
        }

        const lookup_err = (err) => {
            console.log('pinacolRearrangemenReverse(). Error looking up substrate(s)')
            console.log('End product - ' + molecule_json_object.CanonicalSMILES)
            Err(err)
        }

        /*
        { ketone: [ 'O', 'CC1=CC2=C(C=C1)OCO2', 'C' ],
  tertiary_amine: false,
  secondary_amine: false,
  primary_amine: false,
  amide: false,
  epoxide: false,
  ester: false,
  glycol: false,
  alcohol: false,
  aldehyde: false,
  methyl_ketone: [ 'O', 'CC1=CC2=C(C=C1)OCO2', 'C' ],
  terminal_alkene: false,
  alkene: [ [ 'CC(=O)CC1', 'CC2=C(C=C1)OCO2' ], [ [Array] ] ] }

         */


        MoleculeLookup(db, "O" + "C(C)C(O)" + molecule_json_object.functionalGroups.ketone[1].substr(1), "SMILES", true, "pinacolRearrangemenReverse", lookup_err).then(
            (substrate) => {

                callback ? callback(
                    rule,
                    molecule_json_object.CanonicalSMILES,
                    substrate,
                    rule.reagents,
                    child_reaction_as_string,
                    "pinacolRearrangemenReverse"
                    ) :
                    render(
                        rule,
                        molecule_json_object.CanonicalSMILES,
                        substrate,
                        rule.reagents,
                        child_reaction_as_string,
                        "pinacolRearrangemenReverse()"
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

module.exports = PinacolRearrangement

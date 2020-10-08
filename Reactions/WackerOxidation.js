const MoleculeLookup = require('../../lib/MoleculeLookup')

const WackerOxidation = (molecule_json_object, db, rule, child_reaction_as_string, render, Err) => {

    const reaction = (callback) => {

    }

    const reverse = (callback) => {

        if (false) {
            console.log('calling wackerOxidationReverse()')
        }

        const lookup_err = (err) => {
            console.log('wackerOxidationReverse(). Error looking up substrate(s)')
            console.log('End product - ' + molecule_json_object.CanonicalSMILES)
            Err(err)
        }

        /*
        functional groups
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

        // ADD oxygen DOUBLE BOND TO terminal alkene ON MOST SUBSTITUTED carbon(do reverse of)
        if (molecule_json_object.functionalGroups.ketone===false || (molecule_json_object.functionalGroups.ketone[1]!=="C" && molecule_json_object.functionalGroups.ketone[2]!=="C")) {
            return false
        }

        MoleculeLookup(db,
            "C=C" +
            molecule_json_object.functionalGroups.ketone.filter(
            (SMILES) => {
                return SMILES !== "C"
            }
            ).pop(),

            "SMILES", true, "wackerOxidationReverse", lookup_err).then(
            (substrate) => {
                callback?
                    callback(
                        rule,
                        molecule_json_object,
                        substrate,
                        rule.reagents,
                        child_reaction_as_string,
                        "wackerOxidationReverse"
                    ):
                    render(
                        rule,
                        molecule_json_object,
                        substrate,
                        rule.reagents,
                        child_reaction_as_string,
                        "wackerOxidationReverse"
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

module.exports = WackerOxidation

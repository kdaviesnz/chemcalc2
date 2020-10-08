const MoleculeLookup = require('../../lib/MoleculeLookup')


const AcidCatalyzedRingOpening = (molecule_json_object, db, rule, child_reaction_as_string, render, Err) => {

    const reaction = (callback) => {

    }

    const reverse  = (callback)=> {
        if (false) {
            console.log('calling AcidCatalyzedRingOpening reverse')
        }

        const lookup_err = (err) => {
            console.log('AcidCatalyzedRingOpening reverse. Error looking up substrate(s)')
            console.log('End product - ' + molecule_json_object.CanonicalSMILES)
            Err(err)
        }

        // console.log(molecule_json_object.CanonicalSMILES)
        // CC(C(C1=CC2=C(C=C1)OCO2)O)O
        //  console.log(molecule_json_object.functionalGroups)
        /*
        { ketone: false,
  tertiary_amine: false,
  secondary_amine: false,
  primary_amine: false,
  amide: false,
  epoxide: false,
  ester: false,
  glycol: [ 'C', '', 'C1=CC2=C(C=C1)OCO2', '' ],
  alcohol: false,
  aldehyde: false,
  methyl_ketone: false,
  terminal_alkene: false,
  alkene: [ [ 'CC(C(C1', 'CC2=C(C=C1)OCO2)O)O' ], [ [Array] ] ] }

         */

        const glycol_components_with_hydrogens = molecule_json_object.functionalGroups.glycol.map(
            (atom) => {
                return atom === ""? "H":atom
            }
        )


       /* console.log("AcidCatalyzedRingOpening Looking up " + glycol_components_with_hydrogens[0]
            + "C9(" + glycol_components_with_hydrogens[1] + ")C(O9)("
            + glycol_components_with_hydrogens[3] + ")"
            + glycol_components_with_hydrogens[2])
            */
// substrate CC9(H)C(O9)(H)C1=CC2=C(C=C1)OCO2
        //process.exit()

        MoleculeLookup(db, (glycol_components_with_hydrogens[0]
            + "C9(" + glycol_components_with_hydrogens[1] + ")C(O9)("
            + glycol_components_with_hydrogens[3] + ")"
            + glycol_components_with_hydrogens[2]), "SMILES", true, "AcidCatalyzedRingOpening reverse", lookup_err).then(
            (substrate) => {

                // CC1C(O1)C2=CC3=C(C=C2)OCO3
               // console.log(substrate)
                // process.exit()

                callback?callback(
                    rule,
                    molecule_json_object,
                    substrate,
                    rule.reagents,
                    child_reaction_as_string,
                    "AcidCatalyzedRingOpening reverse"
                ):render(
                    rule,
                    molecule_json_object,
                    substrate,
                    rule.reagents,
                    child_reaction_as_string,
                    "AcidCatalyzedRingOpening reverse"
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

module.exports = AcidCatalyzedRingOpening


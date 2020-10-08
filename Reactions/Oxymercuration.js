const MoleculeLookup = require('../../lib/MoleculeLookup')


const Oxymercuration = (molecule_json_object, db, rule, child_reaction_as_string, render, Err) => {

    const reaction = (callback) => {

    }

    const reverse = (callback)  => {

        if (false) {
            console.log('calling Oxymercuration reverse')
        }

        const lookup_err = (err) => {
            console.log('Oxymercuration reverse Error looking up substrate(s)')
            console.log('End product - ' + molecule_json_object.CanonicalSMILES)
            Err(err)
        }

        //console.log(molecule_json_object.CanonicalSMILES)
      //  console.log(molecule_json_object.functionalGroups)
        /*
        CC(=O)CC1=CC2=C(C=C1)OCO2
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

  // Substrate C#CCC1=CC2=C(C=C1)OCO2
         */

    //    console.log("C#C" + molecule_json_object.functionalGroups.ketone[1])
      //  process.exit()

        // (rule, canonical_SMILES, substrate_JSON_object, reagents)
        MoleculeLookup(db, "C#C" + molecule_json_object.functionalGroups.ketone[1], "SMILES", true, "Oxymercuration reverse", false).then(
            (substrate) => {

                callback?callback(
                    rule,
                    molecule_json_object,
                    substrate,
                    rule.reagents,
                    child_reaction_as_string,
                    "Oxymercuration reverse"
                ):render(
                    rule,
                    molecule_json_object,
                    substrate,
                    rule.reagents,
                    child_reaction_as_string,
                    "Oxymercuration reverse"
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

module.exports = Oxymercuration


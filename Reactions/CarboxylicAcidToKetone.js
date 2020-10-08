const MoleculeLookup = require('../../lib/MoleculeLookup')

const CarboxylicAcidToKetone = (molecule_json_object, db, rule, child_reaction_as_string, render, Err) => {

    const reaction = (callback) => {

    }

    const reverse = (callback) => {

        if (true) {
            console.log('calling CarboxylicAcidToKetone reverse')
        }

        // --> (IUPAC name) 5-methyl-1,3-benzodioxole-2-carboxylic acid (
        // (Smiles) CC1=CC2=C(C=C1)OC(O2)C(=O)O)  reagents [carboxy hydrogen carbonate] 
        // —-> [IUPAC name]2-(1,3-benzodioxol-5-yl)acetic acid (
        // [Smiles] C1OC2=C(O1)C=C(C=C2)CC(=O)O)  --> Child reaction:||

        const lookup_err = (err) => {
            console.log('CarboxylicAcidToKetone reverse. Error looking up substrate(s)')
            console.log('End product - ' + molecule_json_object.CanonicalSMILES)
            Err(err)
        }

        /*
calling CarboxylicAcidToKetone reverse
C1OC2=C(O1)C=C(C=C2)CC(=O)O
functionalGroups:
{ ketone: [ 'O', 'O', 'C1OC2=C(O1)C=C(C=C2)C' ],
  tertiary_amine: false,
  secondary_amine: false,
  primary_amine: false,
  amide: false,
  epoxide: false,
  ester: [ 'O', 'O', 'C1OC2=C(O1)C=C(C=C2)C' ],
  glycol: false,
  alcohol: false,
  aldehyde: false,
  methyl_ketone: false,
  terminal_alkene: false,
  alkene: [ [ 'C1OC2', 'C(O1)C=C(C=C2)CC(=O)O' ], [ [Array] ] ] }

 */
        const SMILES_arr = [
            "O=C(" + molecule_json_object.functionalGroups.ketone[1] + ")O", // 2-(1,3-benzodioxol-5-yl)acetic acid C1OC2=C(O1)C=C(C=C2)CC(=O)O
            "O=C(" + molecule_json_object.functionalGroups.ketone[2] + ")O" // acetic acid CC(=O)O
        ]

        console.log(SMILES_arr)
        /*
[ 'O=C(O)O', 'O=C(C1OC2=C(O1)C=C(C=C2)C)O' ]
         */

        const reagents_arr =
            [
                "O(C(=O)" + molecule_json_object.functionalGroups.ketone[2] + ")C(=O)" + molecule_json_object.functionalGroups.ketone[2],
                "O(C(=O)" + molecule_json_object.functionalGroups.ketone[1] + ")C(=O)" + molecule_json_object.functionalGroups.ketone[1]
            ]

      //   console.log(reagents_arr)
        /*
[ 'O=C(O)O', 'O=C(C1OC2=C(O1)C=C(C=C2)C)O' ]
[ 'O(C(=O)C1OC2=C(O1)C=C(C=C2)C)C(=O)C1OC2=C(O1)C=C(C=C2)C',
  'O(C(=O)O)C(=O)O' ]
         */

        reagents_arr.map(
            (reagent_SMILES, i) => {
                if (reagent_SMILES === false) {
                    return false
                }
                
                MoleculeLookup(db, reagent_SMILES, "SMILES", true, "CarboxylicAcidToKetone reverse reagent lookup", lookup_err).then(
                    (reagent) => {
                        const substrate_SMILES = SMILES_arr[i]
                        if (substrate_SMILES === false) {
                             return false
                        }
                        MoleculeLookup(db, substrate_SMILES, "SMILES", true, "CarboxylicAcidToKetone reverse", lookup_err).then(
                    (substrate) => {
                        callback?callback(
                            rule,
                            molecule_json_object,
                            substrate,
                            rule.reagents.indexOf('acyclic carboxylic anhydride')>-1?
                                [reagent.IUPACName]:rule.reagents,
                            child_reaction_as_string,
                            "CarboxylicAcidToKetone reverse"
                        ):render(
                            rule,
                            molecule_json_object,
                            substrate,
                            rule.reagents.indexOf('acyclic carboxylic anhydride')>-1?
                                [reagent.IUPACName]:rule.reagents,
                            child_reaction_as_string,
                            "CarboxylicAcidToKetone reverse"
                        )

                    },
                    (err) => {
                        lookup_err(err)
                    }
                )
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

module.exports = CarboxylicAcidToKetone

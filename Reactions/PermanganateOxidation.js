const MoleculeLookup = require('../../lib/MoleculeLookup')
const FunctionalGroups = require('../../lib/FunctionalGroups')

const PermangateOxidation = (molecule_json_object, db, rule, child_reaction_as_string, render, Err) => {

    const reaction = (alkene_molecule, callback) => {

        if (false) {
            console.log('calling Permanganate oxidation')
        }

        const lookup_err = (err) => {
            console.log('Permanganate oxidation. Error looking up substrate(s)')
            console.log('End product - ' + molecule_json_object.CanonicalSMILES)
            Err(err)
        }

        const alkene_pairs = FunctionalGroups(alkene_molecule).functionalGroups.alkene
        /*
        [ [ 'CC(=O)CC1', 'CC2=C(C=C1)OCO2' ],
  [ [ 'CC(=O)CC1,CC2=C(C=C1)OCO2CC(=O)CC1', 'CC2=C(C=C1)OCO2' ] ] ]

         */

        alkene_pairs.map(
            (alkene_pair) => {
                // console.log(alkene_pair)
                // [ 'CC(=O)CC1', 'CC2=C(C=C1)OCO2' ]
                MoleculeLookup(db, alkene_pair[0] + "O", "SMILES", true, "permanganateOxidation",   null).then(
                    (mol) => {
                        callback(mol)
                    },
                    (err) => {
                    }
                )
                MoleculeLookup(db, "O" + alkene_pair[1], "SMILES", true, "Permanganate oxidation",   null).then(
                    (mol) => {
                        callback(mol)
                    },
                    (err) => {
                    }
                )
            }
        )

    }

    const reverse = (callback) => {

        if (false) {
            console.log('calling Permanganate oxidation revrese')
        }

        const lookup_err = (err) => {
            console.log('Permanganate oxidation reverse. Error looking up substrate(s)')
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
     alkene: [ [Array], [Array] ] },
         */
        MoleculeLookup(db, "C(=C.*)(" + molecule_json_object.functionalGroups.ketone[2] +")" + "(" + molecule_json_object.functionalGroups.ketone[1] + ")", "SMILES", true, "Permanganate oxidation reverse", lookup_err).then(
            (substrates) => {
                substrates.map(
                    (substrate) => {

                        /*
                        Substrate
{ _id: 5e1991bd66f7f212e7f2dfb8,
  CID: 72435,
  CanonicalSMILES: 'COC1=CC(=CC(=C1OC)OC)C2C3C(COC3=O)C(C4=CC5=C(C=C24)OCO5)O',
  IUPACName: '(5R,5aR,8aS,9R)-5-hydroxy-9-(3,4,5-trimethoxyphenyl)-5a,6,8a,9-tetrahydro-5H-[2]benzofuro[5,6-f][1,3]benzodioxol-8-one',
  tags: [ 'C(=C.*)(C)(CC1=CC2=C(C=C1)OCO2)' ],
  children: [ 'C(=C)(C)(CC1=CC2=C(C=C1)OCO2)' ] }
                         */

                        reaction(molecule_json_object, (mol)=> {

                            console.log(mol)
                            process.exit()

                                if (mol.CanonicalSMILES === molecule_json_object.CanonicalSMILES) {

                                    callback ? callback(
                                        rule,
                                        molecule_json_object,
                                        substrate,
                                        rule.reagents,
                                        child_reaction_as_string,
                                        "Permanganate oxidation reverse"
                                    ) : render(
                                        rule,
                                        molecule_json_object,
                                        substrate,
                                        rule.reagents,
                                        child_reaction_as_string,
                                        "Permanganate oxidation reverse"
                                    )
                                }
                            }
                        )

                    }
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

module.exports = PermangateOxidation

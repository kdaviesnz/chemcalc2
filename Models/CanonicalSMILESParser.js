
const CanonicalSMILESParserV2 = (molecule_json_object, db, rule, render  ) => {


    const functionalGroups = FunctionalGroups(molecule_json_object).functionalGroups


    const AcidCatalyzedRingOpening = (callback)=> {


// Isosafrole glycol
// CC(C(C1=CC2=C(C=C1)OCO2)O)O
//C1CO1 epoxide
// C1CO1 epoxide
        if (canonical_SMILES.reverse().substr(0,3)!=="O)O") {
            return false
        }

        /*
        Find terminal oxygens
        CC(C(C1=CC2=C(C=C1)OCO2)O)O (Isosafrole glycol)
        CC(C(C1=CC2=C(C=C1)OCO2)Oii)Oi

        CC3(C(C1=CC2=C(C=C1)OCO2)O3)
        Isosafrole ozonide (CC1C(O1)C2=CC3=C(C=C2)OCO3)


        // C1CO1 epoxide

        // Drop last oxygen
        const temp = canonical_SMILES.substr(0,canonical_SMILES.length-1)
        // CC(C(C1=CC2=C(C=C1)OCO2)O)
        // inject index
        // CC(C(C1=CC2=C(C=C1)OCO2)O9)
        const temp = (canonical_SMILES.substr(0,canonical_SMILES.length-2)+"O9)")
        // CC9(C(C1=CC2=C(C=C1)OCO2)O9)
        const substrate = (")" + temp.reverse.match(/(.*\()/) + "9" + temp.reverse.match((.*\((.*)/)) + "(").reverse()

         render(
             rule,
             canonical_SMILES,
             substrate,
             rule.reagents
         )
        }


        const replaceSingleAtom = (atom, replacement)  => {

        }

        const wackerOxidationReverse =  (callback) => {
         // ADD oxygen DOUBLE BOND TO terminal alkene ON MOST SUBSTITUTED carbon(do reverse of)
         /*

        }
        // ketone: ['O', 'CC', 'C']
        CCC(=O)C

        CCC(=C)C
        */
        if (functionalGroups.ketone===false || (functionalGroups.ketone[1]!=="C" && functionalGroups.ketone[2]!=="C")) {
            return false
        }
        if (callback) {
            callback(
                rule,
                canonical_SMILES,
                functionalGroups.ketone[1]+ "C(=C)" +
                functionalGroups.ketone[2],
            rule.reagents
        )

        } else {
            render(
                rule,
                canonical_SMILES,
                functionalGroups.ketone[1]+ "C(=C)" +
                functionalGroups.ketone[2],
            rule.reagents
        )
        }
    }

    const replaceORGroupOnCarboxylCarbonWithOCation = (callback) => {

        render(
            rule,
            canonical_SMILES,
            functionalGroups.ester[1]+ "C(=O)[OH+]",
            rule.reagents
        )
    }


    const replaceCarboxylOxygenWithCR = (callback) => {
// substitute O on terminal double bond for CR where R can be hydrogen
// O=C(C)Cc1ccc2OCOc2c1 MDP2P
        MoleculeLookup(db, functionalGroups.ketone[1] + "C(=C*)" + functionalGroups.ketone[2], true).then(
            (substrate_JSON_objects) => {

                // For each substrate found call callback
                substrate_JSON_objects.map(
                    (substrate_JSON_object) => {
                        render(
                            rule,
                            canonical_SMILES,
                            substrate_JSON_object,
                            rule.reagents
                        )

                    }
                )


            }
        )



        render(
            rule,
            canonical_SMILES,
            functionalGroups.ketone[1] + "C(=CR)" + functionalGroups.ketone[2],
            rule.reagents
        )

    }

    const esterToAlcoholReverse =  ( callback, r_group ) => {



        /*
    // ethanol CCO


    return [
    "OH",
    canonical_SMILES.match(/(.*)CO/).pop()
    ]

    */
        if (callback) {
            callback(
                rule,
                canonical_SMILES,
                functionalGroups.alcohol[1]  + "C(=O)O" + (r_group?r_group:".*"),
            rule.reagents
        )

        } else {
            render(
                rule,
                canonical_SMILES,
                functionalGroups.alcohol[1]  + "C(=O)O" + (r_group?r_group:".*"),
            rule.reagents
        )

        }
    }


    const alcoholToEpoxide =  () => {

        const alcohol_parsed = FunctionalGroupParser("alcohol", SMILES)
// @todo
        render(
            rule,
            canonical_SMILES,
            this.functionslGroups.ketone[1]+ "C(O)C(O)" + this.functionslGroups.ketone[2],
            rule.reagents
        )

    }


    const replaceORGroupOnCarboxylCarbonWithOH = () => {

        /*
        return {
        "R1": ketone_parsed.R1.substr(0,1)==="O"?ketone_parsed.R2:ketone_parsed.R1,
        "Group":"C(=O)O",
        "R2":ketone_parsed.R1.substr(0,1)==="O"?ketone_parsed.R1.substr(1):ketone_parsed.R2
        }
        */
        const ester_parsed = FunctionalGroupParser("ester", SMILES)
        render(
            rule,
            canonical_SMILES,
            functionalGroups.ester[1] + "C(=O)O",
            rule.reagents
        )
    }

    const replaceHalideWithNH2Reverse = () => {
        render(
            rule,
            canonical_SMILES,
            canonical_SMILES.replace("N","Cl"),
            rule.reagents
        )
        render(
            rule,
            canonical_SMILES,
            canonical_SMILES.replace("N","Br"),
            rule.reagents
        )
    }

    const replaceEpoxideOxygenWithDoubleBond = (callback) => {
        /*
        case "epoxide":
        return {
        "R1": R1,
        "R2": R2,
        "R3": R3,
        "R4": R4,
        "Group":"C1OC1"
        }




      return [
    "O",
    canonical_SMILES.match("/^(.*)C[n]/"),// R1
    canonical_SMILES.match("/C[n].*\)(.*)"),// R2
    canonical_SMILES.match("/O[n]\((.*)\) // R3
    canonical_SMILES.match("/O[n]\(.*\)\((.*)\)// R4
    ]



    */
        if (callback){
            callback(
                rule,
                canonical_SMILES,
                functionalGroups.epoxide[1] + "C(" + functionalGroups.epoxide[2]  + ")=C(" + functionalGroups.epoxide[3] + ")" + functionalGroups.epoxide[4],
                rule.reagents

            )

        } else {
            render(
                rule,
                canonical_SMILES,
                functionalGroups.epoxide[1] + "C(" + functionalGroups.epoxide[2]  + ")=C(" + functionalGroups.epoxide[3] + ")" + functionalGroups.epoxide[4],
                rule.reagents

            )
        }
    }

    const replaceHydrogenWithHalideReverse = (callback) => {
        //const SMILES_with_hydrogens = "canonical_SMILES with hydrogens"
// chloroephedrine
// CC(C(C1=CC=CC=C1)Cl)NC

        const halides = ["Cl"]
        halides.map(
            (X) => {
                // [1...canonical_SMILES.length()].map(
                [Canonical_SMILES.length()].map(
                    (i) => {
                        const S = canonical_SMILES.substr(0, i) + X + canonical_SMILES.substr(i)

                        if (S=== false) {
                            return false
                        }

                        MoleculeLookup(db, S, true).then(
                            (substrate) => {
                                callback ? callback(
                                    rule,
                                    canonical_SMILES,
                                    S,
                                    rule.reagents
                                ) : render(
                                    rule,
                                    canonical_SMILES,
                                    S,
                                    rule.reagents
                                )


                            },
                            (Err) => {
                            }
                        )

                    }
                )
            }
        )
    }

    /*
       const amide = () => {
           if ((canonical_SMILES.indexOf("(=O")  !==-1 || canonical_SMILES.indexOf("O=") !==-1) && canonical_SMILES.indexOf("N")) {
               return ketone()
           } else {
               return false
           }
       }
    */
    const ritterReactionReverse = (callback) => {
        /*



               const amine_parsed = CanonicalSmilesParserV2(this.amide[1].indexOf("N")===-1?this.amide[2].indexOf("N"):this.amide[1].indexOf("N"))
        */
        if (functionalGroups.amide===false) {
            return false
        }
        const N_Branch = functionalGroups.amide[1][0]==="N"?functionalGroups.amide[1]:functionalGroups.amide[2]
        const R_Branch = functionalGroups.amide[1][0]==="N"?functionalGroups.amide[2]:functionalGroups.amide[1]

// Replace N group containing carboxyl group wth =C
        if (callback){
            callback(
                rule,
                canonical_SMILES,
                "*C=" + N_Branch.substr(1),
                [this.amide[1]+"C#N"]
            )
        } else {
            render(
                rule,
                canonical_SMILES,
                "*C=" + N_Branch.substr(1),
                [this.amide[1]+"C#N"]
            )
        }
    }

    const amineToAmideReverse = () => {

        /*
        Formic acid + methylamine = N-Methylformamide

        Methylamine
        CN

        (formic acid)
        C(=O)O

        CN + C(=O)O -> CNC=O
        R1CNR2 + R3C(=O)O  -> R1CN(R2)C(R3)=O

        // Reversal
    const amide_parsed = FunctionalGroupParser("amide", SMILES)
    return [
            {
                "substrate": amide_parsed.N_group,
                "reagent": amide_parsed.N_group.R1 + "C(=O)O"
            }
        ]
    */
        render(
            rule,
            canonical_SMILES,
            functionalGroups.amide[1].indexOf("N")===-1?functionalGroups.amide[2]:functionalGroups.amide[1],
            this.amide[1].indexOf("N")===-1?this.amide[2].substr(1):this.amide[1].substr(1)+ "C(=O)O"

        )


    }

    const carboxylicAcidToKetoneReverse = () => {
        /*
         phenylacetic acid
         C1=CC=C(C=C1)CC(=O)O
         R1 C(=O)O
         +
         Acetic anhydride
         CC(=O)OC(=O)C
         R2C(=O)OC(=O)R3
             =
             Phenylacetone
         CC(=O)CC1=CC=CC=C1
         R1 C(=O)R2
        */
        render(
            rule,
            canonical_SMILES,
            "O=(" + this.ketone[1] + ")O",
            rule.reagents
        )
        render(
            rule,
            canonical_SMILES,
            "O=(" + this.ketone[2] + ")O",
            rule.reagents
        )

    }

    const ketoneToPrimaryAmineReverse =  () => {

        render(
            rule,
            canonical_SMILES,
            "O=(" + "O=(" + functionalGroups.primary_amine[1] + ")",
            rule.reagents
        )
    }

    const ketoneToSecondaryAmineReverse = (callback)=> {
        /*
        Leuckart Wallach reaction
        Phenylacetone
        CC(=O)CC1=CC=CC=C1
        N-Methylformamide
        CNC=O
        Methamphetamine
        CC(CC1=CC=CC=C1)NC
        */
        const s_amine = functionalGroups.secondary_amine.filter(
            (atom) => {
                return atom !== 'H'
            }
        )
        callback?callback(
            rule,
            canonical_SMILES,
            "O=" + s_amine[1] + "(" + s_amine[2] + ")",
            rule.reagents
        ):render(
            rule,
            canonical_SMILES,
            "O=" + s_amine[1] + "(" + s_amine[2] + ")",
            rule.reagents
        )
    }

    const ketoneToTertiaryAmineReverse =  () => {
        render(
            rule,
            canonical_SMILES,
            "O=(" + functionalGroups.secondary_amine[1] + ")" + functionalGroups.secondary_amine[2] + "(" + functionalGroups.secondary_amine[3] + ")",
            rule.reagents
        )

    }


// 'O=C(C)Cc1ccc2OCOc2c1 MDP2P
// isosafrole glycol
//    isosafrole glycol - pinacol rearrangement -> MDP2P
// CC(C(C1=CC2=C(C=C1)OCO2)O)O isosafrole glycol
    const pinacolRearrangement = ()=> {

        // 'O=C(C)Cc1ccc2OCOc2c1 MDP2P
        /*
        [O=C,
        C,
        Cc1ccc2OCOc2c1
        ]
        C(Cc1ccc2OCOc2c1)(O) X
        CO(C(O)c1ccc2OCOc2c1)
        "CO(C(O)"+ this.ketone[2] + ")")
        */
        render(
            rule,
            canonical_SMILES,
            "CO(C(O)" + functionalGroups.ketone[2] + ")",
            rule.reagents
        )

    }


    const revertSplitGlycolBackToWhole = (callback) =>{

// Find substrates that contain the ketone product.
        /*
        R1 = functionalGroups.ketone[1]
        R1 = functionalGroups.ketone[2]
        OC(R1)(R2)C(R3)(R4)
        "OC(" + functionalGroups.ketone[1] + ")("  functionalGroups.ketone[2] + ")C.*"

    const carboxylic_acid_SMILES = 'C1OC2=C(O1)C=C(C=C2)COC=O'
            // piperonyl formate


        */


        MoleculeLookup(db, "OC(" + functionalGroups.ketone[1] + ")(" + functionalGroups.ketone[2] + ")C.*", true).then(
            (substrate_JSON_objects) => {
                if (verbose) {
                    console.log('Looked up ' + this.ketone[1] + "(" + this.ketone[2] + ")(O).*") // MDMA, MDP2P, isosafrole glycol
                }

                // For each substrate found call callback
                substrate_JSON_objects.map(
                    (substrate_JSON_object) => {
                        render(
                            rule,
                            canonical_SMILES,
                            substrate_JSON_object,
                            rule.reagents
                        )

                    }
                )


            }
        )

    }

    /*
    const addAtomGroupBranch = (atom_group, callback ) => {
        // 'CC(CC1=CC2=C(C=C1)OCO2)NC'
        //[0...canonical_SMILES.length-1].map(
        canonical_SMILES.map(
            (index) => {
                callback ? callback(
                    rule,
                    canonical_SMILES,
                    index === 0 ?
                        '(' + atom_group + ')'
                        +  canonical_SMILES ?
                            index === canonical_SMILES.length - 1 ? substrate_JSON_object + '(' + atom_group + ')'
                                : canonical_SMILES.substr(0, index) + '(' + atom_group + ')' + canonical_SMILES.substr(index + 1),
                    rule.reagents
                ) : render(
                    rule,
                    canonical_SMILES,
                    index === 0 ?
                        '(' + atom_group + ')' + substrate_JSON_object ?
                            index === canonical_SMILES.length - 1 ? substrate_JSON_object + '(' + atom_group + ')' : canonical_SMILES.substr(0, index) + '(' + atom_group + ')' + canonical_SMILES.substr(index + 1),
                    rule.reagents
                )
            }
        )
    }
     */

// (O)CC(CC1=CC2=C(C=C1)OCO2)NC
// C(O)C(CC1=CC2=C(C=C1)OCO2)NC
// CC(O)(CC1=CC2=C(C=C1)OCO2)NC
// CC(C(O)C1=CC2=C(C=C1)OCO2)NC 1-(1,3-Benzodioxole-5-yl)-2-(methylamino)-1-propanol
// CC(CC1(O)=CC2=C(C=C1)OCO2)NC
// CC(CC1=C(O)C2=C(C=C1)OCO2)NC 5-[2-(Methylamino)propyl]-1,3-benzodioxol-4-ol
// CC(CC1=CC2(O)=C(C=C1)OCO2)NC
// CC(CC1=CC2=C(O)(C=C1)OCO2)NC
// CC(CC1=CC2=C(O)(C=C1)OCO2)NC
// CC(CC1=CC2=C(C(O)=C1)OCO2)NC 6-[2-(Methylamino)propyl]-1,3-benzodioxol-4-ol
// CC(CC1=CC2=C(C=C1(O))OCO2)NC
//    6-[2-(Methylamino)propyl]-1,3-benzodioxol-5-ol
// CC(CC1=CC2=C(C=C1)O(O)CO2)NC
// CC(CC1=CC2=C(C=C1)OC(O)O2)NC
// CC(CC1=CC2=C(C=C1)OCO2)NC
// CC(CC1=CC2=C(C=C1)OCO2)(O)NC
// CC(CC1=CC2=C(C=C1)OCO2)(O)N(O)C
// CC(CC1=CC2=C(C=C1)OCO2)(O)NC(O)
    const removeAlcoholGroupReverse = (callback) =>{
        this.addAtomGroupBranch("O", callback)
    }

    const replaceHalideWithNCReverse = () =>{
// 'CC(CC1=CC2=C(C=C1)OCO2)NC'
// CC(CC1=CC2=C(C=C1)OCO2)Cl 5-(2-chloropropyl)-1,3-benzodioxole




        render(
            rule,
            canonical_SMILES,
            canonical_SMILES.replace("NC","Cl"),
            rule.reagents
        )

// 5-(2-bromopropyl)-1,3-benzodioxole
        render(
            rule,
            canonical_SMILES,
            canonical_SMILES.replace("NC","Br"),
            rule.reagents
        )
        render(
            rule,
            canonical_SMILES,
            canonical_SMILES.replace("NC","F"),
            rule.reagents
        )
        render(
            rule,
            canonical_SMILES,
            canonical_SMILES.replace("NC","I"),
            rule.reagents
        )
        render(
            rule,
            canonical_SMILES,
            canonical_SMILES.replace("NC","At"),
            rule.reagents
        )


    }



    const ___replaceCarboxylWithNCReverse = () =>{

    }



    const __replaceCarboxylWithNCCReverse = () =>{
        return canonical_SMILES.replace("NC(C)","(=O)")
    }

    const __replaceCarboxylWithNReverse = () =>{
        return canonical_SMILES.replace("N","(=O)")
    }


    const aldehydeToSecondaryAmineReverse = (callback)=>{
// CC(CC1=CC2=C(C=C1)OCO2)NC
// CC(CC1=CC2=C(C=C1)OCO2)(=O)
//return canonical_SMILES.replace("NC","(=O)")
//const aldehyde_SMILES = canonical_SMILES.replace("NC","(=O)")
// Verify we have an aldehyde
//const p = CanonicalSMILESParserV2(aldehyde_SMILES, db, rule, render  )
        rule.reagents.delete("NR")
        rule.reagents.push(functionalGroups.secondaryAmine[1])
        if (callback) {
            callback(
                rule,
                canonical_SMILES,
                "O=C("+functionalGroups.secondaryAmine[2]+")",
                //    "O=C(C)

                rule.reagents
            )
            rule.reagents.delete(functionalGroups.secondaryAmine[1])
            rule.reagents.push(functionalGroups.secondaryAmine[2])
            callback(
                rule,
                canonical_SMILES,
                "O=C("+functionalGroups.secondaryAmine[1]+")",
                //    "O=C((CC1=CC2=C(C=C1)OCO2))


                rule.reagents
            )

        } else {
            render(
                rule,
                canonical_SMILES,
                "O=C("+functionalGroups.secondaryAmine[2]+")",
                rule.reagents
            )
            rule.reagents.delete(functionalGroups.secondaryAmine[1])
            rule.reagents.push(functionalGroups.secondaryAmine[2])
            render(
                rule,
                canonical_SMILES,
                "O=C("+functionalGroups.secondaryAmine[1]+")",
                rule.reagents
            )
        }
    }

    const aldehydeToPrimaryAmineReverse = () =>{
//const aldehyde_SMILES = __replaceCarboxylWithNReverse()
// Verify we have an aldehyde
// const p = CanonicalSMILESParserV2(aldehyde_SMILES, db, rule, render  )
        rule.reagents.delete("NR")
        rule.reagents.push("N")
        render(
            rule,
            canonical_SMILES,
            "O=C("+functionalGroups.secondaryAmine[1]+")",
            rule.reagents
        )
        rule.reagents.delete(functionalGroups.amine[1])
        rule.reagents.push(functionalGroups.amine[2])
        render(
            rule,
            canonical_SMILES,
            aldehyde_SMILES,
            rule.reagents
        )


    }

    const aldehydeToTertiaryAmineReverse = () =>{
// const aldehyde_SMILES = __replaceCarboxylWithNCCReverse()
// Verify we have an aldehyde
// const p = CanonicalSMILESParserV2(aldehyde_SMILES, db, rule, render  )
// if (p.functionalGroups.aldehyde!==false {
        rule.reagents.delete("NR")
        rule.reagents.push(functionalGroups.secondaryAmine[1])
        render(
            rule,
            canonical_SMILES,
            "O=C("+functionalGroups.secondaryAmine[2]+")",
            rule.reagents
        )
        rule.reagents.delete(functionalGroups.secondaryAmine[1])
        rule.reagents.push(functionalGroups.secondaryAmine[2])
        render(
            rule,
            canonical_SMILES,
            "O=C("+functionalGroups.secondaryAmine[1]+")",
            rule.reagents
        )
        rule.reagents.delete(functionalGroups.secondaryAmine[2])
        rule.reagents.push(functionalGroups.secondaryAmine[1])
        render(
            rule,
            canonical_SMILES,
            "O=C("+functionalGroups.secondaryAmine[3]+")",
            rule.reagents
        )
        rule.reagents.delete(functionalGroups.secondaryAmine[1])
        rule.reagents.push(functionalGroups.secondaryAmine[2])
        render(
            rule,
            canonical_SMILES,
            "O=C("+functionalGroups.secondaryAmine[3]+")",
            rule.reagents
        )
        rule.reagents.delete(functionalGroups.secondaryAmine[2])
        rule.reagents.push(functionalGroups.secondaryAmine[3])
        render(
            rule,
            canonical_SMILES,
            "O=C("+functionalGroups.secondaryAmine[1]+")",
            rule.reagents
        )
        render(
            rule,
            canonical_SMILES,
            "O=C("+functionalGroups.secondaryAmine[2]+")",
            rule.reagents
        )


    }


    return {
        functionalGroups: functionalGroups,
        ketoneToSecondaryAmineReverse: ketoneToSecondaryAmineReverse,
        amineToAmideReverse: amineToAmideReverse,
        carboxylicAcidToKetoneReverse:carboxylicAcidToKetoneReverse,
        alkeneToAmideReverse:alkeneToAmideReverse,
        revertSplitGlycolBackToWhole:revertSplitGlycolBackToWhole,
        replaceSingleAtom: replaceSingleAtom,
        replaceHalideWithNH2Reverse:replaceHalideWithNH2Reverse,
        replaceHydrogenWithHalideReverse:replaceHydrogenWithHalideReverse,
        wackerOxidationReverse : wackerOxidationReverse ,
        replaceORGroupOnCarboxylCarbonWithOCation: replaceORGroupOnCarboxylCarbonWithOCation,
        replaceCarboxylOxygenWithCR: replaceCarboxylOxygenWithCR,
        esterToAlcoholReverse: esterToAlcoholReverse,
        AcidCatalyzedRingOpening: AcidCatalyzedRingOpening,
        alcoholToEpoxide: alcoholToEpoxide,
        pinacolRearrangement: pinacolRearrangement,
        replaceORGroupOnCarboxylCarbonWithOH: replaceORGroupOnCarboxylCarbonWithOH,
        replaceEpoxideOxygenWithDoubleBond: replaceEpoxideOxygenWithDoubleBond,
        ketoneToTertiaryAmineReverse: ketoneToTertiaryAmineReverse,
        ketoneToPrimaryAmineReverse: ketoneToPrimaryAmineReverse,
        removeAlcoholGroupReverse: removeAlcoholGroupReverse,
        replaceHalideWithNCReverse: replaceHalideWithNCReverse,

        aldehydeToSecondaryAmineReverse:aldehydeToSecondaryAmineReverse,
        aldehydeToPrimaryAmineReverse:aldehydeToPrimaryAmineReverse,
        aldehydeToTertiaryAmineReverse:aldehydeToTertiaryAmineReverse,
    }

}


module.exports = CanonicalSMILESParserV2








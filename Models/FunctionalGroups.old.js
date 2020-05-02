const FunctionalGroups = (molecule_json_object) => {

    const normalizeSMILES = () => {
        return molecule_json_object.CanonicalSMILES
    }

    const canonical_SMILES = normalizeSMILES()

    const ketone = () => {

        if (canonical_SMILES.indexOf("=O") === -1) {
            return false
        }

        if (canonical_SMILES.indexOf("=O") === 0) {
            return [
                "O",
                canonical_SMILES.substr(3).replace(/\(.*\)/, ""),
                canonical_SMILES.substr(3).match(/\(.*\)/) === null ? canonical_SMILES.substr(3) : canonical_SMILES.substr(3).match(/\(.*\)/).pop()
            ]
        }

        if (canonical_SMILES.indexOf("=O") ===canonical_SMILES.length-2 ) {

            return [
                "O",
                canonical_SMILES.substr(0,canonical_SMILES.length-3),
                ""
            ]
        }

        return [
            "O",
            canonical_SMILES.substr(canonical_SMILES.indexOf("(=O") + 4),
            canonical_SMILES.substr(0, canonical_SMILES.indexOf("(=O")-1), // CC
        ]

    }


    const amide = () => {
        if ((canonical_SMILES.indexOf("(=O") !== -1 || canonical_SMILES.indexOf("O=") !== -1) && canonical_SMILES.indexOf("N")!==-1) {
            return ketone()
        } else {
            return false
        }
    }

    const glycol = () => {

        // Should be not glycol - C1OC2=C(O1)C=C(C=C2)CC(=O)O
        // Example glycol (propyline glycol)
        // CC(CO)O
        if (canonical_SMILES.substr(canonical_SMILES.length-4) !== "CO)O") {
            return false
        }

        return [

            canonical_SMILES.match(/^(.*?)C\(.*\).*O$/)===null?"H":canonical_SMILES.match(/^(.*?)C\(.*\).*O$/).pop(),

            canonical_SMILES.match(/^.*C\(.*\)(.*)O$/)===null?"H":canonical_SMILES.match(/^.*C\(.*\)(.*)O$/).pop(),

            canonical_SMILES.match(/^.*C\(C\((.*)\).*O\).*O$/)===null?"H":canonical_SMILES.match(/^.*C\(C\((.*)\).*O\).*O$/).pop(),

            canonical_SMILES.match(/^.*C\(C\(.*\)(.*)O\).*O$/)===null?"H":canonical_SMILES.match(/^.*C\(C\(.*\)(.*)O\).*O$/).pop()


        ]
    }

    const amine = (() => {

        if (!molecule_json_object.CanonicalSMILES) {
            console.log('FunctionalGroups.js (amine) error getting smiles')
            console.log(molecule_json_object)
            process.exit()

        }
        if (molecule_json_object.CanonicalSMILES.indexOf("N") === -1) {
            return false
        }

        const m1 = canonical_SMILES.match(/(.*)\(.*\)N/)
        return [
            "N",
            canonical_SMILES.substr(canonical_SMILES.indexOf("N") + 1).match(/\(.*\)/) === null ? "H" :
                canonical_SMILES.substr(canonical_SMILES.indexOf("N") + 1).match(/\(.*\)/) === null ? "H" : canonical_SMILES.substr(canonical_SMILES.indexOf("N") + 1).match(/\(.*\)/).pop(), // C

            m1===null?"H":m1[0].substr(0,m1[0].length-1), // (m[0].length>1?”(“+m[0].substr(0,m[0].length-1)+”)”:””) + “(“ + m[1] + “)”
            canonical_SMILES.substr(canonical_SMILES.indexOf("N") + 1).replace(/\(.*\)/, "") // C

        ]

    }).call()

    const primaryAmine = () => {
        return amine === false ? false :
            (amine.filter((branch) => {
                    return branch === "H"
                }).length === 2 ? amine : false

            )
    }

    const secondaryAmine = () => {
        // [ 'N', 'H', 'CC(CC1=CC2=C(C=C1)OCO2)', 'C' ]
        return amine === false ? false :
            (amine.filter((branch) => {
                    return branch === "H"
                }).length === 1 ? amine : false
            )
    }


    const tertiaryAmine = () => {
        return amine === false ? false :
            (amine.filter((branch) => {
                    return branch === "H"
                }).length === 0 ? amine : false
            )
    }


    const epoxide = () => {

        if ((canonical_SMILES.indexOf("CO1") === -1 && canonical_SMILES.indexOf("C(O1") === -1)
            || canonical_SMILES.substr(canonical_SMILES.length -1) === "O" || canonical_SMILES.indexOf("=O")!==-1) {
            return false
        }

        /*
        Atoms to the left of C1 are R1 atoms
        Atoms to the right of C1(.*) are R2 atoms
        Atoms branching off epoxide C and not O1 are R3 and R4 atoms
        */

        return [
            "O",
            canonical_SMILES.match(/^(.*)C1/)===null?"H":canonical_SMILES.match(/^(.*)C1/).pop(),// R1
            canonical_SMILES.match(/C1.*\)(.*)$/)===null?"H":canonical_SMILES.match(/C1.*\)(.*)$/).pop(), // R2
            canonical_SMILES.match(/.*O1\)\((.*?)\)/)===null?"H":canonical_SMILES.match(/.*O1\)\((.*?)\)/).pop(), // R3
            canonical_SMILES.match(/.*O1\)\(.*?\)(.*)\)/)  === null? "H":canonical_SMILES.match(/.*O1\)\(.*?\)(.*)\)/).pop()//R4
        ]

    }


    const alcohol = () => {

        if (glycol()){
            return false
        }
        if (canonical_SMILES[canonical_SMILES.length- 2] !== "CO" && canonical_SMILES[canonical_SMILES.length- 4] !== "C(O)" && canonical_SMILES[canonical_SMILES.length-2] !== ")O" ) {
            return false
        }

        return [
            "OH",
            canonical_SMILES[canonical_SMILES.length- 2] !== "CO"?canonical_SMILES.match(/(.*)O/).pop():canonical_SMILES.match(/(.*)\(O/).pop()
        ]


    }

    const aldehyde = () => {
        const k = ketone()
        return k[1] === "" || k[2] == "" ? k : false
    }

    const ester = () => {

        const k = ketone()
        if (k===false) {
            return false
        }

        //if (k[0].indexOf("O") !== 0 && (k[2].indexOf("O") ===-1 || k[2].indexOf("O") !== 0)) {
        if (k[2].indexOf("O") ===-1) {
            return false
        }
        return [
            k[0],
            k[0].indexOf("O") === 0 ? k[1] : k[2],
            k[0].indexOf("O") === 0 ? k[2] : k[1],
        ]

    }

    const methylKetone = () => {
        // CC(=O)CC1=CC2=C(C=C1)OCO2
        const k = ketone()
        return k === false || (k[1]!=="C" && k[2] !=="C")?false:k
    }

    const terminalAlkene = () => {
        // C=CCC1=CC2=C(C=C1)OCO2
        return canonical_SMILES.indexOf("C=C")===0?[canonical_SMILES]:false
    }
    
const __split_alkene = (left, SMILES, right ) => {
    const alkene_groups = canonical_SMILES.match(/(.*?C[0-9]*?)\=(C[0-9]*.*)/)
// console.log(alkene_molecule.CanonicalSMILES.match(/(.*?C[0-9]*?)\=(C[0-9]*.*)/))
/*
[ 'C=CCC1=CC2=C(C=C1)OCO2',
  'C',
  'CCC1=CC2=C(C=C1)OCO2',
  index: 0,
  input: 'C=CCC1=CC2=C(C=C1)OCO2' ]
 */
if (alkene_groups === null) {
    return false
}
    return [[left + alkene_groups[1], alkene_groups[2] + right]]
}


    const alkene = () => {
        // C=CCC1=CC2=C(C=C1)OCO2

       const alkene_groups_formatted = __split_alkene("", canonical_SMILES, "")

        if (alkene_groups_formatted===false) {
            return false
        }

        const alkene_group = __split_alkene(alkene_groups_formatted[0], alkene_groups_formatted[0], "")


      alkene_groups_formatted.push(alkene_group)
        return alkene_groups_formatted
        
        /*
        return alkene_groups_formatted.reduce(
           (total, currentValue, currentIndex, arr)=> {
               const alkene_group = __split_alkene("", canonical_SMILES, "")
           },
            alkene_groups_formatted
            )
            */
    }

    const functionalGroups = {
        "ketone": ketone(),
        "tertiary_amine": tertiaryAmine(),
        "secondary_amine": secondaryAmine(),
        "primary_amine": primaryAmine(),
        "amide": amide(),
        "epoxide": epoxide(),
        "ester": ester(),
        "glycol": glycol(),
        "alcohol": alcohol(),
        "aldehyde": aldehyde(),
        "methyl_ketone": methylKetone(),
        "terminal_alkene": terminalAlkene(),
        "alkene": alkene()

    }

    const functionalGroupsList = () => {
        return [
            functionalGroups.tertiary_amine ? "tertiary amine" : false,
            functionalGroups.secondary_amine ? "secondary amine" : false,
            functionalGroups.primary_amine ? "primary amine" : false,
            functionalGroups.amide ? "amide" : false,
            functionalGroups.epoxide ? "epoxide" : false,
            functionalGroups.ester ? "ester" : false,
            functionalGroups.glycol ? "glycol" : false,
            functionalGroups.alcohol ? "alcohol" : false,
            functionalGroups.aldehyde ? "aldehyde" : false,
            functionalGroups.ketone ? "ketone" : false,
            functionalGroups.methyl_ketone? "methyl ketone" : false,
            functionalGroups.terminal_alkene? "terminal alkene" : false,
            functionalGroups.alkene? "alkene" : false
        ].filter(
            (item) => {
                return item !== false
            }
        )

    }


    return {
        functionalGroups: functionalGroups,
        functionalGroupsList: functionalGroupsList

    }

}

module.exports = FunctionalGroups












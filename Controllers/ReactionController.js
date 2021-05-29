/* ReactionController
See note (7) REAGENTS
See note (24)
See note (25) Alkyl halides
*/
const HydroHalogenationReaction = require('../Reactions/HydrohalogenationReaction')

const uniqid = require('uniqid')

const ReactionController = () => {

return {

    react: (molecule, reagent, solvent, product, db, callback) => {

        if (molecule.is_carbonyl) {
            if (reagent.chemicalFormula == "CRO3" ) {
                // => OxidationReaction() -> Adds oxygen to hydrogen on the carbonyl
                OxidationReactiomReaction(molecule, reagent, solvent, product)
            }
            if (reagent.chemicalFormula == "LiAlH4" || reagent.chemicalFormula == "CH3CMgBr"){
                  // -> breaks double bond ReactionSchemaParser 
                // if CH3CMgBr -> Adds CH2CH3 to carbonyl and turns it into a nucleophile.
                NucleophileAddictionReaction(molecule, reagent, solvent, product)
            }
        }

        // Functional group is Alkyl halide (alkane with one or more hydrogens replaced with a halogen?
        if (molecule.isAkylHalide()) {

            if (reagent === null && solvent === null && product === null) {
                console.log("Reversing Hydrohalogenation reaction")
                return callback(null, null)
            } else {

                if (reagent.atoms.length === 2 && reagent.atoms.filter((atom) => atom.isMetal()).length === 1) {
                    SN1(molecule, reagent, solvent, product)
                }
                // Reagent is [metal]CN? (sodium cyanide)
                if (reagent.chemicalFormula == "NaCN") {
                    // => SN2() -> replaces Halide with CN
                    SN2Reaction(molecule, reagent, solvent, product)
                }

                if (reagent.chemicalFormula == "KOBu" || (reagent.atoms.filter((atom) => atom.isNucleophile() && (atom.atomicSymbol === "N-" || atom.atomicSymbol === "O-")).length > 0)) {
                    // Reagent has O- or N-?
                    // -> EliminationReaction() -> replaces Halide with double bond.
                    // ReactionSchemaParser
                    E2Reaction(molecule, reagent, solvent, product)
                }
                if (reagent.functionalGroups.isAlcohol) {
                    SN1(starting_molecule, reagent, solvent, product)
                }

            }
        }

        if (molecule.is_alcohol) {
            if (reagent.chemicalFormula == "SOCl2") {
                //Replaces OH with chlorine
                ChlorinationReaction(molecule, reagent, solvent, product)
            }
            if (reagent.chemicalFormula == "POCl2") {
                 // Replaces OH with a double bond ReactionSchemaParser
                DehydrationReaction(molecule, reagent, solvent, product)
            }

            if (reagent.isAcid) {
                // If you have an alcohol and you treat it with an acid get Sn1 mechanism
                SN1Reaction(molecule, reagent, solvent, product)
            }

        }


        // For both alkene and ketone when we are adding an oxygen reagent we are adding an oxygen.
        if (molecule.is_alkene) {

            if (reagent.chemicalFormula == "OsO4") {
                DihydoxylatiobReaction(molecule, reagent, solvent, product)
            }

             // eg HCl
            if (reagent.is_halogenic_acid) {
                //      => HydrohalogenationReaction() 
                // See markeovinov anti-markinov addition to an alkene,
                HydroHalogenationReaction(molecule, reagent, false, db, callback)
            } else if (reagent.isHydroBorate) {
                HydroBorationReaction(molecule, reagent, solvent, product)
            } else if (reagent.chemicalFormula === "BR2") {
                // -> BrominationReaction() -
                // and adds bromine
                BrominationReaction(molecule, reagent, solvent, product)
            } else if (reagent.isPeroxyAcid || reagent.chemicalFormula === "H2O2"){
                // Oxygen with hydrogen, use to change alkene to carbonyl
                // Breaks double bond and adds an a 3 member ring containing oxygen
                EpoxidationReaction(molecule, reagent, solvent, product)
            }else if (product !== null && product.canonicalSMILES === "CC1OCC1"){
                // lookup H2O2
               // ReactionSchemaParser
                // Breaks double bond and adds an a 3 member ring containing oxygen
                EpoxidationReaction(molecule, H2O2_JSON_obj, solvent, product)
            }else if (reagent !== null && reagent.chemicalFormula === "OsO4" ){
                // Adds two oxygens
               // ReactionSchemaParser
                DihydroxylationReaction(molecule, reagent, solvent, product)
            }else if (reagent !== null && reagent.chemicalFormula === "O3" ){
                // Adds two carbonyl functional groups
                OzonolysisReaction(molecule, reagent, solvent, product)
            }

        }

        if (molecule.is_ketone) {
            if (reagent.isPeroxyAcid){
                // Oxygen is inserted between C and CH3 on the ketone 
             // ReactionSchemaParser
            BaeyerVilligerOxidationReaction(molecule, reagent, solvent, product)
            }
        }

        if (molecule.is_aldehyde) {
            if (reagent.chemicalFormula==="CrO3"){
                // Produces carboxylic acid
// ReactionSchemaParser
                OxidationReaction(molecule, reagent, solvent, product)
            }
        }
    }
}
}


module.exports = ReactionController














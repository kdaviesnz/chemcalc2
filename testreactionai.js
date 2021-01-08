const ReactionAI =  require('./Components/State/ReactionAI')
const MoleculeFactory = require('./Models/MoleculeFactory')
const VMolecule = require('./Components/Stateless/Views/Molecule')

// Chemicals to synthesise

const imine2 = MoleculeFactory("CC(CC1=CC=CC=C1)=NC") // phenylacetone
//console.log(VMolecule([imine2,1]).compressed())
//console.log(VMolecule([imine2,1]).canonicalSMILES())
//console.log(mnb)


// https://en.wikipedia.org/wiki/Pinacol_rearrangement
const pinacolone = MoleculeFactory("CC(=O)C(C)(C)C")

//https://en.wikipedia.org/wiki/Leuckart_reaction
const isopropylamine = MoleculeFactory("CC(C)N")
const m = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
const m2 = MoleculeFactory("CC(CC1=CC2=C(C=C1)OCO2)N")
//console.log(VMolecule([m2,1]).compressed())
//console.log(m2[1][22])
//console.log(hjkkkll)
//console.log(VMolecule([m,1]).canonicalSMILES())
//console.log(hjkkkll)
const imine = MoleculeFactory("CC(CC1=CC2=C(C=C1)OCO2)=NC")
const r = new ReactionAI()
// r.synthesise(pinacolone)
//r.synthesise(isopropylamine)

//r.synthesise(imine)
// r.synthesise(m2)
//r.synthesise(imine2)
r.synthesise(m)


// Epoxide acidic ring opening
// https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(McMurry)/Chapter_18%3A_Ethers_and_Epoxides%3B_Thiols_and_Sulfides/18.06_Reactions_of_Epoxides%3A_Ring-opening


// ANTI-DIHYDROXYLATION
// https://chem.libretexts.org/Courses/Sacramento_City_College/SCC%3A_Chem_420_-_Organic_Chemistry_I/Text/09%3A_Reactions_of_Alkenes/9.13%3A_Dihydroxylation_of_Alkenes


// ANTI-DIHYDROXYLATION
// https://chem.libretexts.org/Courses/Sacramento_City_College/SCC%3A_Chem_420_-_Organic_Chemistry_I/Text/09%3A_Reactions_of_Alkenes/9.13%3A_Dihydroxylation_of_Alkenes

// OXYMERCURATION - DEMERCURATION
// https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(Wade)/09%3A_Reactions_of_Alkenes/9.05%3A_Hydration_by_Oxymercuration-Demercuration
/*
Notice that overall, the oxymercuration - demercuration mechanism follows Markovnikov's Regioselectivity with the OH group attached to the most substituted carbon and the H attached to the least substituted carbon. The reaction is useful, because strong acids are not required and carbocation rearrangements are avoided because no discreet carbocation intermediate forms.
 */
// https://www.masterorganicchemistry.com/2011/08/12/reagent-friday-sodium-borohydride-nabh4/#:~:text=What%20it's%20used%20for%3A%20Sodium,aldehydes%20and%20ketones%20to%20alcohols.
// https://www.chemistrysteps.com/oxymercuration-demercuration/


// Saponification
/*
{
    "_id": {
        "$oid": "5dc78ffe5f099c87386137d9"
    },
    "commands": [
    "PROTONATE oxygen on double bond" - protonate =O (nucleophile) using H from oxydanium  [OH3+]. =O should now have a positive charge. O on oxydanium should have no charge.
    "BREAK carbon oxygen double bond" - C=O bond breaks. C atom should now have a + charge (electrophile). =O atom should have no charge.
    "HYDRATE" O atom on water attacks the C atom on the former C=O bond. O atom from water should now have positive charge.
    "proton transfer" Proton on O atom from water transfers to other O, giving that O a positive charge
    "BREAK bond" - C-O+ breaks forming alcohol leaving group. C atom should now have positive charge (electrophile)
    "BOND atoms" - O atom on O-C+ bond attacks C+ atom, forming double bond and creating a carboxylic acid.
    ],
    "description": "",
    "links": [
    "https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(Smith)/Chapter_22%3A_Carboxylic_Acids_and_Their_Derivatives—_Nucleophilic_Acyl_Substitution/22.11%3A_Reactions_of_Esters",
    "https://en.m.wikipedia.org/wiki/Carboxylate",
    "https://www.sciencedirect.com/topics/chemistry/carboxylic-ester",
    "https://www.angelo.edu/faculty/kboudrea/index_2353/Chapter_05_2SPP.pdf"],
    "step": "",
    "catalyst": "[Na][OH-]",
    "parent mechanism": [""],
    "mechanism": "Saponification",
    "substrate": {
        "functional group": "carboxylate ester"
    },
    "reagents": ["[OH3+]", "", "", "", "", "", ""],
    "products": ["carboxylate acid", "alcohol"]
}
 */


// Expoxide ring opening via methoxide
// https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(McMurry)/Chapter_18%3A_Ethers_and_Epoxides%3B_Thiols_and_Sulfides/18.06_Reactions_of_Epoxides%3A_Ring-opening



// AMINES
// mechanism: Leukart Wallach reaction
// https://en.wikipedia.org/wiki/Leuckart_reaction


// Pinacol rearrangement
// substrate 1,2 Diol
// https://en.wikipedia.org/wiki/Pinacol_rearrangement



// Ritter Reaction
//https://en.wikipedia.org/wiki/Ritter_reaction


// alkylation ?
//  5-(2-bromopropyl)-1,3-benzodioxole
// CC(CC1=CC2=C(C=C1)OCO2)Br -> CC(CC1=CC2=C(C=C1)OCO2)N
// (Reverse) protonate nitrogen (deprotonateReverse)  -> add halide (removeHalideReverse)
// -> remove NH3 bond (bondSubstrateToReagentReverse)
// Reagent = NH3


// https://www.thoughtco.com/types-of-chemical-reactions-604038

//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const CreateEnolate = (mmolecule, reagent, rule, DEBUG) => {

    // @see https://chem.libretexts.org/Courses/Oregon_Institute_of_Technology/OIT%3A_CHE_332_--_Organic_Chemistry_II_(Lund)/7%3A_Acid-base_Reactions/07%3A_Carbon_Acids
    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG)

    const result = reaction.createEnolate()

    return result  === false? false : [
        reaction.container_substrate,
        reaction.container_reagent
    ]
}

module.exports = CreateEnolate
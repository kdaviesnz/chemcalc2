//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const ReductiveAmination = (mmolecule, reagent, rule, DEBUG, horizonalCallback, horizonalFn, commands) => {

    const reaction = new Reaction(mmolecule, reagent, rule, DEBUG, horizonalCallback, horizonalFn, commands)

    const result = reaction.reductiveAmination()

    if(undefined !== commands[i+1]) {
        horizonalCallback(i+1, horizonalCallback)
    }

    if (result !== false) {
        const start = horizonalFn(result[0], result[1], commands)
        start(0, horizonalCallback)
    }

    /*
    return result  === false? false : [
        reaction.container_substrate,
        reaction.container_reagent
    ]
     */
}

module.exports = ReductiveAmination
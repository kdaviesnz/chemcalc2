//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const ReductiveAminationReverse = (mmolecule, reagent, rule, DEBUG, horizontalCallback, horizontalFn, commands, i, carbon_index) => {

    console.log("Calling ReductiveAminationReverse")

    const reaction = new Reaction([mmolecule,1], reagent, rule, DEBUG, horizontalCallback, horizontalFn, commands)
    const result = reaction.reductiveAminationReverse(carbon_index)

    if(undefined !== commands[i+1]) {
        console.log("ReductiveAminationReverse -> next command")
        console.log(commands[i+1])
        horizontalCallback(i+1, horizontalCallback)
    }

    if (result !== false) {
        const start = horizontalFn(result[0], result[1], commands)
        start(0, horizontalCallback)
    }

    /*
    return result  === false? false : [
        reaction.container_substrate,
        reaction.container_reagent
    ]
     */
}

module.exports = ReductiveAminationReverse
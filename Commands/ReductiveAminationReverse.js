//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')

const ReductiveAminationReverse = (mmolecule, reagent, rule, horizontalCallback, horizontalFn, commands, i, carbon_index) => {

    console.log("Calling ReductiveAminationReverse")
    console.log("Commands/ReductiveAminationReverse substrate before calling reductiveAminationReverse")

    if (carbon_index !== undefined) {
        console.log("Commands/ReductiveAminationReverse carbon index:" + carbon_index)
    }

    const reaction = new Reaction([mmolecule,1], reagent, rule, true, horizontalCallback, horizontalFn, commands, i)
    const result = reaction.reductiveAminationReverse(carbon_index, true)


    if(undefined !== commands[i+1]) {
        console.log("ReductiveAminationReverse -> next command")
        console.log(commands[i+1])
        horizontalCallback(i+1, horizontalCallback)
    }

    if (result !== false && result !==undefined) {
        console.log("Commands/ReductiveAminationReverse result:")
        console.log(result[0])
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
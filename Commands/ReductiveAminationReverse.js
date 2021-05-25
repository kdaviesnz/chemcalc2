//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')

const ReductiveAminationReverse = (mmolecule, reagent, rule, horizontalCallback, horizontalFn, commands, i, carbon_index) => {

    console.log("Calling ReductiveAminationReverse - i " +i + " " + VMolecule([mmolecule,1]).canonicalSMILES())


    const reaction = new Reaction([mmolecule,1], [reagent,1], rule, false, horizontalCallback, horizontalFn, commands, i)
    const result = reaction.reductiveAminationReverse(carbon_index, false)

    if(undefined !== commands[i+1]) {
        console.log("ReductiveAminationReverse -> next command")
        console.log(commands[i+1])
        horizontalCallback(i+1, horizontalCallback)
    }

    if (result !== false && result !==undefined) {
        console.log("Commands/ReductiveAminationReverse result:")
        console.log(VMolecule(result[0]).canonicalSMILES())
        process.error()
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
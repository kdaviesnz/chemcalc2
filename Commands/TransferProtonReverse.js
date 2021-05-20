//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")

const TransferProtonReverse =  (mmolecule, reagent, rule, DEBUG, horizontalCallback, horizontalFn, commands, i) => {

    console.log("Calling TransferProtonReverse()")

    const reaction = new Reaction([mmolecule,1], reagent, rule, DEBUG, horizontalCallback, horizontalFn, commands)
    const result = reaction.reductiveAminationReverse()

    if(undefined !== commands[i+1]) {
        console.log("TransferProtonReverse -> next command")
        console.log(commands[i+1])
        horizontalCallback(i+1, horizontalCallback)
    }

    console.log("TransferProtonReverse -> result")
    console.log(result)
    process.error()
    // vertical callback
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

module.exports = TransferProtonReverse
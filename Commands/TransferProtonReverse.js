//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')

const TransferProtonReverse =  (mmolecule, reagent, rule, horizontalCallback, horizontalFn, commands, i) => {

    console.log("Calling TransferProtonReverse()")

    console.log("Commands/TransferProtonReverse substrate before calling transferProtonReverse")
    console.log(VMolecule([mmolecule,1]).compressed())
    console.log(i)

    const reaction = new Reaction([mmolecule,1], reagent, rule, true, horizontalCallback, horizontalFn, commands, i)
    const result = reaction.transferProtonReverse()


    if(undefined !== commands[i+1]) {
        console.log("TransferProtonReverse -> next command")
        console.log(commands[i+1])
        horizontalCallback(i+1, horizontalCallback)
    }

    console.log("TransferProtonReverse -> result")
    console.log(result)

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
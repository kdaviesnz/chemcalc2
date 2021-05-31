//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')
const _ = require('lodash')

const ReductiveAminationReverse = (mmolecule, reagent, rule, horizontalCallback, horizontalFn, commands, i, renderCallback, carbon_index) => {

    console.log("Calling ReductiveAminationReverse - i " +i + " Starting " + VMolecule([mmolecule,1]).canonicalSMILES() + " Starting reagent:" + VMolecule([reagent,1]).canonicalSMILES())


    const reaction = new Reaction([mmolecule,1], [reagent,1], rule, false, horizontalCallback, horizontalFn, commands, i, renderCallback, carbon_index)
    const result = reaction.reductiveAminationReverse(carbon_index, false)

    if(undefined !== commands[i+1]) {
        console.log("ReductiveAminationReverse -> next command")
        console.log(commands[i+1])
        horizontalCallback(i+1, horizontalCallback)
    }

    /*
    const horizontalFn = (target, reagent, reaction_commands) => (i, horizontalCallback, renderCallback) => {
    const rule = ""
    if (target === undefined) {
        console.log("target is undefined")
        process.error()
    }
    commands[i](target, reagent, rule, horizontalCallback, horizontalFn, reaction_commands, i, renderCallback)
}

me = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
methylamine = MoleculeFactory("CN")
const horizontalCallback = horizontalFn(_.cloneDeep(me), _.cloneDeep(methylamine), _.cloneDeep(commands))
horizontalCallback(0, horizontalCallback, renderCallback)
     */

    // Vertical
    if (result !== false && result !==undefined) {
        console.log("Commands/ReductiveAminationReverse result:")
        //console.log(result[0])
        horizontalCallback = horizontalFn(_.cloneDeep(result[0][0]), _.cloneDeep(result[1][0]), _.cloneDeep(commands))
        renderCallback()
        const start = horizontalFn(result[0][0], result[1][0], commands)
        start(0, horizontalCallback, renderCallback)
    }

    /*
    return result  === false? false : [
        reaction.container_substrate,
        reaction.container_reagent
    ]
     */
}

module.exports = ReductiveAminationReverse
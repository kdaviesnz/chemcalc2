//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')
const _ = require('lodash')
const StatelessReaction = require("../Components/Stateless/Reaction")
const Typecheck = require('./../Typecheck')

// commands[i](target, reagent, rule, horizontalCallback, horizontalFn, reaction_commands, i, renderCallback, reactions)
const ReductiveAminationReverse = (mmolecule, reagent, rule, horizontalCallback, horizontalFn, commands, i, renderCallback, reactions, carbon_index) => {

    console.log("Calling ReductiveAminationReverse - i " +i + " Starting " + VMolecule([mmolecule,1]).canonicalSMILES() + " Starting reagent:" + VMolecule([reagent,1]).canonicalSMILES())

    Typecheck(
        {name:"mmolecule", value:mmolecule, type:"object"},
        {name:"reagent", value:reagent, type:"object"},
        {name:"rule", value:rule, type:"string"},
        {name:"horizontalCallback", value:horizontalCallback, type:"object"},
        {name:"horizontalFn", value:horizontalFn, type:"object"},
        {name:"commands", value:commands, type:"array"},
        {name:"renderCallback", value:renderCallback, type:"object"},
        {name:"reactions", value:reactions, type:"array"},
        {name:"carbon_index", value:reactions, type:"number"}
    )

    //  constructor(container_substrate, container_reagent, rule, DEBUG, horizontalCallback, horizontalFn, commands, command_index, reactions, renderCallback)
    const reaction = new Reaction([mmolecule,1], [reagent,1], rule, false, horizontalCallback, horizontalFn, commands, i, reactions, renderCallback, carbon_index)

    if (Object.prototype.toString.call(reactions) !== '[object Array]') {
        console.log(reactions)
        throw new Error("reactions should be an array")
    }

    const result = reaction.reductiveAminationReverse(carbon_index, false)


    if(undefined !== commands[i+1]) {
        console.log("ReductiveAminationReverse -> next command")
        console.log(commands[i+1])
        horizontalCallback(i+1, horizontalCallback)
    }


    // Vertical
    if (result !== false && result !==undefined) {
        console.log("Commands/ReductiveAminationReverse result:")
        //console.log(result[0])
        horizontalCallback = horizontalFn(_.cloneDeep(result[0][0]), _.cloneDeep(result[1][0]), _.cloneDeep(commands))
        // const Reaction = (r_command, substrate, reagent, product, finish_reagent, description)
        reactions_saved.push(
            StatelessReaction("reductive amination", (mmolecule), (reagent), (result[0]), (result[1]), "reduce ketone to amine")
        )
        console.log(reactions_saved)
        process.error()
        renderCallback()
        const start = horizontalFn(result[0][0], result[1][0], commands)
        start(0, horizontalCallback, renderCallback)
    }

    if (result === false) {
        console.log("Commands/ReductiveAminationReverse returning false")
    }
    /*
    return result  === false? false : [
        reaction.container_substrate,
        reaction.container_reagent
    ]
     */
}

module.exports = ReductiveAminationReverse
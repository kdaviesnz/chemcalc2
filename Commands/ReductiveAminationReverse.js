//const MoleculeController = require('../controllers/MoleculeController')
//const FindDoubleBondPair = require('./FindDoubleBondPair')
const Reaction = require("../Components/State/Reaction")
const VMolecule = require('../Components/Stateless/Views/Molecule')
const _ = require('lodash')
const StatelessReaction = require("../Components/Stateless/Reaction")
const Typecheck = require('./../Typecheck')

// commands[i](target, reagent, rule, horizontalCallback, horizontalFn, reaction_commands, i, renderCallback, reactions)
const ReductiveAminationReverse = (mmolecule, reagent, rule, horizontalCallback, horizontalFn, commands, i, renderCallback, reactions, carbon_index) => {

    console.log("Calling ReductiveAminationReverse - i " +i + " Starting " + VMolecule([mmolecule,1]).canonicalSMILES() + " Starting reagent:" + (reagent===null?"Not specified":VMolecule([reagent,1]).canonicalSMILES()))

    Typecheck(
        {name:"mmolecule", value:mmolecule, type:"object"},
        {name:"reagent", value:reagent, type:"object"},
        {name:"rule", value:rule, type:"string"},
        {name:"horizontalCallback", value:horizontalCallback, type:"function"},
        {name:"horizontalFn", value:horizontalFn, type:"function"},
        {name:"commands", value:commands, type:"array"},
        {name:"renderCallback", value:renderCallback, type:"function"},
        {name:"reactions", value:reactions, type:"array"},
        {name:"carbon_index", value:carbon_index, type:"number"}
    )

    //  constructor(container_substrate, container_reagent, rule, DEBUG, horizontalCallback, horizontalFn, commands, command_index, reactions, renderCallback)
    const reaction = new Reaction([_.cloneDeep(mmolecule),1], (reagent===null?reagent:[(reagent),1]), rule, false, horizontalCallback, horizontalFn, commands, i, reactions, renderCallback, carbon_index)

    if (Object.prototype.toString.call(reactions) !== '[object Array]') {
        console.log(reactions)
        throw new Error("reactions should be an array")
    }

    const result = reaction.reductiveAminationReverse(carbon_index, false)

    /*
    const horizontalFn = (target, reagent, reaction_commands) => (i, horizontalCallback, renderCallback, reactions) => {
    Typecheck(
        {name:"target", value:target, type:"object"},
        {name:"reagent", value:reagent, type:"object"},
        {name:"reaction_commands", value:reaction_commands, type:"array"},
        {name:"i", value:i, type:"number"},
        {name:"horizontalCallback", value:horizontalCallback, type:"function"},
        {name:"renderCallback", value:renderCallback, type:"function"},
        {name:"reactions", value:reactions, type:"array"},
    )
    const rule = ""
    commands[i](target, reagent, rule, horizontalCallback, horizontalFn, reaction_commands, i, renderCallback, reactions)
}
     */

    // horizontal
    if(undefined !== commands[i+1]) {
        // We are calling a different reverse command on the same substrate
        console.log("ReductiveAminationReverse -> next command")
        console.log(commands[i+1])
        // horizontalCallback(0, horizontalCallback, renderCallback, [])
        horizontalCallback(i+1, horizontalCallback, renderCallback, [])
    }


    // Vertical
    if (result !== false && result !==undefined) {
        console.log("Commands/ReductiveAminationReverse result:")
        //console.log(result[0])
        horizontalCallback = horizontalFn(_.cloneDeep(result[0][0]), _.cloneDeep(result[1][0]), _.cloneDeep(commands))
        // const Reaction = (r_command, substrate, reagent, product, finish_reagent, description)
        reactions.push(
            StatelessReaction(
                "reductive amination",
                (result[0]),
                (result[1]),
                ([mmolecule,1]),
                ([reagent,1]),
                "reduce ketone to amine"
            )
        )
        const start = horizontalFn(result[0][0], result[1][0], commands)
        start(0, horizontalCallback, renderCallback, reactions)
    }

    if (result === false) {
        renderCallback(reactions)
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
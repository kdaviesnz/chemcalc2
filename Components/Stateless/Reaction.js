const Reaction = (r_command, substrate, reagent, product, finish_reagent) => {
    return {
        'command':r_command,
        'substrate':substrate,
        'reagent':reagent,
        'product': product,
        'finish_reagent': finish_reagent
    }


}

module.exports = Reaction
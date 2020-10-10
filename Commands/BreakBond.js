const Reaction = require("../Components/State/Reaction")

const BreakBond = (mmolecule, reagent, mmolecule_atom_index, reagent_atom_index) => {

    const reaction = new Reaction(mmolecule, reagent)

    reaction.breakBond(mmolecule_atom_index, reagent_atom_index)

    return [
        reaction.mmolecule,
        reaction.reagent
    ]
}

module.exports = BreakBond

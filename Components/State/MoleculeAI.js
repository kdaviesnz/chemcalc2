/*
Only methods that change the state of subtrate / reagent

removeBranch(start_of_branch_index, replacement)
formKeytoneFromImine(nitrogen_index, carbon_index)

 */
const BondsAI = require('../../Components/State/BondsAI')
const VMolecule = require('../../Components/Stateless/Views/Molecule')

class MoleculeAI {

    constructor(reaction) {
        this.reaction = reaction
        this.bondsAI = new BondsAI(this.reaction)
    }

    removeBranch(start_of_branch_index, replacement) {

    }

    formKeytoneFromImine(nitrogen_index, carbon_index) {
        // Replace C=NR with C=O
        // This gets the NR part of the substrate and makes it the reagent, but does not actually remove NR from the substrate.
        this.bondsAI.bondSubstrateToReagentReverse(nitrogen_index, carbon_index)
        console.log("State/MoleculeAI.js reductiveAminationReverse Substrate after splitting")
        console.log(VMolecule([this.reaction.container_substrate[0],1]).compressed())
        console.log(VMolecule([this.reaction.container_reagent[0],1]).compressed())
        
        // Remove NR part from the substrate
        process.error()

    }


}

module.exports = MoleculeAI
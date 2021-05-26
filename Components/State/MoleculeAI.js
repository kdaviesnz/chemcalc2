/*
Only methods that change the state of subtrate / reagent

removeBranch(start_of_branch_index, replacement)
formKeytoneFromImine(nitrogen_index, carbon_index)
neutraliseMolecule()
 */
const BondsAI = require('../../Components/State/BondsAI')
const VMolecule = require('../../Components/Stateless/Views/Molecule')
const AtomFactory = require('../../Models/AtomFactory')
const CAtom = require('../../Controllers/Atom')

class MoleculeAI {

    constructor(reaction) {
        this.reaction = reaction
        this.bondsAI = new BondsAI(this.reaction)
    }

    neutraliseMolecule(molecule_container) {
        // Set all atoms in molecule to have a neutral charge
        let bond_count = null
        let number_of_hydrogens_to_add = null
        let hydrogen = null
        let i = 0
        molecule_container[0][1].map((atom_arr, atom_index) =>{
            if (atom_arr[0] !== "H") {
                const atom = CAtom(molecule_container[0][1][atom_index], atom_index, molecule_container)
                switch(atom.symbol) {
                    case "N":{
                        bond_count =  atom.hydrogens().length + (single_bonds.length) + (double_bonds.length*2) + (triple_bonds_length*3)
                        if (bond_count < 4) {
                            number_of_hydrogens_to_add = 4 - bond_count
                            for (i=0; i < number_of_hydrogens_to_add; i++) {


                            }
                        }
                    }
                }
            }
        })
    }

    removeBranch(start_of_branch_index, replacement) {

    }

    formKeytoneFromImine(nitrogen_index, carbon_index, DEBUG) {

        if(DEBUG) {
            console.log("State/MoleculeAI.js formKeytoneFromImine carbon index:")
            console.log(carbon_index)
            console.log("Before splitting")
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).compressed())
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).canonicalSMILES())
        }

        const bondsAI = new BondsAI(this.reaction)
        bondsAI.bondSubstrateToReagentReverse(nitrogen_index, carbon_index)

        if (DEBUG) {
            console.log("State/MoleculeAI.js formKeytoneFromImine Substrate after splitting")
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).compressed())
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).canonicalSMILES())
            console.log(VMolecule([this.reaction.container_reagent[0], 1]).canonicalSMILES())
            console.log(VMolecule([this.reaction.container_reagent[0], 1]).compressed())
        }

        // If nitrogen index > carbon index then we substract one from the carbon index to get the new carbon index
        if (nitrogen_index > carbon_index) {
            carbon_index = carbon_index - 1
        } else {
            carbon_index = carbon_index + 1
        }

        // Add =O to carbon
        // Carbon is positively charged
        const oxygen_atom = AtomFactory("O", "")
        let oxygen = null
        let carbon = null
        let oxygen_index =null

        if (undefined === this.reaction.container_substrate[0][1][carbon_index]) {
            // Swap reagent and substrate
            const substrate_saved  = _.cloneDeep(this.reaction.container_substrate)
            this.reaction.container_substrate = this.reaction.container_reagent
            this.reaction.container_reagent = substrate_saved
            this.reaction.container_substrate[0][1].push(oxygen_atom)
            oxygen_index = this.reaction.container_substrate[0][1].length -1
            carbon = CAtom(this.reaction.container_substrate[0][1][0], 0, this.reaction.container_substrate)
            oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
        } else {

            this.reaction.container_substrate[0][1].push(oxygen_atom)
            oxygen_index = this.reaction.container_substrate[0][1].length -1
            carbon = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
            oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
        }


        // Replace C=NR with C=O (NR becomes reagent)
        this.bondsAI.makeDoubleBond(oxygen, carbon, false)

        this.bondsAI.removeProton(this.reaction.container_substrate, carbon_index)

        this.reaction.setChargesOnSubstrate()
        this.reaction.setChargesOnReagent()

        if (DEBUG) {
            console.log("State/MoleculeAI.js formKeytoneFromImine Substrate after adding oxygen and creating double bond with carbon")
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).compressed())
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).canonicalSMILES())
            console.log(VMolecule([this.reaction.container_reagent[0], 1]).compressed())
            console.log(VMolecule([this.reaction.container_reagent[0], 1]).canonicalSMILES())
        }

        process.error()

        // For testing purposes
        return [
            this.reaction.container_substrate,
            this.reaction.container_reagent
        ]


    }


}

module.exports = MoleculeAI
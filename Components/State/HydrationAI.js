const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const _ = require('lodash');

class HydrationAI {

    constructor(reaction) {
        this.reaction = reaction
    }

    dehydrate() {

        const oxygen_atom_index = this.reaction.MoleculeAI.findWaterOxygenIndex()

        if (oxygen_atom_index === -1) {
            return false
        }

        const oxygen_atom = CAtom(this.reaction.container_substrate[0][1][oxygen_atom_index], oxygen_atom_index, this.container_substrate)

        const hydrogen_bonds = oxygen_atom.indexedBonds("").filter((bond) => {
                return bond.atom[0] === "H"
            }
        )

        // Get the bond that is NOT and oxygen - hydrogen bond
        const non_hydrogen_bond = oxygen_atom.indexedBonds("").filter((bond) => {
                return bond.atom[0] !== "H"
            }
        ).pop()

        // Break the non_hydrogen bond
        const shared_electrons = non_hydrogen_bond.shared_electrons

        _.remove(this.reaction.container_substrate[0][1][non_hydrogen_bond.atom_index], (v, i)=> {
            return shared_electrons[1] === v || shared_electrons[0] === v
        })

        // Remove water atoms
        _.remove(this.reaction.container_substrate[0][1], (v,i) => {
            return i === oxygen_atom_index || i === hydrogen_bonds[0].atom_index || i === hydrogen_bonds[1].atom_index
        })

        // Charges
        this.reaction.setChargeOnSubstrateAtom(non_hydrogen_bond.atom_index)

        this.reaction.leaving_groups.push([MoleculeFactory("O"),1])

        //  this.setMoleculeAI()
        this.reaction.setReagentAI()

        return true



    }
}

module.exports = HydrationAI
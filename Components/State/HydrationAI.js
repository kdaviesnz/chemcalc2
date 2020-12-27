const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')

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

    dehydrateReverse() {


        const water_molecule = MoleculeFactory("O")
        water_molecule[1][2][4]="+"

        const water_ai = require("../Stateless/MoleculeAI")([water_molecule,1])
        const water_oxygen_index = water_ai.findWaterOxygenIndex()
        const electrons = CAtom(water_molecule[1][water_oxygen_index],
            water_oxygen_index,
            [water_molecule,1]).freeElectrons()
        electrons.length.should.be.greaterThan(1)
        let electrophile_index = this.reaction.MoleculeAI.findElectrophileIndex("O", "C")

        if (electrophile_index === -1) {
            return false
        }

        // Leuckact Wallach reaction
        if (this.reaction.container_substrate[0][1][electrophile_index][4] !== "+") {
            // Imine
            electrophile_index = this.reaction.MoleculeAI.findImineCarbonIndex()
            if (electrophile_index === -1) {
                return false
            }
        }

        this.reaction.container_substrate[0][1][electrophile_index].push(electrons[0])
        this.reaction.container_substrate[0][1][electrophile_index].push(electrons[1])
        this.reaction.setChargeOnSubstrateAtom(electrophile_index)

        this.reaction.container_substrate[0][1].push(water_molecule[1][0])
        this.reaction.container_substrate[0][1].push(water_molecule[1][1])
        this.reaction.container_substrate[0][1].push(water_molecule[1][2])

        this.reaction.setMoleculeAI()

        // Check we have a water molecule attached to main molecule
        this.reaction.MoleculeAI.findWaterOxygenIndex().should.be.greaterThan(-1)

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('HydrationAI.js molecule is not valid (hydrate())')
            console.log('Method: hydrate()')
            console.log(VMolecule(this.container_substrate).compressed())
            console.log(i)
        }


        console.log(VMolecule(this.reaction.container_substrate).compressed())
        console.log(nnnnno)
        return true
    }

    hydrate(electrophile_index) {
        const water_molecule = MoleculeFactory("O")
        water_molecule[1][2][4]="+"

        const water_ai = require("../Stateless/MoleculeAI")([water_molecule,1])
        const water_oxygen_index = water_ai.findWaterOxygenIndex()
        const electrons = CAtom(water_molecule[1][water_oxygen_index],
            water_oxygen_index,
            [water_molecule,1]).freeElectrons()
        electrons.length.should.be.greaterThan(1)
        if (undefined === electrophile_index) {
            electrophile_index = this.reaction.MoleculeAI.findElectrophileIndex("O", "C")
        }

        if (electrophile_index === -1) {
            return false
        }

        // Leuckact Wallach reaction
        if (this.reaction.container_substrate[0][1][electrophile_index][4] !== "+") {
            return false
        }

        this.reaction.container_substrate[0][1][electrophile_index].push(electrons[0])
        this.reaction.container_substrate[0][1][electrophile_index].push(electrons[1])
        this.reaction.container_substrate[0][1][electrophile_index][4] = 0

        this.reaction.container_substrate[0][1].push(water_molecule[1][0])
        this.reaction.container_substrate[0][1].push(water_molecule[1][1])
        this.reaction.container_substrate[0][1].push(water_molecule[1][2])

        this.reaction.setMoleculeAI()

        // Check we have a water molecule attached to main molecule
        this.reaction.MoleculeAI.findWaterOxygenIndex().should.be.greaterThan(-1)

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('HydrationAI.js molecule is not valid (hydrate())')
            console.log('Method: hydrate()')
            console.log(VMolecule(this.container_substrate).compressed())
            console.log(i)
        }

        return true
    }

}

module.exports = HydrationAI
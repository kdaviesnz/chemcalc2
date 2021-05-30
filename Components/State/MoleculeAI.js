/*
Only methods that change the state of subtrate / reagent

removeBranch(start_of_branch_index, replacement)
formKeytoneFromImine(nitrogen_index, carbon_index)
neutraliseMolecule(molecule_container)
 */
const BondsAI = require('../../Components/State/BondsAI')
const VMolecule = require('../../Components/Stateless/Views/Molecule')
const AtomFactory = require('../../Models/AtomFactory')
const CAtom = require('../../Controllers/Atom')
const uniqid = require('uniqid');
const _ = require('lodash');

class MoleculeAI {

    constructor(reaction) {
        this.reaction = reaction
        this.bondsAI = new BondsAI(this.reaction)
    }

    neutraliseMolecule(molecule_container) {

        const bondsAI = new BondsAI(this.reaction)
        // Set all atoms in molecule to have a neutral charge
        let bond_count = null
        let number_of_hydrogens_to_add = null
        let number_of_hydrogens_to_remove = null
        let hydrogen = null
        let i = 0
        let max_bond_count = null

        /*
        molecule_container[0][1].map((atom_arr)=>{
            console.log(atom_arr)
        })
         */

        molecule_container[0][1].map((atom_arr, atom_index) =>{
            if (atom_arr[0] !== "H") {

                const atom = CAtom(molecule_container[0][1][atom_index], atom_index, molecule_container)

                const single_bonds = atom.indexedBonds("").filter((b)=>{
                    return b.atom[0] !== "H"
                })

                const double_bonds = atom.indexedDoubleBonds("").filter((b)=>{
                    return b.atom[0] !== "H"
                })

                const triple_bonds = atom.indexedTripleBonds("").filter((b)=>{
                    return b.atom[0] !== "H"
                })

                switch(atom.symbol) {
                    case "N":
                        max_bond_count = 3
                        break
                    case "O":
                        max_bond_count = 2
                        break
                    case "C":
                        max_bond_count = 4
                        break
                }

                if (max_bond_count !== null) {
                    bond_count =  atom.hydrogens().length + (single_bonds.length) + (double_bonds.length*2) + (triple_bonds.length*3)

                    if (bond_count < max_bond_count) {
                        number_of_hydrogens_to_add = max_bond_count - bond_count
                        const required_number_of_valence_electrons = molecule_container[0][1][atom_index][2]

                        // Valence electrons
                        const number_of_electrons_to_add = required_number_of_valence_electrons - atom.freeElectrons().length
                        for (i=0; i < number_of_electrons_to_add; i++) {
                            molecule_container[0][1][atom_index].push(uniqid())
                        }

                        for (i=0; i < number_of_hydrogens_to_add; i++) {
                            molecule_container = bondsAI.addHydrogen(molecule_container, atom_index)
                        }

                        molecule_container[0][1][atom_index][4] = ""

                    } else if(bond_count > max_bond_count) {
                        // remove protons
                        number_of_hydrogens_to_remove = bond_count - max_bond_count
                        i = 0
                        for (i=0; i < number_of_hydrogens_to_remove; i++) {
                            bondsAI.removeProton(molecule_container, atom_index)
                        }
                    }
                }

            }
        })

        return molecule_container
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
            console.log("Reagent")
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

            // Create double bond between oxygen and carbon
            this.reaction.container_substrate[0][1].push(oxygen_atom)
            bondsAI.makeOxygenCarbonDoubleBond(DEBUG)
            if (DEBUG) {
                console.log("After making oxygen carbon double bond")
                console.log(VMolecule(this.reaction.container_substrate).compressed())
            }
            oxygen_index = this.reaction.container_substrate[0][1].length -1
            carbon = CAtom(this.reaction.container_substrate[0][1][0], 0, this.reaction.container_substrate)
            oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
            if (DEBUG) {
                console.log("Stateless/MoleculeAI formKeytoneFromImine Swapped substrate and reagent")
            }
            this.reaction.setMoleculeAI()
            carbon_index = this.reaction.MoleculeAI.findKetoneCarbonIndex(DEBUG)
            if (DEBUG) {
                console.log("Stateless/MoleculeAI formKeytoneFromImine carbon index: " + carbon_index)
                console.log("Stateless/MoleculeAI formKeytoneFromImine oxygen index: " + oxygen_index)
            }

            this.reaction.container_substrate = this.neutraliseMolecule( this.reaction.container_substrate)
            this.neutraliseMolecule( this.reaction.container_reagent)

            if (DEBUG) {
                this.reaction.setChargesOnSubstrate()
                this.reaction.setChargesOnReagent()
                console.log(VMolecule(this.reaction.container_substrate).compressed())
            }

            // For testing purposes
            return [
                this.reaction.container_substrate,
                this.reaction.container_reagent
            ]


        } else {
            this.reaction.container_substrate[0][1].push(oxygen_atom)
            oxygen_index = this.reaction.container_substrate[0][1].length -1
            carbon = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
            oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
        }


        // Replace C=NR with C=O (NR becomes reagent)
        this.bondsAI.makeDoubleBond(oxygen, carbon, false)

        this.reaction.setChargesOnSubstrate()
        this.bondsAI.removeProton(this.reaction.container_substrate, carbon_index, null, null, DEBUG)
        //this.neutraliseMolecule(this.reaction.container_reagent)

        this.reaction.setChargesOnSubstrate()
        this.reaction.setChargesOnReagent()

        if (DEBUG) {
            console.log("State/MoleculeAI.js formKeytoneFromImine Substrate after adding oxygen and creating double bond with carbon")
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).compressed())
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).canonicalSMILES())
            console.log(VMolecule([this.reaction.container_reagent[0], 1]).compressed())
        }

        // For testing purposes
        return [
            this.reaction.container_substrate,
            this.reaction.container_reagent
        ]


    }


}

module.exports = MoleculeAI
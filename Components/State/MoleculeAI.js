/*
Only methods that change the state of subtrate / reagent

removeBranch(start_of_branch_index, replacement)
formKetoneFromImine(nitrogen_index, carbon_index)
neutraliseMolecule(molecule_container)
 */
const BondsAI = require('../../Components/State/BondsAI')
const VMolecule = require('../../Components/Stateless/Views/Molecule')
const AtomFactory = require('../../Models/AtomFactory')
const CAtom = require('../../Controllers/Atom')
const uniqid = require('uniqid');
const _ = require('lodash');
const Typecheck = require('./../../Typecheck')

class MoleculeAI {

    constructor(reaction) {

        Typecheck(
            {name:"reaction", value:reaction, type:"object"},
        )

        if (reaction === null) {
            throw new Error("Reaction should not null")
        }

        if (reaction === undefined) {
            throw new Error("Reaction should not be undefined")
        }

        this.reaction = reaction

        this.reaction.container_substrate[0][1].map((_atom) => {
            Typecheck(
                {name: "_atom", value: _atom, type: "array"},
            )
        })

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
        let number_of_electrons = null
        let number_of_free_electrons = null

        /*
        molecule_container[0][1].map((atom_arr)=>{
            console.log(atom_arr)
        })
         */
        // return [atom[0], index, "H " + h.length, 'Charge: '+ atom[4],  bonds, double_bonds, triple_bonds, electrons.length, free_electrons.length]

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
                        number_of_electrons =  8
                        number_of_free_electrons = 2
                        break
                    case "O":
                        max_bond_count = 2
                        number_of_electrons =  8
                        number_of_free_electrons = 4
                        break
                    case "C":
                        max_bond_count = 4
                        number_of_electrons =  8
                        number_of_free_electrons = 0
                        break
                }

                if (max_bond_count !== null) {
                    bond_count =  atom.hydrogens().length + (single_bonds.length) + (double_bonds.length*2) + (triple_bonds.length*3)

                    if (bond_count < max_bond_count) {
                        number_of_hydrogens_to_add = max_bond_count - bond_count
                        const required_number_of_valence_electrons = molecule_container[0][1][atom_index][2]

                        // Valence electrons
                        const number_of_electrons_to_add = required_number_of_valence_electrons - atom.freeElectrons().length
                        /*
                        for (i=0; i < number_of_electrons_to_add; i++) {
                            molecule_container[0][1][atom_index].push(uniqid())
                        }
                        */

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

                if (atom.freeElectrons().length !== number_of_free_electrons) {
                    let number_of_electrons_to_remove = 0
                    let number_of_electrons_to_add = 0
                    if (atom.freeElectrons().length > number_of_free_electrons){
                        number_of_electrons_to_remove = atom.freeElectrons().length - number_of_free_electrons
                        atom.removeElectrons(atom.freeElectrons().slice(0, number_of_electrons_to_remove))
                    } else {
                        number_of_electrons_to_add = number_of_free_electrons - atom.freeElectrons().length
                        atom.addElectrons(number_of_electrons_to_add)
                    }
                }

            }

        })

        return molecule_container
    }

    removeBranch(start_of_branch_index, replacement) {

    }

    formKetoneFromImine(nitrogen_index, carbon_index, DEBUG) {

        Typecheck(
            {name:"carbon_index", value:carbon_index, type:"number"},
            {name:"DEBUG", value:DEBUG, type:"boolean"},
            {name:"nitrogen_index", value:nitrogen_index, type:"number"},
            {name:"this.reaction", value:this.reaction, type:"object"},
        )

        carbon_index.should.be.greaterThan(-1)
        nitrogen_index.should.be.greaterThan(-1)

        const carbon_atom_id = this.reaction.container_substrate[0][1][carbon_index][5]
        const nitrogen_atom_id = this.reaction.container_substrate[0][1][nitrogen_index][5]

        Typecheck(
            {name:"carbon_atom_id", value:carbon_atom_id, type:"string"},
            {name:"nitrogen_atom_id", value:nitrogen_atom_id, type:"string"}
        )

        if(DEBUG) {
            console.log("State/MoleculeAI.js formKetoneFromImine carbon index:")
            console.log("Carbon index:" + carbon_index)
            console.log("Nitrogen index:" + nitrogen_index)
            console.log("Carbon atom id:" + carbon_atom_id)
            console.log("Nitrogen atom id:" + nitrogen_atom_id)
            console.log("Before splitting")
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).compressed())
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).canonicalSMILES())
        }

        const bondsAI = new BondsAI(this.reaction)
        bondsAI.bondSubstrateToReagentReverse(nitrogen_index, carbon_index, DEBUG)
        this.reaction.container_substrate[0][1].length.should.be.greaterThan(0)
        this.reaction.container_reagent[0][1].length.should.be.greaterThan(0)

        this.reaction.setMoleculeAI()
        carbon_index = this.reaction.MoleculeAI.findAtomIndexByAtomId(carbon_atom_id, DEBUG)

        carbon_index.should.be.greaterThan(-1, "Could not find carbon index by atom id")

        if (DEBUG) {
            console.log("State/MoleculeAI.js formKetoneFromImine after splitting")
            console.log("Carbon index:" + carbon_index)
            console.log("Carbon atom id:" + carbon_atom_id)
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).compressed())
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).canonicalSMILES())
            console.log("Reagent")
            console.log(VMolecule([this.reaction.container_reagent[0], 1]).compressed())
            console.log(VMolecule([this.reaction.container_reagent[0], 1]).canonicalSMILES())
            console.log("State/MoleculeAI.js formKetoneFromImine new carbon index:" + carbon_index)
            process.error()
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
            // @todo check if a double bond has actually been created
            oxygen_index = this.reaction.container_substrate[0][1].length -1
            carbon = CAtom(this.reaction.container_substrate[0][1][0], 0, this.reaction.container_substrate)
            oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
            this.reaction.setMoleculeAI()
            carbon_index = this.reaction.MoleculeAI.findKetoneCarbonIndex(DEBUG)
            if (DEBUG) {
                console.log("State/MoleculeAI formKetoneFromImine ketone carbon index: " + carbon_index)
                console.log("State/MoleculeAI formKetoneFromImine oxygen index: " + oxygen_index)
                console.log(VMolecule([this.reaction.container_substrate[0], 1]).compressed())
            }

            this.reaction.container_substrate = this.neutraliseMolecule( this.reaction.container_substrate)
            this.neutraliseMolecule( this.reaction.container_reagent)

            this.reaction.setChargesOnSubstrate()
            this.reaction.setChargesOnReagent()

            // For testing purposes
            return [
                this.reaction.container_substrate,
                this.reaction.container_reagent
            ]

        } else {
            this.reaction.container_substrate[0][1].push(oxygen_atom)
            const oxygen_index = this.reaction.container_substrate[0][1].length -1
            this.neutraliseMolecule(this.reaction.container_substrate)
            this.reaction.setChargesOnSubstrate()
            const molecule_compressed = VMolecule(this.reaction.container_substrate).compressed()
            if (DEBUG) {
                console.log("Substrate:")
                console.log(VMolecule(this.reaction.container_substrate).compressed())
                console.log("oxygen index = " + oxygen_index)
                console.log("carbon index = " + carbon_index)
            }
            carbon = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
            oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
        }

        // Replace C=NR with C=O (NR becomes reagent)
        this.bondsAI.makeDoubleBond(oxygen, carbon, DEBUG)

        this.reaction.setChargesOnSubstrate()
        this.bondsAI.removeProton(this.reaction.container_substrate, carbon_index, null, null, DEBUG)
        this.neutraliseMolecule(this.reaction.container_reagent)
        this.neutraliseMolecule(this.reaction.container_substrate)

        this.reaction.setChargesOnSubstrate()
        this.reaction.setChargesOnReagent()

        // For testing purposes
        return [
            this.reaction.container_substrate,
            this.reaction.container_reagent
        ]


    }


}

module.exports = MoleculeAI
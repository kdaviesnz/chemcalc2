/*
Only methods that change the state of subtrate / reagent

removeBranch(start_of_branch_index, replacement)
formImineFromKetoneReverse(nitrogen_index, carbon_index)
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

        this.reaction = _.cloneDeep(reaction)

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

        molecule_container.should.be.an.Array()

        Typecheck(
            {name:"container", value: molecule_container, type:"array"},
            {name:"atoms container", value: molecule_container[0], type:"array"},
            {name:"atoms", value: molecule_container[0][1], type:"array"},
        )

        if (molecule_container === undefined) {
            throw new Error("Molecule container is undefined")
        }


        if (molecule_container[0][1] === undefined) {
            throw new Error("No atoms found")
        }


        molecule_container[0][1].map((atom_arr, atom_index) =>{
            if (atom_arr[0] !== "H") {

                const atom = molecule_container[0][1][atom_index]

                const single_bonds = atom.indexedBonds(molecule_container[0][1])

                const double_bonds = atom.indexedDoubleBonds(molecule_container[0][1])

                const triple_bonds = atom.indexedTripleBonds(molecule_container[0][1])

                switch(atom[0]) {
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


                bond_count =  atom.bondCount(molecule_container[0][1]) + atom.hydrogens(molecule_container[0][1]).length
                max_bond_count = atom.neutralAtomMaxNumberOfBonds()

                if (bond_count < max_bond_count) {
                    // Add hydrogens
                    number_of_hydrogens_to_add = max_bond_count - bond_count
                    for (i=0; i < number_of_hydrogens_to_add; i++) {
                        const hydrogen = AtomFactory("H", "")
                        atom.bondAtomToAtom(hydrogen, molecule_container[0][1])
                        molecule_container[0][1].addAtom(hydrogen)
                    }

                    molecule_container[0][1][atom_index][4] = ""

                } else if(bond_count > max_bond_count) {



                    // remove hydrogens
                    number_of_hydrogens_to_remove = bond_count - max_bond_count
                    i = 0
                    const hydrogens = atom.hydrogens(molecule_container[0][1])
                    for (i=0; i < number_of_hydrogens_to_remove; i++) {
                        hydrogens[i][0].should.be.equal("H")
                        molecule_container[0][1].removeAtom(hydrogens[i], molecule_container[0][1].getAtomIndexById(hydrogens[i].atomId()))
                    }
                }

            }

        })
//        return molecule_container
    }

    removeBranch(start_of_branch_index, replacement) {

    }

    formImineFromKetoneReverse(nitrogen_atom_id, carbon_atom_id, DEBUG) {



        Typecheck(
            {name:"carbon_atom_id", value:carbon_atom_id, type:"string"},
            {name:"DEBUG", value:DEBUG, type:"boolean"},
            {name:"nitrogen_atom_id", value:nitrogen_atom_id, type:"string"},
            {name:"this.reaction", value:this.reaction, type:"object"},
        )


        let carbon_index = this.reaction.MoleculeAI.findAtomIndexByAtomId(carbon_atom_id, DEBUG)
        let nitrogen_index = this.reaction.MoleculeAI.findAtomIndexByAtomId(nitrogen_atom_id, DEBUG)


        if(DEBUG) {
            console.log("State/MoleculeAI.js formKetoneFromImine carbon index:")
            console.log("State/MoleculeAI.js formKetoneFromImine Carbon atom id :" + carbon_atom_id)
            console.log("State/MoleculeAI.js formKetoneFromImine Nitrogen atom id:" + nitrogen_atom_id)
            console.log("State/MoleculeAI.js formKetoneFromImine Before splitting")
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).compressed())
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).canonicalSMILES())
        }

        const carbon_atom = this.reaction.container_substrate[0][1][carbon_index]
        const nitrogen_atom = this.reaction.container_substrate[0][1][nitrogen_index]

        // Check for double bond between carbon and nitrgoen
        if (carbon_atom.isDoubleBondedTo(nitrogen_atom) !==true) {
            console.log(carbon_atom.isDoubleBondedTo(nitrogen_atom))
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(carbon_index)
            console.log(nitrogen_index)
            throw new Error("No double bond between carbon and nitrogen")
        }

        const bondsAI = new BondsAI((this.reaction))
        // We need to set this.reaction as we are using cloned values.
        this.reaction = bondsAI.bondSubstrateToReagentReverseOnNitrogenCarbon(nitrogen_atom_id, carbon_atom_id, DEBUG)
        this.reaction.container_substrate[0][1].length.should.be.greaterThan(0)
        this.reaction.container_reagent[0][1].length.should.be.greaterThan(0)

        if (DEBUG) {
            console.log("State/MoleculeAI.js substrate after splitting:")
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).compressed())
            console.log(VMolecule([this.reaction.container_substrate[0], 1]).canonicalSMILES())
            console.log("State/MoleculeAI.js reagent after splitting:")
            console.log(VMolecule([this.reaction.container_reagent[0], 1]).compressed())
            console.log(VMolecule([this.reaction.container_reagent[0], 1]).canonicalSMILES())
        }


        carbon_index.should.be.greaterThan(-1, "Could not find carbon index by atom id in substrate or reagent " + carbon_atom_id)

        // Add =O to carbon
        // Carbon is positively charged
        const oxygen_atom = AtomFactory("O", "")
        let oxygen = null
        let carbon = null
        let oxygen_index =null

        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()



        if (this.reaction.MoleculeAI.findAtomIndexByAtomId(carbon_atom_id, DEBUG) === -1) {

            // Carbon is terminal carbon (reagent is C[H3+])
            // Swap reagent and substrate
            const substrate_saved  = _.cloneDeep(this.reaction.container_substrate)
            this.reaction.container_substrate = this.reaction.container_reagent
            this.reaction.container_reagent = substrate_saved

            this.reaction.setMoleculeAI()
            carbon_index = this.reaction.MoleculeAI.findAtomIndexByAtomId(carbon_atom_id, DEBUG)
            this.reaction.container_substrate[0][1].push(oxygen_atom)

            oxygen_index = this.reaction.container_substrate[0][1].length -1
            carbon = this.reaction.container_substrate[0][1][0]
            oxygen = this.reaction.container_substrate[0][1][oxygen_index]

            // Create double bond between oxygen and carbon (reagent is C[H3+])
            // If carbon has 3 hydrogens then we need to remove one of them
            const hydrogens = carbon.hydrogens(this.reaction.container_substrate[0][1])
            if (hydrogens.length === 3) {
                carbon.removeSingleBond(hydrogens[0])
                // @todo Do we need second parameter?
                carbon.removeAtom(hydrogens[0],this.reaction.container_substrate[0][1].getAtomIndexById(hydrogens[0].atomId()))
            }


            oxygen[0].should.be.equal("O")
            carbon[0].should.be.equal("C")

            //console.log(carbon.isBondedTo(oxygen))
            //bondsAI.makeOxygenCarbonDoubleBond(oxygen, carbon, DEBUG)
            carbon.bondAtomToAtom(oxygen, this.reaction.container_substrate[0][1])
            carbon.bondAtomToAtom(oxygen, this.reaction.container_substrate[0][1])
            carbon.isDoubleBondedTo(oxygen).should.be.equal(true)

            if (DEBUG) {
                console.log(VMolecule([this.reaction.container_substrate[0], 1]).compressed())
                console.log(VMolecule([this.reaction.container_substrate[0], 1]).canonicalSMILES())
            }

            // Add hydrogen to nitrogen atom on reagent to make up for loss of carbon atom
            this.reaction.setReagentAI()
            nitrogen_index = this.reaction.ReagentAI.findAtomIndexByAtomId(nitrogen_atom_id, DEBUG)
            //bondsAI.addHydrogen(this.reaction.container_reagent, nitrogen_index)
            const nitrogen = this.reaction.container_reagent[0][1][nitrogen_index]
            while(nitrogen.bondCount(this.reaction.container_reagent[0][1])  + nitrogen.hydrogens(this.reaction.container_reagent[0][1]).length < 3) {
                const hydrogen = AtomFactory("H", "")
                nitrogen.bondAtomToAtom(hydrogen, this.reaction.container_reagent[0][1])
                this.reaction.container_reagent[0][1].addAtom(hydrogen)
            }

           // console.log(nitrogen.hydrogens(this.reaction.container_reagent[0][1]))
           // process.error()

            if (DEBUG) {
                console.log(VMolecule([this.reaction.container_reagent[0], 1]).compressed())
                console.log(VMolecule([this.reaction.container_reagent[0], 1]).canonicalSMILES())
            }

            this.reaction.setReagentAI()
            this.reaction.setChargesOnReagent()
            this.reaction.setMoleculeAI()
            this.reaction.setChargesOnSubstrate()


        } else {

            this.reaction.container_substrate[0][1].addAtom(oxygen_atom)
           // console.log(VMolecule(this.reaction.container_substrate).compressed())
            const oxygen_index = this.reaction.container_substrate[0][1].length -1
            carbon_index = this.reaction.MoleculeAI.findAtomIndexByAtomId(carbon_atom_id, DEBUG)
            carbon = this.reaction.container_substrate[0][1][carbon_index]
            carbon[0].should.be.equal("C", "Carbon index "+carbon_index + " Check database record is correct.")
            this.reaction.container_substrate[0][1][oxygen_index][0].should.be.equal("O")
            oxygen = this.reaction.container_substrate[0][1][oxygen_index]
            if (DEBUG) {
                console.log("Substrate (after splitting):")
                console.log(VMolecule(this.reaction.container_substrate).compressed())
                console.log(VMolecule(this.reaction.container_substrate).canonicalSMILES())
            }

            const bondsAI = new BondsAI(this.reaction)

            // Create C=O bond
            //this.reaction = bondsAI.makeOxygenCarbonDoubleBond(oxygen, carbon, DEBUG)
            carbon.bondAtomToAtom(oxygen, this.reaction.container_substrate[0][1])
            carbon.bondAtomToAtom(oxygen, this.reaction.container_substrate[0][1])

            //console.log(carbon)
            //console.log(oxygen)

            //process.error()

            if(DEBUG) {
                console.log(VMolecule(this.reaction.container_substrate).compressed())
            }

            // Add two hydrogens to nitrogen atom on reagent to make up for loss of double bond
            this.reaction.setReagentAI()
            nitrogen_index = this.reaction.ReagentAI.findAtomIndexByAtomId(nitrogen_atom_id, DEBUG)
            if (nitrogen_index === null || nitrogen_index === -1) {
                if (DEBUG) {
                    console.log(VMolecule([this.reaction.container_reagent[0], 1]).compressed())
                    console.log(nitrogen_atom_id)
                }
                throw new Error("Unable to determine nitrogen index on reagent")
            }


            const hydrogen_1 = AtomFactory("H", "")
            const hydrogen_2 = AtomFactory("H", "")
            this.reaction.container_reagent[0][1].addAtom(hydrogen_1)
            this.reaction.container_reagent[0][1].addAtom(hydrogen_2)
            this.reaction.container_reagent[0][1][nitrogen_index].bondAtomToAtom(hydrogen_1, this.reaction.container_reagent[0][1])
            this.reaction.container_reagent[0][1][nitrogen_index].bondAtomToAtom(hydrogen_2, this.reaction.container_reagent[0][1])
            //bondsAI.addHydrogen(this.reaction.container_reagent, nitrogen_index)
            //bondsAI.addHydrogen(this.reaction.container_reagent, nitrogen_index)
            this.reaction.setChargesOnReagent()
            if (DEBUG) {
                console.log(VMolecule([this.reaction.container_reagent[0], 1]).compressed())
                console.log(VMolecule([this.reaction.container_reagent[0], 1]).canonicalSMILES())
            }
        }

        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()
        this.reaction.setChargesOnSubstrate()
        this.reaction.setChargesOnReagent()
       // this.reaction.MoleculeAI.validateMolecule() // check each atom does not have more than allowed number of valence electrons
       // this.reaction.ReagentAI.validateMolecule() // check each atom does not have more than allowed number of valence electrons

        if (DEBUG) {
            console.log("Substrate (after splitting:")
            console.log(VMolecule(this.reaction.container_substrate).canonicalSMILES())
            console.log("Reagent (after splitting:")
            console.log(VMolecule(this.reaction.container_reagent).compressed())
            console.log(VMolecule(this.reaction.container_reagent).canonicalSMILES())
        }

        // For testing purposes
        return [
            this.reaction.container_substrate,
            this.reaction.container_reagent
        ]


    }


}

module.exports = MoleculeAI
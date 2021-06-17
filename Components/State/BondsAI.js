const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const VAtom = require('../Stateless/Views/Atom')
const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')
const AtomFactory = require('../../Models/AtomFactory')
const Set = require('../../Models/Set')
const uniqid = require('uniqid');
const Typecheck = require('./../../Typecheck')
const Constants = require("../../Constants")

// removeProton(molecule, atom_index, electrons, proton)
// removeAtom(molecule, atom) {
// removeBond(atom1, atom2, molecule_container)
// removeDoubleBond(atom1, atom2, molecule_container)
// makeNitrogenCarbonTripleBond()
// makeNitrogenCarbonDoubleBond(n_index=null, carbon_index=null, DEBUG)
// makeOxygenCarbonDoubleBond(oxygen, carbon, DEBUG)
// breakCarbonNitrogenTripleBond()
// breakCarbonNitrogenDoubleBond()
// breakCarbonOxygenDoubleBond()
// breakCarbonDoubleBond()
// removeHalide()
// makeCarbonNitrogenDoubleBondReverse(nitrogen_index, carbon_index, DEBUG)
// makeOxygenCarbonDoubleBondReverse()
// breakCarbonOxygenTerminalDoubleBondReverse()
// bondSubstrateToReagentReverse()
// removeHalideReverse()
// makeCarbonCarbonDoubleBondByAtomIndex(c2_negative_carbon_index, c1_positive_carbon_index, DEBUG)
// breakOxygenCarbonSingleBond(oxygen_atom_id)
// isBond(atom1_controller, atom2_controller)
// breakCarbonNitrogenDoubleBondReverse(nitrogen_index, carbon_index, DEBUG)
// bondAtoms(atom1, atom2)
// bondAtomsReverse(atom1, atom2)
// bondAtomsReverse(atom1, atom2)
// addHydrogen(molecule_container, atom_index)
// creatingCoordinateCovalentBond(atom)
// removeCoordinateCovalentBond(atom1, atom2)
// bondAtomToCarbonylCarbon()
// bondNitrogenOnReagentToCarbonOnSubstrate(carbon, nitrogen)
// bondReagentToSubstrate(nucleophile_atom, electrophile_atom)
// OneTwoAddiction(nucleophile_atom_on_reagent, electrophile_atom_on_substrate, molecule_container, DEBUG, check=true)
class BondsAI {

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

        this.reaction = reaction
    }

    bondAtomToCarbonylCarbon() {

    }

    creatingCoordinateCovalentBond(donor_atom, base_atom) {

        Typecheck(
            {name:"donor_atom", value:donor_atom, type:"object"},
            {name:"base_atom", value:base_atom, type:"object"},
        )

        if (donor_atom === null || donor_atom === undefined) {
            throw new Error("Donor atom is null or undefined")
        }

        if (base_atom === null || base_atom === undefined) {
            throw new Error("Base atom is null or undefined")
        }

        // If base atom still has at least one free electron it can share then not creating a coordinate covalent bond
        // If base atom has no free slots then not creating a coordinate covalent bond
        if (base_atom.freeElectrons().length > 0 || base_atom.freeSlots() === 0) {
            return false
        }

        // Donor atom must have at least two free electrons
        return donor_atom.freeElectrons() > 1

    }

    removeCoordinateCovalentBond(donor_atom, target_atom) {

        Typecheck(
            {name:"donor_atom", value:donor_atom, type:"object"},
            {name:"target_atom", value:target_atom, type:"object"}
        )

        if (donor_atom === undefined || donor_atom === null) {
            throw new Error("Donor atom is undefined or null")
        }

        if (target_atom === undefined || target_atom === null) {
            throw new Error("Target atom is undefined or null")
        }

        if (!this.isBond(target_atom, donor_atom) && !this.isDoubleBond(target_atom, donor_atom)) {
            throw new Error("No bond exists")
        }

        const target_atom_electrons = target_atom.electrons()
        const donor_atom_electrons = donor_atom.electrons()

        const shared_electrons = donor_atom.electronsSharedWithSibling(donor_atom).slice(0,2)

        donor_atom.removeElectrons(shared_electrons)
        target_atom.electrons().length.should.be.equal(target_atom_electrons.length)
        donor_atom.electrons().length.should.be.equal(donor_atom_electrons.length -2)

    }

    removeHydrogenBond(atom, hydrogen, molecule_container, DEBUG) {

        Typecheck(
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"atom", value:atom, type:"object"},
            {name:"hydrogen", value:hydrogen, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"},
        )

        // No bond between the two atoms
        if (!this.isBond(atom, hydrogen, DEBUG) && !this.isDoubleBond(atom, hydrogen, DEBUG)) {
            return false
        }

        atom.removeHydrogenBond(hydrogen)

        if (this.isBond(atom, hydrogen, DEBUG)) {
            throw new Error("BondsAI removeHydrogenBond() Failed to remove bond")
        }

        if (this.isDoubleBond(atom, hydrogen, DEBUG)) {
            throw new Error("BondsAI removeHydrogenBond() Failed to remove double bond")
        }

    }

    removeBond(atom1, atom2, molecule_container, DEBUG) {

        Typecheck(
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"atom1", value:atom1, type:"object"},
            {name:"atom2", value:atom2, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"},
        )

        // No bond between the two atoms
        if (!this.isBond(atom1, atom2, DEBUG)) {
            throw new Error("Attempting to remove single bond where no bond exists")
        }

        // Check for coordinate bond
        if (atom1.isCoordinateCovalentBond(atom2) || atom2.isCoordinateCovalentBond(atom1)) {
            this.removeCoordinateCovalentBond(atom1, atom2)
        } else {
            // Standard covalent bond
            atom1.removeCovalentBond(atom2)
            if (this.isDoubleBond(atom1, atom2, DEBUG)) {
                atom1.removeCovalentBond(atom2)
            }
        }

        if (this.isBond(atom1, atom2, DEBUG)) {
            throw new Error("BondsAI removeBond() Failed to remove bond")
        }

        molecule_container[0][1][atom1.atomIndex] = atom1.atom
        molecule_container[0][1][atom2.atomIndex] = atom2.atom

        return molecule_container
    }

    doubleBondToSingleBond(atom1, atom2, molecule_container, DEBUG){
        Typecheck(
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"atom1", value:atom1, type:"object"},
            {name:"atom2", value:atom2, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"},
        )

        // No bond between the two atoms
        if (!this.isDoubleBond(atom1, atom2, DEBUG)) {
            throw new Error("Attempting to change double bond to single bond where no double bond exists")
        }

    }


    removeDoubleBond(atom1, atom2, molecule_container, DEBUG) {

        Typecheck(
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"atom1", value:atom1, type:"object"},
            {name:"atom2", value:atom2, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"},
        )

        // No bond between the two atoms
        if (!this.isDoubleBond(atom1, atom2, DEBUG)) {
            throw new Error("Attempting to remove a double bond where no double bond exists")
        }

        // Standard covalent bond
        atom1.removeCovalentBond(atom2)
        atom1.removeCovalentBond(atom2)

        if (this.isDoubleBond(atom1, atom2, DEBUG)) {
            throw new Error("BondsAI removeBond() Failed to remove double bond")
        }

        if (DEBUG) {
            console.log("BondsAI removeDoubleBond() container after removing double bond:")
            console.log(VMolecule(molecule_container).compressed())
        }

        molecule_container[0][1][atom1.atomIndex] = atom1.atom
        molecule_container[0][1][atom2.atomIndex] = atom2.atom

        return molecule_container

    }

    bondAtomsReverse(atom1, atom2, molecule_container, DEBUG) {
        Typecheck(
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"atom1", value:atom1, type:"object"},
            {name:"atom2", value:atom2, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"},
        )
        return this.removeBond(atom1, atom2, molecule_container)
    }

    createDoubleBond(atom1_id, atom2, molecule_container, DEBUG, check=true) {
        Typecheck(
            {name:"atom1_id", value:atom1_id, type:"string"},
            {name:"atom2", value:atom2, type:"object"},
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"DEBUG", value:check, type:"boolean"},
            {name:"check", value:check, type:"boolean"},
        )

        if (atom1_id === null || atom1_id === undefined) {
            throw new Error("atom1_id is undefined or null")
        }

        if (atom2 === null || atom2 === undefined) {
            throw new Error("Atom is undefined or null")
        }

        const atom1_index = molecule_container[0][1].getAtomIndexById(atom1_id)

        const atom1 = CAtom(molecule_container[0][1][atom1_index], atom1_index, molecule_container)

        atom1.checkNumberOfElectrons()
        atom2.checkNumberOfElectrons()

        if (this.isBond(atom1, atom2, molecule_container, DEBUG)) {
            this.bondAtoms(atom1, atom2, molecule_container, DEBUG, false)
        } else {
            this.bondAtoms(atom1, atom2, molecule_container, DEBUG, true)
            this.bondAtoms(atom1, atom2, molecule_container, DEBUG, false)
        }

        if (check && !this.isDoubleBond(atom1, atom2, DEBUG)) {
            throw new Error("Failed to create double bond")
        }

    }

    createCoordinateCovalentBond(donor_atom, target_atom, molecule_container, DEBUG) {
        Typecheck(
            {name:"donor_atom", value:donor_atom, type:"object"},
            {name:"target_atom", value:target_atom, type:"object"},
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        const donor_atom_free_electrons = donor_atom.freeElectrons()
        if (donor_atom_free_electrons.length < 2) {
            throw new Error("Donor atom does not have enough free electrons to form a coordinate covalent bond.")
        }

        if (donor_atom === null || donor_atom === undefined) {
            throw new Error("Atom is undefined or null")
        }

        if (target_atom === null || target_atom === undefined) {
            throw new Error("Atom is undefined or null")
        }

        molecule_container[0][1][target_atom.atomIndex].addElectron(donor_atom_free_electrons[0])
        molecule_container[0][1][target_atom.atomIndex].addElectron(donor_atom_free_electrons[1])

    }

    bondAtoms(atom1, atom2, molecule_container, DEBUG, check=true) {

        Typecheck(
            {name:"atom1", value:atom1, type:"object"},
            {name:"atom2", value:atom2, type:"object"},
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"DEBUG", value:check, type:"boolean"},
            {name:"check", value:check, type:"boolean"},
        )


        if (atom1 === null || atom1 === undefined) {
            throw new Error("Atom is undefined or null")
        }

        if (atom2 === null || atom2 === undefined) {
            throw new Error("Atom is undefined or null")
        }

        // Confirm that the number of electrons is 8 or less
        atom1.checkNumberOfElectrons()
        atom2.checkNumberOfElectrons()

        const atom2FreeElectrons = _.cloneDeep(atom2.freeElectrons())
        const atom1FreeElectrons = _.cloneDeep(atom1.freeElectrons())

        // Check if we are making a coordinate or standard covalent bond
        // In a coordinate covalent bond one of the atoms donates both electrons.
        // In a standard covalent bond each atom donates an electron.
        if (this.creatingCoordinateCovalentBond(atom1, atom2)) { // donor_atom, base_atom
            this.createCoordinateCovalentBond(atom1, atom2, molecule_container, DEBUG)
        } else if (this.creatingCoordinateCovalentBond(atom2, atom1)) { // donor_atom, base_atom
            this.createCoordinateCovalentBond(atom2, atom1, molecule_container, DEBUG)
        } else {


            if (atom2FreeElectrons.length === 0) {
                throw new Error("Atom2 should have at least one free electron")
            }

            // Standard covalent bond
            if (atom1FreeElectrons.length === 0) {
                //console.log(VMolecule(molecule_container).compressed())
                throw new Error("Atom1 should have at least one free electron")
            }



            atom1FreeElectrons.length.should.be.greaterThan(0)
            atom2FreeElectrons.length.should.be.greaterThan(0)

            const atom1FreeElectron = atom1FreeElectrons[0]
            const atom2FreeElectron = atom2FreeElectrons[0]

            molecule_container[0][1].getAtomById(atom1.atomId()).addElectron(atom2FreeElectron)
            molecule_container[0][1].getAtomById(atom2.atomId()).addElectron(atom1FreeElectron)
        }

        // Confirm we have created a bond
        if (check && !this.isBond(atom1, atom2, DEBUG)) {
            console.log(VMolecule(molecule_container).compressed())
            console.log(atom1.atomId())
            console.log(atom2.atomId())
            throw new Error("Failed to create bond")
        }

    }

    isBond(atom1_controller, atom2_controller, DEBUG) {
        Typecheck(
            {name:"atom1_controller", value:atom1_controller, type:"object"},
            {name:"atom2_controller", value:atom2_controller, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )
        return atom1_controller.isBondedTo(atom2_controller, DEBUG)
    }

    isDoubleBond(atom1_controller, atom2_controller, DEBUG) {
        Typecheck(
            {name:"atom1_controller", value:atom1_controller, type:"object"},
            {name:"atom2_controller", value:atom2_controller, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )
        const is_double_bonded_to = atom1_controller.isDoubleBondedTo(atom2_controller, DEBUG)
        is_double_bonded_to.should.be.a.Boolean()
        return is_double_bonded_to
    }

    addHydrogen(molecule_container, atom_index) {
        Typecheck(
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"atom_index", value:atom_index, type:"number"},
        )

        if(molecule_container === null || molecule_container === undefined) {
            throw new Error("Molecule container is null or undefined")
        }

        if(atom_index === null || atom_index === undefined) {
            throw new Error("Atom index is null or undefined")
        }

        const hydrogen_arr = AtomFactory("H", "")
        const atom = CAtom(molecule_container[0][1][atom_index], atom_index, molecule_container)
        const hydrogen_electron_to_share = hydrogen_arr[hydrogen_arr.length-1]
        const atom_free_electrons = atom.freeElectrons()
        molecule_container[0][1][atom_index].addElectron(hydrogen_electron_to_share)
        hydrogen_arr.addElectron(atom_free_electrons[0], "H")
        molecule_container[0][1].addAtom(hydrogen_arr)
        return molecule_container
    }

    addHydrogenV2(molecule_container, atom_index) {
        const proton = AtomFactory("H", "")
        const atom = CAtom(molecule_container[0][1][atom_index], atom_index, molecule_container)
        const free_electrons = atom.freeElectrons()
        if (free_electrons.length ===0) {
            molecule_container[0][1][atom_index].addElectron(proton[proton.length-1])
        }
        molecule_container[0][1].addAtom(proton)

        return molecule_container
    }

    addProton(molecule_container, atom, DEBUG) {
        Typecheck(
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"atom", value:atom, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )
        const proton = AtomFactory("H", "").removeAllElectrons()
        proton.length.should.be.equal(Constants().electron_index)
        // We can only add a proton if the target atom has at least one free pair
        const free_electrons = atom.freeElectrons()
        if (free_electrons.length > 1) {
            // Add two electrons to proton to create coordinate covalent bond
            proton.addElectron(free_electrons[0])
            proton.addElectron(free_electrons[1])
            // Add proton to molecule
            molecule_container[0][1].addAtom(proton)
        } else {
            throw new Error('Unable to add proton as target atom does not have enough free electrons.')
        }
        proton.length.should.be.equal(Constants().electron_index + 2)
    }

    removeProton(molecule_container, atom, DEBUG) {

        // When we remove a proton the number of electrons on the parent should not change.
        Typecheck(
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"atom", value:atom, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        const atom_electrons = atom.electrons()

        const hydrogens = atom.getHydrogenBonds()
        if (hydrogens.length === 0) {
            throw new Error("Unable to remove proton as no hydrogens found")
        }

        const hydrogen = CAtom(molecule_container[0][1][hydrogens[0].atom_index], hydrogens[0].atom_index, molecule_container)

        // Remove shared electrons from hydrogen but keep them on the main atom as we are removing a proton..
        const shared_electrons = hydrogen.sharedElectrons()
        if (shared_electrons.length !==2) {
            throw new Error("Cannot remove proton as hydrogen atom attached to atom has no shared electrons")
        }
        hydrogen.removeElectrons(shared_electrons)
        hydrogen.electrons().length.should.be.equal(0)

        const number_of_atoms = molecule_container[0][1].length
        this.removeAtom(molecule_container, molecule_container[0][1][hydrogen.atomIndex])
        number_of_atoms.should.be.equal(molecule_container[0][1].length -1)
        atom_electrons.length.should.be.equal(atom.electrons().length)

    }

    removeHydrogen(molecule, atom, electrons=null, proton=null, DEBUG=false) {

        Typecheck(
            {name:"molecule", value:molecule, type:"array"},
            {name:"atom", value:atom, type:"object"},
            {name:"electrons", value:electrons, type:"array"},
            {name:"proton", value:proton, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        if (DEBUG) {
            console.log("BondsAI removeProton() - molecule")
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log("BondsAI removeProton() - nitrogen index")
            console.log(atom_index)
        }
        //const nitrogen_atom = CAtom(this.reaction.container_substrate[0][1][atom_index], atom_index, this.reaction.container_substrate)
        if ((electrons === null || electrons.length ===0) && proton === null) {
            const hydrogen_bonds = atom.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "H"
            })
            if (hydrogen_bonds.length ===0) {
                return false
            }
            proton = CAtom(molecule[0][1][hydrogen_bonds[0].atom_index], hydrogen_bonds[0].atom_index, this.reaction.container_substrate)
        }

        // removeBond(atom1, atom2, molecule_container, DEBUG)
        //console.log(VMolecule(molecule).compressed())
        this.removeBond(atom, proton, molecule)
        //console.log(VMolecule(molecule).compressed())
        //molecule[0][1][nitrogen_atom.atomIndex].addElectron(uniqid())
        //molecule[0][1][nitrogen_atom.atomIndex].addElectron(uniqid())
        molecule = this.removeAtom(molecule, molecule[0][1][proton.atomIndex])
        return molecule
    }



    removeAtom(molecule, atom, atom_index) {
        //this.container_substrate[0][1] = Set().removeFromArray(this.container_substrate[0][1], this.container_substrate[0][1][h_c_hydrogen_bonds[0].atom_index])
        Typecheck(
            {name:"atom", value:atom, type:"array"},
            {name:"atom_index", value:atom_index, type:"number"}
        )

        if (atom === null || atom === undefined) {
            throw new Error("Atom is null or undefined")
        }

        if (atom_index === null || atom_index === undefined) {
            throw new Error("Atom index is null or undefined")
        }

        const number_of_atoms_at_start =  molecule[0][1].length
        molecule[0][1].removeAtom(atom, atom_index)
        molecule[0][1].length.should.be.equal(number_of_atoms_at_start -1)

    }

    makeNitrogenCarbonTripleBond() {

        const nitrogen_index = this.reaction.MoleculeAI.findNitrogenOnDoubleBondIndex()

        if (nitrogen_index === -1) {
            return false
        }


        const nitrogen = CAtom(this.reaction.container_substrate[0][1][nitrogen_index], nitrogen_index, this.reaction.container_substrate)
        const carbon_bonds = nitrogen.indexedDoubleBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        })
        const carbon_index = carbon_bonds[0].atom_index

        const freeElectrons = nitrogen.freeElectrons()
        // Add electrons to carbon
        this.reaction.container_substrate[0][1][carbon_index].addElectron(freeElectrons[0])
        this.reaction.container_substrate[0][1][carbon_index].addElectron(freeElectrons[1])

        // Charges
        this.reaction.container_substrate[0][1][carbon_index][4] = this.reaction.container_substrate[0][1][carbon_index][4] === "+" ? "": "-"
        this.reaction.container_substrate[0][1][nitrogen_index][4] = this.reaction.container_substrate[0][1][nitrogen_index][4] === "-"?"":"+"


        this.reaction.setMoleculeAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (makeNitrogenCarbonTripleBond())')
            console.log('Method: makeNitrogenCarbonTripleBond()')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(i)
        }

    }

    makeNitrogenCarbonDoubleBond(n_index=null, carbon_index=null, DEBUG = false) {

        n_index = n_index===null?this.reaction.MoleculeAI.findNitrogenAttachedToCarbonIndexNoDoubleBonds():n_index
        if (n_index === -1) {
            return false
        }

        const n = CAtom(this.reaction.container_substrate[0][1][n_index], n_index, this.reaction.container_substrate)

        if (carbon_index === null) {
            const carbon_bonds = n.indexedBonds("").filter((bond) => {
                if (bond.atom[0] !== "C") {
                    return false
                }
                const c = CAtom(this.reaction.container_substrate[0][1][bond.atom_index], bond.atom_index, this.reaction.container_substrate)
                return c.indexedBonds("").filter((bond) => {
                    return bond.atom[0] === "O"
                }).length > 0
            })

            if (carbon_bonds.length === 0) {
                return false
            }
            const carbon_index = carbon_bonds[0].atom_index
        }


        // Check for C=X bonds and change to single bond (not N)
        const c_atom = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
        const double_bond = c_atom.indexedDoubleBonds("").filter((bond)=>{
            return bond.atom[0] !== 'N'
        }).pop()

        if (double_bond !== undefined) {
            this.reaction.__changeDoubleBondToSingleBond(double_bond.atom_index, carbon_index)
        }

        // Proton if applicable
        const proton_n_bond = n.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        }).pop()

        if (proton_n_bond !== undefined) {
            const proton_shared_electrons = proton_n_bond.shared_electrons
            const proton_index = proton_n_bond.atom_index
            // Remove electrons from proton
            _.remove(this.reaction.container_substrate[0][1][proton_index], (e) => {
                return e === proton_shared_electrons[0] || e === proton_shared_electrons[1]
            })
            // Add electrons to carbon
            this.reaction.container_substrate[0][1][carbon_index].addElectron(proton_shared_electrons[0])
            this.reaction.container_substrate[0][1][carbon_index].addElectron(proton_shared_electrons[1])
        } else {
            const freeElectrons = n.freeElectrons()
            // Add electrons to carbon
            this.reaction.container_substrate[0][1][carbon_index].addElectron(freeElectrons[0])
            this.reaction.container_substrate[0][1][carbon_index].addElectron(freeElectrons[1])
        }

        // Charges
        this.reaction.setChargeOnSubstrateAtom(carbon_index)
        this.reaction.setChargeOnSubstrateAtom(n_index)

        this.reaction.setMoleculeAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (makeNitrogenCarbonDoubleBond())')
            console.log('Method: makeNitrogenCarbonDoubleBond()')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(i)
        }

        return true

    }

    makeCarbonCarbonDoubleBondByAtomIndex(c2_negative_carbon_index, c1_positive_carbon_index, DEBUG) {

        if (DEBUG) {
            console.log(c2_negative_carbon_index)
            console.log(c1_positive_carbon_index)
        }

        // was nitrogen
        const negativeC2CarbonAtom = CAtom(this.reaction.container_substrate[0][1][c2_negative_carbon_index], c2_negative_carbon_index, this.reaction.container_substrate)

        // Check for C=X bonds and change to single bond (not N)
        const positiveC1CarbonAtom = CAtom(this.reaction.container_substrate[0][1][c1_positive_carbon_index], c1_positive_carbon_index, this.reaction.container_substrate)

        this.createDoubleBond(negativeC2CarbonAtom, positiveC1CarbonAtom, DEBUG)

    }


    makeOxygenCarbonDoubleBond(oxygen, carbon, DEBUG) {

        Typecheck(
            {name:"oxygen", value:oxygen, type:"object"},
            {name:"carbon", value:carbon, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"},
            {name:"this.reaction", value:this.reaction, type:"object"},
            {name:"this.reaction.MoleculeAI", value:this.reaction.MoleculeAI, type:"object"},
        )

        // This should NOT remove H from the oxygen
        this.reaction.setMoleculeAI()

        if (DEBUG) {
            console.log("BondsAI container substrate:")
            console.log(VMolecule(this.reaction.container_substrate).compressed())
        }

        let oxygen_index = null
        let oxygen_id = null


        if (oxygen === null ) {
            throw new Error("Oxygen is null")
            oxygen_index = this.reaction.MoleculeAI.findOxygenAttachedToCarbonIndexNoDoubleBonds()
            if (oxygen_index === -1) {
                // Look for oxygen with no bonds
                oxygen_index = this.reaction.MoleculeAI.findOxygenWithNoBondsIndex(DEBUG)
                if(oxygen_index === -1) {
                    throw new Error("BondsAI makeOxygenCarbonDoubleBond -> oxygen atom not found")
                }
            }
            oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
            oxygen_id = _.cloneDeep(oxygen.atomId())
        } else {
            oxygen_index = oxygen.atomIndex
            oxygen_id = _.cloneDeep(oxygen.atomId())
        }

        if (carbon === null) {
            let carbon_index =  this.reaction.MoleculeAI.findCarbonWithNoBondsIndex(DEBUG)
            if (carbon_index === -1) {
                throw new Error("BondsAI makeOxygenCarbonDoubleBond() -> carbon index not found")
            }
            carbon = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
        }


        if (oxygen === null || oxygen === undefined) {
            throw new Error("Oxygen atom is undefined or null")
        }

        if (carbon === null || carbon === undefined) {
            throw new Error("Carbon atom is undefined or null")
        }


        this.createDoubleBond(oxygen_id, carbon, this.reaction.container_substrate, DEBUG, true)

        this.reaction.setMoleculeAI()

        if (DEBUG) {
            console.log("BondsAI makeOxygenCarbonDoubleBond() -> after adding double bond:")
            console.log(VMolecule(this.reaction.container_substrate).compressed())
        }

    }

    breakCarbonNitrogenTripleBond() {

        const nitrogen_index = this.reaction.MoleculeAI.findNitrogenOnTripleBondIndex()
        // console.log('breakCarbonNitrogenTripleBond')
        // console.log(nitrogen_index)

        if (nitrogen_index === -1) {
            return false
        }

        const nitrogen_atom = CAtom(this.reaction.container_substrate[0][1][nitrogen_index], nitrogen_index, this.reaction.container_substrate)
        const triple_bonds = nitrogen_atom.indexedTripleBonds("")

        const shared_electrons = _.cloneDeep(triple_bonds[0].shared_electrons).slice(0,2)

        // Remove bond
        // Remove electrons from C
        _.remove(this.reaction.container_substrate[0][1][triple_bonds[0].atom_index], (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        // carbon atom charge
        this.reaction.container_substrate[0][1][triple_bonds[0].atom_index][4] =  this.reaction.container_substrate[0][1][triple_bonds[0].atom_index][4] === "-"? '': '+'

        // Nitrogen atom charge
        this.reaction.container_substrate[0][1][nitrogen_index][4] = this.reaction.container_substrate[0][1][nitrogen_index][4] === "+" ? "":"-"


        this.reaction.setMoleculeAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (breakCarbonNitrogenTripleBond())')
            console.log('Method: breakCarbonNitrogenTripleBond()')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(i)
        }

        return true

    }

    breakCarbonNitrogenDoubleBond() {

        const nitrogen_index = this.reaction.MoleculeAI.findNitrogenOnDoubleBondIndex()
        // console.log('breakCarbonNitrogenDoubleBond')
        // console.log(nitrogen_index)

        if (nitrogen_index === -1) {
            return false
        }

        const nitrogen_atom = CAtom(this.reaction.container_substrate[0][1][nitrogen_index], nitrogen_index, this.reaction.container_substrate)
        const double_bonds = nitrogen_atom.indexedDoubleBonds("")

        const shared_electrons = _.cloneDeep(double_bonds[0].shared_electrons).slice(0,2)

        // Remove bond
        // Remove electrons from C
        _.remove(this.reaction.container_substrate[0][1][double_bonds[0].atom_index], (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        // carbon atom charge
        this.reaction.container_substrate[0][1][double_bonds[0].atom_index][4] =  this.reaction.container_substrate[0][1][double_bonds[0].atom_index][4] === "-"? '': '+'

        // Nitrogen atom charge
        this.reaction.container_substrate[0][1][nitrogen_index][4] = this.reaction.container_substrate[0][1][nitrogen_index][4] === "+" ? "":"-"


        this.reaction.setMoleculeAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (breakCarbonNitrogenDoubleBond())')
            console.log('Method: breakCarbonNitrogenDoubleBond()')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(i)
        }


        return true

    }

    breakCarbonOxygenDoubleBond(DEBUG) {

        const oxygen_index = this.reaction.MoleculeAI.findOxygenOnDoubleBondIndex()
        //   // console.log('breakCarbonOxygenDoubleBond')
        //   // console.log(oxygen_index)
        if (oxygen_index === -1) {
            return false
        }


        const oxygen_atom = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
        const double_bonds = oxygen_atom.indexedDoubleBonds("")

        const shared_electrons = _.cloneDeep(double_bonds[0].shared_electrons).slice(0,2)

        // Remove double bond
        // Remove electrons from C
        _.remove(this.reaction.container_substrate[0][1][double_bonds[0].atom_index], (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        // Check that there no double bonds
        oxygen_atom.indexedDoubleBonds("").length.should.be.equal(0)

        this.reaction.setMoleculeAI()

        // Check for proton
        if (undefined !== this.reaction.container_reagent && null !== this.reaction.container_reagent && this.reaction.container_reagent[0][1][0][0] === "H" && this.reaction.container_reagent[0][1][0][4]==="+") {
            // Add proton to oxygen
            this.reaction.addProtonToAtom(oxygen_index, this.reaction.container_reagent[0][1][0])
            this.reaction.setMoleculeAI()

        } else {

            // Look for atom attached to carbon atom that is not oxygen and is negatively charged
            // If atom exists create double bond between carbon atom and that atom.
            const carbon_atom_object = CAtom(this.reaction.container_substrate[0][1][double_bonds[0].atom_index], double_bonds[0].atom_index, this.reaction.container_substrate)
            const carbon_atom_negative_bonds = carbon_atom_object.indexedBonds("").filter((bond) => {
                return bond.atom[0] !== 'H' && bond.atom[0] !== 'O' && bond.atom[4] === '-'
            })

        }

        this.reaction.setMoleculeAI()


        return true

    }

    breakCarbonDoubleBond(DEBUG) {

        // @see Organic Chemistry 8th edition p245
        // Get index of double bond carbon bonded to the most hydrogens
        let atom_nucleophile_index = this.reaction.MoleculeAI.findLeastSubstitutedCarbonPiBondIndex()

        if (DEBUG) {
            console.log("BondsAI breakCarbonDoubleBond() -> atom nucleophile index = " + atom_nucleophile_index)
        }

        if (atom_nucleophile_index === -1) {
            return false
        }
        atom_nucleophile_index.should.be.an.Number()
        atom_nucleophile_index.should.be.greaterThan(-1)

        const atoms = _.cloneDeep(this.reaction.container_substrate[0][1])

        let free_electrons = []

        // Check for double bond and if there is one break it and get shared electrons from that.
        const double_bonds = CAtom(this.reaction.container_substrate[0][1][atom_nucleophile_index], atom_nucleophile_index, this.reaction.container_substrate).indexedDoubleBonds("")

        if (DEBUG) {
            console.log("BondsAI breakCarbonDoubleBond() -> double bond atom=" +  double_bonds[0].atom_index)
        }

        if (double_bonds.length === 0) {
            return false
        }

        const shared_electrons = _.cloneDeep(double_bonds[0].shared_electrons).slice(0,2)

        // Remove double bond
        _.remove(this.reaction.container_substrate[0][1][double_bonds[0].atom_index], (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()

        return true

    }

    makeOxygenCarbonDoubleBondReverse() {


        const oxygen_index = this.reaction.MoleculeAI.findOxygenOnDoubleBondIndex()


        if(oxygen_index === -1) {
            return false
        }

        const oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
        const carbon_bonds = oxygen.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        })

        if (carbon_bonds.length === 0) {
            return false
        }

        const shared_electrons = carbon_bonds[0].shared_electrons
        // Remove electrons from carbon
        _.remove(this.reaction.container_substrate[0][1][carbon_bonds[0].atom_index], (e)=>{
            return e === shared_electrons[0] || e === shared_electrons[1]
        })

        // Create proton and add it to the oxygen
        // See Leuckart Wallach
        // Pinacol Rearrangement doesn't add H
        // Charges
        this.reaction.setChargeOnSubstrateAtom(oxygen_index)
        /*
        if (undefined !== this.reaction.rule && this.reaction.rule.mechanism === "pinacol rearrangement") {
            this.reaction.container_substrate[0][1][carbon_bonds[0].atom_index][4] = "+"
        } else {
            this.reaction.container_substrate[0][1][carbon_bonds[0].atom_index][4] = "-"
        }
         */
        //this.reaction.container_substrate[0][1][carbon_bonds[0].atom_index][4] = "+"
        this.reaction.setChargeOnSubstrateAtom(carbon_bonds[0].atom_index)

        this.reaction.setMoleculeAI()

        if (this.reaction.container_substrate[0][1][oxygen_index][4] !=="") {
            // console.log("Reaction.js makeOxygenCarbonDoubleBoneReverse() Oxygen atom has a charge")
            // console.log(VMolecule(this.reaction.container_substrate).compressed())
            // console.log(i)
        }

        if (this.reaction.container_substrate[0][1][carbon_bonds[0].atom_index][4]!=="") {
            // console.log("Reaction.js makeOxygenCarbonDoubleBoneReverse() Carbon atom has a charge")
            // console.log(i)
        }

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (makeOxygenCarbonDoubleBondReverse())')
            console.log('Method: makeOxygenCarbonDoubleBondReverse()')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(i)
        }

        return true

    }


    makeCarbonNitrogenDoubleBondReverse(nitrogen_index, carbon_index, DEBUG) {

        if (undefined === nitrogen_index) {
            nitrogen_index = this.reaction.MoleculeAI.findNitrogenOnDoubleBondIndex()
        }

        if (nitrogen_index === -1) {
            return false
        }

        const nitrogen_atom = CAtom(this.reaction.container_substrate[0][1][nitrogen_index], nitrogen_index, this.reaction.container_substrate)
        const double_bonds = nitrogen_atom.indexedDoubleBonds("")


        const shared_electrons = _.cloneDeep(double_bonds[0].shared_electrons).slice(0,2)
        if (undefined === carbon_index ) {
            carbon_index = double_bonds[0].atom_index
        }

        // Remove bond
        // Remove electrons from C
        _.remove(this.reaction.container_substrate[0][1][carbon_index], (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        return true

    }

    breakCarbonNitrogenDoubleBondReverse(nitrogen_id, carbon_id, DEBUG) {

        Typecheck(
            {name:"nitrogen_id", value:nitrogen_id, type:"string"},
            {name:"carbon_id", value:carbon_id, type:"string"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        if (nitrogen_id === null || nitrogen_id === undefined) {
            throw new Error("nitrogen id is null or undefined")
        }

        if (carbon_id === null || carbon_id === undefined) {
            throw new Error("carbon id is null or undefined")
        }


        // Make C=O bond
        /*
        if (nitrogen_index === undefined || nitrogen_index === null) {
            nitrogen_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=> {
                if ( atom[0] !== "N") {
                    return false
                }
                const n = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)
                const c_bonds = o.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === "C"
                })
                return c_bonds.length > 0
            })
        }
        if (nitrogen_index === -1) {
            return false
        }
         */
        const nitrogen_index = this.reaction.container_substrate[0][1].getAtomIndexById(nitrogen_id)
        const nitrogen = CAtom(this.reaction.container_substrate[0][1][nitrogen_index], nitrogen_index, this.reaction.container_substrate)

        /*
        if (carbon_index === undefined || carbon_index === null) {
            const carbon_bonds = oxygen.indexedBonds("").filter((bond) => {
                //return bond.atom[0] === "C" && bond.atom[4] !== "" && bond.atom[4] !== 0
                if (bond.atom[0] !== "C") {
                    return false
                }
                const c = CAtom(this.reaction.container_substrate[0][1][bond.atom_index], bond.atom_index, this.reaction.container_substrate)
                if (c.doubleBondCount() > 0) {
                    return false
                }
                if (c.bondCount() > 3) {
                    //   return false
                }
                return true
            })
            if (carbon_bonds.length === 0) {
                return false
            }
            carbon_index = carbon_bonds[0].atom_index
        }
         */

        const freeElectrons = nitrogen.freeElectrons()

        const carbon_index = this.reaction.container_substrate[0][1].getAtomIndexById(carbon_id)
        const carbon_atom = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
        const carbon_atom_free_electrons = carbon_atom.freeElectrons()

        // Make space for electrons
        const carbon_electrons_before = this.reaction.container_substrate[0][1][carbon_index].length
        _.remove(this.reaction.container_substrate[0][1][carbon_index], (e, i)=>{
            return e === carbon_atom_free_electrons[0] || e === carbon_atom_free_electrons[1]
        })
        carbon_electrons_before.should.be.lessThan(this.reaction.container_substrate[0][1][carbon_index].length + 2)

        const nitrogen_hydrogen_bonds = nitrogen.getHydrogenBonds()
        if (nitrogen_hydrogen_bonds.length > 0) {
            const nitrogen_hydrogen =  CAtom(this.reaction.container_substrate[0][1][nitrogen_hydrogen_bonds[0].atom_index], nitrogen_hydrogen_bonds[0].atom_index, this.reaction.container_substrate)
            nitrogen.removeHydrogenOnNitrogenBond(nitrogen_hydrogen, DEBUG)
            this.removeAtom(this.reaction.container_substrate, nitrogen_hydrogen.atom)
            this.reaction.setMoleculeAI()
        }

        const carbon_hydrogen_bonds = carbon_atom.getHydrogenBonds()
        if (carbon_hydrogen_bonds.length > 0) {
            const carbon_hydrogen =  CAtom(this.reaction.container_substrate[0][1][carbon_hydrogen_bonds[0].atom_index], carbon_hydrogen_bonds[0].atom_index, this.reaction.container_substrate)
            carbon_atom.removeHydrogenOnCarbonBond(carbon_hydrogen, DEBUG)
            this.removeAtom(this.reaction.container_substrate, carbon_hydrogen.atom)
            this.reaction.setMoleculeAI()
        }

        if (DEBUG) {
            console.log(carbon_index)
            console.log(VMolecule(this.reaction.container_substrate).compressed())
        }

        // Add electrons from nitrogen to carbon
        this.reaction.setMoleculeAI()
        this.createDoubleBond(carbon_atom, nitrogen, this.reaction.container_substrate, DEBUG)
        //this.reaction.container_substrate[0][1][carbon_index].addElectron(freeElectrons[0])
        //this.reaction.container_substrate[0][1][carbon_index].addElectron(freeElectrons[1])

        if (DEBUG) {
            console.log(carbon_index)
            console.log(VMolecule(this.reaction.container_substrate).compressed())
        }

        return true


    }

    breakCarbonOxygenTerminalDoubleBondReverse(carbon, oxygen, DEBUG) {

        console.log(carbon)
        process.error()
        // @todo if carbon has no free electrons then need to find terminal atom attached to carbon and remove it and replace electrons with new electrons
        console.log(VMolecule(this.reaction.container_substrate).compressed())
        const terminal_atom = carbon.getTerminalAtom()
        console.log(terminal_atom)
        process.error()

        Typecheck(
            {name:"carbon", value:carbon, type:"object"},
            {name:"oxygen", value:oxygen, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        if (carbon !== null && carbon !== undefined) {
            carbon.atom[0].should.be.equal("C")
        }

        if (oxygen !== null && oxygen !== undefined) {
            oxygen.atom[0].should.be.equal("O")
        }

        this.reaction.setMoleculeAI()

        // Make C=O bond
        if (oxygen === null || oxygen === undefined) {
            const oxygen_index = this.reaction.MoleculeAI.findOxygenAttachedToCarbonIndex()
            if (oxygen_index === -1) {
                return false
            }
            oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
        }

        if (carbon === null || carbon === undefined) {
            const carbon_index = this.reaction.MoleculeAI.findCarbonAttachedToOxygenIndex(oxygen)
            if (carbon_index === -1) {
                return false
            }
            carbon = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
        }

        const oxygen_atom_free_electrons = oxygen.freeElectrons()
        const carbon_atom_free_electrons = carbon.freeElectrons()

        oxygen_atom_free_electrons.typeCheck('electron', 'string')
        carbon_atom_free_electrons.typeCheck('electron', 'string')

        oxygen_atom_free_electrons.length.should.be.greaterThan(3)

        // Make space for electrons
        if (carbon_atom_free_electrons.length === 0) {
            carbon.atom.pop()
            carbon.atom.pop()
        } else {
            carbon.removeElectrons([carbon_atom_free_electrons[carbon_atom_free_electrons.length-1], carbon_atom_free_electrons[carbon_atom_free_electrons.length-2]])
        }

        carbon.freeSlots().should.be.greaterThan(0)

        carbon_atom_free_electrons.typeCheck('electron', 'string')
        oxygen_atom_free_electrons.typeCheck('electron', 'string')

        // Add electrons from oxygen to carbon
        carbon.addElectronsFromOtherAtom([oxygen_atom_free_electrons[0], oxygen_atom_free_electrons[1]])

        // Remove all hydrogens from the oxygen atom
        const oxygen_hydrogens = oxygen.getHydrogens()

        // Remove hydrogens from oxygen atom and from molecule
        oxygen_hydrogens.map((oxygen_hydrogen)=>{
            Typecheck(
                {name:"oxygen_hydrogen", value:oxygen_hydrogen.atom, type:"array"},
            )
            const hydrogen = CAtom(this.reaction.container_substrate[0][1][oxygen_hydrogen.atom_index], oxygen_hydrogen.atom_index, this.reaction.container_substrate)
            this.removeHydrogenBond(oxygen, hydrogen, this.reaction.container_substrate, DEBUG)
            this.reaction.container_substrate[0][1].removeAtom(oxygen_hydrogen.atom)
        })

        if (carbon_atom_free_electrons.length === 0) {
            carbon_atom_free_electrons.push("C_" + "0" + "_" + uniqid())
            carbon_atom_free_electrons.push("C_" + "1" + "_" + uniqid())
        }
        console.log(carbon_atom_free_electrons)
        console.log(carbon.atom)
        console.log(oxygen.atom)
        process.error()

        if (DEBUG) {
            console.log(carbon.atom)
            console.log(oxygen.atom)
        }
        process.error()

        // Check that we now have a double bond between the carbon and the oxygen
        this.isDoubleBond(carbon, oxygen, DEBUG).should.be.true("Failed to create double bond")
        this.reaction.setMoleculeAI()
        // Charges
        this.reaction.setChargesOnSubstrate()
        this.reaction.MoleculeAI.validateMolecule()

        process.error()
        return true


    }

    oneTwoAddiction(nucleophile_atom_on_reagent, electrophile_atom_on_substrate, molecule_container, DEBUG, check=true) {

        // break one of the electrophile_atom_on_substrate bonds
        Typecheck(
        {name:"electrophile_atom_on_substrate", value:electrophile_atom_on_substrate, type:"object"},
            {name:"nucleophile_atom_on_reagent", value:nucleophile_atom_on_reagent, type:"object"},
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        if (nucleophile_atom_on_reagent === undefined || nucleophile_atom_on_reagent === null) {
            throw new Error("Nucleophile is undefined or null")
        }

        if (electrophile_atom_on_substrate === undefined || electrophile_atom_on_substrate === null) {
            throw new Error("Electrophile is undefined or null")
        }

        nucleophile_atom_on_reagent.electrons().length.should.be.greaterThan(1)

        // Get non carbon bonds
        const electrophile_atom_on_substrate_bonds = electrophile_atom_on_substrate.doubleBondsNoHydrogensOrCarbons()
        if (electrophile_atom_on_substrate_bonds.length === 0) {
            throw new Error("No bonds on electrophile found.")
        }

        const target_atom =  CAtom(
            molecule_container[0][1][electrophile_atom_on_substrate_bonds[0].atom_index],
            electrophile_atom_on_substrate_bonds[0].atom_index,
            molecule_container
        )

        this.removeCoordinateCovalentBond(electrophile_atom_on_substrate, target_atom) // donor -> target

        // Bond nucleophile to electrophile
        // donor -> target
        this.createCoordinateCovalentBond(nucleophile_atom_on_reagent, electrophile_atom_on_substrate, molecule_container, DEBUG, false)

        //console.log(VMolecule(molecule_container).compressed())
        if (!this.isBond(nucleophile_atom_on_reagent, electrophile_atom_on_substrate)) {
            throw new Error("Failed to create coordinate covalent bond")
        }

    }

    bondReagentToSubstrate(nucleophile_atom_on_reagent, electrophile_atom_on_substrate, DEBUG) {

        // Important:
        // The reagent atom is the nucleophile (Lewis base, (donates a share in an electron pair) and is attacking the substrate (Lewis acid, (accepts a shared in an electron pair)
        // The substrate is the electrophile
        Typecheck(
            {name:"electrophile_atom_on_substrate", value:electrophile_atom_on_substrate, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        if (typeof this.reaction.container_reagent ==="string") {
            throw new Error("When bonding reagent to substrate, reagent must not be a string.")
        }

        if (electrophile_atom_on_substrate === undefined || electrophile_atom_on_substrate === null) {
            const electrophile_index = this.reaction.MoleculeAI.findElectrophileIndex()
            if (electrophile_index===-1) {
                throw new Error("Unable to determine electrophile on substrate index")
            }
            electrophile_atom_on_substrate = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
        }

        if ((nucleophile_atom_on_reagent === undefined || nucleophile_atom_on_reagent === null) && typeof nucleophile_atom_on_reagent !== "string") {
            const nucleophile_index = this.reaction.MoleculeAI.findNucleophileIndex()
            if (nucleophile_index===-1) {
                throw new Error("Unable to determine nucleophile on substrate index")
            }
            nucleophile_atom_on_reagent = CAtom(this.reaction.container_reagent[0][1][nucleophile_index], nucleophile_index, this.reaction.container_reagent)
        }

        if (typeof this.reaction.container_reagent === "string") {
            if (this.reaction.container_reagent[0] === "N") {
                const reagent_container = [MoleculeFactory("NR"),1]
                nucleophile_atom_on_reagent = CAtom(reagent_container[0][1][0], 0, reagent_container)
            }
        }

        // When bonding to substrate the nucleophile atom (Lewis base) on the reagent donates a pair of electrons to the electrophile atom (Lewis acid) on the substrate.
        let freeElectrons = nucleophile_atom_on_reagent.freeElectrons()
        if (freeElectrons.length < 2) {
            throw new Error("Reagent atom must have a pair of electrons it can donate.")
        }

        // Use bondAtoms() or OneTwoAddiction() depending on if the electrophile atom on substrate has a free slot pair
        if (electrophile_atom_on_substrate.freeSlots() !== 0) {
            this.bondAtoms(nucleophile_atom_on_reagent, electrophile_atom_on_substrate, this.reaction.container_substrate, DEBUG, false)
        } else {
            this.oneTwoAddiction(nucleophile_atom_on_reagent, electrophile_atom_on_substrate, this.reaction.container_substrate, DEBUG, false)
        }

        // Add reagent atoms to substrate
        this.reaction.container_substrate[0][1].addAtoms(this.reaction.container_reagent[0][1])

    }

    //  bondSubstrateToReagent(nucleophile_index = null, electrophile_index = null) {
    bondNitrogenOnReagentToCarbonylCarbonOnSubstrate(carbon_on_substrate, nitrogen_on_reagent) {

        Typecheck(
            {name:"carbon_on_substrate", value:carbon_on_substrate, type:"object"},
            {name:"nitrogen_on_reagent", value:nitrogen_on_reagent, type:"object"}
        )

        let carbon_index = null

        // Important:
        // The reagent atom is the nucleophile (Lewis base, (donates a share in an electron pair) and is attacking the substrate (Lewis acid, (accepts a shared in an electron pair)
        // The substrate is the electrophile
        if (nitrogen_on_reagent === undefined || nitrogen_on_reagent === null){
            const nucleophile_index = _.findIndex(this.reaction.container_reagent[0][1], (atom, index) => {
                if (atom[0] !== "N") {
                    return false
                }
                const n = CAtom(this.reaction.container_reagent[0][1][index], index, this.reaction.container_reagent)
                return n.indexedDoubleBonds("").length === 0
            })
            if (nucleophile_index ===-1) {
                throw new Error("Unable to determine nitrogen on reagent index")
            }
            nitrogen_on_reagent = CAtom(this.reaction.container_reagent[0][1][nucleophile_index], nucleophile_index, this.reaction.container_reagent)
        }

        // Check for C=O carbon on substrate
        if (carbon_on_substrate === undefined || carbon_on_substrate === null) {
            carbon_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index) => {
                const c = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)
                return c.indexedDoubleBonds("").filter((bond) => {
                    return bond.atom[0] === "O"
                }).length !== 0
            })
            if (carbon_index===-1) {
                throw new Error("Unable to determine carbon on substrate index")
            }
            carbon_on_substrate = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
        }

        this.bondReagentToSubstrate(nitrogen_on_reagent, carbon_on_substrate)

    }

    breakOxygenCarbonSingleBond(oxygen_index, DEBUG) {

        Typecheck(
            {name:"oxygen_index", value:oxygen_index, type:"number"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        const oxygen_atom = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
        const carbon_bonds = oxygen_atom.carbonBonds()
        carbon_bonds.should.be.an.Array()
        if (carbon_bonds.length === 0) {
            return false
        }

        const carbon_atom = CAtom(this.reaction.container_substrate[0][1][carbon_bonds[0].atom_index], carbon_bonds[0].atom_index, this.reaction.container_substrate)

        //  removeBond(atom1, atom2, molecule_container, DEBUG)
        this.reaction.container_substrate = this.removeBond(oxygen_atom, carbon_atom, this.reaction.container_substrate, DEBUG)

    }


    bondSubstrateToReagentReverse(n_id=null, c_id=null, DEBUG) {

        Typecheck(
            {name:"n_id", value:n_id, type:"string"},
            {name:"c_id", value:c_id, type:"string"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        if (n_id == undefined || n_id === null) {
            throw new Error("Nitrogen id is undefined or null")
        }

        if (c_id == undefined || c_id === null) {
            throw new Error("Nitrogen id is undefined or null")
        }

        // Check each atom is an array
        this.reaction.container_substrate[0][1].map((_atom)=>{
            Typecheck(
                {name:"_atom", value:_atom, type:"array"},
            )
        })

        if (typeof this.reaction.container_reagent !== "string") {
            this.reaction.container_reagent[0][1].map((_atom) => {
                Typecheck(
                    {name: "_atom", value: _atom, type: "array"},
                )
            })
        }


        const n_index = this.reaction.container_substrate[0][1].getAtomIndexById(n_id)
        const n_atom = CAtom(this.reaction.container_substrate[0][1][n_index], n_index, this.reaction.container_substrate)
        const c_index = this.reaction.container_substrate[0][1].getAtomIndexById(c_id)
        const target_atom = CAtom(this.reaction.container_substrate[0][1][c_index], c_index, this.reaction.container_substrate)

        // Use dehydrate() instead
        if (target_atom.symbol === "O" && target_atom.hydrogens().length === 2 && this.reaction.container_substrate[0][1][electrophile_index][4] === "+") {
            if (DEBUG) {
                console.log("BondsAI bondSubstrateToReagentReverse() Use dehydrate()")
            }
            return false
        }


        if (DEBUG) {
            console.log("BondsAI bondSubstrateToReagentReverse() substrate (before splitting)")
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log("BondsAI bondSubstrateToReagentReverse() n_atom (before splitting)" )
            console.log(n_atom.atom)
            console.log("BondsAI bondSubstrateToReagentReverse() carbon atom (before splitting)")
            console.log(target_atom.atom)
        }

        if (!this.isBond(n_atom, target_atom, DEBUG) && !this.isDoubleBond(n_atom, target_atom, DEBUG)) {
            throw new Error("There should be a bond between the nitrogen atom and the carbon atom")
        }


        // @todo triple bonds
        if (this.isBond(n_atom, target_atom, DEBUG)) {
            this.removeBond(n_atom, target_atom, (this.reaction.container_substrate), DEBUG)
            const is_single_bond = this.isBond(n_atom, target_atom, DEBUG)
            is_single_bond.should.be.a.Boolean()
            if (is_single_bond) {
                throw new Error("Failed to break single bond between nitrogen and carbon atoms")
            }
        }

        if (this.isDoubleBond(n_atom, target_atom, DEBUG)) {
            this.removeDoubleBond(n_atom, target_atom, this.reaction.container_substrate, DEBUG)

            if (DEBUG) {
                console.log("BondsAI bondSubstrateToReagentReverse() container after removing double bond:")
                console.log(VMolecule(this.reaction.container_substrate).compressed())
            }

            const is_double_bonded_to = this.isDoubleBond(n_atom, target_atom, DEBUG)
            is_double_bonded_to.should.be.a.Boolean()

            if (DEBUG) {
                console.log("BondsAI bondSubstrateToReagentReverse() checking double double bond has been removed:")
                console.log(is_double_bonded_to)
            }

            if (is_double_bonded_to) {
                throw new Error("Failed to break double bond between nitrogen and carbon atoms")
            }

        }

        // Check that there is no longer a bond between the nitrogen and the carbon
        if (this.isBond(n_atom, target_atom, DEBUG) || this.isDoubleBond(n_atom, target_atom, DEBUG)) {
            throw new Error("There should no longer be a bond between the nitrogen atom and the carbon atom")
        }

        if (DEBUG) {
            console.log("BondsAI bondSubstrateToReagentReverse() substrate after remove NC bond")
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(VMolecule(this.reaction.container_substrate).canonicalSMILES())
            console.log("BondsAI bondSubstrateToReagentReverse() reagent after remove NC bond")
            if (typeof this.reaction.container_reagent === "string") {
                console.log(this.reaction.container_reagent)
            } else {
                console.log(VMolecule(this.reaction.container_reagent).compressed())
                console.log(VMolecule(this.reaction.container_reagent).canonicalSMILES())
            }
        }

        if (undefined === this.reaction.container_substrate[0][1][n_index]) {
            throw new Error("Atom array is undefined.")
        }

        // Required as otherwise extractGroups will use the old substrate values.
        this.reaction.setMoleculeAI() /// this creates a new MoleculeAI object and sets it to use the new substrate value.
        const groups = this.reaction.MoleculeAI.extractGroups(n_atom, target_atom, DEBUG)
        if (DEBUG) {
            console.log("BondsAI bondSubstrateToReagentReverse() groups:")
            console.log(groups)
            console.log(groups.length)
        }
        groups.length.should.be.equal(2, "When reversing substrate to reagent bond the number of groups should be 2.")

        // Check that there are no shared atoms between the two groups
        groups[0].should.be.an.Array()
        groups[1].should.be.an.Array()
        const group_1_ids = groups[0].atomIds()
        const group_2_ids = groups[1].atomIds()
        group_1_ids.should.be.an.Array()
        group_2_ids.should.be.an.Array()
        const shared_atoms = Set().intersection(group_1_ids, group_2_ids)
        if (shared_atoms.length > 0) {
            throw new Error("Shared atoms between groups.")
        }

        if (DEBUG) {
            console.log("BondsAI bondSubstrateToReagentReverse() substrate:")
            console.log(VMolecule(this.reaction.container_substrate).compressed())
        }

        // Not sure why we need to do this
        this.reaction.__setSubstrateGroups(groups)
        this.reaction.setChargesOnSubstrate()

        if(this.reaction.leaving_groups.length > 0) {
            this.reaction.container_reagent = this.reaction.leaving_groups[0]
            this.reaction.container_substrate[0][1].length.should.be.greaterThan(-1)
            this.reaction.container_reagent[0][1].length.should.be.greaterThan(-1)
        } else {

            this.reaction.container_substrate = [[999, groups[0]], 1]
            this.reaction.setMoleculeAI()
            this.reaction.setChargesOnSubstrate()

            if (DEBUG) {
                console.log("BondsAI bondSubstrateToReagentReverse() substrate:")
                console.log(VMolecule(this.reaction.container_substrate).canonicalSMILES())
                console.log("BondsAI bondSubstrateToReagentReverse() reagent:")
                console.log(VMolecule(this.reaction.container_reagent).canonicalSMILES())
                process.error()
            }

            this.reaction.container_substrate.length.should.be.equal(2) // molecule, units
            this.reaction. container_substrate[0].length.should.be.equal(2) // pKa, atoms
            Typecheck(
                {name:"this.reaction.container_substrate[0][0]", value:this.reaction.container_substrate[0][0], type:"number"}, // pKa
                {name:"this.reaction.container_substrate[0][1]", value:this.reaction.container_substrate[0][1], type:"array"},
                {name:"this.reaction.container_substrate[0][1][0]", value:this.reaction.container_substrate[0][1][0], type:"array"},
                {name:"this.reaction.container_substrate[0][1][0][0]", value:this.reaction.container_substrate[0][1][0][0], type:"string"},
            )

        }

        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()
        return this.reaction

    }

    bondNitrogenToCarboxylCarbonReverse() {


        // console.log(VMolecule(this.reaction.container_substrate).formatted())

        // Important (orginal reaction):
        // The reagent is the nucleophile and is attacking the substrate
        // The substrate is the electrophile
        // Look for N-C=[O+] nitrogen
        let nitrogen_index = null
        let nitrogen_atom = null
        let carbon_atom = null
        let carbon_atom_index = null
        let oxygen_index = null
        nitrogen_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index) => {
            return atom[0] === "N" && (atom[4] === "+")
        })


        if (nitrogen_index === -1) {
            return false
        }

        nitrogen_atom = CAtom(this.reaction.container_substrate[0][1][nitrogen_index], nitrogen_index, this.reaction.container_substrate)

        let nitrogen_carbon_bonds = nitrogen_atom.indexedBonds("").filter((bond) => {
            if (bond.atom[0] !== "C") {
                return false
            }
            carbon_atom_index = bond.atom_index
            carbon_atom = CAtom(this.reaction.container_substrate[0][1][carbon_atom_index], carbon_atom_index, this.reaction.container_substrate)
            const o_bonds = carbon_atom.indexedBonds("").filter((obond) => {
                if (obond.atom[0]!=="O") {
                    return false
                }
                oxygen_index = obond.atom_index
                return obond.atom[0] === "O"
            })
            return o_bonds.length > 0
        })

        if (nitrogen_carbon_bonds.length === 0) {
            return false
        }


        //console.log(VMolecule(this.reaction.container_substrate).formatted())
        //console.log(VAtom(nitrogen_atom).render())
        // Break bond between carbon atom and nitrogen atom
        const shared_electrons = Set().intersection(_.cloneDeep(this.reaction.container_substrate[0][1][nitrogen_index].slice(Constants().electron_index)), _.cloneDeep(this.reaction.container_substrate[0][1][carbon_atom_index].slice(Constants().electron_index)))



        // this.reaction.container_substrate[0][1][nitrogen_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][nitrogen_index], shared_electrons)
        this.reaction.container_substrate[0][1][carbon_atom_index] = _.remove(this.reaction.container_substrate[0][1][carbon_atom_index], (v,i)=>{
            return v !== shared_electrons[0] &&  v !== shared_electrons[1]
        })

        this.reaction.setChargeOnSubstrateAtom(nitrogen_index)
        // console.log(VMolecule(this.reaction.container_substrate).compressed())
        nitrogen_atom = CAtom(this.reaction.container_substrate[0][1][nitrogen_index], nitrogen_index, this.reaction.container_substrate)
        // console.log(VAtom(nitrogen_atom).render())

        //console.log(VAtom(nitrogen_atom).render())

        this.reaction.setChargeOnSubstrateAtom(carbon_atom_index)
        this.reaction.setMoleculeAI()

        // console.log(VMolecule(this.reaction.container_substrate).formatted())


        const groups = this.reaction.MoleculeAI.extractGroups()

        this.reaction.__setSubstrateGroups(groups)
        if (this.reaction.leaving_groups.length > 0) {
            console.log("Groups:")
            console.log(this.reaction.leaving_groups[0][0][1].length)
            console.log(this.reaction.container_substrate[0][1].length)
            this.reaction.container_reagent = this.reaction.leaving_groups[0]
            console.log(VMolecule(this.reaction.container_reagent).formatted())
            console.log(aaaaa)
            process.error()


            this.reaction.setMoleculeAI()

            return true
        } else {
            return false
        }

    }


    removeHalide() {

        const halide_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{
            return atom[0] === "Br"
        })
        if (halide_index === -1) {
            return false
        }

        const halide_atom = CAtom(this.reaction.container_substrate[0][1][halide_index], halide_index, this.reaction.container_substrate)


        _.remove(this.reaction.container_substrate[0][1], (v, i)=> {
            return i === halide_index
        })

        const c_bonds  = halide_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        })
        if (c_bonds.length > 0) {
            this.reaction.setChargeOnSubstrateAtom(c_bonds[0].atom_index)
        }

        this.reaction.setMoleculeAI()
        // console.log(VMolecule(this.reaction.container_substrate).compressed())
        // console.log(uuu)
        return true

    }

    removeHalideReverse() {

        this.reaction.setMoleculeAI()
        const halide_atom = AtomFactory("Br", "")
        let n_bonds = null
        //console.log(halide_atom)
        //console.log(ioj)

        let c_index = null

        // Try c attached to [N+]
        c_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{
            if (atom[0] !== "C") {
                return false
            }
            const c_atom = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)
            n_bonds = c_atom.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "N" && bond.atom[4] === "+"
            })

            return n_bonds.length > 0? n_bonds[0].atom_index: false
        })

        if (c_index !== -1) {

            const c_atom = CAtom(this.reaction.container_substrate[0][1][c_index], c_index, this.reaction.container_substrate)
            const h_bonds = c_atom.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "H"
            })
            if (h_bonds.length === 0) {
                return false
            }

            // Remove the nitrogen
            /*
            const l = _.cloneDeep(this.reaction.container_substrate[0][1]).length
            _.remove(this.reaction.container_substrate[0][1], (v, i)=> {
                return i === h_bonds[0].atom_index
            })
            l.should.not.be.equal(this.reaction.container_substrate[0][1].length)
            */

            // Remove Nitrogen and replace with halide
            //console.log(this.reaction.container_substrate[0][1][c_index])
            //console.log(n_bonds)
            _.remove(this.reaction.container_substrate[0][1][c_index], (electron, index)=>{
                return electron == n_bonds[0].shared_electrons[0] || electron == n_bonds[0].shared_electrons[1]
            })
            _.remove(this.reaction.container_substrate[0][1], (atom, index)=>{
                return index === n_bonds[0].atom_index
            })
            if (n_bonds[0].atom_index < c_index) {
                c_index = c_index - 1
            }
            this.reaction.container_substrate[0][1][c_index].addElectron(halide_atom[halide_atom.length-1])
            this.reaction.container_substrate[0][1][c_index].addElectron(halide_atom[halide_atom.length-2])
            this.reaction.container_substrate[0][1].addAtom(halide_atom)

            //console.log("c index: "+c_index)
            this.reaction.setChargesOnSubstrate()
            this.reaction.setMoleculeAI()

            return true
        }

        return false

    }



}

module.exports = BondsAI
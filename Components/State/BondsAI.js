const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')

// makeNitrogenCarbonTripleBond()
// makeOxygenCarbonDoubleBond()
// breakCarbonNitrogenTripleBond()
// breakCarbonNitrogenDoubleBond()
// breakCarbonOxygenDoubleBond()
// breakCarbonDoubleBond()

class BondsAI {

    constructor(reaction) {
        this.reaction = reaction
    }

    makeNitrogenCarbonTripleBond() {

        const nitrogen_index = this.MoleculeAI.findNitrogenOnDoubleBondIndex()

        if (nitrogen_index === -1) {
            return false
        }

        const nitrogen = CAtom(this.container_substrate[0][1][nitrogen_index], nitrogen_index, this.container_substrate)
        const carbon_bonds = nitrogen.indexedDoubleBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        })
        const carbon_index = carbon_bonds[0].atom_index

        const freeElectrons = nitrogen.freeElectrons()
        // Add electrons to carbon
        this.container_substrate[0][1][carbon_index].push(freeElectrons[0])
        this.container_substrate[0][1][carbon_index].push(freeElectrons[1])

        // Charges
        this.container_substrate[0][1][carbon_index][4] = this.container_substrate[0][1][carbon_index][4] === "+" ? "": "-"
        this.container_substrate[0][1][nitrogen_index][4] = this.container_substrate[0][1][nitrogen_index][4] === "-"?"":"+"


        this.setMoleculeAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (makeNitrogenCarbonTripleBond())')
            console.log('Method: makeNitrogenCarbonTripleBond()')
            console.log(VMolecule(this.container_substrate).compressed())
            console.log(i)
        }

    }

    makeOxygenCarbonDoubleBond() {

        // This should NOT remove H from the oxygen
        //     // console.log('makeOxygenCarbonDoubleBond()')
        const oxygen_index = this.MoleculeAI.findOxygenAttachedToCarbonIndexNoDoubleBonds()

        if (oxygen_index === -1) {
            return false
        }

        // Should have positive charge - added
        if (this.container_substrate[0][1][oxygen_index] !== "+") {
            return false
        }
        const oxygen = CAtom(this.container_substrate[0][1][oxygen_index], oxygen_index, this.container_substrate)

        // Added check for negative charge
        const carbon_bonds = oxygen.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C" && bond.atom[4] === "-"
        })

        if (carbon_bonds.length === 0) {
            return false
        }

        const carbon_index = carbon_bonds[0].atom_index

        // Check for C=X bonds and change to single bond (not O)
        const c_atom = CAtom(this.container_substrate[0][1][carbon_index], carbon_index, this.container_substrate)
        const double_bond = c_atom.indexedDoubleBonds("").filter((bond)=>{
            return bond.atom[0] !== 'O'
        }).pop()

        if (double_bond !== undefined) {
            this.__changeDoubleBondToSingleBond(double_bond.atom_index, carbon_index)
        }

        // Proton if applicable
        const proton_oxygen_bond = oxygen.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        }).pop()

        if (proton_oxygen_bond !== undefined) {
            const proton_shared_electrons = proton_oxygen_bond.shared_electrons
            const proton_index = proton_oxygen_bond.atom_index
            // Remove electrons from proton
            _.remove(this.container_substrate[0][1][proton_index], (e) => {
                return e === proton_shared_electrons[0] || e === proton_shared_electrons[1]
            })
            // Add electrons to carbon
            this.container_substrate[0][1][carbon_index].push(proton_shared_electrons[0])
            this.container_substrate[0][1][carbon_index].push(proton_shared_electrons[1])
        } else {
            const freeElectrons = oxygen.freeElectrons()
            // Add electrons to carbon
            this.container_substrate[0][1][carbon_index].push(freeElectrons[0])
            this.container_substrate[0][1][carbon_index].push(freeElectrons[1])
        }

        // Charges
//           // console.log(oxygen_index)
        this.container_substrate[0][1][carbon_index][4] = this.container_substrate[0][1][carbon_index][4] === "+" ? "": "-"
        this.container_substrate[0][1][oxygen_index][4] = this.container_substrate[0][1][oxygen_index][4] === "-"?"":"+"
        //    this.container_substrate[0][1][oxygen_index][4] = this.container_substrate[0][1][oxygen_index][4] === "+"?"":"-"

        if (oxygen.hydrogens().length ===0) {
            this.container_substrate[0][1][oxygen_index][4] = ""
        }

        this.setMoleculeAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (makeOxygenCarbonDoubleBond())')
            console.log('Method: makeOxygenCarbonDoubleBond()')
            console.log(VMolecule(this.container_substrate).compressed())
            console.log(i)
        }

        return true

    }

    breakCarbonNitrogenTripleBond() {

        const nitrogen_index = this.MoleculeAI.findNitrogenOnTripleBondIndex()
        // console.log('breakCarbonNitrogenTripleBond')
        // console.log(nitrogen_index)

        if (nitrogen_index === -1) {
            return false
        }

        const nitrogen_atom = CAtom(this.container_substrate[0][1][nitrogen_index], nitrogen_index, this.container_substrate)
        const triple_bonds = nitrogen_atom.indexedTripleBonds("")

        const shared_electrons = _.cloneDeep(triple_bonds[0].shared_electrons).slice(0,2)

        // Remove bond
        // Remove electrons from C
        _.remove(this.container_substrate[0][1][triple_bonds[0].atom_index], (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        // carbon atom charge
        this.container_substrate[0][1][triple_bonds[0].atom_index][4] =  this.container_substrate[0][1][triple_bonds[0].atom_index][4] === "-"? '': '+'

        // Nitrogen atom charge
        this.container_substrate[0][1][nitrogen_index][4] = this.container_substrate[0][1][nitrogen_index][4] === "+" ? "":"-"


        this.setMoleculeAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (breakCarbonNitrogenTripleBond())')
            console.log('Method: breakCarbonNitrogenTripleBond()')
            console.log(VMolecule(this.container_substrate).compressed())
            console.log(i)
        }

        return true

    }

    breakCarbonNitrogenDoubleBond() {

        const nitrogen_index = this.MoleculeAI.findNitrogenOnDoubleBondIndex()
        // console.log('breakCarbonNitrogenDoubleBond')
        // console.log(nitrogen_index)

        if (nitrogen_index === -1) {
            return false
        }

        const nitrogen_atom = CAtom(this.container_substrate[0][1][nitrogen_index], nitrogen_index, this.container_substrate)
        const double_bonds = nitrogen_atom.indexedDoubleBonds("")

        const shared_electrons = _.cloneDeep(double_bonds[0].shared_electrons).slice(0,2)

        // Remove bond
        // Remove electrons from C
        _.remove(this.container_substrate[0][1][double_bonds[0].atom_index], (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        // carbon atom charge
        this.container_substrate[0][1][double_bonds[0].atom_index][4] =  this.container_substrate[0][1][double_bonds[0].atom_index][4] === "-"? '': '+'

        // Nitrogen atom charge
        this.container_substrate[0][1][nitrogen_index][4] = this.container_substrate[0][1][nitrogen_index][4] === "+" ? "":"-"


        this.setMoleculeAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (breakCarbonNitrogenDoubleBond())')
            console.log('Method: breakCarbonNitrogenDoubleBond()')
            console.log(VMolecule(this.container_substrate).compressed())
            console.log(i)
        }


        return true

    }

    breakCarbonOxygenDoubleBond() {

        const oxygen_index = this.MoleculeAI.findOxygenOnDoubleBondIndex()
        //   // console.log('breakCarbonOxygenDoubleBond')
        //   // console.log(oxygen_index)
        if (oxygen_index === -1) {
            return false
        }
        const oxygen_atom = CAtom(this.container_substrate[0][1][oxygen_index], oxygen_index, this.container_substrate)
        const double_bonds = oxygen_atom.indexedDoubleBonds("")

        const shared_electrons = _.cloneDeep(double_bonds[0].shared_electrons).slice(0,2)

        // Remove double bond
        // Remove electrons from C
        _.remove(this.container_substrate[0][1][double_bonds[0].atom_index], (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        // carbon atom
        this.container_substrate[0][1][double_bonds[0].atom_index][4] =  this.container_substrate[0][1][double_bonds[0].atom_index][4] === "-"? '': '+'
        this.container_substrate[0][1][oxygen_index][4] = this.container_substrate[0][1][oxygen_index][4] === "+" ? "":"-"
        this.setMoleculeAI()

        // Check for proton
        if (undefined !== this.container_reagent && null !== this.container_reagent && this.container_reagent[0][1][0][0] === "H" && this.container_reagent[0][1][0][4]==="+") {
            // Add proton to oxygen
            this.addProtonToAtom(oxygen_index, this.container_reagent[0][1][0])
            this.setMoleculeAI()

        } else {

            // Look for atom attached to carbon atom that is not oxygen and is negatively charged
            // If atom exists create double bond between carbon atom and that atom.
            const carbon_atom_object = CAtom(this.container_substrate[0][1][double_bonds[0].atom_index], double_bonds[0].atom_index, this.container_substrate)
            const carbon_atom_negative_bonds = carbon_atom_object.indexedBonds("").filter((bond) => {
                return bond.atom[0] !== 'H' && bond.atom[0] !== 'O' && bond.atom[4] === '-'
            })

            if (carbon_atom_negative_bonds.length > 0) {
                // Add and readd electrons
                this.container_substrate[0][1][carbon_atom_negative_bonds[0].atom_index].push(shared_electrons[0])
                this.container_substrate[0][1][carbon_atom_negative_bonds[0].atom_index].push(shared_electrons[1])
                this.container_substrate[0][1][double_bonds[0].atom_index].push(shared_electrons[0])
                this.container_substrate[0][1][double_bonds[0].atom_index].push(shared_electrons[1])
                this.container_substrate[0][1][double_bonds[0].atom_index][4] = this.container_substrate[0][1][double_bonds[0].atom_index][4] === "+" ? '' : '-'
                this.container_substrate[0][1][carbon_atom_negative_bonds[0].atom_index][4] = this.container_substrate[0][1][carbon_atom_negative_bonds[0].atom_index][4] === "-" ? '' : '+'
                this.container_substrate[0][1][oxygen_index] = Set().removeFromArray(this.container_substrate[0][1][oxygen_index], shared_electrons)
            }

        }

        this.setMoleculeAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (breakCarbonOxygenDoubleBond())')
            console.log('Method: breakCarbonOxygenDoubleBond()')
            console.log(VMolecule(this.container_substrate).compressed())
            console.log(i)
        }

        return true

    }

    breakCarbonDoubleBond() {

        // @see Organic Chemistry 8th edition p245
        // Get index of double bond carbon bonded to the most hydrogens
        let atom_nucleophile_index = this.MoleculeAI.findLeastSubstitutedCarbonPiBondIndex()

        if (atom_nucleophile_index === -1) {
            return false
        }
        atom_nucleophile_index.should.be.an.Number()
        atom_nucleophile_index.should.be.greaterThan(-1)

        const atoms = _.cloneDeep(this.container_substrate[0][1])

        let free_electrons = []

        // Check for double bond and if there is one break it and get shared electrons from that.
        const double_bonds = CAtom(this.container_substrate[0][1][atom_nucleophile_index], atom_nucleophile_index, this.container_substrate).indexedDoubleBonds("")

        const db_atom = CAtom(this.container_substrate[0][1][double_bonds[0].atom_index], double_bonds[0].atom_index, this.container_substrate)

        const shared_electrons = _.cloneDeep(double_bonds[0].shared_electrons).slice(0,2)

        // Remove double bond
        _.remove(this.container_substrate[0][1][double_bonds[0].atom_index], (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        free_electrons = shared_electrons
        free_electrons.length.should.be.greaterThan(1)

        let electrophile_index = null
        let charge = null

        if (this.container_reagent !== null) {
            electrophile_index = this.ReagentAI.findElectrophileIndex("")
            this.container_reagent[0][1][electrophile_index].push(free_electrons[0])
            this.container_reagent[0][1][electrophile_index].push(free_electrons[1])
            // @todo
            charge = this.container_reagent[0][1][electrophile_index][0] === "Hg"?"&+":"+"
            this.container_reagent[0][1][electrophile_index][4] =
                this.container_reagent[0][1][electrophile_index][4] === "-"
                || this.container_reagent[0][1][electrophile_index][4] < 0? 0: charge
            _.cloneDeep(this.container_reagent[0][1]).map((reagent_atom)=>{
                this.container_substrate[0][1].push(reagent_atom)
            })
        } else {
            electrophile_index = this.MoleculeAI.findElectrophileIndex("")
            this.container_substrate[0][1][electrophile_index].push(free_electrons[0])
            this.container_substrate[0][1][electrophile_index].push(free_electrons[1])
            this.container_substrate[0][1].push(this.container_substrate[0][1][electrophile_index])
            // @todo
            charge = this.container_substrate[0][1][electrophile_index][0] === "Hg"?"&+":"+"
            this.container_substrate[0][1][electrophile_index][4] =
                this.container_substrate[0][1][electrophile_index][4] === "-"
                || this.container_substrate[0][1][electrophile_index][4] < 0? 0: charge
        }

        // Set charge on the former double bonded carbon
        this.container_substrate[0][1][double_bonds[0].atom_index][4] =
            this.container_substrate[0][1][double_bonds[0].atom_index][4] === "-"
            || this.container_substrate[0][1][double_bonds[0].atom_index][4] < 0? 0: charge

        this.container_substrate[0][1].length.should.not.equal(atoms.length)

        this.setMoleculeAI()
        this.setReagentAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (breakCarbonDoubleBond())')
            console.log('Method: breakCarbonDoubleBond()')
            console.log(VMolecule(this.container_substrate).compressed())
            console.log(i)
        }

        return true

    }


}

module.exports = BondsAI
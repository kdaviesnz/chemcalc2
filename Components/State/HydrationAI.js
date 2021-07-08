const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')
const Set = require('../../Models/Set')
const uniqid = require('uniqid');
const SubstitutionAI = require('../../Components/State/SubstitutionAI')
const Typecheck = require('../../Typecheck')
const BondsAI = require('../../Components/State/BondsAI')

// dehydrateReverse(DEBUG, oxygen_atom_index=null)
// dehydrate(check_mode, oxygen_atom_index=null)
class HydrationAI {

    constructor(reaction) {
        this.reaction = reaction
    }

    hydrateReverse(oxygen_atom_index, DEBUG) {

        Typecheck(
            {name:"DEBUG", value:DEBUG, type:"boolean"},
        )

        const bondsAI = new BondsAI(this.reaction)

        oxygen_atom_index = oxygen_atom_index===null || oxygen_atom_index === undefined || oxygen_atom_index === false?this.reaction.MoleculeAI.findWaterOxygenIndex():oxygen_atom_index
        if (oxygen_atom_index === -1) {
            throw new Error("Unable to find oxygen atom index")
        }

        //let oxygen_atom = this.reaction.container_substrate[0][1][oxygen_atom_index]
        this.reaction.container_substrate[0][1][oxygen_atom_index][0].should.be.equal("O")

        const hydrogen_bonds = this.reaction.container_substrate[0][1][oxygen_atom_index].hydrogens(this.reaction.container_substrate[0][1])
        hydrogen_bonds.length.should.be.equal(2)

        // Break the non_hydrogen bond
        this.reaction.container_substrate[0][1][oxygen_atom_index] = bondsAI.breakOxygenCarbonSingleBond(oxygen_atom_index, DEBUG)

        // Remove water atoms
        this.reaction.container_substrate[0][1].removeAtomsByIndex([oxygen_atom_index, hydrogen_bonds[0].atom_index, hydrogen_bonds[1].atom_index])

        // Add water to leaving group
        const water = MoleculeFactory("O")
        this.reaction.leaving_groups.addAtom([water,1])

        return [
            this.reaction.container_substrate,
            "",
            this.reaction.leaving_groups
        ]

    }

    dehydrate(oxygen_atom_index, DEBUG) {

        Typecheck(
            {name:"DEBUG", value:DEBUG, type:"boolean"},
            {name:"oxygen_atom_index", value:oxygen_atom_index, type:"number"}
        )

        const bondsAI = new BondsAI(this.reaction)

        oxygen_atom_index = oxygen_atom_index===null || oxygen_atom_index === undefined?this.reaction.MoleculeAI.findWaterOxygenIndex():oxygen_atom_index
        if (oxygen_atom_index === -1) {
            throw new Error("Unable to find oxygen atom index")
            return false
        }

        const oxygen_atom = CAtom(this.reaction.container_substrate[0][1][oxygen_atom_index], oxygen_atom_index, this.reaction.container_substrate)

        // Get the bond that is NOT hydrogen bond
        const hydrogen_bonds = oxygen_atom.getHydrogenBonds()

        // Break the non_hydrogen bond
        bondsAI.breakOxygenCarbonSingleBond(oxygen_atom_index, DEBUG)

        // Remove water atoms
        this.reaction.container_substrate[0][1].removeAtomsByIndex([oxygen_atom_index, hydrogen_bonds[0].atom_index, hydrogen_bonds[1].atom_index])

        // Add water to leaving group
        this.reaction.leaving_groups.addAtom([MoleculeFactory("O"),1])

    }

    dehydrateReverse(DEBUG) {

        Typecheck(
            {name:"DEBUG", value:DEBUG, type:"boolean"},
        )

        this.reaction.MoleculeAI.validateMolecule()

        const water_molecule = MoleculeFactory("O")

        const water_ai = require("../Stateless/MoleculeAI")([water_molecule, 1])
        const water_oxygen_index = water_ai.findWaterOxygenIndex()
        if (water_oxygen_index === -1) {
            console.log(VMolecule([water_molecule, 1]).compressed())
            console.log(VMolecule([water_molecule, 1]).canonicalSMILES())
            throw new Error("Water oxygen index not found.")
        }
        const water_oxygen_atom = water_molecule[1][water_oxygen_index]

        // electrophiles have a positive chage
        let electrophile_index = this.reaction.MoleculeAI.findCarbocationIndex()

        // Leuckact Wallach reaction
        if (electrophile_index === -1) {
            // Imine
            electrophile_index = this.reaction.MoleculeAI.findImineCarbonIndex()
        }

        if (electrophile_index === -1) {
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(VMolecule(this.reaction.container_substrate).canonicalSMILES())
            throw new Error("Electrophile index not found.")
        }

        const e_atom = this.reaction.container_substrate[0][1][electrophile_index]

        /*
        const e_free_electrons = e_atom.freeElectrons()
        if (e_free_electrons.length === 0) {
            // Check for double bond eg C=N and change to single bond
            // This will free up an electron pair that we can use to bond the O atom
            const d_bonds = e_atom.indexedDoubleBonds("")
            if (d_bonds.length > 0) {
                const shared_electrons = d_bonds[0].shared_electrons
                _.remove(this.reaction.container_substrate[0][1][d_bonds[0].atom_index], (v, i) => {
                    return v === shared_electrons[0] || v === shared_electrons[1]
                })
                // Replace electrons
                this.reaction.container_substrate[0][1][d_bonds[0].atom_index].addElectron(uniqid())
                this.reaction.container_substrate[0][1][d_bonds[0].atom_index].addElectron(uniqid())
                this.reaction.setChargeOnSubstrateAtom(d_bonds[0].atom_index)
                e_free_electrons.addElectron(d_bonds[0].shared_electrons[0])
                e_free_electrons.addElectron(d_bonds[0].shared_electrons[1])
            }
        }
         */
        // Check for double bond eg C=N and change to single bond
        const double_bonds = e_atom.indexedDoubleBonds(this.reaction.container_substrate[0][1])
        if (double_bonds.length > 0) {
            e_atom.removeSingleBond(double_bonds[0].atom)
        }

        // We do this so that the atom does not end up with more then 8 electrons
        //this.reaction.container_substrate[0][1][electrophile_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][electrophile_index], e_free_electrons)

        // Create the C(O) bond
        // electrons are the free electrons on the oxygen water atom
        //this.reaction.container_substrate[0][1][electrophile_index].addElectron(electrons[0])
        //this.reaction.container_substrate[0][1][electrophile_index].addElectron(electrons[1])
        const water_hydrogens = water_oxygen_atom.hydrogens(water_molecule[1])
        water_hydrogens.length.should.be.equal(2)
        e_atom.bondAtomToAtom(water_oxygen_atom, this.reaction.container_substrate[0][1])

        this.reaction.container_substrate[0][1].addAtom(water_molecule[1][0])
        this.reaction.container_substrate[0][1].addAtom(water_molecule[1][1])
        this.reaction.container_substrate[0][1].addAtom(water_molecule[1][2])

        this.reaction.setChargesOnSubstrate()

        this.reaction.setMoleculeAI()

        // Check we have a water molecule attached to main molecule
        this.reaction.MoleculeAI.findWaterOxygenIndex().should.be.greaterThan(-1)

        this.reaction.MoleculeAI.validateMolecule()

        //console.log(VMolecule(this.reaction.container_substrate).compressed())
        //console.log(VMolecule(this.reaction.container_substrate).canonicalSMILES())
        //console.log(electrophile_index)
        //process.error()
        return [
            this.reaction.container_substrate,
            this.reaction.container_reagent
        ]

    }

    hydrate(DEBUG) {

        Typecheck(
            {name:"DEBUG", value:DEBUG, type:"boolean"},
        )

        return this.dehydrateReverse(DEBUG)
    }

    hydrate_old(electrophile_index) {
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

        this.reaction.container_substrate[0][1][electrophile_index].addElectron(electrons[0])
        this.reaction.container_substrate[0][1][electrophile_index].addElectron(electrons[1])
        this.reaction.container_substrate[0][1][electrophile_index][4] = 0

        this.reaction.container_substrate[0][1].addAtom(water_molecule[1][0])
        this.reaction.container_substrate[0][1].addAtom(water_molecule[1][1])
        this.reaction.container_substrate[0][1].addAtom(water_molecule[1][2])

        this.reaction.setMoleculeAI()

        // Check we have a water molecule attached to main molecule
        this.reaction.MoleculeAI.findWaterOxygenIndex().should.be.greaterThan(-1)

        this.reaction.MoleculeAI.validateMolecule()


        return true
    }

}

module.exports = HydrationAI
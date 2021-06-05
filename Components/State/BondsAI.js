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

// removeProton(molecule, atom_index, electrons, proton)
// removeAtom(molecule, atom) {
// removeBond(atom1, atom2, molecule_container)
// makeNitrogenCarbonTripleBond()
// makeNitrogenCarbonDoubleBond(n_index=null, carbon_index=null, DEBUG)
// makeOxygenCarbonDoubleBond(DEBUG)
// breakCarbonNitrogenTripleBond()
// breakCarbonNitrogenDoubleBond()
// breakCarbonOxygenDoubleBond()
// breakCarbonDoubleBond()
// bondSubstrateToReagent()
// removeHalide()
// makeCarbonNitrogenDoubleBondReverse(nitrogen_index, carbon_index, DEBUG)
// makeOxygenCarbonDoubleBondReverse()
// breakCarbonOxygenDoubleBondReverse()
// bondSubstrateToReagentReverse()
// removeHalideReverse()
// makeCarbonCarbonDoubleBondByAtomIndex(c2_negative_carbon_index, c1_positive_carbon_index, DEBUG)
// makeDoubleBond(negativeAtom, positiveAtom, DEBUG)
// breakOxygenCarbonSingleBond
// isBond(atom1_controller, atom2_controller)
// breakCarbonNitrogenDoubleBondReverse(nitrogen_index, carbon_index, DEBUG)
// bondAtoms(atom1, atom2)
// bondAtomsReverse(atom1, atom2)
// removeCoordinateCovalentBond(atom1, atom2)
// bondAtomsReverse(atom1, atom2)
class BondsAI {

    constructor(reaction) {
        Typecheck(
            {name:"reaction", value:reaction, type:"object"},
        )
        this.reaction = reaction
    }

    creatingCoordinateCovalentBond(atom) {

        Typecheck(
            {name:"atom", value:atom, type:"object"},
        )

        // A coordinate covalent bond is formed if the atom already has a full octet (max number of bonds when neutral)
        // and can donate a lone pair
        return atom.neutralAtomMaxNumberOfBonds() === atom.numberOfBonds() && atom.lonePairs().length > 0

    }

    removeCoordinateCovalentBond(atom1, atom2) {

        Typecheck(
            {name:"atom1", value:atom1, type:"object"},
            {name:"atom2", value:atom2, type:"object"}
        )

        const shared_electrons = atom1.electronsSharedWithSibling(atom2)

        if(atom1.isCoordinateCovalentBondDonator(atom2)) {
            atom2.removeElectrons(shared_electrons)
        } else if(atom2.isCoordinateCovalentBondDonator(atom1)) {
            atom1.removeElectrons(shared_electrons)
        }
    }

    removeBond(atom1, atom2, molecule_container) {

        Typecheck(
            {name:"molecule_container", value:molecule_container, type:"array"},
            {name:"atom1", value:atom1, type:"object"},
            {name:"atom2", value:atom2, type:"object"},
        )

        // No bond between the two atoms
        if (!is_bond(atom1, atom2)) {
            return false
        }

        // Check for coordinate bond
        if (atom1.isCoordinateCovalentBond(atom2) || atom2.isCoordinateCovalentBond(atom1)) {
            this.removeCoordinateCovalentBond(atom1, atom2)
        } else {
            // Standard covalent bond
            atom1.removeCovalentBond(atom2)
        }
        molecule_container[0][1][atom1.atomIndex] = atom1
        molecule_container[0][1][atom2.atomIndex] = atom2

        return molecule_container
    }

    bondAtomsReverse(atom1, atom2, molecule_container) {
        return this.removeBond(atom1, atom2, molecule_container)
    }

    bondAtoms(atom1, atom2, molecule_container) {

        Typecheck(
            {name:"atom1", value:atom1, type:"object"},
            {name:"atom2", value:atom2, type:"object"},
            {name:"molecule_container", value:molecule_container, type:"array"},
        )

        const atom1FreeElectrons = atom1.freeElectrons()
        const atom2FreeElectrons = atom2.freeElectrons()

        // Check if we are making a coordinate or standard covalent bond
        // In a coordinate covalent bond one of the atoms donates both electrons.
        // In a standard covalent bond each atom donates an electron.
        // A coordinate covalent bond is formed if the atom already has a full octet
        // and can donate a lone pair
        if (this.creatingCoordinateCovalentBond(atom1)) {
            // Check that the atom receiving the electrons has a free slot
            if (atom2.freeSlots() > 0) {
                molecule[atom2.atomIndex].push(atom1FreeElectrons[0])
                molecule[atom2.atomIndex].push(atom1FreeElectrons[1])
            }
        } else if (this.creatingCoordinateCovalentBond(atom2)) {
            // Check that the atom receiving the electrons has a free slot
            if (atom1.freeSlots() > 0) {
                molecule_container[0][1][atom1.atomIndex].push(atom2FreeElectrons[0])
                molecule_container[0][1][atom1.atomIndex].push(atom2FreeElectrons[1])
            }
        } else {
            // Standard covalent bond
            const atom1FreeElectron = atom1FreeElectrons[0]
            const atom2FreeElectron = atom2FreeElectrons[1]
            molecule_container[0][1][atom1.atomIndex].push(atom2FreeElectron)
            molecule_container[0][1][atom2.atomIndex].push(atom1FreeElectron)
        }

        atom1 = CAtom(molecule_container[0][1][atom1.atomIndex], atom1.atomIndex, molecule_container)
        atom2 = CAtom(molecule_container[0][1][atom2.atomIndex], atom2.atomIndex, molecule_container)

    }

    isBond(atom1_controller, atom2_controller) {
        return atom1_controller.isBondedTo(atom2_controller.atom)
    }

    addHydrogen(molecule_container, atom_index) {
        const hydrogen_arr = AtomFactory("H", "")
        const atom = CAtom(molecule_container[0][1][atom_index], atom_index, molecule_container)
        const hydrogen_electron_to_share = hydrogen_arr[hydrogen_arr.length-1]
        const atom_free_electrons = atom.freeElectrons()
        molecule_container[0][1][atom_index].push(hydrogen_electron_to_share)
        hydrogen_arr.push(atom_free_electrons[0])
        molecule_container[0][1].push(hydrogen_arr)
        return molecule_container
    }

    addProton(molecule_container, atom_index) {
        const proton = AtomFactory("H", "")
        const atom = CAtom(molecule_container[0][1][atom_index], atom_index, molecule_container)
        const free_electrons = atom.freeElectrons()
        if (free_electrons.length ===0) {
            molecule_container[0][1][atom_index].push(proton[proton.length-1])
            /*
            free_electrons.push(uniqid())
            free_electrons.push(uniqid())
            molecule_container[0][1][atom_index].push(free_electrons[0])
            molecule_container[0][1][atom_index].push(free_electrons[1])
                         */
        }
        molecule_container[0][1].push(proton)

        return molecule_container
    }

    removeProton(molecule, atom_index, electrons=null, proton=null, DEBUG=false) {

        if (DEBUG) {
            console.log("BondsAI removeProton() - molecule")
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log("BondsAI removeProton() - nitrogen index")
            console.log(atom_index)
        }
        const nitrogen_atom = CAtom(this.reaction.container_substrate[0][1][atom_index], atom_index, this.reaction.container_substrate)
        if (electrons === null && proton === null) {
            const hydrogen_nitrogen_bonds = nitrogen_atom.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "H"
            })
            if (hydrogen_nitrogen_bonds.length ===0) {
                return false
            }
            electrons = _.cloneDeep(hydrogen_nitrogen_bonds[0].shared_electrons).slice(0,2)
            proton = this.reaction.container_substrate[0][1][hydrogen_nitrogen_bonds[0].atom_index]
        }
        molecule = this.removeBond(molecule, atom_index, electrons)
        molecule[0][1][atom_index].push(uniqid())
        molecule[0][1][atom_index].push(uniqid())
        molecule = this.removeAtom(molecule, proton)
        return molecule
    }



    removeAtom(molecule, atom) {
        //this.container_substrate[0][1] = Set().removeFromArray(this.container_substrate[0][1], this.container_substrate[0][1][h_c_hydrogen_bonds[0].atom_index])
        molecule[0][1] = Set().removeFromArray(molecule[0][1], atom)
        return molecule
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
        this.reaction.container_substrate[0][1][carbon_index].push(freeElectrons[0])
        this.reaction.container_substrate[0][1][carbon_index].push(freeElectrons[1])

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
            this.reaction.container_substrate[0][1][carbon_index].push(proton_shared_electrons[0])
            this.reaction.container_substrate[0][1][carbon_index].push(proton_shared_electrons[1])
        } else {
            const freeElectrons = n.freeElectrons()
            // Add electrons to carbon
            this.reaction.container_substrate[0][1][carbon_index].push(freeElectrons[0])
            this.reaction.container_substrate[0][1][carbon_index].push(freeElectrons[1])
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

        this.makeDoubleBond(negativeC2CarbonAtom, positiveC1CarbonAtom, DEBUG)

    }

    makeDoubleBond(negativeAtom, positiveAtom, DEBUG) {

        Typecheck(
            {name:"negativeAtom", value:negativeAtom, type:"object"},
            {name:"positiveAtom", value:positiveAtom, type:"object"},
            {name:"DEBUG", value:DEBUG, type:"boolean"}
        )

        // If there was not already a bond between the atoms
        if (this.isBond(negativeAtom, positiveAtom)=== false) {
            this.bondAtoms(negativeAtom, positiveAtom, this.reaction.container_substrate)
            this.bondAtoms(negativeAtom, positiveAtom, this.reaction.container_substrate)
        } else {
            this.bondAtoms(negativeAtom, positiveAtom, this.reaction.container_substrate)
        }
        this.reaction.setMoleculeAI()
        this.reaction.setChargesOnSubstrate(DEBUG)

        if (DEBUG) {
            console.log("Substrate after adding double bond")
            console.log(VMolecule([this.reaction.container_substrate[0],1]).compressed())
        }

        return true
    }


    makeOxygenCarbonDoubleBond(DEBUG) {

        Typecheck(
            {name:"DEBUG", value:DEBUG, type:"boolean"},
        )

        // This should NOT remove H from the oxygen
        let oxygen_index = this.reaction.MoleculeAI.findOxygenAttachedToCarbonIndexNoDoubleBonds()
        let carbon_index = null
        if (DEBUG) {
            console.log("BondsAI makeOxygenCarbonDoubleBond -> oxygen index = " + oxygen_index)
        }

        if (oxygen_index === -1) {
            // Look for oxygen with no bonds
            oxygen_index = this.reaction.MoleculeAI.findOxygenWithNoBondsIndex()
            if(oxygen_index === -1) {
                console.log("BondsAI makeOxygenCarbonDoubleBond -> oxygen atom not found")
                return false
            } else {
                // Create single bond between carbon and oxygen that we will turn into a double bond
                carbon_index =  this.reaction.MoleculeAI.findCarbonWithNoBondsIndex()
                if (carbon_index === -1) {
                    console.log("makeOxygenCarbonDoubleBond() -> carbon index not found")
                }
                const o = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
                const c = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
                this.makeDoubleBond(o,c)
                return true
            }
        }

        const oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)

        // Added check for positive charge
        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        const carbon_bonds = oxygen.carbonBonds()

        if (carbon_bonds.length === 0) {
            if(DEBUG) {
                console.log("makeOxygenCarbonDoubleBond -> no O-C carbon bonds found")
            }
            return false
        }

        carbon_index = carbon_bonds[0].atom_index

        if (DEBUG) {
            console.log("makeOxygenCarbonDoubleBond -> carbon index = " + carbon_index)
        }

        const carbon = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)

        this.makeDoubleBond(oxygen, carbon )

        this.reaction.setMoleculeAI()

        if (DEBUG) {
            console.log("makeOxygenCarbonDoubleBond -> after adding double bond:")
            console.log(VMolecule(this.reaction.container_substrate).compressed())
        }

        return true

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


/*
            if (carbon_atom_negative_bonds.length > 0) {
                // Add and readd electrons
                this.reaction.container_substrate[0][1][carbon_atom_negative_bonds[0].atom_index].push(shared_electrons[0])
                this.reaction.container_substrate[0][1][carbon_atom_negative_bonds[0].atom_index].push(shared_electrons[1])
                this.reaction.container_substrate[0][1][double_bonds[0].atom_index].push(shared_electrons[0])
                this.reaction.container_substrate[0][1][double_bonds[0].atom_index].push(shared_electrons[1])

                this.reaction.setMoleculeAI()

                // this.reaction.container_substrate[0][1][double_bonds[0].atom_index][4] = this.reaction.container_substrate[0][1][double_bonds[0].atom_index][4] === "+" ? '' : '-'
                this.reaction.setChargeOnSubstrateAtom(double_bonds[0].atom_index)

                // this.reaction.container_substrate[0][1][carbon_atom_negative_bonds[0].atom_index][4] = this.reaction.container_substrate[0][1][carbon_atom_negative_bonds[0].atom_index][4] === "-" ? '' : '+'
                this.reaction.setChargeOnSubstrateAtom(carbon_atom_negative_bonds[0].atom_index)

                //  this.reaction.container_substrate[0][1][oxygen_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][oxygen_index], shared_electrons)
                this.reaction.setChargeOnSubstrateAtom(oxygen_index)
            }
*/

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
        /*
        const proton = AtomFactory("H")
        proton.pop()
        proton.push(shared_electrons[0])
        proton.push(shared_electrons[1])
        this.reaction.container_substrate[0][1].push(proton)
        */
        // Charges
        //this.reaction.container_substrate[0][1][oxygen_index][4] = ""
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

    breakCarbonNitrogenDoubleBondReverse(nitrogen_index, carbon_index, DEBUG) {

        // Make C=O bond
        if (nitrogen_index === undefined) {
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

        const nitrogen = CAtom(this.reaction.container_substrate[0][1][nitrogen_index], nitrogen_index, this.reaction.container_substrate)

        if (carbon_index === undefined) {
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

        const freeElectrons = nitrogen.freeElectrons()

        const carbon_atom = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
        const carbon_atom_free_electrons = carbon_atom.freeElectrons()

        // Make space for electrons
        const carbon_electrons_before = this.reaction.container_substrate[0][1][carbon_index].length
        _.remove(this.reaction.container_substrate[0][1][carbon_index], (e, i)=>{
            return e === carbon_atom_free_electrons[0] || e === carbon_atom_free_electrons[1]
        })
        carbon_electrons_before.should.be.lessThan(this.reaction.container_substrate[0][1][carbon_index].length + 2)

        // Add electrons from nitrogen to carbon
        this.reaction.container_substrate[0][1][carbon_index].push(freeElectrons[0])
        this.reaction.container_substrate[0][1][carbon_index].push(freeElectrons[1])

        // Remove a hydrogen from the carbon atom
        const h = carbon_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        })
        if (h.length > 0) {
            // Remove hydrogen atom
            _.remove(this.reaction.container_substrate[0][1], (v, i) => {
                    return i === h[0].atom_index
                }
            )
        }

        return true


    }

    breakCarbonOxygenDoubleBondReverse() {

        this.reaction.setMoleculeAI()

        // Make C=O bond
        const oxygen_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=> {
            if ( atom[0] !== "O") {
                return false
            }
            const o = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)
            const c_bonds = o.indexedBonds("").filter((bond)=>{
                // Pinacol Rearrangement - add && bond.atom[4] === "+
                // otherwise get into C=O CO C=O loop
                // However Leukart requires neutral carbon
                return bond.atom[0] === "C"
            })
            return c_bonds.length > 0

        })


        if (oxygen_index === -1) {
            return false
        }

        const oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)

        const carbon_bonds = oxygen.indexedBonds("").filter((bond)=>{
            //return bond.atom[0] === "C" && bond.atom[4] !== "" && bond.atom[4] !== 0
            if (bond.atom[0] !== "C") {
                return false
            }
            const c = CAtom(this.reaction.container_substrate[0][1][bond.atom_index], bond.atom_index, this.reaction.container_substrate)
            if (c.doubleBondCount() > 0 ) {
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

        const carbon_index = carbon_bonds[0].atom_index

        const freeElectrons = oxygen.freeElectrons()

        const carbon_atom = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
        const carbon_atom_free_electrons = carbon_atom.freeElectrons()


       // console.log(VMolecule(this.reaction.container_substrate).compressed())
        //console.log(jjkjj)

        // Make space for electrons
        const carbon_electrons_before = this.reaction.container_substrate[0][1][carbon_index].length
        _.remove(this.reaction.container_substrate[0][1][carbon_index], (e, i)=>{
            return e === carbon_atom_free_electrons[0] || e === carbon_atom_free_electrons[1]
        })
        carbon_electrons_before.should.be.lessThan(this.reaction.container_substrate[0][1][carbon_index].length + 2)

        // Add electrons from oxygen to carbon
        this.reaction.container_substrate[0][1][carbon_index].push(freeElectrons[0])
        this.reaction.container_substrate[0][1][carbon_index].push(freeElectrons[1])

        // Remove a hydrogen from the oxygen atom
        const h = oxygen.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        })
        if (h.length > 0) {
            // this.reaction.container_substrate[0][1][oxygen_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][oxygen_index], this.reaction.container_substrate[0][1][h[0].atom_index])
            // Remove hydrogen atom
            _.remove(this.reaction.container_substrate[0][1], (v, i) => {
                    return i === h[0].atom_index
                }
            )
        }

        // Charges
        this.reaction.setChargesOnSubstrate()

        this.reaction.setMoleculeAI()

        this.reaction.MoleculeAI.validateMolecule()

        return true


    }

    bondSubstrateToReagent(nucleophile_index = null, electrophile_index = null) {

        Typecheck(
            {name:"electrophile_index", value:electrophile_index, type:"number"},
            {name:"nucleophile_index", value:nucleophile_index, type:"number"}
        )

        // Important:
        // The reagent is the nucleophile and is attacking the substrate
        // The substrate is the electrophile
        //  console.log('BondsAI.js bondSubstrateToReagent')
        // Check for Nitrogen atom  on reagent and C=O bond on substrate
        if (typeof this.reaction.container_reagent !=="string") {
            if (nucleophile_index === null) {
                nucleophile_index = _.findIndex(this.reaction.container_reagent[0][1], (atom, index) => {
                    if (atom[0] !== "N") {
                        return false
                    }
                    const n = CAtom(this.reaction.container_reagent[0][1][index], index, this.reaction.container_reagent)
                    return n.indexedDoubleBonds("").length === 0
                })
            }
        }

        if (nucleophile_index !== -1) { // Nitrogen atom on reagent

            // Check for C=O carbon on substrate
            if (electrophile_index === null) {
                electrophile_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index) => {
                    if (atom[0] !== "C") {
                        return false
                    }
                    if (atom[4] === "+") {
                        return false
                    }
                    const c = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)
                    return c.indexedDoubleBonds("").filter((bond) => {
                        return bond.atom[0] === "O"
                    }).length !== 0
                })
            }

            if (electrophile_index === -1) {
                // Check for CX carbon on substrate
                electrophile_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{
                    if (atom[0]!=="C") {
                        return false
                    }
                    if (atom[4]==="+") {
                        return false
                    }
                    const c = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)
                    return c.indexedBonds("").filter((bond)=>{
                        return bond.atom[0] === "Br" && bond.bond_type === ""
                    }).length !== 0
                })
            }
        }

        if (electrophile_index === -1 || electrophile_index === null) {
            electrophile_index = this.reaction.MoleculeAI.findElectrophileIndex()
        }

        // console.log("BondsAI el index:"+electrophile_index)
        // console.log(kkkk)

        if (electrophile_index === -1) {
            return false
        }

        if (nucleophile_index === -1 && nucleophile_index !==null) {
            nucleophile_index = this.reaction.ReagentAI.findNucleophileIndex()
        }

        if (nucleophile_index === -1) {
            return false
        }

        const nucleophile = typeof this.reaction.container_reagent === "string"?this.reaction.container_reagent:CAtom(this.reaction.container_reagent[0][1][nucleophile_index], nucleophile_index, this.reaction.container_reagent)

        if (typeof this.reaction.container_reagent === "string") {
            // Amine?
            if (this.reaction.container_reagent[0] === "N") {
                const nitrogen = AtomFactory("N", 0)
                const r = AtomFactory("N", 0)
                nitrogen.push("R")
                console.log(nitrogen)

                process.error()
            }
        } else {

            let freeElectrons = nucleophile.freeElectrons()

            if (freeElectrons.length === 0) {
                const freeSlots = nucleophile.freeSlots()
                if (freeSlots > 0) {
                    // Workaround
                    const uniqid = require('uniqid');
                    freeElectrons.push(uniqid())
                    freeElectrons.push(uniqid())
                    this.reaction.container_reagent[0][1][nucleophile_index].push(freeElectrons[0])
                    this.reaction.container_reagent[0][1][nucleophile_index].push(freeElectrons[1])
                }
            }
            this.reaction.container_substrate[0][1][electrophile_index].push(freeElectrons[0])
            this.reaction.container_substrate[0][1][electrophile_index].push(freeElectrons[1])

            // Add reagent atoms to substrate
            this.reaction.container_reagent[0][1].map(
                (atom) => {
                    this.reaction.container_substrate[0][1].push(atom)
                    return atom
                }
            )

            this.reaction.setChargeOnSubstrateAtom(electrophile_index)
            this.reaction.container_reagent[0][1][nucleophile_index][4] = this.reaction.container_reagent[0][1][nucleophile_index][4] === "-" ? "" : "+"


            this.reaction.setMoleculeAI()
            this.reaction.setReagentAI()

        }

        return true

    }

    breakOxygenCarbonSingleBond(oxygen_index) {
        const oxygen_atom = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)
        const bonds = oxygen_atom.indexedBonds("").filter((b)=>{
            return b.atom[0] !== "H"
        })
        if (bonds.length === 0) {
            return false
        }
        // Break each single bond
        const carbon_index = carbon_bonds[0].atom_index
        const electrons = _.cloneDeep(carbon_bonds[0].shared_electrons).slice(0,2)
        console.log(electrons)

        this.reaction.container_substrate = this.removeBond(this.reaction.container_substrate, oxygen_index, electrons)
        console.log(VMolecule(this.reaction.container_substrate).compressed())
        process.error()

    }


    bondSubstrateToReagentReverse(n_index=null, c_index=null) {

        Typecheck(
            {name:"n_index", value:n_index, type:"number"},
            {name:"c_index", value:c_index, type:"number"}
        )

        // Important (orginal reaction):
        // The reagent is the nucleophile and is attacking the substrate
        // The substrate is the electrophile
        // Look for N+=C+ bond
        let n_atom = null
        let c_atom = null
        if (n_index === null) {
            n_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index) => {
                return atom[0] === "N" && atom[4] === "+"
            })
        }

        if (n_index !== -1) {

            n_atom = CAtom(this.reaction.container_substrate[0][1][n_index], n_index, this.reaction.container_substrate)

            if (c_index === null) {
                let c_bonds = n_atom.getPositiveCarbonBonds()

                if (c_bonds.length === 0) {
                    c_bonds = n_atom.indexedBonds("").filter((bond) => {
                        if (bond.atom[0] !== "C") {
                            return false
                        }
                        c_atom = CAtom(this.reaction.container_substrate[0][1][bond.atom_index], bond.atom_index, this.reaction.container_substrate)
                        const x_bonds = c_atom.indexedBonds("").filter((bond) => {
                            return bond.atom[0] === "R"
                        })
                        return x_bonds.length > 0
                    })
                }
                if (c_bonds.length > 0) {
                     c_index = c_bonds[0].atom_index
                }
            }

            if (c_index !== null) {
                const target_atom = CAtom(this.reaction.container_substrate[0][1][c_index], c_index, this.reaction.container_substrate)
                // Use dehydrate() instead
                if (target_atom.symbol === "O" && target_atom.hydrogens().length ===2 && this.reaction.container_substrate[0][1][electrophile_index][4] === "+") {
                    return false
                }
                const shared_electrons = n_atom.electronsSharedWithSibling(target_atom)
                this.reaction.container_substrate[0][1][n_index] = n_atom.removeElectrons(shared_electrons)
                this.reaction.setChargeOnSubstrateAtom(n_index)
                this.reaction.setChargeOnSubstrateAtom(c_index)
                this.reaction.setMoleculeAI()
                const groups = this.reaction.MoleculeAI.extractGroups()
                this.reaction.__setSubstrateGroups(groups)
                if(this.reaction.leaving_groups.length > 0) {
                    this.reaction.container_reagent = this.reaction.leaving_groups[0]
                    return true
                }
            }
        }

        return false
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
        const shared_electrons = Set().intersection(_.cloneDeep(this.reaction.container_substrate[0][1][nitrogen_index].slice(5)), _.cloneDeep(this.reaction.container_substrate[0][1][carbon_atom_index].slice(5)))



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
            process.exit()

            // console.log("Substrate")
           // console.log(VMolecule(this.reaction.container_substrate).formatted())
           // console.log("Reagent")
           // console.log(VMolecule(this.reaction.container_reagent).formatted())
           // console.log(jjjkkppp)
            /*
            const carbon_free_electrons = carbon_atom.freeElectrons()
            // Add electrons to oxygen
            this.reaction.container_substrate[0][1][oxygen_index].push(carbon_free_electrons[0])
            this.reaction.container_substrate[0][1][oxygen_index].push(carbon_free_electrons[1])
             */

           // this.reaction.setChargeOnSubstrateAtom(nitrogen_index)
          //  this.reaction.setChargeOnSubstrateAtom(carbon_atom_index)
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
            this.reaction.container_substrate[0][1][c_index].push(halide_atom[halide_atom.length-1])
            this.reaction.container_substrate[0][1][c_index].push(halide_atom[halide_atom.length-2])
            this.reaction.container_substrate[0][1].push(halide_atom)

            //console.log("c index: "+c_index)
            this.reaction.setChargesOnSubstrate()
            this.reaction.setMoleculeAI()

            return true
        }

        return false

    }



}

module.exports = BondsAI
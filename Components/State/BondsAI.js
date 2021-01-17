const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')
const AtomFactory = require('../../Models/AtomFactory')
const Set = require('../../Models/Set')

// makeNitrogenCarbonTripleBond()
// makeNitrogenCarbonDoubleBond()
// makeOxygenCarbonDoubleBond()
// breakCarbonNitrogenTripleBond()
// breakCarbonNitrogenDoubleBond()
// breakCarbonOxygenDoubleBond()
// breakCarbonDoubleBond()
// bondSubstrateToReagent()
// removeHalide()
// makeCarbonNitrogenDoubleBondReverse()
// makeOxygenCarbonDoubleBondReverse()
// breakCarbonOxygenDoubleBondReverse()
// bondSubstrateToReagentReverse()
// removeHalideReverse()

class BondsAI {

    constructor(reaction) {
        this.reaction = reaction
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

    makeNitrogenCarbonDoubleBond() {

        const n_index = this.reaction.MoleculeAI.findNitrogenAttachedToCarbonIndexNoDoubleBonds()
        if (n_index === -1) {
            return false
        }

        const n = CAtom(this.reaction.container_substrate[0][1][n_index], n_index, this.reaction.container_substrate)

        const carbon_bonds = n.indexedBonds("").filter((bond)=>{
            if (bond.atom[0] !== "C") {
                return false
            }
            const c = CAtom(this.reaction.container_substrate[0][1][bond.atom_index], bond.atom_index, this.reaction.container_substrate)
            return c.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "O"
            }).length > 0
        })



        if (carbon_bonds.length === 0) {
            return false
        }


        const carbon_index = carbon_bonds[0].atom_index


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

    makeOxygenCarbonDoubleBond() {

        // This should NOT remove H from the oxygen
        //console.log('makeOxygenCarbonDoubleBond()')
        const oxygen_index = this.reaction.MoleculeAI.findOxygenAttachedToCarbonIndexNoDoubleBonds()

        if (oxygen_index === -1) {
            return false
        }


        // Should have positive charge - added
        if (this.reaction.container_substrate[0][1][oxygen_index] !== "+") {
//            return false
        }


        const oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)

        // Added check for positive charge
        // https://en.wikipedia.org/wiki/Pinacol_rearrangement
        const carbon_bonds = oxygen.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C" && bond.atom[4] === "+"
        })


        if (carbon_bonds.length === 0) {
            return false
        }

        const carbon_index = carbon_bonds[0].atom_index

        // Check for C=X bonds and change to single bond (not O)
        const c_atom = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)
        const double_bond = c_atom.indexedDoubleBonds("").filter((bond)=>{
            return bond.atom[0] !== 'O'
        }).pop()

        if (double_bond !== undefined) {
            this.reaction.__changeDoubleBondToSingleBond(double_bond.atom_index, carbon_index)
        }

        // Proton if applicable
        const proton_oxygen_bond = oxygen.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        }).pop()

        if (proton_oxygen_bond !== undefined) {
            const proton_shared_electrons = proton_oxygen_bond.shared_electrons
            const proton_index = proton_oxygen_bond.atom_index
            // Remove electrons from proton
            _.remove(this.reaction.container_substrate[0][1][proton_index], (e) => {
                return e === proton_shared_electrons[0] || e === proton_shared_electrons[1]
            })
            // Add electrons to carbon
            this.reaction.container_substrate[0][1][carbon_index].push(proton_shared_electrons[0])
            this.reaction.container_substrate[0][1][carbon_index].push(proton_shared_electrons[1])
        } else {
            const freeElectrons = oxygen.freeElectrons()
            // Add electrons to carbon
            this.reaction.container_substrate[0][1][carbon_index].push(freeElectrons[0])
            this.reaction.container_substrate[0][1][carbon_index].push(freeElectrons[1])
        }

        // Charges
//           // console.log(oxygen_index)
        this.reaction.container_substrate[0][1][carbon_index][4] = this.reaction.container_substrate[0][1][carbon_index][4] === "+" ? "": "-"
        this.reaction.container_substrate[0][1][oxygen_index][4] = this.reaction.container_substrate[0][1][oxygen_index][4] === "-"?"":"+"
        //    this.reaction.container_substrate[0][1][oxygen_index][4] = this.reaction.container_substrate[0][1][oxygen_index][4] === "+"?"":"-"

        if (oxygen.hydrogens().length ===0) {
            this.reaction.container_substrate[0][1][oxygen_index][4] = ""
        }

        this.reaction.setMoleculeAI()

       // console.log("BondsAI makeOxygenCarbonDoubleBond() oxygen_index:" + oxygen_index)
       // console.log(carbon_bonds.length)
        // console.log(qju)



        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (makeOxygenCarbonDoubleBond())')
            console.log('Method: makeOxygenCarbonDoubleBond()')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(i)
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

    breakCarbonOxygenDoubleBond() {

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

        this.reaction.setChargeOnSubstrateAtom(double_bonds[0].atom_index)
        this.reaction.setChargeOnSubstrateAtom(oxygen_index)


        this.reaction.setMoleculeAI()
        // carbon atom

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

        }

        this.reaction.setMoleculeAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (breakCarbonOxygenDoubleBond())')
            console.log('Method: breakCarbonOxygenDoubleBond()')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(i)
        }

        return true

    }

    breakCarbonDoubleBond() {

        // @see Organic Chemistry 8th edition p245
        // Get index of double bond carbon bonded to the most hydrogens
        let atom_nucleophile_index = this.reaction.MoleculeAI.findLeastSubstitutedCarbonPiBondIndex()

        if (atom_nucleophile_index === -1) {
            return false
        }
        atom_nucleophile_index.should.be.an.Number()
        atom_nucleophile_index.should.be.greaterThan(-1)

        const atoms = _.cloneDeep(this.reaction.container_substrate[0][1])

        let free_electrons = []

        // Check for double bond and if there is one break it and get shared electrons from that.
        const double_bonds = CAtom(this.reaction.container_substrate[0][1][atom_nucleophile_index], atom_nucleophile_index, this.reaction.container_substrate).indexedDoubleBonds("")

        const db_atom = CAtom(this.reaction.container_substrate[0][1][double_bonds[0].atom_index], double_bonds[0].atom_index, this.reaction.container_substrate)

        const shared_electrons = _.cloneDeep(double_bonds[0].shared_electrons).slice(0,2)

        // Remove double bond
        _.remove(this.reaction.container_substrate[0][1][double_bonds[0].atom_index], (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        free_electrons = shared_electrons
        free_electrons.length.should.be.greaterThan(1)

        let electrophile_index = null
        let charge = null

        if (this.reaction.container_reagent !== null) {
            electrophile_index = this.reaction.ReagentAI.findElectrophileIndex("")
            this.reaction.container_reagent[0][1][electrophile_index].push(free_electrons[0])
            this.reaction.container_reagent[0][1][electrophile_index].push(free_electrons[1])
            // @todo
            charge = this.reaction.container_reagent[0][1][electrophile_index][0] === "Hg"?"&+":"+"
            this.reaction.container_reagent[0][1][electrophile_index][4] =
                this.reaction.container_reagent[0][1][electrophile_index][4] === "-"
                || this.reaction.container_reagent[0][1][electrophile_index][4] < 0? 0: charge
            _.cloneDeep(this.reaction.container_reagent[0][1]).map((reagent_atom)=>{
                this.reaction.container_substrate[0][1].push(reagent_atom)
            })
        } else {
            electrophile_index = this.reaction.MoleculeAI.findElectrophileIndex("")
            this.reaction.container_substrate[0][1][electrophile_index].push(free_electrons[0])
            this.reaction.container_substrate[0][1][electrophile_index].push(free_electrons[1])
            this.reaction.container_substrate[0][1].push(this.reaction.container_substrate[0][1][electrophile_index])
            // @todo
            charge = this.reaction.container_substrate[0][1][electrophile_index][0] === "Hg"?"&+":"+"
            this.reaction.container_substrate[0][1][electrophile_index][4] =
                this.reaction.container_substrate[0][1][electrophile_index][4] === "-"
                || this.reaction.container_substrate[0][1][electrophile_index][4] < 0? 0: charge
        }

        // Set charge on the former double bonded carbon
        this.reaction.container_substrate[0][1][double_bonds[0].atom_index][4] =
            this.reaction.container_substrate[0][1][double_bonds[0].atom_index][4] === "-"
            || this.reaction.container_substrate[0][1][double_bonds[0].atom_index][4] < 0? 0: charge

        this.reaction.container_substrate[0][1].length.should.not.equal(atoms.length)

        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (breakCarbonDoubleBond())')
            console.log('Method: breakCarbonDoubleBond()')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(i)
        }

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


    makeCarbonNitrogenDoubleBondReverse() {

        const nitrogen_index = this.reaction.MoleculeAI.findNitrogenOnDoubleBondIndex()
      //  console.log('makeCarbonNitrogenDoubleBondReverse()')
      //  console.log(VMolecule(this.reaction.container_substrate).compressed())
      //  console.log(nitrogen_index)

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
        this.reaction.setChargeOnSubstrateAtom(double_bonds[0].atom_index)
        // Nitrogen atom charge
        this.reaction.setChargeOnSubstrateAtom(nitrogen_index)

        this.reaction.setMoleculeAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (makeCarbonNitrogenDoubleBondReverse())')
            console.log('Method: makeCarbonNitrogenDoubleBondReverse()')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(i)
        }

        //console.log(VMolecule(this.reaction.container_substrate).compressed())
        //console.log(opo)

        return true

    }

    breakCarbonOxygenDoubleBondReverse() {

        this.reaction.setMoleculeAI()

        // console.log('Reaction.js breakCarbonOxygenDoubleBondReverse()')
        // console.log(VMolecule(this.reaction.container_substrate).compressed())

        // Make C=O bond
        const oxygen_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=> {
            if ( atom[0] !== "O") {
                return false
            }
            if ( atom[4] !== "-") {
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


        if (oxygen_index === -1 || this.reaction.container_substrate[0][1][oxygen_index][4]=== "+") {
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
                return false
            }
            return true
        })

        if (carbon_bonds.length === 0) {
            return false
        }

        const carbon_index = carbon_bonds[0].atom_index

        // console.log("BondsAI carbon_index breakCarbonOxygenDoubleBondReverse():" + carbon_index)
        // console.log(mno)
        // console.log(VMolecule(this.reaction.container_substrate).compressed())


        const freeElectrons = oxygen.freeElectrons()

        // Add electrons to carbon
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
        // this.reaction.container_substrate[0][1][carbon_index][4] = ""
        this.reaction.setChargeOnSubstrateAtom(carbon_index)
        //this.reaction.container_substrate[0][1][oxygen_index][4] = this.reaction.container_substrate[0][1][oxygen_index][4]=== "-"? "": "+"
        this.reaction.setChargeOnSubstrateAtom(oxygen_index)


        this.reaction.setMoleculeAI()


        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (breakCarbonOxygenDoubleBondReverse())')
            console.log('Method: breakCarbonOxygenDoubleBondReverse()')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(uittt)
        }

        //console.log(bbbbrak)

        return true


    }

    bondSubstrateToReagent(nucleophile_index = null, electrophile_index = null) {

        // Important:
        // The reagent is the nucleophile and is attacking the substrate
        // The substrate is the electrophile
      //  console.log('BondsAI.js bondSubstrateToReagent')
        // Check for Nitrogen atom  on reagent and C=O bond on substrate
        if (nucleophile_index === null) {
            nucleophile_index = _.findIndex(this.reaction.container_reagent[0][1], (atom, index) => {
                if (atom[0] !== "N") {
                    return false
                }
                const n = CAtom(this.reaction.container_reagent[0][1][index], index, this.reaction.container_reagent)
                return n.indexedDoubleBonds("").length === 0
            })
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

        if (nucleophile_index === -1) {
            nucleophile_index = this.reaction.ReagentAI.findNucleophileIndex()
        }

        if (nucleophile_index === -1) {
            return false
        }

        const nucleophile = CAtom(this.reaction.container_reagent[0][1][nucleophile_index], nucleophile_index, this.reaction.container_reagent)


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
            (atom)=>{
                this.reaction.container_substrate[0][1].push(atom)
                return atom
            }
        )

//        this.reaction.setMoleculeAI()
  //      this.reaction.setReagentAI()

        // Charges
        // this.reaction.container_substrate[0][1][electrophile_index][4] = this.reaction.container_substrate[0][1][electrophile_index][4] === "+"?"":"-"
        this.reaction.setChargeOnSubstrateAtom(electrophile_index)
        this.reaction.container_reagent[0][1][nucleophile_index][4] = this.reaction.container_reagent[0][1][nucleophile_index][4] === "-"?"":"+"


        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('BondsAI.js molecule is not valid (bondSubstrateToReagent())')
            console.log('Method: bondSubstrateToReagent()')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(bbbbbbond)
        }

        return true

    }
    
    bondSubstrateToReagentReverse() {
        // Important (orginal reaction):
        // The reagent is the nucleophile and is attacking the substrate
        // The substrate is the electrophile
        // Look for N+=C+ bond
        let n_index = null
        let n_atom = null
        let c_atom = null
        n_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{
            return atom[0] === "N" && atom[4] === "+"
        })


        if (n_index !== -1) {

            const source_atom = CAtom(this.reaction.container_substrate[0][1][n_index], n_index, this.reaction.container_substrate)
            n_atom = CAtom(this.reaction.container_substrate[0][1][n_index], n_index, this.reaction.container_substrate)

            let c_bonds = source_atom.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "C" && bond.atom[4] === "+"
            })

            if (c_bonds.length === 0 ) {
                // Look for N+(C-)X bond
                c_bonds = n_atom.indexedBonds("").filter((bond)=>{
                    if (bond.atom[0]!=="C") {
                        return false
                    }
                    c_atom = CAtom(this.reaction.container_substrate[0][1][bond.atom_index], bond.atom_index, this.reaction.container_substrate)
                    const x_bonds = c_atom.indexedBonds("").filter((bond)=>{
                        return bond.atom[0] === "Br"
                    })
                    return x_bonds.length > 0
                })
                //console.log(hgf)
            }

            if (c_bonds.length > 0) {
                const c_index = c_bonds[0].atom_index
                const target_atom = CAtom(this.reaction.container_substrate[0][1][c_index], c_index, this.reaction.container_substrate)
                // Use dehydrate() instead
                if (target_atom.symbol === "O" && target_atom.hydrogens().length ===2 && this.reaction.container_substrate[0][1][electrophile_index][4] === "+") {
                    return false
                }
                const shared_electrons = Set().intersection(_.cloneDeep(this.reaction.container_substrate[0][1][n_index].slice(5)), _.cloneDeep(this.reaction.container_substrate[0][1][c_index].slice(5)))
                const electrons = _.cloneDeep(this.reaction.container_substrate[0][1][n_index]).slice(5)
                this.reaction.container_substrate[0][1][n_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][n_index], shared_electrons)
                this.reaction.setChargeOnSubstrateAtom(n_index)
                this.reaction.setChargeOnSubstrateAtom(c_index)
                this.reaction.setMoleculeAI()
                const groups = this.reaction.MoleculeAI.extractGroups()
                this.reaction.__setSubstrateGroups(groups)
                if(this.reaction.leaving_groups.length > 0) {
                    this.reaction.container_reagent = this.reaction.leaving_groups[0]
//                    console.log(VMolecule(this.reaction.container_reagent).canonicalSMILES())
  //                  console.log(VMolecule(this.reaction.container_substrate).compressed())
    //                console.log(nnjjn)
                    return true
                }
            }
        }

        return false
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
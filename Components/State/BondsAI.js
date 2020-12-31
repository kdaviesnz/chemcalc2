const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')
const AtomFactory = require('../../Models/AtomFactory')

// makeNitrogenCarbonTripleBond()
// makeOxygenCarbonDoubleBond()
// breakCarbonNitrogenTripleBond()
// breakCarbonNitrogenDoubleBond()
// breakCarbonOxygenDoubleBond()
// breakCarbonDoubleBond()
// makeCarbonNitrogenDoubleBondReverse()
// makeOxygenCarbonDoubleBondReverse()
// breakCarbonOxygenDoubleBondReverse()
// bondSubstrateToReagentReverse()

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

    makeOxygenCarbonDoubleBond() {

        // This should NOT remove H from the oxygen
        //     // console.log('makeOxygenCarbonDoubleBond()')
        const oxygen_index = this.reaction.MoleculeAI.findOxygenAttachedToCarbonIndexNoDoubleBonds()

        if (oxygen_index === -1) {
            return false
        }

        // Should have positive charge - added
        if (this.reaction.container_substrate[0][1][oxygen_index] !== "+") {
            return false
        }
        const oxygen = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)

        // Added check for negative charge
        const carbon_bonds = oxygen.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C" && bond.atom[4] === "-"
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

        // carbon atom
        this.reaction.container_substrate[0][1][double_bonds[0].atom_index][4] =  this.reaction.container_substrate[0][1][double_bonds[0].atom_index][4] === "-"? '': '+'
        this.reaction.container_substrate[0][1][oxygen_index][4] = this.reaction.container_substrate[0][1][oxygen_index][4] === "+" ? "":"-"
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
                this.reaction.container_substrate[0][1][double_bonds[0].atom_index][4] = this.reaction.container_substrate[0][1][double_bonds[0].atom_index][4] === "+" ? '' : '-'
                this.reaction.container_substrate[0][1][carbon_atom_negative_bonds[0].atom_index][4] = this.reaction.container_substrate[0][1][carbon_atom_negative_bonds[0].atom_index][4] === "-" ? '' : '+'
                this.reaction.container_substrate[0][1][oxygen_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][oxygen_index], shared_electrons)
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
        const proton = AtomFactory("H")
        proton.pop()
        proton.push(shared_electrons[0])
        proton.push(shared_electrons[1])
        this.reaction.container_substrate[0][1].push(proton)

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
            return bond.atom[0] === "C"
        })

        if (carbon_bonds.length === 0) {
            return false
        }

        const carbon_index = carbon_bonds[0].atom_index

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

        return true


    }

    bondSubstrateToReagentReverse() {
        // Important (orginal reaction):
        // The reagent is the nucleophile and is attacking the substrate
        // The substrate is the electrophile
        // Look for N+=C+ bond
        const n_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{
            return atom[0] === "N" && atom[4] === "+"
        })


        if (n_index !== -1) {
            console.log(n_index)
            console.log(nnjjn)

            const source_atom = CAtom(this.reaction.container_substrate[0][1][n_index], n_index, this.reaction.container_substrate[0][1])
            const c_bonds = source_atom.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "C" && bond.atom[4] === "+"
            })
            if (c_bonds.length > 0) {
                const c_index = c_bonds[0].atom_index
                const target_atom = CAtom(this.reaction.container_substrate[0][1][c_index], c_bonds, this.reaction.container_substrate)
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
                return true

            }
        }
        return false
    }



}

module.exports = BondsAI
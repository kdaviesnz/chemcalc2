const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')
const Set = require('../../Models/Set')
const AtomFactory = require('../../Models/AtomFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const uniqid = require('uniqid');
const range = require("range");

// substituteHalideForAmine()
// substituteOxygenCarbonDoubleBondForAmine()
// substituteHydroxylForNitrogenDoubleBond()
// substituteHalideForAmineReverse()
// substituteOxygenCarbonDoubleBondForAmineReverse()
// substituteHydroxylForNitrogenDoubleBondReverse()
class SubstitutionAI {

    constructor(reaction) {
        this.debugger_on = true
        this.reaction = reaction
    }

    debugger(o) {
        if (this.debugger_on) {
           // console.log(o)
        }
    }

    substituteOxygenCarbonDoubleBondForAmineReverse() {

        let co_bonds = null
        let oxygen = null

        // SN2 mechanism
        const oxygen_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=> {
            if ( atom[0] !== "O") {
                return false
            }
            if ( atom[4] !== "-") {
                return false
            }
            oxygen = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)
            co_bonds = oxygen.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "C"
            })
            return co_bonds.length > 0 // O[C-]
        })

        if (oxygen_index === -1) {
            return false
        }

        const c_index = co_bonds[0].atom_index
        const carbon = CAtom(this.reaction.container_substrate[0][1][c_index], c_index, this.reaction.container_substrate)
        if (carbon.indexedBonds("").length + carbon.indexedDoubleBonds("").length !== 4) {
            return false
        }
        // Look for NC bond
        const n_bonds = carbon.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "N"
        })

        if (n_bonds.length > 0) {
            const n_index = n_bonds[0].atom_index
            const n_shared_electrons = n_bonds[0].shared_electrons
            const o_free_electrons = oxygen.freeElectrons()
            // Remove N electrons from C - this will break the NC bond
            this.reaction.container_substrate[0][1][c_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][c_index], n_shared_electrons)
            // Add O electrons to C - this will recreate the double bond
            this.reaction.container_substrate[0][1][c_index].push(o_free_electrons[0])
            this.reaction.container_substrate[0][1][c_index].push(o_free_electrons[1])
            this.reaction.setChargeOnSubstrateAtom(n_index)
            this.reaction.setChargeOnSubstrateAtom(c_index)
            this.reaction.setChargeOnSubstrateAtom(oxygen_index)

            // Groups
            const groups = this.reaction.MoleculeAI.extractGroupsReverse()
            if (groups.length === 0) {
                return false
            }
            this.reaction.setSubstrateGroupsReverse(groups)
            /*
           // console.log("Leaving groups")
           // console.log(VMolecule(this.reaction.leaving_groups[0]).compressed())
           // console.log("Substrate")
           // console.log(VMolecule(this.reaction.container_substrate).compressed())
           // console.log(blahblah)
             */
            if(this.reaction.leaving_groups.length > 0) {
                this.reaction.container_reagent = this.reaction.leaving_groups[0]
            }
            this.reaction.setMoleculeAI()
            this.reaction.setReagentAI()
            return true
        }

        return false

    }

    substituteHydroxylForNitrogenDoubleBondReverse() {

    }

    substituteHydroxylForNitrogenDoubleBond() {
        // Look for [N-] atom attached to C bond with four bonds
        let c_n_bonds = null
        let n_atom = null
        let c_atom = null
        let hydroxyl_oxygen = null
        const n_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{
            if (atom[0]!=="N") {
                return false
            }
            if (atom[4]!=="-") {
                return false
            }
            n_atom = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate[0][1])
            c_n_bonds = n_atom.indexedBonds((bond)=>{
                if (bond.atom[0] !== "C" || bond.bond_type === "=") {
                    return false
                }
                c_atom = CAtom(this.reaction.container_substrate[0][1][bond.atom_index], bond.atom_index, this.reaction.container_substrate[0][1])
                return c_atom.indexedBonds("").length + c_atom.indexedDoubleBonds("").length === 4
            })

            return c_n_bonds !== 0

        })

        if (n_index === -1) {
           // console.log(nnegindexnotfound)
            return false
        }

        const c_hydroxyl_bonds = c_atom.indexedBonds("").filter((bond)=>{
            if (bond.atom[0] !== "O") {
                return false
            }
            hydroxyl_oxygen = CAtom(this.reaction.container_substrate[0][1][bond.atom_index], bond.atom_index, this.reaction.container_substrate[0][1])
            const h_bonds = hydroxyl_oxygen.indexedBonds("").filter((b)=>{
                return b.atom[0] === "H"
            })
            return h_bonds.length === 1
        })

        if (c_hydroxyl_bonds.length === -1) {
           // console.log(hydroxylbondnotfound)
            return false
        }

        // Break C-OH bond
        // Remove shared C-OH electrons from C
        this.reaction.container_substrate[0][1][c_n_bonds[0].atom_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][c_n_bonds[0].atom_index], _.cloneDeep(c_hydroxyl_bonds[0].shared_electrons))

        // C atom will now have 6 electrons
        // Add electrons from nitrogen to create N=C bond
        const n_free_electrons = n_atom.freeElectrons()
        this.reaction.container_substrate[0][1][c_n_bonds[0].atom_index].push(n_free_electrons[0])
        this.reaction.container_substrate[0][1][c_n_bonds[0].atom_index].push(n_free_electrons[1])

        this.reaction.setChargeOnSubstrateAtom(n_index)
        this.reaction.setChargeOnSubstrateAtom(c_n_bonds[0].atom_index)

        // Groups
        const groups = this.reaction.MoleculeAI.extractGroups()
        if (groups.length === 0) {
            return false
        }
        this.reaction.setSubstrateGroups(groups)
        if(this.reaction.leaving_groups.length > 0) {
            this.reaction.container_reagent = this.reaction.leaving_groups[0]
        }
        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()
        return true
    }


    substituteOxygenCarbonDoubleBondForAmine() {

        // SN2 mechanism -> O=C bond is replaced with OC bond at the same time as the replacement atom bonds.
        let oxygen = null
        let co_bonds = null
        let carbon = null
        const o_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{
            if (atom[0]!=="O") {
                return false
            }
            oxygen = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)
            if (oxygen.indexedDoubleBonds("").length !== 1) {
                return false
            }
            co_bonds = oxygen.indexedDoubleBonds("").filter((bond)=>{
                return bond.atom[0] === "C" && (bond.atom[4] === "" || bond.atom[4] === 0)
            })

            if (co_bonds.length === 0) {
                return false
            }

            // Don't get O on O=C-O bond
            carbon = CAtom(this.reaction.container_substrate[0][1][co_bonds[0].atom_index], co_bonds[0].atom_index, this.reaction.container_substrate)
            if(carbon.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "O" && bond.bond_type === ""
            }).length === 0){
                return true
            }
            return false

        })

        if (o_index === -1) {
            return false
        }

        // Look for N
        const n_index = _.findIndex(this.reaction.container_reagent[0][1], (atom, index)=>{
            return atom[0] === "N" && (atom[4] === "" || atom[4] === 0)
        })

        if (n_index !== -1) {

            // Replace o=c with N-R / oc
            // Convert O=C bond to OC bond
            const c_bonds = oxygen.indexedBonds("").filter((bond)=>{
                return bond.atom[0] == "C" && bond.bond_type === "="
            })

            this.reaction.container_substrate[0][1][o_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][o_index], _.cloneDeep(c_bonds[0].shared_electrons.slice(2)))
            // Make sure oxygen atom still has 8 electrons
            range.range(0, c_bonds[0].shared_electrons.slice(2).length).map((i)=>{
                this.reaction.container_substrate[0][1][o_index].push(uniqid())
            })

            // We do this as otherwise the carbon atom ends up with too many electrons
            this.reaction.container_substrate[0][1][c_bonds[0].atom_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][c_bonds[0].atom_index], _.cloneDeep(c_bonds[0].shared_electrons.slice(2)))

            const n_atom = CAtom(this.reaction.container_reagent[0][1][n_index], n_index, this.reaction.container_reagent)

            // bond reagent to substrate
            this.reaction.setChargeOnSubstrateAtom(o_index) // Do this first.
            this.reaction.bondSubstrateToReagent(n_index, c_bonds[0].atom_index)

            this.reaction.setMoleculeAI()
            this.reaction.setReagentAI()

          // console.log(VMolecule(this.reaction.container_substrate).compressed())

          // console.log(bbbbb)
            return true

        }

        return false

    }

    substituteHalideForAmine() {

        // SN2 mechanism -> halide is replaced at the same time as the replacement atom bonds.
        const halide_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{
            return atom[0] === "Br"
        })

        if (halide_index === -1) {
            return false
        }

        const x_atom = CAtom(this.reaction.container_substrate[0][1][halide_index], halide_index, this.reaction.container_substrate)

        // Look for N
        const n_index = _.findIndex(this.reaction.container_reagent[0][1], (atom, index)=>{
            return atom[0] === "N" && (atom[4] === "" || atom[4] === 0)
        })

        if (n_index !== -1) {
            // Replace halide with N-R
            const c_bonds = x_atom.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "C" && (bond.atom[4] === "" || bond.atom[4] === 0)
            })

            if (c_bonds.length === 0) {
                return false
            }

            // Remove X Bond
            this.reaction.container_substrate[0][1][halide_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][halide_index], c_bonds[0].shared_electrons )
            // Make sure X atom still has 8 electrons
            range.range(0, c_bonds[0].shared_electrons.length).map((i)=>{
                this.reaction.container_substrate[0][1][halide_index].push(uniqid())
            })
            // We do this as otherwise the carbon atom ends up with too many electrons
            this.reaction.container_substrate[0][1][c_bonds[0].atom_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][c_bonds[0].atom_index], c_bonds[0].shared_electrons )

            const n_atom = CAtom(this.reaction.container_reagent[0][1][n_index], n_index, this.reaction.container_reagent)

            // bond reagent to substrate
            this.reaction.setChargeOnSubstrateAtom(halide_index) // Do this first.
            this.reaction.bondSubstrateToReagent(n_index, c_bonds[0].atom_index)


            this.reaction.leaving_groups.push([[-1, [this.reaction.container_substrate[0][1][halide_index]]], 1])
            _.remove(this.reaction.container_substrate[0][1], (i, v) =>{
                return v === halide_index
            })

            return true

        }

        return false


    }

    substituteHalideForAmineReverse() {
        // SN2 mechanism -> halide is replaced at the same time as the replacement atom bonds.
        // [N+]C
        let n_atom = null
        const n_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{
            if (atom[0] !== "N") {
                return false
            }
            if (atom[4] !== "+") {
                return false
            }
            n_atom = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)
            return n_atom.hydrogens().length === 3
        })

        if (n_index === -1) {
            return false
        }

        const c_bonds = n_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C" && (bond.atom[4] === "" || bond.atom[4] === 0)
        })

        if (c_bonds.length === 0) {
            return false
        }

        const c_index = c_bonds[0].atom_index
        const target_atom = CAtom(this.reaction.container_substrate[0][1][c_index], c_index, this.reaction.container_substrate)
        const shared_electrons = Set().intersection(_.cloneDeep(this.reaction.container_substrate[0][1][n_index].slice(5)), _.cloneDeep(this.reaction.container_substrate[0][1][c_index].slice(5)))
        const electrons = _.cloneDeep(this.reaction.container_substrate[0][1][n_index]).slice(5)

        // Break NC bond but make sure nitrogen still has 8 electrons
        this.reaction.container_substrate[0][1][n_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][n_index], shared_electrons)
        range.range(0, shared_electrons.length, 1).map(
            (i) => {
                this.reaction.container_substrate[0][1][n_index].push(uniqid())
            }
        )

        this.reaction.setChargesOnSubstrate()
        // this.reaction.setChargeOnSubstrateAtom(n_index, 'substitutionAI', uniqid())
//        this.reaction.container_substrate[0][1][n_index][4] = ""

        const groups = this.reaction.MoleculeAI.extractGroupsReverse()
        this.reaction.setSubstrateGroupsReverse(groups)
        if(this.reaction.leaving_groups.length > 0) {
            this.reaction.container_reagent = this.reaction.leaving_groups[0]
            const halide_atom = AtomFactory("Br", "")
            halide_atom.pop() // we remove an electron before adding the shared electrons as otherwise we end up with 9 electrons.
            halide_atom.push(shared_electrons[0])
            halide_atom.push(shared_electrons[1])
            this.reaction.container_substrate[0][1].push(halide_atom)
            this.reaction.setReagentAI()
            this.reaction.setChargesOnSubstrate('chargesai', uniqid())
            this.reaction.setMoleculeAI()
          // console.log(VMolecule(this.reaction.container_substrate).compressed())
          // console.log(mmmm)
            return true
        } else {
            return false
        }

    }

}

module.exports = SubstitutionAI
const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')
const Set = require('../../Models/Set')
const AtomFactory = require('../../Models/AtomFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const uniqid = require('uniqid');
const range = require("range");

class SubstitutionAI {

    constructor(reaction) {
        this.debugger_on = true
        this.reaction = reaction
    }

    debugger(o) {
        if (this.debugger_on) {
            console.log(o)
        }
    }

    substituteHalide() {
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

            const n_atom = CAtom(this.reaction.container_reagent[0][1][n_index], n_index, this.reaction.container_reagent)
            const n_free_electrons = n_atom.freeElectrons()
            console.log(n_free_electrons)
            console.log(n_atom.bondCount())
            console.log(this.reaction.container_reagent[0][1][n_index])

            console.log('Substrate:')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(kkkkk)

            const c_atom = CAtom(this.reaction.container_substrate[0][1][c_bonds[0].atom_index], c_bonds[0].atom_index, this.reaction.container_substrate)
            const free_electrons = c_atom.freeElectrons()
            console.log(free_electrons)
            console.log(c_atom.indexedBonds("").length)


            console.log(frreelelectrons)



            this.reaction.leaving_groups.push([this.reaction.container_substrate[0][1][halide_index], 1])
            _.remove(this.reaction.container_substrate[0][1], (i, v) =>{
                return v === halide_index
            })


            console.log(VMolecule(this.reaction.container_substrate).compressed())


            console.log(halide_index)

            console.log(n_index)
            console.log(rrrrr)

        }

        return false


    }

    substituteHalideReverse() {
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
        this.reaction.container_substrate[0][1][n_index][4] = ""

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
            this.reaction.setMoleculeAI()
            //console.log(VMolecule(this.reaction.container_substrate).compressed())
            //console.log(mmmm)
            return true
        } else {
            return false
        }

    }
    
}

module.exports = SubstitutionAI
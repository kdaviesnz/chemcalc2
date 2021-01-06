const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')
const Set = require('../../Models/Set')
const AtomFactory = require('../../Models/AtomFactory')
const VMolecule = require('../Stateless/Views/Molecule')


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
        this.reaction.container_substrate[0][1][n_index] = Set().removeFromArray(this.reaction.container_substrate[0][1][n_index], shared_electrons)
        const groups = this.reaction.MoleculeAI.extractGroups()
        this.reaction.__setSubstrateGroups(groups)
        if(this.reaction.leaving_groups.length > 0) {
            this.reaction.container_reagent = this.reaction.leaving_groups[0]
            const halide_atom = AtomFactory("Br", "")
            halide_atom.push(shared_electrons[0])
            halide_atom.push(shared_electrons[1])
            this.reaction.container_substrate[0][1].push(halide_atom)
            //console.log(VMolecule(this.reaction.container_substrate).compressed())
            //console.log(mmmm)
            return true
        } else {
            return false
        }

    }
    
}

module.exports = SubstitutionAI
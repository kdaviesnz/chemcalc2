const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')

class ProtonationAI {

    constructor(reaction) {
        this.reaction = reaction
    }

    deprotonateCarbonyl() {
        return false
    }

    protonateCarbonyl() {
        return false
    }

    deprotonateOxygenOnDoubleBond() {

        // Find index of oxygen
        const oxygen_index = this.reaction.MoleculeAI.findOxygenOnDoubleBondIndex()
        const oxygen_atom = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate)

        // Find proton
        const proton_bond = oxygen_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        }).pop()


        // Remove bond from proton
        _.remove(this.reaction.container_substrate[0][1][proton_bond.atom_index], (e)=>{
            return e === proton_bond.shared_electrons[0] || e === proton_bond.shared_electrons[1]
        })

        this.reaction.container_substrate[0][1][oxygen_index][4] = ""

        this.reaction.setMoleculeAI()

        return true
    }

    protonateOxygenOnDoubleBond() {

        // Find index of oxygen
        const oxygen_index = this.reaction.MoleculeAI.findOxygenOnDoubleBondIndex()

        const reagent_proton_index = this.reaction.ReagentAI.findProtonIndex()
        const proton = _.cloneDeep(this.reaction.container_reagent[0][1][reagent_proton_index])

        // Remove proton from reagent
        const reagent_bonds = CAtom(this.reaction.container_reagent[0][1][reagent_proton_index], reagent_proton_index, this.reaction.container_reagent).indexedBonds("").filter(
            (bond) => {
                return bond.atom[0] !== "H"
            }
        )

        let free_slots = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate).freeSlots()
        if (free_slots > 0) {
            // Add proton
            this.reaction.container_substrate[0][1][oxygen_index].push(proton[proton.length-1])
            this.reaction.container_substrate[0][1][oxygen_index].push(proton[proton.length-2])
            this.reaction.container_substrate[0][1].push(proton)
            this.reaction.container_substrate[0][1][oxygen_index][4] = "+"
        }

        this.container_reagent[0][1][reagent_bonds[0].atom_index][4] === "+"
        ||  this.container_reagent[0][1][reagent_bonds[0].atom_index][4] < 0? 0: "-"
        _.remove(this.reaction.container_reagent[0][1], (v, i) => {
            return i === reagent_proton_index
        })

        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()

        return true
    }

    protonateReverse() {

        //  // console.log("protonateReverse()")
        //  // console.log(VMolecule(this.container_substrate).compressed())
        //  // console.log(VMolecule(this.container_reagent).compressed())

        // 1. Reverse protonation of OH group on substrate by OH group on reagent
        // https://en.wikipedia.org/wiki/Leuckart_reaction
        // Look for water group on substrate
        const water_oxygen_index = this.MoleculeAI.findWaterOxygenIndex()

        if (water_oxygen_index !== -1) {
            // Look for O- atom on reagent
            const o_index = _.findIndex(this.container_reagent[0][1], (atom, index)=> {
                return atom[0] === "O" && atom[4] === "-"
            })


            if (o_index !== -1) {
                // Move proton from water group on subtrate to O- atom on reagent
                this.container_substrate[0][1] = this.removeProtonFromAtom(this.MoleculeAI, this.container_substrate[0][1], water_oxygen_index)
                this.addProtonToReagent(o_index)
                return true
            }
        }
        return false
    }

    deprotonate() {

        // [C+]CH3
        // We remove the proton from the second carbon
        const electrophile_index = this.MoleculeAI.findIndexOfAtomToDeprotonate((electrophile_index)=>{
            const atom = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)
            return atom.hydrogens().length > 0
        })

        if (electrophile_index === -1) {
            return false
        }

        const electrophile = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)
        const electrophile_bonds  = electrophile.indexedBonds("")

        const hydrogen_bond = electrophile_bonds.filter((bond)=>{
            return bond.atom[0] === 'H'
        }).pop()

        if (hydrogen_bond === undefined) {
            // console.log('deprotonate() Electrophile has no hydrogen bonds')
            return false
        }

        // console.log('deprotonate electrophile index: ' + electrophile_index)
        // console.log(this.container_substrate[0][1][electrophile_index][0])
        if (this.container_substrate[0][1][electrophile_index][0]!== "C"){
            // Charge should be set before calling this.addProtonToReagent()
            this.container_substrate[0][1][electrophile_index][4] = this.container_substrate[0][1][electrophile_index][4] === "+"? "" : "-"
            const r = this.addProtonToReagent()
            if (r === false) {
                return false
            }
            this.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)
        } else {

            // Check for carbons bonds

            const non_carbon_bond = electrophile_bonds.filter((bond) => {
                return bond.atom[0] !== "C" && bond.atom[0] !== "H"
            }).pop()

            if (non_carbon_bond !== undefined) {

                this.addProtonToReagent()
                this.container_substrate[0][1][electrophile_index][4] = "+"
                this.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)

            } else {

                const carbon_bond = electrophile_bonds.filter((bond) => {
                    return bond.atom[0] === "C"
                }).pop()

                if (undefined === carbon_bond) {
                    this.addProtonToReagent()
                    this.container_substrate[0][1][electrophile_index][4] = 0
                    this.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)
                } else {
                    // Change bond to double bond
                    const shared_electrons = hydrogen_bond.shared_electrons // electrons shared between electrophile and hydrogen
                    this.container_substrate[0][1][carbon_bond.atom_index].push(shared_electrons[0])
                    this.container_substrate[0][1][carbon_bond.atom_index].push(shared_electrons[1])
                    this.addProtonToReagent()
                    this.container_substrate[0][1][electrophile_index][4] = 0
                }

            }

        }

        this.setReagentAI()
        this.setMoleculeAI()

        return true


    }

}

module.exports = ProtonationAI
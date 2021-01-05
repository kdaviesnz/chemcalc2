const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')

class ChargesAI {

    constructor(reaction) {
        this.debugger_on = true
        this.reaction = reaction
    }

    debugger(o) {
        if (this.debugger_on) {
            console.log(o)
        }
    }

    checkCharge(container_molecule, atom, index) {

        const a_obj = CAtom(container_molecule[0][1][index], index, container_molecule)
        const b_count = a_obj.bondCount() + a_obj.doubleBondCount()
        const electrons = _.cloneDeep(container_molecule[0][1][index].slice(5))
        const freeElectrons = a_obj.freeElectrons()


        if (atom[0] === "O") {
            // 6 is the number of valence electrons when there are no bonds
            if (6 + b_count === electrons.length && container_molecule[0][1][index][4] !== "" && container_molecule[0][1][index][4] !== 0) {
                console.log("validateMolecule O")
                console.log(index)
                console.log('Atom should have neutral charge')
                return true
            }
            if (electrons.length > (6 + b_count) && container_molecule[0][1][index][4] !== "-") {
                console.log("validateMolecule O")
                console.log(index)
                console.log('Atom should have negative charge')
                return true
            }
            if (electrons.length < (6 + b_count) && container_molecule[0][1][index][4] !== "+") {
                console.log("validateMolecule O")
                console.log(index)
                console.log('Atom should have positive charge')
                return true
            }
        }

        if (atom[0] === "N") {
            // 5 is the number of valence electrons when there are no bonds
            if (5 + b_count === electrons.length && container_molecule[0][1][index][4] !== "" && container_molecule[0][1][index][4] !== 0) {
                console.log("validateMolecule N")
                console.log(index)
                console.log('Atom should have neutral charge')
                return true
            }
            if (electrons.length > (5 + b_count) && container_molecule[0][1][index][4] !== "-") {
                console.log("validateMolecule N")
                console.log(index)
                console.log('Atom should have negative charge')
                return true
            }
            if (electrons.length < (5 + b_count) && container_molecule[0][1][index][4] !== "+") {
                console.log("validateMolecule N")
                console.log(index)
                console.log('Atom should have positive charge!!!')
                return true
            }
        }

        if (atom[0] === "C") {
            // 4 is the number of valence electrons when there are no bonds
            if (4 + b_count === electrons.length && container_molecule[0][1][index][4] !== "" && container_molecule[0][1][index][4] !== 0) {
                console.log("validateMolecule C")
                console.log(index)
                console.log('Atom should have neutral charge')
                return true
            }
            if (electrons.length > (4 + b_count) && container_molecule[0][1][index][4] !== "-") {
                console.log("validateMolecule C")
                console.log(index)
                console.log('Atom should have negative charge')
                return true
            }
            if (electrons.length < (4 + b_count) && container_molecule[0][1][index][4] !== "+") {
                console.log("validateMolecule C")
                console.log(index)
                console.log('Atom should have positive charge!!!')
                return true
            }
        }



        return false


    }

    setChargeOnSubstrateAtom(index) {

        const a_obj = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)
        const b_count = a_obj.bondCount() + a_obj.doubleBondCount()
        const electrons = _.cloneDeep(this.reaction.container_substrate[0][1][index].slice(5))
        if (this.reaction.container_substrate[0][1][index][0] === "O") {
            if (2 + b_count === electrons.length) {
                this.reaction.container_substrate[0][1][index][4] = ""
            }
            if (2 + b_count < electrons.length) {
                this.reaction.container_substrate[0][1][index][4] = "-"
            }
            if (2 + b_count > electrons.length) {
                this.reaction.container_substrate[0][1][index][4] = "+"
            }
        }
        if (this.reaction.container_substrate[0][1][index][0] === "N") {
            //console.log("ChargesAI.js setChargeOnSubstrateAtom()")
            //console.log(this.reaction.container_substrate[0][1][index])
            if (3 + b_count === electrons.length) {
                this.reaction.container_substrate[0][1][index][4] = ""
            }
            if (3 + b_count < electrons.length) {
                this.reaction.container_substrate[0][1][index][4] = "-"
            }
            if (3 + b_count > electrons.length) {
                this.reaction.container_substrate[0][1][index][4] = "+"
            }
        }
        if (this.reaction.container_substrate[0][1][index][0] === "C") {
            //console.log("ChargesAI.js setChargeOnSubstrateAtom()")
            //console.log(this.reaction.container_substrate[0][1][index])
            // 9 electrons, 5 bonds = neutral charge
            if (4 + b_count === electrons.length) {
                this.reaction.container_substrate[0][1][index][4] = ""
            }
            // 4 bonds, 9 electrons = negative charge
            if (4 + b_count < electrons.length) {
                this.reaction.container_substrate[0][1][index][4] = "-"
            }
            // 5 bonds, 8 electrons = positive charge
            if (4 + b_count > electrons.length) {
                this.reaction.container_substrate[0][1][index][4] = "+"
            }
        }

    }
    
}

module.exports = ChargesAI
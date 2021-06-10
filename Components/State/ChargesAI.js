const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')
const VMolecule = require('../Stateless/Views/Molecule')
const uniqid = require('uniqid');
const Typecheck = require('./../../Typecheck')
const Constants = require("../../Constants")
class ChargesAI {

    constructor(reaction) {

        Typecheck(
            {name: "reaction", value: reaction, type: "object"},
        )

        this.debugger_on = true
        this.reaction = reaction

        // Check each atom is an array
        if (this.reaction !== null && this.reaction !== undefined) {
            this.reaction.container_substrate[0][1].map((_atom) => {
                Typecheck(
                    {name: "_atom", value: _atom, type: "array"},
                )
            })
            this.reaction.container_reagent[0][1].map((_atom) => {
                Typecheck(
                    {name: "_atom", value: _atom, type: "array"},
                )
            })
        }

    }

    debugger(o) {
        if (this.debugger_on) {
           // console.log(o)
        }
    }

    setChargesOnReagent() {
        this.reaction.container_reagent[0][1].map(
            (atom, index) => {
                this.setChargeOnReagentAtom(index)
                return atom
            }
        )
    }

    setChargesOnSubstrate(DEBUG) {
        this.reaction.container_substrate[0][1].map(
            (atom, index) => {
                this.setChargeOnSubstrateAtom(index, 'chargesai', uniqid(), DEBUG)
                return atom
            }
        )
    }

    checkCharge(container_molecule, atom, index, trace, trace_id) {

        const a_obj = CAtom(container_molecule[0][1][index], index, container_molecule)

        /*
        if (trace === "chargesai" || trace==="addprotontosubstrate") {
           // console.log(trace + " " + trace_id)
           // console.log("(trace) " + trace + " ChargesAI checking charge: " + container_molecule[0][1][index][0] + " index:" + index + " free electrons:" + a_obj.freeElectrons().length + " bonds:" + (a_obj.indexedBonds("").length + a_obj.indexedDoubleBonds("").length + a_obj.indexedTripleBonds("").length))

        }
        */

        const b_count = a_obj.bondCount() + a_obj.doubleBondCount()
        const electrons = _.cloneDeep(container_molecule[0][1][index].slice(Constants().electron_index))
        const freeElectrons = a_obj.freeElectrons()

        let b = 0

        const single_bonds = a_obj.indexedBonds("").filter((bond)=>{
            return bond.atom[0] !== "H"
        })
        const double_bonds = a_obj.indexedDoubleBonds("").filter((bond)=>{
            return bond.atom[0] !== "H"
        })
        const triple_bonds = a_obj.indexedTripleBonds("").filter((bond)=>{
            return bond.atom[0] !== "H"
        })


        if (atom[0] === "Br") {
            // 7 is the number of valence electrons when there are no bonds
             b = (7 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length *2)+ (a_obj.indexedTripleBonds("").length*3))
/*
            if (7 + b_count === electrons.length && container_molecule[0][1][index][4] !== "" && container_molecule[0][1][index][4] !== 0) {
               // console.log("validateMolecule Br")
               // console.log(index)
               // console.log('Atom should have neutral charge')
                throw new Error("Atom should have a neutral charge")
            }
            if (electrons.length > (7 + b_count) && container_molecule[0][1][index][4] !== "-") {
               // console.log("validateMolecule Br")
               // console.log(index)
               // console.log('Atom should have negative charge')
                return true
            }
            if (electrons.length < (7 + b_count) && container_molecule[0][1][index][4] !== "+") {
               // console.log("validateMolecule Br")
               // console.log(electrons.length)
               // console.log(b_count)
               // console.log(index)
               // console.log('Atom should have positive charge!')
                return true
            }
            */
        }


        if (atom[0] === "O") {
            // 6 is the number of valence electrons when there are no bonds
             //b = (6 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length *2)+ (a_obj.indexedTripleBonds("").length*3))
            b = 2 - (a_obj.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        }

        if (atom[0] === "N") {
            // 5 is the number of valence electrons when there are no bonds
            // b = (5 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
            b = 3 - (a_obj.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
            /*
            if (5 + b_count === electrons.length && container_molecule[0][1][index][4] !== "" && container_molecule[0][1][index][4] !== 0) {
               // console.log("validateMolecule N")
               // console.log(index)
               // console.log(VMolecule(container_molecule).compressed())
               // console.log('Atom should have neutral charge')
                throw new Error("Atom should have a neutral charge")
            }
            if (electrons.length > (5 + b_count) && container_molecule[0][1][index][4] !== "-") {
               // console.log("validateMolecule N")
               // console.log(index)
               // console.log('Atom should have negative charge')
                return true
            }
            if (electrons.length < (5 + b_count) && container_molecule[0][1][index][4] !== "+") {
               // console.log("DEBUG: Atom should have positive charge")
               // console.log("DEBUG: Atom " + atom[0])
               // console.log("DEBUG: Index " + index)
                throw new Error("Atom should have positive charge")
            }
            */
        }

        if (atom[0] === "C") {
            // 4 is the number of valence electrons when there are no bonds
            // https://chemistry.stackexchange.com/questions/22032/how-does-a-carbocation-have-a-positive-charge
            // Formal Charge= (No.of valence electrons in unbonded state - no of lone pair electrons ) - (no. of bond pair electrons/2)
            // In this case the charge comes out to be (4-0) - (6/2) =+1
            // b = (4 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
            b = 4 - (a_obj.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
            // this.reaction.container_substrate[0][1][index][4] = b  > 0? "+": (b < 0?"-":"")


            /*
            if (4 + b_count === electrons.length && container_molecule[0][1][index][4] !== "" && container_molecule[0][1][index][4] !== 0) {
               // console.log("validateMolecule C")
               // console.log(index)
               // console.log('Atom should have neutral charge')
                return true
            }
            if (electrons.length > (4 + b_count) && container_molecule[0][1][index][4] !== "-") {
               // console.log("validateMolecule C")
               // console.log(index)
               // console.log('Atom should have negative charge')
                return true
            }
            if (electrons.length < (4 + b_count) && container_molecule[0][1][index][4] !== "+") {
               // console.log("DEBUG: Atom should have positive charge")
               // console.log("DEBUG: Atom " + atom[0])
               // console.log("DEBUG: Index " + index)
               // console.log(VMolecule(container_molecule).compressed())
                throw new Error("Atom should have positive charge")
            }
            */
        }


        if (b===0 && (container_molecule[0][1][index][4] !=="" && container_molecule[0][1][index][4] !==0)) {
            throw new Error("Atom should have a neutral charge - atom " + atom[5])
        }

        if (b > 0 && container_molecule[0][1][index][4] !=="+") {
            //              b = (6 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + a_obj.indexedDoubleBonds("").length + a_obj.indexedTripleBonds("").length)
            console.log("DEBUG: Atom should have positive charge")
            console.log("b="+b, ". index = " + index) //1
            console.log("DEBUG: Actual charge: " + container_molecule[0][1][index][4])
            console.log("DEBUG: Atom")
            console.log(atom)
            console.log("DEBUG: Atom " + atom[0])
            console.log("DEBUG: Charge " + atom[4])
            console.log("DEBUG: Index " + index)
            console.log("DEBUG: Free electrons:")
            console.log(a_obj.freeElectrons())
            console.log("DEBUG: Single bonds:")
            console.log(a_obj.indexedBonds(""))
            console.log("DEBUG: Double bonds:")
            console.log(a_obj.indexedDoubleBonds(""))
            console.log("DEBUG: Triple bonds:")
            console.log(a_obj.indexedTripleBonds(""))
            console.log(VMolecule(container_molecule).compressed())
            throw new Error("Atom should have a positive charge")
        }

        if (b < 0 && container_molecule[0][1][index][4] !=="-") {
           console.log("DEBUG: Atom should have negative charge")
            console.log("TRACE:"+trace + " " + trace_id)
           console.log("DEBUG: Atom " + atom[0])
           console.log("DEBUG: Charge " + atom[4])
           console.log("DEBUG: Index " + index)
           console.log("DEBUG: b " + b)
           console.log(a_obj.freeElectrons())
           console.log("Free electrons: " + a_obj.freeElectrons().length)
           console.log("No bonds: " + a_obj.indexedBonds("").length)
           console.log("Double bonds: " + a_obj.indexedDoubleBonds("").length)
           console.log("Triple bonds: " + a_obj.indexedTripleBonds("").length)
           console.log(VMolecule(container_molecule).compressed())
            throw new Error("Atom should have a negative charge")
        }

        return false


    }

    setChargeOnSubstrateAtom(index, trace, trace_id, DEBUG) {

        Typecheck(
            {name:"index", value:index, type:"number"},
            {name:"DEBUG", value:DEBUG, type:"boolean"},
            {name:"this.reaction.container_substrate[0][1][index]", value:this.reaction.container_substrate[0][1][index], type:"array"}
        )

        if (undefined === this.reaction.container_substrate[0][1][index]) {
            throw new Error("Atom array is undefined.")
        }

        // Check each atom is an array
        this.reaction.container_substrate[0][1].map((_atom)=>{
            Typecheck(
                {name:"_atom", value:_atom, type:"array"},
            )
        })

        // https://chemistry.stackexchange.com/questions/22032/how-does-a-carbocation-have-a-positive-charge
        // Formal Charge= (No.of valence electrons in unbonded state - no of lone pair electrons ) - (no. of bond pair electrons/2)
        const a_obj = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)
        const b_count = a_obj.bondCount() + a_obj.doubleBondCount()
        const electrons = _.cloneDeep(this.reaction.container_substrate[0][1][index].slice(Constants().electron_index))
        let  b = ""
        const single_bonds = a_obj.indexedBonds("").filter((bond)=>{
            return bond.atom[0] !== "H"
        })
        const double_bonds = a_obj.indexedDoubleBonds("").filter((bond)=>{
            return bond.atom[0] !== "H"
        })
        const triple_bonds = a_obj.indexedTripleBonds("").filter((bond)=>{
            return bond.atom[0] !== "H"
        })


        if (this.reaction.container_substrate[0][1][index][0] === "Br") {
            // b = (7 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length +  (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
            b = 1 - (a_obj.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        }
        if (this.reaction.container_substrate[0][1][index][0] === "O") {

            // Formal Charge= (No.of valence electrons in unbonded state - no of lone pair electrons ) - (no. of bond pair electrons/2)
           //  b = (6 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length +  (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
            b = 2 - (a_obj.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
            if (DEBUG && a_obj.symbol==="O") {
                console.log("ChargesAI: Free electrons:")
                console.log(a_obj.freeElectrons().length)
                console.log("ChargesAi b:")
                console.log(b) //2
                console.log("Number of single bonds:")
                console.log( single_bonds.length)
                console.log("Number of double bonds:")
                console.log( double_bonds.length)
                console.log("Number of triple bonds:")
                console.log( triple_bonds.length)
                console.log("Number of hydrogens")
                console.log(a_obj.hydrogens().length)
                console.log(a_obj.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)

            }

        }
        if (this.reaction.container_substrate[0][1][index][0] === "N") {
            if (DEBUG) {
                console.log("ChargesAI.js setChargeOnSubstrateAtom -> Free electrons:")
                console.log(a_obj.freeElectrons().length)
                console.log("ChargesAI.js setChargeOnSubstrateAtom -> No of double bonds:" + a_obj.indexedDoubleBonds("").length)
            }
             //b = (5 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
            b = 3 - (a_obj.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        }
        if (this.reaction.container_substrate[0][1][index][0] === "C") {
            // 9 electrons, 5 bonds = neutral charge
            // https://chemistry.stackexchange.com/questions/22032/how-does-a-carbocation-have-a-positive-charge
            // Formal Charge= (No.of valence electrons in unbonded state - no of lone pair electrons ) - (no. of bond pair electrons/2)
            // In this case the charge comes out to be (4-0) - (6/2) =+1
            b = 4 - (a_obj.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)

        }


        // this.reaction.container_substrate[0][1][index][4] is the charge
        this.reaction.container_substrate[0][1][index][4] = b  > 0? "+": (b < 0?"-":"")



    }

    setChargeOnReagentAtom(index) {

        // https://chemistry.stackexchange.com/questions/22032/how-does-a-carbocation-have-a-positive-charge
        // Formal Charge= (No.of valence electrons in unbonded state - no of lone pair electrons ) - (no. of bond pair electrons/2)
        const a_obj = CAtom(this.reaction.container_reagent[0][1][index], index, this.reaction.container_reagent)
        const b_count = a_obj.bondCount() + a_obj.doubleBondCount()
        const electrons = _.cloneDeep(this.reaction.container_reagent[0][1][index].slice(Constants().electron_index))
        let b = ""

        const single_bonds = a_obj.indexedBonds("").filter((bond)=>{
            return bond.atom[0] !== "H"
        })
        const double_bonds = a_obj.indexedDoubleBonds("").filter((bond)=>{
            return bond.atom[0] !== "H"
        })
        const triple_bonds = a_obj.indexedTripleBonds("").filter((bond)=>{
            return bond.atom[0] !== "H"
        })

        if (this.reaction.container_reagent[0][1][index][0] === "Br") {
            // b = (7 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
            b = 1 - (a_obj.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        }

        if (this.reaction.container_reagent[0][1][index][0] === "O") {
             //b = (6 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
            b = 2 - (a_obj.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        }

        if (this.reaction.container_reagent[0][1][index][0] === "N") {
             //b = (5 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
            b = 3 - (a_obj.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        }

        if (this.reaction.container_reagent[0][1][index][0] === "C") {
            // https://chemistry.stackexchange.com/questions/22032/how-does-a-carbocation-have-a-positive-charge
            // Formal Charge= (No.of valence electrons in unbonded state - no of lone pair electrons ) - (no. of bond pair electrons/2)
            // In this case the charge comes out to be (4-0) - (6/2) =+1
             //b = (4 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
            b = 4 - (a_obj.hydrogens().length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        }

        this.reaction.container_reagent[0][1][index][4] = b  > 0? "+": (b < 0?"-":"")
        this.reaction.setReagentAI()
        this.checkCharge(this.reaction.container_reagent, this.reaction.container_reagent[0][1][index], index)

    }

}

module.exports = ChargesAI
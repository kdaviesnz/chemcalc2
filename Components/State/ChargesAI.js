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
            if (typeof this.reaction.container_reagent !== "string") {
                this.reaction.container_reagent[0][1].map((_atom) => {
                    Typecheck(
                        {name: "_atom", value: _atom, type: "array"},
                    )
                })
            }
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

        //const a_obj = CAtom(container_molecule[0][1][index], index, container_molecule)
        const a_obj = container_molecule[0][1][index]

        //const b_count = a_obj.bondCount() + a_obj.doubleBondCount()
        //const electrons = _.cloneDeep(container_molecule[0][1][index].slice(Constants().electron_index))
        //const freeElectrons = a_obj.freeElectrons()

        let b = 0

        const single_bonds = a_obj.indexedBonds(_.cloneDeep(container_molecule[0][1])).filter((bond)=>{
            return bond.atom[0] !== "H"
        })
        const double_bonds = a_obj.indexedDoubleBonds(_.cloneDeep(container_molecule[0][1])).filter((bond)=>{
            return bond.atom[0] !== "H"
        })
        const triple_bonds = a_obj.indexedTripleBonds(_.cloneDeep(container_molecule[0][1])).filter((bond)=>{
            return bond.atom[0] !== "H"
        })

        if (atom[0] === "Br") {
            // 7 is the number of valence electrons when there are no bonds
             b = (7 - a_obj.freeElectrons(_.cloneDeep(container_molecule[0][1])).length) - (a_obj.indexedBonds("_.cloneDeep(container_molecule[0][1])").length + (a_obj.indexedDoubleBonds("_.cloneDeep(container_molecule[0][1])").length *2)+ (a_obj.indexedTripleBonds("").length*3))
        }

        if (atom[0] === "O") {
            // 6 is the number of valence electrons when there are no bonds
            b = 2 - (a_obj.hydrogens((container_molecule[0][1])).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        }

        if (atom[0] === "N") {
            b = 3 - (a_obj.hydrogens(_.cloneDeep(container_molecule[0][1])).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        }

        if (atom[0] === "C") {
            b = 4 - (a_obj.hydrogens(_.cloneDeep(container_molecule[0][1])).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        }


        if (b===0 && (container_molecule[0][1][index][4] !=="" && container_molecule[0][1][index][4] !==0)) {
            throw new Error("Atom should have a neutral charge - atom " + atom[5])
        }

        if (container_molecule[0][1][index][0] !== "C" && b > 0 && container_molecule[0][1][index][4] !=="-") {
            console.log("atom")
            console.log(single_bonds.length)
            console.log(a_obj.hydrogens(_.cloneDeep(container_molecule[0][1])).length)
                // 3 - (0 + 2)
            console.log(b)
            console.log(container_molecule[0][1][index])
            throw new Error("Atom should have a negative charge")
        }

        if (b < 0 && container_molecule[0][1][index][4] !=="+") {
            console.log(container_molecule[0][1][index])
            throw new Error("Atom should have a positive charge")
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
            _atom[0].should.be.a.String()
        })

        // https://chemistry.stackexchange.com/questions/22032/how-does-a-carbocation-have-a-positive-charge
        // Formal Charge= (No.of valence electrons in unbonded state - no of lone pair electrons ) - (no. of bond pair electrons/2)
        //const a_obj = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)
        const a_obj = this.reaction.container_substrate[0][1][index]
        //const b_count = a_obj.bondCount() + a_obj.doubleBondCount()
        //const electrons = _.cloneDeep(this.reaction.container_substrate[0][1][index].slice(Constants().electron_index))
        let  b = ""
        const single_bonds = a_obj.indexedBonds(_.cloneDeep(this.reaction.container_substrate[0][1])).filter((bond)=>{
            return bond.atom[0] !== "H"
        })
        const double_bonds = a_obj.indexedDoubleBonds(_.cloneDeep(this.reaction.container_substrate[0][1])).filter((bond)=>{
            return bond.atom[0] !== "H"
        })
        const triple_bonds = a_obj.indexedTripleBonds(_.cloneDeep(this.reaction.container_substrate[0][1])).filter((bond)=>{
            return bond.atom[0] !== "H"
        })

        //console.log("Bond counts - setChargesAI()")
        //console.log( a_obj.hydrogens(this.reaction.container_substrate[0][1]).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        //console.log(a_obj.hydrogens(this.reaction.container_substrate[0][1]).length + a_obj.bondCount(this.reaction.container_substrate[0][1]))
        const bond_count = a_obj.hydrogens(this.reaction.container_substrate[0][1]).length + a_obj.bondCount(this.reaction.container_substrate[0][1])

        if (this.reaction.container_substrate[0][1][index][0] === "Br") {
            b = 1 - (a_obj.hydrogens(this.reaction.container_substrate[0][1]).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        }
        if (this.reaction.container_substrate[0][1][index][0] === "O") {

            // Formal Charge= (No.of valence electrons in unbonded state - no of lone pair electrons ) - (no. of bond pair electrons/2)
            //b = 2 - (a_obj.hydrogens(this.reaction.container_substrate[0][1]).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
            b = bond_count - 2
        }
        if (this.reaction.container_substrate[0][1][index][0] === "N") {
             //b = (5 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
            // 3 - 4 = -1
            // 5 - 4 = 1
            // b = 3 - (a_obj.hydrogens((this.reaction.container_substrate[0][1])).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
            b = bond_count - 3
        }
        if (this.reaction.container_substrate[0][1][index][0] === "C") {

           // console.log("Set charges carbon bond bond = " + (a_obj.hydrogens((this.reaction.container_substrate[0][1])).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3))
           // b = 4 - (a_obj.hydrogens((this.reaction.container_substrate[0][1])).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
            if (this.reaction.container_substrate[0][1][index][4] === "+") {
                b = 1 // carbocation
            } else {
                b = bond_count - 4
            }
        }


        // this.reaction.container_substrate[0][1][index][4] is the charge
        this.reaction.container_substrate[0][1][index][4] = b  > 0? "+": (b < 0?"-":"")



    }

    setChargeOnReagentAtom(index) {

        // https://chemistry.stackexchange.com/questions/22032/how-does-a-carbocation-have-a-positive-charge
        // Formal Charge= (No.of valence electrons in unbonded state - no of lone pair electrons ) - (no. of bond pair electrons/2)
        const a_obj = this.reaction.container_reagent[0][1][index]
        const b_count = a_obj.bondCount(this.reaction.container_reagent[0][1]) + a_obj.doubleBondCount(this.reaction.container_reagent[0][1])
        const electrons = (this.reaction.container_reagent[0][1][index].slice(Constants().electron_index))
        let b = ""

        const single_bonds = a_obj.indexedBonds(this.reaction.container_reagent[0][1]).filter((bond)=>{
            return bond.atom[0] !== "H"
        })
        const double_bonds = a_obj.indexedDoubleBonds(this.reaction.container_reagent[0][1]).filter((bond)=>{
            return bond.atom[0] !== "H"
        })
        const triple_bonds = a_obj.indexedTripleBonds(this.reaction.container_reagent[0][1]).filter((bond)=>{
            return bond.atom[0] !== "H"
        })

        const bond_count = a_obj.hydrogens(this.reaction.container_reagent[0][1]).length + a_obj.bondCount(this.reaction.container_reagent[0][1])

        if (this.reaction.container_reagent[0][1][index][0] === "Br") {
            // b = (7 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
            b = 1 - (a_obj.hydrogens(this.reaction.container_reagent[0][1]).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
        }

        if (this.reaction.container_reagent[0][1][index][0] === "O") {
             //b = (6 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
           // b = 2 - (a_obj.hydrogens(this.reaction.container_reagent[0][1]).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
            b = bond_count - 2
        }

        if (this.reaction.container_reagent[0][1][index][0] === "N") {
             //b = (5 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
           // b = 3 - (a_obj.hydrogens(this.reaction.container_reagent[0][1]).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
            b = bond_count - 3
        }

        if (this.reaction.container_reagent[0][1][index][0] === "C") {
            // https://chemistry.stackexchange.com/questions/22032/how-does-a-carbocation-have-a-positive-charge
            // Formal Charge= (No.of valence electrons in unbonded state - no of lone pair electrons ) - (no. of bond pair electrons/2)
            // In this case the charge comes out to be (4-0) - (6/2) =+1
             //b = (4 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + (a_obj.indexedDoubleBonds("").length*2) + (a_obj.indexedTripleBonds("").length*3))
         //   b = 4 - (a_obj.hydrogens(this.reaction.container_reagent[0][1]).length + single_bonds.length + double_bonds.length*2 + triple_bonds.length*3)
            if (this.reaction.container_reagent[0][1][index][4] === "+") {
                b = 1 // carbocation
            } else {
                b = bond_count - 4
            }
        }

        this.reaction.container_reagent[0][1][index][4] = b  > 0? "+": (b < 0?"-":"")
        this.reaction.setReagentAI()
        this.checkCharge(this.reaction.container_reagent, this.reaction.container_reagent[0][1][index], index)

    }

}

module.exports = ChargesAI
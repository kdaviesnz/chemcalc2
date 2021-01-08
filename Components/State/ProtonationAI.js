const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')
const AtomFactory = require('../../Models/AtomFactory')

// protonateCarboncation()
// deprotonateCarbonyl()
// protonateCarbonyl()
// deprotonateOxygenOnDoubleBond()
// protonateOxygenOnDoubleBond()
// protonateReverse()
// deprotonate()
// protonate()
// removeProtonFromWater()
// addProtonFromReagentToHydroxylGroup()
// addProtonFromReagentToHydroxylGroupReverse()
// deprotonateReverse()

class ProtonationAI {

    constructor(reaction) {
        this.reaction = reaction
    }

    protonateCarbocation() {
        //Explanation: A carbocation is an organic molecule, an intermediate, that forms as a result of the loss of two valence electrons, normally shared electrons, from a carbon atom that already has four bonds. This leads to the formation of a carbon atom bearing a positive charge and three bonds instead of four.
       // https://socratic.org/questions/how-is-carbocation-formed
        return false
    }

    protonateCarbocationReverse() {
        return false
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
        const water_oxygen_index = this.reaction.MoleculeAI.findWaterOxygenIndex()

        if (water_oxygen_index !== -1) {
            // Look for O- atom on reagent
            const o_index = _.findIndex(this.reaction.container_reagent[0][1], (atom, index)=> {
                return atom[0] === "O" && atom[4] === "-"
            })


            if (o_index !== -1) {
                // Move proton from water group on subtrate to O- atom on reagent
                this.reaction.container_substrate[0][1] = this.reaction.removeProtonFromAtom(this.MoleculeAI, this.container_substrate[0][1], water_oxygen_index)
                this.reaction.addProtonToReagent(o_index)
                return true
            }
        }
        return false
    }

    deprotonate(command_names, command_index) {

        this.reaction.setMoleculeAI(command_names, command_index, -1)

        // console.log("ProtonationAI deprotonate()")
        // console.log(VMolecule(this.reaction.container_substrate).compressed())


        // [C+]CH3
        // We remove the proton from the second carbon
        let electrophile_index = this.reaction.MoleculeAI.findIndexOfAtomToDeprotonate((electrophile_index)=>{
            const atom = CAtom(this.reaction.container_substrate[0][1][electrophile_index], electrophile_index, this.reaction.container_substrate)
            return atom.hydrogens().length > 0
        })

        if (electrophile_index === -1) {
            return false
        }

       // console.log(this.reaction.container_substrate[0][1][electrophile_index])

        const electrophile = CAtom(this.reaction.container_substrate[0][1][electrophile_index], electrophile_index, this.reaction.container_substrate)
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
        if (this.reaction.container_substrate[0][1][electrophile_index][0]!== "C"){
            //console.log("ProtatonAI 1111")
            // Charge should be set before calling this.addProtonToReagent()
            this.reaction.container_substrate[0][1][electrophile_index][4] = this.reaction.container_substrate[0][1][electrophile_index][4] === "+"? "" : "-"
            const r = this.reaction.addProtonToReagent()
            if (r === false) {
                return false
            }
            this.reaction.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)
        } else {

            // Check for carbons bonds
            //console.log("ProtonationAI 2222")

            const non_carbon_bond = electrophile_bonds.filter((bond) => {
                return bond.atom[0] !== "C" && bond.atom[0] !== "H"
            }).pop()

            if (non_carbon_bond !== undefined) {
                //console.log("Protonation AI3333")
                const c_atom = CAtom(this.reaction.container_substrate[0][1][electrophile_index], electrophile_index, this.reaction.container_substrate)
                // 5 bonds, 10 electrons
                this.reaction.addProtonToReagent()
                this.reaction.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)
               // console.log("After splicing hydrogen")
                if (hydrogen_bond.atom_index < electrophile_index) {
                    electrophile_index = electrophile_index - 1
                }
                //this.reaction.container_substrate[0][1][electrophile_index][4] = "+"
                //this.reaction.setChargeOnSubstrateAtom(electrophile_index)
                /*
                console.log(VMolecule(this.reaction.container_substrate).compressed())
                console.log(c_atom.indexedBonds("").length)
                console.log(c_atom.bondCount())
                console.log(electrophile_index)
                console.log(this.reaction.container_substrate[0][1][electrophile_index])
                console.log(protonremoved)
                console.log(rew)
                */

            } else {
               // console.log("ProtonationAI 4444")
                const carbon_bond = electrophile_bonds.filter((bond) => {
                    return bond.atom[0] === "C"
                }).pop()

                if (undefined === carbon_bond) {
                    this.reaction.addProtonToReagent()
                    this.reaction.container_substrate[0][1][electrophile_index][4] = 0
                    this.reaction.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)
                } else {
                    // Change bond to double bond
                    const shared_electrons = hydrogen_bond.shared_electrons // electrons shared between electrophile and hydrogen
                    this.reaction.container_substrate[0][1][carbon_bond.atom_index].push(shared_electrons[0])
                    this.reaction.container_substrate[0][1][carbon_bond.atom_index].push(shared_electrons[1])
                    this.reaction.addProtonToReagent()
                    this.reaction.container_substrate[0][1][electrophile_index][4] = 0
                }

            }

        }

       // this.reaction.setChargeOnSubstrateAtom()
        //console.log("ProtonationAI deprotonate() after")
        //console.log(VMolecule(this.reaction.container_substrate).compressed())


        this.reaction.setReagentAI()
        this.reaction.setMoleculeAI(command_names, command_index, electrophile_index)

        return true


    }

    protonate() {

        // console.log(VMolecule(this.container_substrate).compressed())
        // console.log(y)

        let atom_nucleophile_index = this.reaction.MoleculeAI.findNucleophileIndex()
//        console.log("ProtonationAI.js protonate(): " + atom_nucleophile_index)

        if (atom_nucleophile_index === -1 && !this.reaction.MoleculeAI.isWater()) {
            // try carbon atom
            atom_nucleophile_index = _.findIndex(_.cloneDeep(this.reaction.container_substrate[0][1]), (atom)=>{
                return atom[0] === "C"
            })
        }
        atom_nucleophile_index.should.be.an.Number()
        atom_nucleophile_index.should.be.greaterThan(-1)

        const atoms = _.cloneDeep(this.reaction.container_substrate[0][1])

        const proton = AtomFactory("H", 0)
        proton.pop()

        proton.length.should.be.equal(5)
        proton[0].should.be.equal('H')


        // console.log("Nucleophile index:" + atom_nucleophile_index)

        let free_electrons = CAtom(this.reaction.container_substrate[0][1][atom_nucleophile_index], atom_nucleophile_index, this.reaction.container_substrate).freeElectrons()


        if (free_electrons.length === 0) {

            // Check for double bond and if there is one break it and get shared electrons from that.
            const double_bonds = CAtom(this.reaction.container_substrate[0][1][atom_nucleophile_index], atom_nucleophile_index, this.reaction.container_substrate).indexedDoubleBonds("")

            if (double_bonds.length > 0) {
                const db_atom = CAtom(this.reaction.container_substrate[0][1][double_bonds[0].atom_index], double_bonds[0].atom_index, this.reaction.container_substrate)

                const shared_electrons = _.cloneDeep(double_bonds[0].shared_electrons).slice(0,2)

                // Remove double bond
                _.remove(this.reaction.container_substrate[0][1][double_bonds[0].atom_index], (v)=>{
                    return v === shared_electrons[0] || v === shared_electrons[1]
                })

                free_electrons = shared_electrons
                // Set charge on the former double bonded carbon
                this.reaction.setChargeOnSubstrateAtom(double_bonds[0].atom_index)
                proton.push(free_electrons[0])
                proton.push(free_electrons[1])

            }




        } else {
            this.reaction.setChargeOnSubstrateAtom(atom_nucleophile_index)
        }

        free_electrons.length.should.be.greaterThan(1)


        proton.push(free_electrons[0])
        proton.push(free_electrons[1])
        this.reaction.container_substrate[0][1].push(proton)

        this.reaction.container_substrate[0][1].length.should.not.equal(atoms.length)

        // console.log("Reaction.js PROTONATE")
        // console.log(VMolecule(this.reaction.container_substrate).compressed())
        // console.log(x)

        this.reaction.setMoleculeAI()

        // Remove proton from the reagent
        if (null !== this.reaction.container_reagent) {

            const reagent_proton_index = this.reaction.ReagentAI.findProtonIndex()

            // Set charge
            const reagent_bonds = CAtom(this.reaction.container_reagent[0][1][reagent_proton_index], reagent_proton_index, this.reaction.container_reagent).indexedBonds("").filter(
                (bond) => {
                    return bond.atom[0] !== "H"
                }
            )

            this.reaction.container_reagent[0][1][reagent_bonds[0].atom_index][4] = this.reaction.container_reagent[0][1][reagent_bonds[0].atom_index][4] === "+"
            ||  (this.reaction.container_reagent[0][1][reagent_bonds[0].atom_index][4]) * 1 < 0? 0: "-"

            _.remove(this.reaction.container_reagent[0][1], (v, i) => {
                return i === reagent_proton_index
            })
            this.reaction.setReagentAI()
        }


    }


    deprotonateReverse() {

        this.reaction.MoleculeAI.validateMolecule()


        let atom_nucleophile_index = this.reaction.MoleculeAI.findNucleophileIndex()



       // console.log("Reaction.js deprotonateReverse() start:")
       // console.log(VMolecule(this.reaction.container_substrate).compressed())
       // console.log("Nu index:"+atom_nucleophile_index)


        if (atom_nucleophile_index === -1 && !this.reaction.MoleculeAI.isWater()) {
            // try carbon atom
            atom_nucleophile_index = _.findIndex(_.cloneDeep(this.reaction.container_substrate[0][1]), (atom)=>{
                return atom[0] === "C"
            })
        }

        if (atom_nucleophile_index === -1) {
            return false
        }

       // console.log("ProtonatiAI " + atom_nucleophile_index + " "+ this.reaction.container_substrate[0][1][atom_nucleophile_index][0])

        const atoms = _.cloneDeep(this.reaction.container_substrate[0][1])

        const proton = AtomFactory("H", 0)
        proton.pop()

        proton.length.should.be.equal(5)
        proton[0].should.be.equal('H')


        // console.log("Nucleophile index:" + atom_nucleophile_index)

        let free_electrons = CAtom(this.reaction.container_substrate[0][1][atom_nucleophile_index], atom_nucleophile_index, this.reaction.container_substrate).freeElectrons()


        if (free_electrons.length === 0) {

            // Check for double bond and if there is one break it and get shared electrons from that.
            const double_bonds = CAtom(this.reaction.container_substrate[0][1][atom_nucleophile_index], atom_nucleophile_index, this.reaction.container_substrate).indexedDoubleBonds("")

            if (double_bonds.length > 0) {
                const db_atom = CAtom(this.reaction.container_substrate[0][1][double_bonds[0].atom_index], double_bonds[0].atom_index, this.reaction.container_substrate)

                const shared_electrons = _.cloneDeep(double_bonds[0].shared_electrons).slice(0,2)

                // Remove double bond
                _.remove(this.reaction.container_substrate[0][1][double_bonds[0].atom_index], (v)=>{
                    return v === shared_electrons[0] || v === shared_electrons[1]
                })

                free_electrons = shared_electrons
                // Set charge on the former double bonded carbon
                this.reaction.setChargeOnSubstrateAtom(double_bonds[0].atom_index)
                proton.push(free_electrons[0])
                proton.push(free_electrons[1])

            }


        } else {

            proton.push(free_electrons[0])
            proton.push(free_electrons[1])
            this.reaction.setChargeOnSubstrateAtom(atom_nucleophile_index)
        }


        if (free_electrons.length === 0) {
            return false
        }


        this.reaction.container_substrate[0][1].push(proton)



        this.reaction.container_substrate[0][1].length.should.not.equal(atoms.length)

        // console.log("Reaction.js PROTONATE")
        // console.log(VMolecule(this.reaction.container_substrate).compressed())
        // console.log(x)


        // Remove proton from the reagent
        if (null !== this.reaction.container_reagent) {

            const reagent_proton_index = this.reaction.ReagentAI.findProtonIndex()

            // Set charge
            const reagent_bonds = CAtom(this.reaction.container_reagent[0][1][reagent_proton_index], reagent_proton_index, this.reaction.container_reagent).indexedBonds("").filter(
                (bond) => {
                    return bond.atom[0] !== "H"
                }
            )

            this.reaction.container_reagent[0][1][reagent_bonds[0].atom_index][4] = this.reaction.container_reagent[0][1][reagent_bonds[0].atom_index][4] === "+"
            ||  (this.reaction.container_reagent[0][1][reagent_bonds[0].atom_index][4]) * 1 < 0? 0: "-"

            _.remove(this.reaction.container_reagent[0][1], (v, i) => {
                return i === reagent_proton_index
            })
            this.reaction.setReagentAI()
        }

        // 16 = C
        // console.log("ProtonationAI, atom_nucleophile_index:" + atom_nucleophile_index )

        this.reaction.setChargeOnSubstrateAtom(atom_nucleophile_index)
        this.reaction.setMoleculeAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('ProtonationAI.js molecule is not valid (deprotonateReverse())')
            console.log('Method: deprotonateReverse()')
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(i)
        }

        return true

    }


    removeProtonFromWater() {

        const water_oxygen_index = this.reaction.MoleculeAI.findWaterOxygenIndex()
        water_oxygen_index.should.be.greaterThan(-1)

        this.reaction.container_substrate[0][1][water_oxygen_index][0].should.be.equal("O")

        this.reaction.container_substrate[0][1] = this.reaction.removeProtonFromAtom(this.reaction.MoleculeAI, this.reaction.container_substrate[0][1], water_oxygen_index)


        this.reaction.setMoleculeAI()

        this.reaction.addProtonToReagent()
        this.reaction.setReagentAI()

        return true

    }

    addProtonFromReagentToHydroxylGroupReverse() {


        const water_oxygen_index = this.reaction.MoleculeAI.findWaterOxygenIndex()

        //console.log(VMolecule(this.reaction.container_substrate).compressed())
        //console.log("ProtonationAI addProtonFromReagentToHydroxylGroupReverse() water oxygen index:" + water_oxygen_index)

        if (water_oxygen_index === -1) {
            return false
        }

        this.reaction.container_substrate[0][1] = this.reaction.removeProtonFromAtom(this.reaction.MoleculeAI, this.reaction.container_substrate[0][1], water_oxygen_index)


        this.reaction.setMoleculeAI()

        this.reaction.addProtonToReagent()
        this.reaction.setReagentAI()

        if (this.reaction.MoleculeAI.validateMolecule() === false) {
            console.log('ProtonationAI.js molecule is not valid (addProtonFromReagentToHydroxylGroupReverse())')
            console.log('Method: addProtonFromReagentToHydroxylGroupReverse()')
            console.log(VMolecule(this.container_substrate).compressed())
            console.log(i)
        }


     //  console.log(VMolecule(this.reaction.container_substrate).compressed())
       // console.log("ProtonationAI addProtonFromReagentToHydroxylGroupReverse() fin")
       //console.log(abc)


        return true

    }

    addProtonFromReagentToHydroxylGroup() {


        const proton_index = this.reaction.ReagentAI.findProtonIndex()

        proton_index.should.be.greaterThan(-1)

        const reagent_atoms = _.cloneDeep(this.reaction.container_reagent[0][1])

        const proton = CAtom(this.reaction.container_reagent[0][1][proton_index], proton_index, this.reaction.container_reagent)
        const reagent_atom_index = proton.indexedBonds("").pop().atom_index
        this.reaction.container_reagent[0][1][reagent_atom_index][4] = this.reaction.container_reagent[0][1][reagent_atom_index][4] === "+"?"":"-"
        this.reaction.removeProtonFromReagent(proton_index)
        this.reaction.container_reagent[0][1].length.should.not.equal(reagent_atoms.length)
        const hydroxylOxygenIndex = this.reaction.MoleculeAI.findHydroxylOxygenIndex()

        if (this.reaction.container_substrate[0][1][hydroxylOxygenIndex]===undefined) {
            console.log(hydroxylOxygenIndex)
            console.log(VMolecule(this.reaction.container_substrate).compressed())
            console.log(jjjg)
        }

        this.reaction.container_substrate[0][1][hydroxylOxygenIndex][0].should.be.equal("O")
        const substrate_atoms = _.cloneDeep(this.reaction.container_substrate[0][1])
        this.reaction.addProtonToSubstrate(this.reaction.container_substrate[0][1][hydroxylOxygenIndex], hydroxylOxygenIndex) // changes this.reaction.container_substrate

        this.reaction.container_substrate[0][1].length.should.not.equal(substrate_atoms.length)

        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()

    }


}

module.exports = ProtonationAI

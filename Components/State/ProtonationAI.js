const Reaction = require("../State/Reaction")
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../Stateless/Views/Molecule')
const _ = require('lodash');
const CAtom = require('../../Controllers/Atom')
const AtomFactory = require('../../Models/AtomFactory')
const should = require('should')
const Set = require('../../Models/Set')
const uniqid = require('uniqid');

// addProtonFromSubstrateToReagentBySubstrateAtomIndex(substrate_atom_index) - remove proton from specific substrate atom and
// add to reagent
// deprotonateCarbonReverse(DEBUG)
// protonateCarbocation()
// deprotonateCarbonyl()
// protonateCarbonyl()
// deprotonateOxygenOnDoubleBond()
// protonateOxygenOnDoubleBond()
// protonateReverse()
// deprotonateNitrogen()
// deprotonate()
// removeProtonFromWater()
// removeProtonFromOxygen()
// addProtonFromReagentToHydroxylGroup()
// addProtonFromReagentToHydroxylGroupReverse()
// deprotonateNitrogenReverse()
// removeProtonFromOxygenReverse
// findProtonIndexOnAtom(atom)
// removeProtonFromAtom(molecule_ai, molecule_atoms, atom_index)
// addProtonFromSubstrateToReagentBySubstrateAtomIndex(substrate_atom_index)
// removeProtonFromAtom(moleculeAI, molecule, atom_index)
// addProtonToReagent(index_of_reagent_atom_to_protonate )
// addProtonToSubstrate(target_atom, target_atom_index)
// transferProton(nucleophile_index=null, electrophile_index = null)

class ProtonationAI {

    constructor(reaction) {
        this.reaction = reaction
    }

    transferProton(nucleophile_index=null, electrophile_index = null) {

        // console.log("Reaction.js transferProton()")
        // console.log(VMolecule(this.container_substrate).compressed())

        // Get nucleophile  - this is the atom that is getting the proton
        if (nucleophile_index===null) {
            nucleophile_index = this.MoleculeAI.findNucleophileIndex() // eg [O-]
            if (nucleophile_index == -1) {
                return false
            }
        }

        // Get electrophile - this is the atom we are getting the proton from
        if (electrophile_index===null) {
            electrophile_index = this.MoleculeAI.findElectrophileIndex()
            if (electrophile_index === -1) {
                return false
            }
        }

        // Get proton from electrophile
        const electrophile_atom_object = CAtom(this.reaction.container_substrate[0][1][electrophile_index], electrophile_index, this.reaction.container_substrate)
        let proton_bond = null
        proton_bond = electrophile_atom_object.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === 'H'
        }).pop()

        if (proton_bond === undefined) {
            // Check if electrophile is attached to "R"
            let r_bonds = electrophile_atom_object.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === 'R'
            })
            if (r_bonds.length > 0) {
                // Create a proton and add it to the electrophile
                const proton = AtomFactory("H", "")
                const proton_electron = proton[proton.length-1]
                const electrophile_electron = electrophile_atom_object.freeElectrons()[0]
                proton.push(electrophile_electron)
                this.reaction.container_substrate[0][1][electrophile_index].push(proton_electron)
                this.reaction.container_substrate[0][1].push(proton)
            }
            proton_bond = electrophile_atom_object.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === 'H'
            }).pop()
        }

        // Remove electrons from proton
        const shared_electrons = proton_bond.shared_electrons
        this.reaction.container_substrate[0][1][proton_bond.atom_index] = Set().removeFromArray(
            this.reaction.container_substrate[0][1][proton_bond.atom_index],
            shared_electrons
        )

        // Add proton to nucleophile (eg [O-]
        const nucleophile_atom_object = CAtom(this.reaction.container_substrate[0][1][nucleophile_index], nucleophile_index, this.reaction.container_substrate)
        const n_free_electrons = nucleophile_atom_object.freeElectrons()

        if (n_free_electrons.length === 0) {
            return false
        }

        // Bond proton to nucleophile
        this.reaction.container_substrate[0][1][proton_bond.atom_index].push(n_free_electrons[0])
        this.reaction.container_substrate[0][1][proton_bond.atom_index].push(n_free_electrons[1])

    }

    deprotonateCarbonReverse(DEBUG){
        this.reaction.setMoleculeAI()
        const carbon_index = this.reaction.MoleculeAI.findIndexOfCarbonWithNegativeCharge(DEBUG)

        if (carbon_index===-1) {
            if (DEBUG) {
                console.log("ProtonationAI protonateCarbon -> carbon with negative charge not found")
            }
            return false
        }

        const target_atom = CAtom(this.reaction.container_substrate[0][1][carbon_index], carbon_index, this.reaction.container_substrate)

        if (this.addProtonToSubstrate(target_atom, carbon_index)) {
            if (this.reaction.container_reagent === null || this.reaction.container_reagent === "A") {
                this.reaction.container_reagent = "B"
            }
        } else {
            if (DEBUG) {
                console.log("ProtonationAI protonateCarbon ->failed adding proton to substrate")
            }
            return false
        }

        return true

    }

    removeProtonFromAtom(moleculeAI, molecule_atoms, atom_index) {
        const atom = CAtom(this.reaction.container_substrate[0][1][atom_index], atom_index, this.reaction.container_substrate)
        const proton_index = moleculeAI.findProtonIndexOnAtom(atom)
        if (proton_index !== -1) {
            const shared_electrons = Set().intersection(molecule_atoms[atom.atomIndex].slice(4), molecule_atoms[proton_index].slice(4))
            molecule_atoms[proton_index] = Set().removeFromArray(molecule_atoms[proton_index], shared_electrons)
        }

        molecule_atoms[atom_index][4] = molecule_atoms[atom_index][4] === "+"?"":"-"

        // Remove proton from container
        molecule_atoms.splice(proton_index, 1)

        return molecule_atoms
    }

    addProtonToReagent(index_of_reagent_atom_to_protonate ) {

        const atom_nucleophile_index = index_of_reagent_atom_to_protonate === undefined? this.reaction.ReagentAI.findNucleophileIndex() : index_of_reagent_atom_to_protonate

        if (atom_nucleophile_index  === -1) {
            return false
        }
        const reagent_atoms = _.cloneDeep(this.reaction.container_reagent[0][1])

        const proton = AtomFactory("H", 0)
        proton.pop()

        proton.length.should.be.equal(5)
        proton[0].should.be.equal('H')

        const free_electrons = CAtom(this.reaction.container_reagent[0][1][atom_nucleophile_index], atom_nucleophile_index, this.reaction.container_reagent).freeElectrons()

        if (free_electrons.length === 0) {
            return false
        }

        proton.push(free_electrons[0])
        proton.push(free_electrons[1])


        this.reaction.container_reagent[0][1][atom_nucleophile_index][4] =
            this.reaction.container_reagent[0][1][atom_nucleophile_index][4] === "-"
            || this.reaction.container_reagent[0][1][atom_nucleophile_index][4] < 0 ?0:"+"

        this.reaction.container_reagent[0][1].push(proton)

        this.reaction.container_reagent[0][1][atom_nucleophile_index][4] = 0

        this.reaction.container_reagent[0][1].length.should.not.equal(reagent_atoms.length)

        this.reaction.setReagentAI()

        return true

    }

    addProtonFromSubstrateToReagentBySubstrateAtomIndex(substrate_atom_index) {

        // Remove proton from substrate atom by substrate_atom_index
        this.reaction.container_substrate[0][1] = this.removeProtonFromAtom(this.reaction.MoleculeAI, this.reaction.container_substrate[0][1], substrate_atom_index)

        // Add proton to reagent
        this.addProtonToReagent()

        // console.log(VMolecule([ this.reaction.container_reagent[0], 1]).compressed())
        // process.error()

        this.reaction.setChargesOnSubstrate()
        this.reaction.setChargesOnReagent()
        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()

    }

    findProtonIndexOnAtom(atom) {
        const protons =  atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        })

        return protons.length > 0 ? protons.pop().atom_index: -1
    }

    removeProtonFromOxygen() {

        let oxygen = null
        let o_h_bonds = null
        let o_index = null


        // Look for [O+] with at least one hydrogen
        o_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{

            if (atom[0]!=="O") {
                return false
            }
            if (atom[4]!=="+") {
                return false
            }

            oxygen = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)

            o_h_bonds = oxygen.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "H"
            })

            return o_h_bonds.length > 0

        })

        if (o_index === -1) {
            return false
        }

        this.reaction.container_substrate[0][1][o_h_bonds[0].atom_index] = Set().removeFromArray(
            this.reaction.container_substrate[0][1][o_h_bonds[0].atom_index],
            o_h_bonds[0].shared_electrons
        )

        this.reaction.setChargeOnSubstrateAtom(o_index)

        this.reaction.container_substrate[0][1] = Set().removeFromArray(
            this.reaction.container_substrate[0][1],
            this.reaction.container_substrate[0][1][o_h_bonds[0].atom_index]
        )

        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()

        if (this.reaction.ReagentAI === null && this.reaction.container_reagent[0] !=="Brønsted–Lowry conjugate base") {
            this.reaction.container_reagent[0] = "Brønsted–Lowry acid"
        }
        this.reaction.MoleculeAI.validateMolecule()

        return true

    }



    removeProtonFromOxygenReverse() {

        let oxygen = null
        let o_h_bonds = null
        let o_index = null

        // Look for water leaving group
        // If found then return false as we always dehydrate the molecule first.
        const water_index = this.reaction.MoleculeAI.findWaterOxygenIndex()
        if (water_index !== -1) {
            return false
        }

        // Carbocation shift possible? If so do that first
        if (this.reaction.carbocationShiftReverse(true)) {
            return false
        }

        this.reaction.setReagentAI()

        if (this.reaction.ReagentAI === null) {
            // We are adding proton from reagent to substrate
            if (this.reaction.container_reagent[0] !=="Brønsted–Lowry acid") {
                return false
            }
        }

        // Look for [O-]
        o_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{

            if (atom[0]!=="O") {
                return false
            }
            if (atom[4]!=="-"){
                return false
            }

            oxygen = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)

            return oxygen.freeElectrons().length > 0

        })


        if (o_index === -1) {
            // Look for =O
            o_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{

                if (atom[0]!=="O") {
                    return false
                }
                if (atom[4]==="-" || atom[4] === "+"){
                    return false
                }

                oxygen = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)

                return oxygen.doubleBondCount() ===1 && oxygen.freeElectrons().length > 0

            })


        }

        if (o_index === -1) {
            return false
        }

        // "Re-add" the proton
        const proton = AtomFactory("H", "")
        proton.pop()
        const oxygen_free_electrons = oxygen.freeElectrons()
        proton.push(oxygen_free_electrons[0])
        proton.push(oxygen_free_electrons[1])
        this.reaction.container_substrate[0][1].push(proton)
        this.reaction.setChargeOnSubstrateAtom(o_index)


        this.reaction.setMoleculeAI()
        this.reaction.MoleculeAI.validateMolecule()

        // if (this.reaction.ReagentAI === null && this.reaction.container_reagent[0] !=="Brønsted–Lowry conjugate base") {
        if (this.reaction.ReagentAI === null && this.reaction.container_reagent[0] ==="Brønsted–Lowry acid") {
            this.reaction.container_reagent[0] = "Brønsted–Lowry conjugate base"
        }

        return true

    }


    protonateCarbocation() {


        //Explanation: A carbocation is an organic molecule, an intermediate, that forms as a result of the loss of two valence electrons, normally shared electrons, from a carbon atom that already has four bonds. This leads to the formation of a carbon atom bearing a positive charge and three bonds instead of four.
       // https://socratic.org/questions/how-is-carbocation-formed
        const carbocation_index = this.reaction.MoleculeAI.findCarbocationIndex() // electrophile
        if (carbocation_index === -1) {
            return false
        }
        const carbocation = CAtom(this.reaction.container_substrate[0][1][carbocation_index], carbocation_index, this.reaction.container_substrate)
        carbocation.indexedBonds("").length.should.be.equal(3)
        carbocation.freeElectrons("").length.should.be.equal(0)
        const nucleophile_index = this.reaction.ReagentAI.findNucleophileIndex()
      // console.log(VMolecule(this.reaction.container_reagent).compressed())
        // console.log(nucleophile_index)
        const nucleophile_atom =  CAtom(this.reaction.container_reagent[0][1][nucleophile_index], nucleophile_index, this.reaction.container_reagent)
        const proton_bonds = nucleophile_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        })
        if (proton_bonds.length === 0) {
            return false
        }


        // Add proton to substrate
        // After proton added carbocation will now have 8 electrons and 4 bonds
      // console.log(this.reaction.container_substrate[0][1][carbocation_index])
      // console.log(carbocation.freeElectrons().length)
        const proton = AtomFactory("H", "")
        proton.pop()
        const electrons = [uniqid(), uniqid()]
        this.reaction.container_substrate[0][1][carbocation_index].push(electrons[0])
        this.reaction.container_substrate[0][1][carbocation_index].push(electrons[1])
        proton.push(electrons[0])
        proton.push(electrons[1])
        this.reaction.container_substrate[0][1].push(proton)
        this.reaction.setChargeOnSubstrateAtom(carbocation_index)
        carbocation.freeElectrons("").length.should.be.equal(0)

        this.reaction.setMoleculeAI()

        // Remove proton from reagent
        _.remove(this.reaction.container_reagent[0][1], (atom, index)=>{
            return index === proton_bonds[0].atom_index
        })

     // console.log(VMolecule(this.reaction.container_substrate).compressed())
      // console.log(VMolecule(this.reaction.container_reagent).compressed())
        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()

        return true

    }

    protonateCarbocationReverse() {

        let carbon = null
        let c_h_bonds = null
        const c_index = this.reaction.MoleculeAI.findCarbocationIndexReverse()


        if (c_index === -1) {
            return false
        }


        carbon = CAtom(this.reaction.container_substrate[0][1][c_index], c_index, this.reaction.container_substrate)
        c_h_bonds = carbon.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        })

      // console.log(VMolecule(this.reaction.container_substrate).compressed())
      // console.log(c_index)

        // https://chemistry.stackexchange.com/questions/22032/how-does-a-carbocation-have-a-positive-charge
        // Formal Charge= (No.of valence electrons in unbonded state - no of lone pair electrons ) - (no. of bond pair electrons/2)
        // In this case the charge comes out to be (4-0) - (6/2) =+1
        // Remove c_h bond
        // We should end up with carbon with no lone pair electrons
        this.reaction.container_substrate[0][1][c_index] = Set().removeFromArray(
            this.reaction.container_substrate[0][1][c_index],
            c_h_bonds[0].shared_electrons
        )
        this.reaction.setChargeOnSubstrateAtom(c_index)


      //// console.log(this.reaction.container_substrate[0][1][c_index])
        //// console.log(cindex)

        // Add proton to reagent
      // console.log(VMolecule(this.reaction.container_reagent).compressed())
        const nucleophile_index = this.reaction.ReagentAI.findNucleophileIndex()


        if (nucleophile_index !== -1) {
            const nucleophile_atom = CAtom(this.reaction.container_reagent[0][1][nucleophile_index], nucleophile_index, this.reaction.container_reagent)
            const proton = AtomFactory("H")
            proton.pop()
          // console.log(nucleophile_index)
          // console.log(proton)
            const nucleophile_free_electrons = nucleophile_atom.freeElectrons()
          // console.log(nucleophile_free_electrons)

            proton.push(nucleophile_free_electrons[0])
            proton.push(nucleophile_free_electrons[1])
            this.reaction.container_reagent[0][1].push(proton)

            this.reaction.container_reagent[0][1][nucleophile_index][4] = "-"
        }

        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()

     //  console.log(VMolecule(this.reaction.container_reagent).compressed())
        //console.log(VMolecule(this.reaction.container_substrate).compressed())
      // console.log(nindex)
        //console.log(c_index)
        //console.log('protonateCarbocationReverse()');
        //console.log(cccc)



        return true
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

    protonateOxygenOnDoubleBond(carbonyl_oxygen_index, reagent, DEBUG) {

        // Find index of oxygen
        const oxygen_index = undefined !== carbonyl_oxygen_index? carbonyl_oxygen_index: this.reaction.MoleculeAI.findOxygenOnDoubleBondIndex()

        let reagent_proton_index = null
        let proton = null
        if (typeof reagent === "string") {
            if (reagent !== "A") {
                console.log("ProtonationAI protonateOxygenOnDoubleBond() -> Reagent must be acid (A)")
                process.exit()
            }
            proton = AtomFactory("H", 0)
            reagent = "CB"
        } else {
            reagent_proton_index = this.reaction.ReagentAI.findProtonIndex()
            const proton = _.cloneDeep(this.reaction.container_reagent[0][1][reagent_proton_index])

            // Remove proton from reagent
            const reagent_bonds = CAtom(this.reaction.container_reagent[0][1][reagent_proton_index], reagent_proton_index, this.reaction.container_reagent).indexedBonds("").filter(
                (bond) => {
                    return bond.atom[0] !== "H"
                }
            )

        }

        let free_slots = CAtom(this.reaction.container_substrate[0][1][oxygen_index], oxygen_index, this.reaction.container_substrate).freeSlots()
        if (free_slots > 0) {
            // Add proton
            this.reaction.container_substrate[0][1][oxygen_index].push(proton[proton.length-1])
            this.reaction.container_substrate[0][1][oxygen_index].push(proton[proton.length-2])
            this.reaction.container_substrate[0][1].push(proton)
            this.reaction.container_substrate[0][1][oxygen_index][4] = "+"
        }

        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()

        return true
    }

    protonateReverse() {

        //// console.log(VMolecule(this.container_substrate).compressed())
        //// console.log(VMolecule(this.container_reagent).compressed())

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
                this.reaction.container_substrate[0][1] = this.reaction.removeProtonFromAtom(this.reaction.MoleculeAI, this.reaction.container_substrate[0][1], water_oxygen_index)
                this.reaction.addProtonToReagent(o_index)
                return true
            }
        }
        return false
    }

    deprotonateNitrogen(nitrogen_index = null) {

        // nitrogen is the electrophile

        let electrophile = null
        let nitrogen_hydrogen_bonds = null

        if (typeof this.reaction.container_reagent === "string") {

        }
        // look for [N+]
        nitrogen_index = nitrogen_index !==null? nitrogen_index:_.findIndex(this.reaction.container_substrate[0][1], (atom, index) => {
            if (atom[0] !== "N") {
                return false
            }
            if (atom[4] !== "+") {
                return false
            }

            electrophile = CAtom(this.reaction.container_substrate[0][1][index], index, this.reaction.container_substrate)

            nitrogen_hydrogen_bonds = electrophile.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === 'H'
            })

            return nitrogen_hydrogen_bonds.length > 0
        })


        if (nitrogen_index === -1) {
            return false
        }

        if (typeof this.reaction.container_reagent === "string") {
            this.reaction.container_reagent = "CA"
        } else {

            const protonationAI = new ProtonationAI(this.reaction)

            protonationAI.addProtonToReagent()
            this.reaction.container_substrate[0][1].splice(nitrogen_index, 1)

        }

        return true


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
            ////// console.log("ProtatonAI 1111")
            // Charge should be set before calling this.addProtonToReagent()
            this.reaction.container_substrate[0][1][electrophile_index][4] = this.reaction.container_substrate[0][1][electrophile_index][4] === "+"? "" : "-"
            const r = this.reaction.addProtonToReagent()
            if (r === false) {
                return false
            }
            this.reaction.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)
        } else {

            // Check for carbons bonds
            ////// console.log("ProtonationAI 2222")

            const non_carbon_bond = electrophile_bonds.filter((bond) => {
                return bond.atom[0] !== "C" && bond.atom[0] !== "H"
            }).pop()

            if (non_carbon_bond !== undefined) {
                ////// console.log("Protonation AI3333")
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
              // console.log(VMolecule(this.reaction.container_substrate).compressed())
              // console.log(c_atom.indexedBonds("").length)
              // console.log(c_atom.bondCount())
              // console.log(electrophile_index)
              // console.log(this.reaction.container_substrate[0][1][electrophile_index])
              // console.log(protonremoved)
              // console.log(rew)
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
        ////// console.log("ProtonationAI deprotonate() after")
        ////// console.log(VMolecule(this.reaction.container_substrate).compressed())


        this.reaction.setReagentAI()
        this.reaction.setMoleculeAI(command_names, command_index, electrophile_index)

        return true


    }

    protonate() {

      // console.log(VMolecule(this.container_substrate).compressed())
      // console.log(y)

        let atom_nucleophile_index = this.reaction.MoleculeAI.findNucleophileIndex()
//      // console.log("ProtonationAI.js protonate(): " + atom_nucleophile_index)

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


    deprotonateNitrogenReverse() {

        this.reaction.MoleculeAI.validateMolecule()
        if (this.reaction.ReagentAI !== null) {
            this.reaction.ReagentAI.validateMolecule()
        }

        // return false if we have a [O-]
        if (_.findIndex(this.reaction.container_substrate[0][1], (atom, index)=> {
                if (atom[0] !== "O") {
                    return false
                }
                if (atom[4] !== "-") {
                    return false
                }
                return true
            }) !==-1){
            return false
        }

        let nitrogen = null
        let n_h_bonds = null


        let nitrogen_index = _.findIndex(this.reaction.container_substrate[0][1], (atom, index)=>{
            if (atom[0] !=="N") {
                return false
            }

            if (atom[4] === "+" || atom[4] === "-") {
                return false
            }

            return true

        })



        if (nitrogen_index === -1) {
            return false
        }

        nitrogen = CAtom(this.reaction.container_substrate[0][1][nitrogen_index], nitrogen_index, this.reaction.container_substrate)

        let proton = null
        const nitrogen_free_electrons = nitrogen.freeElectrons()


        if (this.reaction.ReagentAI === null) {

            if (this.reaction.container_reagent !==  "Brønsted–Lowry base") {
                //console.log(this.reaction.container_reagent)
                //console.log(ppppq)
                console.log("Warning: reagent is not a base ProtonationAI > deprotonateNitrogenReverse(), returning false")
                return false
            }
            //console.log(ppppk)
            proton = AtomFactory("H", "")
            proton.pop()
            proton.push(nitrogen_free_electrons[0])
            proton.push(nitrogen_free_electrons[1])

            //console.log(klk)
            //process.exit()

        } else {

            //console.log(iii)
            //process.exit()


            // NH4
            //let proton_atom_index = this.reaction.ReagentAI.findNucleophileIndex()
            let proton_atom_index = this.reaction.ReagentAI.findProtonIndex()


            if (proton_atom_index ===-1) {
                return false
            }

            if (this.reaction.container_reagent[0][1][proton_atom_index] === undefined) {
                console.log("Warning: atom is undefined (proton atom index = " + proton_atom_index + ")")
                console.log("Reagent:")
                console.log(this.reaction.container_reagent[0][1])
            }

            const proton_atom = CAtom(this.reaction.container_reagent[0][1][proton_atom_index], proton_atom_index, this.reaction.container_reagent)
            const proton_bonds = proton_atom.indexedBonds("").filter((bond) => {
                return bond.atom[0] === "H"
            })

            if (proton_bonds.length === 0) {
                return false
            }

            // Remove proton
            proton = this.removeProtonFromReagent(proton_bonds[0], proton_atom_index)
            // Add proton to nitrogen
            proton.pop()
            proton.pop()
            proton.push(nitrogen_free_electrons[0])
            proton.push(nitrogen_free_electrons[1])
            this.reaction.setReagentAI()
            this.reaction.ReagentAI.validateMolecule()

        }

        //console.log(hre)
        //process.exit()

        this.reaction.container_substrate[0][1].push(proton)
        this.reaction.setChargesOnSubstrate()
        this.reaction.setMoleculeAI()
        this.reaction.MoleculeAI.validateMolecule()



        return true

    }

    removeProtonFromReagent(proton_bond, proton_atom_index) {

        this.reaction.setReagentAI()
        this.reaction.ReagentAI.validateMolecule()

        // console.log(VMolecule(this.reaction.container_reagent).compressed())
        const shared_electrons = this.reaction.container_reagent[0][1][proton_bond.atom_index].slice(5)
        const proton = _.cloneDeep(this.reaction.container_reagent[0][1][proton_bond.atom_index])
        this.reaction.container_reagent[0][1][proton_atom_index] = Set().removeFromArray(
            this.reaction.container_reagent[0][1][proton_atom_index],
            shared_electrons
        )
        this.reaction.container_reagent[0][1][proton_atom_index].push(uniqid())
        this.reaction.container_reagent[0][1][proton_atom_index].push(uniqid())
        _.remove(this.reaction.container_reagent[0][1], (atom,index)=>{
            return index === proton_bond.atom_index
        })

        this.reaction.setChargesOnReagent()

       // console.log(VMolecule(this.reaction.container_reagent).compressed())

        this.reaction.setReagentAI()
        this.reaction.ReagentAI.validateMolecule()

        return proton

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


        const water_oxygen_index = this.reaction.MoleculeAI.findHydroxylOxygenIndex()

        console.log(VMolecule(this.reaction.container_substrate).formatted())
        ////// console.log("ProtonationAI addProtonFromReagentToHydroxylGroupReverse() water oxygen index:" + water_oxygen_index)

        console.log(water_oxygen_index)
        console.log(lll)
        if (water_oxygen_index === -1) {
            return false
        }

        this.reaction.container_substrate[0][1] = this.reaction.removeProtonFromAtom(this.reaction.MoleculeAI, this.reaction.container_substrate[0][1], water_oxygen_index)

        this.reaction.setChargesOnSubstrate()
        this.reaction.setMoleculeAI()

        if (this.reaction.ReagentAI === null) {
            if (this.reaction.container_reagent[0]==="Brønsted–Lowry conjugate base") {
                this.reaction.container_reagent[0]="Brønsted–Lowry acid"
            } else {
                return false
            }
        } else {
            this.reaction.addProtonToReagent()
            this.reaction.setChargesOnReagent()
            this.reaction.setReagentAI()
            this.reaction.ReagentAI.validateMolecule()
        }

        this.reaction.MoleculeAI.validateMolecule()


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
          // console.log(hydroxylOxygenIndex)
          // console.log(VMolecule(this.reaction.container_substrate).compressed())
          // console.log(jjjg)
        }

        this.reaction.container_substrate[0][1][hydroxylOxygenIndex][0].should.be.equal("O")
        const substrate_atoms = _.cloneDeep(this.reaction.container_substrate[0][1])
        this.addProtonToSubstrate(this.reaction.container_substrate[0][1][hydroxylOxygenIndex], hydroxylOxygenIndex) // changes this.reaction.container_substrate

        this.reaction.container_substrate[0][1].length.should.not.equal(substrate_atoms.length)

        VMolecule([this.reaction.container_substrate[0], 1]).JSON().atoms[hydroxylOxygenIndex].hydrogens.length.should.be.equal(2)

        this.reaction.setChargesOnSubstrate()
        this.reaction.setMoleculeAI()
        this.reaction.setReagentAI()

    }

    addProtonToSubstrate(target_atom, target_atom_index) {
        const proton = AtomFactory("H")
        proton.pop()

        const free_electrons = target_atom.freeElectrons()

        if (free_electrons.length > 1) {
            proton.push(free_electrons[0])
            proton.push(free_electrons[1])
            this.reaction.container_substrate[0][1].push(proton)
        }

        return true
    }


}

module.exports = ProtonationAI

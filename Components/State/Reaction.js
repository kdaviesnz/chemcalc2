
const CAtom = require('../../Controllers/Atom')
const _ = require('lodash');
const VMolecule = require('../../Views/Molecule')
const MoleculeFactory = require('../../Models/MoleculeFactory')
const AtomFactory = require('../../Models/AtomFactory')

class Reaction {

    constructor(container_substrate, container_reagent) {

        container_substrate.length.should.be.equal(2) // molecule, units
        container_substrate[0].length.should.be.equal(2) // pKa, atoms
        container_substrate[0][0].should.be.an.Number() // pka
        container_substrate[0][1].should.be.an.Array()
        container_substrate[0][1][0].should.be.an.Array()
        container_substrate[0][1][0][0].should.be.an.String()


        container_reagent.length.should.be.equal(2) // molecule, units
        container_reagent[0].length.should.be.equal(2) // pKa, atoms
        container_reagent[0][0].should.be.an.Number() // pka
        container_reagent[0][1].should.be.an.Array()
        container_reagent[0][1][0].should.be.an.Array()
        container_reagent[0][1][0][0].should.be.an.String()

        this.container_substrate = container_substrate
        this.container_reagent = container_reagent

        this.setMoleculeAI()
        this.setReagentAI()
    }

    setReagentAI() {
        this.container_reagent.length.should.be.equal(2) // molecule, units
        this.container_reagent[0].length.should.be.equal(2) // pKa, atoms
        this.container_reagent[0][0].should.be.an.Number() // pka
        this.container_reagent[0][1].should.be.an.Array()
        this.container_reagent[0][1][0].should.be.an.Array()
        this.container_reagent[0][1][0][0].should.be.an.String()
        this.ReagentAI = require("../Stateless/MoleculeAI")(this.container_reagent)
    }

    setMoleculeAI() {

        this.container_substrate.length.should.be.equal(2) // molecule, units
        this.container_substrate[0].length.should.be.equal(2) // pKa, atoms
        this.container_substrate[0][0].should.be.an.Number() // pka
        this.container_substrate[0][1].should.be.an.Array()
        this.container_substrate[0][1][0].should.be.an.Array()
        this.container_substrate[0][1][0][0].should.be.an.String()

        this.MoleculeAI = require("../Stateless/MoleculeAI")(this.container_substrate)
    }

    hydrate() {
        const water_molecule = MoleculeFactory("O")
        this.container_reagent = [water_molecule,1]
        this.setReagentAI()
        const water_ai = require("../Stateless/MoleculeAI")([water_molecule,1])
        const water_oxygen_index = water_ai.findWaterOxygenIndex()
        const electrons = CAtom(water_molecule[1][water_oxygen_index],
                                water_oxygen_index,
                                [water_molecule,1]).freeElectrons()
        electrons.length.should.be.greaterThan(1)
        const electrophile_index = this.MoleculeAI.findElectrophileIndex()

        electrophile_index.should.not.be.equal(-1)

        this.container_substrate[0][1][electrophile_index].push(electrons[0])
        this.container_substrate[0][1][electrophile_index].push(electrons[1])    
        this.container_substrate[0][1][electrophile_index][4] = 0

        this.container_substrate[0][1].push(water_molecule[1][0])
        this.container_substrate[0][1].push(water_molecule[1][1])
        this.container_substrate[0][1].push(water_molecule[1][2])

        this.setMoleculeAI()

        // Check we have a water molecule attached to main molecule
        this.MoleculeAI.findWaterOxygenIndex().should.be.greaterThan(-1)

    }
    
    dehydrate() {

        const atoms = this.container_substrate[0][1]

        atoms.map((oxygen_atom, oxygen_atom_index)=>{

            if (oxygen_atom[0] !== "O") {
                return false
            }
            const catom = CAtom(oxygen_atom, oxygen_atom_index, this.container_substrate)
            if(catom.bondCount()!==3) { // 2 hydrogens plus atom oxygen is bonded to
                return false
            }

            const indexed_bonds = catom.indexedBonds("")

            // Check we have two hydrogens and each hydrogen is only bonded to the oxygen atom
            const hydrogen_bonds = indexed_bonds.filter((bond) => {
                    if (bond.atom[0] !== "H") {
                        return false
                    }
                    const hydrogen_atom = CAtom(bond.atom, bond.atom_index, this.container_substrate)
                    if (hydrogen_atom.bondCount() !== 1) {
                        return false
                    }
                    return true
                }
            )

            const hydrogens = hydrogen_bonds.map((hydrogen_bond)=>{
                return hydrogen_bond.atom
            })

            if (hydrogens.length !== 2) {
                return false
            }

            // Get the bond that is NOT and oxygen - hydrogen bond
            const non_hydrogen_bond = indexed_bonds.filter((bond) => {
                    return bond.atom[0] !== "H"
                }
            ).pop()

            // Break the non_hydrogen bond
            const shared_electrons = non_hydrogen_bond.shared_electrons
            if (shared_electrons.length !==2 ) {
                return false
            }

            // Remove electrons from non hydrogen atom
            const number_of_electrons_at_start = _.cloneDeep(this.container_substrate[0][1][non_hydrogen_bond.atom_index]).slice(5).length
            _.remove(this.container_substrate[0][1][non_hydrogen_bond.atom_index], (v, i)=> {
                return shared_electrons[1] === v || shared_electrons[0] === v
            })
            _.cloneDeep(this.container_substrate[0][1][non_hydrogen_bond.atom_index]).slice(5).length.should.be.equal(number_of_electrons_at_start - 2)

            const number_of_atoms_at_start = _.cloneDeep(this.container_substrate[0][1]).length
            _.remove(this.container_substrate[0][1], (v,i) => {
                return i === oxygen_atom_index || i === hydrogen_bonds[0].atom_index || i === hydrogen_bonds[1].atom_index
            })
            _.cloneDeep(this.container_substrate[0][1]).length.should.be.equal(number_of_atoms_at_start - 3)

            this.container_substrate[0][1][non_hydrogen_bond.atom_index][4] = '+'

            this.setMoleculeAI()


        })


    }
    
    breakBond(source_atom_index, target_atom_index) {
        
        const atoms = this.container_substrate[0][1]

        const source_atom = CAtom(this.container_substrate[0][1][source_atom_index], source_atom_index, this.container_substrate)
        const target_atom = CAtom(this.container_reagent[0][1][target_atom_index], target_atom_index, this.reagent)
             
        
        const molecules = []

        const shared_electrons = source_atom.sharedElectrons(target_atom)

        // Remove electron from source atom
        _.remove(this.container_substrate[0][1][source_atom_index], (v, i)=> {
                return shared_electrons[0] === v 
        })
        
        // Remove electron from target atom
         _.remove(this.container_substrate[0][1][target_atom_index], (v, i)=> {
                return shared_electrons[1] === v 
        })
 
        if (this.container_substrate[0][1][source_atom_index][0] === "+") {

            this.container_substrate[0][1][atom_index][4] = 0
            
        }

        this.setMoleculeAI()
        
        
        // @todo work out if we now have two molecules

            
        
    }
    
    bondAtoms(source_atom_index, target_atom_index) {
        const source_free_electrons = CAtom(this.container_substrate[0][1][source_atom_index], source_atom_index, this.container_substrate).freeElectrons()
        const target_free_electrons = CAtom(this.reagent[0][1][target_atom_index], target_atom_index, this.reagent).freeElectrons()
             
        if (source_free_electrons.length > 1 && target_free_electrons.length > 1) {
            this.reagent.push(source_free_electrons[0])
            this.container_substrate.push(target_free_electrons[1])          
        }

        this.setMoleculeAI()
    }

    addProtonToSubstrate(target_atom, target_atom_index) {
        const proton = AtomFactory("H")
        proton.pop()
        const free_electrons = CAtom(target_atom, target_atom_index, this.container_substrate).freeElectrons()
        if (free_electrons.length > 1) {
            proton.push(free_electrons[0])
            proton.push(free_electrons[1])
            this.container_substrate[0][1].push(proton)
            this.container_substrate[0][1][target_atom_index][4] = "+"
        }
        this.setMoleculeAI()
    }
    
    removeProton() {
        // [C+]CH3
        // We remove the proton from the second carbon
        const electrophile_index = this.MoleculeAI.findElectrophileIndex()
        const electrophile = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)
        const electrophile_bonds  = electrophile.indexedBonds("")

        const hydrogen_bond = electrophile_bonds.filter((bond)=>{
            return bond.atom[0] === 'H'
        }).pop()


        if (this.container_substrate[0][1][electrophile_index][0]!== "C"){
            
            this.addProtonToReagent()  
                this.container_substrate[0][1][electrophile_index][4] = 0
                this.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)
            
        } else {

            // Check for carbons bonds
            const carbon_bond = electrophile_bonds.filter((bond)=>{
                return bond.atom[0] === "C"
            }).pop()

            if (undefined === carbon_bond) {
                
                this.addProtonToReagent()  
                this.container_substrate[0][1][electrophile_index][4] = 0
                this.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)
                
            } else {

                // Change bond to double bond
                const shared_electrons = hydrogen_bond.shared_electrons
                this.container_substrate[0][1][electrophile_index].push(shared_electrons[0])
                this.container_substrate[0][1][electrophile_index].push(shared_electrons[1])


                // Remove proton bonded to second carbon
                const carbon_hydrogen_bond = CAtom(carbon_bond.atom,
                                                  carbon_bond.atom_index,
                                                   this.container_substrate).indexedBonds("")
                                                   .filter((bond)=>{
                        return bond.atom[0] === 'H'
                }).pop()
                
                this.addProtonToReagent()  
                this.container_substrate[0][1][electrophile_index][4] = 0
                this.container_substrate[0][1].splice(carbon_hydrogen_bond.atom_index, 1)
                
            }
        }

        this.setReagentAI()
        this.setMoleculeAI()
    }

    removeProtonFromReagent(proton_index) {
        proton_index.should.be.greaterThan(-1)
        this.container_reagent[0][1].splice(proton_index, 1)
        this.setReagentAI()
    }

    addProton() {

        let atom_nucleophile_index = this.MoleculeAI.findNucleophileIndex()

        if (atom_nucleophile_index === -1 && !this.MoleculeAI.isWater()) {
            // try carbon atom
            atom_nucleophile_index = _.findIndex(_.cloneDeep(this.container_substrate[0][1]), (atom)=>{
                return atom[0] === "C"
            })
        }
        atom_nucleophile_index.should.be.an.Number()
        atom_nucleophile_index.should.be.greaterThan(-1)

        const atoms = _.cloneDeep(this.container_substrate[0][1])

        const proton = AtomFactory("H", 0)
        proton.pop()

        proton.length.should.be.equal(5)
        proton[0].should.be.equal('H')

        const free_electrons = CAtom(this.container_substrate[0][1][atom_nucleophile_index], atom_nucleophile_index, this.container_substrate).freeElectrons()
        free_electrons.length.should.be.greaterThan(1)

        proton.push(free_electrons[0])
        proton.push(free_electrons[1])
        this.container_substrate[0][1].push(proton)

        this.container_substrate[0][1][atom_nucleophile_index][4] = "+"

        this.container_substrate[0][1].length.should.not.equal(atoms.length)

        this.setMoleculeAI()


    }


    addProtonToReagent( ) {

        const atom_nucleophile_index = this.ReagentAI.findNucleophileIndex()

        atom_nucleophile_index.should.not.be.equal(-1)

        const reagent_atoms = _.cloneDeep(this.container_reagent[0][1])
        
        const proton = AtomFactory("H", 0)
        proton.pop()

        proton.length.should.be.equal(5)
        proton[0].should.be.equal('H')

        const free_electrons = CAtom(this.container_reagent[0][1][atom_nucleophile_index], atom_nucleophile_index, this.container_reagent).freeElectrons()
        free_electrons.length.should.be.greaterThan(1)

        proton.push(free_electrons[0])
        proton.push(free_electrons[1])
        this.container_reagent[0][1].push(proton)

        this.container_reagent[0][1].length.should.not.equal(reagent_atoms.length)

        this.container_reagent[0][1][atom_nucleophile_index][4] = 0

        this.setReagentAI()
        

    }

    removeProtonFromWater() {

        const water_oxygen_index = this.MoleculeAI.findWaterOxygenIndex()
        water_oxygen_index.should.be.greaterThan(-1)
        this.container_substrate[0][1][water_oxygen_index][0].should.be.equal("O")
        const oxygen_proton_bond = CAtom(this.container_substrate[0][1][water_oxygen_index],
                                    water_oxygen_index,
                                    this.container_substrate).indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        }).pop()

        this.container_substrate[0][1][water_oxygen_index][4] = 0
        this.container_substrate[0][1].splice(oxygen_proton_bond.bond_index, 1)

        this.addProtonToReagent()

        this.setMoleculeAI()
        this.setReagentAI()


    }

    addProtonFromReagentToHydroxylGroup() {

        const proton_index = this.ReagentAI.findProtonIndex()
        proton_index.should.be.greaterThan(-1)
        const reagent_atoms = _.cloneDeep(this.container_reagent[0][1])
        this.removeProtonFromReagent(proton_index)
        this.container_reagent[0][1].length.should.not.equal(reagent_atoms.length)
        const hydroxylOxygenIndex = this.MoleculeAI.findHydroxylOxygenIndex()

        this.container_substrate[0][1][hydroxylOxygenIndex][0].should.be.equal("O")
        const substrate_atoms = _.cloneDeep(this.container_substrate[0][1])
        this.addProtonToSubstrate(this.container_substrate[0][1][hydroxylOxygenIndex], hydroxylOxygenIndex) // changes this.container_substrate

        this.container_substrate[0][1].length.should.not.equal(substrate_atoms.length)

        this.setMoleculeAI()

    }


}

module.exports = Reaction

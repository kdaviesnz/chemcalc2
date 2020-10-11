
const CAtom = require('../../Controllers/Atom')
const _ = require('lodash');
const VMolecule = require('../../Views/Molecule')

class Reaction {

    constructor(container_substrate, container_reagent) {

        container_substrate.length.should.be.equal(2) // molecule, units
        container_substrate[0].length.should.be.equal(2) // pKa, atoms

        container_reagent.length.should.be.equal(2) // molecule, units
        container_reagent[0].length.should.be.equal(2) // pKa, atoms

        this.container_substrate = container_substrate
        this.container_reagent = container_reagent

        this.ReagentAI = require("../Stateless/MoleculeAI")(container_reagent)
        this.MoleculeAI = require("../Stateless/MoleculeAI")(container_substrate)

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
        
        
        
        // @todo work out if we now have two molecules

            
        
    }
    
    bondAtoms(source_atom_index, target_atom_index) {
        const source_free_electrons = CAtom(this.container_substrate[0][1][source_atom_index], source_atom_index, this.container_substrate).freeElectrons()
        const target_free_electrons = CAtom(this.reagent[0][1][target_atom_index], target_atom_index, this.reagent).freeElectrons()
             
        if (source_free_electrons.length > 1 && target_free_electrons.length > 1) {
            this.reagent.push(source_free_electrons[0])
            this.container_substrate.push(target_free_electrons[1])          
        }
    }

    addProtonToSubstrate(target_atom, target_atom_index, proton) {
        const free_electrons = CAtom(target_atom, target_atom_index, this.container_substrate).freeElectrons()
        if (free_electrons.length > 1) {
            proton.push(free_electrons[0])
            proton.push(free_electrons[1])
            this.container_substrate[0][1].push(proton)
            this.container_substrate[0][1][target_atom_index][4] = "+"
        }
    }
    
    removeProton(proton_index) {
        // [C+]CH3
        // We remove the proton from the second carbon
        const proton = CAtom(this.container_substrate[0][1][proton_index], proton_index, this.container_substrate)
        const bonds  = proton.indexedBonds("")
        if (bonds[0].atom[0] === "C") {
            const carbon_bonds = CAtom(this.container_substrate[0][1][bonds[0].atom_index], bonds[0].atom_index, this.container_substrate).indexedBonds("")
            
            // look for carbon carbon bond
            carbon_bonds.map((bond)=>{
                if (bond.atom[0]==="C") {
                    // add electrons shared with the proton to the carbon atom to form a double bond
                    container_substrate[0][1][bond.atom_index].push(bonds[0].shared_electrons[0])
                    container_substrate[0][1][bond.atom_index].push(bonds[0].shared_electrons[1])
                    container_substrate[0][1][bond.atom_index][4] = 0                                                
                }
            })
            
            
        }
        container_substrate[0][1][bonds[0].atom_index][4] = 0
                
         // Add proton to reagent       
         addProtonToReagent()       
        // Remove the proton         
        this.container_substrate[0][1].splice(proton_index, 1)
    }

    removeProtonFromReagent(proton_index) {
        this.container_reagent[0][1].splice(proton_index, 1)
    }
            
    addProtonToReagent( ) {

        const atom_index = this.ReagentAI.findNucleophileIndex()
        const reagent_atoms = _.cloneDeep(this.container_reagent[0][1])
        
        const proton = MoleculeFactory("H")
        const free_electrons = CAtom(this.container_reagent[0][1][atom_index], atom_index, this.container_reagent)
        proton.push(free_electrons[0])
        proton.push(free_electrons[1])
        this.container_reagent[0][1].push(proton)
        this.container_reagent[0][1].length.should.not.equal(reagent_atoms.length)
        

    }

    removeProtonFromWater() {

        const water_oxygen_index = this.MoleculeAI.findWaterOxygenIndex()

        proton[0].should.be.equal("H")
        const reagent_atoms = _.cloneDeep(this.container_reagent[0][1])
        this.removeProtonFromReagent(proton_index)
        this.container_reagent[0][1].length.should.not.equal(reagent_atoms.length)
        const hydroxylOxygenIndex = this.MoleculeAI.findHydroxylOxygenIndex()

        this.container_substrate[0][1][hydroxylOxygenIndex][0].should.be.equal("O")
        const substrate_atoms = _.cloneDeep(this.container_substrate[0][1])
        this.addProtonToSubstrate(this.container_substrate[0][1][hydroxylOxygenIndex], hydroxylOxygenIndex, proton) // changes this.container_substrate

        this.container_substrate[0][1].length.should.not.equal(substrate_atoms.length)


    }

    addProtonFromReagentToHydroxylGroup() {

        const proton_index = this.ReagentAI.findProtonIndex()
        const proton = this.container_reagent[0][1][proton_index]
        proton[0].should.be.equal("H")
        const reagent_atoms = _.cloneDeep(this.container_reagent[0][1])
        this.removeProtonFromReagent(proton_index)
        this.container_reagent[0][1].length.should.not.equal(reagent_atoms.length)
        const hydroxylOxygenIndex = this.MoleculeAI.findHydroxylOxygenIndex()

        this.container_substrate[0][1][hydroxylOxygenIndex][0].should.be.equal("O")
        const substrate_atoms = _.cloneDeep(this.container_substrate[0][1])
        this.addProtonToSubstrate(this.container_substrate[0][1][hydroxylOxygenIndex], hydroxylOxygenIndex, proton) // changes this.container_substrate

        this.container_substrate[0][1].length.should.not.equal(substrate_atoms.length)


    }


}

module.exports = Reaction

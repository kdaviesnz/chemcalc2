
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

    removeProtonFromReagent(proton_index) {
        this.container_reagent[0][1].splice(proton_index, 1)
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

//        console.log(VMolecule(this.container_substrate).canonicalSMILES())

  //      console.log("Reaction.js")

    //    process.exit()


    }


}

module.exports = Reaction


const CAtom = require('../Controllers/Atom')
const _ = require('lodash');

class Reaction {

    constructor(mmolecule, reagent) {

        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms

        reagent.length.should.be.equal(2) // molecule, units
        reagent[0].length.should.be.equal(2) // pKa, atoms

        this.mmolecule = mmolecule
        this.reagent = reagent

        this.reagentAI = require("../Stateless/MoleculeAI")(reagent)
        this.moleculeAI = require("../Stateless/MoleculeAI")(mmolecule)

    }
    
    breakBond(source_atom_index, target_atom_index) {
        
        const atoms = mmolecule[0][1]

        const source_atom = CAtom(this.mmolecule[0][1][source_atom_index], source_atom_index, this.mmolecule)
        const target_atom = CAtom(this.reagent[0][1][target_atom_index], target_atom_index, this.reagent)
             
        
        const molecules = []

        
        



        const shared_electrons = source_atom.sharedElectrons(target_atom)

        // Remove electron from source atom
        _.remove(this.mmolecule[0][1][source_atom_index], (v, i)=> {
                return shared_electrons[0] === v 
        })
        
        // Remove electron from target atom
         _.remove(this.reagent[0][1][target_atom_index], (v, i)=> {
                return shared_electrons[1] === v 
        })
 
        if (this.mmolecule[0][1][source_atom_index][0] === "+") {

            this.mmoleculemmolecule[0][1][atom_index][4] = 0
            
        }

            
        
    }
    
    bondAtoms(source_atom_index, target_atom_index) {
        const source_free_electrons = CAtom(this.mmolecule[0][1][source_atom_index], source_atom_index, this.mmolecule).freeElectrons()
        const target_free_electrons = CAtom(this.reagent[0][1][target_atom_index], target_atom_index, this.reagent).freeElectrons()
             
        if (source_free_electrons.length > 1 && target_free_electrons.length > 1) {
            this.reagent.push(source_free_electrons[0])
            this.mmolecule.push(target_free_electrons[1])          
        }
    }

    addProtonToSubstrate(target_atom, target_atom_index, proton) {
        const free_electrons = CAtom(target_atom, target_atom_index, this.mmolecule).freeElectrons()
        if (free_electrons.length > 1) {
            proton.push(free_electrons[0])
            proton.push(free_electrons[1])
            this.mmolecule[0][1].push(proton)
        }
    }

    removeProtonFromReagent(proton_index) {
        this.reagent[0][1].splice(proton_index, 1)
    }

    addProtonFromReagentToHydroxylGroup() {

        const proton_index = this.reagentAI.findProtonIndex()
        const proton = this.reagent[0][1][proton_index]
        this.removeProtonFromReagent(proton_index)
        const hydroxylOxygenIndex = Molecule.findHydroxylOxygenIndex()
        addProtonToSubstrate(this.mmolecule[0][1][hydroxylOxygenIndex], hydroxylOxygenIndex, proton) // changes this.mmolecule

    }


}

module.exports = Reaction

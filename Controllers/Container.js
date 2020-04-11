//  CONTAINER CONTROLLER
const CMolecule = require('./Controllers/Molecule')

class CContainer {

    // container is a container model
    constructor(container) {
        this.container = container
    }
   
    add(molecule_array_or_string, units) {
        const molecule =  (typeof molecule_array_or_string === "array"? 
                           molecule_array_or_string:
                           MoleculeFactory(molecule_array_or_string)) 
        this.container.push(molecule)
        // First element is pKa value,
        // container[1] is reagent
        // container[2] is substrate
        if (this.container.length > 2) {            
            // acid base
            if (this.container[1].indexOf("H") !== false && this.container[2].indexOf("H") === false) {
                
               
                const proton_index = CMolecule(this.container[1]).indexOf("H")
                CMolecule.remove(CMolecule(this.container[1]).itemAt(proton_index)) // remove proton
       
                this.container[2] = CMolecule(this.container[2]).push("H")
                
            } else if (this.container[1].indexOf("H") === false && this.container[2].indexOf("H") !== false) {
                const proton_index = CMolecule(this.container[2]).indexOf("H")
                CMolecule.remove(CMolecule(this.container[2]).itemAt(proton_index)) // remove proton
                
                this.container[1] = CMolecule(this.container[1]).push("H")
                
            } else if (this.container[1].indexOf("H") !== false && this.container[2].indexOf("H") !== false) {
                
                
                 // HCl + H2O <-> Cl- + H3O+
                 // CC(=O)O (C2H4O2, acetic acid) + water (water is base and accepts proton)
                
                // First element is pKa value
                if (this.container[1][0] < this.container[2][0]) {
                    const proton_index = CMolecule(this.container[1]).indexOf("H")
                    CMolecule.remove(CMolecule(this.container[1]).itemAt(proton_index)) // remove proton
                    
                    CMolecule(this.container[2]).push("H")
                    
                } else {
                    const proton_index = CMolecule(this.container[2]).indexOf("H")
                    CMolecule.remove(CMolecule(this.container[2]).itemAt(proton_index)) // remove proton
                    
                    CMolecule(this.container[1]).push("H")
                    
                }
            } else {
                
            }
        }
    },
    
    remove() {
    
    }
}

module.exports = CContainer

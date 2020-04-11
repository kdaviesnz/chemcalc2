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
                           CMolecule(molecule_array_or_string)) 
        this.container.push(molecule)
        // First element is pKa value,
        // container[1] is reagent
        // container[2] is substrate
        if (this.container.length > 2) {            
            // acid base
            if (this.container[1].indexOf("H") !== false && this.container[2].indexOf("H") === false) {
                const proton_index = CMolecule(this.container[1]).indexOf("H")
                delete(CMolecule(this.container[1]).itemAt(proton_index)) // remove proton
                CMolecule(this.container[1]).itemAt(proton_index) += "-" // atom proton was bonded to
                this.container[2] = CMolecule(this.container[2]).push("H")
                CMolecule(this.container[2]).itemAt(this.container[2].length-2) += "+"
            } else if (this.container[1].indexOf("H") === false && this.container[2].indexOf("H") !== false) {
                const proton_index = CMolecule(this.container[2]).indexOf("H")
                delete(CMolecule(this.container[2]).itemAt(proton_index)) // remove proton
                CMolecule(this.container[2]).itemAt(proton_index) += "-" // atom proton was bonded to
                this.container[1] = CMolecule(this.container[1]).push("H")
                CMolecule(this.container[1]).itemAt(this.container[2].length-2) += "+"
            } else if (this.container[1].indexOf("H") !== false && this.container[2].indexOf("H") !== false) {
                // First element is pKa value
                if (this.container[1][0] < this.container[2][0]) {
                    const proton_index = CMolecule(this.container[1]).indexOf("H")
                    delete(CMolecule(this.container[1]).itemAt(proton_index)) // remove proton
                    CMolecule(this.container[1]).itemAt(proton_index) += "-" // atom proton was bonded to
                    CMolecule(this.container[2]).push("H")
                    CMolecule(this.container[2]).itemAt(reagent.length-2) += "+"
                } else {
                    const proton_index = CMolecule(this.container[2]).indexOf("H")
                    delete(CMolecule(this.container[2]).itemAt(proton_index)) // remove proton
                    CMolecule(this.container[2]).itemAt(proton_index) += "-" // atom proton was bonded to
                    CMolecule(this.container[1]).push("H")
                    CMolecule(this.container[1]).itemAt(this.container[1].length-2) += "+"
                }
            } else {
                
            }
        }
    },
    
    remove() {
    
    }
}

module.exports = CContainer

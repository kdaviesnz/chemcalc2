//  CONTAINER CONTROLLER
class CContainer {
    // container is a container model
    constructor(container) {
        this.container = container
    },
   
    add(molecule_array_or_string, units) {
        const molecule =  (typeof molecule_array_or_string === "array"? molecule_array_or_string:todo) 
        this.container.push(molecule)
        // First element is pKa value,
        // container[1] is reagent
        // container[2] is substrate
        if (this.container.length > 2) {            
            // acid base
            if (this.container[1].indexOf("H") !== false && container[2].indexOf("H") === false) {
                const proton_index = CMolecule(container[1]).indexOf("H")
                delete(container[1][proton_index]) // remove proton
                container[1][proton_index] += "-" // atom proton was bonded to
                container[2] = CMolecule(container[2]).push("H")
                container[2][container[2].length-2] += "+" 
            } else if (this.container[1].indexOf("H") === false && container[2].indexOf("H") !== false) {
                const proton_index = CMolecule(container[2]).indexOf("H")
                delete(container[2][proton_index]) // remove proton
                container[2][proton_index] += "-" // atom proton was bonded to
                container[1] = CMolecule(container[1]).push("H")
                container[1][container[2].length-2] += "+" 
            } else if (container[1].indexOf("H") !== false && container[2].indexOf("H") !== false) {
                // First element is pKa value
                if (container[1][0] < container[2][0]) {
                    const proton_index = CMolecule(container[1]).indexOf("H")
                    delete(container[1][proton_index]) // remove proton
                    container[1][proton_index] += "-" // atom proton was bonded to
                    CMolecule(container[2]).push("H")
                    container[2][reagent.length-2] += "+" 
                } else {
                    const proton_index = CMolecule(container[2]).indexOf("H")
                    delete(container[2][proton_index]) // remove proton
                    container[2][proton_index] += "-" // atom proton was bonded to
                    CMolecule(container[1]).push("H")
                    container[1][reagent.length-2] += "+" 
                }
            } else {
                
            }
        }
    },
    
    remove() {
    
    }
}

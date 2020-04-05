//  CONTAINER CONTROLLER
class Container {
    // container is a container model
    constructor(container) {
        this.container = container
    },
   
    add(molecule_array_or_string, units) {
        const molecule =  (typeof molecule_array_or_string === "array"? molecule_array_or_string:todo) 
        container.push(molecule)
        // First element is pKa value
        if (container.length > 2) {
            const substrate = container[1]
            const reagent = container[2]
            // acid base
            if (substrate.indexOf("H") !== false && reagent.indexOf("H") === false) {
                const proton_index = substrate.indexOf("H")
                delete(substrate[proton_index]) // remove proton
                substrate[proton_index] += "-" // atom proton was bonded to
                reagent.push("H")
                reagent[reagent.length-2] += "+" 
            }
        }
    },
    
    remove() {
    
    }
}

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
            } else if (substrate.indexOf("H") === false && reagent.indexOf("H") !== false) {
                const proton_index = reagent.indexOf("H")
                delete(reagent[proton_index]) // remove proton
                reagent[proton_index] += "-" // atom proton was bonded to
                substrate.push("H")
                substrate[reagent.length-2] += "+" 
            } else if (substrate.indexOf("H") !== false && reagent.indexOf("H") !== false) {
                // First element is pKa value
                const acid = substrate[0] < reagent[0]? substrate : reagent
                const base = substrate[0] < reagent[0]? reagent : substrate
                const proton_index = acid.indexOf("H")
                delete(acid[proton_index]) // remove proton
                acid[proton_index] += "-" // atom proton was bonded to
                base.push("H")
                base[reagent.length-2] += "+" 
            } else {
                
            }
        }
    },
    
    remove() {
    
    }
}

//  CONTAINER CONTROLLER
class Container {
    // container is a container model
    constructor(container) {
        this.container = container
    },
   
    add(molecule_array_or_string, units) {
        const molecule =  (typeof molecule_array_or_string === "array"? molecule_array_or_string:todo) 
        container.push(molecule)
    },
    
    remove() {
    
    }
}

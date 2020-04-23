//  CONTAINER CONTROLLER


class CContainer {

    // container is a container model
    constructor(container, MoleculeFactory, MoleculeController) {
        this.container = container
        this.MoleculeFactory = MoleculeFactory
        this.MoleculeController = MoleculeController
    }
   
    add(molecule_array_or_string, units) {
        const molecule =  (typeof molecule_array_or_string !== "string"?
                           molecule_array_or_string:
                           this.MoleculeFactory(molecule_array_or_string))
        // Add item to container.
        this.container.push(molecule)
        /*
        range.range(1,units,1).map(i)=>{
            this.container.push(molecule)
        }
        */
        
        // First element is pKa value,
        // container[1] is reagent
        // container[2] is substrate
        if (this.container.length > 2) {     
            // We've just added a reagent to the container
            // Brønsted and Lowry Acid base reactions
            if (this.MoleculeController(this.container[1]).indexOf("H") !== false && this.MoleculeController(this.container[2]).indexOf("H") === false) {
                // Here the substrate (acid) has a proton and the reagent (base) doesnt.
                // So we remove the proton from the substrate and add it to the reagent.
                const proton_index = this.MoleculeController(this.container[1]).indexOf("H")
                this.MoleculeController.remove(container, 1, this.MoleculeController(this.container[1]).itemAt(proton_index)) // remove proton
                this.container[2] = this.MoleculeController(this.container[2]).push("H")
                
            } else if (this.MoleculeController(this.container[1]).indexOf("H") === false && this.MoleculeController(this.container[2]).indexOf("H") !== false) {
                // Here the substrate (base) has no proton and the reagent (acid) does.
                // So we remove the proton from the reagent and add it to the substrate.
                
              
                const proton_index = this.MoleculeController(this.container[2]).indexOf("H")
                this.container = this.MoleculeController.remove(container, 2, this.MoleculeController(this.container[2]).itemAt(proton_index)) // remove proton
                
                this.container[1] = this.MoleculeController(this.container[1]).push("H")
                
            } else if (this.container[1].indexOf("H") !== false && this.MoleculeController(this.container[2]).indexOf("H") !== false) {
                 // Here both substrate and reagent has a proton.
                 // So we remove a proton from the molecule with the lowest pKa value (acid)
                 // and add it to the molecule with the highest pKa value (base)
                // HCl + H2O <-> Cl- + H3O+
                 // CC(=O)O (C2H4O2, acetic acid) + water (water is base and accepts proton)
                // First element is pKa value
                // Molecule with highest pka value is the base and accepts the proton (check)
                if (this.container[1][0] <= this.container[2][0]) {

                    // Move proton from first molecule to second molecule
                    const proton_index = this.MoleculeController(this.container[1]).indexOf("H")

                    this.container = this.MoleculeController(this.container[1]).remove(
                        this.container,
                        1,
                        this.MoleculeController(this.container[1]).itemAt(proton_index)
                    ) // remove proton

                    // last item of container will now be the proton from the first molecule
                    const proton = this.container[this.container.length-1][proton_index]

                    // add the proton to second molecule
                    this.MoleculeController(this.container[2]).push(proton)
                    this.container.pop()

                } else {

                    // Move proton from second molecule to first molecule
                    const proton_index = this.MoleculeController(this.container[2]).indexOf("H") // 2
                    this.container = this.MoleculeController(this.container[2]).remove(
                        this.container,
                        2,
                        this.MoleculeController(this.container[2]).itemAt(proton_index)
                    ) // remove proton

                    // last item of container will now be the proton from the second molecule
                    const proton = this.container.pop()
                    // add the proton to first molecule
                    this.MoleculeController(this.container[1]).push(proton)
                    
                }
            } else {
                // Neither substrate or reagent has a proton.
            }
        }
    }
    
    remove() {
    
    }
}

module.exports = CContainer

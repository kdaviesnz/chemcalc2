//  CONTAINER CONTROLLER


class CContainer {

    // container is a container model
    constructor(container, MoleculeFactory, MoleculeController, test_number) {
        this.container = container
        this.MoleculeFactory = MoleculeFactory
        this.MoleculeController = MoleculeController
        this.test_number = test_number
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

                var test_mode = this.test_number ===1
                var test_mode_2 = this.test_number ===2
                
                // Here the substrate (base) has no proton and the reagent (acid) does.
                // So we remove the proton from the reagent and add it to the substrate.
                const proton_index = this.MoleculeController(this.container[2]).indexOf("H")
                proton_index.should.be.greaterThan(0);

               // this.container = this.MoleculeController.remove(this.container, 2, this.MoleculeController(this.container[2]).itemAt(proton_index)) // remove proton
                this.container = this.MoleculeController(this.container[2]).removeProton(
                    this.container,
                    2,
                    this.MoleculeController(this.container[2]).itemAt(proton_index)
                )

                let proton = null
                if (test_mode) {
                    proton = this.container[this.container.length-1][proton_index]
                }
                if (test_mode_2) {
                    proton = this.container[proton_index -1 ]
                    proton.should.be.Array()
                    proton[1].length.should.be.equal(4)
                    proton[1][0].should.be.String()
                    proton[1][0].should.be.equal("H")
                }

                // Move the proton to first molecule
                this.container.splice(this.container.length-1,1)
                this.MoleculeController(this.container[1]).push(proton, this.container, this.container.length-1)

                if (test_mode) {
                        this.container.length.should.be.equal(3)
                        this.container[1].length.should.be.equal(2)
                        this.container[1][1].length.should.be.equal(12)
                        const lone_pairs = this.MoleculeController(this.container[1]).lonePairs(
                            this.container[1][1],
                            1)
                        lone_pairs.length.should.equal(8)
                        this.container[1][1][0].should.be.equal("Cl")
                        this.container[2].length.should.be.equal(5)
                        this.container[2][1].should.be.an.Array()
                        this.container[2][1].length.should.be.equal(6)
                        this.container[2][1][0].should.be.equal("H")
                        this.container[2][1][1].should.be.equal(1)
                        this.container[2][1][2].should.be.equal(1)
                        this.container[2][1][3].should.be.equal(1)
                        this.container[2][1][4].should.be.a.String()
                        this.container[2][2].should.be.an.Array()
                        this.container[2][2].length.should.be.equal(6)
                        this.container[2][2][0].should.be.equal("H")
                        this.container[2][2][1].should.be.equal(1)
                        this.container[2][2][2].should.be.equal(1)
                        this.container[2][2][3].should.be.equal(1)
                }
                // this.container[1] = this.MoleculeController(this.container[1]).push("H")
                
            } else if (this.container[1].indexOf("H") !== false && this.MoleculeController(this.container[2]).indexOf("H") !== false) {
                 // Here both substrate and reagent has a proton.
                 // So we remove a proton from the molecule with the lowest pKa value (acid)
                 // and add it to the molecule with the highest pKa value (base)
                // HCl + H2O <-> Cl- + H3O+
                 // CC(=O)O (C2H4O2, acetic acid) + water (water is base and accepts proton)
                // First element is pKa value
                // Molecule with highest pka value is the base and accepts the proton (check)
                // pKa of HCl is -6.3
               // pKa of water is 14
                // HCL is first element
                if (this.container[1][0] <= this.container[2][0]) {

                    var test_mode = this.test_number === 1

                    // Move proton from first molecule to second molecule
                    const proton_index = this.MoleculeController(this.container[1]).indexOf("H")

                    if (test_mode) {
                        proton_index.should.be.equal(1)
                    }

                    this.container = this.MoleculeController(this.container[1]).removeProton(
                        this.container,
                        1,
                        this.MoleculeController(this.container[1]).itemAt(proton_index)
                    )

                    // last item of container will now be the proton from the first molecule
                    const proton = this.container[this.container.length-1][proton_index]
                    proton.should.be.Array()
                    proton.length.should.be.equal(4)
                    proton[0].should.be.String()
                    proton[0].should.be.equal("H")

                    // Move the proton to second molecule
                    this.container.splice(this.container.length-1,1)
                    this.MoleculeController(this.container[2]).push(proton, this.container)

                    if (test_mode) {
                        this.container.length.should.be.equal(3)
                        this.container[1].length.should.be.equal(2)
                        this.container[1][1].length.should.be.equal(12)
                        const lone_pairs = this.MoleculeController(this.container[1]).lonePairs(
                            this.container[1][1],
                            1)
                        lone_pairs.length.should.equal(8)
                        this.container[1][1][0].should.be.equal("Cl")
                        this.container[2].length.should.be.equal(5)
                        this.container[2][1].should.be.an.Array()
                        this.container[2][1].length.should.be.equal(6)
                        this.container[2][1][0].should.be.equal("H")
                        this.container[2][1][1].should.be.equal(1)
                        this.container[2][1][2].should.be.equal(1)
                        this.container[2][1][3].should.be.equal(1)
                        this.container[2][1][4].should.be.a.String()
                        this.container[2][2].should.be.an.Array()
                        this.container[2][2].length.should.be.equal(6)
                        this.container[2][2][0].should.be.equal("H")
                        this.container[2][2][1].should.be.equal(1)
                        this.container[2][2][2].should.be.equal(1)
                        this.container[2][2][3].should.be.equal(1)
                        this.container[2][2][4].should.be.a.String()
                        this.container[2][3].should.be.an.Array()
                        this.container[2][3].length.should.be.equal(12)
                        this.container[2][3][0].should.be.equal("O")
                        this.container[2][3][1].should.be.equal(8)
                        this.container[2][3][2].should.be.equal(6)
                        this.container[2][3][3].should.be.equal(2)
                        this.container[2][3][4].should.be.a.String()
                        this.container[2][4].should.be.an.Array()
                        this.container[2][4].length.should.be.equal(6)
                        this.container[2][4][0].should.be.equal("H")
                        this.container[2][4][1].should.be.equal(1)
                        this.container[2][4][2].should.be.equal(1)
                        this.container[2][4][3].should.be.equal(1)
                        this.container[2][4][4].should.be.a.String()
                    }


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

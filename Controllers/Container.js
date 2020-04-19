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
        this.container.push(molecule)
        // First element is pKa value,
        // container[1] is reagent
        // container[2] is substrate
        if (this.container.length > 2) {            
            // acid base
            if (this.MoleculeController(this.container[1]).indexOf("H") !== false && this.MoleculeController(this.container[2]).indexOf("H") === false) {
                const proton_index = this.MoleculeController(this.container[1]).indexOf("H")
                this.MoleculeController.remove(container, 1, this.MoleculeController(this.container[1]).itemAt(proton_index)) // remove proton
       
                this.container[2] = this.MoleculeController(this.container[2]).push("H")
                
            } else if (this.MoleculeController(this.container[1]).indexOf("H") === false && this.MoleculeController(this.container[2]).indexOf("H") !== false) {
                const proton_index = this.MoleculeController(this.container[2]).indexOf("H")
                this.container = this.MoleculeController.remove(container, 2, this.MoleculeController(this.container[2]).itemAt(proton_index)) // remove proton
                
                this.container[1] = this.MoleculeController(this.container[1]).push("H")
                
            } else if (this.container[1].indexOf("H") !== false && this.MoleculeController(this.container[2]).indexOf("H") !== false) {
                 // HCl + H2O <-> Cl- + H3O+
                 // CC(=O)O (C2H4O2, acetic acid) + water (water is base and accepts proton)
                // First element is pKa value
                if (this.container[1][0] < this.container[2][0]) {
                    const proton_index = this.MoleculeController(this.container[1]).indexOf("H")
                    this.container = this.MoleculeController(this.container[2]).remove(this.container, 1,this.MoleculeController(this.container[1]).itemAt(proton_index)) // remove proton
                    this.MoleculeController(this.container[2]).push("H")
                    
                } else {
                    const proton_index = this.MoleculeController(this.container[2]).indexOf("H")
                    console.log("container")
                    console.log(this.container)
                    console.log("proton index:")
                    console.log(proton_index)
                    /*
                    container
[ false,
  [ 9999,
    [ 'H', 1, 1, 1, 'w2uspk96mjnja', 'w2uspk96mjnj3' ],
    [ 'Cl',
      17,
      7,
      1,
      'w2uspk96mjnj3',
      'w2uspk96mjnj4',
      'w2uspk96mjnj5',
      'w2uspk96mjnj6',
      'w2uspk96mjnj7',
      'w2uspk96mjnj8',
      'w2uspk96mjnj9',
      'w2uspk96mjnja' ] ],
  [ 9999,
    [ 'H', 1, 1, 1, 'w2uspk96mjnjh', 'w2uspk96mjnjb' ],
    [ 'H', 1, 1, 1, 'w2uspk96mjnji', 'w2uspk96mjnjc' ],
    [ 'O',
      8,
      6,
      2,
      'w2uspk96mjnjb',
      'w2uspk96mjnjc',
      'w2uspk96mjnjd',
      'w2uspk96mjnje',
      'w2uspk96mjnjf',
      'w2uspk96mjnjg',
      'w2uspk96mjnjh',
      'w2uspk96mjnji' ] ] ]
proton index:
2
[ 'H', 1, 1, 1, 'w2uspk96mjnji', 'w2uspk96mjnjc' ]
[ 9999,
  [ 'H', 1, 1, 1, 'w2uspk96mjnja', 'w2uspk96mjnj3' ],
  [ 'Cl',
    17,
    7,
    1,
    'w2uspk96mjnj3',
    'w2uspk96mjnj4',
    'w2uspk96mjnj5',
    'w2uspk96mjnj6',
    'w2uspk96mjnj7',
    'w2uspk96mjnj8',
    'w2uspk96mjnj9',
    'w2uspk96mjnja' ] ]
atom_index
-1

                     */
                    // this.container[1]
                    /*
                    [ 9999,
    [ 'H', 1, 1, 1, 'w2uspk96mjnja', 'w2uspk96mjnj3' ],
    [ 'Cl',
      17,
      7,
      1,
      'w2uspk96mjnj3',
      'w2uspk96mjnj4',
      'w2uspk96mjnj5',
      'w2uspk96mjnj6',
      'w2uspk96mjnj7',
      'w2uspk96mjnj8',
      'w2uspk96mjnj9',
      'w2uspk96mjnja' ] ]
                     */
                    // this.MoleculeController(this.container[2]).itemAt(proton_index)
                    // [ 'H', 1, 1, 1, 'w2uspk96mjnji', 'w2uspk96mjnjc' ],
                    this.container = this.MoleculeController(this.container[1]).remove(
                        this.container,
                        2,
                        this.MoleculeController(this.container[2]).itemAt(proton_index)
                    ) // remove proton
                    
                    this.MoleculeController(this.container[1]).push("H")
                    
                }
            } else {
                
            }
        }
    }
    
    remove() {
    
    }
}

module.exports = CContainer

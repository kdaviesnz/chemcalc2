//  CONTAINER CONTROLLER
const Families = require('../Models/Families')
const BronstedLowryAcidBaseReactions = require('../Models/BronstedLowryAcidBaseReactions')
const LewisAcidBaseReactions = require('../Models/LewisAcidBaseReactions')

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
        // container[2] is reagent
        // container[1] is substrate
        if (this.container.length > 2) {

            const substrate = this.container[1]
            const reagent = this.container[2]
            
            const substrate_families = Families(substrate.slice(1)).families
            const reagent_families = Families(reagent.slice(1)).families
            
            const bronstedLowry = BronstedLowryAcidBaseReactions(this.container, this.MoleculeController, this.test_number)
            const lewis = LewisAcidBaseReactions(this.container, this.MoleculeController, this.test_number)

            
            // The functional group of an alkene is the C=C double bond.
            // The C=C double bond is nucleophilic
            let reaction = false
            if (substrate_families.alkene.length > 0) {
                
                // Substrate is alkene
                // Find the nucleophile on the C=C bond
                const nucleophile_atom_index = substrate_families.alkene[0][0]
                substrate[nucleophile_atom_index][0].should.be.equal("C")
                AtomController(substrate[nucleophile_atom_index], nucleophile_atom_index, substrate.slice(1)).bondCount.should.be.equal(2)
                reaction = bronstedLowry.react(substrate, nucleophile_atom_index, reagent, null)
                    
                if (reaction === false) {
                    // reagent does not have a proton
                    // determine electrophile atom on the reagent
                    // do Lewis acid base teaction
                    reaction = lewis.react()
                }
                

            } else if (reagent_families.alkene.length > 0) {
                
                // Reagent is alkene
                // Find the nucleophile on the C=C bond
                const nucleophile_atom_index = reagent_families.alkene[0][0]
                reagent[nucleophile_atom_index][0].should.be.equal("C")
                AtomController(reagent[nucleophile_atom_index], reagent_atom_index, reagent.slice(1)).bondCount.should.be.equal(2)
                reaction = bronstedLowry.react(reagent, nucleophile_atom_index, substrate, null)
                     
                if (reaction === false) {
                    // substrate does not have a proton
                    // determine electrophile atom on the substrate
                    // do Lewis acid base teaction
                    reaction = lewis.react()
                }     
                
            }

            if (!reaction) {
                // No alkene
                reaction = bronstedLowry.react()
            }

            if (this.test_number === 1) {
                reaction.should.not.be.equal(false)
            }

            if (!reaction) {
                // No alkene and not Bronsted Lowry
                // do Lewis acid base teaction
                reaction = lewis.react(null, null, null, null, this.test_number)
            }

            if (this.test_number === 1) {
                reaction.length.should.be.equal(3)
                reaction[0].should.be.equal(false)
                reaction[1].length.should.be.equal(2)
                reaction[1][0].should.be.equal(2.86)
                reaction[1][1][0].should.be.equal("Cl")
                reaction[2].length.should.be.equal(5)
                reaction[2][0].should.be.equal(-1.74)
                reaction[2][1][0].should.be.equal("H")
                reaction[2][3][0].should.be.equal("O")
                reaction[2][4][0].should.be.equal("H")
            }

            // [Cl-] (nucleophile)  <- H3O (electrophile)
            if (this.test_number === 2) {
                reaction.length.should.be.equal(3)
                reaction[0].should.be.equal(false)
                reaction[1].length.should.be.equal(3)
                reaction[1][0].should.be.equal(-6.3)
                reaction[1][1][0].should.be.equal("Cl")
                reaction[2].length.should.be.equal(4)
                reaction[2][0].should.be.equal(14)
                reaction[2][1][0].should.be.equal("H")
                reaction[2][3][0].should.be.equal("O")
            }


            // CO:C (nucleophile (O)) ---------> AlCl3 (electrophile (Al))
            if (this.test_number === 3) {
                reaction.length.should.be.equal(2) // should be 2
                reaction[0].should.be.equal(false)
                reaction[1].length.should.be.equal(5)
                //reaction[1][0].should.be.equal(-6.3)
                reaction[1][1][0].should.be.equal("Al")
                reaction[2].length.should.be.equal(14)
                reaction[2][0].should.be.equal(-3.5)
                reaction[2][1][0].should.be.equal("H")
                reaction[2][3][0].should.be.equal("H")
                // check for bond besteen Al and O
                console.log("Reaction result")
                console.log(reaction)
                /*
// test_number_3

[ false,
  [ 12345,
    [ 'Al',
      13,
      3,
      3,
      '2iwcg1tplkaaezjvd',
      '2iwcg1tplkaaezjve',
      '2iwcg1tplkaaezjvf',
      '2iwcg1tplkaaezjvm',
      '2iwcg1tplkaaezjvt',
      '2iwcg1tplkaaezjw0' ],
    [ 'Cl',
      17,
      7,
      1,
      '2iwcg1tplkaaezjvg',
      '2iwcg1tplkaaezjvh',
      '2iwcg1tplkaaezjvi',
      '2iwcg1tplkaaezjvj',
      '2iwcg1tplkaaezjvk',
      '2iwcg1tplkaaezjvl',
      '2iwcg1tplkaaezjvm',
      '2iwcg1tplkaaezjvf' ],
    [ 'Cl',
      17,
      7,
      1,
      '2iwcg1tplkaaezjvn',
      '2iwcg1tplkaaezjvo',
      '2iwcg1tplkaaezjvp',
      '2iwcg1tplkaaezjvq',
      '2iwcg1tplkaaezjvr',
      '2iwcg1tplkaaezjvs',
      '2iwcg1tplkaaezjvt',
      '2iwcg1tplkaaezjve' ],
    [ 'Cl',
      17,
      7,
      1,
      '2iwcg1tplkaaezjvu',
      '2iwcg1tplkaaezjvv',
      '2iwcg1tplkaaezjvw',
      '2iwcg1tplkaaezjvx',
      '2iwcg1tplkaaezjvy',
      '2iwcg1tplkaaezjvz',
      '2iwcg1tplkaaezjw0',
      '2iwcg1tplkaaezjvd' ] ],
  [ -3.5,
    [ 'H', 1, 1, 1, '2iwcg1tplkaaezjwf', '2iwcg1tplkaaezjw1' ],
    [ 'H', 1, 1, 1, '2iwcg1tplkaaezjwg', '2iwcg1tplkaaezjw2' ],
    [ 'H', 1, 1, 1, '2iwcg1tplkaaezjwh', '2iwcg1tplkaaezjw3' ],
    [ 'C',
      6,
      4,
      4,
      '2iwcg1tplkaaezjw1',
      '2iwcg1tplkaaezjw2',
      '2iwcg1tplkaaezjw3',
      '2iwcg1tplkaaezjw4',
      '2iwcg1tplkaaezjwa',
      '2iwcg1tplkaaezjwf',
      '2iwcg1tplkaaezjwg',
      '2iwcg1tplkaaezjwh' ],
    [ 'O',
      8,
      6,
      2,
      '2iwcg1tplkaaezjw5',
      '2iwcg1tplkaaezjw6',
      '2iwcg1tplkaaezjw7',
      '2iwcg1tplkaaezjw8',
      '2iwcg1tplkaaezjw9',
      '2iwcg1tplkaaezjwa',
      '2iwcg1tplkaaezjw4',
      '2iwcg1tplkaaezjwe' ],
    [ 'H', 1, 1, 1, '2iwcg1tplkaaezjwi', '2iwcg1tplkaaezjwb' ],
    [ 'H', 1, 1, 1, '2iwcg1tplkaaezjwj', '2iwcg1tplkaaezjwc' ],
    [ 'H', 1, 1, 1, '2iwcg1tplkaaezjwk', '2iwcg1tplkaaezjwd' ],
    [ 'C',
      6,
      4,
      4,
      '2iwcg1tplkaaezjwb',
      '2iwcg1tplkaaezjwc',
      '2iwcg1tplkaaezjwd',
      '2iwcg1tplkaaezjwe',
      '2iwcg1tplkaaezjw9',
      '2iwcg1tplkaaezjwi',
      '2iwcg1tplkaaezjwj',
      '2iwcg1tplkaaezjwk' ],
    [ 'Al',
      13,
      3,
      3,
      '2iwcg1tplkaaezjvd',
      '2iwcg1tplkaaezjve',
      '2iwcg1tplkaaezjvf',
      '2iwcg1tplkaaezjvm',
      '2iwcg1tplkaaezjvt',
      '2iwcg1tplkaaezjw0' ],
    [ 'Cl',
      17,
      7,
      1,
      '2iwcg1tplkaaezjvg',
      '2iwcg1tplkaaezjvh',
      '2iwcg1tplkaaezjvi',
      '2iwcg1tplkaaezjvj',
      '2iwcg1tplkaaezjvk',
      '2iwcg1tplkaaezjvl',
      '2iwcg1tplkaaezjvm',
      '2iwcg1tplkaaezjvf' ],
    [ 'Cl',
      17,
      7,
      1,
      '2iwcg1tplkaaezjvn',
      '2iwcg1tplkaaezjvo',
      '2iwcg1tplkaaezjvp',
      '2iwcg1tplkaaezjvq',
      '2iwcg1tplkaaezjvr',
      '2iwcg1tplkaaezjvs',
      '2iwcg1tplkaaezjvt',
      '2iwcg1tplkaaezjve' ],
    [ 'Cl',
      17,
      7,
      1,
      '2iwcg1tplkaaezjvu',
      '2iwcg1tplkaaezjvv',
      '2iwcg1tplkaaezjvw',
      '2iwcg1tplkaaezjvx',
      '2iwcg1tplkaaezjvy',
      '2iwcg1tplkaaezjvz',
      '2iwcg1tplkaaezjw0',
      '2iwcg1tplkaaezjvd' ] ] ]




                 */
                console.log("Container.js")
                process.exit()
            }


            this.container = reaction


        }
    }

    remove() {

    }
}

module.exports = CContainer

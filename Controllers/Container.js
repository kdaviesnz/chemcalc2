//  CONTAINER CONTROLLER
const Families = require('../Models/Families')
const BronstedLowryAcidBaseReactions = require('../Models/BronstedLowryAcidBaseReactions')
const LewisAcidBaseReactions = require('../Models/LewisAcidBaseReactions')
const Set = require('../Models/Set')

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
                reaction[1].length.should.be.equal(14)
                reaction[1][0].should.be.equal(-3.5)
                reaction[1][1][0].should.be.equal("H")
                reaction[1][2][0].should.be.equal("H")
                reaction[1][3][0].should.be.equal("H")
                reaction[1][4][0].should.be.equal("C")
                reaction[1][5][0].should.be.equal("O")
                reaction[1][6][0].should.be.equal("H")
                reaction[1][7][0].should.be.equal("H")
                reaction[1][8][0].should.be.equal("H")
                reaction[1][9][0].should.be.equal("C")
                reaction[1][10][0].should.be.equal("Al")
                reaction[1][11][0].should.be.equal("Cl")
                reaction[1][12][0].should.be.equal("Cl")
                reaction[1][13][0].should.be.equal("Cl")
                // check for bond between Al and Oxygen
                Set().intersection(reaction[1][5].slice(4), reaction[1][10].slice(4)).length.should.not.be.equal(0)
            }


            this.container = reaction


        }
    }

    remove() {

    }
}

module.exports = CContainer

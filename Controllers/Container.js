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
                
            if (!reaction) {
                // No alkene and not Bronstec Lowry
                // do Lewis acid base teaction
                reaction = lewis.react()
            }      

            
        }
    }

    remove() {

    }
}

module.exports = CContainer

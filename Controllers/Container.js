//  CONTAINER CONTROLLER
const Families = require('../Models/Families')
const BronstedLowryAcidBaseReactions = require('../Models/BronstedLowryAcidBaseReactions')
const LewisAcidBaseReactions = require('../Models/LewisAcidBaseReactions')
const Set = require('../Models/Set')
const CAtom = require('./Atom')

class CContainer {

    // container is a container model
    constructor(container, MoleculeFactory, MoleculeController, test_number, verbose) {
        this.container = container
        this.MoleculeFactory = MoleculeFactory
        this.MoleculeController = MoleculeController
        this.test_number = test_number
        this.verbose = verbose
        if (this.verbose) {
            console.log("Controllers/Container.js::Created container controller object ->")
            console.log(this)
        }
    }
    
    __doReactionRecursive(reagent_index, substrate_index) {

        if (reagent_index === undefined) {
            if (this.verbose) {
                 console.log("Container.js::reagent index is null")
            }
            return this.__doReactionRecursive(reagent_index, substrate_index+1)
        }
        
        const reagents = this.container.slice(2,this.container.length)
        const reagent = reagents[reagent_index]

        
        
        if (reagent[reagent_index][1] === 0) {
            if (this.verbose) {
                 console.log("Container.js::no reagent left")
                console.log(reagent)
            }
            return this.__doReactionRecursive(reagent_index, substrate_index+1)
        }
              
        const substrates = this.container.slice(1,this.container.length-1)

        

        if (undefined === substrates[substrate_index]) {
            return
        }

        

        const substrate = substrates[substrate_index]

        if (substrate[substrate_index][1] === 0) {
            if (this.verbose) {
                console.log("Container.js::no substrate left")
                console.log(substrate)
            }
            return
        }
        

        if (this.verbose) {
            console.log("Controllers/Container.js:: Got substrate ->")
            console.log(substrate)
        }

        if (reagent === substrate) {
            if (this.verbose) {
                console.log('reagent and substrate are the same')
            }
            return this.__doReactionRecursive(reagent_index, substrate_index+1)
        } else {

            const substrate_families = Families(substrate[0].slice(1), this.verbose).families
            const reagent_families = Families(reagent[0].slice(1), this.verbose).families

            if (this.verbose) {
                console.log("Controllers/Container.js substrate families ->")
                console.log(substrate_families)
                console.log("Controllers/Container.js substrate alkene ->")
                console.log(substrate_families.alkene(this.verbose))
                console.log("Controllers/Container.js reagent families ->")
                console.log(reagent_families)
                console.log("Controllers/Container.js reagent alkene ->")
                console.log(reagent_families.alkene(this.verbose))
             }

            
             const bronstedLowry = BronstedLowryAcidBaseReactions(this.container, this.MoleculeController, this.test_number, this.verbose)
             const lewis = LewisAcidBaseReactions(this.container, this.MoleculeController, this.test_number, this.verbose)

             // The functional group of an alkene is the C=C double bond.
             // The C=C double bond is nucleophilic
             let reaction = false


             if (substrate_families.alkene(this.verbose).length > 0) {

                 const is_water = reagent[0].length === 4 && reagent[0][1][0]==='H'
                     && reagent[0][2][0]==='H' && reagent[0][3][0]==='O'

                 

                 // if reagent is water then return as is, as water does not react to alkenes.
                 if (is_water) {
                     return this.__doReactionRecursive(reagent_index, substrate_index+1)
                }


                // SEE organic chemistry 8th edition p245
// propylene CC=C (test 6) / water H2O (test 6) / sulfuric acid H2SO4 (test 7)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)

                 

                 // Substrate is alkene (nucleophile)
                 // Find the nucleophile on the C=C bond
                 const nucleophile_molecule = substrate
                 const nucleophile_molecule_index = 1

                

                 const electrophile_molecule = reagent
                 const electrophile_molecule_index = this.container.length -1
                
                 

                 const nucleophile_atom_index = this.MoleculeController(substrate[0]).nucleophileIndex(this.test_number)

                 // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
                                 
                 
                 
                 // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
                const electrophile_atom_index = this.MoleculeController(reagent[0]).electrophileIndex(this.test_number + ".1")
                                        if (this.test_number === 6) {
                    // Shouldn't be here as reagent is water and substrate is alkene


                    console.log("Error - trying to react water with an alkene")
                                            /*
                                            console.log('Reagent')
                                            console.log(reagent) // water
                                            console.log('Substrate')
                                            console.log(substrate) // propylene
                                            console.log(substrate_families.alkene(this.verbose).length)
                                            console.log(is_water)

                                             */
                                             process.exit()
                                        }
                                      
                                        

                // See organic chemistry 8th edition ch 6 p 235
                // C=C (butene, nucleophile) -> HBr (H is electrophile)
                
                 
                // See organic chemistry 8th edition ch 6 p 235
                // C=C (butene, nucleophile) -> HBr (H is electrophile)
                

                reaction = bronstedLowry.react()

                

                // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
                 
                 
                 if (reaction === false) {
                      reaction = lewis.react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, this.test_number)
                      if (reaction !== false) {
                             this.container = reaction
                      }

                 } else {
                       
                     this.container = reaction
                
                     
                     
                 }
                 
                 
             } else if (reagent_families.alkene(this.verbose).length > 0) {


                 const is_water = substrate[0].length === 4 && substrate[0][1][0]==='H'
                     && substrate[0][2][0]==='H' && substrate[0][3][0]==='O'

                 

                 // if substrate is water then return as is, as water does not react to alkenes.
                 if (is_water) {
                     if (this.verbose) {
                         console.log('Container::Not processing as substrate is water and reagent is an alkene')
                     }
                     return this.__doReactionRecursive(reagent_index, substrate_index+1)
                 }

                 // Reagent is alkene
                const nucleophile_molecule = reagent
                const electrophile_molecule = substrate
                const nucleophile_molecule_index = 2
                const electrophile_molecule_index = 1

                // Find the nucleophile on the C=C bond
                const nucleophile_atom_index = this.MoleculeController(reagent[0]).nucleophileIndex(this.test_number)

                // Find the nucleophile
                const electrophile_atom_index = this.MoleculeController(substrate[0]).electrophileIndex(this.test_number)


                

                // const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, nucleophile_molecule_index, electrophile_molecule_index)
                reaction = bronstedLowry.react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, nucleophile_molecule_index, electrophile_molecule_index)

                if (reaction === false) {
                    // substrate does not have a proton
                    // determine electrophile atom on the substrate
                    // do Lewis acid base teaction
                    reaction = lewis.react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, this.test_number)
                }
                 
                 
             } 
            
             if (!reaction) {
                // Not alkene
                console.log("Doing Bronsted Lowry reaction: " + substrate[0].IUPACName + " + " + reagent[0].IUPACName)
                reaction = bronstedLowry.react()
             }
            
             if (this.test_number === 1) {
                reaction.should.not.be.equal(false)
            }

            // [Br-] (nucleophile) -----> carbocation
            // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8
            // Source atom index should be 1
              // Organic Chemistry 8th edition, P199
        // test_number 5
        // [Br-] + carbocation (alkane)
        // electrophile is [C+] cation on carbocation
        // nucleophile is [Br-]
        // carbocation is added to [Br-]
        // Br and C form bond
            if (this.test_number === 5) {
                reaction.should.be.equal(false)
            }

            if (!reaction) {
                // No alkene and not Bronsted Lowry
                // do Lewis acid base teaction
                reaction = lewis.react(null, null, null, null, this.test_number, verbose)
            }
             
            
            if (this.test_number === 1) {
                reaction.length.should.be.equal(3)
                reaction[0].should.be.equal(false)
                reaction[1][0].length.should.be.equal(2)
                reaction[1][0][0].should.be.equal(2.86)
                reaction[1][0][1][0].should.be.equal("Cl")
                reaction[2][0].length.should.be.equal(5)

                reaction[2][0][0].should.be.equal(-1.74)
                reaction[2][0][1][0].should.be.equal("H")
                reaction[2][0][3][0].should.be.equal("O")
                reaction[2][0][4][0].should.be.equal("H")
            }

            // [Cl-] (nucleophile)  <- H3O (electrophile)
            if (this.test_number === 2) {
                reaction.length.should.be.equal(3)
                reaction[0].should.be.equal(false)
                reaction[1][0].length.should.be.equal(3)
                reaction[1][0][0].should.be.equal(-6.3)
                reaction[1][0][1][0].should.be.equal("Cl")
                reaction[2][0].length.should.be.equal(4)
                reaction[2][0][0].should.be.equal(14)
                reaction[2][0][1][0].should.be.equal("H")
                                        reaction[2][0][3][0].should.be.equal("O")
             }
                                 
             if (this.test_number === 3) {
                reaction.length.should.be.equal(2) // should be 2
                reaction[0].should.be.equal(false)
                reaction[1][0].length.should.be.equal(14)
                reaction[1][0][0].should.be.equal(-3.5)
                reaction[1][0][1][0].should.be.equal("H")
                reaction[1][0][2][0].should.be.equal("H")
                reaction[1][0][3][0].should.be.equal("H")
                reaction[1][0][4][0].should.be.equal("C")
                reaction[1][0][5][0].should.be.equal("O")
                reaction[1][0][6][0].should.be.equal("H")
                reaction[1][0][7][0].should.be.equal("H")
                reaction[1][0][8][0].should.be.equal("H")
                reaction[1][0][9][0].should.be.equal("C")
                reaction[1][0][10][0].should.be.equal("Al")
                reaction[1][0][11][0].should.be.equal("Cl")
                reaction[1][0][12][0].should.be.equal("Cl")
                reaction[1][0][13][0].should.be.equal("Cl")
                // check for bond between Al and Oxygen
                Set().intersection(reaction[1][0][5].slice(4), reaction[1][0][10].slice(4)).length.should.not.be.equal(0)
            }
            
            // At this point it is possible that the number of different molecules
            // to have changed. eg when the reagent bonds to the substrate
            // hence we need to check the container again
           
            this.container = reaction
            
            const container_items = this.container.slice(1,this.container.length)
            if (container_items.length < reagents.length) {
                // reagent and substrate have bonded
                return this.__doReactionRecursive(reagent_index-1, substrate_index)
            }
            
            return this.__doReactionRecursive(reagent_index, substrate_index+1)
            
            
        }
        
        
    }

    __doReactionsRecursive(reagent_index) {
   
        // test 6
        // ccontainer6.add(propylene, 1, verbose)
        // ccontainer6.add(watermolecule, 1, verbose)
        // r -> s
        // 1.1. water -> propylene (no reaction)
        // 1.2. water -> water (no reaction)
        // 2.1 propylene -> propylene (no reaction)
        // 2.2 propylene -> water (no reaction)
        
        // test 7
        // ccontainer6.add(propylene, 1, verbose)
        // ccontainer6.add(watermolecule, 1, verbose)
        // ccontainer6.add(sulfuric_acid, 1, verbose)
        // r -> s
        // 1.1 sulfuric acid (e) -> propylene (n) = deprotonated sulfuric acid, protonated propylene
        // 1.2 deprotonated sulfuric acid -> water
        // 1.3 deprotonated sulfuric acid -> deprotonated sulfuric acid
        // 2.1 water (n) -> protonated propylene (e) oxygen atom on water attacks carbocation on propylene
        // nb: container will now have hydrated protonated propylene, deprontonated sulfuric acid
        // as water molecule is now bonded to protonated propylene
        // thus we need to take into account that the number of reagents/substrates has change (todo)
        // 2.1 deprontonated sulfuric acid -> hydrated protonated propylene
        // 2.2 deprontonated sulfuric acid -> deprontonated sulfuric acid
        // 3.1 hydrated protonated propylene -> hydrated protonated propylene
        // 3.2 hydrated protonated propylene -> deprontonated sulfuric acid
        
        // test 7
            // propylene CC=C (test 6) / water H2O (test 6) / sulfuric acid H2SO4 (test 7)
            // reagents: sulfuric acid H2SO4, water
            // substrates: propylene, water, sulfuric acid 
            // reagent --> substrate
            // 1. sulfuric acid --> propylene
            // 2. sulfuric acid --> water
            // 2. sulfuric acid --> sulfuric acid
            // 4. water --> protonated propylene
            // 5. water --> water
            // 6. water --> deprontonated sulfuric acid
            // this needs to be changed to a recursive function as reagents can change
            const reagents = this.container.slice(2,this.container.length)

        if (this.verbose) {
           console.log("Test number: ")
           console.log(this.test_number)
           console.log("Reagents: ")
           console.log(reagents)
        }


        if (null === reagent_index) {
            reagent_index = reagents.length -1
        }
        
        // reagent is not defined or no more reagent left
        if (undefined === reagents[reagent_index] || reagents[reagent_index][1] === 0) {
            return
        }
            
        const reagent = reagents[reagent_index]
        if (this.verbose) {
              console.log("Controllers/Container.js:: Got reagent ->")
            console.log(reagent)
        }

        if (this.test_number === 1) {
            // reagent_index should be 0
            reagent_index.should.be.equal(0)
        }

        this.__doReactionRecursive(reagent_index, 0)

        return this.__doReactionsRecursive(reagent_index -1)

    }
    
    add(molecule, units, verbose, test_number) {

        
        // test 6
        // ccontainer6.add(propylene, 1, verbose)
        // ccontainer6.add(watermolecule, 1, verbose)
        
        
        if (undefined !== test_number) {
           // this.test_number = test_number
        }
        // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the 
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater 
// than the pKa of the protonated alcohol (Section 2.10). 
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
        
        if (verbose) {
            console.log("Controllers/Container.js::Adding ->")
            console.log(molecule.IUPACName)
            console.log("to container")
        }
        
        // Organic Chemistry 8th edition, P199
        // test_number 5
        // [Br-] + carbocation (alkane)
        // electrophile is [C+] cation on carbocation
        // nucleophile is [Br-]
        // carbocation is added to [Br-]
        // Br and C form bond

        //const molecule = this.MoleculeFactory(molecule_json.CanonicalSMILES)

        // Add item to container.
        this.container.push([molecule, units])

        if (verbose) {
            console.log("Controllers/Container.js:: Container before processing reaction ->")
            console.log(this.container)
            console.log("Length:" + this.container.length)
        }

        // First element is pKa value,
        // container[2] is reagent
        // container[1] is substrate
        if (this.container.length > 2) {
            

            const reagents = this.container.slice(2,this.container.length).reverse()

            if (this.test_number === 1) {
                reagents.length.should.be.equal(1)
                reagents[0][0].IUPACName.should.be.equal("chlorane")
            }

            if (this.test_number === 6) {
                // water, propylene
                reagents.length.should.be.equal(2)
            }

            if (this.test_number === 7) {
                // sulfuric acid, water, propylene
                if (this.verbose && reagents.length !== 3) {
                    console.log('Reagents:')
                    console.log(reagents)
                }
                reagents.length.should.be.equal(3)
            }
            
            // SEE organic chemistry 8th edition p245
            // test 6/7
// propylene CC=C (test 6) / water H2O (test 6) / sulfuric acid H2SO4 (test 7)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)
            if (this.test_number === 6) {
                // false, propylene, water
                this.container.length.should.be.equal(3)
            }
            
            if (this.test_number === 7) {
                // false, propylene, water
                this.container.length.should.be.equal(4)
            }
            
            // test 7
            // propylene CC=C (test 6) / water H2O (test 6) / sulfuric acid H2SO4 (test 7)
            // reagents: sulfuric acid H2SO4, water
            // substrates: propylene, water, sulfuric acid 
            // reagent --> substrate
            // 1. sulfuric acid --> propylene
            // 2. sulfuric acid --> water
            // 2. sulfuric acid --> sulfuric acid
            // 4. water --> protonated propylene
            // 5. water --> water
            // 6. water --> deprontonated sulfuric acid
            // this needs to be changed to a recursive function as reagents can change

            this.__doReactionsRecursive(null)


        } else {
            if (this.verbose) {
            console.log("Controller/Container.js:: Container only has substrate so not processing a reaction ")
        
            }
        }

        if (this.verbose) {
            console.log("Controller/Container.js:: Container after adding -> ")
            console.log(molecule_array_or_string)
            console.log(this.container)
        }


    } // add()

    remove() {

    }
}

module.exports = CContainer

//  CONTAINER CONTROLLER
const Families = require('../Models/Families')
const BronstedLowryAcidBaseReactions = require('../Models/BronstedLowryAcidBaseReactions')
const LewisAcidBaseReactions = require('../Models/LewisAcidBaseReactions')
const Set = require('../Models/Set')
const CAtom = require('./Atom')

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
            
            // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
            if (this.test_number === 4) {
                substrate_families.alkene().length.should.be.equal(2)
            }
            
            if (substrate_families.alkene().length > 0) {
                
                // Substrate is alkene (nucleophile)
                // Find the nucleophile on the C=C bond
                const nucleophile_molecule = substrate
                const nucleophile_molecule_index = 1
                
                // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
                // Check nucleophile is CC=CC
                if (this.test_number === 4) {
                    nucleophile_molecule[6][0].should.be.equal("C")
                    nucleophile_molecule[8][0].should.be.equal("C")
                    // Confirm double bond
                    Set().intersection(nucleophile_molecule[6].slice(4),nucleophile_molecule[8].slice(4)).length.should.be.equal(4)
                }
                              
                const electrophile_molecule = reagent
                const electrophile_molecule_index = 2
                
                // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
                // Check electrophile_molecule is HBr
                
                
                        /*
        [ [ 'H', 1, 1, 1, '1y5g42jkkahi190y', '1y5g42jkkahi190i' ], 1
  [ 'H', 1, 1, 1, '1y5g42jkkahi190z', '1y5g42jkkahi190j' ], 2
  [ 'H', 1, 1, 1, '1y5g42jkkahi1910', '1y5g42jkkahi190k' ], 3
  [ 'C', 4, 6, 4, 4,
    '1y5g42jkkahi190i',
    '1y5g42jkkahi190j',
    '1y5g42jkkahi190k',
    '1y5g42jkkahi190l',
    '1y5g42jkkahi190p',
    '1y5g42jkkahi190y',
    '1y5g42jkkahi190z',
    '1y5g42jkkahi1910' ],
  [ 'H', 1, 1, 1, '1y5g42jkkahi1911', '1y5g42jkkahi190m' ], 5
  [ 'C', 6
    6,
    4,
    4,
    '1y5g42jkkahi190m',
    '1y5g42jkkahi190n',
    '1y5g42jkkahi190o',
    '1y5g42jkkahi190p',
    '1y5g42jkkahi190l',
    '1y5g42jkkahi190t',
    '1y5g42jkkahi190s',
    '1y5g42jkkahi1911' ],
  [ 'H', 1, 1, 1, '1y5g42jkkahi1912', '1y5g42jkkahi190q' ], 7
  [ 'C', 8
    6,
    4,
    4,
    '1y5g42jkkahi190q',
    '1y5g42jkkahi190r',
    '1y5g42jkkahi190s',
    '1y5g42jkkahi190t',
    '1y5g42jkkahi190o',
    '1y5g42jkkahi190n',
    '1y5g42jkkahi190x',
    '1y5g42jkkahi1912' ],
  [ 'H', 1, 1, 1, '1y5g42jkkahi1913', '1y5g42jkkahi190u' ], 9
  [ 'H', 1, 1, 1, '1y5g42jkkahi1914', '1y5g42jkkahi190v' ], 10
  [ 'H', 1, 1, 1, '1y5g42jkkahi1915', '1y5g42jkkahi190w' ], 11
  [ 'C', 12
    6,
    4,
    4,
    '1y5g42jkkahi190u',
    '1y5g42jkkahi190v',
    '1y5g42jkkahi190w',
    '1y5g42jkkahi190x',
    '1y5g42jkkahi190r',
    '1y5g42jkkahi1913',
    '1y5g42jkkahi1914',
    '1y5g42jkkahi1915' ] ]
         */
                if (this.test_number === 4) {
                    
                    electrophile_molecule[1][0].should.be.equal("H")
                    electrophile_molecule[2][0].should.be.equal("Br")
                    Set().intersection(electrophile_molecule[1].slice(4),electrophile_molecule[2].slice(4)).length.should.be.equal(2)
                }
                             
               
                const nucleophile_atom_index = this.MoleculeController(substrate).nucleophileIndex(this.test_number)
                const electrophile_atom_index = this.MoleculeController(reagent).electrophileIndex(this.test_number)

                // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
                                        /*
        [ [ 'H', 1, 1, 1, '1y5g42jkkahi190y', '1y5g42jkkahi190i' ], 1
  [ 'H', 1, 1, 1, '1y5g42jkkahi190z', '1y5g42jkkahi190j' ], 2
  [ 'H', 1, 1, 1, '1y5g42jkkahi1910', '1y5g42jkkahi190k' ], 3
  [ 'C', 4, 6, 4, 4, '1y5g42jkkahi190i', '1y5g42jkkahi190j', '1y5g42jkkahi190k','1y5g42jkkahi190l'
  ,'1y5g42jkkahi190p','1y5g42jkkahi190y','1y5g42jkkahi190z', '1y5g42jkkahi1910' ],
  [ 'H', 1, 1, 1, '1y5g42jkkahi1911', '1y5g42jkkahi190m' ], 5
  [ 'C', 6
    6,
    4,
    4,
    '1y5g42jkkahi190m',
    '1y5g42jkkahi190n',
    '1y5g42jkkahi190o',
    '1y5g42jkkahi190p',
    '1y5g42jkkahi190l',
    '1y5g42jkkahi190t',
    '1y5g42jkkahi190s',
    '1y5g42jkkahi1911' ],
  [ 'H', 1, 1, 1, '1y5g42jkkahi1912', '1y5g42jkkahi190q' ], 7
  [ 'C', 8
    6,
    4,
    4,
    '1y5g42jkkahi190q',
    '1y5g42jkkahi190r',
    '1y5g42jkkahi190s',
    '1y5g42jkkahi190t',
    '1y5g42jkkahi190o',
    '1y5g42jkkahi190n',
    '1y5g42jkkahi190x',
    '1y5g42jkkahi1912' ],
  [ 'H', 1, 1, 1, '1y5g42jkkahi1913', '1y5g42jkkahi190u' ], 9
  [ 'H', 1, 1, 1, '1y5g42jkkahi1914', '1y5g42jkkahi190v' ], 10
  [ 'H', 1, 1, 1, '1y5g42jkkahi1915', '1y5g42jkkahi190w' ], 11
  [ 'C', 12
    6,
    4,
    4,
    '1y5g42jkkahi190u',
    '1y5g42jkkahi190v',
    '1y5g42jkkahi190w',
    '1y5g42jkkahi190x',
    '1y5g42jkkahi190r',
    '1y5g42jkkahi1913',
    '1y5g42jkkahi1914',
    '1y5g42jkkahi1915' ] ]
         */
                
                if (this.test_number === 4) {
                    nucleophile_atom_index.should.be.equal(6)  // correct
                    nucleophile_molecule[nucleophile_atom_index][0].should.be.equal("C")
                    // Check double bond
                    Set().intersection(nucleophile_molecule[nucleophile_atom_index].slice(4), nucleophile_molecule[8].slice(4)).length.should.be.equal(4)
                }
                
                // const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, nucleophile_molecule_index, electrophile_molecule_index)
                // test 4 CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
                reaction = bronstedLowry.react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, nucleophile_molecule_index, electrophile_molecule_index)
                    
                // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
                if (this.test_number === 4) {
                    reaction.should.not.be.equal(false)
                }
                
                if (reaction === false) {
                    // reagent does not have a proton
                    // do Lewis acid base teaction
                    //                 // const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, test_number) => {
                
                    reaction = lewis.react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, this.test_number)
               
                     if ( reaction !== false) {
                         this.container = reaction
                     }
                
                } else {
                
                     this.container = reaction
                    
                }
                

            } else if (reagent_families.alkene.length > 0) {
                
                // Reagent is alkene
                const nucleophile_molecule = reagent
                const electrophile_molecule = substrate
                const nucleophile_molecule_index = 2
                const electrophile_molecule_index = 1

                // Find the nucleophile on the C=C bond
                const nucleophile_atom_index = this.MoleculeController(reagent).determineNucleophileIndex()

                // Find the nucleophile
                const electrophile_atom_index = this.MoleculeController(substrate).determineElectrophileIndex()
                
              
                if (this.test_number === 4) {
                   reagent[nucleophile_atom_index][0].should.be.equal("C")
                   AtomController(reagent[nucleophile_atom_index], nucleophile_atom_index, reagent.slice(1)).bondCount.should.be.equal(2)
                }
                
                // const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, nucleophile_molecule_index, electrophile_molecule_index)
                reaction = bronstedLowry.react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, nucleophile_molecule_index, electrophile_molecule_index)
                     
                if (reaction === false) {
                    // substrate does not have a proton
                    // determine electrophile atom on the substrate
                    // do Lewis acid base teaction
                    // const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, test_number) => {
                
                    reaction = lewis.react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, this.test_number)
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

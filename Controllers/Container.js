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
    }

    __doReactionRecursive(reagent_index, substrate_index) {

        if (this.container.length === 2) {
            return
        }

        if (reagent_index === undefined) {
            return this.__doReactionRecursive(reagent_index, substrate_index+1)
        }

        const reagents = this.container.slice(2,this.container.length)
        const reagent = reagents[reagent_index]

        this.container[1].should.be.an.Array()

   //     console.log(this.container[1])
      //  console.log(reagents)
     //   process.exit()



        if (reagents[reagent_index][1] === 0) {
            return this.__doReactionRecursive(reagent_index, substrate_index+1)
        }

        const substrates = this.container.slice(1,this.container.length-1)



        if (undefined === substrates[substrate_index]) {
            return
        }



        const substrate = substrates[substrate_index]

        if (substrate[substrate_index][1] === 0) {
            return
        }

        if (reagent === substrate) {
            return this.__doReactionRecursive(reagent_index, substrate_index+1)
        } else {

            const substrate_families = Families([substrate[0], 1]).families
            const reagent_families = Families([reagent[0], 1]).families

            const bronstedLowry = BronstedLowryAcidBaseReactions(this.container, this.MoleculeController, this.test_number, this.verbose)
            const lewis = LewisAcidBaseReactions(this.container, this.MoleculeController, this.test_number, this.verbose)

            // The functional group of an alkene is the C=C double bond.
            // The C=C double bond is nucleophilic
            let reaction = false


            if (substrate_families.alkene(this.verbose).length > 0) {


                const is_water = reagent[0][1].length === 3 && reagent[0][1][0][0]==='H'
                    && reagent[0][1][1][0]==='H' && reagent[0][1][2][0]==='O'



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



                const nucleophile_atom_index = this.MoleculeController(substrate).nucleophileIndex(this.test_number)

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
                const electrophile_atom_index = this.MoleculeController(reagent).electrophileIndex(this.test_number + ".1")



                reaction = bronstedLowry.react()



                // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)


                if (reaction === false) {
                    console.log("Doing lewis reaction (Controllers/Container.js) 1")
                    process.exit
                    reaction = lewis.react(nucleophile_atom_index, reagent_index)
                    if (reaction !== false) {
                        this.container = reaction
                    }

                } else {

                    this.container = reaction



                }


            } else if (reagent_families.alkene(this.verbose).length > 0) {


                const is_water = substrate[0][1].length === 3 && substrate[0][1][0][0]==='H'
                    && substrate[0][1][1][0]==='H' && substrate[0][1][2][0]==='O'


                // if substrate is water then return as is, as water does not react to alkenes.
                if (is_water) {
                    return this.__doReactionRecursive(reagent_index, substrate_index+1)
                }

                // Reagent is alkene
                const nucleophile_molecule = reagent
                const electrophile_molecule = substrate
                const nucleophile_molecule_index = 2
                const electrophile_molecule_index = 1

                // Find the nucleophile on the C=C bond
                const nucleophile_atom_index = this.MoleculeController(reagent).nucleophileIndex(this.test_number)

                // Find the nucleophile
                const electrophile_atom_index = this.MoleculeController(substrate).electrophileIndex(this.test_number)




                // const react = (nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, nucleophile_molecule_index, electrophile_molecule_index)
                reaction = bronstedLowry.react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, nucleophile_molecule_index, electrophile_molecule_index)

                if (reaction === false) {
                    // substrate does not have a proton
                    // determine electrophile atom on the substrate
                    // do Lewis acid base teaction
                    console.log("Doing lewis reaction (Controllers/Container.js) 2")
                    process.exit

                    reaction = lewis.react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, this.test_number)
                }


            }

            if (!reaction) {
                // Not alkene
                console.log("Doing Bronsted Lowry reaction: ")
                reaction = bronstedLowry.react()
            }

            if (!reaction) {
                // No alkene and not Bronsted Lowry
                // do Lewis acid base teaction
                /*
                console.log(substrate_index)
                console.log(reagent_index)
                console.log(this.container)
                console.log(reagent)
                 */
                console.log("Doing lewis reaction (Controllers/Container.js) 3")
//               process.exit()

                reaction = lewis.react(substrate_index + 1, reagent_index)
            }


            // At this point it is possible that the number of different molecules
            // to have changed. eg when the reagent bonds to the substrate
            // hence we need to check the container again
            if (reaction !== false) {
                this.container = reaction
            }

            const container_items = this.container.slice(1,this.container.length)
            if (container_items.length < reagents.length) {
                // reagent and substrate have bonded
                return this.__doReactionRecursive(reagent_index-1, substrate_index)
            }

            return this.__doReactionRecursive(reagent_index, substrate_index+1)


        }


    }

    __doReactionsRecursive(reagent_index) {

        // this needs to be changed to a recursive function as reagents can change
        const reagents = this.container.slice(2,this.container.length)

        reagents.should.be.an.Array()

        if (null === reagent_index) {
            reagent_index = reagents.length -1
        }

        // reagent is not defined or no more reagent left
        if (undefined === reagents[reagent_index] || reagents[reagent_index][1] === 0) {
            return
        }

        const reagent = reagents[reagent_index]

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


        // First element is pKa value,
        // container[2] is reagent
        // container[1] is substrate
        if (this.container.length > 2) {


            const reagents = this.container.slice(2,this.container.length).reverse()

            // SEE organic chemistry 8th edition p245
            // test 6/7
// propylene CC=C (test 6) / water H2O (test 6) / sulfuric acid H2SO4 (test 7)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)


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
        }



    } // add()

    remove() {

    }
}

module.exports = CContainer

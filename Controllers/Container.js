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

    add(molecule_array_or_string, units, verbose) {

        if (verbose) {
            console.log("Controllers/Container.js::Adding ->")
            console.log(molecule_array_or_string)
            console.log("to container")
        }
        
        // Organic Chemistry 8th edition, P199
        // test_number 5
        // [Br-] + carbocation
        
        const molecule = (typeof molecule_array_or_string !== "string" ?
            molecule_array_or_string :
            this.MoleculeFactory(molecule_array_or_string))
        // Add item to container.

        this.container.push(molecule)

        if (verbose) {
            console.log("Controllers/Container.js:: Container before processing reaction ->")
            console.log(this.container)
            console.log("Length:" + this.container.length)
        }

        // First element is pKa value,
        // container[2] is reagent
        // container[1] is substrate
        if (this.container.length > 2) {

            const substrate = this.container[1]

            if (verbose) {
                console.log("Controllers/Container.js:: Got substrate ->")
                console.log(this.container[1])
            }

            const reagent = this.container[2]

            if (verbose) {
                console.log("Controllers/Container.js:: Got reagent ->")
                console.log(this.container[2])
            }

            const substrate_families = Families(substrate.slice(1), verbose).families
            const reagent_families = Families(reagent.slice(1), verbose).families

            if (verbose) {
                console.log("Controllers/Container.js substrate families ->")
                console.log(substrate_families)
                console.log("Controllers/Container.js substrate alkene ->")
                console.log(substrate_families.alkene(verbose))
                console.log("Controllers/Container.js reagent families ->")
                console.log(reagent_families)
                console.log("Controllers/Container.js reagent alkene ->")
                console.log(reagent_families.alkene(verbose))
            }

            const bronstedLowry = BronstedLowryAcidBaseReactions(this.container, this.MoleculeController, this.test_number, verbose)
            const lewis = LewisAcidBaseReactions(this.container, this.MoleculeController, this.test_number, verbose)

            // The functional group of an alkene is the C=C double bond.
            // The C=C double bond is nucleophilic
            let reaction = false

            // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
            if (this.test_number === 4) {
                substrate_families.alkene().length.should.be.equal(2)
            }


            if (substrate_families.alkene(verbose).length > 0) {

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
                    Set().intersection(nucleophile_molecule[6].slice(4), nucleophile_molecule[8].slice(4)).length.should.be.equal(4)
                }

                const electrophile_molecule = reagent
                const electrophile_molecule_index = 2

                if (this.test_number === 4) {

                    electrophile_molecule[1][0].should.be.equal("H")
                    electrophile_molecule[2][0].should.be.equal("Br")
                    Set().intersection(electrophile_molecule[1].slice(4), electrophile_molecule[2].slice(4)).length.should.be.equal(2)
                }


                const nucleophile_atom_index = this.MoleculeController(substrate).nucleophileIndex(this.test_number)
                const electrophile_atom_index = this.MoleculeController(reagent).electrophileIndex(this.test_number + ".1")


                // See organic chemistry 8th edition ch 6 p 235
                // C=C (butene, nucleophile) -> HBr (H is electrophile)
                if (this.test_number === 4) {
                    electrophile_atom_index.should.be.equal(1)
                }


                // See organic chemistry 8th edition ch 6 p 235
                // C=C (butene, nucleophile) -> HBr (H is electrophile)
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
                    reaction = lewis.react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, this.test_number)
                    if (reaction !== false) {
                        this.container = reaction
                    }

                } else {
                    this.container = reaction
                }

            } else if (reagent_families.alkene(verbose).length > 0) {

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
                    reaction = lewis.react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index, this.test_number)
                }

            }

            if (!reaction) {
                // Not alkene
                reaction = bronstedLowry.react()
            }

            if (this.test_number === 1) {
                reaction.should.not.be.equal(false)
            }

            // [Br-] (nucleophile) -----> carbocation
            // Br atom should bond to carbon that has three bonds
            // Target atom index should be 8
            // Source atom index should be 1
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

        } else {
            console.log("Controller/Container.js:: Container only has substrate so no processing a reaction ")
        }

        if (verbose) {
            console.log("Controller/Container.js:: Container after adding -> ")
            console.log(molecule_array_or_string)
            console.log(this.container)
        }


    } // add()

    remove() {

    }
}

module.exports = CContainer

// @see Organic Chemistry 8th Edition P51
const CAtom = require('../Controllers/Atom')
const Families = require('../Models/Families')
const _ = require('lodash');

const BronstedLowryAcidBaseReactions = (container, MoleculeController, test_number, verbose) => {

    const react = () => {

        // EXPLANATION
        // In a Browsted Lowry reaction one molecule donates a proton
        // to another atom.
        // The proton is the target (what the arrow would be pointing to)
        // and is our electrophile.
        // The atom receiving the proton is the source (what the arrow would be 
        // pointing from) and is our nucleophile.
        
        // SEE organic chemistry 8th edition p51
        
        // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)

        // Find what item in the container has the proton
        // map molecules that have protons
        const proton_map = _.cloneDeep()

        const substrate_proton_index = MoleculeController([container[1][0], 1]).indexOf("H", false, verbose)
        const reagent_proton_index = MoleculeController([container[2][0], 1]).indexOf("H", false, verbose)

        if (substrate_proton_index !== false && reagent_proton_index === false) {
            electrophile_molecule_index = 1
            electrophile_molecule = container[electrophile_molecule_index]
            nucleophile_molecule_index = 2
            nucleophile_molecule = container[nucleophile_molecule_index]
        } else if (substrate_proton_index === false && reagent_proton_index !== false) {
            // Cl- (nucleophile)  <---- H3O (electrophile, what arrow points to)
            // test 4 CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
            electrophile_molecule_index = 2
            electrophile_molecule = container[electrophile_molecule_index]
            nucleophile_molecule_index = 1
            nucleophile_molecule = container[nucleophile_molecule_index]

        } else if (substrate_proton_index=== false && reagent_proton_index === false) {
            console.log("substrate_proton_index and reagent_proton_index are false")
            return false
        }else {
            // -6.3 HCl, 14 H2O
            // Test number 1
            // Container - [false, [HCl], [H2O]]
            //  console.log('here')
            //process.exit()

            // compare pka values
            if (container[1][0] <= container[2][0]) {
                // @see Organic Chemistry 8th Edition P51
                // HCl is the proton donator and is our electrophile as protons do not have electrons
                // H2O (nucleophile) is the proton acceptor as the oxygen has lone pairs of electrons.
                electrophile_molecule_index = 1
                electrophile_molecule = container[electrophile_molecule_index]
                nucleophile_molecule_index = 2 //
                nucleophile_molecule = container[nucleophile_molecule_index]
            } else {
                // @see Organic Chemistry 8th Edition P51
                // HCl is the proton donator and is our electrophile as protons do not have electrons
                // H2O (nucleophile) is the proton acceptor as the oxygen has lone pairs of electrons.
                electrophile_molecule_index = 2
                electrophile_molecule = container[electrophile_molecule_index]
                nucleophile_molecule_index = 1
                nucleophile_molecule = container[nucleophile_molecule_index]
            }
        }

        if (undefined === electrophile_molecule ) {
            console.log("BronstedLowryAcidBaseReactions::electrophile_molecule is undefined or null")
            process.exit()
        }

        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)



        // react(nucleophile_molecule, nucleophile_atom_index, electrophile_molecule, electrophile_atom_index)
        // Here the substrate (base) has no proton and the reagent (acid) does.
        // So we remove the proton from the reagent and add it to the substrate.
//        const proton_index = MoleculeController(container[electrophile_molecule_index]).indexOf("H")
        MoleculeController(container[electrophile_molecule_index]).indexOf("H").should.be.greaterThan(-1);


        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        // remove proton
        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
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

        MoleculeController(container[electrophile_molecule_index]).indexOf("H").should.not.be.equal(false)

        // Some checks
        container[0].should.be.an.Boolean()
        _.cloneDeep(container).slice(1).map((molecule)=>{
            molecule.length.should.be.equal(2)
            molecule[0].should.be.an.Array() // actual molecule
            molecule[1].should.be.an.Number() // units
            molecule[0].length.should.be.equal(2) // pKa, atoms
            molecule[0][0].should.be.an.Number() // pka
            molecule[0][1].should.be.an.Array() // atoms
            _.cloneDeep(molecule[0][1]).map((atom)=>{
                atom.should.be.an.Array()
            })
        })

        container = MoleculeController(container[electrophile_molecule_index]).removeProton(
            container,
            MoleculeController(container[electrophile_molecule_index]).indexOf("H"),
            electrophile_molecule_index
        )

        // Some checks
        container[0].should.be.an.Boolean()
        _.cloneDeep(container).slice(1).map((molecule)=>{
            molecule.length.should.be.equal(2)
            molecule[0].should.be.an.Array() // actual molecule
            molecule[1].should.be.an.Number() // units
            molecule[0].length.should.be.equal(2) // pKa, atoms
            if (molecule[0][0] !== null) {
                molecule[0][0].should.be.an.Number() // pka
            }
            molecule[0][1].should.be.an.Array() // atoms
            _.cloneDeep(molecule[0][1]).map((atom)=>{
                atom.should.be.an.Array()
            })
        })


        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        // proton is the last element in the container
        const proton = container[container.length-1]

        proton.should.be.an.Array()
        proton.length.should.be.equal(2)
        proton[1].should.be.an.Number()
        proton[0].should.be.an.Array()

        // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)

        /*
                push: (atoms_or_atomic_symbols, container,
                target_molecule_index,
                test_number,
                target_atom_index,
                source_atom_index,
                source_molecule_index) => {
         */
        // Target atom is what the arrow points to (attacks) and will
        // always be the proton atom from the electrophile.
        // Source atom is what the arrow points from (tail) and will
        // always be the atom from the nucleophile.
        // Add proton to nucleophile
        MoleculeController(container[nucleophile_molecule_index]).nucleophileIndex().should.be.greaterThan(-1)


        container[0].should.be.an.Boolean()
        _.cloneDeep(container).slice(1).map((molecule)=>{
            molecule.length.should.be.equal(2)
            molecule[0].should.be.an.Array() // actual molecule
            molecule[1].should.be.an.Number() // units
            molecule[0].length.should.be.equal(2) // pKa, atoms
            if (molecule[0][0] !== null) {
                molecule[0][0].should.be.an.Number() // pka
            }
            molecule[0][1].should.be.an.Array() // atoms
            _.cloneDeep(molecule[0][1]).map((atom)=>{
                atom.should.be.an.Array()
            })
        })

        // HCl is the proton donator and is our electrophile as protons do not have electrons (target)
        // H2O (nucleophile) is the proton acceptor as the oxygen has lone pairs of electrons (source)

        //push(atoms_or_atomic_symbols, container, target_molecule_index, test_number, target_atom_index, source_atom_index, source_molecule_index)
        console.log("target atom index")
        console.log(container[electrophile_molecule_index][0])
        console.log(MoleculeController(container[electrophile_molecule_index]).indexOf("H"))
        container = MoleculeController(container[nucleophile_molecule_index]).push(proton, container,
            container.length -1,
            test_number,
            MoleculeController(container[electrophile_molecule_index]).indexOf("H"),
            MoleculeController(container[nucleophile_molecule_index]).nucleophileIndex(),
            nucleophile_molecule_index
        )


        container.splice(container.length-1,1) // remove proton from container


        // CC=CC (nucleophile, substrate) -------> HBr (electrophile, reagent)
        // After pushing proton to nucleophile


        // SEE organic chemistry 8th edition p245
// propylene CC=C (6.1) / water H2O (6.2) / sulfuric acid H2SO4 (6.3)
// 1. H+ (an electrophile, sulfuric acid) adds to the sp2 carbon (double bond) of the
// alkene (a nucleophile) that is bonded to the most hydrogens.
// 2. H2O (a nucleophile) adds to the carbocation (an electrophile), forming a protonated alcohol.
// 3. The protonated alcohol loses a proton because the pH of the solution is greater
// than the pKa of the protonated alcohol (Section 2.10).
// (We saw that protonated alcohols are very strong acids; Section 2.6.)

        return container

    }

    return {
        react: react
    }

}

module.exports = BronstedLowryAcidBaseReactions

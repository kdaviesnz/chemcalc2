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
        const proton_index_map = _.cloneDeep(container).slice(1).reduce((carry, molecule_with_units, index)=> {
            const proton_atom_index = MoleculeController([molecule_with_units[0], 1]).indexOf("H", false, verbose)
            if (proton_atom_index === false) {
                return carry
            }
            if (carry === null) {
                return {
                    "proton_molecule_index": index + 1,
                    "proton_atom_index": proton_atom_index,
                    "pKa": molecule_with_units[0][0]
                }
            }
            return molecule_with_units[0][0] < carry.pKa? {
                "proton_molecule_index": index + 1,
                "proton_atom_index": proton_atom_index,
                "pKa": molecule_with_units[0][0]
            }:carry
        }, null)


        if (proton_index_map === null) {
            return false
        }

        const target_molecule_index = proton_index_map.proton_molecule_index // this is the molecule containing the proton (electrophile)
        const target_proton_atom_index = proton_index_map.proton_atom_index

        /*
        console.log( _.cloneDeep(container))
        console.log( _.cloneDeep(container).slice(1))
        console.log( _.cloneDeep(container).slice(1).splice(target_molecule_index-2, 1))
        process.exit()

         */

        // Next find what molecule has the source atom that attacks the proton
        const source_index_map = _.cloneDeep(container).slice(1).reduce((carry, molecule_with_units, index)=> {
            const nucleophile_atom_index = MoleculeController([molecule_with_units[0], 1]).nucleophileIndex()
            if (nucleophile_atom_index === false || index === proton_index_map.proton_molecule_index - 1) {
                return carry
            }
            if (carry === null) {
                return {
                    "source_molecule_index": index + 1,
                    "source_atom_index": nucleophile_atom_index,
                    "pKa": molecule_with_units[0][0]
                }
            }
            return molecule_with_units[0][0] < carry.pKa? {
                "source_molecule_index": index + 1,
                "source_atom_index": nucleophile_atom_index,
                "pKa": molecule_with_units[0][0]
            }:carry
        }, null)

        if (undefined == source_index_map.source_atom_index) {
            console.log("WARNING: source atom index is undefined")
            console.log("Target index map:")
            console.log(proton_index_map)
            console.log("Source index map:")
            console.log(source_index_map)
            console.log(container[source_index_map.source_molecule_index][0])
            console.log("Container:")
            container.slice(1).map((item)=>{
                console.log(item[0])
            })
        }

        container = MoleculeController(container[proton_index_map.proton_molecule_index]).removeProton(
            container,
            MoleculeController(container[proton_index_map.proton_molecule_index]).indexOf("H"),
            proton_index_map.proton_molecule_index,
            container[source_index_map.source_molecule_index][1] // how many units of molecules to remove proton from
        )

        const proton = container[container.length-1]

        proton.should.be.an.Array()
        proton.length.should.be.equal(2)
        proton[1].should.be.an.Number()
        proton[0].should.be.an.Array()

        // Add proton to nucleophile
        //push(atoms_or_atomic_symbols, container, target_molecule_index, test_number, target_atom_index, source_atom_index, source_molecule_index)
        // Source is our nucleophile that is attacking the proton molecule (electrophile)



        container = MoleculeController(container[source_index_map.source_molecule_index]).addProton(proton, container,
            container.length -1,
            test_number,
            0, // this will 0 as we've removed the proton from the electrophile and added it to our container as a separate item
            source_index_map.source_atom_index,
            source_index_map.source_molecule_index
        )

        // Adjust number of units
        if (container[container.length-1][1] > container[source_index_map.source_molecule_index][1]) {
            container[container.length-1][1] = container[container.length-1][1] - container[source_index_map.source_molecule_index][1]
        } else {
            // All protons have been consumec by source
            container.splice(container.length-1,1) // remove proton from container
        }

        return container

    }

    return {
        react: react
    }

}

module.exports = BronstedLowryAcidBaseReactions

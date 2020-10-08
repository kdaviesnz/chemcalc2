//SN2
/*
@see notes 20, 24

The SN2 reaction is a type of reaction mechanism that is common in organic chemistry. In this mechanism, one bond is broken and one bond is formed synchronously, i.e., in one step. SN2 is a kind of nucleophilic substitution reaction mechanism. Since two reacting species are involved in the slow (rate-determining) step, this leads to the term substitution nucleophilic (bi-molecular) or SN2, the other major kind is SN1.[1] Many other more specialized mechanisms describe substitution reactions.
The reaction type is so common that it has other names, e.g. "bimolecular nucleophilic substitution", or, among inorganic chemists, "associative substitution" or "interchange mechanism".
*/

const ReactionFactory = require('../factories/ReactionFactory.js')

const SN2 = (target_molecule, source_molecule, do_verification_checks, callback) => {

    const process = () => () => {

        const target_molecule_controller = MoleculeController(target_molecule)
        const source_molecule_controller = MoleculeController(source_molecule)

        if (target_molecule.functionalGroups().akyl_halide) {

            // target atom is the carbon atom bonded to the halide
            const target_atom = target_molecule_controller.halogen().outer_shell_electrons.filter(
                (electron) => electron.bonded_atom.atomic_symbol === "C").pop()

            // source atom is the nucleophile on the source molecule. If molecule had two atoms and one of                // the atoms is a metal the nucleophile will be the non metal atom
            const source_atom = source_molecule_controller.nucleophile()

        }

        // Break source atom from source molecule
        const source_break_bond_reaction = source_molecule_controller.breakBonds(source_atom.__id)
        const source_atom_nucleophile = source_break_bond_reaction.products[1]
        const source_molecule_minus_nucleophile = source_break_bond_reaction.products[0]

        // Bond source atom nucleophile to target carbon atom
        // This should push the atom to be substituted off the carbon atom
        const add_bond_reaction = target_molecule_controller.addBond(target_atom.outer_shell_electrons, source_atom_nucleophile, uniqid(), target_atom.index)

        return [source_molecule_minus_nucleophile, ...add_bond_reaction.products]

    }

    const reaction = ReactionFactory([hydrogen_source, target_molecule], "reaction", process())
    callback(null === reaction || reaction.products.length < 2?new Error("Failed SN2"):null,reaction)

}

module.exports = SN2














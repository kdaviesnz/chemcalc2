//SN1
/*
@see notes 20, 24

The SN1 reaction is a substitution reaction in organic chemistry. "SN" stands for "nucleophilic substitution", and the "1" says that the rate-determining step is unimolecular.[1][2] Thus, the rate equation is often shown as having first-order dependence on electrophile and zero-order dependence on nucleophile. This relationship holds for situations where the amount of nucleophile is much greater than that of the carbocation intermediate. Instead, the rate equation may be more accurately described using steady-state kinetics. The reaction involves a carbocation intermediate and is commonly seen in reactions of secondary or tertiary alkyl halides under strongly basic conditions or, under strongly acidic conditions, with secondary or tertiary alcohols. With primary and secondary alkyl halides, the alternative SN2 reaction occurs. In inorganic chemistry, the SN1 reaction is often known as the dissociative mechanism. This dissociation pathway is well-described by the cis effect. A reaction mechanism was first proposed by Christopher Ingold et al. in 1940.[3] This reaction does not depend much on the strength of the nucleophile unlike the SN2 mechanism. This type of mechanism involves two steps. The first step is the reversible ionization of Alkyl halide in the presence of aqueous acetone or an aqueous ethyl alcohol. This step provides a carbocation as an intermediate.

*/
const ReactionFactory = require('../factories/ReactionFactory.js')

const SN1 = (reagent_molecule, starting_molecule, do_verification_checks, callback) => {

    const process = () => () => {

        const reagent_molecule_controller = MoleculeController(reagent_molecule)
        const starting_molecule_controller = MoleculeController(starting_molecule)

        if (starting_molecule.functionalGroups().akyl_halide) {
            // starting atom is the carbon atom bonded to the halogen
            const carbon_atom = starting_molecule_controller.halogen().outer_shell_electrons.filter(
                (electron) => electron.bonded_atom.atomic_symbol === "C").pop()
            const halogen = starting_molecule_controller.halogen()
        }

        // Break halogen atom from source atom. Source atom should now be a carbocation
        const break_halogen_bond_reaction = starting_molecule_controller.breakBonds(halogen.__id)
        const halogen_nucleophile = break_bond_reaction.products[1]
        const starting_molecule_minus_nucleophile = break_bond_reaction.products[0]
        const carbocation = starting + molecule_minus_nucleophile[source_atom.index]

        /*
        If you generate a carbocation you want to look left and up and down and see if there is carbon with            a higher substitution. If there is carbon that is ternary (one hydrogen coming of the carbon) or              triternary (no hydrogens coming off the carbon) then you will get a shift.
        */
        const reagent_nucleophile = reagent_molecule_controller.nucleophile()

        // Bond source atom nucleophile to target carbon atom
        const add_bond_reaction = starting_molecule_controller.addBonds(carbocation.outer_shell_electrons, reagent_nucleophile, carbocation.index)

        return [starting_molecule_minus_nucleophile, ...add_bond_reaction.products]

    }

    const reaction = ReactionFactory([hydrogen_source, target_molecule], "reaction", process())
    callback(null === reaction || reaction.products.length < 2 ? new Error("Failed SN1") : null, reaction)

}

module.exports = SN1














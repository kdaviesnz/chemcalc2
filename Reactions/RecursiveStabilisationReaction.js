//RecursiveStabilisationReaction
const ReactionFactory = require('../factories/ReactionFactory.js')
const MoleculeFactory = require('../factories/MoleculeFactory.js')
const FullArrowPushReaction = require('./FullArrowPushReaction.js')
const MoleculeController = require('../controllers/MoleculeController.js')
const should = require('should');
const _ = require('lodash');
const FindAnionAtom = require('../Commands/FindAnionAtom')
const FindCationAtom = require('../Commands/FindCationAtom')
const BondAtoms = require('../Commands/BondAtoms')
const BondMolecules = require('../Commands/BondMolecules')
const RecursiveStabilisationReactionRecurse = (molecule, reagent_molecule, recursion_level) => {


    molecule.should.be.a.Object()
    recursion_level.should.be.a.Number()

    if (recursion_level > 100) {
        return reagent_molecule === null ? [molecule] : [molecule, reagent_molecule]
    }

    const molecule_controller = MoleculeController(molecule)
    const molecule_anion_atom = FindAnionAtom(molecule)
    const molecule_cation_atom = FindCationAtom(molecule)


    if (null === reagent_molecule) {
        // If the molecule has a cation atom and a anion atom then bond the atoms together, then call react() again.
        if (molecule_anion_atom !== null && molecule_cation_atom !== null) {
            const reaction = BondAtoms(molecule, molecule_cation_atom, molecule_anion_atom)
            const product = reaction.products.pop()
            return RecursiveStabilisationReactionRecurse(product, null, recursion_level + 1)
        } else {
            // Molecule is stable, exit reaction.
            return [molecule]
        }

    } else {

        // We're reacting a molecule with a reagent.
        reagent_molecule.should.be.a.Object()

        const reagent_molecule_anion_atom = FindAnionAtom(reagent_molecule)
        const reagent_molecule_cation_atom = FindCationAtom(reagent_molecule)

        if (reagent_molecule_anion_atom === null && reagent_molecule_cation_atom === null) {
            // reagent molecule is stable so exit reaction.
            return [molecule, reagent_molecule]
        }

        if (molecule_anion_atom === null && molecule_cation_atom === null) {
            // molecule is stable so exit reaction.
            return [molecule, reagent_molecule]
        }

        if (molecule_anion_atom !== null && reagent_molecule_cation_atom !== null) {
            molecule_anion_atom.should.be.a.Object()
            reagent_molecule_cation_atom.should.be.a.Object()
            // We have a reaction
            const reaction = BondMolecules(molecule, reagent_molecule, molecule_anion_atom, false, false, reagent_molecule_cation_atom)
            const product = reaction.products.pop()
            return RecursiveStabilisationReactionRecurse(product, null, recursion_level + 1)
        }

        if (molecule_cation_atom !== null && reagent_molecule_anion_atom !== null) {
            molecule_cation_atom.should.be.a.Object()
            reagent_molecule_anion_atom.should.be.a.Object()
            // We have a reaction
            const reaction = BondMolecules(molecule, reagent_molecule, false, molecule_cation_atom, reagent_molecule_anion_atom, false)
            const product = reaction.products.pop()
            return RecursiveStabilisationReactionRecurse(product, null, recursion_level + 1)
        }

    }

}

// This should be called recursively until we get no changes
const RecursiveStabilisationReaction =

    (molecule, reagent_molecule, recursion_level, callback) => {


        const react = () => () => {

            molecule.should.be.a.Object()
            recursion_level.should.be.a.Number()

            return RecursiveStabilisationReactionRecurse(molecule, reagent_molecule, recursion_level)


        } // const react

        const reaction = ReactionFactory([molecule, reagent_molecule], "reaction", react())
        callback(null === reaction || reaction.products.length === 0?new Error("Failed RecursiveStabilisationReaction"):null,reaction)

    }

module.exports = RecursiveStabilisationReaction
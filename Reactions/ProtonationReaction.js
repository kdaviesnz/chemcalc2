//ProtonationReaction
const ReactionFactory = require('../factories/ReactionFactory.js')
const MoleculeFactory = require('../factories/MoleculeFactory.js')
const FullArrowPushReaction = require('./FullArrowPushReaction.js')
const MoleculeController = require('../controllers/MoleculeController.js')
const should = require('should');
const RemoveProton = require('../Commands/RemoveProton')
const AddProton = require('../Commands/AddProton')

const ProtonationReaction = (hydrogen_atom, target_molecule, target_molecule_atom_index, hydrogen_atom_proton_source_molecule, do_verification_checks, callback) => {

        /*
        Eg alkene molecule + HCl (proton added to carbon atom of alkene double bond)
        hydrogen_atom = hydrogen atom of HCl
        target_molecule = alkene molecule
        target_molecule_atom_index = carbon atom of alkene double bond
        */
        hydrogen_atom.should.be.a.Object()
        target_molecule.should.be.a.Object()
        target_molecule_atom_index.should.be.a.Number()
        hydrogen_atom.should.have.property('atomicSymbol')
        hydrogen_atom.atomicSymbol.should.equal('H')

        // Verify carbon atoms
        target_molecule.atoms.map(
            (atom, i) => {
                    if (atom.atomicSymbol==='C') {
                            atom.outer_shell_electrons.length.should.be.equal(4)
                    }
            }
        )

        const hydrogen_source = MoleculeFactory([],[hydrogen_atom])
        hydrogen_source.should.be.a.Object()

        const react = () => () => {

                /* In chemistry, protonation is the addition of a proton to an atom, molecule, or ion, forming the conjugate acid. Some examples include.
                   the protonation of water by sulfuric acid: H2SO4 + H2O ⇌ H3O+ + HSO
                */
                const proton = hydrogen_atom.protons[0]

                if (hydrogen_atom_proton_source_molecule === target_molecule) {

                        const target_molecule_proton_removed = RemoveProton(target_molecule, proton).pop()
                        const target_molecule_proton_moved = AddProton(target_molecule_proton_removed, proton, target_molecule_atom_index).pop()
                        return [target_molecule_proton_moved]

                } else {
                        // Remove proton from source hydrogen atom.
                        // eg for alkene + HCl hydrogen atom will be the hydrogen atom of the HCl
                        const hydrogen_atom_proton_source_molecule_proton_removed = RemoveProton(hydrogen_atom_proton_source_molecule, proton).pop()

                        // Add proton from source hydrogen atom to target molecule
                        // eg for alkene + HCl target molecule will be the alkene
                        const target_molecule_proton_added = AddProton(target_molecule, proton, target_molecule_atom_index).pop()

                        return [target_molecule_proton_added,hydrogen_atom_proton_source_molecule_proton_removed]
                }


        } // const react

        const reaction = ReactionFactory([hydrogen_source, target_molecule], "reaction", react())

        callback(null === reaction || reaction.products.length === 0?new Error("Failed protonation"):null,reaction)

}

module.exports = ProtonationReaction
const MoleculeController = require('../controllers/MoleculeController')
const FindAnionAtom = require('./FindAnionAtom')
const FindCationAtom = require('./FindCationAtom')

const BondMolecules = (molecule, reagent_molecule, molecule_anion_atom = null,  molecule_cation_atom = null, reagent_molecule_anion_atom = null, reagent_molecule_cation_atom = null) => {

    const r_m_c = MoleculeController(reagent_molecule)

    if (null == reagent_molecule_cation_atom) {
        reagent_molecule_cation_atom = FindCationAtom(reagent_molecule)
    }

    if (null == reagent_molecule_anion_atom) {
        reagent_molecule_anion_atom = FindAnionAtom(reagent_molecule)
    }

    if (null == molecule_anion_atom) {
        molecule_anion_atom = FindAnionAtom(molecule)
    }

    if (null == molecule_cation_atom) {
        molecule_cation_atom = FindCationAtom(molecule)
    }


    // const reaction = reagent_molecule_controller.addMolecule(molecule, molecule_cation_atom, reagent_molecule, reagent_molecule_anion_atom)
    // onst reaction = BondMolecules(molecule, reagent_molecule, false, molecule_cation_atom, reagent_molecule_anion_atom, false)
    if (molecule_anion_atom === false) {
        return r_m_c.addMolecule(molecule, molecule_cation_atom, reagent_molecule, reagent_molecule_anion_atom)
    } else {
        return r_m_c.addMolecule(molecule, molecule_anion_atom, reagent_molecule, reagent_molecule_cation_atom)
    }

}

module.exports = BondMolecules
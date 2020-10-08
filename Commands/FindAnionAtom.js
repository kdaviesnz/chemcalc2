const should = require('should')
const MoleculeController = require('../controllers/MoleculeController')
const _ = require('lodash');

const FindAnionAtom = (molecule) => {
    const m_c = MoleculeController(molecule)
    return  m_c.findAnionAtom(_.map(molecule.atoms, _.clone), 0)
}
module.exports = FindAnionAtom
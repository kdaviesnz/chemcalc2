const should = require('should')
const MoleculeController = require('../controllers/MoleculeController')
const _ = require('lodash');

const FindCationAtom = (molecule) => {
    const m_c = MoleculeController(molecule)
    return  m_c.findCationAtom(_.map(molecule.atoms, _.clone), 0)
}
module.exports = FindCationAtom
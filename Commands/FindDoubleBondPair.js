const should = require('should')
const MoleculeController = require('../controllers/MoleculeController')

const FindDoubleBondPair = (molecule) => {
    const m_c = MoleculeController(molecule)
    const double_bond_atom_pair = m_c.findDoubleBondPair(molecule.atoms, "C", "C", 0)
    double_bond_atom_pair.should.be.a.Array()
    double_bond_atom_pair.length.should.equal(2)
    return double_bond_atom_pair
}
module.exports = FindDoubleBondPair
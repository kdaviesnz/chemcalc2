const should = require('should')
const MoleculeController = require('../controllers/MoleculeController')
const FindDoubleBondPair = require('./FindDoubleBondPair')

const FindProtonationTargetAtom = (molecule, target_pair = null) => {

    const protonation_target_atom = target_pair[0].akylGroupCount  <= target_pair[1].akylGroupCount?target_pair[1]:target_pair[0]
    const m_c = MoleculeController(molecule)
    protonation_target_atom.should.be.a.Object()
    protonation_target_atom.should.have.property("__id")
    protonation_target_atom.__id.should.be.a.String()
    protonation_target_atom.index = m_c.findAtomByAtomicIdIndex(molecule.atoms, protonation_target_atom.__id, 0)
    return protonation_target_atom
}
module.exports = FindProtonationTargetAtom
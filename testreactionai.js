const ReactionAI =  require('./Components/State/ReactionAI')
const MoleculeFactory = require('./Models/MoleculeFactory')
const VMolecule = require('./Components/Stateless/Views/Molecule')

// https://en.wikipedia.org/wiki/Pinacol_rearrangement
const pinacolone = MoleculeFactory("CC(=O)C(C)(C)C")
console.log("Pinacolone:")
console.log(VMolecule([pinacolone,1]).compressed())
const r = new ReactionAI()
r.synthesise(pinacolone)

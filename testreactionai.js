const ReactionAI =  require('./Components/State/ReactionAI')
const MoleculeFactory = require('./Models/MoleculeFactory')
const VMolecule = require('./Components/Stateless/Views/Molecule')

// https://en.wikipedia.org/wiki/Pinacol_rearrangement
const pinacolone = MoleculeFactory("CC(=O)C(C)(C)C")

//https://en.wikipedia.org/wiki/Leuckart_reaction
const isopropylamine = MoleculeFactory("CC(C)N")
//console.log("Pinacolone:")
//console.log(VMolecule([pinacolone,1]).compressed())
const r = new ReactionAI()
r.synthesise(isopropylamine)
//r.synthesise(pinacolone)


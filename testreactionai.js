const ReactionAI =  require('./Components/State/ReactionAI')
const MoleculeFactory = require('./Models/MoleculeFactory')
const VMolecule = require('./Components/Stateless/Views/Molecule')

// Chemicals to synthesise
// https://en.wikipedia.org/wiki/Pinacol_rearrangement
const pinacolone = MoleculeFactory("CC(=O)C(C)(C)C")

//https://en.wikipedia.org/wiki/Leuckart_reaction
const isopropylamine = MoleculeFactory("CC(C)N")
const m = MoleculeFactory("CC(CC1=CC=CC=C1)NC")
//console.log(VMolecule([m,1]).canonicalSMILES())
//console.log(hjkkkll)
const imine = MoleculeFactory("CC(CC1=CC2=C(C=C1)OCO2)=NC")
const imine2 = MoleculeFactory("CC(CC1=CC=CC=C1)=NC") // phenylacetone
//console.log(VMolecule([imine,1]).compressed())
//console.log(VMolecule([imine,1]).canonicalSMILES())
//console.log(mnb)
const r = new ReactionAI()
// r.synthesise(pinacolone)
//r.synthesise(isopropylamine)
r.synthesise(imine2)
//r.synthesise(imine)



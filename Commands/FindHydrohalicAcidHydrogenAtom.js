const should = require('should')

const FindHydrohalicAcidHydrogenAtom = (hydrohalic_acid) => {
    // Get index of hydrohalic_acid target atom. This is the hydrogen atom attached to a non-hydrogen
    return  hydrohalic_acid.atoms.length===1?0:hydrohalic_acid.atoms.filter((atom)=>"H"===atom.atomicSymbol && atom.outer_shell_electrons.filter(
        (electron)=>undefined !== electron.bonded_atom && electron.bonded_atom.atomicSymbol !== "H"
    ))[0]
}
module.exports = FindHydrohalicAcidHydrogenAtom
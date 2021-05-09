const CMolecule = require('../../../Controllers/Molecule')
const CAtom = require('../../../Controllers/Atom')
const _ = require('lodash');
const Set = require('../../../Models/Set')

const VAtom = (CAtom) => {

    return {
        "atomic_symbol": CAtom.symbol,
        "id": CAtom.atomIndex,
        "hydrogens": CAtom.indexedBonds("").filter((h)=> {
            return h.atom[0] === "H"
        }). map((h)=>{
            return {"id":h.atom_index, "atomic_symbol":h.atom[0]}
        }),
        "charge": CAtom.charge,
        "single_bonds": CAtom.indexedBonds("").filter((b)=> {
            return b.atom[0] !== "H"
        }). map((b)=>{
            return {"id":b.atom_index, "atomic_symbol":b.atom[0]}
        }),
        "double_bonds": CAtom.indexedDoubleBonds("").map((b)=>{
            return {"id":b.atom_index, "atomic_symbol":b.atom[0]}
        }),
        "triple_bonds": CAtom.indexedTripleBonds("").map((b)=>{
            return {"id":b.atom_index, "atomic_symbol":b.atom[0]}
        }),
        "free_electrons": CAtom.freeElectrons(),
        "free_slots": CAtom.freeSlots()
    }

}
module.exports = VAtom

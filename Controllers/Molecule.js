// 

const CMolecule = (mmolecule) => {
   return {
       // mmolecule: [pKa, atom, atom, atom ...]
       // atom: [atomic symbol, proton count, max valence count, velectron1, velectron2,...]
       indexOf : (atom_or_atomic_symbol) = {
          if (typeof atom_or_atomic_symbol === "string") {
             // find index of atom in molecule with matching atomic symbol
             return mmolecule.reduce((carry, current, index)=>{
                return typeof current === "array" && current[0] === atom_or_atomic_symbol?index:carry
             }, false)
          } else {
             return mmolecule.search(atom_or_atomic_symbol)
          }
       },
       push : (atom) = { 
          // mmolecule.push(atom)
          return mmolecule
       },
       delete : (atom) = {
          // mmolecule.delete(atom)
          return mmolecule
       },
       itemAt : (index) = {
          // mmolecule[item]
          return mmolecule
       }
   }
}


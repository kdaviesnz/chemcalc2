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
       push : (atom_or_atomic_symbol) = { 
          // Find index of atom to bond to.
          // This must be atom with at least a lone pair.
          const atom =  typeof atom_or_atomic_symbol === "string" ? @todo : atom_or_atomic_symbol
          const atom_to_bond_to_index = mmolecule.reduce((carry, current_atom, index)=>{
                return typeof current === "array" 
                    && current_atom[0] !== "H"
                    && current_atom[3] - current_atom.length - 3 > 0?index:carry
             }, false
          )
          if (atom_to_bond_to_index !== false) {
             atom.push(mmolecule[atom_to_bond_to_index][mmolecule[atom_to_bond_to_index].length - 1])
             mmolecule[atom_to_bond_to_index].push(atom[atom.length - 1])
             mmolecule.push(atom)
          }
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


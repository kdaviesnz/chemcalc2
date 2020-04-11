// 

const CMolecule = (mmolecule) => {
   return {
       // mmolecule: [pKa, atom, atom, atom ...]
       // atom: [atomic symbol, proton count, max valence count, velectron1, velectron2,...]
       indexOf : (atom_or_atomic_symbol) => {
          if (typeof atom_or_atomic_symbol === "string") {
             // find index of atom in molecule with matching atomic symbol
             return mmolecule.reduce((carry, current, index)=>{
                return typeof current === "array" && current[0] === atom_or_atomic_symbol?index:carry
             }, false)
          } else {
             return mmolecule.search(atom_or_atomic_symbol)
          }
       },
       push : (atom_or_atomic_symbol) => {
          
         
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
             
             // Check atom to bond to has at least one lone pair
             if ((8 - (mmolecule[atom_to_bond_to_index].length-4))/2 > 0) {
             
             atom.push(mmolecule[atom_to_bond_to_index][mmolecule[atom_to_bond_to_index].length - 1])
             mmolecule[atom_to_bond_to_index].push(atom[atom.length - 2])
             mmolecule.push(atom)
                
             }
          }
          // mmolecule.push(atom)            
          return mmolecule
       },
       delete : (atom) => {
          // mmolecule.delete(atom)
          if (typeof atom_or_atomic_symbol === "string") {
             // find index of atom in molecule with matching atomic symbol
             const atom_index = mmolecule.reduce((carry, current, index)=>{
                return typeof current === "array" && current[0] === atom_or_atomic_symbol?index:carry
             }, false)
 
          } else {
             const atom_index =  mmolecule.search(atom_or_atomic_symbol)
          }

            if (atom_index === false || mmolecule[atom_index][3] - mmolecule[atom_index].length - 3 === 0 ) {
                return mmolecule
             }
             // Remove bond
             const electron = mmolecule[atom_index].pop()
             const bonded_atom_index = mmolecule.reduce((carry, current_atom, index)=>{
                return typeof current_atom === "array" && current_atom.indexof(electron) !== false
             }, false)
             if (bonded_atom_index === false) {
                // throw an error todo
                
             }
             // remove shared electron
             delete(mmolecule[bonded_atom_index][current_atom.indexof(electron)]
             if ( mmolecule[atom_index][3] - mmolecule[atom_index].length - 3 === 0 ) {
                delete(mmolecule[atom_index] ) 
             }
             

          return mmolecule
       },
       itemAt : (index) => {
          // mmolecule[item]
          return mmolecule
       }
   }
}

module.exports = CMolecule


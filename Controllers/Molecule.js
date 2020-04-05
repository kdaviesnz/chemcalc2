
const CMolecule = (mmolecule) => {
   return {
       // atom: [atomic symbol, proton count, max valence count, velectron1, velectron2,...]
       indexOf : (atom) = {
          if (typeof atom === "string") {
             // find atom in molecule with matching atomic symbol
          }
          // return mmolecule.indexOf(atom)
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


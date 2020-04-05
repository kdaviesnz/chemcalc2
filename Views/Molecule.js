const VMolecule = (mmolecule) => {
   return {
       // mmolecule: [pKa, atom, atom, atom ...]
       // atom: [atomic symbol, proton count, max valence count, velectron1, velectron2,...]
       canonicalSMILES : () = {
          if (mmolecule.length === 2) {
             return mmolecule[1][0]
          }
       }              
   }
}

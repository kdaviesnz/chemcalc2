const VMolecule = (mmolecule) => {
   return {
       // mmolecule: [pKa, atom, atom, atom ...]
       // atom: [atomic symbol, proton count, max valence count, std bond count, velectron1, velectron2,...]
       canonicalSMILES : () = {
          if (mmolecule.length === 2) {
             // Get number of actual bonds atom has
             const bond_count  = CMolecule(mmolecule).bondCount(mmolecule[1])
             if (bond_count > mmolecule[1][3]) {
                return "[" + mmolecule[1][0] + "+]"
             } elseif (bond_count > mmolecule[1][3]) {
                return "[" + mmolecule[1][0] + "-]"
             } else
                return mmolecule[1][0]
             }
          }
       }              
   }
}

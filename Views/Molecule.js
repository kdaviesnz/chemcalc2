const MoleculeController = require('../Controllers/Molecule')
const CAtom = require('../Controllers/Atom')

const VMolecule = (mmolecule) => {
   return {
       canonicalSMILES: (units) => {

         // Convert molecule to CanonicalSmiles
         // @todo branches, rings
         const SMILES = mmolecule.slice(1).reduce((carry, current_atom, index, arr)=> {
            // If hydrogen ignore
            if (current_atom[0]!=='H') {
               // Check if the atom is positively, negatively, or has a neutral charge
               // step 1: Get bond count
               const bond_count = CAtom(current_atom, index, mmolecule).bondCount(current_atom[0])
               const double_bond_count = CAtom(current_atom, index, mmolecule).doubleBondCount()
               console.log(bond_count)
               console.log(double_bond_count)
               // step 2: Get the standard number of bonds for the element
               const std_number_of_bonds = current_atom[3]
               // If atom has more bonds then normal then it is positive charged,
               // If atom has less bonds then normal then it is negatively charged.
               // Otherwise it is positively charged
               if (bond_count > std_number_of_bonds) {
                  carry = carry + "[" + current_atom[0] + "+]"
               } else if(bond_count < std_number_of_bonds) {
                  carry = carry + "[" + current_atom[0] + "-]"
               } else {
                  carry += current_atom[0] // eg "" + "C"
               }

            }
            return carry
         }, "")
         /*
         if (mmolecule.length === 2) {
            // Get number of actual bonds atom has
            const bond_count = CMolecule([mmolecule,1]).bondCount(mmolecule[1])
            if (bond_count > mmolecule[1][3]) {
               return "[" + mmolecule[1][0] + "+]"
            } else if (bond_count > mmolecule[1][3]) {
               return "[" + mmolecule[1][0] + "-]"
            } else
               return mmolecule[1][0]
         }
          */
         return SMILES
      },
      'render' : (units) => {
         console.log('{' + mmolecule.reduce((working, current, i, arr)=>{
            if (i > 0) {
               working += current[0] // atomic symbol
            }
            return working
         }, '') + ' X ' + units + '}')
      }
   }
}
module.exports = VMolecule
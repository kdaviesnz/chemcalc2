const MoleculeController = require('../Controllers/Molecule')

const VMolecule = (mmolecule) => {
   return {
      // mmolecule: [pKa, atom, atom, atom ...]
      // atom: [atomic symbol, proton count, max valence count, std bond count, velectron1, velectron2,...]
      // propyline CC=C
      /*
[ 12345,
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msh', 'bqdtz0bcdkf6c4ms5' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msi', 'bqdtz0bcdkf6c4ms6' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msj', 'bqdtz0bcdkf6c4ms7' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msk', 'bqdtz0bcdkf6c4ms8' ],
  [ 'C',
    6,
    4,
    4,
    'bqdtz0bcdkf6c4ms5', H
    'bqdtz0bcdkf6c4ms6', H
    'bqdtz0bcdkf6c4ms7', H
    'bqdtz0bcdkf6c4ms8',
    'bqdtz0bcdkf6c4msc',
    'bqdtz0bcdkf6c4msh',
    'bqdtz0bcdkf6c4msi',
    'bqdtz0bcdkf6c4msj',
    'bqdtz0bcdkf6c4msk' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msl', 'bqdtz0bcdkf6c4ms9' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msm', 'bqdtz0bcdkf6c4msa' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msn', 'bqdtz0bcdkf6c4msb' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4mso', 'bqdtz0bcdkf6c4msc' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msp', 'bqdtz0bcdkf6c4ms8' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msq', 'bqdtz0bcdkf6c4msg' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msr', 'bqdtz0bcdkf6c4msf' ],
  [ 'C',
    6,
    4,
    4,
    'bqdtz0bcdkf6c4ms9',
    'bqdtz0bcdkf6c4msa',
    'bqdtz0bcdkf6c4msb',
    'bqdtz0bcdkf6c4msc',
    'bqdtz0bcdkf6c4ms8',
    'bqdtz0bcdkf6c4msg',
    'bqdtz0bcdkf6c4msf',
    'bqdtz0bcdkf6c4msl',
    'bqdtz0bcdkf6c4msm',
    'bqdtz0bcdkf6c4msn',
    'bqdtz0bcdkf6c4mso',
    'bqdtz0bcdkf6c4msp',
    'bqdtz0bcdkf6c4msq',
    'bqdtz0bcdkf6c4msr' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4mss', 'bqdtz0bcdkf6c4msd' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4mst', 'bqdtz0bcdkf6c4mse' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msu', 'bqdtz0bcdkf6c4msf' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msv', 'bqdtz0bcdkf6c4msg' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msw', 'bqdtz0bcdkf6c4msb' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msx', 'bqdtz0bcdkf6c4msa' ],
  [ 'H', 1, 1, 1, 'bqdtz0bcdkf6c4msy', undefined ],
  [ 'C',
    6,
    4,
    4,
    'bqdtz0bcdkf6c4msd',
    'bqdtz0bcdkf6c4mse',
    'bqdtz0bcdkf6c4msf',
    'bqdtz0bcdkf6c4msg',
    'bqdtz0bcdkf6c4msb',
    'bqdtz0bcdkf6c4msa',
    'bqdtz0bcdkf6c4mss',
    'bqdtz0bcdkf6c4mst',
    'bqdtz0bcdkf6c4msu',
    'bqdtz0bcdkf6c4msv',
    'bqdtz0bcdkf6c4msw',
    'bqdtz0bcdkf6c4msx',
    'bqdtz0bcdkf6c4msy' ] ]

       */
      canonicalSMILES: (units) => {

         // Convert molecule to CanonicalSmiles
         // @todo branches, rings
         const SMILES = mmolecule.slice(1).reduce((carry, current, index, arr)=> {
            // If hydrogen ignore
            if (current[0]!=='H') {
               // Check if the atom is positively, negatively, or has a neutral charge
               // step 1: Get bond count
               const bond_count = MoleculeController([mmolecule, units]).bondCount(current)
               // step 2: Get the standard number of bonds for the element
               const std_number_of_bonds = current[3]
               // If atom has more bonds then normal then it is positive charged,
               // If atom has less bonds then normal then it is negatively charged.
               // Otherwise it is positively charged
               console.log(current)
               console.log(bond_count)
               console.log(std_number_of_bonds)
               if (bond_count > std_number_of_bonds) {
                  carry = carry + "[" + current[0] + "+]"
               } else if(bond_count < std_number_of_bonds) {
                  carry = carry + "[" + current[0] + "-]"
               } else {
                  carry += current[0] // eg "" + "C"
               }
            }
            return carry
         }, "")
         /*
         if (mmolecule.length === 2) {
            // Get number of actual bonds atom has
            const bond_count = CMolecule(mmolecule).bondCount(mmolecule[1])
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
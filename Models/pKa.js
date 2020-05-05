const FunctionalGroups = require("./FunctionalGroups")
const pKa = (pka_atoms) => {
// https://sciencing.com/calculate-pka-values-2765.html
  // https://www.masterorganicchemistry.com/2010/06/18/know-your-pkas/
    const fg = FunctionalGroups(pka_atoms)
    if (pka_atoms.length ===4) {
        console.log(pka_atoms)
        console.log(fg.functionalGroups)
        console.log('pKa')
    }
    const pKa_value = fg.functionalGroups.hydrochloric_acid.length > 0? -6.3
        :fg.functionalGroups.deprotonated_hydrochloric_acid.length > 0? 2.86
            :fg.functionalGroups.water.length > 0? 14
                :fg.functionalGroups.protonated_water.length > 0? -1.74:12345
    console.log(pKa_value)
    console.log("pKa.js")
    return pKa_value

}
module.exports = pKa


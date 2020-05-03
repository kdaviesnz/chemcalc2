const fg = require("FunctionalGroups")
const pKa = (atoms) => {
// https://sciencing.com/calculate-pka-values-2765.html
  // https://www.masterorganicchemistry.com/2010/06/18/know-your-pkas/
  return fg.functionalGroups.hydrochloric_acid.length > 0? -6
  :fg.functionalGroups.deprotonated_hydrochloric_acid.length > 0? 888
  :fg.functionalGroups.water.length > 0? 14
  :fg.functionalGroups.protonated_water.length > 0? -1.74
  
  
}

const CMolecule = require('../../../Controllers/Molecule')
const CAtom = require('../../../Controllers/Atom')
const _ = require('lodash');
const Set = require('../../../Models/Set')

const VAtom = (CAtom) => {

    return {
        'render': () => {

            // b = (5 - a_obj.freeElectrons().length) - (a_obj.indexedBonds("").length + a_obj.indexedDoubleBonds("").length + a_obj.indexedTripleBonds("").length)
            //  this.reaction.container_substrate[0][1][index][4] = b  > 0? "+": (b < 0?"-":"")
            const base_map = {
                "N":5,
                "C":4,
                "O":6,
                "Br":7
            }

            // this.reaction.container_substrate[0][1][index][4] = b  > 0? "+": (b < 0?"-":"")
            const charge_description = "Charge is calculated by subtracting the number of free electrons and the number of bonds from " + base_map[CAtom.symbol] + " ie " + base_map[CAtom.symbol] + ' - ' + CAtom.freeElectrons().length + " - " + (CAtom.indexedBonds("").length + CAtom.indexedDoubleBonds("").length + CAtom.indexedTripleBonds("").length) + ". If greater than 0 then atom has positive charge. If less han zero then atom has negative charge. If 0 then atom has no charge."

            console.log( {
                    "index": CAtom.atomIndex,
                    "symbol": CAtom.symbol,
                    "charge": CAtom.charge,
                    "hydrogens":  CAtom.hydrogens().length,
                    "single bonds": CAtom.indexedBonds("").length,
                    "double bonds": CAtom.indexedDoubleBonds("").length,
                    "triple bonds": CAtom.indexedTripleBonds("").length,
                    "free electrons": CAtom.freeElectrons().length,
                    "free slots": CAtom.freeSlots(),
                    "electrons": CAtom.numberOfElectrons(),
                    "protons":CAtom.numberOfProtons(),
                     "How charge is calculated:":charge_description
                }
            )
        }
    }


}
module.exports = VAtom
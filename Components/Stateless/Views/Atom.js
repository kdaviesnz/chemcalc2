const CMolecule = require('../../../Controllers/Molecule')
const CAtom = require('../../../Controllers/Atom')
const _ = require('lodash');
const Set = require('../../../Models/Set')

const VAtom = (atom) => {


    return (atom) => {
        return {
            'render': () => {

            }
        }
    }


}
module.exports = VAtom

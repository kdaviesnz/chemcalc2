const CAtom = require('../Controllers/Atom')
const Families = require('../Models/Families')
const _ = require('lodash');

// @see Organic Chemistry 8th Editiion P245
const BondDisassociationReaction = (container, MoleculeController) => {

    const react = (mmolecule) => {

        // Basic checks
        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms
        const atoms = mmolecule[0][1]

        atoms.map((atom, atom_index)=>{

            return atom

        })

        return mmolecule

    }

    return {
        react: react
    }

}

module.exports = BondDisassociationReaction

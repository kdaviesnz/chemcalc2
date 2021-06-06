const CAtom = require('../Controllers/Atom')
const Families = require('../Models/Families')
const _ = require('lodash');
const MoleculeFactory = require('./MoleculeFactory')
const Constants = require('../Constants')

// @see Organic Chemistry 8th Editiion P245
const BondDisassociationReaction = (container, MoleculeController) => {

    const react = (mmolecule) => {

        // Basic checks
        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms
        const atoms = mmolecule[0][1]

        const molecules = []

        atoms.map((atom, atom_index)=> {

            const catom = CAtom(atom, atom_index, mmolecule)
            if (!catom.isPositivelyCharged()) {
                return atom
            }

            const indexed_bonds = catom.indexedBonds("")

            const hydrogen_bonds = indexed_bonds.filter((bond) => {
                    if(bond.atom[0] !== "H") {
                        return false
                    }
                    const hydrogen_atom = CAtom(bond.atom, bond.atom_index, mmolecule)
                    if (hydrogen_atom.bondCount() !== 1) {
                        return false
                    }
                    return true
                }
            )

            const bond_to_break = hydrogen_bonds.length > 0 ? hydrogen_bonds[0] : indexed_bonds[0]

            const shared_electrons = bond_to_break.shared_electrons

            // Remove electrons from bonded atom
            const number_of_electrons_at_start = _.cloneDeep(mmolecule[0][1][bond_to_break.atom_index]).slice(Constants().electron_index).length
            _.remove(mmolecule[0][1][bond_to_break.atom_index], (v, i)=> {
                return shared_electrons[1] === v || shared_electrons[0] === v
            })
            _.cloneDeep(mmolecule[0][1][bond_to_break.atom_index]).slice(Constants().electron_index).length.should.be.equal(number_of_electrons_at_start - 2)


            mmolecule[0][1][atom_index][4] = 0

            // If breaking a hydrogen bond remove the hydrogen
            if (bond_to_break.atom[0]==="H") {
                const number_of_atoms_at_start = _.cloneDeep(mmolecule[0][1]).length
                _.remove(mmolecule[0][1], (v, i) => {
                    return i === bond_to_break.atom_index
                })
                _.cloneDeep(mmolecule[0][1]).length.should.be.equal(number_of_atoms_at_start - 1)
               // molecules.push(MoleculeFactory("H"))

            } else {

                // todo
            }



        })

        molecules.push(mmolecule)

        return molecules

    }

    return {
        react: react
    }

}

module.exports = BondDisassociationReaction

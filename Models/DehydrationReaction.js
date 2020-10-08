const CAtom = require('../Controllers/Atom')
const Families = require('../Models/Families')
const _ = require('lodash');

// @see Organic Chemistry 8th Editiion P245
const DehydrationReaction = (container, MoleculeController) => {

    const react = (mmolecule) => {

        // Basic checks
        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms
        const atoms = mmolecule[0][1]

        atoms.map((oxygen_atom, oxygen_atom_index)=>{
            if (oxygen_atom[0] !== "O") {
                return false
            }
            const catom = CAtom(oxygen_atom, oxygen_atom_index, mmolecule)
            if(catom.bondCount()!==3) { // 2 hydrogens plus atom oxygen is bonded to
                return false
            }

            const indexed_bonds = catom.indexedBonds("")

            // Check we have two hydrogens and each hydrogen is only bonded to the oxygen atom
            const hydrogen_bonds = indexed_bonds.filter((bond) => {
                    if (bond.atom[0] !== "H") {
                        return false
                    }
                    const hydrogen_atom = CAtom(bond.atom, bond.atom_index, mmolecule)
                    if (hydrogen_atom.bondCount() !== 1) {
                        return false
                    }
                    return true
                }
            )

            const hydrogens = hydrogen_bonds.map((hydrogen_bond)=>{
                return hydrogen_bond.atom
            })

            if (hydrogens.length !== 2) {
                return false
            }

            // Get the bond that is NOT and oxygen - hydrogen bond
            const non_hydrogen_bond = indexed_bonds.filter((bond) => {
                    return bond.atom[0] !== "H"
                }
            ).pop()

            // Break the non_hydrogen bond
            const shared_electrons = non_hydrogen_bond.shared_electrons
            if (shared_electrons.length !==2 ) {
                return false
            }

            // Remove electrons from non hydrogen atom
            const number_of_electrons_at_start = _.cloneDeep(mmolecule[0][1][non_hydrogen_bond.atom_index]).slice(5).length
            _.remove(mmolecule[0][1][non_hydrogen_bond.atom_index], (v, i)=> {
                return shared_electrons[1] === v || shared_electrons[0] === v
            })
            _.cloneDeep(mmolecule[0][1][non_hydrogen_bond.atom_index]).slice(5).length.should.be.equal(number_of_electrons_at_start - 2)

            const number_of_atoms_at_start = _.cloneDeep(mmolecule[0][1]).length
            _.remove(mmolecule[0][1], (v,i) => {
                return i === oxygen_atom_index || i === hydrogen_bonds[0].atom_index || i === hydrogen_bonds[1].atom_index
            })
            _.cloneDeep(mmolecule[0][1]).length.should.be.equal(number_of_atoms_at_start - 3)

            mmolecule[0][1][non_hydrogen_bond.atom_index][4] = '+'


        })

        return mmolecule

    }

    return {
        react: react
    }

}

module.exports = DehydrationReaction

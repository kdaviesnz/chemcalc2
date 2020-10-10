
const CAtom = require('../Controllers/Atom')
const _ = require('lodash');

class Reaction {

    constructor(mmolecule, reagent) {

        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms

        reagent.length.should.be.equal(2) // molecule, units
        reagent[0].length.should.be.equal(2) // pKa, atoms

        this.mmolecule = mmolecule
        this.reagent = reagent

        this.reagentAI = require("../Stateless/MoleculeAI")(reagent)
        this.moleculeAI = require("../Stateless/MoleculeAI")(mmolecule)

    }

    addProtonToSubstrate(target_atom, target_atom_index, proton) {
        const free_electrons = CAtom(target_atom, target_atom_index, this.mmolecule).freeElectrons()
        if (free_electrons.length > 1) {
            proton.push(free_electrons[0])
            proton.push(free_electrons[1])
            this.mmolecule[0][1].push(proton)
        }
    }

    removeProtonFromReagent(proton_index) {
        this.reagent[0][1].splice(proton_index, 1)
    }

    addProtonFromReagentToHydroxylGroup() {

        const proton_index = this.reagentAI.findProtonIndex()
        const proton = this.reagent[0][1][proton_index]
        this.removeProtonFromReagent(proton_index)
        const hydroxylOxygenIndex = Molecule.findHydroxylOxygenIndex()
        addProtonToSubstrate(this.mmolecule[0][1][hydroxylOxygenIndex], hydroxylOxygenIndex, proton) // changes this.mmolecule

    }


}

module.exports = Reaction

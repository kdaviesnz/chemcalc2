const MoleculeLookup = require('../Controllers/MoleculeLookup')
const should = require('should')
const _ = require('lodash');
const MoleculeController = require('../Controllers/Molecule')
const BondDisassociationReaction = require('./BondDisassocationReaction')
const MoleculeFactory = require('./MoleculeFactory')


const BondDisassociate = (db, ccontainer, callback) => {

    const bond_disassociation_reaction = BondDisassociationReaction(MoleculeController)

    let molecules = []

    ccontainer.container.slice(1).map((mmolecule)=>{


        // Basic checks
        mmolecule.length.should.be.equal(2) // molecule, units
        mmolecule[0].length.should.be.equal(2) // pKa, atoms

        molecules = bond_disassociation_reaction.react(mmolecule)

    })

    ccontainer.container.splice(1)
    molecules.map((molecule)=> {
        ccontainer.container.push(molecule)
    })

    callback(ccontainer)

}

module.exports = BondDisassociate
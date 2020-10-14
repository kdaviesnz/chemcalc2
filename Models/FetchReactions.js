const RulesLookup = require('../Models/RulesLookup')
const FindSubstrates = require('../Models/FindSubstrates')
const Families = require('../Models/Families')
const VMolecule = require('../Components/Stateless/Views/Molecule')
const _ = require('lodash');


const FetchReactions = (verbose,  db, mmolecule, child_reaction_string, render, Err) => {

    mmolecule.length.should.be.equal(2) // molecule, units
    mmolecule[0].length.should.be.equal(2) // pKa, atoms
    mmolecule[0][0].should.be.an.Number() // pka
    mmolecule[0][1].should.be.an.Array()
    mmolecule[0][1][0].should.be.an.Array()
    mmolecule[0][1][0][0].should.be.an.String()

    const families = Families(mmolecule).families

   // console.log('FetchReactions: families')
   // console.log(Families(mmolecule).families_as_array())

    /*
    Get the functional groups that the chemical we are trying to synthesise belongs to. Then
    for each functional group do a rules lookup to determine the reactions that result in
    the chemical we are trying to synthesise.
    */


    Families(mmolecule).families_as_array().map(
        // [secondary amine,benzene], [ketone], [1,2 Diol]
        (functional_group) => {


            RulesLookup(db, functional_group).then(
                (rules) => {


//                    console.log(functional_group)

                    if (rules.length===0) {
                        console.log("No rules found for " + functional_group)
                    }

                    rules.map(
                        (rule) => {

                            // Find the substrates that when the reaction steps are applied, will result in
                            // the end product and render results

                            FindSubstrates(
                                verbose,
                                db,
                                rule,
                                _.cloneDeep(mmolecule),
                                child_reaction_string,
                                render,
                                (err) => {
                                    console.log("Error finding substrates")
                                    Err(err)
                                }
                            ) // FindSubstrates()



                        }
                    ) // rules.map
                }, // RulesLookup() success callback
                (Err) => {
                    console.log("Could not fetch rules where product is a " + functional_group)
                    Err(err)
                }
            ) // RulesLookup
        })

}

module.exports = FetchReactions









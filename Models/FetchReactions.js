const RulesLookup = require('../Models/RulesLookup')
const FindSubstrates = require('../Models/FindSubstrates')

const FetchReactions = (verbose,  db, chemical_to_synthesise_JSON_object, child_reaction_string, render, Err) => {

    /*
    Get the functional groups that the chemical we are trying to synthesise belongs to. Then
    for each functional group do a rules lookup to determine the reactions that result in
    the chemical we are trying to synthesise.
    */
   // console.log(chemical_to_synthesise_JSON_object.CanonicalSMILES)
    console.log("Functional groups")
     console.log(chemical_to_synthesise_JSON_object.functional_groups)
//    console.log("FETCH REACTIONS")
  //  process.exit()
    /*
    5-prop-2-enyl-1,3-benzodioxole (safrole)
[ 'terminal alkene', 'alkene' ]


    1-(1,3-benzodioxol-5-yl)propane-1,2-diol (isosafrol glycol)
[ 'glycol', 'alkene' ]
     */

 //   console.log(chemical_to_synthesise_JSON_object.functional_groups)

    chemical_to_synthesise_JSON_object.functional_groups.map(
        // [secondary amine,benzene], [ketone], [1,2 Diol]
        (functional_group) => {

            RulesLookup(db, functional_group).then(
                (rules) => {

                    console.log("FUNCTIONAL GROUP: " + functional_group)
                    console.log("RULES:")
                    console.log(rules)

                    if (rules.length===0) {
                        //console.log("No rules found")
                        // db.collection("rules").find({products:functional_group}).toArray((err, rules)
                        //console.log(functional_group)
                    } else {
 //                       process.exit()
                    }
                    /*
                    FetchReactions.js (safrole)
                    []

                    FetchReactions.js (isosafrol glycol)
[ { _id: 5dc78b155f099c873861378d,
    commands:
     [ 'BREAK RING',
       'CREATE glycol',
       'ADD H TO O',
       'ADD hydrogen TO oxygen',
       'ADD alcohol GROUP',
       'ADD OH GROUP' ],
    description: '',
    links:
     [ 'https://www.britannica.com/science/glycol',
       'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(McMurry)/Chapter_18%3A_Ethers_and_Epoxides%3B_Thiols_and_Sulfides/18.06_Reactions_of_Epoxides%3A_Ring-opening' ],
    step: '',
    catalyst: 'H+',
    'parent mechanism': [ '' ],
    mechanism: 'hydrolysis',
    substrate: { 'functional group': 'epoxide' },
    reagents: [ 'H2O' ],
    products: [ 'glycol', '1,2 Diol' ] },
  { _id: 5dc78b155f099c873861378c,
    commands:
     [ 'BREAK RING',
       'CREATE glycol',
       'ADD H TO O',
       'ADD hydrogen TO oxygen',
       'ADD alcohol GROUP',
       'ADD OH GROUP' ],
    description: '',
    links:
     [ 'https://www.britannica.com/science/glycol',
       'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(McMurry)/Chapter_18%3A_Ethers_and_Epoxides%3B_Thiols_and_Sulfides/18.06_Reactions_of_Epoxides%3A_Ring-opening' ],
    step: '',
    catalyst: 'H2SO4',
    'parent mechanism': [ '' ],
    mechanism: 'hydrolysis',
    substrate: { 'functional group': 'epoxide' },
    reagents: [ 'CH3OH' ],
    products: [ 'glycol', '1,2 Diol' ] } ]

                     */

                    rules.map(
                        (rule) => {


                            //console.log('FetchReactions.js')
                            //console.log(rule)
                            //process.exit()

                            // Find the substrates that when the reaction steps are applied, will result in
                            // the end product and render results
                            FindSubstrates(
                                verbose,
                                db,
                                rule,
                                chemical_to_synthesise_JSON_object,
                                child_reaction_string,
                                render,
                                (err) => {
                                    console.log("Error finding substrates for " + chemical_to_synthesise_JSON_object.IUPACName)
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









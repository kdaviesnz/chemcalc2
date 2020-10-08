
const MoleculeLookup = require('../Controllers/MoleculeLookup')
const FetchReactions = require('../Models/FetchReactions')

const Synthesize = (verbose,  molecule_to_synthesize_name, search_type, child_reaction_string, render, Err) => {
// render is a function that says how to render the reaction eg on screen, save to db etc.

    console.log('Synthesing ' + molecule_to_synthesize_name)

    // Connect to mongo database
    const MongoClient = require('mongodb').MongoClient
    const S = require('string');

    MongoClient.connect('mongodb+srv://'  + process.env.MONGODBUSER + ':' + process.env.MONGODBPASSWORD + '@cluster0-awqh6.mongodb.net', {useNewUrlParser: true},
        function (err, client) {

            if (err) {
                Err(err)
            }

            const db = client.db('chemistry');

            // Look up the chemical that we want to synthesise
            if (molecule_to_synthesize_name === false) {
                return false
            }

            MoleculeLookup(db, molecule_to_synthesize_name,  search_type, "Synthesize.js", true).then(
                (molecule_JSON_object) => {
                    // Fetch and render reactions that synthesise chemical
                    console.log('Synthesize.js')
                    console.log(molecule_JSON_object.IUPACName)
                    FetchReactions(verbose, db, molecule_JSON_object, child_reaction_string, render, (err) =>{
                        console.log('There was an error fetching reactions for ' + molecule_to_synthesize_name)
                        Err(err)
                    })
                },
                (err) => {
                    console.log('There was an error synthesising ' + molecule_to_synthesize_name + '. Error looking up ' + molecule_to_synthesize_name)
                    Err(err)
                }
            )
        }
    )
}

module.exports = Synthesize



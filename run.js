const readline = require('readline');
const help = require('help')('usage.txt')
const ReactionSchemaParser = require('./Controllers/ReactionSchemaParser')
const Synthesize = require('./Controllers/Synthesize')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'ChemCalc > '
});

const verbose = true

rl.prompt()

rl.on('line', (line) => {
    const lineTrimmed = line.trim();
    if (lineTrimmed.toLowerCase() === 'help') {
        help()
        rl.prompt()
    } else if (lineTrimmed === "") {
        rl.prompt()
    } else if (lineTrimmed.toLowerCase(),substr(0,10) === "synthesize") {
        Synthesize(
            verbose,
            lineTrimmed.toLowerCase(),subStr(10),
            (rule, molecule_JSON_object,substrate_JSON_object)=>{

            }
        )
        rl.prompt()
    } else {
        //isobutene -> HCl
        //"2-chloro-2-methylbutane /"
        ReactionSchemaParser(lineTrimmed, verbose,(err, reaction)=> {
            if (err) {
                console.log("Error doing reaction")
                console.log(err)
                process.exit()
            }
            console.log(reaction===null?"":reaction.type)
            console.log(reaction===null?"":reaction.products[0].IUPACName)
            console.log("Reaction done")
            rl.prompt()
        })
    }
})


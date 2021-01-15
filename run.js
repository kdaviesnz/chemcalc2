const readline = require('readline');
const help = require('help')('usage.txt')
const ReactionSchemaParser = require('./Controllers/ReactionSchemaParser')
const Synthesize = require('./Controllers/Synthesize')
const Test = require('./Controllers/Test')
const VReactions = require('./Components/Stateless/Views/Reactions');
const FlaskController = require('./Controllers/Container')
const Flask = require('./Components/State/Flask')

const debug = (o) => {
    console.log(o)
}

debug('init')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "ChemCalc > Enter a command or type help\n> "
});

const verbose = true

rl.prompt()

rl.on('line', (line) => {
    debug('Calling rl.on() callback')
    const flask = new Flask()
    const command_list = [
        'add [chemical]',
        'distill [chemical]',
        'flask',
        'synthesize [chemical]'
    ]
    const lineTrimmed = line.trim();
    if (lineTrimmed.toLowerCase() === 'help') {
        help()
        rl.prompt()
    } else if (lineTrimmed === "") {
        rl.prompt()
    } else if (lineTrimmed.toLowerCase().substr(0,5) === "flask") {
        flask.render()
        rl.prompt()
    } else if (lineTrimmed.toLowerCase().substr(0,8) === "commands") {
        console.log(command_list.map((command)=>{
            return command
        }))
        rl.prompt()
    } else if (lineTrimmed.toLowerCase().substr(0,4) === "add ") {

        rl.prompt()
    }
    else if (lineTrimmed.toLowerCase().substr(0,4) === "test") {
        console.log("Running tests, this may take a while")
        Test()
        rl.prompt()
    } else if (lineTrimmed.toLowerCase().substr(0,10) === "synthesize" || lineTrimmed.toLowerCase().substr(0,5) === "synth") {
        Synthesize(
            lineTrimmed.toLowerCase().substr(10)
        )
    } else if (lineTrimmed.toLowerCase().substr(0,4) === "exit") {
        process.exit()
    } else {
        console.log("Command not recognized")
        rl.prompt()
        //isobutene -> HCl
        //"2-chloro-2-methylbutane /"
        /*
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
        */
    }
})

debug('run.js end')

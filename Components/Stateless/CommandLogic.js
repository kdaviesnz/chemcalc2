const CommandLogic = (reaction) => {

    return {
        "check": (command) => {
            const check_passed = true
            switch(command) {
                case "reduceImineToAmineReverse":
                    if (reaction.dehydrate(true)) {
                        return false
                    }
                    if (reaction.MoleculeAI.findHydroxylOxygenIndex() !== -1) {
                        return false
                    }
                    break;
                case "makeCarbonNitrogenDoubleBond":
                    break;
                default:
            }
            return check_passed
        }
    }

}

module.exports = CommandLogic
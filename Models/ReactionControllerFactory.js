const ReactionController = require('../Controllers/ReactionController')

const ReactionControllerFactory = (molecule) => {
    return ReactionController(molecule)
}

module.exports = ReactionControllerFactory


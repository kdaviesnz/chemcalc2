const Constants = require("./Constants")
const Typecheck = require("./Typecheck")

const Prototypes = () => {
    Object.defineProperty(Array.prototype, 'addElectron', {
        value: function(electron, symbol) {
            this.push(electron)
            if (this.slice(Constants().electron_index).length > (symbol === undefined?8:(Constants().max_valence_electrons[symbol]))) {
                throw new Error("Atom has more than the allowed number of electrons")
            }
        }
    })
    Object.defineProperty(Array.prototype, 'addAtom', {
        value: function(atom) {
            Typecheck(
                {name:"atom", value:atom, type:"array"},
            )
            this.push(atom)
        }
    })
}

module.exports = Prototypes
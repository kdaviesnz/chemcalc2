const Constants = require("./Constants")
const Typecheck = require("./Typecheck")
const _ = require('lodash');

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
    Object.defineProperty(Array.prototype, 'removeAtom', {
        value: function(atom) {
            Typecheck(
                {name:"atom", value:atom, type:"array"},
            )
            _.remove(this, (v, i) => {
                    return i === atom[0].atom_index
                }
            )
        }
    })
}

module.exports = Prototypes
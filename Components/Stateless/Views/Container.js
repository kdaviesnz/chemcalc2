const VMolecule = require('../../../Components/Stateless/Views/Molecule')
const MoleculeLookup = require('../../../Controllers/MoleculeLookup')
const PubChemLookup = require('../../../Controllers/PubChemLookup')
const MoleculeFactory = require('../../../Models/MoleculeFactory')

const pkl = PubChemLookup((err)=>{
    console.log(err)
    process.exit()
})

const VContainer = (client) => {

    const db = client.db("chemistry")

    const __containerString = (container_string, molecule) => {
        return container_string + "\n|  {" + (molecule.IUPACName === undefined? molecule.search : molecule.IUPACName) + "}  "
    }

    const __containerStringRecursive = (container_string, container, current_index, callback) => {

        if (undefined === container[current_index]) {
            console.log(container_string + "|\n|_________________________")
            callback()
        } else {

            const item = container[current_index]
            const mmolecule = item
            const units = item[1]

            MoleculeLookup(db, VMolecule(mmolecule).canonicalSMILES(units), "SMILES", true).then(
                // "resolves" callback - molecule found in db
                (molecule) => {
                   // console.log('Views/Container.js molecule:')
                   // console.log(molecule)
                    __containerStringRecursive(__containerString(container_string, molecule), container, current_index + 1, callback)
                },
                // Nothing found in db callback
                (search) => {
                    pkl.searchBySMILES(search.replace(/\(\)/g, ""), db, (molecule_from_pubchem) => {
                        //console.log("molecule from pubchem")
                        //console.log(molecule_from_pubchem)
                        if (molecule_from_pubchem !== null) {
                            molecule_from_pubchem['json'] = MoleculeFactory(search)
                           // console.log("Views/Container.js")
                            console.log("Container::Adding " + search + ' to db')
                            //console.log(molecule_from_pubchem['json'])
                            //process.exit()
                            molecule_from_pubchem['search'] = search
                            db.collection("molecules").insertOne(molecule_from_pubchem, (err, result) => {
                                if (err) {
                                    console.log(err)
                                    client.close()
                                    process.exit()
                                } else {
                                    __containerStringRecursive(__containerString(container_string, molecule_from_pubchem), container, current_index + 1, callback)
                                }
                            })
                        } else {
                            console.log("Nothing found in pubchem")
                            return search
                        }
                    })
                },
                // "rejects" callback
                (err) => {
                    console.log("Molecule look up error")
                    process.exit()
                }
            )

        }


    }

    return (ccontainer) => {
        return {
            'show': (callback) => {
                const container_string = "|"
                __containerStringRecursive(container_string, ccontainer.container.slice(1), 0, callback)
            }
        }
    }
}
module.exports = VContainer

/*
const CanonicalSMILESParserV2 = require('./CanonicalSMILESParserV2')
const WackerOxidation = require('./reactions/WackerOxidation')
const PermanganateOxidation = require('./reactions/PermanganateOxidation')
const Oxymercuration = require('./reactions/Oxymercuration')
const PinacolRearrangement = require('./reactions/PinacolRearrangement')
const NagaiMethod = require('./reactions/NagaiMethod')
const Ritter = require('./reactions/Ritter')
const ReductiveAmination = require('./reactions/ReductiveAmination')
const CarboxylicAcidToKetone = require('./reactions/CarboxylicAcidToKetone')
const FunctionalGroups = require('./FunctionalGroups')
const AcidCatalyzedRingOpening = require('./reactions/AcidCatalyzedRingOpening')
const AlcoholDehydration = require('./reactions/AlcoholDehydration')
const AkylHalideDehydration = require('./reactions/AkylHalideDehydration')
*/
const Families = require('../Models/Families')
const AddProtonToHydroxylGroup = require('../Commands/AddProtonToHydroxylGroup')
const BreakBond = require('../Commands/BreakBond')
const Protonate = require('../Commands/Protonate')
const Deprotonate = require('../Commands/Deprotonate')
const MoleculeFactory = require('../Models/MoleculeFactory')
const VMolecule = require('../Components/Stateless/Views/Molecule')
const Dehydrate = require('../Commands/Dehydrate')
const BondAtoms = require('../Commands/BondAtoms')
const RemoveProtonFromWater = require('../Commands/RemoveProtonFromWater')
const Hydrate = require('../Commands/Hydrate')
const DeprotonateNonHydroxylOxygen = require('../Commands/DeprotonateNonHydroxylOxygen')
const ProtonateNonHydroxylOxygen = require('../Commands/ProtonateNonHydroxylOxygen')
const Reduce = require('../Commands/Reduce')
const Dereduce = require('../Commands/Dereduce')
const TransferProton = require('../Commands/TransferProton')
const DeprotonateCarbonyl = require('../Commands/DeprotonateCarbonyl')
const ProtonateCarbonyl = require('../Commands/ProtonateCarbonyl')

const _ = require('lodash');
const colors = require('colors')

const FindSubstrates = (Err, verbose,  db, rule, mmolecule, child_reaction_as_string, render, DEBUG) => {

    const commands_reversed = _.cloneDeep(rule.commands).reverse()
    const reagents_reversed = undefined !== rule.synthesis_reagents ? rule.synthesis_reagents: _.cloneDeep(rule.reagents).reverse()

    if (DEBUG) {
        console.log("DEBUG Models/FindsSubstrates.js -> Mechanism: " + rule.mechanism.green.bold)
        console.log("DEBUG Models/FindSubstrates.js -> Commands:")
        console.log(rule.commands)
        console.log("DEBUG Models/FindSubstrates.js -> Commands reversed:")
        console.log(commands_reversed)
    }

    // https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(McMurry)/18%3A_Ethers_and_Epoxides_Thiols_and_Sulfides/18.06%3A_Reactions_of_Epoxides_-_Ring-opening
    let results = []

    if (commands_reversed.length <= reagents_reversed.length) {

        const commands_map = {
            "DEPROTONATE": Deprotonate,
            "BOND atoms": BondAtoms,
            "BREAK bond": BreakBond,
            "PROTONATE": Protonate,
            "REMOVE proton from water": RemoveProtonFromWater,
            "HYDRATE": Hydrate,
            "DEHYDRATE": Dehydrate,
            "DEPROTONATE nonhydroxyl oxygen": DeprotonateNonHydroxylOxygen,
            "TRANSFER proton": TransferProton,
            "PROTONATE carbonyl": ProtonateCarbonyl,
            "DEPROTONATE carbonyl": DeprotonateCarbonyl,
            "REDUCE": Reduce,
            "DEREDUCE": Dereduce
        }


        const commands_descriptions_map = {
            "DEPROTONATE": "Deprotonate",
            "BOND atoms": "BondAtoms",
            "BREAK bond": "BreakBond",
            "PROTONATE": "Protonate",
            "REMOVE proton from water": "RemoveProtonFromWater",
            "HYDRATE": "Hydrate",
            "DEHYDRATE": "Dehydrate",
            "DEPROTONATE nonhydroxyl oxygen": "DeprotonateNonHydroxylOxygen",
            "TRANSFER proton": "TransferProton",
            "PROTONATE carbonyl": "ProtonateCarbonyl",
            "DEPROTONATE carbonyl": "DeprotonateCarbonyl",
            "REDUCE": "Reduce",
            "DEREDUCE": "Dereduce"
        }
        
        const commands_reversed_map = {
            "DEPROTONATE": Protonate,
            "BOND atoms": BreakBond,
            "BREAK bond": BondAtoms,
            "PROTONATE": Deprotonate,
            "REMOVE proton from water": AddProtonToHydroxylGroup,
            "HYDRATE": Dehydrate,
            "DEHYDRATE": Hydrate,
            "DEPROTONATE nonhydroxyl oxygen": ProtonateNonHydroxylOxygen,
            "TRANSFER proton": TransferProton,
            "PROTONATE carbonyl": DeprotonateCarbonyl,
            "DEPROTONATE carbonyl": ProtonateCarbonyl,
            "REDUCE": Dereduce,
            "DEREDUCE": Reduce
        }

        const commands_reversed_descriptions_map = {
            "DEPROTONATE": "Protonate",
            "BOND atoms": "Break bond",
            "BREAK bond": "Bond atoms",
            "PROTONATE": "Deprotonate",
            "REMOVE proton from water": "Add proton from reagent to hydroxyl group",
            "HYDRATE": "Dehydrate",
            "DEHYDRATE": "Hydrate",
            "DEPROTONATE nonhydroxyl oxygen": "Protonate non hydroxyl oxygen",
            "TRANSFER proton": "Transfer proton",
            "PROTONATE carbonyl": "Deprotonate carbonyl",
            "DEPROTONATE carbonyl": "Protonate carbonyl",
            "REDUCE": "Dereduce",
            "DEREDUCE": "Reduce"
        }

        const getProductsRecursive = (commands_reversed, index, results, products, reagents_reversed, DEBUG) => {

            console.log("\n\n")

            if (undefined === commands_reversed[index]) {
                return results
            }
            const command_reversed = commands_reversed[index]
            if (DEBUG) {
                console.log(("DEBUG FindSubstrates.js -> Command: " + commands_descriptions_map[command_reversed]).yellow)
                console.log(("DEBUG FindSubstrates.js -> Command (reversed): " + commands_reversed_descriptions_map[command_reversed]).yellow)
            }
            if (undefined !== commands_reversed_map[command_reversed]) {
                const container_substrate = _.cloneDeep(products[0])
                container_substrate.length.should.be.equal(2) // molecule, units
                container_substrate[0].length.should.be.equal(2) // pKa, atoms
                container_substrate[0][1].should.be.an.Array()
                const container_reagent = [MoleculeFactory(_.cloneDeep(reagents_reversed[index])), 1]
                products = commands_reversed_map[command_reversed](_.cloneDeep(container_substrate), _.cloneDeep(container_reagent), rule, DEBUG)
                if (products === false) {
                    console.log("Returning false")
                    return false
                }
                if (DEBUG) {
                    console.log(("Products:" + rule._id + ' ' + rule.mechanism).red)
                    console.log(VMolecule(products[0]).canonicalSMILES())
                }
                results.push({
                    "command": _.cloneDeep(command_reversed),
                    "reagent": _.cloneDeep( container_reagent),
                    "substrate": _.cloneDeep(container_substrate),
                    "products": _.cloneDeep(products)
                })
                return getProductsRecursive(commands_reversed, index + 1, results, products, reagents_reversed, DEBUG)
            } else {
                if (DEBUG) {
                    console.log("DEBUG FetchSubstrates.js -> Skipping " + command_reversed + " as command not found")
                }
                return results
            }

        }

        let products = [_.cloneDeep(mmolecule), _.cloneDeep(rule.products[1])] // substrate should aways be first element
        results = getProductsRecursive(commands_reversed, 0, results, products, reagents_reversed, DEBUG)

    } else {
        if (DEBUG) {
            console.log("DEBUG FindSubstrates.js Number of commands is greater than number of reagents therefore not processing.")
        }
    }

    if (results !== false && results.length > 0) {
        render(results, mmolecule, rule)
    }


}


module.exports = FindSubstrates












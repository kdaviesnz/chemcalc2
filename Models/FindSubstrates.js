
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
const AddProton = require('../Commands/AddProton')
const RemoveProton = require('../Commands/RemoveProton')
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

const FindSubstrates = (verbose,  db, rule, mmolecule, child_reaction_as_string, render, Err) => {



  //  console.log("Calling FindSubstrates")
   // console.log(VMolecule(_.cloneDeep(mmolecule)).canonicalSMILES())
    //const end_product_functional_groups = Families(mmolecule).families_as_array()

    const commands_reversed = _.cloneDeep(rule.commands).reverse()
    const reagents_reversed = undefined !== rule.synthesis_reagents ? rule.synthesis_reagents: _.cloneDeep(rule.reagents).reverse()

   // console.log(rule.links)
   // console.log(rule.commands)

    // https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(McMurry)/18%3A_Ethers_and_Epoxides_Thiols_and_Sulfides/18.06%3A_Reactions_of_Epoxides_-_Ring-opening
    let results = []

    if (commands_reversed.length <= reagents_reversed.length) {

        const commands_map = {
            "REMOVE proton": RemoveProton,
            "ADD bond": BondAtoms,
            "ADD proton": AddProton,
            "REMOVE proton from water": RemoveProtonFromWater,
            "HYDRATE": Hydrate,
            "DEPROTONATE nonhydroxyl oxygen": DeprotonateNonHydroxylOxygen,
            "TRANSFER proton": TransferProton,
            "PROTONATE carbonyl": ProtonateCarbonyl,
            "DEPROTONATE carbonyl": DeprotonateCarbonyl,
            "REDUCE": Reduce,
            "DEREDUCE": Dereduce
        }

        const commands_reversed_map = {
            "REMOVE proton": AddProton,
            "ADD bond": BreakBond,
            "ADD proton": RemoveProton,
            "REMOVE proton from water": AddProtonToHydroxylGroup,
            "HYDRATE": Dehydrate,
            "DEPROTONATE nonhydroxyl oxygen": ProtonateNonHydroxylOxygen,
            "TRANSFER proton": TransferProton,
            "PROTONATE carbonyl": DeprotonateCarbonyl,
            "DEPROTONATE carbonyl": ProtonateCarbonyl,
            "REDUCE": Dereduce,
            "DEREDUCE": Reduce
        }

        const getProductsRecursive = (commands_reversed, index, results, products, reagents_reversed) => {
            if (undefined === commands_reversed[index]) {
                return results
            }
            const command_reversed = commands_reversed[index]
            // console.log(command_reversed)
            if (undefined !== commands_reversed_map[command_reversed]) {
                const container_substrate = _.cloneDeep(products[0])
                container_substrate.length.should.be.equal(2) // molecule, units
                container_substrate[0].length.should.be.equal(2) // pKa, atoms
                container_substrate[0][1].should.be.an.Array()
                const container_reagent = [MoleculeFactory(_.cloneDeep(reagents_reversed[index])), 1]
                //   console.log(commands_reversed_map[command_reversed])
                products = commands_reversed_map[command_reversed](_.cloneDeep(container_substrate), _.cloneDeep(container_reagent))
                if (products === false) {
                    return false
                }
                results.push({
                    "command": _.cloneDeep(command_reversed),
                    "reagent": _.cloneDeep( container_reagent),
                    "substrate": _.cloneDeep(container_substrate),
                    "products": _.cloneDeep(products)
                })
                return getProductsRecursive(commands_reversed, index + 1, results, products, reagents_reversed)
            } else {
                return results
            }
        }

        let products = [_.cloneDeep(mmolecule), _.cloneDeep(rule.products[1])] // substrate should aways be first element
        results = getProductsRecursive(commands_reversed, 0, results, products, reagents_reversed)

    }


    if (results !== false && results.length > 0) {
        render(results, mmolecule, rule)
    }


}


module.exports = FindSubstrates












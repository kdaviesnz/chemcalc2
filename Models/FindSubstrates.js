
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

    const getProductsRecursive = (commands_reversed, index, results, products, reagents_reversed) => {
        if (undefined === commands_reversed[index]) {
            return results
        }
        const command_reversed = commands_reversed[index]
        console.log(command_reversed)
        if (undefined !== commands_reversed_map[command_reversed]) {
            const container_substrate = _.cloneDeep(products[0])
            container_substrate.length.should.be.equal(2) // molecule, units
            container_substrate[0].length.should.be.equal(2) // pKa, atoms
            container_substrate[0][1].should.be.an.Array()
            const container_reagent = [MoleculeFactory(_.cloneDeep(reagents_reversed[index])), 1]
            console.log(commands_reversed_map[command_reversed])
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

    console.log("Calling FindSubstrates")
    console.log(VMolecule(_.cloneDeep(mmolecule)).canonicalSMILES())
    //const end_product_functional_groups = Families(mmolecule).families_as_array()

    const commands_reversed = _.cloneDeep(rule.commands).reverse()
    const reagents_reversed = undefined !== rule.synthesis_reagents ? rule.synthesis_reagents: _.cloneDeep(rule.reagents).reverse()

    console.log(rule.links)
    console.log(rule.commands)

    // https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(McMurry)/18%3A_Ethers_and_Epoxides_Thiols_and_Sulfides/18.06%3A_Reactions_of_Epoxides_-_Ring-opening

    commands_reversed.length.should.be.lessThanOrEqual(reagents_reversed.length)

    // Commands
    /*
    0:"ADD proton"
    1:"HYDRATE"
    2:"REMOVE proton from water"
    
     C=C -> [C+]C
    [C+]C -> C[O+]C
     C[O+]C -> COC
     
     COC -> C[O+]C
     C[O+]C -> [C+]C 
     ? [C+]C -> C=C / CC
    */

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
        "REDUCE" : Reduce,
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
        "REDUCE" : Dereduce,
        "DEREDUCE": Reduce
    }

    // Test that by running commands we get the correct result


    let results = []
    let products = [_.cloneDeep(mmolecule), _.cloneDeep(rule.products[1])] // substrate should aways be first element

    results = getProductsRecursive(commands_reversed, 0, results, products, reagents_reversed)
   // console.log(results)
   // process.exit()
    /*
    commands_reversed.map((command_reversed, index) => {
        if (undefined !== commands_reversed_map[command_reversed]) {
            const container_substrate = _.cloneDeep(products[0])
            container_substrate.length.should.be.equal(2) // molecule, units
            container_substrate[0].length.should.be.equal(2) // pKa, atoms
            container_substrate[0][1].should.be.an.Array()
            const container_reagent = [MoleculeFactory(_.cloneDeep(reagents_reversed[index])), 1]
            console.log(commands_reversed_map[command_reversed])
            products = commands_reversed_map[command_reversed](_.cloneDeep(container_substrate), _.cloneDeep(container_reagent))
            console.log(products)
            //console.log("Products after running command:")
            //console.log(VMolecule(products[0]).canonicalSMILES())
            //console.log(VMolecule(products[1]).canonicalSMILES())
            results.push({
                "command": _.cloneDeep(command_reversed),
                "reagent": _.cloneDeep( container_reagent),
                "substrate": _.cloneDeep(container_substrate),
                "products": _.cloneDeep(products)
            })
        }
    })
    */


/*
    console.log("FindSubstrates.js results")
    results.map((r)=>{
        console.log(r.command)
        console.log("Substrate:" + VMolecule(r.substrate).canonicalSMILES())
        console.log("Reagent:" + VMolecule(r.reagent).canonicalSMILES())
        console.log("Products:")
        console.log(VMolecule(r.products[0]).canonicalSMILES())
        console.log(VMolecule(r.products[1]).canonicalSMILES())
    })

    console.log("\n\n")

    console.log("FindSubstrates.js results reversed")
    results_reversed.map((r)=>{
        console.log(r.command)
        console.log("Substrate:" + VMolecule(r.substrate).canonicalSMILES())
        console.log("Reagent:" + VMolecule(r.reagent).canonicalSMILES())
        console.log("Products:")
        console.log(VMolecule(r.products[0]).canonicalSMILES())
    })

    const results_reversed = _.cloneDeep(results).reverse()
    //process.exit()
    //console.log("FindSubstrates.js substrate:")
    //console.log(VMolecule(results_reversed[0].substrates[0]).canonicalSMILES())

    // process.exit()

    //console.log(rule.commands)
    //console.log(results_reversed)
    //console.log('FindSubstrates.js!!')
    //process.exit()


 */
    // Test that by running commands we get the correct result
    /*
    console.log("Testing result:")
    const results_reversed = _.cloneDeep(results).reverse()
    let products_testing = [_.cloneDeep(results_reversed[0].substrate), _.cloneDeep(results_reversed[0].reagent)]
    results_reversed.map((result, index) => {
        //console.log("Testing results")
        //console.log("Command: " + result.command)
        //console.log(commands_map[result.command])
        const container_substrate = _.cloneDeep(products_testing[0])
        const container_reagent = _.cloneDeep(products_testing[1])
        //  console.log(commands_map[result.command])
        products_testing = commands_map[result.command](_.cloneDeep(container_substrate), _.cloneDeep(container_reagent))

        //console.log("Products after running command:")
        //console.log(VMolecule(products_testing[0]).canonicalSMILES())
        //console.log(VMolecule(products_testing[1]).canonicalSMILES())
        // console.log("Products-")
        // console.log(products_testing[0][0])
        //console.log(products_testing[1][0])
    })
    _.isEqual(products_testing[0], results_reversed[0].substrate).should.be.equal(true)

    //console.log(VMolecule(products_testing[0]).canonicalSMILES())
    //console.log(VMolecule(products_testing[1]).canonicalSMILES())

    //  process.exit()

    //console.log("End Calling FindSubstrates")
    //console.log(VMolecule(_.cloneDeep(mmolecule)).canonicalSMILES())
*/

    console.log("Results:")
    console.log(results)
    if (results !== false) {
        render(results, mmolecule, rule)
    }


}


module.exports = FindSubstrates












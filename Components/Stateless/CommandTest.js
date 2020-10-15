const CAtom = require('../../Controllers/Atom')
const _ = require('lodash');

const AddProtonToHydroxylGroup = require('../../Commands/AddProtonToHydroxylGroup')
const BreakBond = require('../../Commands/BreakBond')
const Protonate = require('../../Commands/Protonate')
const Deprotonate = require('../../Commands/Deprotonate')
const MoleculeFactory = require('../../Models/MoleculeFactory')
const VMolecule = require('../../Components/Stateless/Views/Molecule')
const Dehydrate = require('../../Commands/Dehydrate')
const BondAtoms = require('../../Commands/BondAtoms')
const RemoveProtonFromWater = require('../../Commands/RemoveProtonFromWater')
const Hydrate = require('../../Commands/Hydrate')
const DeprotonateNonHydroxylOxygen = require('../../Commands/DeprotonateNonHydroxylOxygen')
const ProtonateNonHydroxylOxygen = require('../../Commands/ProtonateNonHydroxylOxygen')
const Reduce = require('../../Commands/Reduce')
const Dereduce = require('../../Commands/Dereduce')
const TransferProton = require('../../Commands/TransferProton')
const DeprotonateCarbonyl = require('../../Commands/DeprotonateCarbonyl')
const ProtonateCarbonyl = require('../../Commands/ProtonateCarbonyl')


const CommandTest = (command, substrate, reagent, rule) => {


    const commands_map = {
        "DEPROTONATE": Deprotonate,
        "BOND atoms": BondAtoms,
        "BREAK bond": BreakBond,
        "PROTONATE": Protonate,
        "REMOVE proton from water": RemoveProtonFromWater,
        "HYDRATE": Hydrate,
        "DEPROTONATE nonhydroxyl oxygen": DeprotonateNonHydroxylOxygen,
        "TRANSFER proton": TransferProton,
        "PROTONATE carbonyl": ProtonateCarbonyl,
        "DEPROTONATE carbonyl": DeprotonateCarbonyl,
        "REDUCE": Reduce,
        "DEREDUCE": Dereduce
    }



    return  commands_map[command](substrate, reagent, rule)



}

module.exports = CommandTest

const CAtom = require('../../Controllers/Atom')
const _ = require('lodash');

const AddProtonToHydroxylGroup = require('../../Commands/AddProtonToHydroxylGroup')
const BreakBond = require('../../Commands/BreakBond')
const BreakMetalBond = require('../../Commands/BreakMetalBond')
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
const ProtonateDoubleCarbonBond = require('../../Commands/ProtonateCarbonDoubleBond')
const BreakDoubleCarbonBond = require('../../Commands/BreakCarbonDoubleBond')
const HydrateMostSubstitutedCarbon = require('../../Commands/HydrateMostSubstitutedCarbon')
const Demercurify =  require('../../Commands/Demercurify')
const Remercurify =  require('../../Commands/Remercurify')
const BondMetal =  require('../../Commands/BondMetal')
const RemoveMetal =  require('../../Commands/RemoveMetal')
const ProtonateOxygenOnDoubleBond =  require('../../Commands/ProtonateOxygenOnDoubleBond')

const CommandTest = (command, substrate, reagent, rule) => {


    const commands_map = {
        "DEPROTONATE": Deprotonate,
        "BOND atoms": BondAtoms,
        "BREAK bond": BreakBond,
        "BREAK metal bond": BreakMetalBond,
        "PROTONATE": Protonate,
        "PROTONATE double carbon bond": ProtonateDoubleCarbonBond,
        "REMOVE proton from water": RemoveProtonFromWater,
        "HYDRATE": Hydrate,
        "DEPROTONATE nonhydroxyl oxygen": DeprotonateNonHydroxylOxygen,
        "PROTONATE nonhydroxyl oxygen": ProtonateNonHydroxylOxygen,
        "TRANSFER proton": TransferProton,
        "PROTONATE carbonyl": ProtonateCarbonyl,
        "DEPROTONATE carbonyl": DeprotonateCarbonyl,
        "REDUCE": Reduce,
        "DEREDUCE": Dereduce,
        "DEHYDRATE": Dehydrate,
        "DEMERCURIFY": Demercurify,
        "REMERCURIFY": Remercurify,
        "ADD proton to hydroxyl group": AddProtonToHydroxylGroup,
        "BREAK double carbon bond": BreakDoubleCarbonBond,
        "HYDRATE most substituted carbon": HydrateMostSubstitutedCarbon,
        "BOND metal": BondMetal,
        "REMOVE metal": RemoveMetal,
        "PROTONATE oxygen on double bond": ProtonateOxygenOnDoubleBond
    }



    return  commands_map[command](substrate, reagent, rule)



}

module.exports = CommandTest

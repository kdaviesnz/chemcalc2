const CAtom = require('../../Controllers/Atom')
const _ = require('lodash');

const CreateEnolate = require('../../Commands/CreateEnolate')
const CreateEnolateReverse = require('../../Commands/CreateEnolateReverse')
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
const TransferProtonReverse = require('../../Commands/TransferProtonReverse')
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
const DeprotonateOxygenOnDoubleBond =  require('../../Commands/DeprotonateOxygenOnDoubleBond')
const BreakCarbonOxygenDoubleBond =  require('../../Commands/BreakCarbonOxygenDoubleBond')
const OxygenToOxygenProtonTransfer = require('../../Commands/OxygenToOxygenProtonTransfer')
const MakeOxygenCarbonDoubleBond  = require('../../Commands/MakeOxygenCarbonDoubleBond')
const MakeOxygenCarbonDoubleBondReverse  = require('../../Commands/MakeOxygenCarbonDoubleBondReverse')
const BondReagentToSubstrate = require('../../Commands/BondReagentToSubstrate')
const BondSubstrateToReagent = require('../../Commands/BondSubstrateToReagent')
const BreakCarbonOxygenDoubleBondReverse = require('../../Commands/BreakCarbonOxygenDoubleBondReverse')
const RemoveHydroxylGroup = require('../../Commands/RemoveHydroxylGroup')
const BreakBondReverse = require('../../Commands/BreakBondReverse')
const RemoveMethanol = require('../../Commands/RemoveMethanol')
const AddProtonToSubstrate = require('../../Commands/AddProtonToSubstrate')
const AddProtonToReagent = require('../../Commands/AddProtonToReagent')
const HydrideShift = require('../../Commands/HydrideShift')
const HydrideShiftOnCarbonNitrogenBondReverse = require('../../Commands/HydrideShiftOnCarbonNitrogenBondReverse')
const Hyrolysis = require('../../Commands/Hydrolysis')
const HyrolysisReverse = require('../../Commands/HydrolysisReverse')
const DeprotonateHydroxylOxygen = require('../../Commands/DeprotonateHydroxylOxygen')
const RemoveFormateGroup = require('../../Commands/RemoveFormateGroup')
const RemoveFormamideGroup = require('../../Commands/RemoveFormamideGroup')
const CarbocationShift = require('../../Commands/CarbocationShift')
const BreakCarbonNitrogenTripleBond =  require('../../Commands/BreakCarbonNitrogenTripleBond')
const BreakCarbonNitrogenDoubleBond =  require('../../Commands/BreakCarbonNitrogenDoubleBond')
const MakeNitrogenCarbonTripleBond = require('../../Commands/MakeNitrogenCarbonTripleBond')
const ReductiveAmination = require('../../Commands/ReductiveAmination')
const ReductiveAminationReverse = require('../../Commands/ReductiveAminationReverse')

const CommandTest = (command, substrate, reagent, rule, DEBUG,  horizontalCallback, horizontalFn, commands, i) => {

    const commands_map = {
        "REDUCTIVEAMINATIONREVERSE": ReductiveAminationReverse,
        "REDUCTIVEAMINATION": ReductiveAmination,
        "CREATEENOLATEREVERSE": CreateEnolateReverse,
        "CREATEENOLATE": CreateEnolate,
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
        "TRANSFER proton [reverse]": TransferProtonReverse,
        "PROTONATE carbonyl": ProtonateCarbonyl,
        "DEPROTONATE carbonyl": DeprotonateCarbonyl,
        "REDUCE": Reduce,
        "DEREDUCE": Dereduce,
        "DEHYDRATE": Dehydrate,
        "DEMERCURIFY": Demercurify,
        "REMERCURIFY": Remercurify,
        "ADD proton to hydroxyl group": AddProtonToHydroxylGroup,
        "PROTONATE hydroxyl group": AddProtonToHydroxylGroup,
        "BREAK double carbon bond": BreakDoubleCarbonBond,
        "HYDRATE most substituted carbon": HydrateMostSubstitutedCarbon,
        "BOND metal": BondMetal,
        "REMOVE metal": RemoveMetal,
        "PROTONATE oxygen on double bond": ProtonateOxygenOnDoubleBond,
        "DEPROTONATE oxygen on double bond": DeprotonateOxygenOnDoubleBond,
        "BREAK carbon oxygen double bond": BreakCarbonOxygenDoubleBond,
        "TRANSFER oxygen proton to oxygen": OxygenToOxygenProtonTransfer,
        "MAKE oxygen carbon double bond": MakeOxygenCarbonDoubleBond,
        "MAKE oxygen carbon double bond [reverse]": MakeOxygenCarbonDoubleBondReverse,
        "BOND reagent to substrate": BondReagentToSubstrate, // Important:
        // The substrate is the nucleophile and is attacking the reagent
        // The reagent is the electrophile
        "BOND substrate to reagent": BondSubstrateToReagent, // Important:
        // The reagent is the nucleophile and is attacking the substrate
        // The substrate is the electrophile
        "BREAK carbon oxygen double bond [reverse]": BreakCarbonOxygenDoubleBondReverse,
        "REMOVE hydroxyl group": RemoveHydroxylGroup,
        "BREAK bond reversed": BreakBondReverse,
        "REMOVE methanol": RemoveMethanol,
        "ADD proton to substrate": AddProtonToSubstrate,
        "ADD proton to reagent": AddProtonToReagent,
        "HYDRIDE shift": HydrideShift,
        "HYDRIDE shift on carbon nitrogen bond reverse": HydrideShiftOnCarbonNitrogenBondReverse,
        "HYDROLYSISE": Hyrolysis,
        "HYDROLYSISE reverse": HyrolysisReverse,
        "DEPROTONATE hydroxyl oxygen": DeprotonateHydroxylOxygen,
        "REMOVE formate group": RemoveFormateGroup,
        "REMOVE formamide group": RemoveFormamideGroup,
        "CARBOCATION shift": CarbocationShift,
        "BREAK carbon nitrogen triple bond": BreakCarbonNitrogenTripleBond,
        "BREAK carbon nitrogen double bond": BreakCarbonNitrogenDoubleBond,
        "MAKE nitrogen carbon triple bond": MakeNitrogenCarbonTripleBond
    }



    return  commands_map[command](substrate, reagent, rule,  horizontalCallback, horizontalFn, commands, i)



}

module.exports = CommandTest

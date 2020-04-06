const _ = require('lodash');

const MoleculeFactory = (canonicalSmiles) => {

    var SMILESparser = null
    const Canonical_SMILESParser = require("CanonicalSMILESParser")
    SMILESparser = Canonical_SMILESParser(canonicalSmiles)

    const extract_SMILE_chains = () => {
        return null === SMILESparser?[]:SMILESparser.chains
    }



    const extract_trunk = () => {
        return null === SMILESparser?[]:SMILESparser.trunk
    }

    const extract_substituents = () => {
        return null === SMILESparser?[]:SMILESparser.substituents
    }


    const generate_chemical_formula = () => {

        /* Alkanes have the molecular formula of CnH2n+2, where n is the number of carbons in the molecule.
                                      Excerpt from Organic Chemistry I For Dummies Arthur Winter
        */
    }

    const is_hydrocarbon = () => {
        /*
         Hydrocarbons, as the name suggests, are molecules that contain just hydrogen and carbon."
         Excerpt from Organic Chemistry I For Dummies Arthur Winter
        */
        return false
    }

    const is_saturated_hydrocarbon = () => {

        /* Alkanes are compounds that contain only carbon-carbon single bonds. Because they have the maximum possible number of hydrogens, alkanes are said to be saturated hydrocarbons.
                 Excerpt from Organic Chemistry I For Dummies Arthur Winter
        */
        return false

    }



    const functional_groups = ()=> {

        /*
@see https://www.masterorganicchemistry.com/2010/10/06/functional-groups-organic-chemistry/

        Carbon, though, is unique among the elements in that it has the capability of forming stable compounds that have        multiple bonds to other carbons, in addition to stable bonds to other non-carbon atoms, forming reactive centers.       These reactive centers are called functional groups and are the reactive portions in an organic molecule.               Chemists organize organic compounds based on what functional groups are present in a particular molecule.

        Hydrocarbons include alkanes (which contain only single bonds and are generally not considered a functional             group), alkenes (molecules containing carbon-carbon double bonds), alkynes (molecules containing carbon-carbon          triple bonds), and aromatics (double-bond-containing ring systems).
        Excerpt from Organic Chemistry I For Dummies Arthur Winter
        */
        if (is_hydrocarbon()) {

            return {


                /*
                  Alkanes (molecules containing just singly bonded hydrogen and carbon atoms) are pretty much inert under most            conditions. Excerpt from Organic Chemistry I For Dummies Arthur Winter
                  */
                // filter out C and H from canonical_smile. If we’re left with an empty string then we have an alkane

                alkane: false,

                /*
                The aromatics (or arenes, as they’re often called) consist of rings containing alternating double bonds.                The principal aromatic compound is benzene, a six-carbon ring containing three alternating double bonds.
                 Excerpt from Organic Chemistry I For Dummies Arthur Winter
                */
                aromatic: false,

                /*
                Alkynes are molecules that contain a carbon-carbon triple bond. See Figure 5-4. Many of their reactions                 and properties are similar to those of the alkenes, although the chemistry of alkenes and alkynes has                   some interesting differences."
                Excerpt from Organic Chemistry I For Dummies Arthur Winter
                */
                alkyne: false,

                /*
                An alkene is a molecule that contains a carbon-carbon double bond (see Chapter 2 for more on double bonds

                Alkenes are particularly important to organic chemists because they can be transformed into many                        different functional groups. They’re easily made and converted into other things; this makes them                       particularly useful as go-betweens in the synthesis of complex molecules. In this book, I show how                      alkenes are converted into alkanes, cycloalkanes, cyclic ethers, alcohols, alkyl halides, aldehydes, and                carboxylic acids. Talk about versatile.

"Alkenes are compounds that contain carbon-carbon double bonds. Because alkenes are so often found in valuable compounds (like pharmaceuticals), they’re one of the most important functional groups in organic chemistry. Alkenes are also very versatile, because they’re easy to make and convert into other molecules, as Figure 9-1 shows. Therefore, alkenes become useful as waypoints on the road to synthesizing other molecules"

Excerpt from
Organic Chemistry I For Dummies
Arthur Winter
This material may be protected by copyright.


                Excerpt from Organic Chemistry I For Dummies Arthur Winter
                */
                alkene: false
            }

        } else {

            return {

                /*
                The halides are organic compounds that contain one or more halogens. (Halogens are "those elements
                found in column 7A of the periodic table.) The four halogens that you frequently see in organic compounds                are fluorine, chlorine, bromine, and iodine. The general form of a halide is shown in Figure 5-9.
                Excerpt from Organic Chemistry I For Dummies Arthur Winter
                */
                alkyl_halide: false,

                /*
                Alcohols are also a very common and important group of organic compounds. Alcohols consist of the general               formula R-OH, and have names that end with the suffix –ol."
                Excerpt from Organic Chemistry I For Dummies Arthur Winter
                */
                alcohol: false,

                /*
                Very few organic chemists have a burning desire to work with thiols. That’s because thiols are                          foul-smelling compounds, of the general formula R-SH. Thiols are the sulfur analog of alcohols and are                  often hideously unpleasant compounds.
                Excerpt from Organic Chemistry I For Dummies Arthur Winter
                */
                thiol: false,

                /*
                Ethers are molecules containing an oxygen sandwiched between two carbons (see Figure 5-15). Molecules
                containing ether functional groups are widely used as solvents in organic reactions.
                Excerpt from Organic Chemistry I For Dummies Arthur Winter
                */
                ether: false,

                /*
               The carboxylic acid functional group is made up of a carbonyl group attached to an OH group. The general form of carboxylic acids is shown in Figure 5-19.
                Excerpt from Organic Chemistry I For Dummies Arthur Winter
                */
                carboxylic_acid: false,

                /*
               Esters are very similar in structure to carboxylic acids. An ester is basically a carboxylic acid with the hydrogen snipped off, and an R group glued in its place. (In fact, esters are made from carboxylic acids.).
                Excerpt from Organic Chemistry I For Dummies Arthur Winter
                */
                ester: false,

                /*
                           Amides are close relatives of esters, except that amides have a nitrogen (rather than an oxygen) next to the carbonyl group. Amides are quite often found in nature.
                            Excerpt from Organic Chemistry I For Dummies Arthur Winter
                            */
                amide: false,

                /*
                            Amines are nitrogen atoms that take the place of a carbon atom in an alkane (the three forms of an amine are R-NH2, R2NH, or R3N).
                              Excerpt from Organic Chemistry I For Dummies Arthur Winter
                              */
                amine: false,

                /*
                            Nitriles (see Figure 5-23) are compounds that contain a carbon triply bonded to nitrogen. Nitriles are often useful in organic synthesis. Nitriles can be converted into carboxylic acids and amines by well-known procedures. Acetonitrile, in which the R group is a methyl group (CH3), is a common organic solvent.
                              Excerpt from Organic Chemistry I For Dummies Arthur Winter
                              */
                nitrile: false
            }
        }
    }

    const carbonyl_compounds = () => {

        /*
        The chemistry of living things is largely the chemistry of carbonyl compounds. A carbonyl group is a C=O group —
        in other words, a carbon atom double-bonded to oxygen. A carbonyl group is not considered a functional group in         itself; instead, it’s considered a component in some of the most important functional groups, including the             aldehydes, ketones, esters, amides, and carboxylic acids.
        Excerpt from Organic Chemistry I For Dummies Arthur Winter
        */
        return {

            /*
            Aldehydes are the simplest of the carbonyl compounds. In an aldehyde (see Figure 5-16), the carbonyl group is           flanked by one hydrogen and one R group. It may be helpful to think of an aldehyde as a carbonyl group at the           end of an organic molecule.
            Excerpt from Organic Chemistry I For Dummies Arthur Winter
            */
            aldehyde: false,

            /*
           Compounds that contain a carbonyl group sandwiched between two carbons   are called ketones. If an aldehyde can be thought of as a carbonyl at the end of a molecule, then a ketone is a carbonyl somewhere in the middle of a molecule.
            Excerpt from Organic Chemistry I For Dummies Arthur Winter
            */
            ketone: false

        }
    }

    const is_chiral = () => {

        /*
    The two different limonene molecules shown in Figure 6-1 are stereoisomers (molecules with the same atom connectivity but with different orientations of those atoms in space). Stereoisomers are different from constitutional isomers. Constitutional isomers are molecules with the same molecular formula but with atoms connected to each other in different ways (see Chapter 7).

        Your hands, for example, are stereoisomers. On both hands, all your fingers are attached in the same way — thumb, index finger, middle finger, ring finger, and pinky, in that exact order. But although your hands have the same finger connectivity, your hands are not identical — they’re stereoisomers of each other."

    Molecules that are nonsuperimposable mirror images of each other are called enantiomers. Your right hand is the enantiomer of your left hand because your hands are mirror images of each other (put your right hand up to a mirror, and you’ll see what looks like a left hand). Enantiomers cannot be superimposed onto each other, just as your right hand cannot be superimposed on your left hand"

    Molecules that are not superimposable on their mirror images (like the halogenated methane shown in Figure 6-3) are said to be chiral molecules (hard k sound, rhymes with viral). Conversely, molecules that can be superimposed on their mirror images are said to be achiral.

            Only chiral molecules have enantiomers

    How can you tell whether a molecule will be chiral or achiral without constructing the molecule’s mirror image and seeing if the two can be superimposed? Most often, chiral molecules contain at least one carbon atom with four nonidentical substituents. Such a carbon atom is called a chiral center (or sometimes a stereogenic center), using organic-speak. Any molecule that contains a chiral center will be chiral (with one exception, discussed later).

    Any molecule that contains a chiral center will be chiral, with one exception: Those molecules that contain a plane of symmetry will be achiral. A plane of symmetry is a plane that cuts a molecule in half, yielding two halves that are mirror reflections of each other.

                    Excerpt from Organic Chemistry I For Dummies Arthur Winter

             */

    }

    const _atoms = () => {
        const AtomsFactory = require("./AtomsFactory")
        return undefined === atoms || null === atoms?AtomsFactory(molecule_data.CanonicalSMILES, add_hydrogens):atoms
    }

    const number_of_double_bonds = () => {
        const atoms_controller = AtomsController(_.map(atoms, _.clone), molecule_data.CanonicalSMILES, add_hydrogens)
        return atoms_controller.number_double_bonds
    }

    const number_of_triple_bonds = () => {
        const atoms_controller = AtomsController(_.map(atoms, _.clone), molecule_data.CanonicalSMILES, add_hydrogens)
        return atoms_controller.number_of_triple_bonds
    }

    // Requires _atoms to be set
    const isAlkane = () => {

        if (number_of_double_bonds() > 0 || number_of_triple_bonds() > 0) {
            return false
        }

        const atoms_controller = AtomsController(_.map(atoms, _.clone), molecule_data.CanonicalSMILES, add_hydrogens)
        return atoms_controller.has_all_carbons

    }

    const isAlkene = () => {
        if (number_of_double_bonds() === 0 || number_of_triple_bonds() > 0) {
            return false
        }
        const atoms_controller = AtomsController(_.map(atoms, _.clone), molecule_data.CanonicalSMILES, add_hydrogens)
        return atoms_controller.has_all_carbons
    }

    const is_electrophile = () => {
        const groups = functional_groups()
        if (groups.akyl_halide) {
            return true
        }
        return
    }

    const is_nucleophile = () => {
        return false
    }

    return {
        tag: tag,
        molecular_formula: molecule_data.MolecularFormula?molecule_data.MolecularFormula:generate_chemical_formula(),
        canonical_SMILES: molecule_data.CanonicalSMILES,
        substituents: extract_substituents(),
        trunk: extract_trunk(),
        dipole_moment: "To do - dipole moment",
        is_hydrocarbon: is_hydrocarbon(),
        is_alkane: isAlkane(),
        isAkylHalide: () => {
            if (number_of_double_bonds() >= 1 || number_of_triple_bonds() >= 1) {
                return false
            }
            const atoms_controller = AtomsController(_.map(atoms, _.clone), molecule_data.CanonicalSMILES, add_hydrogens)
            return atoms_controller.filter_atoms_by((atom)=>{
                return !atom.is_halogen && atom.atomicSymbol !== "C" && atom.atomicSymbol !== "H"
            }).length ===0
        },
        is_halogenic_acid: () => {
            // Only halogens and hydrogens with at least one hydrogen
            const atoms_controller = AtomsController(_.map(atoms, _.clone), molecule_data.CanonicalSMILES, add_hydrogens)
            if ( atoms_controller.filter_atoms_by((atom)=>{
                return atom.atomicSymbol === "H"
            }).length ===0) {
                return false
            }
            return atoms_controller.filter_atoms_by((atom)=>{
                return !atom.is_halogen && atom.atomicSymbol !== "H"
            }).length ===0
        },
        is_alkene: isAlkene(),
        functional_groups: functional_groups(),
        carbonyl_compounds: carbonyl_compounds(),
        is_chiral: is_hydrocarbon(),
        is_electrophile: is_electrophile(),
        is_nucleophile: is_nucleophile(),
        is_saturated_hydrocarbon: is_saturated_hydrocarbon(),
        SMILE_chains: extract_SMILE_chains(),
        atoms:_atoms(),
        CID: molecule_data.CID,
        MolecularWeight: molecule_data.MolecularWeight,
        CanonicalSMILES: molecule_data.CanonicalSMILES,
        IsomericSMILES: molecule_data.IsomericSMILES,
        InChI: molecule_data.InChI,
        InChIKey: molecule_data.InChIKey,
        IUPACName: molecule_data.IUPACName,
        XLogP:molecule_data.XLogP,
        ExactMass: molecule_data.ExactMass,
        MonoisotopicMass: molecule_data.MonoisotopicMass,
        TPSA: molecule_data.MonoisotopicMass,
        Complexity: molecule_data.TPSA,
        Charge: molecule_data.Charge,
        HBondDonorCount: molecule_data.HBondDonorCount,
        HBondAcceptorCount:molecule_data.HBondAcceptorCount,
        RotatableBondCount: molecule_data.RotatableBondCount,
        HeavyAtomCount: molecule_data.HeavyAtomCount,
        IsotopeAtomCount: molecule_data.IsotopeAtomCount,
        AtomStereoCount: molecule_data.AtomStereoCount,
        DefinedAtomStereoCount: molecule_data.DefinedAtomStereoCount,
        UndefinedAtomStereoCount: molecule_data.DefinedAtomStereoCount,
        BondStereoCount: molecule_data.BondStereoCount,
        DefinedBondStereoCount: molecule_data.DefinedBondStereoCount,
        UndefinedBondStereoCount: molecule_data.UndefinedBondStereoCount,
        CovalentUnitCount: molecule_data.CovalentUnitCount,
        Volume3D: molecule_data.Volume3D,
        XStericQuadrupole3D: molecule_data.XStericQuadrupole3D,
        YStericQuadrupole3D: molecule_data.YStericQuadrupole3D,
        ZStericQuadrupole3D: molecule_data.ZStericQuadrupole3D,
        FeatureCount3D: molecule_data.FeatureCount3D,
        FeatureAcceptorCount3D: molecule_data.FeatureAcceptorCount3D,
        FeatureDonorCount3D: molecule_data.FeatureDonorCount3D,
        FeatureAnionCount3D: molecule_data.FeatureAnionCount3D,
        FeatureCationCount3D: molecule_data.FeatureCationCount3D,
        FeatureRingCount3D: molecule_data.FeatureRingCount3D,
        FeatureHydrophobeCount3D: molecule_data.FeatureHydrophobeCount3D,
        ConformerModelRMSD3D: molecule_data.ConformerModelRMSD3D,
        EffectiveRotorCount3D: molecule_data.EffectiveRotorCount3D,
        ConformerCount3D: molecule_data.ConformerCount3D,
        Fingerprint2D: molecule_data.Fingerprint2D
    }

}

module.exports = MoleculeFactory
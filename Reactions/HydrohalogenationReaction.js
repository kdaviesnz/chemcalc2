// HydrohalogenationReaction
return

const ReactionFactory = require('../factories/ReactionFactory.js')
const MoleculeFactory = require('../factories/MoleculeFactory.js')
const MoleculeControllerFactory = require('../factories/MoleculeControllerFactory.js')
const MoleculeController = require('../controllers/MoleculeController.js')
const HalfArrowPushReaction = require('./HalfArrowPushReaction.js')
const FullArrowPushReaction = require('./FullArrowPushReaction.js')
const ProtonationReaction = require('./ProtonationReaction.js')
const RecursiveStabilisationReaction = require('./RecursiveStabilisationReaction')
const FindDoubleBondPair = require('../Commands/FindDoubleBondPair')
const FindHydrohalicAcidHydrogenAtom = require('../Commands/FindHydrohalicAcidHydrogenAtom')
const FindProtonationTargetAtom = require('../Commands/FindProtonationTargetAtom')
const Nomenclature = require('../Nomenclature')
const FindAnionAtom = require('../Commands/FindAnionAtom')
const FindCationAtom = require('../Commands/FindCationAtom')
const MoleculeChainFactory = require("../factories/MoleculeChainFactory")
const MoleculeLookup = require("../MoleculeLookup")

/*

Halogens

The halogens (/ˈhælədʒən, ˈheɪ-, -loʊ-, -ˌdʒɛn/[1][2][3]) are a group in the periodic table consisting of five chemically related elements:
 fluorine (F), chlorine (Cl), bromine (Br), iodine (I), and astatine (At). The artificially created element 117 (tennessine, Ts) may also be a halogen.
 In the modern IUPAC nomenclature, this group is known as group 17. The symbol X is often used generically to refer to any halogen.

To be a halogenic acid the H must be on the left side.

Process (See note (7) REAGENTS)

The H halogenic acid atom is in front of the molecule so therefore it is the electrophile (positive).

The alkene molecule carbon to the right of the double bond is the least substituted so therefore it is the nucleophile (wants electrons).
The nucleophile carbon atom of the double bond of the alkene molecule attacks the hydrogen atom in the halogenic acid, forming a bond and turning the halogenic acid
into a halogenic radical.
This removes an electron from the electrophile carbon atom of the double bond turning the atom into a cation.
The halogenic radical then attacks the  electrophile carbon atom of the double bond of the alkene molecule forming a bond.

 */
const HydrohalogenationReaction = (alkene_molecule, hydrohalic_acid, do_verification_checks, db, callback) => {

    const react = () => () => {

        alkene_molecule.should.be.a.Object()
        hydrohalic_acid.should.be.a.Object()
        do_verification_checks.should.be.a.Boolean()
        callback.should.be.a.Function()

        hydrohalic_acid.should.have.property("atoms")
        hydrohalic_acid.atoms.should.be.a.Object()
        if ( hydrohalic_acid.atoms.length !==2) {
            console.log(hydrohalic_acid)
        }
        hydrohalic_acid.atoms.length.should.equal(2)

        if(hydrohalic_acid.atoms[0].atomicSymbol !== "H") {
            callback(new Error("Hydrohalogenation reaction -  To be a halogenic acid the H must be on the left side. Reagent must be a halogencic acid ie HX,"), null)
            return null
        }

        //  A full headed arrow is used to show the movement of two electrons
        /* "The mechanism of the reaction is shown in Figure 10-2. The first step of the reaction is protonation of the [alkene molecule] double bond by the acid.
        This leads to a short-lived carbocation intermediate (cations on carbon atoms are called carbocations). The carbocation is then attacked by
        the free halide anion to generate the alkyl halide."
        Excerpt from Organic Chemistry I For Dummies,  Arthur Winter [chapter 10]

Cations and anions are both ions. The difference between a cation and an anion is the net electrical charge of the ion.

Ions are atoms or molecules which have gained or lost one or more valence electrons giving the ion a net positive or negative charge. If the chemical species has more protons than electrons, it carries a net positive charge. If there are more electrons than protons, the species has a negative charge. The number of neutrons determines the isotope of an element but does not affect the electrical charge.

Cations are ions with a net positive charge and have more protons than electrons.

Sometimes you can predict whether an atom will form a cation or an anion based on its position on the periodic table. Alkali metals and alkaline earths always form cations. Halogens always form anions. Most other nonmetals typically form anions (e.g., oxygen, nitrogen, sulfur), while most metals form cations (e.g., iron, gold, mercury).

        */
        // Add indexes to hydrohalic_acid.atoms
        hydrohalic_acid.atoms = hydrohalic_acid.atoms.map(
            (atom,index)=>{
                atom.index=index
                return atom
            }
        )

        // Find the alkene molecule double band
        const alkene_molecule_double_bond_atom_pair = FindDoubleBondPair(alkene_molecule)

        hydrohalic_acid.atoms[1].is_halogen.should.be.equal(true)

        // Get index of hydrohalic_acid target atom. This is the hydrogen atom attached to a non-hydrogen
        const hydrohalic_acid_hydrogen_atom_index = FindHydrohalicAcidHydrogenAtom(hydrohalic_acid).index
        hydrohalic_acid_hydrogen_atom_index.should.be.equal(0)


        /*
        "The Russian chemist Vladimir Markovnikov observed that alkenes are protonated on the least substituted carbon in the double bond,
        generating the carbocation on the most highly substituted carbon atom. In other words, tertiary carbocations (carbocations substituted
         by three alkyl groups and abbreviated 3°) are preferred over secondary carbocations (cations substituted by two alkyl groups and abbreviated 2°).
          Secondary carbocations in turn are favored over primary carbocations (1°), those cations substituted by just one alkyl group.

        An alkyl group is a combination of carbon and hydrogen atoms with the general formula CnH2n+1. Technically, it is an alkane molecule minus one hydrogen atom.

        Because of this preference for more highly substituted carbocations, halides add to the carbon that's most substituted with alkyl groups. When addition
        occurs on the most substituted carbon, as in the reaction shown in Figure 10-2, the product is called the Markovnikov product, in honor of the discoverer
        of this phenomenon.

        Because this reaction favors one of two products — halide addition to the more substituted side of the double bond as opposed to halide addition to the
        less substituted side — this reaction is said to be regioselective. Regioselective reactions are those that prefer one constitutional isomer in a reaction
        to another. (Recall that constitutional isomers are molecules with the same molecular formula, but the atoms bonded in different ways.)"

        "Carbocations are also stabilized by resonance. (See Chapter 3 for how to draw resonance structures.) Carbocations with resonance structures are more
        stable than carbocations without resonance structures, all else being equal. Thus, benzylic cations (cations next to a benzene ring), and allylic cations
        (cations adjacent to a double bond) are stabilized cations because of resonance delocalization of the positive charge onto other atoms, as shown in Figure 10-5."

        Excerpt from Organic Chemistry I For Dummies, Arthur Winter [chapter 10]

        */

        should.exist(alkene_molecule_double_bond_atom_pair[0])
        should.exist(alkene_molecule_double_bond_atom_pair[1])

        const alkene_molecule_protonation_target_atom = FindProtonationTargetAtom(alkene_molecule, alkene_molecule_double_bond_atom_pair)
        alkene_molecule_protonation_target_atom_index = alkene_molecule_protonation_target_atom.index

        alkene_molecule_protonation_target_atom_index.should.be.a.Number()

        // Verify carbon atoms
        hydrohalic_acid.atoms.map(
            (atom, i) => {
                if (atom.atomicSymbol==='C') {
                    atom.outer_shell_electrons.length.should.be.equal(4)
                }
            }
        )
        alkene_molecule.atoms.map(
            (atom, i) => {
                if (atom.atomicSymbol==='C') {
                    atom.outer_shell_electrons.length.should.be.equal(4)
                }
            }
        )

        // Break the double bond on the alkene molecule
        // ProtonationReaction(HCL_JSON_object.atoms[0], alkene_molecule_JSON_object, double_bond_index, HCL_JSON_object, true, (Err, reaction) => {
        const reaction_add_proton_to_carbon_atom_on_alkene_molecule_double_bond =
            ProtonationReaction(
                hydrohalic_acid.atoms[hydrohalic_acid_hydrogen_atom_index],
                alkene_molecule,
                alkene_molecule_protonation_target_atom_index,
                hydrohalic_acid,
                do_verification_checks,
                (Err, reaction) => {

                    /* In chemistry, protonation is the addition of a proton to an atom, molecule, or ion, forming the conjugate acid. Some examples include.
                       the protonation of water by sulfuric acid: H2SO4 + H2O ⇌ H3O+ + HSO
                    */

                    reaction.should.be.Object()
                    reaction.should.have.property('products')
                    reaction.products.should.be.Array()
                    reaction.products.length.should.be.equal(2)


                    const alkene_with_carbocation = reaction.products[0]

                    if (do_verification_checks) {
                        alkene_with_carbocation.atoms[alkene_molecule_protonation_target_atom_index].is_cation.should.be.equal(true)
                        if (do_verification_checks) {
                            alkene_with_carbocation.atoms[alkene_molecule_protonation_target_atom_index].is_cation.should.be.equal(true)
                            const molecule_cation_atom = FindCationAtom(alkene_with_carbocation)
                            molecule_cation_atom.__id.should.be.equal(alkene_with_carbocation.atoms[1].__id)
                        }
                    }

                    const halogen_with_anion = reaction.products[1]

                    RecursiveStabilisationReaction(alkene_with_carbocation, halogen_with_anion, 0, (Err, reaction) => {

                        reaction.products.length.should.be.equal(1)

                        const chain = MoleculeChainFactory(reaction.products[0])
                        reaction.products[0].canonical_SMILES = chain.SMILES

                        if (reaction.products[0].canonical_SMILES === false) {
                            return false
                        }

                        MoleculeLookup(db, reaction.products[0].canonical_SMILES, true).then(
                            (product_JSON_object) => {

//                        const nomenclature = Nomenclature(reaction.products[0])
                                //                      nomenclature.should.be.an.Object()
                                //                    nomenclature.should.have.property('calcLongestCarbonChain')
//                        const molecule_name = nomenclature.determineName()
                                //                      console.log("Molecule name:")
                                //                    console.log(molecule_name)
                                reaction.type = "Hydrohalogenation reaction"
                                reaction.products[0] = product_JSON_object
                                callback(Err, reaction)
                            },
                            (Err) => {
                                if (null !== Err) {
                                    should.ifError(Err);
                                }
                                console.log(Err)
                                console.log('HydrohalogenationReactions.js')
                                process.exit()
                            }
                        )



                    })


                })

    } // react

    const reaction = ReactionFactory([alkene_molecule, hydrohalic_acid], "reaction", react())

}

module.exports = HydrohalogenationReaction

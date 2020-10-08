//FreeRadicalHalogenationReaction
const ReactionFactory = require('../factories/ReactionFactory.js')
const HalfArrowPushReaction = require('./HalfArrowPushReaction.js')
const HomolyticCleavageReaction = require('./HomolyticCleavageReaction.js')
const MoleculeFactory = require('../factories/MoleculeFactory.js')

const FreeRadicalHalogenationReaction =

    (alkane_molecule, X_molecule, callback) => {

        const process = () => () => {

            //  a half headed arrow is used to show the movement of one electron
            /*
            Because alkanes are essentially inert under most conditions, virtually the only reaction of alkanes that you see is the free-radical halogenation reaction. This reaction is often the first reaction that you encounter in organic chemistry.

            The chlorination of methane is shown in Figure 8-20. In this reaction, a chlorine atom is substituted for a methane hydrogen.

            HHHHC   +.     CL2.      Hv->.           HHHCCL.       +.     HCL

            One feature that’s interesting about this chlorination reaction is that the reaction is photochemical: Instead of using heat to start the reaction, the reaction uses light (abbreviated hν)! The reaction proceeds in three stages — initiation, propagation, and termination.

            Organic Chemistry I For Dummies Arthur Winter
            */

            // returns a reaction json object
            // A reaction json object consists of reactants, products and type fields
            /*
            "Getting things started: Initiation
            In the initiation step, light is shone on the reaction and the radiation is absorbed by the chlorine (Cl2). The light provides enough energy for the married chlorines to divorce — that is, for the chlorine-chlorine bond to break apart to form two chloride radicals, as shown in Figure 8-21. (Recall that free radicals are compounds that contain unpaired electrons.) This kind of bond dissociation is called homolytic cleavage, because the bond breaks symmetrically — one electron from the bond goes to one side, and the other electron goes to the other side, just as half of the shared property goes to each person in a divorce (theoretically). Note that you use one-headed fishhook arrows to show the movement of only one electron. See Chapter 3 for more on using arrows in organic chemistry."

            Organic Chemistry I For Dummies Arthur Winter
            */

            // molecule should consist of 2 bonded atoms of the same chemical eg CL2
            /*
            Returns reaction json object
            Example
            {
                    reactants: chlorine_molecule,
                    products: [Cl,Cl],
                    type: photochemical
                }
            */
            const homolyticcleavageReaction = HomolyticCleavageReaction(X_molecule, (err, reaction) => {

                // reaction.products should consist of two atoms of the same type

                /*
                "Keeping the reaction going: Propagation
                After the reaction has been initiated by forming the chlorine radicals, the reaction proceeds to the propagation steps (see Figure 8-22). A chlorine radical is unstable because the chlorine atom only has seven valence electrons, one electron short of having its valence octet completely full. To fill its valence octet, a chlorine radical then plucks a hydrogen atom (not a proton) from the methane to make hydrochloric acid plus the methyl radical. Now, however, the methyl radical is one electron short of completing its octet. So, the methyl radical then attacks another molecule of chlorine to make chloromethane plus another chlorine radical."

                Organic Chemistry I For Dummies Arthur Winter
                */

                // 1.
                /*
                To fill its valence octet, a chlorine radical then plucks a hydrogen atom (not a proton) from the methane to make hydrochloric acid plus the methyl radical.
                hydrochloric acid = HCl
                */
                X_atom = reaction.products[0]
                const reaction_propogation_step_1 = HalfArrowPushReaction(alkane_molecule, "H", X_molecule, X_atom.atomicSymbol, (error, reaction) => {

                    const hydroX_acid = reaction.products[1]
                    const methyl_radical = reaction.products[0]

                    /*
                    Now, however, the methyl radical is one electron short of completing its octet. So, the methyl radical then attacks another molecule of chlorine to make chloromethane plus another chlorine radical.
                    */

                    // push electron from other chlorine atom to methyl radical
                    const reaction_propogation_step_2 = HalfArrowPushReaction(hydroX_acid, X_atom.atomicSymbol, methyl_radical, "C", (error, reaction) => {

                        /*
                        reaction_propogation_step_2 products should be chloromethane  CH3Cl plus another chlorine radical.
                        */
                        const X_radical = reaction.products[0]
                        const Xmethane = reaction.products[1]

                        /*
                     "You’re fired: Termination steps
                     Because this reaction generates chlorine radicals as a byproduct, the reaction is called a chain reaction. In a chain reaction, the reactive species (in this case, the chlorine radical) is regenerated by the reaction. If not for the termination steps, this reaction could theoretically continue until all the starting materials were consumed. Termination steps are reactions that remove the reactive species without generating new ones. Any of the radical couplings shown in Figure 8-23 are considered termination steps because they remove the reactive species (the free radicals) from the reaction without replacing them."

                         Organic Chemistry I For Dummies Arthur Winter
                     */
                        callback(reaction.products.length < 2 ? new Error("Molecule is not an alkane") : null, reaction)

                    }) // reaction_propogation_step_2 HalfArrowPushReaction


                }) // reaction_propogation_step_1 HalfArrowPushReaction


            }) // homolyticcleavageReaction


        } // const process

        const reaction = ReactionFactory([alkane_molecule, X_molecule], "reaction", process())


    }

module.exports = FreeRadicalHalogenationReaction










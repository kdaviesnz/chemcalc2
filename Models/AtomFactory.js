// AtomFactory

const uniqid = require('uniqid');
const symbols = require('chemical-symbols');
const chemicalFormula = require('chemical-formula')
const smiles_parser = require('smiles')
const molFormula = require('molecular-formula')
const elements = require('@chemistry/elements/dist/elements')
const pubchem = require("pubchem-access").domain("compound");
//console.log(elements.Element.getElementById(1));
//console.log(elements.Element.getElementByName('C'));
const water = new molFormula('H2O')
//console.log(water.getComposition())
water.subtract({'H':1})
//console.log(water.getSimplifiedFormula())
water.add({"H":1})
//console.log(water.getSimplifiedFormula())
//console.log(symbols)
//console.log(chemicalFormula('HOCH2CH2OH'))

const range = require("range");
// range.range(1,10,2)
/*

e {
  number: 6,
  symbol: 'C',
  RCow: 0.77,
  RVdW: 1.7,
  maxBonds: 4,
  mass: 12.0107,
  name: 'Carbon',
  posX: 2,
  posY: 14,
  color: '#909090',
  color2: '#000000' }

 */

// status 0 neutral 1 anion 2 cation
const AtomFactory = (atomicSymbol, outer_shell_electrons, protons, _atom_id) => {

    /*
    Most often, chiral molecules contain at least one carbon atom with four nonidentical substituents. Such a carbon atom is called a chiral center (or sometimes a stereogenic center), using organic-speak.

    Any chiral center can have two possible configurations (just as a hand can have two configurations, either right or left), and these configurations are designated either R or S by convention (the letters R and S come from the Latin words for right and left, rectus and sinister). If a molecule has a chiral center that is designated R, the chiral center will be S in the molecule’s enantiomer.

            You need to be able to assign whether a chiral center is R or S. To do so, you need to follow three steps:

            Number each of the substituents on the chiral center carbon using the Cahn–Ingold–Prelog system.
            This numbering scheme is conveniently the same one used in determining E/Z stereochemistry on double bonds, as described (in more detail) in Chapter 11. According to the Cahn–Ingold–Prelog prioritizing scheme, the highest priority goes to the substituent whose first atom has the highest atomic number. (For example, Br "would be higher priority than Cl, because Br has a larger atomic number.) If the first atoms on two substituents are the same, you keep going down the chain until you reach a larger atom and the tie is broken.
            After you’ve assigned priorities to each of the substituents, rotate the molecule so that the number-four priority substituent is oriented in the back.
            Draw a curve from the first-priority substituent through the second-priority substituent and then through the third.
            If the curve goes clockwise, the chiral center is designated R; if the curve goes counterclockwise, the chiral center is designated S.
                            Excerpt from Organic Chemistry I For Dummies Arthur Winter
            */

    const is_s_chiral_center = () =>{
        /*
          outer_shell_electrons:
   [ { __id: '2fp4m1wajpq8mdqi',
       ref: '2fp4m1wajpq8mdqz',
       bonded_atom: [Object]
     },
     { __id: '2fp4m1wajpq8mdqj' },
     { __id: '2fp4m1wajpq8mdqk' },
     { __id: '2fp4m1wajpq8mdql' } ],
         */

    }


    const is_r_chiral_center = () =>{

    }

    const atom_id = undefined!==_atom_id?_atom_id:uniqid()

    const isHeteroatom = () =>{

        /*Heteroatoms are atoms other than carbon or hydrogen. They include such important atoms as the halogens, oxygen, and sulfur, and are the components of the halide, alcohol, ether, and thiol functional groups. Each of these functional groups is described in this section.
            Excerpt from Organic Chemistry I For Dummies Arthur Winter
        */

//            If atomicSymbol is not C or H then return true
        return false

    }


    const outer_shell_electron_count = () => {

        if (outer_shell_electrons.length === 0){
            // @todo
            // for now just hardcode common values
            const map =  {
                'H':1, 'O':2, 'N':3, 'C':4, 'K':1, 'B':3, 'Cl':7
            }
            return map[atomicSymbol]
        }

        if (atomicSymbol==="C") {
            outer_shell_electrons.length.should.be.equal(4)
        }

        // greedy-ionic bonds count as 2, generous-ionic count as 0
        return outer_shell_electrons.length + (outer_shell_electrons.filter(
            (electron) => {
                return undefined !== electron.bond_type && electron.bond_type === "greedy-ionic"
            }
        ).length) - (outer_shell_electrons.filter(
            (electron) => {
                return undefined !== electron.bond_type && electron.bond_type === "generous-ionic"
            }
        ).length)



    }
    /*
    The number of bonds for a neutral atom is equal to the number of electrons in the full valence shell (2 or 8 electrons) minus the number of valence electrons. This method works because each covalent bond that an atom forms adds another electron to an atoms valence shell without changing its charge.*/
    const outerShellElectrons = () => {
        if (outer_shell_electrons.length === 0){
            const r = range.range(0, outer_shell_electron_count())
            return r.map(
                (row) => {
                    return {
                        __id: uniqid()
                    }
                }
            )
        }
        return outer_shell_electrons
    }

    const electronCount = () => {
        // @todo
        return atomicSymbol ==="H"?1:(atomicSymbol ==="Cl"?10+outer_shell_electron_count():2 + outer_shell_electron_count())
    }

    const electrons = () => {
        return []
    }

    const protonCount = () => {
        if (null === protons){
            const e = elements.Element.getElementByName(atomicSymbol)
            return e.number
        }
        return protons.length

    }

    const Protons = () => {

        if (null === protons){
            const r = range.range(0, protonCount())
            return r.map(
                (row) => {
                    return {
                        __id: uniqid(),
                        atom_id:atom_id
                    }
                }
            )
        }
        return protons
    }


    const atomicNumber = () => {
        const e = elements.Element.getElementByName(atomicSymbol)
        return e.number
    }

    const isCation = (protons) => {
        // To determine is an atom is a cation we count the number of electrons - the number of paired electrons
        return protonCount() > electronCount()
    }

    const isAnion = (protons) => {
        return protonCount() < electronCount()
    }

    /*
    "The Russian chemist Vladimir Markovnikov observed that alkenes are protonated on the least substituted carbon in the double bond, generating the carbocation on the most highly substituted carbon atom. In other words, tertiary carbocations (carbocations substituted by three alkyl groups and abbreviated 3°) are preferred over secondary carbocations (cations substituted by two alkyl groups and abbreviated 2°). Secondary carbocations in turn are favored over primary carbocations (1°), those cations substituted by just one alkyl group.

    An alkyl group is a combination of carbon and hydrogen atoms with the general formula CnH2n+1. Technically, it is an alkane molecule minus one hydrogen atom.

    Because of this preference for more highly substituted carbocations, halides add to the carbon that’s most substituted with alkyl groups. When addition occurs on the most substituted carbon, as in the reaction shown in Figure 10-2, the product is called the Markovnikov product, in honor of the discoverer of this phenomenon.

    Because this reaction favors one of two products — halide addition to the more substituted side of the double bond as opposed to halide addition to the less substituted side — this reaction is said to be regioselective. Regioselective reactions are those that prefer one constitutional isomer in a reaction to another. (Recall that constitutional isomers are molecules with the same molecular formula, but the atoms bonded in different ways.)"

    Excerpt from
    Organic Chemistry I For Dummies
    Arthur Winter
    This material may be protected by copyright.
    */
    const akylGroupCount = () => {

        return 0
    }

    const isHalogen = () => {
        return atomicSymbol.indexOf(['F', 'Cl', 'CL', 'Br', 'BR', 'I', 'At','AT']) !==false
    }

    return {

        atomicSymbol:atomicSymbol,
        __id: atom_id,
        is_r_chiral_center: is_r_chiral_center(),
        is_s_chiral_center:is_s_chiral_center(),
        isHeteroatom:isHeteroatom(),
        properties: elements.Element.getElementByName(atomicSymbol),
        electron_count: electronCount(),
        electrons: electrons(),
        outer_shell_electrons: outerShellElectrons(),
        outer_shell_electron_count: outer_shell_electron_count(),
        protons: Protons(),
        proton_count:protonCount(),
        atomic_number: atomicNumber(),
        akyl_group_count: akylGroupCount(),

        is_halogen: isHalogen(),

        is_cation: isCation(this.protons),
        is_anion: isAnion(this.protons),

        status: () => {
            return this.electron_count > this.properties.number?'anion'
                :(this.electron_count <this.properties.number?'cation':'neutral')
        },

        hundsRule: (shells) => {
            /*
            Hund’s rule tells you what to do when you come to the last of the electrons that you need to place into orbitals,
            and you’re at an orbital level that will not be entirely filled. In such a case, Hund’s rule states that the
            electrons should go into different orbitals with the same spin instead of pairing up into a single orbital
            with opposite spin.
            */
            return shells_after_hunds_rule_applied
        },

        /*
        This tells us that each subshell has double the electrons per orbital. The s subshell has 1 orbital that can hold up to 2 electrons, the p subshell has 3 orbitals that can hold up to 6 electrons, the d subshell has 5 orbitals that hold up to 10 electrons, and the f subshell has 7 orbitals with 14 electrons.
         */
        shells: () => {

            const shell_config = [
                {shell_index:1, orbital_name: '1s'},
                {shell_index:1, orbital_name: '1s'},
                {shell_index:2, orbital_name: '2s'},
                {shell_index:2, orbital_name: '2s'},
                {shell_index:2, orbital_name: '2px'},
                {shell_index:2, orbital_name: '2px'},
                {shell_index:2, orbital_name: '2py'},
                {shell_index:2, orbital_name: '2py'},
                {shell_index:2, orbital_name: '2pz'},
                {shell_index:2, orbital_name: '2pz'},
                {shell_index:3, orbital_name: '3s'},
                {shell_index:3, orbital_name: '3s'},
                {shell_index:3, orbital_name: '3px'},
                {shell_index:3, orbital_name: '3px'},
                {shell_index:3, orbital_name: '3py'},
                {shell_index:3, orbital_name: '3py'},
                {shell_index:3, orbital_name: '3pz'},
                {shell_index:3, orbital_name: '3pz'},
                {shell_index:4, orbital_name: '4s'},
                {shell_index:4, orbital_name: '4s'},
                {shell_index:3, orbital_name: '3dx'},
                {shell_index:3, orbital_name: '3dx'},
                {shell_index:3, orbital_name: '3dy'},
                {shell_index:3, orbital_name: '3dy'},
                {shell_index:3, orbital_name: '3dz'},
                {shell_index:3, orbital_name: '3dz'},
                {shell_index:3, orbital_name: '3dxy'},
                {shell_index:3, orbital_name: '3dxy'},
                {shell_index:3, orbital_name: '3dxz'},
                {shell_index:3, orbital_name: '3dxz'},
                {shell_index:4, orbital_name: '4px'},
                {shell_index:4, orbital_name: '4px'},
                {shell_index:4, orbital_name: '4py'},
                {shell_index:4, orbital_name: '4py'},
                {shell_index:4, orbital_name: '4pz'},
                {shell_index:4, orbital_name: '4pz'},
                {shell_index:5, orbital_name: '5s'},
                {shell_index:5, orbital_name: '5s'},
                {shell_index:4, orbital_name: '4dx'},
                {shell_index:4, orbital_name: '4dx'},
                {shell_index:4, orbital_name: '4dy'},
                {shell_index:4, orbital_name: '4dy'},
                {shell_index:4, orbital_name: '4dz'},
                {shell_index:4, orbital_name: '4dz'},
                {shell_index:4, orbital_name: '4dxy'},
                {shell_index:4, orbital_name: '4dxy'},
                {shell_index:4, orbital_name: '4dxz'},
                {shell_index:4, orbital_name: '4dxz'},
                {shell_index:5, orbital_name: '5px'},
                {shell_index:5, orbital_name: '5px'},
                {shell_index:5, orbital_name: '5py'},
                {shell_index:5, orbital_name: '5py'},
                {shell_index:5, orbital_name: '5pz'},
                {shell_index:5, orbital_name: '5pz'},
                {shell_index:4, orbital_name: '4fx'},
                {shell_index:4, orbital_name: '4fx'},
                {shell_index:4, orbital_name: '4fy'},
                {shell_index:4, orbital_name: '4fy'},
                {shell_index:4, orbital_name: '4fz'},
                {shell_index:4, orbital_name: '4fz'},
                {shell_index:4, orbital_name: '4fxy'},
                {shell_index:4, orbital_name: '4fxy'},
                {shell_index:4, orbital_name: '4fxz'},
                {shell_index:4, orbital_name: '4fxz'},
                {shell_index:4, orbital_name: '4fyz'},
                {shell_index:4, orbital_name: '4fyz'},
                {shell_index:4, orbital_name: '4fzz'},
                {shell_index:4, orbital_name: '4fzz'},
                {shell_index:5, orbital_name: '5dx'},
                {shell_index:5, orbital_name: '5dx'},
                {shell_index:5, orbital_name: '5dy'},
                {shell_index:5, orbital_name: '5dy'},
                {shell_index:5, orbital_name: '5dz'},
                {shell_index:5, orbital_name: '5dz'},
                {shell_index:5, orbital_name: '5dxy'},
                {shell_index:5, orbital_name: '5dxy'},
                {shell_index:5, orbital_name: '5dxz'},
                {shell_index:5, orbital_name: '5dxz'}
            ]

            // Need to make exception for hydrogen which has only one electron
            // First shell has up to 2 electrons.
            // Second shell has up to 8 electrons.
            return this.hundsRule(range(electron_count).reduce((result, current, index)=>{

                let shell = null
                let orbital = null
                if (!result[index]) {
                    // New shell
                    shell = shell(shell_config[index].shell_index)
                    orbital = orbital(shell_config[index].orbital_name, shell, [])
                    result.push(shell.orbitals.push(orbital.push(electron(orbital))))
                } else {
                    shell = result[index]
                    orbital = shell[orbitals].length === 1? shell[orbitals][0]:shell[orbitals][shell[orbitals].length-1]
                    if (orbitals.electrons.length === 1) {
                        // Current orbital is fill so create a new one.
                        orbital = orbital(shell_config[index].orbital_name, shell, [])
                        shell.push(orbital)
                    }
                    orbital.electrons.push(electron(orbital))
                }

                return result

            }, []))

        },


        clone: (electrons) => {

        },


        /*

                toJSON: {

                    electrons: electrons,

                    status: atom.status(electrons),


                    // other properties from SourceAtom


                }
                */


    }

}


module.exports = AtomFactory
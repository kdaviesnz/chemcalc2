
const CAtom = require('../../Controllers/Atom')
const _ = require('lodash');
const VMolecule = require('../../Components/Stateless/Views/Molecule')
const MoleculeFactory = require('../../Models/MoleculeFactory')
const AtomFactory = require('../../Models/AtomFactory')
const Set = require('../../Models/Set')
const Families = require('../../Models/Families')
const uniqid = require('uniqid');
const HydrationAI = require('../../Components/State/HydrationAI')
const ProtonationAI = require('../../Components/State/ProtonationAI')
const BondsAI = require('../../Components/State/BondsAI')
const ChargesAI = require('../../Components/State/ChargesAI')
const SubstitutionAI = require('../../Components/State/SubstitutionAI')
const range = require("range");

class Reaction {

    constructor(container_substrate, container_reagent, rule) {

        container_substrate.length.should.be.equal(2) // molecule, units
        container_substrate[0].length.should.be.equal(2) // pKa, atoms
        container_substrate[0][0].should.be.an.Number() // pka
        container_substrate[0][1].should.be.an.Array()
        container_substrate[0][1][0].should.be.an.Array()
        container_substrate[0][1][0][0].should.be.an.String()

        if (undefined !== container_reagent && null !== container_reagent && typeof container_reagent[0] !== "string") {
            container_reagent.length.should.be.equal(2) // molecule, units
            container_reagent[0].length.should.be.equal(2) // pKa, atoms
            container_reagent[0][0].should.be.an.Number() // pka
            container_reagent[0][1].should.be.an.Array()
            if (undefined !== container_reagent[0][1][0]) {
                container_reagent[0][1][0].should.be.an.Array()
                container_reagent[0][1][0][0].should.be.an.String()
            }
        }

        this.container_substrate = container_substrate
        this.container_reagent = container_reagent
        this.leaving_groups = []

        this.rule = rule

        this.setMoleculeAI()
        this.setReagentAI()
        this.CommandLogic = require('../../Components/Stateless/CommandLogic')(this)


        this.MoleculeAI.validateMolecule()
        if (this.ReagentAI !== null) {
            this.ReagentAI.validateMolecule()
        }
    }

    setReagentAI() {
        if (this.container_reagent !== null && this.container_reagent !== undefined && typeof this.container_reagent[0] !== "string") {
            this.container_reagent.length.should.be.equal(2) // molecule, units
            this.container_reagent[0].length.should.be.equal(2) // pKa, atoms
            this.container_reagent[0][0].should.be.an.Number() // pka
            this.container_reagent[0][1].should.be.an.Array()
            if (undefined !== this.container_reagent[0][1][0]) {
                this.container_reagent[0][1][0].should.be.an.Array()
                this.container_reagent[0][1][0][0].should.be.an.String()
            }
            this.ReagentAI = require("../Stateless/MoleculeAI")(this.container_reagent)
        } else {
            this.ReagentAI = null
        }
    }

    setMoleculeAICallback() {
        return () => {
            this.setMoleculeAI()
        }
    }

    setMoleculeAI(command_names, command_index, electrophile_index, trace, trace_id) {

        this.container_substrate.length.should.be.equal(2) // molecule, units
        this.container_substrate[0].length.should.be.equal(2) // pKa, atoms
        this.container_substrate[0][0].should.be.an.Number() // pka
        this.container_substrate[0][1].should.be.an.Array()
        this.container_substrate[0][1][0].should.be.an.Array()
        this.container_substrate[0][1][0][0].should.be.an.String()

        this.MoleculeAI = require("../Stateless/MoleculeAI")(this.container_substrate)

        this.MoleculeAI.validateMolecule(trace, trace_id)
    }

    makeCarbonNitrogenDoubleBondReverse() {
        const bondsAI = new BondsAI(this)
        return bondsAI.makeCarbonNitrogenDoubleBondReverse()
    }

    oxygenCarbonDoubleBondReverse() {
        const bondsAI = new BondsAI(this)
        return bondsAI.makeOxygenCarbonDoubleBondReverse()
    }

    setChargeOnSubstrateAtom(index, trace, trace_id) {
        const chargesAI = new ChargesAI(this)
        return chargesAI.setChargeOnSubstrateAtom(index, trace, trace_id)
    }

    setChargesOnSubstrate() {
        const chargesAI = new ChargesAI(this)
        return chargesAI.setChargesOnSubstrate()
    }

    setChargesOnReagent() {
        const chargesAI = new ChargesAI(this)
        return chargesAI.setChargesOnReagent()
    }

    setChargeOnReagentAtom(index) {
        const chargesAI = new ChargesAI(this)
        return chargesAI.setChargeOnReagentAtom(index)
    }

    substituteHalideForAmineReverse(index) {
        const substitutionAI = new SubstitutionAI(this)
        return substitutionAI.substituteHalideForAmineReverse(index)
    }

    substituteOxygenCarbonDoubleBondForAmineReverse() {
        const substitutionAI = new SubstitutionAI(this)
        return substitutionAI.substituteOxygenCarbonDoubleBondForAmineReverse()
    }

    substituteOxygenCarbonDoubleBondForAmine() {
        const substitutionAI = new SubstitutionAI(this)
        return substitutionAI.substituteOxygenCarbonDoubleBondForAmine()
    }

    substituteHalideForAmine(index) {
        const substitutionAI = new SubstitutionAI(this)
        return substitutionAI.substituteHalideForAmine(index)
    }


    breakCarbonOxygenDoubleBondReverse() {
        const bondsAI = new BondsAI(this)
        return bondsAI.breakCarbonOxygenDoubleBondReverse()
    }

    __changeDoubleBondToSingleBond(nucleophile_index, electrophile_index) {


        const shared_electrons = Set().intersection(this.container_substrate[0][1][nucleophile_index], this.container_substrate[0][1][electrophile_index]).slice(2)
        this.container_substrate[0][1][electrophile_index] = Set().removeFromArray( this.container_substrate[0][1][electrophile_index], shared_electrons)

        // Charges
        this.container_substrate[0][1][nucleophile_index][4] = this.container_substrate[0][1][nucleophile_index][4] === "+"? "":"-"
        this.container_substrate[0][1][electrophile_index][4] = this.container_substrate[0][1][electrophile_index][4] === "-"? "":"+"


        this.setMoleculeAI()
    }

    makeNitrogenCarbonTripleBond() {
        const bondsAI = new BondsAI(this)
        return bondsAI.makeNitrogenCarbonTripleBond()
    }


    oxygenCarbonDoubleBond() {
        const bondsAI = new BondsAI(this)
        return bondsAI.makeOxygenCarbonDoubleBond()
    }

    makeNitrogenCarbonDoubleBond() {
        const bondsAI = new BondsAI(this)
        return bondsAI.makeNitrogenCarbonDoubleBond()
    }


    reduceImineToAmine() {
        let n_atom = null
        // Look for =N
        const n_index = _.findIndex(this.container_substrate[0][1], (atom, index)=>{
            if (atom[0] !== "N") {
                return false
            }
            n_atom = CAtom(this.container_substrate[0][1][index], index, this.container_substrate)
            return n_atom.doubleBondCount() === 1
        })
        if (n_index === -1) {
            return false
        }
        // Remove double bond
        const c_n_bonds = n_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C" && bond.bond_type === "="
        })
        // Replace one of the NC bonds with hydrogen
        const shared_electrons = c_n_bonds[0].shared_electrons
        _.remove(this.container_substrate[0][1][c_n_bonds[0].atom_index], (electron, index)=>{
            return electron === shared_electrons[0] || electron === shared_electrons[1]
        })
        const proton = AtomFactory("H","")
        proton.pop()
        proton.push(shared_electrons[0])
        proton.push(shared_electrons[1])
        this.container_substrate[0][1].push(proton)
        this.setChargesOnSubstrate()
        //console.log(VMolecule(this.container_substrate).compressed())
        //console.log(fgggg)
        return true
    }

    reduceImineToAmineOnNitrogenMethylCarbonReverse(check_mode) {
        /*
       Sodium cyanoborohydride (NaBH3CN) is a mild reducing agent that is commonly used in reductive aminations. The presence of the electron-withdrawing cyano (CN) group makes it less reactive
       than sodium borohydride (NaBH4). This reduced reactivity allows NaBH3CN to be employed at neutral or slightly acidic conditions for the selective reduction of iminium ions in the presence of ketones and aldehydes.
        */

        let n_atom = null
        let c_atom = null
        let c_index = null

        // Look for N attached to methyl carbon
        const n_index = _.findIndex(this.container_substrate[0][1], (atom, index)=>{
            if (atom[0] !== "N") {
                return false
            }

            if (atom[4] === "+" || atom[4] === "-") {
                return false
            }

            n_atom = CAtom(this.container_substrate[0][1][index], index, this.container_substrate)
            if (n_atom.doubleBondCount() !== 0) {
                return false
            }

            const c_n_carbon_methyl_bonds = n_atom.indexedBonds("").filter((bond)=>{
                if (bond.atom[0]!=="C") {
                    return false
                }
                c_index = bond.atom_index
                c_atom = CAtom(this.container_substrate[0][1][bond.atom_index], bond.atom_index, this.container_substrate)
                return c_atom.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === "H"
                }).length ===3
            })
            return c_n_carbon_methyl_bonds.length > 0

        })


        if (n_index === -1) {
            return false
        }

       //xs console.log('Reaction.js ' + n_index)
        return this.__reduceImineToAmineReverse(check_mode, n_atom, c_atom, n_index, c_index)
    }

    reduceImineToAmineReverse(check_mode) {


        /*
        Sodium cyanoborohydride (NaBH3CN) is a mild reducing agent that is commonly used in reductive aminations. The presence of the electron-withdrawing cyano (CN) group makes it less reactive
        than sodium borohydride (NaBH4). This reduced reactivity allows NaBH3CN to be employed at neutral or slightly acidic conditions for the selective reduction of iminium ions in the presence of ketones and aldehydes.
         */

        let n_atom = null
        // Look for N
        const n_index = _.findIndex(this.container_substrate[0][1], (atom, index)=>{
            if (atom[0] !== "N") {
                return false
            }
            if (atom[4] === "+" || atom[4] === "-") {
                return false
            }
            n_atom = CAtom(this.container_substrate[0][1][index], index, this.container_substrate)
            return n_atom.doubleBondCount() === 0
        })

        if (n_index === -1) {
            return false
        }

        const c_n_carbon_bonds = n_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        })
        const carbon = CAtom(this.container_substrate[0][1][c_n_carbon_bonds[0].atom_index], c_n_carbon_bonds[0].atom_index, this.container_substrate)

        return this.__reduceImineToAmineReverse(check_mode, n_atom, carbon, n_index, c_n_carbon_bonds[0].atom_index)

    }

    __reduceImineToAmineReverse(check_mode, n_atom, carbon, n_index, c_index) {

        if (!this.CommandLogic.check('reduceImineToAmineReverse')) {
            return false
        }

        const substrate = _.cloneDeep(this.container_substrate)
        /*
        Sodium cyanoborohydride (NaBH3CN) is a mild reducing agent that is commonly used in reductive aminations. The presence of the electron-withdrawing cyano (CN) group makes it less reactive
        than sodium borohydride (NaBH4). This reduced reactivity allows NaBH3CN to be employed at neutral or slightly acidic conditions for the selective reduction of iminium ions in the presence of ketones and aldehydes.
         */

        // Add double bond

        const h_n_hydrogen_bonds = n_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        })
        const h_c_hydrogen_bonds = carbon.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        })

        // Check that there is at least on H-N bond that we can remove
        if (h_n_hydrogen_bonds.length === 0) {
            return false
        }

        // Check that there is at least on H-C on the C-N carbon that we can remove
        if (h_c_hydrogen_bonds.length === 0) {
            return false
        }

        const electrons_to_share = n_atom.freeElectrons()
        if (electrons_to_share.length === 0) {
            return false
        }

        if (check_mode) {
            return true
        }

        // Remove the H-N bond
        // Remove the H-C bond
        const h_c_shared_electrons = h_c_hydrogen_bonds[0].shared_electrons
        _.remove(this.container_substrate[0][1][c_index], (electron, index)=>{
            return electron === h_c_shared_electrons[0] || electron === h_c_shared_electrons[1]
        })
        // Check that the C now has a free electron pair
        carbon.freeSlots().should.be.greaterThan(0)

        // Add another bond to C-N bond
        //const shared_electrons = [uniqid(), uniqid()]
        this.container_substrate[0][1][c_index].push(electrons_to_share[0])
        this.container_substrate[0][1][c_index].push(electrons_to_share[1])

        // Remove H-C hydrogen
        this.container_substrate[0][1] = Set().removeFromArray(this.container_substrate[0][1], this.container_substrate[0][1][h_c_hydrogen_bonds[0].atom_index])

        n_atom.doubleBondCount().should.be.greaterThan(0)

        this.setChargesOnSubstrate()
        this.setMoleculeAI()

        //console.log(VMolecule(this.container_substrate).compressed())
        //console.log(reductimeinetoaminereverse)
        // Nitrogen atom should have positive charge (4 bonds)


        return true
    }

    remercurify() {

        // @see https://www.chemistrysteps.com/oxymercuration-demercuration/
        // Find index of -OH oxygen atom
        const hydroxyl_oxygen_index = this.MoleculeAI.findHydroxylOxygenIndex()
           // console.log('hydroxyl oxygen index=' + hydroxyl_oxygen_index)
        if (hydroxyl_oxygen_index === -1) {
            return false
        }
        const hyroxyl_oxygen_object = CAtom(this.container_substrate[0][1][hydroxyl_oxygen_index], hydroxyl_oxygen_index, this.container_substrate)

        // Get index of attached carbon
        const carbon_index = hyroxyl_oxygen_object.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        }).pop().atom_index
      //     // console.log('carbon index=' + carbon_index)
        const carbon_object = CAtom(this.container_substrate[0][1][carbon_index], carbon_index, this.container_substrate)

        // Find index of terminal carbon
        let terminal_carbon_object = null
        let terminal_carbon_object_hydrogen_bonds = null
        const terminal_carbon_index = carbon_object.indexedBonds("").filter((bond)=>{

            if (bond.atom[0]!=="C") {
                return false
            }

            terminal_carbon_object = CAtom(bond.atom, bond.atom_index, this.container_substrate)

            // Check terminal_carbon_object has three hydrogens
            terminal_carbon_object_hydrogen_bonds = terminal_carbon_object.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "H"
            })
            return terminal_carbon_object_hydrogen_bonds.length === 3

        }).pop().atom_index

     //      // console.log('terminal carbon index=' + terminal_carbon_index)


        // Replace hydrogen on terminal carbon with mercuriacetate
        const mercuriacetate = MoleculeFactory("[Hg+](O[Ac])")

        const mercury_atom_index = 0

        const mercury_atom_object = CAtom(mercuriacetate[1][mercury_atom_index], mercury_atom_index, [mercuriacetate,1])
        //const mercury_atom_free_electrons = mercury_atom_object.freeSlots()

        // Pop a hydrogen
        const shared_electrons = _.cloneDeep(terminal_carbon_object_hydrogen_bonds[0]).shared_electrons
        _.remove(this.container_substrate[0][1], (v,i)=>{
            return i === terminal_carbon_object_hydrogen_bonds[0].atom_index
        })

      //     // console.log(shared_electrons)
        // Add mercuriacetate to substrate
        mercuriacetate[1][0].push(shared_electrons[0])
        mercuriacetate[1][0].push(shared_electrons[1])
        mercuriacetate[1][0][4] = ""

        this.container_substrate[0][1].push(mercuriacetate[1][0])
        this.container_substrate[0][1].push(mercuriacetate[1][1])
        this.container_substrate[0][1].push(mercuriacetate[1][2])

        this.setMoleculeAI()


    }


    demercurify() {

        // @see https://www.chemistrysteps.com/oxymercuration-demercuration/
        // Replace Hg atom with hydrogen using sodium borohydride as reduction agent.
        const mercury_atom_index = _.findIndex(_.cloneDeep(this.container_substrate[0][1]), (atom)=>{
            return atom[0] === "Hg"
        })

        if (mercury_atom_index === -1) {
            return false
        }

        const mercury_atom = CAtom(this.container_substrate[0][1][mercury_atom_index], mercury_atom_index, this.container_substrate)

        // We should just have one carbon bond
        const carbon_bond = mercury_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        }).pop()

        if (undefined === carbon_bond) {
            return false
        }

        const shared_electrons = carbon_bond.shared_electrons


        // Remove mercury atom
        _.remove(this.container_substrate[0][1], (v, i)=>{
                return i === mercury_atom_index
            }
        )

        // Add proton
        const proton = AtomFactory("H")
        proton.pop()
        proton.push(shared_electrons[0])
        proton.push(shared_electrons[1])
        this.container_substrate[0][1].push(proton)
        this.setMoleculeAI()

    }



    transferProtonReverse(check_mode) {

        this.setChargesOnSubstrate()
        this.setMoleculeAI('transferprotonreverse')

        const nucleophile_index = _.findIndex(this.container_substrate[0][1], (atom, index)=>{
            if (atom[0] !== 'N') {
                return false
            }
            if (atom[4] === '+') {
                return false
            }
            if (atom[4] === '-') {
                return false
            }
            const n = CAtom(this.container_substrate[0][1][index], index, this.container_substrate)
            if (n.indexedBonds("").length === 4) {
                return false
            }
            const c_b = n.indexedDoubleBonds("").filter((bond)=>{
                return bond.atom[0] === "C"
            })
            return c_b.length === 0
        })



        if (nucleophile_index === -1) {
            return false
        }


        // Get index of OH
        let electrophile_index = this.MoleculeAI.findHydroxylOxygenIndex()


        if (electrophile_index === -1) {
            return false
        }

        // Get proton from electrophile
        const electrophile_atom_object = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)
        const proton_bond = electrophile_atom_object.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === 'H'
        }).pop()

        if (proton_bond === undefined) {
            return false
        }


        // Remove electrons from electrophile atom
        const shared_electrons = proton_bond.shared_electrons

        if (shared_electrons.length === 0) {
            return false
        }


        // We're only testing to see if the function will return true
        if (check_mode) {
            return true
        }

        _.remove(this.container_substrate[0][1][electrophile_index], (v, i)=> {
            return shared_electrons[1] === v || shared_electrons[0] === v
        })


        // We do this so that atom is negatively charged
        range.range(0, shared_electrons.length, 1).map((i)=>{
            this.container_substrate[0][1][electrophile_index].push(uniqid())
        })


        const nucleophile_atom_object = CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate)
        const nucleophile_free_electrons = nucleophile_atom_object.freeElectrons()


        this.container_substrate[0][1][nucleophile_index] = Set().removeFromArray(this.container_substrate[0][1][nucleophile_index], nucleophile_free_electrons)
        this.container_substrate[0][1][nucleophile_index].push(shared_electrons[0])
        this.container_substrate[0][1][nucleophile_index].push(shared_electrons[1])


        this.setChargesOnSubstrate()
        this.setMoleculeAI('transferprotonreverse')

        this.setChargesOnSubstrate()


        this.setMoleculeAI('transferprotonreverse')

        return true

    }


    transferProton() {

        // console.log("Reaction.js transferProton()")
        // console.log(VMolecule(this.container_substrate).compressed())

        // Get nucleophile  - this is the atom that is getting the proton
        const nucleophile_index = this.MoleculeAI.findNucleophileIndex() // eg [O-]
        //// console.log(nucleophile_index)
        //// console.log(kkk)
        if (nucleophile_index == -1) {
            return false
        }

        // Get electrophile - this is the atom we are getting the proton from
        const electrophile_index = this.MoleculeAI.findElectrophileIndex()
        // console.log('transferProton() electrophile_index index: ' + electrophile_index)
        // console.log(jnc)
        if (electrophile_index === -1) {
            return false
        }

        // Get proton from electrophile
        const electrophile_atom_object = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)
        const proton_bond = electrophile_atom_object.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === 'H'
        }).pop()

        // Remove electrons from proton
        const shared_electrons = proton_bond.shared_electrons
        this.container_substrate[0][1][proton_bond.atom_index] = Set().removeFromArray(
            this.container_substrate[0][1][proton_bond.atom_index],
            shared_electrons
        )

        // Add proton to nucleophile (eg [O-]
        const nucleophile_atom_object = CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate)
        const n_free_electrons = nucleophile_atom_object.freeElectrons()

        if (n_free_electrons.length === 0) {
            return false
        }

        // Bond proton to nucleophile
        this.container_substrate[0][1][proton_bond.atom_index].push(n_free_electrons[0])
        this.container_substrate[0][1][proton_bond.atom_index].push(n_free_electrons[1])
        this.setChargeOnSubstrateAtom(nucleophile_index)
        this.setChargeOnSubstrateAtom(electrophile_index)

        this.setMoleculeAI()
    }

    dereduce() {
        return false
    }

    reduce() {
        return false
    }

    hydrateMostSubstitutedCarbon() {
        const electrophile_index = this.MoleculeAI.findMostSubstitutedCarbonIndex()
        this.hydrate(electrophile_index)
        this.container_substrate[0][1][electrophile_index][4] = "+"
        this.setMoleculeAI()
    }

    hydrate(electrophile_index) {
        const hydrationAI = new HydrationAI(this)
        return hydrationAI.hydrate(electrophile_index)
    }

    dehydrate(check_mode) {
        const hydrationAI = new HydrationAI(this)
        return hydrationAI.dehydrate(check_mode)
    }

    dehydrateReverse() {
        const hydrationAI = new HydrationAI(this)
        return hydrationAI.dehydrateReverse()
    }

    __removeGroup(nucleophile_index, electrophile_index, moleculeAI, substrate) {

        const shared_electrons = Set().intersection(substrate[0][1][nucleophile_index].slice(5), substrate[0][1][electrophile_index].slice(5))
        const electrons = _.cloneDeep(substrate[0][1][nucleophile_index]).slice(5)
        _.remove(substrate[0][1][nucleophile_index], (v, i) => {
            return shared_electrons[0] === v || shared_electrons[1] === v
        })

        substrate[0][1][nucleophile_index][4] = substrate[0][1][nucleophile_index][4] === "-"?"":"+"
        substrate[0][1][electrophile_index][4] = substrate[0][1][electrophile_index][4] === "+"?"":"-"

        this.setMoleculeAI()
        this.setReagentAI()

        const groups = moleculeAI.extractGroups()


        return groups

        /*
        if (groups.length > 1) {
            substrate = [[-1, _.cloneDeep(groups[0])], 1]
            this.setMoleculeAI()
            this.setReagentAI()
            groups.shift()
            this.leaving_groups = groups.map((group)=>{
                return [[-1, group], 1]
            })
        }
        */
    }
    removeMethanol() {

        const nucleophile_index = this.MoleculeAI.findNucleophileIndex()

        // Find index of oxygen atom attached to two carbons where one of the carbons is a terminal carbon
        const nucleophile_atom_object = CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate)
        const bonds = nucleophile_atom_object.indexedBonds("").filter((bond)=>{
            if (bond.atom[0] !== "O") {
                return false
            }
            const oxygen_atom_object = CAtom(bond.atom, bond.atom_index, this.container_substrate)
            const c_bonds = oxygen_atom_object.indexedBonds("").filter((bond)=>{
                if (bond.atom[0] !=='C') {
                    return false
                }
                const c_a = CAtom(bond.atom, bond.atom_index, this.container_substrate)
                // Look for terminal carbon
                const c_a_b = c_a.indexedBonds("").filter((bond)=> {
                    return bond.atom[0] !== 'H'
                })
                return c_a_b.length === 1
            })
            return c_bonds.length > 0
        })

        const electrophile_index = bonds[0].atom_index

        const groups = this.__removeGroup(nucleophile_index, electrophile_index, this.MoleculeAI, this.container_substrate)
        this.__setSubstrateGroups(groups)

    }

    removeFormamideGroup() {

     //      // console.log("removeFormamideGroup")
        const nitrogen_index = this.MoleculeAI.findNitrogenAttachedToCarbonAttachedToOxygenDoubleBondIndex()
        const nitrogen_atom = CAtom(this.container_substrate[0][1][nitrogen_index], nitrogen_index, this.container_substrate)
        const nitrogen_atom_carbon_bonds = nitrogen_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] ===  "C"
        })

        const formide_carbon_index = nitrogen_atom_carbon_bonds.filter((bond)=>{
            const c_atom = CAtom(this.container_substrate[0][1][bond.atom_index], bond.atom_index, this.container_substrate)
            const d_bonds = c_atom.indexedDoubleBonds("").filter((bond)=>{
                return bond.atom[0] === "O"
            })
            if (d_bonds.length !== 1) {
                return false
            }
            const h_bonds = c_atom.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "H"
            })
            if (h_bonds.length !== 1) {
                return false
            }
            return true
        }).pop().atom_index



        if (formide_carbon_index === undefined) {
            return false
        }

        const carbon_index = nitrogen_atom_carbon_bonds.filter((bond)=>{
            return bond.atom[0] === "C" && bond.atom_index !== formide_carbon_index
        }).pop().atom_index


        if (carbon_index === undefined) {
            return false
        }

        const groups = this.__removeGroup(carbon_index, nitrogen_index, this.MoleculeAI, this.container_substrate)
        this.__setSubstrateGroups(groups) // sets substrate and leaving groups


    }


    removeFormateGroup() {
        const formate_double_bond_oxygen_index = this.MoleculeAI.findOxygenOnDoubleBondIndex()
        //   // console.log(VMolecule(this.container_substrate).compressed())
        //   // console.log(formate_double_bond_oxygen_index)

        const formate_double_bond_oxygen_atom_object = CAtom(this.container_substrate[0][1][formate_double_bond_oxygen_index], formate_double_bond_oxygen_index, this.container_substrate)
        const carbon_atom_on_formate_double_bond_oxygen_index = formate_double_bond_oxygen_atom_object.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        }).pop().atom_index

        const carbon_atom_on_formate_double_bond_oxygen_atom_object = CAtom(this.container_substrate[0][1][carbon_atom_on_formate_double_bond_oxygen_index], carbon_atom_on_formate_double_bond_oxygen_index, this.container_substrate)

        const electrophile_index = carbon_atom_on_formate_double_bond_oxygen_atom_object.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "O" && bond.atom_index !== formate_double_bond_oxygen_index
        }).pop().atom_index

        const electrophile_atom_object = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)

        const nucleophile_index = electrophile_atom_object.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C" && bond.atom_index !== carbon_atom_on_formate_double_bond_oxygen_index
        }).pop().atom_index

//           // console.log(carbon_atom_on_formate_double_bond_oxygen_index)

  //         // console.log(electrophile_index)
    //       // console.log(nucleophile_index)
        const groups = this.__removeGroup(nucleophile_index, electrophile_index, this.MoleculeAI, this.container_substrate)
        this.__setSubstrateGroups(groups) // sets substrate and leaving groups

      //     // console.log(VMolecule(this.container_substrate).compressed())


    }

    __removeHydroxylGroup(moleculeAI, substrate) {
        const electrophile_index = moleculeAI.findHydroxylOxygenIndex()
        const nucleophile_index = moleculeAI.findIndexOfCarbonAtomAttachedToHydroxylGroup()
        const groups = this.__removeGroup(nucleophile_index, electrophile_index, moleculeAI, substrate)
        return groups

    }

    __setSubstrateGroups(groups){
        if (groups.length > 1) {
            this.container_substrate = [[-1, _.cloneDeep(groups[0])], 1]
            groups.shift()
            this.leaving_groups = groups.map((group)=>{
                return [[-1, group], 1]
            })
        }
    }

    setSubstrateGroupsReverse(groups){
        if (groups.length > 1) {
            this.container_substrate = [[-1, _.cloneDeep(groups[0])], 1]
            groups.shift()
            this.leaving_groups = groups.map((group)=>{
                return [[-1, group], 1]
            })
        }
    }

    removeHydroxylGroup() {
        const groups = this.__removeHydroxylGroup(this.MoleculeAI, this.container_substrate, this.setMoleculeAI)
        this.__setSubstrateGroups(groups)
    }

    bondSubstrateToReagentReverse() {
        // Important (orginal reaction):
        // The reagent is the nucleophile and is attacking the substrate
        // The substrate is the electrophile
        const bondsAI = new BondsAI(this)
        return bondsAI.bondSubstrateToReagentReverse()

    }


    breakBond(break_type="heterolysis") {

        // Look for overloaded atoms
        const overloaded_atoms = this.MoleculeAI.findOverloadedAtoms()

        let nucleophile_index = null
        let electrophile_index = null
        let nucleophile_atom_object = null
        let electrophile_atom_object = null


        if (overloaded_atoms.length > 0) {

            // For now just get the first atom
            // @todo
            electrophile_index = overloaded_atoms[0].atomIndex
            //   // console.log('overloaded_atoms:')
            //   // console.log(overloaded_atoms)
            const electrophile_bonds =  overloaded_atoms[0].indexedBonds("").filter((bond)=>{
                return bond.atom[0] !== "H"
            })

            // Do we have just carbons and hyrogens? If yes then get the most substituted carbon
            if (electrophile_bonds.filter((bond)=>{
                return bond.atom[0] !== 'C' && bond.atom[0] !== 'H'
            }).length ===0) {
                const carbons = electrophile_bonds.filter((bond)=> {
                    return bond.atom[0] === "C"
                }).map((bond)=>{
                    return CAtom(this.container_substrate[0][1][bond.atom_index], bond.atom_index, this.container_substrate)
                })
                nucleophile_index = this.MoleculeAI.findMostSubstitutedCarbon(carbons).atomIndex
            } else {
                const bonds_sorted =_.cloneDeep(electrophile_bonds).sort((a, b) => {
                    return a.atom[0] === "O" ? -1 : 0
                })
                nucleophile_index = bonds_sorted[0].atom_index
            }



        } else {

            // No overloaded atoms
               // console.log('No overloaded atoms')
            electrophile_index = this.MoleculeAI.findElectrophileIndex()
            //   // console.log('electrophile_index:' + electrophile_index)

            if (electrophile_index === -1) {
                nucleophile_index = this.MoleculeAI.findNucleophileIndex()
                   // console.log('nucleophile index:')
//                   // console.log(nucleophile_index)
                if (nucleophile_index === -1) {
                       // console.log("Electrophile not found")
                       // console.log("breakBond()")
                    return false
                } else {
                    nucleophile_atom_object = CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate)
                    const bonds_to_nucleophile = nucleophile_atom_object.indexedBonds("").filter((bond)=>{
                        return bond.atom[0] !== "H"
                    })
                    if (bonds_to_nucleophile.length ===0) {
                        return false
                    }
                    // Look for oxygen bonds
                    const oxygen_bonds = bonds_to_nucleophile.filter((bond)=>{
                        return bond.atom[0] === "O"
                    })
                    if (oxygen_bonds.length > 0) {
                        // Sort by most substituted oxygen
                        const oxygens_sorted = oxygen_bonds.map((oxygen_bond) => {
                            return CAtom(this.container_substrate[0][1][oxygen_bond.atom_index], oxygen_bond.atom_index, this.container_substrate)
                        }).sort(
                            (a, b) => {
                                return a.hydrogens().length + a.doubleBondCount() < b.hydrogens().length + b.doubleBondCount() ? -1 : 0
                            }
                        )

                        // Filter out oxygens with double bonds
                        // iOS change
                        const oxygens_sorted_no_double_bonds = oxygens_sorted.filter((o)=>{
                            return o.indexedDoubleBonds("").length ===0
                        })
                        electrophile_index = oxygens_sorted_no_double_bonds[0].atomIndex

                    } else {
                        electrophile_index = bonds_to_nucleophile[0].atom_index
                    }

                }
            }

            const electrophile_atom_object = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)
            const electrophile_atom_object_bonds = electrophile_atom_object.indexedBonds("").filter(
                (bond) => {
                    return bond.atom[0] !== "H"
                }
            )

            if (electrophile_atom_object_bonds.length === 1 && nucleophile_index === null) {
                nucleophile_index = electrophile_atom_object_bonds[0].atom_index
            }
            const carbon_bonds = electrophile_atom_object_bonds.filter((bond) => {
                return bond.atom[0] === "C"
            })
            if (carbon_bonds.length !== electrophile_atom_object_bonds.length) {
                // @todo
            } else if (nucleophile_index === null) {
                // Get the most substituted carbon
                // @todo replace with this.MoleculeAI.findMostSubstitutedCarbon(carbons)
                carbon_bonds.sort((bond_a, bond_b) => {
                    const a_atom = CAtom(this.container_substrate[0][1][bond_a.atom_index], bond_a.atom_index, this.container_substrate)
                    const b_atom = CAtom(this.container_substrate[0][1][bond_b.atom_index], bond_b.atom_index, this.container_substrate)
                    const a_hydrogens = a_atom.indexedBonds("").filter(
                        (bond) => {
                            return bond.atom[0] === "H"
                        }
                    )
                    const b_hydrogens = b_atom.indexedBonds("").filter(
                        (bond) => {
                            return bond.atom[0] === "H"
                        }
                    )
                    return a_hydrogens.length < b_hydrogens.length ? -1 : 0
                })
                nucleophile_index = carbon_bonds[0].atom_index
            }


            if (nucleophile_index === -1) {
                   // console.log("Nucleophile not found")
                   // console.log("breakBond()")
                return false
            }



        }

        if (nucleophile_index === null || nucleophile_index === -1) {
            return false
        }

        if (electrophile_index === null || electrophile_index === -1 || this.container_substrate[0][1][electrophile_index][4] === "" || this.container_substrate[0][1][electrophile_index][4]=== 0) {
            return false
        }

           // console.log(VMolecule(this.container_substrate).compressed())
          // console.log('breakBond() nucleophile_index: ' + nucleophile_index)
          // console.log('breakBond() electrophile_index: ' + electrophile_index)


        const source_atom = CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate)
        const target_atom = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)

        // Use dehydrate() instead
        if (target_atom.symbol === "O" && target_atom.hydrogens().length ===2 && this.container_substrate[0][1][electrophile_index][4] === "+") {
            return false
        }


        const shared_electrons = Set().intersection(_.cloneDeep(this.container_substrate[0][1][nucleophile_index].slice(5)), _.cloneDeep(this.container_substrate[0][1][electrophile_index].slice(5)))

        /*
        https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(Smith)/Chapter_06%3A_Understanding_Organic_Reactions/6.03_Bond_Breaking_and_Bond_Making
        If a covalent single bond is broken so that one electron of the shared pair remains with each fragment, as in the first example, this bond-breaking is called homolysis. If the bond breaks with both electrons of the shared pair remaining with one fragment,  this is called heterolysis.
         */
            // console.log("Break type=" + break_type)
            // console.log(this.container_substrate[0][1][electrophile_index][4])
            // console.log("Reaction.js")
        if (break_type === "heterolysis") {

            //   // console.log(_.cloneDeep(this.container_substrate[0][1][nucleophile_index]).slice(0,5))
            //   // console.log(_.cloneDeep(this.container_substrate[0][1][electrophile_index]).slice(0,5))


            //   // console.log("Shared electrons:")
            //   // console.log(shared_electrons)

            // Remove shared electrons from nucleophile
            //   // console.log('Removing electrons:')
            const electrons = _.cloneDeep(this.container_substrate[0][1][nucleophile_index]).slice(5)
               // console.log(this.container_substrate[0][1][nucleophile_index])
            /*
            _.remove(this.container_substrate[0][1][nucleophile_index], (v, i) => {
              //     // console.log(v + ' ' + shared_electrons[0] + ' ' + shared_electrons[1])
                if (shared_electrons[0] === v || shared_electrons[1] === v) {
                       // console.log('Removed electron ' + v)
                }
                return shared_electrons[0] === v || shared_electrons[1] === v
            })
            */
            this.container_substrate[0][1][nucleophile_index] = Set().removeFromArray(this.container_substrate[0][1][nucleophile_index], shared_electrons)
            //   // console.log(this.container_substrate[0][1][nucleophile_index])
            this.container_substrate[0][1][nucleophile_index].slice(5).length.should.not.be.equal(electrons.length)

            // nucleophile should now be positively charged
            // electrophile should be negatively charged
            if (this.container_substrate[0][1][nucleophile_index][4] === "-") {
                this.container_substrate[0][1][nucleophile_index][4] = ""
            } else {
                this.container_substrate[0][1][nucleophile_index][4] = "+"
            }

            if (this.container_substrate[0][1][electrophile_index][4] === "+") {
                this.container_substrate[0][1][electrophile_index][4] = ""
            } else {
                this.container_substrate[0][1][electrophile_index][4] = "-"
            }


            Set().intersection(_.cloneDeep(this.container_substrate[0][1][nucleophile_index].slice(5)), _.cloneDeep(this.container_substrate[0][1][electrophile_index].slice(5))).length.should.be.equal(0)


        } else {
            // Remove electron from source atom
            _.remove(this.container_substrate[0][1][nucleophile_index], (v, i) => {
                return shared_electrons[0] === v
            })

            // Remove electron from target atom
            _.remove(this.container_substrate[0][1][electrophile_index], (v, i) => {
                return shared_electrons[1] === v
            })

        }


      //     // console.log('nucleophile index: ' +nucleophile_index)
      //     // console.log('electrophile index: ' +electrophile_index)


        const groups = this.MoleculeAI.extractGroups()


        this.__setSubstrateGroups(groups)

        return true



    }

    bondMetal() {

        const metal_atom_index = this.MoleculeAI.findMetalAtomIndex()


        if (metal_atom_index === -1) {
               // console.log("bondMetal() no metal atom found (1)")
            return false
        }


        if (undefined === this.container_reagent) {

            const electrophile_index = this.MoleculeAI.findElectrophileIndex()


            if (electrophile_index === -1) {
                   // console.log("bondAtoms() no electrophile found (1)")
                return false
            }


            let electrophile_free_slots = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate).freeSlots()

               // console.log(electrophile_index)

            if (electrophile_free_slots > 0) {

                let metal_atom_free_electrons = CAtom(this.container_substrate[0][1][metal_atom_index], electrophile_index, this.container_substrate).freeElectrons()

                this.container_substrate[0][1][electrophile_index].push(metal_atom_free_electrons[0])
                this.container_substrate[0][1][electrophile_index].push(metal_atom_free_electrons[1])
            }


        } else {

            // Reagent
            const electrophile_index = this.ReagentAI.findElectrophileIndex()
            if (electrophile_index === -1) {
                   // console.log("bondMetalAtoms() no nucleophile found (2)")
                return false
            }

            let electrophile_free_slots = CAtom(this.container_reagent[0][1][electrophile_index], electrophile_index, this.container_reagent).freeSlots()

            if (electrophile_free_slots > 0) {

                let metal_atom_free_electrons = CAtom(this.container_substrate[0][1][metal_atom_index], electrophile_index, this.container_substrate).freeElectrons()

                this.container_reagent[0][1][electrophile_index].push(metal_atom_free_electrons[0])
                this.container_reagent[0][1][electrophile_index].push(metal_atom_free_electrons[1])

                this.container_reagent[0][1].map(
                    (atom) => {
                        this.container_substrate[0][1].push(atom)
                        return atom
                    }
                )
            }


        }


        this.setMoleculeAI()
        this.setReagentAI()


    }

    removeProtonFromOxygenReverse() {
        const protationAI = new ProtonationAI(this)
        return protationAI.removeProtonFromOxygenReverse()
    }

    removeProtonFromOxygen() {
        const protationAI = new ProtonationAI(this)
        return protationAI.removeProtonFromOxygen()
    }

    deprotonateOxygenOnDoubleBond() {
        const protationAI = new ProtonationAI(this)
        return protationAI.deprotonateOxygenOnDoubleBond()
    }

    protonateCarbocation() {
        const protationAI = new ProtonationAI(this)
        return protationAI.protonateCarbocation()
    }

    protonateCarbocationReverse() {
        const protationAI = new ProtonationAI(this)
        return protationAI.protonateCarbocationReverse()
    }

    protonateOxygenOnDoubleBond() {
        const protationAI = new ProtonationAI(this)
        return protationAI.protonateOxygenOnDoubleBond()
    }

    removeMetal() {
        // Get index of metal atom
        const metal_atom_index = this.MoleculeAI.findMetalAtomIndex()

        if (metal_atom_index === -1) {
               // console.log("removeBond() no metal atom")
            return false
        }

        const metal_atom = CAtom(this.container_substrate[0][1][metal_atom_index], metal_atom_index, this.container_substrate)

        metal_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        }).map((bond)=>{
            const shared_electrons = _.cloneDeep(bond.shared_electrons)
            shared_electrons.map((electron)=>{
                _.remove(this.container_substrate[0][1][metal_atom_index], (v, i) => {
                    return electron === v
                })
                return electron
            })

            // Check for C-C bond
            const c_atom = CAtom(this.container_substrate[0][1][bond.atom_index], bond.atom_index, this.container_substrate)
            const c_bonds = c_atom.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "C"
            })

            if (c_bonds.length ===1) {
                this.container_substrate[0][1][c_bonds[0].atom_index].push(shared_electrons[0])
                this.container_substrate[0][1][c_bonds[0].atom_index].push(shared_electrons[1])
            } else {
                this.container_substrate[0][1][bond.atom_index][4] = "-"
            }

            return bond
        })

        this.container_substrate[0][1][metal_atom_index][4] = "+"

        this.setMoleculeAI()
    }

    breakMetalBond() {


        // Get index of metal atom
        const metal_atom_index = this.MoleculeAI.findMetalAtomIndex()

        if (metal_atom_index === -1) {
               // console.log("breakMetalBond() no metal atom found (1)")
            return false
        }

        const metal_atom = CAtom(this.container_substrate[0][1][metal_atom_index], metal_atom_index, this.container_substrate)

        const electrophile_index = metal_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[4] === "&+" || bond.atom[4] === "+"
        }).pop().atom_index

        if (electrophile_index === undefined) {
               // console.log("breakMetalBond() can't find electrophile")
            return false
        }

        const source_atom = CAtom(this.container_substrate[0][1][metal_atom_index], metal_atom_index, this.container_substrate)
        const target_atom = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)

        const shared_electrons = Set().intersection(this.container_substrate[0][1][metal_atom_index].slice(5), this.container_substrate[0][1][electrophile_index].slice(5))

        // Remove shared electrons from metal atom
        const electrons = _.cloneDeep(this.container_substrate[0][1][metal_atom_index]).slice(5)
        _.remove(this.container_substrate[0][1][metal_atom_index], (v, i) => {
            return shared_electrons[0] === v || shared_electrons[1] === v
        })

        this.container_substrate[0][1][metal_atom_index].slice(5).length.should.not.be.equal(electrons.length)
        this.container_substrate[0][1][metal_atom_index][4] = ""
        this.container_substrate[0][1][electrophile_index][4] = ""

        Set().intersection(this.container_substrate[0][1][metal_atom_index].slice(5), this.container_substrate[0][1][electrophile_index].slice(5)).length.should.be.equal(0)


        this.setMoleculeAI()

    }

    bondReagentToSubstrate() {

        // Important:
        // The substrate is the nucleophile and is attacking the reagent
        // The reagent is the electrophile
        let electrophile_index = this.ReagentAI.findElectrophileIndex()

        if (electrophile_index === -1) {
            electrophile_index = this.ReagentAI.findNonWaterOxygenIndex(true)
        }

        const nucleophile_index = this.MoleculeAI.findNucleophileIndex()

        const nucleophile = CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate)
        let freeElectrons = nucleophile.freeElectrons()
        if (freeElectrons.length === 0) {
            const freeSlots = nucleophile.freeSlots()
            if (freeSlots > 0) {
                // Workaround
                const uniqid = require('uniqid');
                freeElectrons.push(uniqid())
                freeElectrons.push(uniqid())
                this.container_substrate[0][1][nucleophile_index].push(freeElectrons[0])
                this.container_substrate[0][1][nucleophile_index].push(freeElectrons[1])
            }
        }
        this.container_reagent[0][1][electrophile_index].push(freeElectrons[0])
        this.container_reagent[0][1][electrophile_index].push(freeElectrons[1])

        // Charges
        this.container_reagent[0][1][electrophile_index][4] = "+"
        this.container_substrate[0][1][nucleophile_index][4] = ""

        // Add reagent atoms to substrate
        this.container_reagent[0][1].map(
            (atom)=>{
                this.container_substrate[0][1].push(atom)
                return atom
            }
        )


        this.setMoleculeAI()
        this.setReagentAI()
    }

    bondSubstrateToReagent(nucleophile_index = null, electrophile_index = null) {
        // Important:
        // The reagent is the nucleophile and is attacking the substrate
        // The substrate is the electrophile
        const bondsAI = new BondsAI(this)
        return bondsAI.bondSubstrateToReagent(nucleophile_index, electrophile_index)
    }

    removeHalide() {
        const bondsAI = new BondsAI(this)
        return bondsAI.removeHalide()
    }

    breakBondReverse() { // bond atoms
        //   // console.log('breakBondReverse()')
        let nucleophile_index = this.MoleculeAI.findNucleophileIndex()
        //   // console.log('nucleophile index:'+nucleophile_index)
        let electrophile_index = this.MoleculeAI.findElectrophileIndex()
        //   // console.log('electrophile index:' + electrophile_index)
        if (electrophile_index === -1) {
            // Check for epoxide ring
            if (this.container_substrate[0][1][nucleophile_index][0] === 'O') {
                const oxygen_atom_object = CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate)
                const bonds = oxygen_atom_object.indexedBonds("")
                    if (bonds.length === 1 && bonds[0].atom[0]==="C") {
                        const attached_carbon_object = CAtom(bonds[0].atom, bonds[0].atom_index, this.container_substrate)
                        const attached_carbon_object_carbon_bonds = attached_carbon_object.indexedBonds("").filter((bond)=>{
                            return bond.atom[0] === "C"
                        })
                        attached_carbon_object_carbon_bonds.map((bond)=>{
                            return bond
                        })
                        if (this.rule !== undefined && this.rule.mechanism === 'Epoxide ring opening via methoxide') {
                            // find carbon that is attached to OC group
                            electrophile_index = attached_carbon_object_carbon_bonds.filter((bond)=>{
                                const c = CAtom(bond.atom, bond.atom_index, this.container_substrate)
                                const b_o = c.indexedBonds("").filter((bond)=>{
                                    return bond.atom[0] === "O"
                                })
                                if (b_o.length === 0) {
                                    return false
                                }
            // @todo check if b_o atom has two carbon bonds with one of the carbon bonds being a terminal carbon
                                return true
                            }).pop().atom_index
                        } else {
                            // least substituted carbon
                            // @todo
                            electrophile_index = attached_carbon_object_carbon_bonds[0].atom_index

                        }
                    }
            }
        }

        let nucleophile_free_electrons = CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate).freeElectrons()

        this.container_substrate[0][1][electrophile_index].push(nucleophile_free_electrons[0])
        this.container_substrate[0][1][electrophile_index].push(nucleophile_free_electrons[1])

        this.container_substrate[0][1][nucleophile_index][4] = this.container_substrate[0][1][nucleophile_index][4] === "-"?0:"+"
        this.container_substrate[0][1][electrophile_index][4] = this.container_substrate[0][1][electrophile_index][4] === "+"?0:"-"

    }

    bondAtoms() {

        let electrophile_index = this.MoleculeAI.findElectrophileIndex()


        if (electrophile_index === -1) {
            electrophile_index = this.MoleculeAI.findNonWaterOxygenIndex(true)
        }

        if (electrophile_index === -1) {
               // console.log("bondAtoms() no electrophile found (1)")
            return false
        }

           // console.log('bondAtoms')
        //   // console.log('electrophile index:'+electrophile_index)



        if (undefined === this.container_reagent) {

            const nucleophile_index = this.MoleculeAI.findNucleophileIndex()

            if (nucleophile_index === -1) {
                   // console.log("bondAtoms() no nucleophile found (1)")
                return false
            }

            //  const electrophile_free_electrons = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate).freeElectrons()
            let nucleophile_free_electrons = CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate).freeElectrons()

            if (nucleophile_free_electrons.length < 2) {
                   // console.log("bondAtoms() nucleophile has no free electrons")
                const doubleBonds =  CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate).indexedDoubleBonds("")
                if (doubleBonds.length > 0) {
                    nucleophile_free_electrons = doubleBonds[0].shared_electrons
                    _.remove(this.container_substrate[0][1][doubleBonds[0].atom_index], (v)=>{
                        return v === doubleBonds[0].shared_electrons[0] || v === doubleBonds[0].shared_electrons[1]
                    })
                    // We give the opposite carbon a positive charge as it has lost electrons
                    this.container_substrate[0][1][doubleBonds[0].atom_index][4] = this.container_substrate[0][1][doubleBonds[0].atom_index][4] === "-"? "": "+"
                    // We give the nucleophile a - charge as it will gain and lose electrons
                    this.container_substrate[0][1][nucleophile_index][4] = this.container_substrate[0][1][nucleophile_index][4] === "+"? 0: "-"
                } else {
                    return false
                }
            }

            this.container_substrate[0][1][electrophile_index].push(nucleophile_free_electrons[0])
            this.container_substrate[0][1][electrophile_index].push(nucleophile_free_electrons[1])
            //this.container_substrate[0][1][electrophile_index][4] = 0

            /*
            _.remove(this.container_substrate[0][1][nucleophile_index], (electron)=>{
                return electron === nucleophile_free_electrons[0] || electron === nucleophile_free_electrons[1]
            })
            */

            this.container_substrate[0][1][nucleophile_index][4] = this.container_substrate[0][1][nucleophile_index][4] === "-"?0:"+"



        } else {

            // Reagent
            const nucleophile_index = this.ReagentAI.findNucleophileIndex()
            if (nucleophile_index === -1) {
                   // console.log("bondAtoms() no nucleophile found (2)")
                return false
            }

            let nucleophile_free_electrons = CAtom(this.container_reagent[0][1][nucleophile_index], nucleophile_index, this.container_reagent).freeElectrons()

            if (nucleophile_free_electrons.length < 2) {
                const doubleBonds =  CAtom(this.container_reagent[0][1][nucleophile_index], nucleophile_index, this.container_reagent).indexedDoubleBonds("")
                if (doubleBonds.length > 0) {
                    nucleophile_free_electrons = doubleBonds[0].shared_electrons
                    _.remove(this.container_reagent[0][1][doubleBonds[0].atom_index], (v)=>{
                        return v === doubleBonds[0].shared_electrons[0] || v === doubleBonds[0].shared_electrons[1]
                    })
                    // We give the opposite carbon a positive charge as it has lost electrons
                    this.container_reagent[0][1][doubleBonds[0].atom_index][4] = this.container_reagent[0][1][doubleBonds[0].atom_index][4] === "-"? "": "+"
                    // We give the nucleophile a - charge as it will gain and lose electrons
                    this.container_reagent[0][1][nucleophile_index][4] = this.container_reagent[0][1][nucleophile_index][4] === "+"? 0: "-"
                } else {
                    return false
                }
            }

            this.container_substrate[0][1][electrophile_index].push(nucleophile_free_electrons[0])
            this.container_substrate[0][1][electrophile_index].push(nucleophile_free_electrons[1])
            // this.container_substrate[0][1][electrophile_index][4] = this.container_substrate[0][1][electrophile_index][4]==="+"?0:"-"

            this.container_reagent[0][1].map(
                (atom)=>{
                    this.container_substrate[0][1].push(atom)
                    return atom
                }
            )

            // Nucleophile has lost electrons so we give it a positive charge
            // Hack for now
            // @todo
            if (this.container_reagent[0][1][nucleophile_index][0]!=="Hg") {
                this.container_reagent[0][1][nucleophile_index][4] =
                    this.container_reagent[0][1][nucleophile_index][4] === "-" ? "" : "+"
            }

        }


        // electrophile has lost electrons so we give it a negative charge
        // Hack for now
        // @todo
        if (this.container_substrate[0][1][electrophile_index][0]!=="Hg") {
            this.container_substrate[0][1][electrophile_index][4] =
                this.container_substrate[0][1][electrophile_index][4] === "+" ? "" : "-"
        }

        this.setMoleculeAI()
        this.setReagentAI()


    }

    addProtonToSubstrate(target_atom, target_atom_index) {
        const proton = AtomFactory("H")
        proton.pop()
        const free_electrons = CAtom(target_atom, target_atom_index, this.container_substrate).freeElectrons()
        if (free_electrons.length > 1) {
            proton.push(free_electrons[0])
            proton.push(free_electrons[1])
            this.container_substrate[0][1].push(proton)
            this.container_substrate[0][1][target_atom_index][4] =
                this.container_substrate[0][1][target_atom_index][4]=== "-"
                || this.container_substrate[0][1][target_atom_index][4] < 0? 0:"+"
        }
        this.setChargesOnSubstrate()
        this.setMoleculeAI(null, null, null, "addprotontosubstrate", uniqid())
    }

    protonateReverse() {
        const protationAI = new ProtonationAI(this)
        return protationAI.protonateReverse()
    }

    removeHalideReverse() {
        const bondsAI = new BondsAI(this)
        return bondsAI.removeHalideReverse()

    }

    deprotonateNitrogen(command_names, command_index) {
        const protationAI = new ProtonationAI(this)
        return protationAI.deprotonateNitrogen(command_names, command_index)
    }

    deprotonateNitrogenReverse() {
        const protationAI = new ProtonationAI(this)
        return protationAI.deprotonateNitrogenReverse()
    }


    removeProtonFromReagent(proton_index) {
        proton_index.should.be.greaterThan(-1)
        this.container_reagent[0][1].splice(proton_index, 1)
        this.setReagentAI()
    }

    removeProtonFromSubstrate(proton_index) {
        proton_index.should.be.greaterThan(-1)
        this.container_substrate[0][1].splice(proton_index, 1)
        this.setMoleculeAI()
    }


    protonate() {
        const protationAI = new ProtonationAI(this)
        return protationAI.protonate()
    }


    addProtonToReagent(index_of_reagent_atom_to_protonate ) {

        const atom_nucleophile_index = index_of_reagent_atom_to_protonate === undefined? this.ReagentAI.findNucleophileIndex() : index_of_reagent_atom_to_protonate

        if (atom_nucleophile_index  === -1) {
           return false
        }
        const reagent_atoms = _.cloneDeep(this.container_reagent[0][1])

        const proton = AtomFactory("H", 0)
        proton.pop()

        proton.length.should.be.equal(5)
        proton[0].should.be.equal('H')

        const free_electrons = CAtom(this.container_reagent[0][1][atom_nucleophile_index], atom_nucleophile_index, this.container_reagent).freeElectrons()

        if (free_electrons.length === 0) {
            return false
        }

        proton.push(free_electrons[0])
        proton.push(free_electrons[1])


        this.container_reagent[0][1][atom_nucleophile_index][4] =
            this.container_reagent[0][1][atom_nucleophile_index][4] === "-"
            || this.container_reagent[0][1][atom_nucleophile_index][4] < 0 ?0:"+"

        this.container_reagent[0][1].push(proton)

        this.container_reagent[0][1][atom_nucleophile_index][4] = 0

        this.container_reagent[0][1].length.should.not.equal(reagent_atoms.length)

        this.setReagentAI()

        return true

    }

    deprotonateNonHydroxylOxygen() {


        const oxygen_index = this.MoleculeAI.findNonWaterOxygenIndex()


        oxygen_index.should.not.be.equal(-1)

        if (oxygen_index === -1) {
            return false
        }

        this.container_substrate[0][1][oxygen_index][0].should.be.equal("O")

        this.container_substrate[0][1] = this.removeProtonFromAtom(this.MoleculeAI, this.container_substrate[0][1], oxygen_index)

        /*
        const oxygen_proton_bond = CAtom(this.container_substrate[0][1][oxygen_index],
            oxygen_index,
            this.container_substrate).indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        }).pop()

        this.container_substrate[0][1][oxygen_index][4] = 0
        this.container_substrate[0][1].splice(oxygen_proton_bond.atom_index, 1)
        // this.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)
        */

        this.addProtonToReagent()

        this.setMoleculeAI()
        this.setReagentAI()


    }

    deprotonateHydroxylOxygen() {


        const oxygen_index = this.MoleculeAI.findHydroxylOxygenIndex()

        if (oxygen_index === -1) {
            return false
        }

        this.container_substrate[0][1][oxygen_index][0].should.be.equal("O")

        this.container_substrate[0][1] = this.removeProtonFromAtom(this.MoleculeAI, this.container_substrate[0][1], oxygen_index)



        this.addProtonToReagent()

        this.setMoleculeAI()
        this.setReagentAI()


    }

    removeProtonFromWater() {
        const protationAI = new ProtonationAI(this)
        return protationAI.removeProtonFromWater()
    }

    addProtonFromReagentToHydroxylGroupReverse() {
        const protationAI = new ProtonationAI(this)
        return protationAI.addProtonFromReagentToHydroxylGroupReverse()
    }


    addProtonFromReagentToSubstrate() {

        const electrophile_index = this.MoleculeAI.findElectrophileIndex()

        if (electrophile_index === -1) {
            return false
        }

        const proton_index = this.ReagentAI.findProtonIndex()

        if (proton_index === -1) {
            return false
        }

        const proton = _.cloneDeep(this.container_reagent[0][1][proton_index])

        const proton_atom_object = CAtom(this.container_reagent[0][1][proton_index], proton_index, this.container_reagent)
        const atom_index = proton_atom_object.indexedBonds("").pop().atom_index
        this.container_reagent[0][1][atom_index][4] = this.container_reagent[0][1][atom_index][4] === '-' ? "": "+"
        this.removeProtonFromReagent(proton_index)

        // Add proton to substrate
        const electrons = _.cloneDeep(proton).slice(5)
        this.container_substrate[0][1][electrophile_index].push(electrons[0])
        this.container_substrate[0][1][electrophile_index].push(electrons[1])
        this.container_substrate[0][1][electrophile_index][4] = this.container_substrate[0][1][electrophile_index][4] === '+' ? "": "-"
        this.container_substrate[0][1].push(proton)

        this.setMoleculeAI()
        this.setReagentAI()

        return true

    }

    addProtonFromReagentToSubstrateReverse() {

        const electrophile_index = this.ReagentAI === null?null:this.ReagentAI.findElectrophileIndex()

        if (electrophile_index === -1) {
            return false
        }

        const proton_index = this.MoleculeAI.findProtonIndex()

        if (proton_index === -1) {
            return false
        }

        const proton = _.cloneDeep(this.container_substrate[0][1][proton_index])

        const proton_atom_object = CAtom(this.container_substrate[0][1][proton_index], proton_index, this.container_substrate)
        let atom_index = proton_atom_object.indexedBonds("").pop().atom_index
        _.remove(this.container_substrate[0][1], (atom, index)=>{
            return index === proton_index
        })

        if (proton_index < atom_index) {
            atom_index = atom_index - 1
        }
        this.setChargeOnSubstrateAtom(atom_index)


        if (this.ReagentAI === null) {
            if (this.container_reagent[0]==="Brønsted–Lowry conjugate base") {
                this.container_reagent[0]="Brønsted–Lowry acid"
            } else {
               // console.log("Warning: adding proton to  " + this.container_reagent[0] + "  (Reaction.js addProtonFromReagentToSubstrateReverse(), returning false")
                return false
            }
        } else {
            // Add proton to reagent
            const reagent_proton = AtomFactory("H", "")
            reagent_proton.pop()
            const electrophile_atom = CAtom(this.container_reagent[0][1][electrophile_index], electrophile_index, this.container_reagent)
            const electrophile_free_electrons = electrophile_atom.freeElectrons()
            if (electrophile_free_electrons.length === 2) {
                reagent_proton.push(electrophile_free_electrons[0])
                reagent_proton.push(electrophile_free_electrons[1])
            } else {
                return false
            }
            this.container_reagent[0][1].push(reagent_proton)
            this.setChargeOnReagentAtom(electrophile_index)
            this.setReagentAI()
            this.ReagentAI.validateMolecule()
        }

        this.setMoleculeAI()
        this.MoleculeAI.validateMolecule()

        return true
    }

    addProtonFromSubstrateToReagent() {

        const electrophile_index = this.ReagentAI.findElectrophileIndex()


        if (electrophile_index === -1) {
            return false
        }

        const proton_index = this.MoleculeAI.findProtonIndex()

        if (proton_index === -1) {
            return false
        }

        const proton = _.cloneDeep(this.container_substrate[0][1][proton_index])

        const proton_atom_object = CAtom(this.container_substrate[0][1][proton_index], proton_index, this.container_substrate)
        let atom_index = proton_atom_object.indexedBonds("").pop().atom_index
        // this.removeProtonFromSubstrate(proton_index)
        _.remove(this.container_substrate[0][1], (atom, index)=>{
            return index === proton_index
        })
        //this.container_substrate[0][1][atom_index][4] = this.container_substrate[0][1][atom_index][4] === '-' ? "": "+"
        if (proton_index < atom_index) {
            atom_index = atom_index - 1
        }
        this.setChargeOnSubstrateAtom(atom_index)

        // Add proton to reagent
        const electrons = [uniqid(), uniqid()]
        const reagent_proton = AtomFactory("H", "")
        this.container_reagent[0][1][electrophile_index].push(electrons[0])
        this.container_reagent[0][1][electrophile_index].push(electrons[1])
        this.container_reagent[0][1].push(reagent_proton)
        // this.container_reagent[0][1][electrophile_index][4] = this.container_reagent[0][1][electrophile_index][4] === '+' ? "": "-"
        this.setChargeOnReagentAtom(electrophile_index)

        this.setMoleculeAI()
        this.setReagentAI()

        return true

    }

    addProtonFromReagentToHydroxylGroup() {
        const protonationAI = new ProtonationAI(this)
        return protonationAI.addProtonFromReagentToHydroxylGroup()
    }

    addProtonFromReagentToNonHydroxylGroup() {


        let reagent_atom_index = this.ReagentAI.findNucleophileIndex()

        if (reagent_atom_index === -1) {
            if (VMolecule(this.container_reagent).canonicalSMILES()=== "[O+]"){
                reagent_atom_index = _.findIndex(this.container_substrate[0][1], (v,i)=>{
                    return v[0] === 'O'
                })
            }
        }

        let proton_index = -1
        if (reagent_atom_index !== -1) {
            proton_index = CAtom(this.container_reagent[0][1][reagent_atom_index], reagent_atom_index, this.container_reagent).indexedBonds("").filter((bond)=>{
                return bond.atom[0] === "H"
            }).pop().atom_index
        } else {
            proton_index = this.ReagentAI.findProtonIndex()
        }

        proton_index.should.be.greaterThan(-1)

        const reagent_atoms = _.cloneDeep(this.container_reagent[0][1])
        this.removeProtonFromReagent(proton_index)
        this.container_reagent[0][1].length.should.not.equal(reagent_atoms.length)


        const oxygen_index = this.MoleculeAI.findNonHydroxylOxygenIndex()


        oxygen_index.should.not.be.equal(-1)


        if (oxygen_index === -1) {
            return false
        }


        this.container_substrate[0][1][oxygen_index][0].should.be.equal("O")
        const substrate_atoms = _.cloneDeep(this.container_substrate[0][1])
        this.addProtonToSubstrate(this.container_substrate[0][1][oxygen_index], oxygen_index) // changes this.container_substrate

        this.container_substrate[0][1].length.should.not.equal(substrate_atoms.length)


        this.setMoleculeAI()
        this.setReagentAI()



    }

    protonateCarbonDoubleBond() {

        // @see Organic Chemistry 8th edition p245
        // Get index of double bond carbon bonded to the most hydrogens
        let atom_nucleophile_index = this.MoleculeAI.findLeastSubstitutedCarbonPiBondIndex()

        if (atom_nucleophile_index === -1) {
            return false
        }
        atom_nucleophile_index.should.be.an.Number()
        atom_nucleophile_index.should.be.greaterThan(-1)

        const atoms = _.cloneDeep(this.container_substrate[0][1])

        const proton = AtomFactory("H", 0)
        proton.pop()

        proton.length.should.be.equal(5)
        proton[0].should.be.equal('H')


        let free_electrons = []

        // Check for double bond and if there is one break it and get shared electrons from that.
        const double_bonds = CAtom(this.container_substrate[0][1][atom_nucleophile_index], atom_nucleophile_index, this.container_substrate).indexedDoubleBonds("")

        const db_atom = CAtom(this.container_substrate[0][1][double_bonds[0].atom_index], double_bonds[0].atom_index, this.container_substrate)

        const shared_electrons = _.cloneDeep(double_bonds[0].shared_electrons).slice(0,2)

        // Remove double bond
        _.remove(this.container_substrate[0][1][double_bonds[0].atom_index], (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        free_electrons = shared_electrons
        // Set charge on the former double bonded carbon
        this.container_substrate[0][1][double_bonds[0].atom_index][4] =
            this.container_substrate[0][1][double_bonds[0].atom_index][4] === "-"
            || this.container_substrate[0][1][double_bonds[0].atom_index][4] < 0? 0: "+"

        free_electrons.length.should.be.greaterThan(1)

        proton.push(free_electrons[0])
        proton.push(free_electrons[1])

        this.container_substrate[0][1].push(proton)

        this.container_substrate[0][1].length.should.not.equal(atoms.length)

        this.setMoleculeAI()

        // Remove proton from the reagent
        if (null !== this.container_reagent) {

            const reagent_proton_index = this.ReagentAI.findProtonIndex()

            // Set charge
            const reagent_bonds = CAtom(this.container_reagent[0][1][reagent_proton_index], reagent_proton_index, this.container_reagent).indexedBonds("").filter(
                (bond) => {
                    return bond.atom[0] !== "H"
                }
            )

            this.container_reagent[0][1][reagent_bonds[0].atom_index][4] = this.container_reagent[0][1][reagent_bonds[0].atom_index][4] === "+"
            ||  this.container_reagent[0][1][reagent_bonds[0].atom_index][4] < 0? 0: "-"

            _.remove(this.container_reagent[0][1], (v, i) => {
                return i === reagent_proton_index
            })

            this.setReagentAI()
        }


    }

    oxygenToOxygenProtonTransfer() {

        const oxygen_index = this.MoleculeAI.findOxygenElectrophileIndex()
        const oxygen_electrophile_atom = CAtom(this.container_substrate[0][1][oxygen_index], oxygen_index, this.container_substrate)

        const substituted_oxygen_index = this.MoleculeAI.findMostSubstitutedOxygenIndex()
        const most_substituted_oxygen = CAtom(this.container_substrate[0][1][substituted_oxygen_index], substituted_oxygen_index, this.container_substrate)

        const proton_index = this.MoleculeAI.findProtonIndexOnAtom(oxygen_electrophile_atom)
        const shared_electrons =  Set().intersection(_.cloneDeep(this.container_substrate[0][1][oxygen_index]), _.cloneDeep(this.container_substrate[0][1][proton_index]))
        // Remove shared electrons from proton
        _.remove(this.container_substrate[0][1][proton_index] , (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        // Add proton to most substituted oxygen
        const freeElectrons = most_substituted_oxygen.freeElectrons()
        this.container_substrate[0][1][proton_index].push(freeElectrons[0])
        this.container_substrate[0][1][proton_index].push(freeElectrons[1])

        this.container_substrate[0][1][oxygen_index][4] = ""
        this.container_substrate[0][1][substituted_oxygen_index][4] = "+"

        this.setMoleculeAI()

    }

    breakCarbonNitrogenTripleBond() {
        const bondsAI = new BondsAI(this)
        return bondsAI.makeOxygenCarbonDoubleBond()
    }

    breakCarbonNitrogenDoubleBond() {
        const bondsAI = new BondsAI(this)
        return bondsAI.breakCarbonNitrogenDoubleBond()
    }

    addProtonToAtom(atom_index, proton) {

        this.container_substrate[0][1][atom_index].push(proton[5]) // add electron

        // Charges
        proton[4] = proton[4]==="+"?"":"-"
        this.container_substrate[0][1][atom_index][4] = this.container_substrate[0][1][atom_index][4] === "-"?"":"+"
        this.container_substrate[0][1].push(proton)

    }

    breakCarbonOxygenDoubleBond() {
        const bondsAI = new BondsAI(this)
        return bondsAI.breakCarbonOxygenDoubleBond()
    }

    breakCarbonDoubleBond() {
        const bondsAI = new BondsAI(this)
        return bondsAI.breakCarbonDoubleBond()
    }

    hydrideShiftOnCarbonNitrogenBondReverse() {
        // formate
        this.container_reagent = [MoleculeFactory("C(=O)[O-]"),1]
        this.setReagentAI()
        const hydroxide_index = this.ReagentAI.findOxygenAttachedToCarbonIndexNoDoubleBonds()
           // console.log('hydrideShiftReverse()')
           // console.log('reagent')
           // console.log(VMolecule(this.container_reagent).compressed())
           // console.log('hydroxide index:' + hydroxide_index)

        const carbon_index = this.MoleculeAI.findIndexOfCarbonAtomBondedToNonCarbonBySymbol('N')
        //   // console.log('substrate')
        //   // console.log(VMolecule(this.container_substrate).compressed())

        //   // console.log('carbon index:' + carbon_index)

        this.__bondReagentToSubstrate(carbon_index, hydroxide_index)
        //   // console.log('substrate')
        //   // console.log(VMolecule(this.container_substrate).compressed())
    }

    carbocationShift() {

        const carbocation_index = this.MoleculeAI.findIndexOfCarbocationAttachedtoCarbon()
        if (carbocation_index === -1) {
            return false
        }

        const carbocation = CAtom(this.container_substrate[0][1][carbocation_index], carbocation_index, this.container_substrate)

        const carbon_bond = carbocation.indexedBonds("").filter((bond)=>{
            if (bond.atom[0] !=="C") {
                return false
            }
            const c = CAtom(this.container_substrate[0][1][bond.atom_index], bond.atom_index, this.container_substrate)
            return c.hydrogens().length === 0 // @todo
        }).pop()

        if (carbon_bond === undefined) {
            return false
        }

        const carbon_index = carbon_bond.atom_index

        const carbon = CAtom(this.container_substrate[0][1][carbon_index], carbon_index, this.container_substrate)

        let atom_to_shift_index = null

        // Check for hydrogens
        if (carbon.hydrogens().length > 0) {
             atom_to_shift_index = carbon.indexedBonds("").filter((bond) => {
                if (bond.atom[0] !== "C") {
                    return false
                }
                const c = CAtom(this.container_substrate[0][1][bond.atom_index], bond.atom_index, this.container_substrate)
                return c.hydrogens().length === 3
            }).pop().atom_index
        } else {
            // Get methyl group
            atom_to_shift_index = carbon.indexedBonds("").filter((bond) => {
                if (bond.atom[0] !== "C") {
                    return false
                }
                const c = CAtom(this.container_substrate[0][1][bond.atom_index], bond.atom_index, this.container_substrate)
                return c.hydrogens().length === 3
            }).pop().atom_index
        }

        if (atom_to_shift_index === undefined) {
            return false
        }

        const carbon_methyl_shared_electrons = Set().intersection(this.container_substrate[0][1][carbon_index].slice(5), this.container_substrate[0][1][atom_to_shift_index].slice(5))

        this.container_substrate[0][1][carbon_index] = Set().removeFromArray(this.container_substrate[0][1][carbon_index], carbon_methyl_shared_electrons)
        // this.container_substrate[0][1][atom_to_shift_index] = Set().removeFromArray(this.container_substrate[0][1][atom_to_shift_index], carbon_methyl_shared_electrons)
        // Make carbocation - methyl bond
        this.container_substrate[0][1][carbocation_index].push(carbon_methyl_shared_electrons[0])
        this.container_substrate[0][1][carbocation_index].push(carbon_methyl_shared_electrons[1])
        this.container_substrate[0][1][carbocation_index][4] = this.container_substrate[0][1][carbocation_index][4] === "+" ? "" : "-"
        this.container_substrate[0][1][carbon_index][4] = this.container_substrate[0][1][carbon_index][4] === "-" ? "" : "+"
        this.setMoleculeAI()

        return true

    }

    carbocationShiftReverse(check_mode) {

        this.setMoleculeAI()


        // Dehydrate first if possible
        const water_index = this.MoleculeAI.findWaterOxygenIndex()
        if (water_index !== -1) {
            return false
        }


        const carbocation_index = this.MoleculeAI.findIndexOfCarbocationAttachedtoCarbon()

        // console.log("carbocation index:" + carbocation_index)

        if (carbocation_index === -1) {
            return false
        }

        const carbocation = CAtom(this.container_substrate[0][1][carbocation_index], carbocation_index, this.container_substrate)


        const carbon_bond = carbocation.indexedBonds("").filter((bond)=>{
            if (bond.atom[0] !=="C") {
                return false
            }
            const c = CAtom(this.container_substrate[0][1][bond.atom_index], bond.atom_index, this.container_substrate)
            //return c.hydrogens().length < 2 // @todo
            return true
        }).sort( (bond_a, bond_b) => {
            const a =  CAtom(this.container_substrate[0][1][bond_a.atom_index], bond_a.atom_index, this.container_substrate)
            const b =  CAtom(this.container_substrate[0][1][bond_b.atom_index], bond_b.atom_index, this.container_substrate)
            return a.hydrogens().length - b.hydrogens().length;
        }).pop()


        if (carbon_bond === undefined) {
            return false
        }


        const carbon_index = carbon_bond.atom_index


        const carbon = CAtom(this.container_substrate[0][1][carbon_index], carbon_index, this.container_substrate)

        let atom_to_shift_index = null

       // console.log("carbon index:"+carbon_index)

        // Check for hydrogens
        if (carbon.hydrogens().length > 0) {
            /*
            const c_bonds = carbon.indexedBonds("").filter((bond) => {
                if (bond.atom[0] !== "C") {
                    return false
                }
                const c = CAtom(this.container_substrate[0][1][bond.atom_index], bond.atom_index, this.container_substrate)
                //return c.hydrogens().length === 3
                return true
            })
            if (c_bonds.length === 0) {
                return false
            }
            */
            const h_bonds = carbon.indexedBonds("").filter((bond) => {
                if (bond.atom[0] !== "H") {
                    return false
                }
                const h = CAtom(this.container_substrate[0][1][bond.atom_index], bond.atom_index, this.container_substrate)
                return true
            })
            if (h_bonds.length === 0) {
                return false
            }
            atom_to_shift_index = h_bonds.pop().atom_index
        } else {
            // Get methyl group then try for hydrogen
            const methyl_bonds = carbon.indexedBonds("").filter((bond) => {
                if (bond.atom[0] !== "C") {
                    return false
                }
                const c = CAtom(this.container_substrate[0][1][bond.atom_index], bond.atom_index, this.container_substrate)
                return c.hydrogens().length === 3
            })
            if (methyl_bonds.length === 0) {
                const h_bonds = carbon.indexedBonds("").filter((bond) => {
                    return bond.atom[0] === "H"
                })
                atom_to_shift_index = h_bonds.length > 0? h_bonds.pop().atom_index: -1
            } else {
                atom_to_shift_index = methyl_bonds.pop().atom_index
            }

        }



        if (atom_to_shift_index === undefined || atom_to_shift_index === -1) {
            return false
        }

        //console.log("carboncatioinShiftReverse()")
        //console.log(VMolecule(this.container_substrate).canonicalSMILES())
      //  console.log(atom_to_shift_index)
      //  console.log(this.container_substrate[0][1][atom_to_shift_index])


        if (check_mode) {
            return true
        }

        const carbon_methyl_shared_electrons = Set().intersection(this.container_substrate[0][1][carbon_index].slice(5), this.container_substrate[0][1][atom_to_shift_index].slice(5))

       // console.log(carbon_methyl_shared_electrons)
      //  console.log(jjj)

        this.container_substrate[0][1][carbon_index] = Set().removeFromArray(this.container_substrate[0][1][carbon_index], carbon_methyl_shared_electrons)

        // Make carbocation - methyl bond
        this.container_substrate[0][1][carbocation_index].push(carbon_methyl_shared_electrons[0])
        this.container_substrate[0][1][carbocation_index].push(carbon_methyl_shared_electrons[1])

        this.setChargesOnSubstrate()

        // console.log("Reaction.js carbocation_index:" + carbocation_index)
        // console.log(VMolecule(this.container_substrate).compressed())
        this.setMoleculeAI()

        //console.log("carboncatioinShiftReverse()")
        //console.log(VMolecule(this.container_substrate).canonicalSMILES())
        //console.log(carbocationshiftreverssse)



        return true

    }

    hydrideShift() {

        let carbon_atom_object = null
        // carbon dioxide
        // Look for carbon atom with O double bond, O single bond, and proton.
        const carbons = this.container_substrate[0][1].filter((atom, index)=>{
            if (atom[0] !== "C") {
                return false
            }
            carbon_atom_object = CAtom(atom, index, this.container_substrate)
            if (carbon_atom_object.hydrogens().length !== 1) {
                return false
            }
            const oxygen_double_bonds = carbon_atom_object.indexedDoubleBonds("").filter((bond)=>{
                return bond.atom[0] === "O"
            })
            if (oxygen_double_bonds.length !==1) {
                return false
            }
            const oxygen_single_bonds = carbon_atom_object.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === 'O' && bond.bond_type === ''
            })
            return oxygen_single_bonds.length === 1
        })


        if (carbons.length === 0) {
            return false
        }


        const electrophile_carbon_atom_object = CAtom(carbons[0], carbon_atom_object.atomIndex, this.container_substrate)
        const nucleophile_proton_index = electrophile_carbon_atom_object.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        }).pop().atom_index

        // Check single bonded O for carbon bond (not C atom above)
        const oxygen_single_bond_index = electrophile_carbon_atom_object.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === 'O' && bond.bond_type === ''
        }).pop().atom_index
        const oxygen_single_bond_atom_object = CAtom(this.container_substrate[0][1][oxygen_single_bond_index], oxygen_single_bond_index, this.container_substrate)
        const oxygen_carbon_single_bonds = oxygen_single_bond_atom_object.indexedBonds("").filter((bond, index)=>{
            return bond.atom[0] === "C" && bond.bond_type === "" && index !== carbon_atom_object.atomIndex
        })

        if (oxygen_carbon_single_bonds.length === 0) {
            return false
        }

        const electrophile_index = oxygen_carbon_single_bonds[0].atom_index


        // bond nucleophile (proton) to electrophile (protonate)
        const shared_electrons = Set().intersection(
            _.cloneDeep(this.container_substrate[0][1][nucleophile_proton_index].slice(5)),
            _.cloneDeep(this.container_substrate[0][1][carbon_atom_object.atomIndex].slice(5))
        )

        this.container_substrate[0][1][carbon_atom_object.atomIndex] = Set().removeFromArray(
            _.cloneDeep(this.container_substrate[0][1][carbon_atom_object.atomIndex]),
            _.cloneDeep(shared_electrons)
        )

        // electrophile is the 'central' carbon atom attached to the carbon dioxide group
        // add proton
        this.container_substrate[0][1][electrophile_index].push(shared_electrons[0])
        this.container_substrate[0][1][electrophile_index].push(shared_electrons[1])

        // break single bonded O, carbon bond
        const o_c_shared_electrons = Set().intersection(
            _.cloneDeep(this.container_substrate[0][1][electrophile_index].slice(5)),
            _.cloneDeep(this.container_substrate[0][1][oxygen_single_bond_index].slice(5))
        )
        this.container_substrate[0][1][electrophile_index] = Set().removeFromArray(
            _.cloneDeep(this.container_substrate[0][1][electrophile_index]),
            _.cloneDeep(o_c_shared_electrons)
        )


        // make C=O bond using single bonded O, carbon atom (carbon with double bond and proton)
        this.container_substrate[0][1][carbon_atom_object.atomIndex].push(o_c_shared_electrons[0])
        this.container_substrate[0][1][carbon_atom_object.atomIndex].push(o_c_shared_electrons[1])

           // console.log('electrophile index:' + electrophile_index)
           // console.log('oxygen single bond index:' + oxygen_single_bond_index)
           // console.log(VMolecule(this.container_substrate).compressed())

        // Remove carbon dioxide
        const oxygen_double_bond_index = electrophile_carbon_atom_object.indexedDoubleBonds("").filter((bond)=>{
            return bond.atom[0] === 'O'
        }).pop().atom_index
        const atoms = []
        atoms.push(_.cloneDeep(this.container_substrate[0][1][carbon_atom_object.atomIndex]))
        atoms.push(_.cloneDeep(this.container_substrate[0][1][oxygen_single_bond_index]))
        atoms.push(_.cloneDeep(this.container_substrate[0][1][oxygen_double_bond_index]))
        this.leaving_groups.push([[6.1, atoms],1])

        _.remove(this.container_substrate[0][1], (atom, index)=>{
            return index === carbon_atom_object.atomIndex || index === oxygen_single_bond_index || index === oxygen_double_bond_index
        })

        this.setMoleculeAI()





    }


    deprotonateWater() {

            // console.log('deprotonateWater()')

        const w_oxygen_index = this.MoleculeAI.findWaterOxygenIndex()
           // console.log('o i:' + w_oxygen_index)
        const oxygen_object = CAtom(this.container_substrate[0][1][w_oxygen_index], w_oxygen_index, this.container_substrate)

        this.container_reagent = [MoleculeFactory("O"),1]
        const reagent_oxygen_index = this.ReagentAI.findWaterOxygenIndex()

        const reagent_oxygen_object = CAtom(this.container_reagent[0][1][reagent_oxygen_index], reagent_oxygen_index, this.container_reagent)

        const proton_bond = oxygen_object.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === 'H'
        }).pop()
        Set().removeFromArray(this.container_substrate[0][1][proton_bond.atom_index], proton_bond.shared_electrons)
        const proton = _.cloneDeep(this.container_substrate[0][1][proton_bond.atom_index])
        this.container_substrate[0][1][w_oxygen_index][4] = this.container_substrate[0][1][w_oxygen_index][4] === "+"?"":"-"

        _.remove(this.container_substrate[0][1], (atom, index)=>{
            return index === proton_bond.atom_index
        })
        this.container_reagent[0][1][reagent_oxygen_index].push(proton_bond.shared_electrons[0])
        this.container_reagent[0][1][reagent_oxygen_index].push(proton_bond.shared_electrons[1])
        this.container_reagent[0][1].push(proton)

        this.setMoleculeAI()
        this.setReagentAI()

    }

    __bondReagentToSubstrate(substrate_atom_index, reagent_atom_index) {

        this.container_reagent[0][1][reagent_atom_index][4] = this.container_reagent[0][1][reagent_atom_index][4] === "-"? "" : "+"
        const reagent_atom_object = CAtom(this.container_reagent[0][1][reagent_atom_index], reagent_atom_index, this.container_reagent)
        const substrate_atom_object = CAtom(this.container_substrate[0][1][substrate_atom_index], substrate_atom_index, this.container_substrate)

        const reagent_atom_free_electrons = _.cloneDeep(reagent_atom_object.freeElectrons())
        const substrate_atom_free_electrons = _.cloneDeep(substrate_atom_object.freeElectrons())

        this.container_reagent[0][1][reagent_atom_index].push(substrate_atom_free_electrons[0])
        this.container_reagent[0][1][reagent_atom_index].push(substrate_atom_free_electrons[1])
        this.container_reagent[0][1][reagent_atom_index].push(substrate_atom_free_electrons[2])
        this.container_reagent[0][1][reagent_atom_index].push(substrate_atom_free_electrons[3])
        let e = null
        if (undefined === reagent_atom_free_electrons[0]) {
            e = uniqid()
            this.container_substrate[0][1][substrate_atom_index].push(e)
            // this.container_reagent[0][1][reagent_atom_index].push(e)
        } else {
            this.container_substrate[0][1][substrate_atom_index].push(reagent_atom_free_electrons[0])
        }

        if (undefined === reagent_atom_free_electrons[1]) {
            e = uniqid()
            this.container_substrate[0][1][substrate_atom_index].push(e)
            // this.container_reagent[0][1][reagent_atom_index].push(e)
        } else {
            this.container_substrate[0][1][substrate_atom_index].push(reagent_atom_free_electrons[1])
        }

        /*
        if (undefined === reagent_atom_free_electrons[2]) {
            e = uniqid()
            this.container_substrate[0][1][substrate_atom_index].push(e)
            // this.container_reagent[0][1][reagent_atom_index].push(e)
        } else {
            this.container_substrate[0][1][substrate_atom_index].push(reagent_atom_free_electrons[2])
        }

        if (undefined === reagent_atom_free_electrons[3]) {
            e = uniqid()
            this.container_substrate[0][1][substrate_atom_index].push(e)
            //  this.container_reagent[0][1][reagent_atom_index].push(e)
        } else {
            this.container_substrate[0][1][substrate_atom_index].push(reagent_atom_free_electrons[3])
        }
        */


        this.container_reagent[0][1].map((atom)=>{
            this.container_substrate[0][1].push(atom)
        })

        this.setMoleculeAI()
        this.setReagentAI()
    }


    __doubleBondReagentToSubstrate(substrate_atom_index, reagent_atom_index) {

        const reagent_atom_object = CAtom(this.container_reagent[0][1][reagent_atom_index], reagent_atom_index, this.container_reagent)
        const substrate_atom_object = CAtom(this.container_substrate[0][1][substrate_atom_index], substrate_atom_index, this.container_substrate)

        const reagent_atom_free_electrons = _.cloneDeep(reagent_atom_object.freeElectrons())
        const substrate_atom_free_electrons = _.cloneDeep(substrate_atom_object.freeElectrons())

        this.container_reagent[0][1][reagent_atom_index].push(substrate_atom_free_electrons[0])
        this.container_reagent[0][1][reagent_atom_index].push(substrate_atom_free_electrons[1])
        this.container_reagent[0][1][reagent_atom_index].push(substrate_atom_free_electrons[2])
        this.container_reagent[0][1][reagent_atom_index].push(substrate_atom_free_electrons[3])
        let e = null
        if (undefined === reagent_atom_free_electrons[0]) {
            e = uniqid()
            this.container_substrate[0][1][substrate_atom_index].push(e)
            // this.container_reagent[0][1][reagent_atom_index].push(e)
        } else {
            this.container_substrate[0][1][substrate_atom_index].push(reagent_atom_free_electrons[0])
        }

        if (undefined === reagent_atom_free_electrons[1]) {
            e = uniqid()
            this.container_substrate[0][1][substrate_atom_index].push(e)
            // this.container_reagent[0][1][reagent_atom_index].push(e)
        } else {
            this.container_substrate[0][1][substrate_atom_index].push(reagent_atom_free_electrons[1])
        }

        if (undefined === reagent_atom_free_electrons[2]) {
            e = uniqid()
            this.container_substrate[0][1][substrate_atom_index].push(e)
            // this.container_reagent[0][1][reagent_atom_index].push(e)
        } else {
            this.container_substrate[0][1][substrate_atom_index].push(reagent_atom_free_electrons[2])
        }

        if (undefined === reagent_atom_free_electrons[3]) {
            e = uniqid()
            this.container_substrate[0][1][substrate_atom_index].push(e)
            //  this.container_reagent[0][1][reagent_atom_index].push(e)
        } else {
            this.container_substrate[0][1][substrate_atom_index].push(reagent_atom_free_electrons[3])
        }

        this.container_reagent[0][1].map((atom)=>{
            this.container_substrate[0][1].push(atom)
        })

        this.setMoleculeAI()
    }

    hydrolysisReverse() {
        // @see https://en.wikipedia.org/wiki/Leuckart_reaction/
           // console.log("hydrolysisReverse()")
           // console.log("Start")
           // console.log('Reagent')
           // console.log(VMolecule(this.container_reagent).compressed())

        // Reagent:
        // Should have C-OH group attached to the main carbon
        if (this.ReagentAI.findHydroxylOxygenIndex() === -1) {
            return false
        }
        const carbon_atom_index = this.ReagentAI.findIndexOfCarbonAtomAttachedToHydroxylGroup()

        // Substrate
        // Check for N atom bonded to a carbon. N should have a pair of free electrons.
        const nitrogen_index = this.MoleculeAI.findAtomWithFreeElectronsIndexBySymbol('N')

        if (nitrogen_index === -1) {
            return false
        }

        const nitrogen_object = CAtom(this.container_substrate[0][1][nitrogen_index], nitrogen_index, this.container_substrate)

        // Double bond C atom on C-OH group on reagent to N atom on substrate
        // This should be done first
        this.__doubleBondReagentToSubstrate(nitrogen_index, carbon_atom_index)

           // console.log(this.container_substrate[0][1][nitrogen_index])
     //      // console.log(this.container_substrate[0][1][16])


      //     // console.log("After creating double bond between N and C")
      //     // console.log('Substrate')
      //     // console.log(VMolecule(this.container_substrate).compressed())


        // Remove OH group
        const groups = this.__removeHydroxylGroup(this.MoleculeAI, this.container_substrate)
        if (groups.length > 1) {
            this.container_substrate = [[-1, _.cloneDeep(groups[0])], 1]
            this.setMoleculeAI()
            this.setReagentAI()
            groups.shift()
            this.leaving_groups = groups.map((group)=>{
                return [[-1, group], 1]
            })
        }
        this.setMoleculeAI()

      //     // console.log("After removing OH group")
      //     // console.log('Substrate')
        //   // console.log(VMolecule(this.container_substrate).compressed())


        // Remove protons from N
        // This changes the index of the nitrogen atom
        this.container_substrate[0][1] = this.removeProtonFromAtom(this.MoleculeAI, this.container_substrate[0][1], nitrogen_object.atomIndex)
        this.setMoleculeAI()
        this.container_substrate[0][1] = this.removeProtonFromAtom(this.MoleculeAI, this.container_substrate[0][1], this.MoleculeAI.findAtomWithFreeElectronsIndexBySymbol('N'))

        // Remove proton from C=N carbon
        this.container_substrate[0][1] = this.removeProtonFromAtom(this.MoleculeAI, this.container_substrate[0][1], this.MoleculeAI.findIndexOfCarbonAtomDoubledBondedToNonCarbonBySymbol('N'))


        // Remove charges
        this.container_substrate[0][1].map((atom)=>{
            atom[4] = ""
            return atom
        })


           // console.log("After removing protons from substrate")
           // console.log('Substrate')
           // console.log(VMolecule(this.container_substrate).compressed())

        this.setMoleculeAI()
        this.setReagentAI()


    }

    removeProtonFromAtom(moleculeAI, molecule, atom_index) {
        const atom = CAtom(this.container_substrate[0][1][atom_index], atom_index, this.container_substrate)
        const proton_index = moleculeAI.findProtonIndexOnAtom(atom)
        if (proton_index !== -1) {
            const shared_electrons = Set().intersection(molecule[atom.atomIndex].slice(4), molecule[proton_index].slice(4))
            molecule[proton_index] = Set().removeFromArray(molecule[proton_index], shared_electrons)
        }

        molecule[atom_index][4] = molecule[atom_index][4] === "+"?"":"-"

        // Remove proton from container
        molecule.splice(proton_index, 1)

        return molecule
    }

    hydrolysis() {
        // @see https://en.wikipedia.org/wiki/Leuckart_reaction/
        // if imine (N=C bond)


            // console.log('hydrolysis')
            // console.log(VMolecule(this.container_substrate).compressed())
            // console.log(Families(this.container_substrate).families.imine())

        if(Families(this.container_substrate).families.imine()) {

            this.container_reagent = [MoleculeFactory("[OH3]"),1]
                // console.log(VMolecule(this.container_reagent).compressed())

            // protonate =N atom using reagent
            const nitrogen_index = _.findIndex(this.container_substrate[0][1], (atom, index)=>{
                return atom[0] === "N"
            })

                // console.log('n_i:'+nitrogen_index)

            const oxygen_index = _.findIndex(this.container_reagent[0][1], (atom, index)=>{
                return atom[0] === "O"
            })

                // console.log('o index (reagent):'+oxygen_index)

            const oxygen_object = CAtom(this.container_reagent[0][1][oxygen_index], oxygen_index, this.container_reagent)
            const proton_bond = oxygen_object.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === 'H'
            }).pop()
            Set().removeFromArray(this.container_reagent[0][1][proton_bond.atom_index], proton_bond.shared_electrons)
            const proton = _.cloneDeep(this.container_reagent[0][1][proton_bond.atom_index])
            _.remove(this.container_reagent[0][1], (atom, index)=>{
                return index === proton_bond.atom_index
            })
            this.container_substrate[0][1][nitrogen_index].push(proton_bond.shared_electrons[0])
            this.container_substrate[0][1][nitrogen_index].push(proton_bond.shared_electrons[1])
            this.container_substrate[0][1].push(proton)

               // console.log(VMolecule(this.container_substrate).compressed())
               // console.log(VMolecule(this.container_reagent).compressed())


            // Hydrate carbon atom on N=C bond
            const nitrogen_atom_object = CAtom(this.container_substrate[0][1][nitrogen_index], nitrogen_index, this.container_substrate)
            const nitrogen_carbon_bond = nitrogen_atom_object.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === 'C' && bond.bond_type === '='
            }).pop()
            this.hydrate(nitrogen_carbon_bond.atom_index)

               // console.log(VMolecule(this.container_substrate).compressed())
               // console.log(VMolecule(this.container_reagent).compressed())


            // break N=C bond
            this.container_substrate[0][1][nitrogen_carbon_bond.atom_index] = Set().removeFromArray(this.container_substrate[0][1][nitrogen_carbon_bond.atom_index], [nitrogen_carbon_bond.shared_electrons[0], nitrogen_carbon_bond.shared_electrons[1]])


            // deprotonate water group
            this.deprotonateWater()

            //   // console.log(VMolecule(this.container_substrate).compressed())
            //   // console.log(VMolecule(this.container_reagent).compressed())

            // protonate nitrogen
            const oxidanium_index = this.ReagentAI.findNonWaterOxygenIndex()
                // console.log('oxidanium index')
                // console.log(oxidanium_index)

            const oxidanium_object = CAtom(this.container_reagent[0][1][oxidanium_index], oxidanium_index, this.container_reagent)
            const oxidanium_proton_bond = oxidanium_object.indexedBonds("").filter((bond)=>{
                return bond.atom[0] === 'H'
            }).pop()
            const oxidanium_proton = _.cloneDeep(this.container_reagent[0][1][oxidanium_proton_bond.atom_index])
            _.remove(this.container_reagent[0][1], (atom, index)=>{
                return index === oxidanium_proton_bond.atom_index
            })

            // reset electrons
            const shared_electrons = [uniqid(), uniqid()]
            oxidanium_proton.pop()
            oxidanium_proton.pop()
            oxidanium_proton.push(shared_electrons[0])
            oxidanium_proton.push(shared_electrons[1])
            this.container_substrate[0][1][nitrogen_index].push(shared_electrons[0])
            this.container_substrate[0][1][nitrogen_index].push(shared_electrons[1])
            this.container_substrate[0][1][nitrogen_index][4] = this.container_substrate[0][1][nitrogen_index][4] === "-"?"":"+"
            this.container_substrate[0][1].push(oxidanium_proton)

         //      // console.log(VMolecule(this.container_substrate).compressed())
         //      // console.log(VMolecule(this.container_reagent).compressed())


            // break former N=C bond, creating a leaving group
           /// Set().removeFromArray(this.container_substrate[0][1][nitrogen_carbon_bond.atom_index], this.container_substrate[0][1][nitrogen_index])
            const groups = this.__removeGroup(nitrogen_carbon_bond.atom_index, nitrogen_index, this.MoleculeAI, this.container_substrate)


            if (groups.length > 1) {
                this.container_substrate = [[-1, _.cloneDeep(groups[0])], 1]
                this.setMoleculeAI()
                this.setReagentAI()
                groups.shift()
                this.leaving_groups = groups.map((group)=>{
                    return [[-1, group], 1]
                })
            }

        /*
               // console.log('Substrate')
               // console.log(VMolecule(this.container_substrate).compressed())
               // console.log('Reagent')
               // console.log(VMolecule(this.container_reagent).compressed())
                // console.log('Leaving group')
               // console.log(VMolecule(this.leaving_groups[0]).compressed())
            */

            // Substrate is the amine
            // Leaving group:
            const leaving_groupAI = require("../Stateless/MoleculeAI")(this.leaving_groups[0])
            const hyroxyl_oxygen_index = leaving_groupAI.findHydroxylOxygenIndex()

                // console.log(hyroxyl_oxygen_index)

            if (hyroxyl_oxygen_index !== -1) {

                // - create OH=C bond
                const hydroxyl_oxygen_object = CAtom(this.leaving_groups[0][0][1][hyroxyl_oxygen_index], hyroxyl_oxygen_index, this.leaving_groups[0])
                const c_bond =  hydroxyl_oxygen_object.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === 'C'
                }).pop()
                const free_electrons = hydroxyl_oxygen_object.freeElectrons()
                this.leaving_groups[0][0][1][c_bond.atom_index].push(free_electrons[0])
                this.leaving_groups[0][0][1][c_bond.atom_index].push(free_electrons[1])
                this.leaving_groups[0][0][1][c_bond.atom_index][4] = this.leaving_groups[0][0][1][c_bond.atom_index][4]==="+"?"":"-"
                    // console.log('Leaving group')
                    // console.log(VMolecule(this.leaving_groups[0]).compressed())

                // - deprotonate O on O=C bond
                this.container_reagent = [MoleculeFactory("O"),1]
                const o_index = leaving_groupAI.findOxygenOnDoubleBondIndex()
                const o_atom = CAtom(this.leaving_groups[0][0][1][o_index], o_index, this.leaving_groups[0])
                // Find proton on leaving group
                const o_proton_bond = hydroxyl_oxygen_object.indexedBonds("").filter((bond)=>{
                    return bond.atom[0] === "H"
                }).pop()
                const electrons = o_proton_bond.atom.slice(4)
                this.container_reagent[0][1][o_index].push(electrons[0])
                this.container_reagent[0][1][o_index].push(electrons[1])
                const p = _.cloneDeep(this.leaving_groups[0][0][1][o_proton_bond.atom_index])
                //Set().removeFromArray(this.leaving_groups[0][0][1][hyroxyl_oxygen_index],electrons[0])
                //Set().removeFromArray(this.leaving_groups[0][0][1][hyroxyl_oxygen_index],electrons[1])
                this.container_reagent[0][1].push(p)
                _.remove(this.leaving_groups[0][0][1], (atom, index)=>{
                        // console.log(index)
                    return index === o_proton_bond.atom_index
                })

                /*
                    // console.log('Substrate')
                    // console.log(VMolecule(this.container_substrate).compressed())
                    // console.log('Reagent')
                    // console.log(VMolecule(this.container_reagent).compressed())
                    // console.log('Leaving group')
                    // console.log(VMolecule(this.leaving_groups[0]).compressed())
                 */



            }


        }
    }


}

module.exports = Reaction

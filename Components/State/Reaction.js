
const CAtom = require('../../Controllers/Atom')
const _ = require('lodash');
const VMolecule = require('../../Components/Stateless/Views/Molecule')
const MoleculeFactory = require('../../Models/MoleculeFactory')
const AtomFactory = require('../../Models/AtomFactory')
const Set = require('../../Models/Set')

class Reaction {

    constructor(container_substrate, container_reagent, rule) {

        container_substrate.length.should.be.equal(2) // molecule, units
        container_substrate[0].length.should.be.equal(2) // pKa, atoms
        container_substrate[0][0].should.be.an.Number() // pka
        container_substrate[0][1].should.be.an.Array()
        container_substrate[0][1][0].should.be.an.Array()
        container_substrate[0][1][0][0].should.be.an.String()

        if (undefined !== container_reagent) {
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

        this.rule = rule

        this.setMoleculeAI()
        this.setReagentAI()
    }

    setReagentAI() {
        if (this.container_reagent !== null && this.container_reagent !== undefined) {
            this.container_reagent.length.should.be.equal(2) // molecule, units
            this.container_reagent[0].length.should.be.equal(2) // pKa, atoms
            this.container_reagent[0][0].should.be.an.Number() // pka
            this.container_reagent[0][1].should.be.an.Array()
            if (undefined !== this.container_reagent[0][1][0]) {
                this.container_reagent[0][1][0].should.be.an.Array()
                this.container_reagent[0][1][0][0].should.be.an.String()
            }
            this.ReagentAI = require("../Stateless/MoleculeAI")(this.container_reagent)
        }
    }

    setMoleculeAI() {

        this.container_substrate.length.should.be.equal(2) // molecule, units
        this.container_substrate[0].length.should.be.equal(2) // pKa, atoms
        this.container_substrate[0][0].should.be.an.Number() // pka
        this.container_substrate[0][1].should.be.an.Array()
        this.container_substrate[0][1][0].should.be.an.Array()
        this.container_substrate[0][1][0][0].should.be.an.String()

        this.MoleculeAI = require("../Stateless/MoleculeAI")(this.container_substrate)
    }

    makeOxygenCarbonDoubleBondReverse() {
        const oxygen_index = this.MoleculeAI.findOxygenOnDoubleBondIndex()
        const oxygen = CAtom(this.container_substrate[0][1][oxygen_index], oxygen_index, this.container_substrate)
        const carbon_bonds = oxygen.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        })
        const shared_electrons = carbon_bonds[0].shared_electrons
        // Remove electrons from carbon
        _.remove(this.container_substrate[0][1][carbon_bonds[0].atom_index], (e)=>{
            return e === shared_electrons[0] || e === shared_electrons[1]
        })

        // Create proton and add it to the oxygen
        const proton = AtomFactory("H")
        proton.pop()
        proton.push(shared_electrons[0])
        proton.push(shared_electrons[1])
        this.container_substrate[0][1].push(proton)

        // Charges
        this.container_substrate[0][1][oxygen_index][4] = ""
        this.container_substrate[0][1][carbon_bonds[0].atom_index][4] = "-"


        this.setMoleculeAI()
    }

    breakCarbonOxygenDoubleBondReverse() {

        // Make C=O bond
        const oxygen_index = this.MoleculeAI.findOxygenAttachedToCarbonIndex()
        const oxygen = CAtom(this.container_substrate[0][1][oxygen_index], oxygen_index, this.container_substrate)

        const carbon_bonds = oxygen.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        })

        const carbon_index = carbon_bonds[0].atom_index

        const freeElectrons = oxygen.freeElectrons()

        // Add electrons to carbon
        this.container_substrate[0][1][carbon_index].push(freeElectrons[0])
        this.container_substrate[0][1][carbon_index].push(freeElectrons[1])

        // Charges
        this.container_substrate[0][1][carbon_index][4] = ""
        this.container_substrate[0][1][oxygen_index][4] = "+"

        this.setMoleculeAI()


    }

    makeOxygenCarbonDoubleBond() {

        const oxygen_index = this.MoleculeAI.findOxygenAttachedToCarbonIndex()
        const oxygen = CAtom(this.container_substrate[0][1][oxygen_index], oxygen_index, this.container_substrate)
        const carbon_bonds = oxygen.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "C"
        })
        const carbon_index = carbon_bonds[0].atom_index

        // Proton if applicable
        const proton_oxygen_bond = oxygen.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        }).pop()
        if (proton_oxygen_bond !== undefined) {
            const proton_shared_electrons = proton_oxygen_bond.shared_electrons
            const proton_index = proton_oxygen_bond.atom_index
            // Remove electrons from proton
            _.remove(this.container_substrate[0][1][proton_index], (e) => {
                return e === proton_shared_electrons[0] || e === proton_shared_electrons[1]
            })
            // Add electrons to carbon
            this.container_substrate[0][1][carbon_index].push(proton_shared_electrons[0])
            this.container_substrate[0][1][carbon_index].push(proton_shared_electrons[1])
        } else {
            const freeElectrons = oxygen.freeElectrons()
            // Add electrons to carbon
            this.container_substrate[0][1][carbon_index].push(freeElectrons[0])
            this.container_substrate[0][1][carbon_index].push(freeElectrons[1])
        }

        // Charges
        this.container_substrate[0][1][carbon_index][4] = this.container_substrate[0][1][carbon_index][4] === "+" ? "": "-"
        this.container_substrate[0][1][oxygen_index][4] = this.container_substrate[0][1][oxygen_index][4] === "-"?"":"+"

        this.setMoleculeAI()


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
      //  console.log('carbon index=' + carbon_index)
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

     //   console.log('terminal carbon index=' + terminal_carbon_index)


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

      //  console.log(shared_electrons)
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

    deprotonateCarbonyl() {
        return false
    }

    protonateCarbonyl() {
        return false
    }

    transferProton() {
        return false
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
        const water_molecule = MoleculeFactory("O")
        water_molecule[1][2][4]="+"
        this.container_reagent = [water_molecule,1]
        this.setReagentAI()
        const water_ai = require("../Stateless/MoleculeAI")([water_molecule,1])
        const water_oxygen_index = water_ai.findWaterOxygenIndex()
        const electrons = CAtom(water_molecule[1][water_oxygen_index],
            water_oxygen_index,
            [water_molecule,1]).freeElectrons()
        electrons.length.should.be.greaterThan(1)
        if (undefined === electrophile_index) {
            electrophile_index = this.MoleculeAI.findElectrophileIndex("O", "C")
        }

        //console.log('Reaction.js hydrate()')
        //console.log(electrophile_index)

        electrophile_index.should.not.be.equal(-1)

        this.container_substrate[0][1][electrophile_index].push(electrons[0])
        this.container_substrate[0][1][electrophile_index].push(electrons[1])
        this.container_substrate[0][1][electrophile_index][4] = 0

        this.container_substrate[0][1].push(water_molecule[1][0])
        this.container_substrate[0][1].push(water_molecule[1][1])
        this.container_substrate[0][1].push(water_molecule[1][2])

        this.setMoleculeAI()

        // Check we have a water molecule attached to main molecule
        this.MoleculeAI.findWaterOxygenIndex().should.be.greaterThan(-1)

    }

    dehydrate() {

        const oxygen_atom_index = this.MoleculeAI.findWaterOxygenIndex()
        console.log("(dehydrate() water oxygen index")
        console.log(oxygen_atom_index)

        const oxygen_atom = CAtom(this.container_substrate[0][1][oxygen_atom_index], oxygen_atom_index, this.container_substrate)

        const hydrogen_bonds = oxygen_atom.indexedBonds("").filter((bond) => {
                return bond.atom[0] === "H"
            }
        )

        // Get the bond that is NOT and oxygen - hydrogen bond
        const non_hydrogen_bond = oxygen_atom.indexedBonds("").filter((bond) => {
                return bond.atom[0] !== "H"
            }
        ).pop()

        // Break the non_hydrogen bond
        const shared_electrons = non_hydrogen_bond.shared_electrons

        _.remove(this.container_substrate[0][1][non_hydrogen_bond.atom_index], (v, i)=> {
            return shared_electrons[1] === v || shared_electrons[0] === v
        })

        // Remove water atoms
        _.remove(this.container_substrate[0][1], (v,i) => {
            return i === oxygen_atom_index || i === hydrogen_bonds[0].atom_index || i === hydrogen_bonds[1].atom_index
        })

        // Charges
        this.container_substrate[0][1][non_hydrogen_bond.atom_index][4] = '+'

        /*

        const atoms = this.container_substrate[0][1]

        atoms.map((oxygen_atom, oxygen_atom_index)=>{

            if (oxygen_atom[0] !== "O") {
                return false
            }
            const catom = CAtom(oxygen_atom, oxygen_atom_index, this.container_substrate)
            if(catom.bondCount()!==3) { // 2 hydrogens plus atom oxygen is bonded to
                return false
            }

            const indexed_bonds = catom.indexedBonds("")

            // Check we have two hydrogens and each hydrogen is only bonded to the oxygen atom
            const hydrogen_bonds = indexed_bonds.filter((bond) => {
                    if (bond.atom[0] !== "H") {
                        return false
                    }
                    const hydrogen_atom = CAtom(bond.atom, bond.atom_index, this.container_substrate)
                    if (hydrogen_atom.bondCount() !== 1) {
                        return false
                    }
                    return true
                }
            )

            const hydrogens = hydrogen_bonds.map((hydrogen_bond)=>{
                return hydrogen_bond.atom
            })

            if (hydrogens.length !== 2) {
                return false
            }

            // Get the bond that is NOT and oxygen - hydrogen bond
            const non_hydrogen_bond = indexed_bonds.filter((bond) => {
                    return bond.atom[0] !== "H"
                }
            ).pop()

            // Break the non_hydrogen bond
            const shared_electrons = non_hydrogen_bond.shared_electrons
            if (shared_electrons.length !==2 ) {
                return false
            }

            // Remove electrons from non hydrogen atom
            const number_of_electrons_at_start = _.cloneDeep(this.container_substrate[0][1][non_hydrogen_bond.atom_index]).slice(5).length
            _.remove(this.container_substrate[0][1][non_hydrogen_bond.atom_index], (v, i)=> {
                return shared_electrons[1] === v || shared_electrons[0] === v
            })
            _.cloneDeep(this.container_substrate[0][1][non_hydrogen_bond.atom_index]).slice(5).length.should.be.equal(number_of_electrons_at_start - 2)

            const number_of_atoms_at_start = _.cloneDeep(this.container_substrate[0][1]).length
            _.remove(this.container_substrate[0][1], (v,i) => {
                return i === oxygen_atom_index || i === hydrogen_bonds[0].atom_index || i === hydrogen_bonds[1].atom_index
            })
            _.cloneDeep(this.container_substrate[0][1]).length.should.be.equal(number_of_atoms_at_start - 3)

            this.container_substrate[0][1][non_hydrogen_bond.atom_index][4] = '+'



        })

*/
        // Check we do not have a water molecule attached to main molecule
       // this.MoleculeAI.findWaterOxygenIndex().should.be.equal(-1)

        this.setMoleculeAI()



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
            //console.log('overloaded_atoms:')
            //console.log(overloaded_atoms)
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

            /*
            console.log('Reaction.js Break bond (overloaded atom)')
            console.log('Nucleophile index') // 4 (most substituted carbon)
            console.log(nucleophile_index)
            console.log('Electrophile index') // 8 (O, positive charge)
            console.log(electrophile_index)
            */


        } else {

            // No overloaded atoms
            electrophile_index = this.MoleculeAI.findElectrophileIndex()

            if (electrophile_index === -1) {
                nucleophile_index = this.MoleculeAI.findNucleophileIndex()
                if (nucleophile_index === -1) {
                    console.log("Electrophile not found")
                    console.log("breakBond()")
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
                            return CAtom(this.container_substrate[0][1][oxygen_bond.atom_index], oxygen_bond, this.container_substrate)
                        }).sort(
                            (a, b) => {
                                return a.hydrogens().length < b.hydrogens().length ? -1 : 0
                            }
                        )
                        console.log(oxygens_sorted[0])
                        electrophile_index = oxygens_sorted[0].atomIndex

                    } else {
                        electrophile_index = bonds_to_nucleophile[0].atom_index
                    }
                }
            }

        console.log('electrophile index:')
            console.log(electrophile_index)

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
                console.log("Nucleophile not found")
                console.log("breakBond()")
                return false
            }



        }

        console.log("Reaction.js 582")
        console.log("nucleophile index:")
        console.log(nucleophile_index)
        console.log("electrophile index:")
        console.log(electrophile_index)
        const source_atom = CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate)
        const target_atom = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)

        const shared_electrons = Set().intersection(this.container_substrate[0][1][nucleophile_index].slice(5), this.container_substrate[0][1][electrophile_index].slice(5))

        /*
        https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map%3A_Organic_Chemistry_(Smith)/Chapter_06%3A_Understanding_Organic_Reactions/6.03_Bond_Breaking_and_Bond_Making
        If a covalent single bond is broken so that one electron of the shared pair remains with each fragment, as in the first example, this bond-breaking is called homolysis. If the bond breaks with both electrons of the shared pair remaining with one fragment,  this is called heterolysis.
         */
        // console.log("Break type=" + break_type)
        // console.log(this.container_substrate[0][1][electrophile_index][4])
        // console.log("Reaction.js")
        if (break_type === "heterolysis") {

            //console.log("Reaction.js break bond")
            //console.log(_.cloneDeep(this.container_substrate[0][1][nucleophile_index]).slice(0,5))
            //console.log(_.cloneDeep(this.container_substrate[0][1][electrophile_index]).slice(0,5))

            // Remove shared electrons from nucleophile
            const electrons = _.cloneDeep(this.container_substrate[0][1][nucleophile_index]).slice(5)
            _.remove(this.container_substrate[0][1][nucleophile_index], (v, i) => {
                return shared_electrons[0] === v || shared_electrons[1] === v
            })
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

            Set().intersection(this.container_substrate[0][1][nucleophile_index].slice(5), this.container_substrate[0][1][electrophile_index].slice(5)).length.should.be.equal(0)


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




        this.setMoleculeAI()


        // @todo work out if we now have two molecules



    }

    bondMetal() {

        const metal_atom_index = this.MoleculeAI.findMetalAtomIndex()


        if (metal_atom_index === -1) {
            console.log("bondMetal() no metal atom found (1)")
            return false
        }


        if (undefined === this.container_reagent) {

            const electrophile_index = this.MoleculeAI.findElectrophileIndex()


            if (electrophile_index === -1) {
                console.log("bondAtoms() no electrophile found (1)")
                return false
            }


            let electrophile_free_slots = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate).freeSlots()

            console.log(electrophile_index)

            if (electrophile_free_slots > 0) {

                let metal_atom_free_electrons = CAtom(this.container_substrate[0][1][metal_atom_index], electrophile_index, this.container_substrate).freeElectrons()

                this.container_substrate[0][1][electrophile_index].push(metal_atom_free_electrons[0])
                this.container_substrate[0][1][electrophile_index].push(metal_atom_free_electrons[1])
            }


        } else {

            // Reagent
            const electrophile_index = this.ReagentAI.findElectrophileIndex()
            if (electrophile_index === -1) {
                console.log("bondMetalAtoms() no nucleophile found (2)")
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

    deprotonateOxygenOnDoubleBond() {

        // Find index of oxygen
        const oxygen_index = this.MoleculeAI.findOxygenOnDoubleBondIndex()
        const oxygen_atom = CAtom(this.container_substrate[0][1][oxygen_index], oxygen_index, this.container_substrate)

        // Find proton
        const proton_bond = oxygen_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        }).pop()


        // Remove bond from proton
        _.remove(this.container_substrate[0][1][proton_bond.atom_index], (e)=>{
            return e === proton_bond.shared_electrons[0] || e === proton_bond.shared_electrons[1]
        })

        this.container_substrate[0][1][oxygen_index][4] = ""

        this.setMoleculeAI()
    }

    protonateOxygenOnDoubleBond() {

        // Find index of oxygen
        const oxygen_index = this.MoleculeAI.findOxygenOnDoubleBondIndex()

        const reagent_proton_index = this.ReagentAI.findProtonIndex()
        const proton = _.cloneDeep(this.container_reagent[0][1][reagent_proton_index])

        // Remove proton from reagent
        const reagent_bonds = CAtom(this.container_reagent[0][1][reagent_proton_index], reagent_proton_index, this.container_reagent).indexedBonds("").filter(
            (bond) => {
                return bond.atom[0] !== "H"
            }
        )

        let free_slots = CAtom(this.container_substrate[0][1][oxygen_index], oxygen_index, this.container_substrate).freeSlots()
        if (free_slots > 0) {
            // Add proton
            this.container_substrate[0][1][oxygen_index].push(proton[proton.length-1])
            this.container_substrate[0][1][oxygen_index].push(proton[proton.length-2])
            this.container_substrate[0][1].push(proton)
            this.container_substrate[0][1][oxygen_index][4] = "+"
        }

        this.container_reagent[0][1][reagent_bonds[0].atom_index][4] === "+"
        ||  this.container_reagent[0][1][reagent_bonds[0].atom_index][4] < 0? 0: "-"
        _.remove(this.container_reagent[0][1], (v, i) => {
            return i === reagent_proton_index
        })

        this.setMoleculeAI()
        this.setReagentAI()
    }

    removeMetal() {
        // Get index of metal atom
        const metal_atom_index = this.MoleculeAI.findMetalAtomIndex()

        if (metal_atom_index === -1) {
            console.log("removeBond() no metal atom")
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
            console.log("breakMetalBond() no metal atom found (1)")
            return false
        }

        const metal_atom = CAtom(this.container_substrate[0][1][metal_atom_index], metal_atom_index, this.container_substrate)

        const electrophile_index = metal_atom.indexedBonds("").filter((bond)=>{
            return bond.atom[4] === "&+" || bond.atom[4] === "+"
        }).pop().atom_index

        if (electrophile_index === undefined) {
            console.log("breakMetalBond() can't find electrophile")
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

    bondAtoms() {

        let electrophile_index = this.MoleculeAI.findElectrophileIndex()


        if (electrophile_index === -1) {
            electrophile_index = this.MoleculeAI.findNonWaterOxygenIndex(true)
        }

        if (electrophile_index === -1) {
            console.log("bondAtoms() no electrophile found (1)")
            return false
        }


        if (undefined === this.container_reagent) {

            const nucleophile_index = this.MoleculeAI.findNucleophileIndex()

            if (nucleophile_index === -1) {
                console.log("bondAtoms() no nucleophile found (1)")
                return false
            }

            //  const electrophile_free_electrons = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate).freeElectrons()
            let nucleophile_free_electrons = CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate).freeElectrons()

            if (nucleophile_free_electrons.length < 2) {
                console.log("bondAtoms() nucleophile has no free electrons")
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

            Set().intersection(this.container_substrate[0][1][electrophile_index].slice(5),
                this.container_substrate[0][1][nucleophile_index].slice(5)).length.should.be.equal(2)


        } else {

            // Reagent
            const nucleophile_index = this.ReagentAI.findNucleophileIndex()
            if (nucleophile_index === -1) {
                console.log("bondAtoms() no nucleophile found (2)")
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
        this.setMoleculeAI()
    }

    deprotonate() {

        // [C+]CH3
        // We remove the proton from the second carbon
        const electrophile_index = this.MoleculeAI.findElectrophileIndex()

        //console.log('reaction.js deprotonate electrophile index')
        //console.log(electrophile_index)


        if (electrophile_index === -1) {
            console.log("Electrophile not found")
            console.log("deprotonate")
            console.log(this.rule.mechanism)
            return false
        }

        const electrophile = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)

        const electrophile_bonds  = electrophile.indexedBonds("")

        //  console.log('electrophile_bonds')
        // console.log(electrophile_bonds)

        const hydrogen_bond = electrophile_bonds.filter((bond)=>{
            return bond.atom[0] === 'H'
        }).pop()


        if (this.container_substrate[0][1][electrophile_index][0]!== "C"){

            this.addProtonToReagent()
            this.container_substrate[0][1][electrophile_index][4] = 0
            this.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)

        } else {

            // Check for carbons bonds
            const carbon_bond = electrophile_bonds.filter((bond)=>{
                return bond.atom[0] === "C"
            }).pop()


            if (undefined === carbon_bond) {

                this.addProtonToReagent()
                this.container_substrate[0][1][electrophile_index][4] = 0
                this.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)

            } else {


                // Change bond to double bond
                const shared_electrons = hydrogen_bond.shared_electrons // electrons shared between electrophile and hydrogen
                this.container_substrate[0][1][carbon_bond.atom_index].push(shared_electrons[0])
                this.container_substrate[0][1][carbon_bond.atom_index].push(shared_electrons[1])


                this.addProtonToReagent()
                this.container_substrate[0][1][electrophile_index][4] = 0


            }
        }

        this.setReagentAI()
        this.setMoleculeAI()


    }

    removeProtonFromReagent(proton_index) {
        proton_index.should.be.greaterThan(-1)
        this.container_reagent[0][1].splice(proton_index, 1)
        this.setReagentAI()
    }

    protonate() {

        let atom_nucleophile_index = this.MoleculeAI.findNucleophileIndex()

        if (atom_nucleophile_index === -1 && !this.MoleculeAI.isWater()) {
            // try carbon atom
            atom_nucleophile_index = _.findIndex(_.cloneDeep(this.container_substrate[0][1]), (atom)=>{
                return atom[0] === "C"
            })
        }
        atom_nucleophile_index.should.be.an.Number()
        atom_nucleophile_index.should.be.greaterThan(-1)

        const atoms = _.cloneDeep(this.container_substrate[0][1])

        const proton = AtomFactory("H", 0)
        proton.pop()

        proton.length.should.be.equal(5)
        proton[0].should.be.equal('H')

        let free_electrons = CAtom(this.container_substrate[0][1][atom_nucleophile_index], atom_nucleophile_index, this.container_substrate).freeElectrons()

        if (free_electrons.length === 0) {

            // Check for double bond and if there is one break it and get shared electrons from that.
            const double_bonds = CAtom(this.container_substrate[0][1][atom_nucleophile_index], atom_nucleophile_index, this.container_substrate).indexedDoubleBonds("")

            if (double_bonds.length > 0) {
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

            }

        } else {
            this.container_substrate[0][1][atom_nucleophile_index][4] =
                this.container_substrate[0][1][atom_nucleophile_index][4] === "-"
                || this.container_substrate[0][1][atom_nucleophile_index][4] < 0? 0: "+"

        }

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
            this.container_reagent[0][1][reagent_bonds[0].atom_index][4] === "+"
            ||  this.container_reagent[0][1][reagent_bonds[0].atom_index][4] < 0? 0: "-"
            _.remove(this.container_reagent[0][1], (v, i) => {
                return i === reagent_proton_index
            })
            this.setReagentAI()
        }


    }


    addProtonToReagent( ) {

        const atom_nucleophile_index = this.ReagentAI.findNucleophileIndex()

        atom_nucleophile_index.should.not.be.equal(-1)

        const reagent_atoms = _.cloneDeep(this.container_reagent[0][1])

        const proton = AtomFactory("H", 0)
        proton.pop()

        proton.length.should.be.equal(5)
        proton[0].should.be.equal('H')

        const free_electrons = CAtom(this.container_reagent[0][1][atom_nucleophile_index], atom_nucleophile_index, this.container_reagent).freeElectrons()
        free_electrons.length.should.be.greaterThan(1)

        proton.push(free_electrons[0])
        proton.push(free_electrons[1])


        this.container_reagent[0][1][atom_nucleophile_index][4] =
            this.container_reagent[0][1][atom_nucleophile_index][4] === "-"
            || this.container_reagent[0][1][atom_nucleophile_index][4] < 0 ?0:"+"

        this.container_reagent[0][1].push(proton)

        this.container_reagent[0][1][atom_nucleophile_index][4] = 0

        this.container_reagent[0][1].length.should.not.equal(reagent_atoms.length)

        this.setReagentAI()


    }

    deprotonateNonHydroxylOxygen() {


        const oxygen_index = this.MoleculeAI.findNonWaterOxygenIndex()


        oxygen_index.should.not.be.equal(-1)

        if (oxygen_index === -1) {
            return false
        }

        this.container_substrate[0][1][oxygen_index][0].should.be.equal("O")
        const oxygen_proton_bond = CAtom(this.container_substrate[0][1][oxygen_index],
            oxygen_index,
            this.container_substrate).indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        }).pop()

        this.container_substrate[0][1][oxygen_index][4] = 0
        this.container_substrate[0][1].splice(oxygen_proton_bond.atom_index, 1)
        // this.container_substrate[0][1].splice(hydrogen_bond.atom_index, 1)


        this.addProtonToReagent()

        this.setMoleculeAI()
        this.setReagentAI()


    }

    removeProtonFromWater() {

        const water_oxygen_index = this.MoleculeAI.findWaterOxygenIndex()
        water_oxygen_index.should.be.greaterThan(-1)

        this.container_substrate[0][1][water_oxygen_index][0].should.be.equal("O")
        const oxygen_proton_bond = CAtom(this.container_substrate[0][1][water_oxygen_index],
            water_oxygen_index,
            this.container_substrate).indexedBonds("").filter((bond)=>{
            return bond.atom[0] === "H"
        }).pop()

        this.container_substrate[0][1][water_oxygen_index][4] = 0

        const shared_electrons = oxygen_proton_bond.shared_electrons

        // Remove proton from substrate
        _.remove(this.container_substrate[0][1], (v, i)=>{
            return i === oxygen_proton_bond.atom_index
        })

        this.setMoleculeAI()

        this.addProtonToReagent()
        this.setReagentAI()


    }

    addProtonFromReagentToHydroxylGroup() {

        const proton_index = this.ReagentAI.findProtonIndex()

        proton_index.should.be.greaterThan(-1)
        const reagent_atoms = _.cloneDeep(this.container_reagent[0][1])
        this.removeProtonFromReagent(proton_index)
        this.container_reagent[0][1].length.should.not.equal(reagent_atoms.length)
        const hydroxylOxygenIndex = this.MoleculeAI.findHydroxylOxygenIndex()

        this.container_substrate[0][1][hydroxylOxygenIndex][0].should.be.equal("O")
        const substrate_atoms = _.cloneDeep(this.container_substrate[0][1])
        this.addProtonToSubstrate(this.container_substrate[0][1][hydroxylOxygenIndex], hydroxylOxygenIndex) // changes this.container_substrate

        this.container_substrate[0][1].length.should.not.equal(substrate_atoms.length)

        this.setMoleculeAI()

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

    breakCarbonOxygenDoubleBond() {

        const oxygen_index = this.MoleculeAI.findOxygenOnDoubleBondIndex()
        const oxygen_atom = CAtom(this.container_substrate[0][1][oxygen_index], oxygen_index, this.container_substrate)
        const double_bonds = oxygen_atom.indexedDoubleBonds("")

        const shared_electrons = _.cloneDeep(double_bonds[0].shared_electrons).slice(0,2)

        // Remove double bond
        // Remove electrons from C
        _.remove(this.container_substrate[0][1][double_bonds[0].atom_index], (v)=>{
            return v === shared_electrons[0] || v === shared_electrons[1]
        })

        this.container_substrate[0][1][double_bonds[0].atom_index][4] = "+"
        this.container_substrate[0][1][oxygen_index][4] = this.container_substrate[0][1][oxygen_index][4] === "+" ? "":"-"

        this.setMoleculeAI()

    }

    breakCarbonDoubleBond() {

        // @see Organic Chemistry 8th edition p245
        // Get index of double bond carbon bonded to the most hydrogens
        let atom_nucleophile_index = this.MoleculeAI.findLeastSubstitutedCarbonPiBondIndex()

        if (atom_nucleophile_index === -1) {
            return false
        }
        atom_nucleophile_index.should.be.an.Number()
        atom_nucleophile_index.should.be.greaterThan(-1)

        const atoms = _.cloneDeep(this.container_substrate[0][1])

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
        free_electrons.length.should.be.greaterThan(1)

        let electrophile_index = null
        let charge = null

        if (this.container_reagent !== null) {
            electrophile_index = this.ReagentAI.findElectrophileIndex("")
            this.container_reagent[0][1][electrophile_index].push(free_electrons[0])
            this.container_reagent[0][1][electrophile_index].push(free_electrons[1])
            // @todo
            charge = this.container_reagent[0][1][electrophile_index][0] === "Hg"?"&+":"+"
            this.container_reagent[0][1][electrophile_index][4] =
                this.container_reagent[0][1][electrophile_index][4] === "-"
                || this.container_reagent[0][1][electrophile_index][4] < 0? 0: charge
            _.cloneDeep(this.container_reagent[0][1]).map((reagent_atom)=>{
                this.container_substrate[0][1].push(reagent_atom)
            })
        } else {
            electrophile_index = this.MoleculeAI.findElectrophileIndex("")
            this.container_substrate[0][1][electrophile_index].push(free_electrons[0])
            this.container_substrate[0][1][electrophile_index].push(free_electrons[1])
            this.container_substrate[0][1].push(this.container_substrate[0][1][electrophile_index])
            // @todo
            charge = this.container_substrate[0][1][electrophile_index][0] === "Hg"?"&+":"+"
            this.container_substrate[0][1][electrophile_index][4] =
                this.container_substrate[0][1][electrophile_index][4] === "-"
                || this.container_substrate[0][1][electrophile_index][4] < 0? 0: charge
        }

        // Set charge on the former double bonded carbon
        this.container_substrate[0][1][double_bonds[0].atom_index][4] =
            this.container_substrate[0][1][double_bonds[0].atom_index][4] === "-"
            || this.container_substrate[0][1][double_bonds[0].atom_index][4] < 0? 0: charge

        this.container_substrate[0][1].length.should.not.equal(atoms.length)

        this.setMoleculeAI()
        this.setReagentAI()

    }



}

module.exports = Reaction

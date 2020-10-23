
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

    hydrate() {
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
        const electrophile_index = this.MoleculeAI.findElectrophileIndex()

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


        // Check we do not have a water molecule attached to main molecule
        this.MoleculeAI.findWaterOxygenIndex().should.be.equal(-1)

        this.setMoleculeAI()



    }
    
    breakBond(break_type="heterolysis") {


        const electrophile_index = this.MoleculeAI.findElectrophileIndex()

        if (electrophile_index === -1) {
            console.log("Electrophile not found")
            console.log("breakBond()")
            return false
        }

        //const atoms = this.container_substrate[0][1]
        const electrophile_atom_object = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)
        const electrophile_atom_object_bonds = electrophile_atom_object.indexedBonds("").filter(
            (bond)=>{
                return bond.atom[0] !== "H"
            }
        )
        let nucleophile_index = null
        if(electrophile_atom_object_bonds.length===1){
            nucleophile_index = electrophile_atom_object_bonds[0].atom_index
        }
        const carbon_bonds = electrophile_atom_object_bonds.filter((bond)=>{
            return bond.atom[0] === "C"
        })
        if (carbon_bonds.length !== electrophile_atom_object_bonds.length) {
            // @todo
        } else {
            // Get the most substituted carbon
            carbon_bonds.sort((bond_a,bond_b)=>{
                const a_atom = CAtom(this.container_substrate[0][1][bond_a.atom_index], bond_a.atom_index, this.container_substrate)
                const b_atom = CAtom(this.container_substrate[0][1][bond_b.atom_index], bond_b.atom_index, this.container_substrate)
                const a_hydrogens = a_atom.indexedBonds("").filter(
                    (bond)=>{
                        return bond.atom[0] === "H"
                    }
                )
                const b_hydrogens = b_atom.indexedBonds("").filter(
                    (bond)=>{
                        return bond.atom[0] === "H"
                    }
                )
                return a_hydrogens.length < b_hydrogens.length? -1: 0
            })
            nucleophile_index = carbon_bonds[0].atom_index
        }


        if (nucleophile_index === -1) {
            console.log("Nucleophile not found")
            console.log("breakBond()")
            return false
        }


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
        if (break_type==="heterolysis") {

            // Remove shared electrons from nucleophile
            const electrons = _.cloneDeep(this.container_substrate[0][1][nucleophile_index]).slice(5)
            _.remove(this.container_substrate[0][1][nucleophile_index], (v, i)=> {
                return shared_electrons[0] === v || shared_electrons[1] === v
            })
            this.container_substrate[0][1][nucleophile_index].slice(5).length.should.not.be.equal(electrons.length)

            // nucleophile should now be positively charged
            // electrophile should be negatively charged
            if (this.container_substrate[0][1][nucleophile_index][4] === "-") {
                this.container_substrate[0][1][nucleophile_index][4] = 0
            } else {
                this.container_substrate[0][1][nucleophile_index][4] = "+"
            }

            if (this.container_substrate[0][1][electrophile_index][4] === "+") {
                this.container_substrate[0][1][electrophile_index][4] = 0
            } else {
                this.container_substrate[0][1][electrophile_index][4] = "-"
            }

            Set().intersection(this.container_substrate[0][1][nucleophile_index].slice(5), this.container_substrate[0][1][electrophile_index].slice(5)).length.should.be.equal(0)


        } else {
            // Remove electron from source atom
            _.remove(this.container_substrate[0][1][nucleophile_index], (v, i)=> {
                return shared_electrons[0] === v
            })

            // Remove electron from target atom
            _.remove(this.container_substrate[0][1][electrophile_index], (v, i)=> {
                return shared_electrons[1] === v
            })

        }



        this.setMoleculeAI()
        
        
        // @todo work out if we now have two molecules

            
        
    }
    
    bondAtoms() {

        const electrophile_index = this.MoleculeAI.findElectrophileIndex()


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
            const nucleophile_free_electrons = CAtom(this.container_substrate[0][1][nucleophile_index], nucleophile_index, this.container_substrate).freeElectrons()

            if (nucleophile_free_electrons.length < 2) {
                console.log("bondAtoms() nucleopile has no free electrons")
                return false
            }

            this.container_substrate[0][1][electrophile_index].push(nucleophile_free_electrons[0])
            this.container_substrate[0][1][electrophile_index].push(nucleophile_free_electrons[1])
            this.container_substrate[0][1][electrophile_index][4] = 0

            /*
            _.remove(this.container_substrate[0][1][nucleophile_index], (electron)=>{
                return electron === nucleophile_free_electrons[0] || electron === nucleophile_free_electrons[1]
            })
            */

            this.container_substrate[0][1][nucleophile_index][4] = this.container_substrate[0][1][nucleophile_index][4] === "-"?0:"+"

            Set().intersection(this.container_substrate[0][1][electrophile_index].slice(5),
                this.container_substrate[0][1][nucleophile_index].slice(5)).length.should.be.equal(2)


        } else {


            const nucleophile_index = this.ReagentAI.findNucleophileIndex()
            if (nucleophile_index === -1) {
                console.log("bondAtoms() no nucleophile found (2)")
                return false
            }

//            const electrophile_free_electrons = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate).freeElectrons()
            const nucleophile_free_electrons = CAtom(this.container_reagent[0][1][nucleophile_index], nucleophile_index, this.container_reagent).freeElectrons()

            if (nucleophile_free_electrons.length < 2) {
                console.log("bondAtoms() nucleopile has no free electrons 2")
                return false
            }

            this.container_substrate[0][1][electrophile_index].push(nucleophile_free_electrons[0])
            this.container_substrate[0][1][electrophile_index].push(nucleophile_free_electrons[1])
            this.container_substrate[0][1][electrophile_index][4] = this.container_substrate[0][1][electrophile_index][4]==="+"?0:"-"

            this.container_reagent[0][1].map(
                (atom)=>{
                    this.container_substrate[0][1].push(atom)
                    return atom
                }
            )

            this.container_reagent[0][1][nucleophile_index][4] = "+"

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

        if (electrophile_index === -1) {
            console.log("Electrophile not found")
            console.log("deprotonate")
            console.log(this.rule.mechanism)
            return false
        }

        const electrophile = CAtom(this.container_substrate[0][1][electrophile_index], electrophile_index, this.container_substrate)
        const electrophile_bonds  = electrophile.indexedBonds("")

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

        // Check
        const o_index = _.findIndex(this.container_substrate[0][1], (a)=>{
            return a[0] === 'O'
        })
        CAtom(this.container_substrate[0][1][o_index], o_index, this.container_substrate).indexedBonds("").filter(
            (bond)=>{
                return bond.atom[0]==="H"
            }
        ).length.should.be.equal(1)

        this.setMoleculeAI()

        this.addProtonToReagent()
        this.setReagentAI()


    }

    addProtonFromReagentToHydroxylGroup() {

        console.log('Reaction.js deprotonateNonHydroxylOxygen')
        console.log(VMolecule(this.container_reagent).compressed())


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


        const nucleophile_index = this.ReagentAI.findNucleophileIndex()


        let proton_index = -1
        if (nucleophile_index !== -1) {
            proton_index = CAtom(this.container_reagent[0][1][nucleophile_index], nucleophile_index, this.container_reagent).indexedBonds("").filter((bond)=>{
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


}

module.exports = Reaction

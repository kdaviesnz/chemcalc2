const Set = require('./Set')
const CAtom = require('../Controllers/Atom')

const Families = (mmolecule) => {

    mmolecule.length.should.be.equal(2) // molecule, units
    mmolecule[0].length.should.be.equal(2) // pKa, atoms
    mmolecule[0][1].should.be.an.Array()

    const fg_atoms = mmolecule[0][1]

    // https://www.masterorganicchemistry.com/2010/06/18/know-your-pkas/
    // atoms
    //[[ atomic symbol, proton count, valence count,  number of bonds, velectron1, velectron2, velectron3 ]]

    const __lonePairs = (atom, current_atom_index) => {
        const atom_electrons = atom.slice(5)
        return atom_electrons.filter(
            (atom_electron) => {                
                return atoms.filter(
                    (_atom, _atom_index) => {
                        if (current_atom_index === _atom_index) {
                            return true
                        }
                        const _atom_electrons = _atom.slice(5)
                        return _atom_electrons.indexOf(atom_electron) > -1
                    }
                ).length === 1
                         
            }
        ) 
    }
    
    const __alcoholGroupBonds = (atom, current_atom_index) => {
        const atom_electrons = atom.slice(5)
        return fg_atoms.map(
            (_atom, _atom_index) => {
                
                if (_atom[0] !== "O" || current_atom_index === _atom_index) {
                    return false
                }
                
                if (__hydrogenBonds(_atom, _atom_index).length !== 1
                   || __lonePairs(_atom, _atom_index).length !==2 )  {
                    return false
                }

                    return [
                        _atom_index,
                        _atom
                    ]
               
                return false
            }
        )  
    }

    const __Bonds = (atom, current_atom_index, atomic_symbol, bond_type) => {
        const atom_electrons = atom.slice(5)
        const r =  fg_atoms.map(
            (_atom, _atom_index) => {

                if (_atom[0] !== atomic_symbol || current_atom_index === _atom_index) {
                    return false
                }


                const shared_electrons = Set().intersection(atom_electrons, _atom.slice(5))

                if (  shared_electrons.length === bond_type ) {
                    return [
                        _atom_index,
                        _atom
                    ]
                }
                return false
            }
        ).filter(
            (item) => {
                return item !== false
            }
        )

        return r
    }

    const __carbonBonds = (atom, atom_index) => {
        const b =  __Bonds(atom, atom_index, "C", 2)
        return b

    }
    
    const __hydrogenBonds = (atom, atom_index) => {
        return __Bonds(atom,  atom_index, "H", 2)
    }
    
    const __hasAtom = (atomic_symbol) => {
        if (fg_atoms.filter(
            (atom) => {
                return atom[0] === atomic_symbol
            }
        ).length === 0) {
            return false
        }
        return true
    }

    const __singleOxygenBonds = (atom, current_atom_inde) => {
        return __Bonds(atom, current_atom_index, "O", 1)
    }

    const __methylGroupBonds = (atom, current_atom_index) => {
        const atom_electrons = atom.slice(5)
        return fg_atoms.map(
            (_atom, _atom_index) => {

                if (_atom[0] !== "C" || current_atom_index === _atom_index) {
                    return false
                }

                if (__hydrogenBonds(__atom, _atom_index).length !== 3) {
                    return false
                }

                const shared_electrons = Set().intersection(atom_electrons, _atom.slice(5))
                if (  shared_electrons.length === 1 ) {
                    return [
                        _atom_index,
                        _atom
                    ]
                }
                return false
            }
        )

    }

    const __doubleCarbonBonds = (atom, current_atom_index) => {
        return __Bonds(atom, current_atom_index, "C", 4)
    }
    
    const __carbonToAtomDoubleBondCallback = (atomic_symbol) => {

        return (atom, atom_index) => {
            if (atom[0] === atomic_symbol) {
                // Determine if there is a double bond
                // Double bond if we have two electrons linking to the same carbon
                return atoms.filter(
                    (_atom, carbon_atom_index) => {
                        if (_atom[0] === "C") {
                            const carbon_electrons = _atom.slice(5)
                            // Get intersection of carbon electrons and atom electrons. If count
                            // is 2 then we have a double bond
                            if (Set().intersection(carbon_electrons, atom.slice(4)).length === 2) {
                                // return indexed carbon and atom
                                return {
                                    carbon_atom_index: _atom[0],
                                    atom_index: atom[0]
                                }
                            }
                        }
                        return false
                    }
                )
            }
            return false
        }

    }

    const amide = () => {

        // If no nitrogen atom return false
        if (!__hasAtom("N")) {
            return []
        }

        /*
        In organic chemistry, an amide, also known as an organic amide or a carboxamide, is a compound with the general formula RC(=O)NR′R″
         */
        return ketone()

    }



    const amine = () => {
        
        // In organic chemistry, amines are compounds and functional groups that contain a basic nitrogen atom with a lone pair.


        // If no nitrogen atom with a lone pair return false
        return fg_atoms.map(
            (atom, atom_index) => {
                if (atom[0] === "N" && __lonePairs(atom, atom_index).length === 1){
                    return {
                        atom_index: atom
                    }
                }
                return false
            }
        ).filter((item) => {
            return item !== false
        })
        
               
    }

    const primaryAmine = () => {
        const amine_groups = amine()
        if (amine_groups.length ===  0) {
            return []
        }
        return amine_groups.filter(
            (amine_group) => {
                const props = amine_group.props()
                const atom = amine_group[props[1]]
                return __hydrogenBonds(atom, props[0]).length === 2
            }
        )
    }

    const secondaryAmine = () => {
        const amine_groups = amine()
        if (amine_groups.length ===  0) {
            return []
        }
        return amine_groups.filter(
            (amine_group) => {
                const props = amine_group.props()
                const atom = amine_group[props[1]]
                return __hydrogenBonds(atom, props[0]).length === 1
            }
        )
    }


    const tertiaryAmine = () => {
        const amine_groups = amine()

        if (amine_groups.length ===  0) {
            return []
        }
        return amine_groups.filter(
            (amine_group) => {
                const props = amine_group.props()
                const atom = amine_group[props[1]]
                return __hydrogenBonds(atom,props[0] ).length === 0
            }
        )
    }



    // Returns bool
    const alcohol = () => {

        // @todo
        /*
        if (glycol()){
            return []
        }
        */
        // Alcohol, any of a class of organic compounds characterized by one or more hydroxyl (―OH) groups attached to a carbon atom of an alkyl group (hydrocarbon chain).
        // Look for oxygen atom
        const atoms = mmolecule[0][1]
        return atoms.filter((oxygen_atom, oxygen_atom_index)=>{

            // Not an oxygen atom
            if (oxygen_atom[0] !== "O") {
                return false
            }

            // Not -OH
            const oxygen_atom_object = CAtom(oxygen_atom, oxygen_atom_index, mmolecule)
            if(oxygen_atom_object.bondCount()!==2) { // 1 hydrogen bond plus 1 carbon atom
                return false
            }

            const indexed_bonds = oxygen_atom_object.indexedBonds("")

            // Check we have 1 hydrogen attached to the oxygen atom
            if (indexed_bonds.filter((bond) => {
                    if (bond.atom[0] !== "H") {
                        return false
                    }
                    const hydrogen_atom = CAtom(bond.atom, bond.atom_index, mmolecule)
                    if (hydrogen_atom.bondCount() !== 1) {
                        return false
                    }
                    return true
                }
            ).length !== 1) {
                return false
            }



            // Check we have 1 carbon attached to the oxygen atom
            if (indexed_bonds.filter((bond) => {
                    return bond.atom[0] === "C"
                }
            ).length !== 1) {
                return false
            }

            return true

        }).length !== 0



    }



    const alkene = (verbose) => {
        
        return mmolecule[0][1].filter((carbon_atom, carbon_atom_index)=>{

            if (carbon_atom[0] !== "C") {
                return false
            }

            const carbon_atom_object = CAtom(carbon_atom, carbon_atom_index, mmolecule)

            if (carbon_atom_object.doubleBondCount() !== 1) {
                return false
            }

            const double_bonds = carbon_atom_object.indexedDoubleBonds("")
            if (double_bonds.length !==1 || double_bonds[0].atom[0] !== "C") {
                return false
            }

            return true

        }).length > 0

    }




    const terminalAlkene = () => {
        const alkene_groups = alkene()
        // Look for alkene groups where carbon atom has a hydrogen
        return alkene_groups.filter(
            (alkene_group) => {
                const props = alkene_group.props()
                const first_carbon_atom = alkene_group[props[0]]     
                const second_carbon_atom = alkene_group[props[1]]
                return __hydrogenBonds(first_carbon_atom, props[1]).length > 0 ||
                    __hydrogenBonds(second_carbon_atom, props[1]).length > 0
            }
        )     
        
    }

    /*
    const __functionalGroups = {
        "ketone": ketone(),
        "tertiary_amine": tertiaryAmine(),
        "secondary_amine": secondaryAmine(),
        "primary_amine": primaryAmine(),
        "amide": amide(),
        "epoxide": epoxide(),
        "ester": ester(),
        "glycol": glycol(),
        "alcohol": alcohol(),
        "aldehyde": aldehyde(),
        "methyl_ketone": methylKetone(),
        "terminal_alkene": terminalAlkene(),
        "alkene": alkene(),
        "hydrochloric_acid": hydrochloric_acid(),
        "deprotonated_hydrochloric_acid": deprotonated_hydrochloric_acid(),
        "water": water(),
        "protonated_water": protonated_water()
    }
    */



    const families = {
        "double_bonds": __doubleCarbonBonds,
        "alkene": alkene,
        "alcohol": alcohol
    }

    const families_as_array = () => {
        const arr = []
        if (alkene()) {
            arr.push("alkene")
        }
        if (alcohol()) {
            arr.push("alcohol")
        }

        return arr

    }



    return {
        families: families,
        families_as_array: families_as_array
    }


}

module.exports = Families












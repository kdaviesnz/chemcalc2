const Set = require('./Set')
const Families = (fg_atoms) => {


    // https://www.masterorganicchemistry.com/2010/06/18/know-your-pkas/
    // atoms
    //[[ atomic symbol, proton count, valence count,  number of bonds, velectron1, velectron2, velectron3 ]]

    const __lonePairs = (atom, current_atom_index) => {
        const atom_electrons = atom.slice(4)
        return atom_electrons.filter(
            (atom_electron) => {                
                return atoms.filter(
                    (_atom, _atom_index) => {
                        if (current_atom_index === _atom_index) {
                            return true
                        }
                        const _atom_electrons = _atom.slice(4)
                        return _atom_electrons.indexOf(atom_electron) > -1
                    }
                ).length === 1
                         
            }
        ) 
    }
    
    const __alcoholGroupBonds = (atom, current_atom_index) => {
        const atom_electrons = atom.slice(4)
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
        const atom_electrons = atom.slice(4)
        const r =  fg_atoms.map(
            (_atom, _atom_index) => {

                if (_atom[0] !== atomic_symbol || current_atom_index === _atom_index) {
                    return false
                }


                const shared_electrons = Set().intersection(atom_electrons, _atom.slice(4))

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
        const atom_electrons = atom.slice(4)
        return fg_atoms.map(
            (_atom, _atom_index) => {

                if (_atom[0] !== "C" || current_atom_index === _atom_index) {
                    return false
                }

                if (__hydrogenBonds(__atom, _atom_index).length !== 3) {
                    return false
                }

                const shared_electrons = Set().intersection(atom_electrons, _atom.slice(4))
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
                            const carbon_electrons = _atom.slice(4)
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



    const alcohol = () => {

        if (glycol()){
            return []
        }
        
        // Look for oxygen atom with 1 hydrogen bond, 1 carbon bond, and 2 lone pairs
        return fg_atoms.map(
            (atom, atom_index) => {
                const carbon_bonds = __carbonBonds(atom, atom_index)
                if (atom[0] === "O" 
                    && __lonePairs(atom,atom_index ).length === 2
                    && __hydrogenBonds(atom, atom_index).length === 1
                    && carbon_bonds.length === 1
                   ){
                    const carbon_atom_index = carbon_bonds[0][0]
                    return {
                        atom_index: atom,
                        carbon_bonds_index: carbon_bonds[0][1]
                    }
                }
            }
        ).filter((item) => {
            return item !== false
        })
    }



    const alkene = () => {
        
        // Look for carbon carbon double bonds
        return fg_atoms.map(
            (atom, carbon_atom_index) => {
                const carbon_double_bonds = __doubleCarbonBonds(atom, carbon_atom_index)
                if (atom[0] === "C" && carbon_double_bonds.length === 1){
                        const bonded_carbon_index = carbon_double_bonds[0][0]
                        const ret = {}
                        ret[carbon_atom_index] = atom
                        ret[bonded_carbon_index] = carbon_double_bonds[0][1]
                        return ret
                }
                return false
            }
        ).filter((item) => {
            return item !== false
        })
        
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
    }




    return {
        families: families,
    }

}

module.exports = Families












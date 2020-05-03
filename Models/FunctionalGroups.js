const Set = require('./Set')
const FunctionalGroups = (atoms) => {

    // https://www.masterorganicchemistry.com/2010/06/18/know-your-pkas/

    // atoms
    //[[ atomic symbol, proton count, valence count,  number of bonds, velectron1, velectron2, velectron3 ]]
    
    const __lonePairs = (atom, current_atom_index) => {
        const atom_electrons = atom.splice(4)
        return atom_electrons.filter(
            (atom_electron) => {                
                return (atoms.filter(
                    (_atom, _atom_index) => {
                        if (current_atom_index === _atom_index) {
                            return false
                        }
                        const _atom_electrons = _atom.splice(4)
                        return _atom_electrons.indexOf(atom_electron) > -1
                    }
                ).length === 0
                         
            }
        ) 
    }
    
    
    const __Bonds = (atom, current_atom_index, atomic_symbol) => {
        const atom_electrons = atom.splice(4)
        return atoms.map(
            (_atom, _atom_index) => {
                
                if (_atom[0] !== atomic_symbol || current_atom_index === _atom_index) {
                    return false
                }
                    
                const shared_electrons = Set().intersection(atom_electrons, _atom.splice(4)
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

    const __carbonBonds = (atom, atom_index) => {
        return __Bonds = (atom, atom_index, "C")      
    }
    
    const __hydrogenBonds = (atom, atom_index) => {
        return __Bonds = (atom,  atom_index, "H")      
    }
    
    const __hasAtom = (atomic_symbol) => {
        if (atoms.filter(
            (atom) => {
                return atom[0] === atomic_symbol
            }
        ).length === 0) {
            return false
        }
    }
    
    const __carbonToAtomDoubleBondCallback = (atomic_symbol) => {

        return (atom, atom_index) => {
            if (atom[0] === atomic_symbol) {
                // Determine if there is a double bond
                // Double bond if we have two electrons linking to the same carbon
                return atoms.filter(
                    (_atom, carbon_atom_index) => {
                        if (_atom[0] === "C") {
                            const carbon_electrons = _atom.splice(4)
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
    
    const water = () => {

        return atoms.map(
            (atom, atom_index) => {
                const carbon_bonds = __carbonBonds(atom)
                if (atom[0] === "O" 
                   
                    && __hydrogenBonds(atom).length === 2
                    
                   ){
                    
                    return {
                        atom_index: atom,
                        
                    }
                }
            }
        ).filter((item) => {
            return item !== false
        })    

    }

    const protonated_water = () => {

        return atoms.map(
            (atom, atom_index) => {
                const carbon_bonds = __carbonBonds(atom)
                if (atom[0] === "O" 
                   
                    && __hydrogenBonds(atom).length === 3
                    
                   ){
                    
                    return {
                        atom_index: atom,
                        
                    }
                }
            }
        ).filter((item) => {
            return item !== false
        })    

    }
    
    const hydrochloric_acid = () => {

        // If no chlorine atom then not hydrochloricacid
        if (!__hasAtom("Cl")) {
            return false
        }
        
        // If no hydrogen atom then not hydrochloricacid
        if (!__hasAtom("H")) {
            return false
        }
        
        if (atoms.length !==2) {
            return false
        }
        
        return [
            atoms
         ]

    }
    
    const deprotonated_hydrochloric_acid = () => {

        // If no chlorine atom then not hydrochloricacid
        if (!__hasAtom("Cl")) {
            return false
        }       
          
        if (atoms.length !==1) {
            return false
        }
        
        return [
            atoms
         ]

    }
    
    const ketone = () => {

        // If no oxygen atom then not ketone
        if (!__hasAtom("O")) {
            return false
        }
            
        // If carbon double bond on oxygen then not ketone
        return atoms.map(
            __carbonToAtomDoubleBondCallback ("O")
        ).filter(
            (item) => {
                return item !== false
            }
        )

    }

    const amide = () => {

        // If no nitrogen atom return false
        if (!__hasAtom("N")) {
            return false
        }

        /*
        In organic chemistry, an amide, also known as an organic amide or a carboxamide, is a compound with the general formula RC(=O)NR′R″
         */
        return ketone()

    }

    const glycol = () => {

        /*
        Glycol, any of a class of organic compounds belonging to the alcohol family; in the molecule of a glycol, two hydroxyl (―OH) groups are attached to different carbon atoms. The term is often applied to the simplest member of the class, ethylene glycol.
         */
        // If there isn't at least 2 OH groups then not glycol
        if (atoms.filter(
            (atom) => {
                return atom[0] === "O"
            }
        ).length < 2) {
            return false
        }

        // Next take each group and see if it is connected to a CC(O) group.
        atoms.map(
            (atom, oxygen_atom_index) => {
                if (atom[0] === 'O') {
                    const carbon_bonds = __carbonBonds(atom)
                    if (__hydrogenBonds(atom).length === 3 &&  carbon_bonds.length) { // 3 hydrogens, 1 carbon
                        const carbon_atom_index = carbon_bonds[0][0]
                        const carbon_atom = carbon_bonds[0][1] // first element is index of atom
                        // Now check of carbon atom has a carbon atom with OH group attached.
                        const carbon_carbon_bonds = _carbonBonds(carbon_atom)
                        if (carbon_carbon_bonds.length > 0) {
                            return carbon_carbon_bonds.map(
                                (_child_carbon_atom, _child_carbon_atom_index) => {
                                    if (_alcoholGroupBonds(_child_carbon_atom).length > 0) {
                                        const child_oxygen_atom_index = _alcoholGroupBonds[0][0]
                                        const child_oxygen_atom = _alcoholGroupBonds[0][1]
                                        return {
                                            oxygen_atom_index: atom,
                                            carbon_bonds[0][0]:carbon_atom,
                                            _child_carbon_atom_index: _child_carbon_atom,
                                            child_oxygen_atom_index: child_oxygen_atom
                                        }
                                    }
                                    return false
                                }
                            )
                        }
                        return false
                    }
                    return false
                }
            }
        )       
    }

    const amine = () => {
        
        // In organic chemistry, amines are compounds and functional groups that contain a basic nitrogen atom with a lone pair.
        
        // If no nitrogen atom with a lone pair return false
        return atoms.map(
            (atom, atom_index) => {
                if (atom[0] === "N" && __lonePairs(atom).length === 1){
                    return {
                        atom_index: atom
                    }
                }
            }
        ).filter((item) => {
            return item !== false
        })
        
               
    }

    const primaryAmine = () => {
        const amine_groups = amine()
        if (amine_groups.length ===  0) {
            return false
        }
        return amine_groups.filter(
            (amine_group) => {
                const props = amine_group.props()
                const atom = amine_group[props[0]]
                return __hydrogenBonds(atom).length === 2
            }
        )
    }

    const secondaryAmine = () => {
        const amine_groups = amine()
        if (amine_groups.length ===  0) {
            return false
        }
        return amine_groups.filter(
            (amine_group) => {
                const props = amine_group.props()
                const atom = amine_group[props[0]]
                return __hydrogenBonds(atom).length === 1
            }
        )
    }


    const tertiaryAmine = () => {
        const amine_groups = amine()
        if (amine_groups.length ===  0) {
            return false
        }
        return amine_groups.filter(
            (amine_group) => {
                const props = amine_group.props()
                const atom = amine_group[props[0]]
                return __hydrogenBonds(atom).length === 0
            }
        )
    }


    const epoxide = () => {

        /*
        An epoxide is a cyclic ether with a three-atom ring (OCC). This ring approximates an equilateral triangle, which makes it strained, and hence highly reactive, more so than other ethers
         */
        return atoms.map(
            (atom, oxygen_atom_index) => {
                const carbon_bonds = _carbonBonds(atom)
                if (atom[0] === "O" && carbon_bonds(atom).length === 2){
                    // Verify that the carbon atoms are bonded to each other and the oxygen
                    if (__atomsAreBonded(carbon_bonds[0][1], carbon_bonds[1][1]) &&
                    __atomsAreBonded(atom, carbon_bonds[0][1]) && __atomsAreBonded(atom, carbon_bonds[1][1])) {
                        const first_carbon_atom_index = carbon_bonds[0][0]
                        const second_carbon_atom_index = carbon_bonds[1][0]
                        return {
                            oxygen_atom_index: atom,
                            first_carbon_atom_index: carbon_bonds[0][1],
                            second_carbon_atom_index: carbon_bonds[1][1]
                        }
                    }
                }
            }
        ).filter((item) => {
            return item !== false
        })

    }


    const alcohol = () => {

        if (glycol()){
            return false
        }
        
        // Look for oxygen atom with 1 hydrogen bond, 1 carbon bond, and 2 lone pairs
        return atoms.map(
            (atom, atom_index) => {
                const carbon_bonds = __carbonBonds(atom)
                if (atom[0] === "O" 
                    && __lonePairs(atom).length === 2
                    && __hydrogenBonds(atom).length === 1
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

    const aldehyde = () => {
        
        // An aldehyde is a compound containing a functional group with the structure −CHO,
        // consisting of a carbonyl center with the carbon atom also bonded to hydrogen and to an R group, which is any generic alkyl or side chain.                       
        const ketone_groups = ketone()
        if (ketone_groups.length === 0) {
            return false
        }
        
        // Look for ketone groups where carbon atom has at least 1 hydrogen atom 
        return ketone_groups.filter(
            (ketone_group) => {
                const props = ketone_group.props()
                const carbon_atom = ketone_group[props[1]]
                return __hydrogenBonds(carbon_atom).length > 0
            }
        )       
        
    }

    const ester = () => {
        
        // In chemistry, an ester is a chemical compound derived from an acid (organic or inorganic) 
        // in which at least one –OH (hydroxyl) group is replaced by an –O–alkyl (alkoxy) group
        const k = ketone()
        const ketone_groups = ketone()
        if (ketone_groups.length === 0) {
            return false
        }

        // Look for ketone groups where carbon atom has at least 1 single bonded oxygen atom 
        return ketone_groups.filter(
            (ketone_group) => {
                const props = ketone_group.props()
                const carbon_atom = ketone_group[props[1]]
                return __singleOxygenBonds(carbon_atom).length > 0
            }
        )     

    }

    const methylKetone = () => {
        // CC(=O)CC1=CC2=C(C=C1)OCO2
        const k = ketone()
        const ketone_groups = ketone()
        if (ketone_groups.length === 0) {
            return false
        }

        // Look for ketone groups where carbon atom has methyl group 
        return ketone_groups.filter(
            (ketone_group) => {
                const props = ketone_group.props()
                const carbon_atom = ketone_group[props[1]]               
                return __methylGroupBonds(carbon_atom).length > 0
            }
        )     
    }

    const alkene = () => {
        
        // Look for carbon carbon double bonds
        return atoms.map(
            (atom, carbon_atom_index) => {
                const carbon_double_bonds = _doubleCarbonBonds(atom)
                if (atom[0] === "C" && carbon_double_bonds.length === 1){
                        const bonded_carbon_index = carbon_double_bonds[0][0]
                        return {
                            carbon_atom_index: atom,
                            bonded_carbon_index: carbon_double_bonds[0][1]                       
                        }                 
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
                return __hydrogenBonds(first_carbon_atom).length > 0 ||
                    __hydrogenBonds(second_carbon_atom).length > 0
            }
        )     
        
    }

    
    const functionalGroups = {
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
        "alkene": alkene()
        "hydrochloric_acid": hydrochloric_acid(),
        "deprotonated_hydrochloric_acid": deprotonated_hydrochloric_acid(),
        "water": water(),
        "protonated_water": protonated_water()
    }

    const functionalGroupsList = () => {
        return [
            functionalGroups.tertiary_amine ? "tertiary amine" : false,
            functionalGroups.secondary_amine ? "secondary amine" : false,
            functionalGroups.primary_amine ? "primary amine" : false,
            functionalGroups.amide ? "amide" : false,
            functionalGroups.epoxide ? "epoxide" : false,
            functionalGroups.ester ? "ester" : false,
            functionalGroups.glycol ? "glycol" : false,
            functionalGroups.alcohol ? "alcohol" : false,
            functionalGroups.aldehyde ? "aldehyde" : false,
            functionalGroups.ketone ? "ketone" : false,
            functionalGroups.methyl_ketone? "methyl ketone" : false,
            functionalGroups.terminal_alkene? "terminal alkene" : false,
            functionalGroups.alkene? "alkene" : false
        ].filter(
            (item) => {
                return item !== false
            }
        )

    }


    return {
        functionalGroups: functionalGroups,
        functionalGroupsList: functionalGroupsList

    }

}

module.exports = FunctionalGroups












const Set = require('./Set')
const FunctionalGroups = (atoms) => {

    // https://www.masterorganicchemistry.com/2010/06/18/know-your-pkas/

    // atoms
    //[[ atomic symbol, proton count, valence count,  number of bonds, velectron1, velectron2, velectron3 ]]


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
        const k = ketone()
        return k[1] === "" || k[2] == "" ? k : false
    }

    const ester = () => {

        const k = ketone()
        if (k===false) {
            return false
        }

        //if (k[0].indexOf("O") !== 0 && (k[2].indexOf("O") ===-1 || k[2].indexOf("O") !== 0)) {
        if (k[2].indexOf("O") ===-1) {
            return false
        }
        return [
            k[0],
            k[0].indexOf("O") === 0 ? k[1] : k[2],
            k[0].indexOf("O") === 0 ? k[2] : k[1],
        ]

    }

    const methylKetone = () => {
        // CC(=O)CC1=CC2=C(C=C1)OCO2
        const k = ketone()
        return k === false || (k[1]!=="C" && k[2] !=="C")?false:k
    }

    const terminalAlkene = () => {
        // C=CCC1=CC2=C(C=C1)OCO2
        return canonical_SMILES.indexOf("C=C")===0?[canonical_SMILES]:false
    }

    const __split_alkene = (left, SMILES, right ) => {
        const alkene_groups = canonical_SMILES.match(/(.*?C[0-9]*?)\=(C[0-9]*.*)/)
// console.log(alkene_molecule.CanonicalSMILES.match(/(.*?C[0-9]*?)\=(C[0-9]*.*)/))
        /*
        [ 'C=CCC1=CC2=C(C=C1)OCO2',
          'C',
          'CCC1=CC2=C(C=C1)OCO2',
          index: 0,
          input: 'C=CCC1=CC2=C(C=C1)OCO2' ]
         */
        if (alkene_groups === null) {
            return false
        }
        return [[left + alkene_groups[1], alkene_groups[2] + right]]
    }


    const alkene = () => {
        // C=CCC1=CC2=C(C=C1)OCO2

        const alkene_groups_formatted = __split_alkene("", canonical_SMILES, "")

        if (alkene_groups_formatted===false) {
            return false
        }

        const alkene_group = __split_alkene(alkene_groups_formatted[0], alkene_groups_formatted[0], "")


        alkene_groups_formatted.push(alkene_group)
        return alkene_groups_formatted

        /*
        return alkene_groups_formatted.reduce(
           (total, currentValue, currentIndex, arr)=> {
               const alkene_group = __split_alkene("", canonical_SMILES, "")
           },
            alkene_groups_formatted
            )
            */
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












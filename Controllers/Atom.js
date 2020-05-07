

const CAtom = (atom, atom_index, mmolecule) => {

    return {
        lonePairs: () => {
            const atoms = mmolecule.slice(1)
            const atom_electrons = atom.slice(4)
            const lone_pairs = atom_electrons.filter(
                (atom_electron) => {
                    return atoms.filter(
                        (_atom, _atom_index) => {
                            if (atom_index === _atom_index) {
                                return true
                            }
                            const _atom_electrons = _atom.slice(4)
                            return _atom_electrons.indexOf(atom_electron) > -1
                        }
                    ).length === 1
                }
            )
            return lone_pairs
        }
    }
}


module.exports = CAtom
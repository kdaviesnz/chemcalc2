// MOLECULE MODEL
// pKa, atom, atom, atom ...
[
   7,
   ["H", 1, 2, "ve1", "ve3"],
   ["H", 1, 8, "ve2", "ve4"],   
   ["O", 6, 8, "ve3", "ve4", "ve5", "ve6", "ve7", "ve8", "ve1", "ve2" ], 
]

// MOLECULE CONTROLLER
{
   indexOf(atom),
   push(atom)
   delete(atom),
   itemAt(index)
}

// MOLECULE VIEW
{
    canonicalSMILES(),
}

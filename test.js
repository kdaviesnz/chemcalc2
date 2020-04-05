const should = require('should')

const ccontainer = new CContainer([])

// HCl + H2O <-> Cl- + H3O+
ccontainer.add("HCl")
ccontainer.container.should.be.greaterThan(2)
ccontainer.add("water")

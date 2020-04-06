// https://www.npmjs.com/package/should
// npm i should
const should = require('should')

const CContainer = require('./Controllers/Container')


const ccontainer = new CContainer([])

// HCl + H2O <-> Cl- + H3O+
ccontainer.add("HCl")
ccontainer.container.length.should.be.equal(2)
ccontainer.add("water")

// oOf8ZoXI`@.pE/$DLX2H(FKI7PC$I51

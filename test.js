// https://www.npmjs.com/package/should
// npm i should
const should = require('should')

const CContainer = require('./Controllers/Container')


const ccontainer = new CContainer([false])

// HCl + H2O <-> Cl- + H3O+
//  CONTAINER MODEL
// is vacuum, molecule, molecule ...
ccontainer.add("HCl")
ccontainer.container.length.should.be.equal(2)
ccontainer.container[0].should.be.equal(false)
ccontainer.container[1].should.be.array()


ccontainer.add("water")

// oOf8ZoXI`@.pE/$DLX2H(FKI7PC$I51

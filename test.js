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

// MOLECULE MODEL
// pKa, atom, atom, atom ...
ccontainer.container[1][0].should.be.a.number()
ccontainer.container[1][0].should.be.equal(100)

ccontainer.add("water")

// oOf8ZoXI`@.pE/$DLX2H(FKI7PC$I51

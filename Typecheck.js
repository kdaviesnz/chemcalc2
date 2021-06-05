const Typecheck = (...params) => {

    params.forEach(param => {

        if (param.type === 'array' && Object.prototype.toString.call(param.value) !== '[object Array]') {
            throw new Error(param.name + " should be an array, actual:" + typeof param.value)
        }

        if (param.value !== undefined && param.value !== null) {
            switch(param.type) {
                case 'array':
                    param.value.should.be.a.Array()
                    break;
                case 'number':
                    param.value.should.be.a.Number()
                    break;
                case 'string':
                    param.value.should.be.a.String()
                    break;
                case 'object':
                    Object.prototype.toString.call(param.value).should.not.be.equal('[object Array]') && param.value.should.be.a.Object()
                    break;
            }
        }
    });

}
module.exports = Typecheck
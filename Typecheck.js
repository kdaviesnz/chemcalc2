const Typecheck = (...params) => {

    params.forEach(param => {

        if (param.type === 'array' && Object.prototype.toString.call(param.value) !== '[object Array]') {
            console.log("Actual value:")
            console.log(param.value)
            throw new Error(param.name + " should be an array, actual type:" + typeof param.value)
        }

        if (param.value !== undefined && param.value !== null) {
            switch(param.type) {
                case 'number':
                    if (typeof param.value !== "number") {
                        console.log("Actual value:")
                        console.log(param.value)
                        throw new Error(param.name + " should be a number, actual type:" + typeof param.value)
                    }
                    break;
                case 'string':
                    if (typeof param.value !== "string") {
                        console.log("Actual value:")
                        console.log(param.value)
                        throw new Error(param.name + " should be a string, actual type:" + typeof param.value)
                    }
                    break;
                case 'object':
                    if (param.type === 'object' && (typeof param.value !== "object" || Object.prototype.toString.call(param.value) === '[object Array]')) {
                        console.log("Actual value:")
                        console.log(param.value)
                        throw new Error(param.name + " should be an object, actual type:" + (Object.prototype.toString.call(param.value) === '[object Array]'?'array':typeof param.value))
                    }
                    break;
            }
        }
    });

}
module.exports = Typecheck
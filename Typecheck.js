const Typecheck = (...params) => {
    params.forEach(param => {
        if (param.value !== undefined && param.value !== null) {
            if (param.type !== "array") {
                if (typeof param.value !== param.type) {
                    throw new Error(param.name + " should be " + param.type + ", actual:" + typeof param.value)
                }
            } else if (Object.prototype.toString.call(param.value) !== '[object Array]') {
                throw new Error(param.name + " should be an array, actual:" + typeof param.value)
            }
        }
    });
}
module.exports = Typecheck
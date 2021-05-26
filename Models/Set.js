const _ = require('lodash')

const Set = () => {

    return {
        unique: (array) => {
            return _.uniq(array)
        },
        intersection: (array1, array2) => {
            return array1.filter((value) => array2.includes(value))
        },
        difference: (array1, array2) => {
            return array1.filter((value) => !array2.includes(value))
        },
        removeFromArray: (array1, array2) => {
            return array1.reduce((carry, current, index, arr)=>{
                if (!array2.includes(current)) {
                    carry.push(current)
                }
                return carry
            }, [])
        },
        insertIntoArray: (array1, array2, insertion_point) => {
            return [...array1.slice(0, insertion_point), ...array2, ...array1.slice(insertion_point)]
        },
        arraysDifferAt: function(array1, array2, current_index) {

            if (undefined === current_index) {
                current_index = 0
            }

            if (undefined === array1[current_index]) {
                return -1
            }

            if (undefined === array2[current_index]) {
                return current_index
            }

            if (array1[current_index] === array2[current_index]) {
                return this.arraysDifferAt(array1, array2, current_index+1)
            } else {
                return current_index
            }
        }

    }
}

module.exports = Set

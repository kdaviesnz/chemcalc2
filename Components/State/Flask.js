
class Flask {

    constructor() {
        this.content = []
    }

    add(units, chemical) {
        if (this.content.length === 0) {
            this.content.push([units, chemical])
        }
    }

    remove() {

    }

    render () {
        console.log(this.content)
    }
}

module.exports = Flask
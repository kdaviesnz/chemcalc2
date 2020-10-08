const RulesLookup = (db, functional_group) =>
    new Promise(
        (resolve, reject) => {
            // Do mongo lookup
            // “secondary amine”
            db.collection("rules").find({products:functional_group}).toArray((err, rules) => {
                if (err) {
                    reject(err)
                }
                if (rules !== null) {
                    resolve(rules)
                }
            })
        }
    )
module.exports = RulesLookup



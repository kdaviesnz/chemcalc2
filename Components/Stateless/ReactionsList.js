const ReactionsList = [
    {
        "name": "Leuckart Wallach",
        "steps": [
            "bondSubstrateToReagent",
            "breakOxygenCarbonDoubleBond",
            "transferProton",
            "deprotonate",
            "makeCarbonNitrogenDoubleBond",
            "addProtonFromReagentToHydroxylGroup",
            "dehydrate"
        ],
        "reagents":[
            "N",
            "CN"
        ]
    },
    {
        "name": "Pinacol Rearrangement",
        "steps":     [
            'makeOxygenCarbonDoubleBond',
            'carbocationShift',
            'dehydrate',
            'addProtonFromReagentToHydroxylGroup',
            'deprotonate'
        ],
        "reagents":[
            "acid",
            "CN"
        ]
    }


]

module.exports = ReactionsList
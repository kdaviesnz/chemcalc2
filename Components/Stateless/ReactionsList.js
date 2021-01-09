const ReactionsList = [
    {
        "name": "Leuckart Wallach",
        "steps": [
            "substituteOxygenCarbonDoubleBond",
            "transferProton",
            "addProtonFromReagentToHydroxylGroup",
            "dehydrate",
            "protonateCarbocation"
        ],
        "reagents":[
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
    },
    {
        "name": "Akylation",
        "steps":     [
            'substituteHalide',
            'deprotonate'
        ],
        "reagents":[
            "N"
        ]
    }


]

module.exports = ReactionsList
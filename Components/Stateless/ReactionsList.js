const ReactionsList = [
    {
        "name": "Leuckart Wallach",
        "steps": [
            "substituteOxygenCarbonDoubleBondForAmine",
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
            'addProtonFromReagentToHydroxylGroup',
            'dehydrate',
            'carbocationShift',
            'oxygenCarbonDoubleBond',
            'removeProtonFromOxygen'
        ],
        "reagents":[
            "acid"
        ]
    },
    {
        "name": "Akylation",
        "steps":     [
            'substituteHalideForAmine',
            'deprotonateNitrogen'
        ],
        "reagents":[
            "N"
        ]
    }


]

module.exports = ReactionsList
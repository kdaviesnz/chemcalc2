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
            'substituteHalideForAmine',
            'deprotonateNitrogen'
        ],
        "reagents":[
            "N"
        ]
    }


]

module.exports = ReactionsList
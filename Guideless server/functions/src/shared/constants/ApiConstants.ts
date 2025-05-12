export const API_FIELD_MASKS = {
    NEARBY_PLACES: "places.displayName,places.id,places.rating,places.userRatingCount",
    DISTANCE_MATRIX: "originIndex,destinationIndex,duration,distanceMeters"
} as const;

export const API_CALL_OPTIONS = {
    NEARBY_PLACES: {
        otherArgs: {
            headers: {
                'X-Goog-FieldMask': API_FIELD_MASKS.NEARBY_PLACES,
            },
        },
    },
    DISTANCE_MATRIX: {
        otherArgs: {
            headers: {
                'X-Goog-FieldMask': API_FIELD_MASKS.DISTANCE_MATRIX,
            },
        },
    },
} as const;


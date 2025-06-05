export const API_FIELD_MASKS = {
    NEARBY_PLACES: "places.displayName,places.id,places.rating,places.userRatingCount,places.types,places.location.latitude,places.location.longitude",
    DISTANCE_MATRIX: "originIndex,destinationIndex,duration",
    ROUTE: "routes.duration,routes.distanceMeters,routes.polyline,routes.optimizedIntermediateWaypointIndex"
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
    ROUTE: {
        otherArgs: {
            headers: {
                'X-Goog-FieldMask': API_FIELD_MASKS.ROUTE,
            },
        },
    },
} as const;


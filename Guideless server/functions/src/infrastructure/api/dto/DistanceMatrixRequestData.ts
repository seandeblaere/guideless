export type Waypoint = {
    waypoint: {
        placeId: string;
    }
}

export type LocationWaypoint = {
    waypoint: {
        location: {
            latLng: {
                latitude: number;
                longitude: number;
            }
        }
    }
}

export type DistanceMatrixRequestData = {
    origins: Waypoint[];
    destinations: Waypoint[];
    travelMode: "WALK";
}
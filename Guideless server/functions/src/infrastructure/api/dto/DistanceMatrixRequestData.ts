export type Waypoint = {
    waypoint: {
        placeId: string;
    }
}

export type DistanceMatrixRequestData = {
    origins: Waypoint[];
    destinations: Waypoint[];
    travelMode: "WALK";
}
export type Waypoint = {
    waypoint: {
        placeId: string;
    }
}

export type Location = {
    latLng: {
        latitude: number;
        longitude: number;
    }
}

export type LocationWaypoint = {
    waypoint: {
        location: Location;
    }
}

export type DistanceMatrixRequestData = {
    origins: Waypoint[];
    destinations: Waypoint[];
    travelMode: "WALK";
}
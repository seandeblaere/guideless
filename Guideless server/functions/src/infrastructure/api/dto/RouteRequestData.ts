import { Location } from "./DistanceMatrixRequestData";

export type Intermediate = {
    placeId: string;
}

export type RouteRequestData = {
    origin: {
        location: Location;
    };
    destination: {
        location: Location;
    };
    intermediates: Intermediate[];
    travelMode: "WALK";
    polylineEncoding: "ENCODED_POLYLINE";
    polylineQuality: "HIGH_QUALITY";
    optimizeWaypoints: boolean;
}

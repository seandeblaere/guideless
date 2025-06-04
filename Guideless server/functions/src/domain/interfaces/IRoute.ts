import { POI } from "../models/POI";
import { Coordinates } from "../../shared/types/Coordinates";

export interface IRoute {
    startLocation: Coordinates;
    endLocation?: Coordinates;
    maxDurationMinutes: number;
    type: RouteType;
    maxPOICount: number;
    pois: readonly POI[];
    totalDurationMinutes: number;
    insertPOI(poi: POI, position: number, duration: number): void;
}

export enum RouteType {
    ROUND_TRIP = "round_trip",
    DESTINATION = "destination",
    ANYWHERE = "anywhere",
}

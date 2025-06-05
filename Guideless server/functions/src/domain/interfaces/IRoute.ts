import { POI } from "../models/POI";
import { Coordinates } from "../../shared/types/Coordinates";
import { RouteType } from "../../shared/enums/RouteType";

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

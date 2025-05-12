import { Coordinates } from "../../../shared/types/Coordinates";

export type NearbyPlacesParams = {
    coordinates: Coordinates;
    durationMinutes: number;
    includedTypes: string[];
}
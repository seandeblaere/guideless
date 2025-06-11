import {Coordinates} from "../../../shared/types/Coordinates";

export type NearbyPlacesParams = {
    startLocation: Coordinates;
    endLocation?: Coordinates;
    durationMinutes: number;
    includedTypes: string[];
}

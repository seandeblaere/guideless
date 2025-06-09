import {Coordinates} from "../../../shared/types/Coordinates";

export type NearbyPlacesRequestData = {
    locationRestriction: LocationRestriction;
    includedTypes: string[];
}

type LocationRestriction = {
    circle: {
        center: Coordinates;
        radius: number;
    };
}

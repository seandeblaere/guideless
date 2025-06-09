import {Coordinates} from "../../shared/types/Coordinates";

export interface IPlace {
    id: string;
    name?: string;
    coordinates?: Coordinates;
    rating?: number;
    userRatingCount?: number;
    types?: string[];
}

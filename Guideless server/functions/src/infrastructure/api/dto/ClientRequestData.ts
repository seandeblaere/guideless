import {Coordinates} from "../../../shared/types/Coordinates";
import {ThemeCategory} from "../../../shared/types/ThemeCategory";

export type ClientRequest = {
    startLocation: Coordinates;
    endLocation?: Coordinates;
    isRoundTrip: boolean;
    toAnywhere: boolean;
    durationMinutes: number;
    themeCategories: ThemeCategory[];
    maxPOICount: number;
}

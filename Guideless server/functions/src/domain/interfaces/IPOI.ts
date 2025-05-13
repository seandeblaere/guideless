import { IPlace } from "./IPlace";
import { GoogleDuration } from "../../shared/types/GoogleDuration";

export interface IPoi extends IPlace {
    baseScore: number;
    themeScore: number;
    qualityScore: number;
    clusterScore: number;
    distances: Map<string, GoogleDuration>;
    getDistanceToPOI(poiId: string): number;
}
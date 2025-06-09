import {IPlace} from "./IPlace";

export interface IPoi extends IPlace {
    baseScore: number;
    themeScore: number;
    qualityScore: number;
    clusterScore: number;
    distances: Map<string, number>;
    getDistanceToPOI(poiId: string): number;
}

import { IPlace } from "../interfaces/IPlace";
import { DEFAULT_ROUTE_WEIGHTS } from "../../shared/constants/ScoringConstants";
import { IPoi } from "../interfaces/IPOI";
import { Coordinates } from "../../shared/types/Coordinates";

export class POI implements IPoi {
    public readonly id: string;
    public readonly name?: string;
    public readonly coordinates?: Coordinates;
    public readonly rating?: number;
    public readonly userRatingCount?: number;
    public readonly types?: string[];

    private _themeScore: number = 0;
    private _qualityScore: number = 0;
    private _clusterScore: number = 0;
    private _distances: Map<string, number> = new Map();

    constructor(place: IPlace) {
        this.id = place.id;
        this.name = place.name;
        this.coordinates = place.coordinates;
        this.rating = place.rating;
        this.userRatingCount = place.userRatingCount;
        this.types = place.types;
    }

    public get baseScore(): number {
        return this.calculateBaseScore();
    }

    public get themeScore(): number {
        return this._themeScore;
    }

    public get qualityScore(): number {
        return this._qualityScore;
    }

    public get clusterScore(): number {
        return this._clusterScore;
    }

    public get distances(): Map<string, number> {
        return this._distances;
    }

    public set themeScore(score: number) {
        this._themeScore = score;
    }

    public set qualityScore(score: number) {
        this._qualityScore = score;
    }

    public set clusterScore(score: number) {
        this._clusterScore = score;
    }

    public set distances(distances: Map<string, number>) {
        this._distances = distances;
    }

    public static createStartPOI(coordinates: Coordinates): POI {
        const startingPoint: IPlace = {
            id: "start_location",
            name: "Starting Point",
            coordinates: coordinates,
            rating: 0,
            userRatingCount: 0,
            types: [],
        };
        
        return new POI(startingPoint);
    }

    public static createEndPOI(coordinates?: Coordinates): POI {
        const endingPoint: IPlace = {
            id: "end_location",
            name: "Ending Point",
            coordinates: coordinates,
            rating: 0,
            userRatingCount: 0,
            types: [],
        };

        return new POI(endingPoint);
    }
    

    public getDistanceToPOI(poiId: string): number {
        return this._distances.get(poiId) ?? Infinity;
    }
    
    private calculateBaseScore(weights = DEFAULT_ROUTE_WEIGHTS): number {
        return weights.theme * this._themeScore + 
            weights.quality * this._qualityScore + 
            weights.cluster * this._clusterScore;
    }
}
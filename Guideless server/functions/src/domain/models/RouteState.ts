import { Route } from "./Route";
import { POI } from "./POI";
import { ClusterScorer } from "../../application/scoring/ClusterScorer";
import { QualityScorer } from "../../application/scoring/QualityScorer";
import { ThemeScorer } from "../../application/scoring/ThemeScorer";

export class RouteState {
    private readonly _route: Route;
    private readonly _availablePois: POI[];
    private readonly _globalAvgDistance: number;
    private readonly _isolatedHighScoringPois: POI[];
    
    constructor(route: Route, availablePois: POI[]) {
        this._route = route;
        this._availablePois = [...availablePois];
        this._globalAvgDistance = this.calculateGlobalAvgDistance();
        this._isolatedHighScoringPois = this.calculateIsolatedHighScoringPois();
    }

    public static async initialize(route: Route, availablePois: POI[]): Promise<RouteState> {
        const routeState = new RouteState(route, availablePois);
        await routeState.initializeScores();
        return routeState;
    }
    
    public get route(): Route { return this._route; }

    public get availablePois(): readonly POI[] { 
        return this._availablePois; 
    }

    public get remainingTime(): number { 
        return this._route.maxDurationMinutes - this._route.totalDurationMinutes; 
    }

    public get isolatedHighScoringPois(): readonly POI[] {
        return this._isolatedHighScoringPois;
    }

    public get globalAvgDistance(): number {
        return this._globalAvgDistance;
    }

    public withAddedPoi(poi: POI, position: number, duration: number): RouteState {
        const newRoute = Route.from(this._route);

        newRoute.insertPOI(poi, position, duration);
    
        const newAvailablePois = this._availablePois.filter(p => p.id !== poi.id);
        
        return new RouteState(newRoute, newAvailablePois);
    }

    public isComplete(): boolean {
        return this._availablePois.length === 0 ||
               this._route.pois.length === this._route.maxPOICount;
    }

    private calculateGlobalAvgDistance(): number {
        let totalDistance = 0;
        let pairCount = 0;
        
        for (let i = 0; i < this._availablePois.length; i++) {
            for (let j = i + 1; j < this._availablePois.length; j++) {
                if (this._availablePois[i].id === this._availablePois[j].id) {
                    continue;
                }
                const distance = this._availablePois[i].getDistanceToPOI(this._availablePois[j].id);
                totalDistance += distance;
                pairCount++;   
            }
        }
        return totalDistance / pairCount;
    }

    private calculateIsolatedHighScoringPois(): POI[] {
        return this._availablePois.filter(p => {
            const distances = this._availablePois
                .filter(other => other.id !== p.id)
                .map(other => p.getDistanceToPOI(other.id));
            
            const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
            const isIsolated = avgDistance > (this.globalAvgDistance * 1.5);
            const hasHighScore = p.qualityScore > 0.85;
            
            return isIsolated && hasHighScore;
        });
    }

    private async initializeScores(): Promise<void> {
        await ThemeScorer.calculateScores(this._availablePois);
        QualityScorer.calculateScores(this._availablePois);
        ClusterScorer.calculateScores(
            this._availablePois,
            this._globalAvgDistance,
            this._isolatedHighScoringPois
        );
    }
}
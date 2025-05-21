import { POI } from "../../domain/models/POI";
import { RouteState } from "../../domain/models/RouteState";

export class RouteOptimizer {
    private static readonly lambda: number = 0.5;

    public static optimize(routeState: RouteState): RouteState {
        console.log("optimizing route");
        return this.insertPOIs(routeState);
    }

    private static insertPOIs(routeState: RouteState): RouteState {
        let currentState = routeState;
        
        while (currentState.remainingTime > 0 && !currentState.isComplete()) {
            let bestPOI: POI | null = null;
            let bestNetGain = -Infinity;
            let position = -1;

            const routePois = currentState.route.pois;
    
            for (const poi of currentState.availablePois) {
                for (let i = 1; i <= routePois.length - 1; i++) {
                    const netGain = this.calculateNetGain(poi, i, routePois);
                    
                    if (netGain > bestNetGain) {
                        console.log("new best net gain:", netGain, "for poi with name:", poi.name, "at position:", i);
                        bestNetGain = netGain;
                        bestPOI = poi;
                        position= i;
                    }
                }
            }
    
            if (bestPOI && bestNetGain > 0) {
                const insertCost = this.calculateInsertCost(bestPOI, position, routePois);
                console.log("inserting poi:", bestPOI.name, "at position:", position, "with insert cost:", insertCost);
                currentState = currentState.withAddedPoi(bestPOI, position, insertCost);
            } else {
                break;
            }
        }
        return currentState;
    }

    private static calculateNetGain(poi: POI, position: number, routePois: readonly POI[]): number {
        const insertCost = this.calculateInsertCost(poi, position, routePois);
        const normalizedCost = insertCost / routePois.length;
        
        return poi.baseScore - (this.lambda * normalizedCost);
    }

    private static calculateInsertCost(poi: POI, position: number, routePois: readonly POI[]): number {
        
        const prevPOI = routePois[position - 1];
        const nextPOI = routePois[position];
        
        const insertCost = prevPOI.getDistanceToPOI(poi.id) + 
                          poi.getDistanceToPOI(nextPOI.id) - 
                          prevPOI.getDistanceToPOI(nextPOI.id);
        
        return insertCost;
    }
}
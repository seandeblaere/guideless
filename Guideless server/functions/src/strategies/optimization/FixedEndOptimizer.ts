import {POI} from "../../domain/models/POI";
import {Route} from "../../domain/models/Route";
import {RouteState} from "../../domain/models/RouteState";

export class FixedEndOptimizer {
  private static readonly lambda: number = 0.7;

  public static optimize(routeState: RouteState): RouteState {
    
    return this.insertPOIs(routeState);
  }

  private static insertPOIs(routeState: RouteState): RouteState {
    let currentState = routeState;
    let iteration = 0;

    while (!currentState.isComplete()) {
      iteration++;
      
      let bestPOI: POI | null = null;
      let bestNetGain = -Infinity;
      let position = -1;
      let bestInsertCost = 0;

      const currentRoute = currentState.route;

      for (const poi of currentState.availablePois) {
        
        for (let i = 1; i <= currentRoute.pois.length - 1; i++) {
          const insertCost = this.calculateInsertCost(poi, i, currentRoute.pois);
          
          if (insertCost > currentState.remainingTime) {
            continue;
          }

          const netGain = this.calculateNetGain(poi, i, currentRoute);

          if (netGain > bestNetGain) {
            bestNetGain = netGain;
            bestPOI = poi;
            position = i;
            bestInsertCost = insertCost;
          }
        }
      }

      if (bestPOI && bestNetGain > 0) {
        const insertCost = this.calculateInsertCost(bestPOI, position, currentRoute.pois);
        currentState = currentState.withAddedPoi(bestPOI, position, insertCost);
        
      } else {
        break;
      }
    }

    return currentState;
  }

  private static calculateNetGain(poi: POI, position: number, route: Route): number {
    const insertCost = this.calculateInsertCost(poi, position, route.pois);
    const normalizedCost = insertCost / route.maxDurationMinutes;

    return poi.baseScore - (this.lambda * normalizedCost);
  }

  private static calculateInsertCost(poi: POI, position: number, routePois: readonly POI[]): number {
    const prevPOI = routePois[position - 1];
    const nextPOI = routePois[position];

    const distanceToPrev = prevPOI.getDistanceToPOI(poi.id);
    const distanceToNext = poi.getDistanceToPOI(nextPOI.id);
    const originalDistance = prevPOI.getDistanceToPOI(nextPOI.id);

    const insertCost = distanceToPrev + distanceToNext - originalDistance;

    return insertCost;
  }
}

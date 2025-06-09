import {POI} from "../../domain/models/POI";
import {Route} from "../../domain/models/Route";
import {RouteState} from "../../domain/models/RouteState";

export class LooseEndOptimizer {
  private static readonly lambda: number = 0.5;

  public static optimize(routeState: RouteState): RouteState {
    return this.insertPOIs(routeState);
  }

  private static insertPOIs(routeState: RouteState): RouteState {
    let currentState = routeState;

    while (!currentState.isComplete()) {
      let bestPOI: POI | null = null;
      let bestNetGain = -Infinity;
      let position = -1;

      const currentRoute = currentState.route;

      for (const poi of currentState.availablePois) {
        for (let i = 1; i <= currentRoute.pois.length; i++) {
          const netGain = this.calculateNetGain(poi, i, currentRoute);

          if (netGain > bestNetGain) {
            bestNetGain = netGain;
            bestPOI = poi;
            position = i;
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

    if (position >= routePois.length) {
      return prevPOI.getDistanceToPOI(poi.id);
    }

    const nextPOI = routePois[position];
    const insertCost = prevPOI.getDistanceToPOI(poi.id) +
                          poi.getDistanceToPOI(nextPOI.id) -
                          prevPOI.getDistanceToPOI(nextPOI.id);

    return insertCost;
  }
}

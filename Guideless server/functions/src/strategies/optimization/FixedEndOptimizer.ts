import {POI} from "../../domain/models/POI";
import {Route} from "../../domain/models/Route";
import {RouteState} from "../../domain/models/RouteState";

export class FixedEndOptimizer {
  private static readonly lambda: number = 0.7;

  public static optimize(routeState: RouteState): RouteState {
    console.log("========= STARTING ROUTE OPTIMIZATION =========");
    console.log(`Initial route: ${routeState.route.pois.length} POIs`);
    console.log(`Available POIs: ${routeState.availablePois.length}`);
    console.log(`Max duration: ${routeState.route.maxDurationMinutes} minutes`);
    console.log(`Current duration: ${routeState.route.totalDurationMinutes} minutes`);
    console.log(`Remaining time: ${routeState.remainingTime} minutes`);
    console.log("==============================================");
    
    return this.insertPOIs(routeState);
  }

  private static insertPOIs(routeState: RouteState): RouteState {
    let currentState = routeState;
    let iteration = 0;

    while (!currentState.isComplete()) {
      iteration++;
      console.log(`\n--- Iteration ${iteration} ---`);
      console.log(`Current POIs: ${currentState.route.pois.map(p => p.name || p.id).join(', ')}`);
      console.log(`Remaining time: ${currentState.remainingTime} minutes`);
      
      let bestPOI: POI | null = null;
      let bestNetGain = -Infinity;
      let position = -1;
      let bestInsertCost = 0;

      const currentRoute = currentState.route;
      console.log(`Evaluating ${currentState.availablePois.length} available POIs...`);

      for (const poi of currentState.availablePois) {
        console.log(`\nEvaluating POI: "${poi.name || poi.id}"`);
        
        for (let i = 1; i <= currentRoute.pois.length - 1; i++) {
          const insertCost = this.calculateInsertCost(poi, i, currentRoute.pois);
          console.log(`  Position ${i}: Insert cost = ${insertCost} min (between "${currentRoute.pois[i-1].name || currentRoute.pois[i-1].id}" and "${currentRoute.pois[i].name || currentRoute.pois[i].id}")`);
          
          if (insertCost > currentState.remainingTime) {
            console.log(`    ❌ Exceeds remaining time (${currentState.remainingTime} min), skipping`);
            continue;
          }

          const netGain = this.calculateNetGain(poi, i, currentRoute);
          console.log(`    Net gain = ${netGain.toFixed(3)} (baseScore: ${poi.baseScore.toFixed(3)}, normalizedCost: ${(insertCost / currentRoute.maxDurationMinutes).toFixed(3)})`);

          if (netGain > bestNetGain) {
            bestNetGain = netGain;
            bestPOI = poi;
            position = i;
            bestInsertCost = insertCost;
            console.log(`    ✅ New best option!`);
          }
        }
      }

      if (bestPOI && bestNetGain > 0) {
        console.log(`\n✅ ADDING POI: "${bestPOI.name || bestPOI.id}" at position ${position}`);
        console.log(`   Insert cost: ${bestInsertCost} minutes`);
        console.log(`   Net gain: ${bestNetGain.toFixed(3)}`);
        console.log(`   Base score components: Theme=${bestPOI.themeScore.toFixed(2)}, Quality=${bestPOI.qualityScore.toFixed(2)}, Cluster=${bestPOI.clusterScore.toFixed(2)}`);
        
        const insertCost = this.calculateInsertCost(bestPOI, position, currentRoute.pois);
        currentState = currentState.withAddedPoi(bestPOI, position, insertCost);
        
        console.log(`   Updated route duration: ${currentState.route.totalDurationMinutes} / ${currentState.route.maxDurationMinutes} minutes`);
        console.log(`   Remaining time: ${currentState.remainingTime} minutes`);
      } else {
        console.log("\n❌ No suitable POIs found, stopping optimization");
        if (bestPOI) {
          console.log(`   Best candidate was "${bestPOI.name || bestPOI.id}" with net gain ${bestNetGain.toFixed(3)}`);
        }
        break;
      }
    }

    console.log("\n========= OPTIMIZATION COMPLETE =========");
    console.log(`Final route has ${currentState.route.pois.length} POIs (${currentState.poiCountWithoutStartAndEnd} excluding start/end)`);
    console.log(`Final duration: ${currentState.route.totalDurationMinutes} / ${currentState.route.maxDurationMinutes} minutes`);
    console.log(`POIs in route: ${currentState.route.pois.map(p => p.name || p.id).join(', ')}`);
    console.log("==========================================");

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

    if (process.env.NODE_ENV !== 'production') {
      console.log(`    Distance details: ${prevPOI.name || prevPOI.id} → ${poi.name || poi.id} = ${distanceToPrev} min`);
      console.log(`    Distance details: ${poi.name || poi.id} → ${nextPOI.name || nextPOI.id} = ${distanceToNext} min`);
      console.log(`    Distance details: Original ${prevPOI.name || prevPOI.id} → ${nextPOI.name || nextPOI.id} = ${originalDistance} min`);
      console.log(`    Total detour cost = ${distanceToPrev} + ${distanceToNext} - ${originalDistance} = ${insertCost} min`);
    }

    return insertCost;
  }
}
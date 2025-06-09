import {Route} from "./Route";
import {POI} from "./POI";
import {ClusterScorer} from "../../application/scoring/ClusterScorer";
import {QualityScorer} from "../../application/scoring/QualityScorer";
import {ThemeScorer} from "../../application/scoring/ThemeScorer";
import {RouteType} from "../../shared/enums/RouteType";

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

  public get route(): Route {
    return this._route;
  }

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

  public get poiCount(): number {
    return this._route.pois.length;
  }

  public get poiCountWithoutStartAndEnd(): number {
    return this.poiCount - (this._route.type === RouteType.ANYWHERE ? 1 : 2);
  }

  public withAddedPoi(poi: POI, position: number, duration: number): RouteState {
    const newRoute = Route.from(this._route);

    newRoute.insertPOI(poi, position, duration);

    const newAvailablePois = this._availablePois.filter((p) => p.id !== poi.id);

    const newRouteState = new RouteState(newRoute, newAvailablePois);

    ClusterScorer.calculateScores(newRouteState._availablePois, newRouteState._globalAvgDistance, newRouteState._isolatedHighScoringPois);

    return newRouteState;
  }

  public isComplete(): boolean {
    return this._availablePois.length === 0 ||
               this.poiCountWithoutStartAndEnd === this._route.maxPOICount ||
               this.remainingTime <= 0;
  }

  private calculateGlobalAvgDistance(): number {
    let totalDistance = 0;
    let pairCount = 0;

    for (let i = 0; i < this._availablePois.length; i++) {
      for (let j = i + 1; j < this._availablePois.length; j++) {
        const poi1 = this._availablePois[i];
        const poi2 = this._availablePois[j];

        const distance = poi1.getDistanceToPOI(poi2.id);

        totalDistance += distance;
        pairCount++;
      }
    }

    const avg = totalDistance / pairCount;
    return avg;
  }

  private calculateIsolatedHighScoringPois(): POI[] {
    return this._availablePois.filter((p) => {
      const distances = this._availablePois
        .filter((other) => other.id !== p.id)
        .map((other) => p.getDistanceToPOI(other.id));

      const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
      const isIsolated = avgDistance > (this.globalAvgDistance * 1.5);
      const hasHighScore = p.qualityScore > 0.85 && p.themeScore > 0.85;

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

import {Coordinates} from "../../shared/types/Coordinates";
import {POI} from "./POI";
import {IRoute} from "../interfaces/IRoute";
import {RouteType} from "../../shared/enums/RouteType";
import {ThemeCategory} from "../../shared/types/ThemeCategory";

export class Route implements IRoute {
  public readonly startLocation: Coordinates;
  public readonly endLocation?: Coordinates;
  public readonly maxDurationMinutes: number;
  public readonly type: RouteType;
  public readonly maxPOICount: number;
  public readonly themeCategories: ThemeCategory[];

  private _totalDurationMinutes = 0;
  private _pois: POI[] = [];

  constructor(startLocation: Coordinates, durationMinutes: number, type: RouteType, maxPOICount: number, themeCategories: ThemeCategory[], endLocation?: Coordinates) {
    this.startLocation = startLocation;
    this.endLocation = endLocation;
    this.maxDurationMinutes = durationMinutes;
    this.type = type;
    this.maxPOICount = maxPOICount;
    this.themeCategories = themeCategories;
  }

  static from(route: Route): Route {
    const newRoute = new Route(
      route.startLocation,
      route.maxDurationMinutes,
      route.type,
      route.maxPOICount,
      route.themeCategories,
      route.endLocation
    );
    newRoute._pois = [...route._pois];
    newRoute._totalDurationMinutes = route._totalDurationMinutes;
    return newRoute;
  }

  public get pois(): POI[] {
    return [...this._pois];
  }

  public get totalDurationMinutes(): number {
    return this._totalDurationMinutes;
  }

  public insertPOI(poi: POI, position: number, duration: number): void {
    if (position < 0 || position > this._pois.length) {
      throw new Error("Invalid insertion position");
    }
    this._totalDurationMinutes += duration;
    this._pois.splice(position, 0, poi);
  }
}


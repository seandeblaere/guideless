import {PlacesService} from "../../infrastructure/api/PlacesService";
import {DistanceMatrixService} from "../../infrastructure/api/DistanceMatrixService";
import {RouteBuilder} from "../../builders/RouteBuilder";
import {RouteState} from "../../domain/models/RouteState";
import {POI} from "../../domain/models/POI";
import {RouteOptimizer} from "./RouteOptimizer";
import {ClientRequest} from "../../infrastructure/api/dto/ClientRequestData";
import {getThemeTypes} from "../../infrastructure/firebase/ThemeRepository";
import {RoutesService} from "../../infrastructure/api/RoutesService";
import {DistanceMatrix} from "../../shared/types/DistanceMatrix";
import {Route} from "../../domain/models/Route";
import {RouteType} from "../../shared/enums/RouteType";
import {StoreService} from "../../infrastructure/firebase/StoreService";
import {RouteConverter} from "../converters/RouteConverter";
import {POIDocument} from "../../domain/interfaces/IPOIDocument";
import {IRouteDocument} from "../../domain/interfaces/IRouteDocument";
import { Coordinates } from "../../shared/types/Coordinates";

export class RouteGenerator {
  private placesService: PlacesService;
  private distanceMatrixService: DistanceMatrixService;
  private routeBuilder: RouteBuilder;
  private routesService: RoutesService;
  private storeService: StoreService;

  constructor() {
    this.placesService = new PlacesService();
    this.distanceMatrixService = new DistanceMatrixService();
    this.routeBuilder = new RouteBuilder();
    this.routesService = new RoutesService();
    this.storeService = new StoreService();
  }

  async generateRoute(userId: string, request: ClientRequest): Promise<{ route: IRouteDocument, pois: POIDocument[] }> {
    const themeTypes = await getThemeTypes(request.themeCategories);

    const endLocation = await this.placesService.getGeocode(request.endLocation);

    const places = await this.placesService.searchNearbyPlaces({
      startLocation: request.startLocation,
      endLocation: endLocation,
      durationMinutes: request.durationMinutes,
      includedTypes: themeTypes,
    });

    if (places.length <= 0) {
      throw new Error("No places found");
    }

    const distanceMatrix = await this.distanceMatrixService.calculateDistanceMatrix(places, request.startLocation, endLocation);

    if (!distanceMatrix.has("start_location")) {
      throw new Error("Start location not found in distance matrix");
    }

    if (endLocation && !distanceMatrix.has("end_location")) {
      throw new Error("End location not found in distance matrix");
    }

    const pois = places.map((place) => {
      return new POI(place);
    });

    const routeType = this.getRouteType(request);

    const startPOI = POI.createStartPOI(request.startLocation);

    const endPOI = (routeType === RouteType.ANYWHERE) ? undefined : POI.createEndPOI(endLocation);

    this.addDistancesToPOIs(pois, distanceMatrix, startPOI, routeType, endPOI);

    const route = this.buildRoute(request, routeType, startPOI, endPOI, endLocation);

    const routeState = await RouteState.initialize(route, pois);

    const optimizedRouteState = RouteOptimizer.optimize(routeState);

    const computedRoute = await this.routesService.computeRoute(optimizedRouteState.route);

    const routeDocument = RouteConverter.convertToRouteDocument(optimizedRouteState.route, request, computedRoute, endLocation);

    const poiDocuments = RouteConverter.convertToPOIDocuments(optimizedRouteState.route.pois);

    return await this.storeService.saveRoute(userId, routeDocument, poiDocuments);
  }

  private addDistancesToPOIs(pois: POI[], distanceMatrix: DistanceMatrix, startPOI: POI, routeType: RouteType, endPOI?: POI) {
    pois.forEach((poi) => {
      const distances = distanceMatrix.get(poi.id);

      if (!distances) {
        throw new Error("POI not found in distance matrix");
      }

      poi.distances = distances;

      const startToPoiDistance = distanceMatrix.get("start_location")?.get(poi.id);

      if (!startToPoiDistance) {
        throw new Error("Start to POI distance not found in distance matrix");
      }

      poi.distances.set("start_location", startToPoiDistance);

      if (routeType === RouteType.ROUND_TRIP && endPOI) {
        poi.distances.set("end_location", startToPoiDistance);
      } else if (routeType === RouteType.DESTINATION && endPOI) {
        const poiToEndDistance = distanceMatrix.get(poi.id)?.get("end_location");

        if (!poiToEndDistance) {
          throw new Error("POI to end distance not found in distance matrix");
        }

        poi.distances.set("end_location", poiToEndDistance);
      }
    });

    const startPOIDistances = distanceMatrix.get("start_location");

    if (!startPOIDistances) {
      throw new Error("Start POI distances not found in distance matrix");
    }

    startPOI.distances = startPOIDistances;

    if (routeType === RouteType.ROUND_TRIP && endPOI) {
      endPOI.distances = startPOIDistances;
      startPOI.distances.set("end_location", 0);
      endPOI.distances.set("start_location", 0);
    } else if (routeType === RouteType.DESTINATION && endPOI) {
      const endPOIDistances = distanceMatrix.get("end_location");

      if (!endPOIDistances) {
        throw new Error("End POI distances not found in distance matrix");
      }

      endPOI.distances = endPOIDistances;
    }
  }

  private buildRoute(request: ClientRequest, routeType: RouteType, startPOI: POI, endPOI?: POI, endLocation?: Coordinates): Route {
    const route = this.routeBuilder
      .withStartLocation(request.startLocation)
      .withEndLocation(endLocation)
      .withDuration(request.durationMinutes)
      .withThemeCategories(request.themeCategories)
      .withMaxPOIs(request.maxPOICount)
      .withRouteType(routeType)
      .build();

    route.insertPOI(startPOI, 0, 0);

    if (endPOI) {
      const insertCost = (routeType === RouteType.ROUND_TRIP) ?
        0 :
        startPOI.getDistanceToPOI("end_location");
      route.insertPOI(endPOI, 1, insertCost);
    }

    return route;
  }

  private getRouteType(request: ClientRequest): RouteType {
    if (request.toAnywhere) return RouteType.ANYWHERE;
    if (request.isRoundTrip) return RouteType.ROUND_TRIP;
    return RouteType.DESTINATION;
  }
}

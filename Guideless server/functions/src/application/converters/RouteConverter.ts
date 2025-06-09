import {Route} from "../../domain/models/Route";
import {POI} from "../../domain/models/POI";
import {IRouteDocument} from "../../domain/interfaces/IRouteDocument";
import {POIDocument} from "../../domain/interfaces/IPOIDocument";
import {ClientRequest} from "../../infrastructure/api/dto/ClientRequestData";
import {protos} from "@googlemaps/routing";
import {RouteType} from "../../shared/enums/RouteType";

export class RouteConverter {
  static convertToRouteDocument(
    route: Route,
    request: ClientRequest,
    computedRoute: protos.google.maps.routing.v2.IComputeRoutesResponse
  ): IRouteDocument {
    return {
      routeType: route.type,
      themes: request.themeCategories,
      maxDurationMinutes: request.durationMinutes,
      maxPOICount: request.maxPOICount,

      startLocation: {
        coordinates: request.startLocation,
      },
      endLocation: request.endLocation ? {
        coordinates: request.endLocation,
      } : null,

      polyline: computedRoute.routes![0].polyline!.encodedPolyline,
      distanceMeters: computedRoute.routes![0].distanceMeters,
      durationSeconds: computedRoute.routes![0].duration!.seconds,
      optimizedIntermediateWaypointIndex: computedRoute.routes![0].optimizedIntermediateWaypointIndex,

      totalPOIs: route.pois.length - (route.type === RouteType.ANYWHERE ? 1 : 2),
    } as IRouteDocument;
  }

  static convertToPOIDocuments(pois: POI[]): POIDocument[] {
    const actualPOIs = pois.filter((poi) =>
      poi.id !== "start_location" && poi.id !== "end_location"
    );

    return actualPOIs.map((poi, index) => ({
      name: poi.name,
      placeId: poi.id,
      types: poi.types,
      routeIndex: index,
      isStartPoint: false,
      isEndPoint: false,

      visited: false,
      visitedAt: null,
      skipped: false,
      skippedAt: null,
      contentReady: false,
      content: null,

      locationRegion: {
        identifier: `poi_${index}`,
        latitude: poi.coordinates!.latitude,
        longitude: poi.coordinates!.longitude,
        radius: 50,
      },
    } as POIDocument));
  }
}

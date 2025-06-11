import { RouteGeneratorFormData } from "@/stores/RouteGeneratorStore";
import { Route, POI, Coordinates } from "@/stores/RouteStore";


export function getRouteStateFromRoute(route: any) {
    const routeState: Route = {
      id: route.id,
      routeType: route.routeType,

      startLocation: route.startLocation,
      endLocation: route.endLocation,

      polyline: route.polyline,
      distanceMeters: route.distanceMeters,
      durationSeconds: route.durationSeconds,
      optimizedIntermediateWaypointIndex: route.optimizedIntermediateWaypointIndex,

      totalPOIs: route.totalPOIs,
      visitedPOIs: route.visitedPOIs,
      manuallyCompleted: route.manuallyCompleted,
      destinationReached: route.destinationReached,
    };

    return routeState;
  }

export function getPOIStateFromPOIData(poi: any) {
  const poiState: POI = {
    id: poi.id,
    name: poi.name,
    placeId: poi.placeId,
    types: poi.types,
    routeIndex: poi.routeIndex,
    isStartPoint: poi.isStartPoint,
    isEndPoint: poi.isEndPoint,
    visited: poi.visited,
    locationRegion: poi.locationRegion,
    content: poi.content,
    contentReady: poi.contentReady,
    skipped: poi.skipped,
  };

  return poiState;
}

export function getRouteRequestFromFormData(formData: RouteGeneratorFormData, location: Coordinates) {
  console.log('Form data in getRouteRequestFromFormData:', formData);
  console.log('Location in getRouteRequestFromFormData:', location);
  const routeRequest = {
    startLocation: location,
    endLocation: formData.destination.type === 'address' && formData.destination.address ? formData.destination.address : null,
    durationMinutes: formData.durationMinutes,
    themeCategories: formData.categories,
    maxPOICount: 20,
    toAnywhere: formData.destination.type === 'anywhere',
    isRoundTrip: formData.destination.type === 'return',
  };

  return routeRequest;
}
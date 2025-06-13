import { RouteGeneratorFormData } from "@/stores/RouteGeneratorStore";
import { Route, POI, Coordinates, RouteProgress } from "@/stores/RouteStore";


export function getRouteStateFromRoute(route: any, routeProgress?: RouteProgress) {
    const noProgress: RouteProgress = {
      visitedPOIs: 0,
      totalPOIs: 0,
      completionPercentage: 0,
      routeCompleted: false,
    };

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

      routeProgress: routeProgress ?? noProgress,
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
import { protos } from '@googlemaps/routing';

// Route Types
export type ComputeRoutesResponse = protos.google.maps.routing.v2.IComputeRoutesResponse;
export type Route = protos.google.maps.routing.v2.Route;
export type RouteLeg = protos.google.maps.routing.v2.RouteLeg;
export type Polyline = protos.google.maps.routing.v2.Polyline;

// Places Types
export type Place = protos.google.maps.places.v1.Place;
export type SearchNearbyResponse = protos.google.maps.places.v1.SearchNearbyResponse;

// Common Types
export type LatLng = protos.google.type.LatLng; 
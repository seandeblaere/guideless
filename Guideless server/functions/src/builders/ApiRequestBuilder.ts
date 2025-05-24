import { IPlace } from "../domain/interfaces/IPlace";
import { POI } from "../domain/models/POI";
import { Coordinates } from "../shared/types/Coordinates";
import { NearbyPlacesRequestData } from "../infrastructure/api/dto/NearbyPlacesRequestData";
import { DistanceMatrixRequestData, Waypoint, LocationWaypoint } from "../infrastructure/api/dto/DistanceMatrixRequestData";
import { RouteRequestData, Intermediate } from "../infrastructure/api/dto/RouteRequestData";
export class ApiRequestBuilder {
    private coordinates: Coordinates = {
        latitude: 0,
        longitude: 0,
    };
    private durationMinutes: number = 0;
    private includedTypes: string[] = [];
    private places: IPlace[] = [];
    private pois: POI[] = [];
    private requestType: "nearbyPlacesRequest" | "distanceMatrixRequest" | "routeRequest";
    private averageWalkingSpeed: number = 5;
    private startLocation: Coordinates = {
        latitude: 0,
        longitude: 0,
    };
    private endLocation?:Coordinates;

    constructor(requestType: "nearbyPlacesRequest" | "distanceMatrixRequest" | "routeRequest") {
        this.requestType = requestType;
    }

    setCoordinates(coordinates: Coordinates): ApiRequestBuilder {
        this.coordinates = coordinates;
        return this;
    }

    setDurationMinutes(durationMinutes: number): ApiRequestBuilder {
        this.durationMinutes = durationMinutes;
        return this;
    }

    setIncludedTypes(includedTypes: string[]): ApiRequestBuilder {
        this.includedTypes = includedTypes;
        return this;
    }

    setPlaces(places: IPlace[]): ApiRequestBuilder {
        this.places = places;
        return this;
    }

    setStartLocation(startLocation: Coordinates): ApiRequestBuilder {
        this.startLocation = startLocation;
        return this;
    }

    setEndLocation(endLocation: Coordinates): ApiRequestBuilder {
        this.endLocation = endLocation;
        return this;
    }

    setPois(pois: POI[]): ApiRequestBuilder {
        this.pois = pois;
        return this;
    }

    private getWaypoints(): Waypoint[] {
        const waypoints = this.places.map(place => ({
            waypoint: {
                placeId: place.id
            }
        }));

        return waypoints;
    }

    private getLocationWaypoint(coordinates: Coordinates): LocationWaypoint {
        return {
            waypoint: {
                location: {
                    latLng: {
                        latitude: coordinates.latitude,
                        longitude: coordinates.longitude
                    }
                }
            }
        };
    }

    private getIntermediates(): Intermediate[] {
        return this.pois.map(poi => ({
          placeId: poi.id
        }));
      }

    private mergeWaypoints(location?: Coordinates): any[] {
        if (!location) {
            return this.getWaypoints();
        }
        return [this.getLocationWaypoint(location), ...this.getWaypoints()];
    }

    private getRadius(): number {
        return (this.durationMinutes/60) * this.averageWalkingSpeed * 1000;
    }

    private buildNearbyPlacesRequest(): NearbyPlacesRequestData {
        const locationRestriction = {
            circle: {
                center: this.coordinates,
                radius: this.getRadius(),
            },
        };

        return {
            locationRestriction: locationRestriction,
            includedTypes: this.includedTypes,
        };
    }

    private buildDistanceMatrixRequest(): DistanceMatrixRequestData {
        return {
            origins: this.mergeWaypoints(this.startLocation),
            destinations: this.mergeWaypoints(this.endLocation),
            travelMode: "WALK",
        };
    }

    private buildRouteRequest(): RouteRequestData {
        return {
            "origin": {
                "location": {
                    "latLng": {
                        "latitude": this.startLocation.latitude,
                        "longitude": this.startLocation.longitude
                    }
                }
            },
            "destination": {
                "location": {
                    "latLng": {
                        "latitude": this.endLocation?.latitude ?? this.startLocation.latitude,
                        "longitude": this.endLocation?.longitude ?? this.startLocation.longitude
                    }
                }
            },
            "intermediates": this.getIntermediates(),
            "travelMode": "WALK",
            "polylineEncoding": "ENCODED_POLYLINE",
            "polylineQuality": "HIGH_QUALITY",
            "optimizeWaypointOrder": true,
        };
    }


    build(): NearbyPlacesRequestData | DistanceMatrixRequestData | RouteRequestData {
        if (this.requestType === "nearbyPlacesRequest") {
            return this.buildNearbyPlacesRequest();
        }

        if (this.requestType === "distanceMatrixRequest") {
            return this.buildDistanceMatrixRequest();
        }

        if(this.requestType === "routeRequest") {
            return this.buildRouteRequest();
        }

        throw new Error("Invalid request type");
    }
}
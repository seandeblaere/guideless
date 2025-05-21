import { IPlace } from "../domain/interfaces/IPlace";
import { Coordinates } from "../shared/types/Coordinates";
import { NearbyPlacesRequestData } from "../infrastructure/api/dto/NearbyPlacesRequestData";
import { DistanceMatrixRequestData, Waypoint, LocationWaypoint } from "../infrastructure/api/dto/DistanceMatrixRequestData";

export class ApiRequestBuilder {
    private coordinates: Coordinates = {
        latitude: 0,
        longitude: 0,
    };
    private durationMinutes: number = 0;
    private includedTypes: string[] = [];
    private places: IPlace[] = [];
    private requestType: "nearbyPlacesRequest" | "distanceMatrixRequest";
    private averageWalkingSpeed: number = 5;
    private startLocation: Coordinates = {
        latitude: 0,
        longitude: 0,
    };
    private endLocation?:Coordinates;

    constructor(requestType: "nearbyPlacesRequest" | "distanceMatrixRequest") {
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


    build(): NearbyPlacesRequestData | DistanceMatrixRequestData {
        if (this.requestType === "nearbyPlacesRequest") {
            return this.buildNearbyPlacesRequest();
        }

        if (this.requestType === "distanceMatrixRequest") {
            return this.buildDistanceMatrixRequest();
        }

        throw new Error("Invalid request type");
    }
}
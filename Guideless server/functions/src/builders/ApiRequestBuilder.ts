import {IPlace} from "../domain/interfaces/IPlace";
import {POI} from "../domain/models/POI";
import {Coordinates} from "../shared/types/Coordinates";
import {NearbyPlacesRequestData} from "../infrastructure/api/dto/NearbyPlacesRequestData";
import {DistanceMatrixRequestData, Waypoint, LocationWaypoint} from "../infrastructure/api/dto/DistanceMatrixRequestData";
import {RouteRequestData, Intermediate} from "../infrastructure/api/dto/RouteRequestData";
export class ApiRequestBuilder {
  private durationMinutes = 0;
  private includedTypes: string[] = [];
  private places: IPlace[] = [];
  private pois: POI[] = [];
  private requestType: "nearbyPlacesRequest" | "distanceMatrixRequest" | "routeRequest";
  private averageWalkingSpeed = 5;
  private startLocation: Coordinates = {
    latitude: 0,
    longitude: 0,
  };
  private endLocation?:Coordinates;

  constructor(requestType: "nearbyPlacesRequest" | "distanceMatrixRequest" | "routeRequest") {
    this.requestType = requestType;
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
    const waypoints = this.places.map((place) => ({
      waypoint: {
        placeId: place.id,
      },
    }));

    return waypoints;
  }

  private getLocationWaypoint(coordinates: Coordinates): LocationWaypoint {
    return {
      waypoint: {
        location: {
          latLng: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          },
        },
      },
    };
  }

  private getIntermediates(): Intermediate[] {
    return this.pois.map((poi) => ({
      placeId: poi.id,
    }));
  }

  private mergeWaypoints(location?: Coordinates): any[] {
    if (!location) {
      return this.getWaypoints();
    }
    return [this.getLocationWaypoint(location), ...this.getWaypoints()];
  }

  private getSearchArea(): any {
    const MIN_RADIUS = 2000;

    if (this.endLocation && this.endLocation !== this.startLocation) {
        const midpoint = {
            latitude: (this.startLocation.latitude + this.endLocation.latitude) / 2,
            longitude: (this.startLocation.longitude + this.endLocation.longitude) / 2
        };
        
        const startToEndDistance = this.calculateDistance(
            this.startLocation.latitude, this.startLocation.longitude,
            this.endLocation.latitude, this.endLocation.longitude
        );

        const directTravelTime = (startToEndDistance / 1000) / this.averageWalkingSpeed * 60;

        const timeForDetours = this.durationMinutes - directTravelTime;

        let dynamicBuffer;
        
        if (timeForDetours <= 0) {
            dynamicBuffer = 500;
        } else {
            dynamicBuffer = Math.min(
                Math.sqrt(timeForDetours) * 500,
                startToEndDistance * 0.8,
                10000
            );
        }
        
        const radius = Math.max((startToEndDistance / 2) + dynamicBuffer, MIN_RADIUS);
        
        return {
            circle: {
                center: midpoint,
                radius: radius
            }
        };
    } 
    else {
        const durationFactor = Math.max(0.2, 0.4 - (this.durationMinutes / 1000));
        const radius = Math.max(
            (this.durationMinutes/60) * this.averageWalkingSpeed * 1000 * durationFactor,
            MIN_RADIUS
        );
        
        return {
            circle: {
                center: this.startLocation,
                radius: radius
            }
        };
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; 
  }

  private buildNearbyPlacesRequest(): NearbyPlacesRequestData {
    return {
      locationRestriction: this.getSearchArea(),
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
            "longitude": this.startLocation.longitude,
          },
        },
      },
      "destination": {
        "location": {
          "latLng": {
            "latitude": this.endLocation?.latitude ?? this.startLocation.latitude,
            "longitude": this.endLocation?.longitude ?? this.startLocation.longitude,
          },
        },
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

    if (this.requestType === "routeRequest") {
      return this.buildRouteRequest();
    }

    throw new Error("Invalid request type");
  }
}

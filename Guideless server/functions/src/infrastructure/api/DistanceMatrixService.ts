import {RoutesClient,} from "@googlemaps/routing";
import {IPlace} from "../../domain/interfaces/IPlace";
import { API_CALL_OPTIONS} from "../../shared/constants/ApiConstants";
import { DistanceMatrix } from "../../shared/types/DistanceMatrix";
import { ApiRequestBuilder } from "../../builders/ApiRequestBuilder";
import { DistanceMatrixRequestData } from "./dto/DistanceMatrixRequestData";
import { apiConfig } from "../../config/ApiConfig";
import { Coordinates } from "../../shared/types/Coordinates";

export class DistanceMatrixService {
    private routingClient: RoutesClient;
    private distanceMatrix: DistanceMatrix;
    private apiRequestBuilder: ApiRequestBuilder;

    constructor() {
        this.routingClient = new RoutesClient({key: apiConfig.googleMaps.apiKey});
        this.distanceMatrix = new Map();
        this.apiRequestBuilder = new ApiRequestBuilder("distanceMatrixRequest");
    }
    
    public async calculateDistanceMatrix(places: IPlace[], startLocation: Coordinates, endLocation?: Coordinates): Promise<DistanceMatrix> {
        const requestData = this.getRequestData(places, startLocation, endLocation);

        try {
            const stream =  this.routingClient.computeRouteMatrix(requestData, API_CALL_OPTIONS.DISTANCE_MATRIX);

            this.distanceMatrix.set("start_location", new Map<string, number>());

            places.forEach(origin => {
                this.distanceMatrix.set(origin.id, new Map<string, number>());
            });

            if (endLocation) {
                this.distanceMatrix.set("end_location", new Map<string, number>());
            }
            
            await new Promise<void>((resolve) => {
                stream.on("data", (response) => {
                    let originId;
                    let destinationId;

                    if(response.originIndex === 0) {
                        originId = "start_location";
                    } else {
                        originId = places[response.originIndex - 1].id;
                    }
                    
                    if(endLocation && response.destinationIndex === 0) {
                        destinationId = "end_location";
                    } else {
                        const adjustedIndex = endLocation ? response.destinationIndex - 1 : response.destinationIndex;
                        destinationId = places[adjustedIndex].id;
                    }
                    
                    const distanceMap = this.distanceMatrix.get(originId);
                    
                    if (!distanceMap) {
                        throw new Error("Distance map for origin with id " + originId + " not found in distance matrix");
                    }

                    distanceMap.set(destinationId, this.secondsToMinutes(response.duration.seconds));
                });
                
                stream.on("error", (err) => {
                    throw err;
                });
                
                stream.on("end", () => {
                    resolve();
                });
            });
            
            return this.distanceMatrix;

        } catch (error) {
            return new Map();
        }
    }

    private getRequestData(places: IPlace[], startLocation: Coordinates, endLocation?: Coordinates): DistanceMatrixRequestData {
        this.apiRequestBuilder.setPlaces(places);
        this.apiRequestBuilder.setStartLocation(startLocation);
        if (endLocation) {
            this.apiRequestBuilder.setEndLocation(endLocation);
        }
        return this.apiRequestBuilder.build() as DistanceMatrixRequestData;
    }

    private secondsToMinutes(seconds: number): number {
        return Number((seconds / 60).toFixed(2));
    }
}
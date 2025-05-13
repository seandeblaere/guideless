import {RoutesClient,} from "@googlemaps/routing";
import {IPlace} from "../../domain/interfaces/IPlace";
import { API_CALL_OPTIONS} from "../../shared/constants/ApiConstants";
import { DistanceMatrix } from "../../shared/types/DistanceMatrix";
import { ApiRequestBuilder } from "../../builders/ApiRequestBuilder";
import { DistanceMatrixRequestData } from "./dto/DistanceMatrixRequestData";
import { apiConfig } from "../../config/ApiConfig";
import { GoogleDuration } from "../../shared/types/GoogleDuration";
export class RoutingService {
    private routingClient: RoutesClient;
    private distanceMatrix: DistanceMatrix;
    private apiRequestBuilder: ApiRequestBuilder;

    constructor() {
        this.routingClient = new RoutesClient({key: apiConfig.googleMapsApiKey});
        this.distanceMatrix = new Map();
        this.apiRequestBuilder = new ApiRequestBuilder("distanceMatrixRequest");
    }
    
    public async calculateDistanceMatrix(places: IPlace[]): Promise<DistanceMatrix> {
        const requestData = this.getRequestData(places);

        try {
            const stream =  this.routingClient.computeRouteMatrix(requestData, API_CALL_OPTIONS.DISTANCE_MATRIX);

            places.forEach(origin => {
                this.distanceMatrix.set(origin.id, new Map<string, GoogleDuration>());
            });
            
            await new Promise<void>((resolve) => {
                stream.on("data", (response) => {
                    const originId = places[response.originIndex].id;
                    const destinationId = places[response.destinationIndex].id;
                    const distanceMap = this.distanceMatrix.get(originId);
                    
                    if (!distanceMap) {
                        return;
                    }

                    distanceMap.set(destinationId, response.duration);
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

    private getRequestData(places: IPlace[]): DistanceMatrixRequestData {
        this.apiRequestBuilder.setPlaces(places);
        return this.apiRequestBuilder.build() as DistanceMatrixRequestData;
    }
}
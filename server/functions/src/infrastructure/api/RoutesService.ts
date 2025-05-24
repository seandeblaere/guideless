import { RoutesClient } from "@googlemaps/routing";
import { API_CALL_OPTIONS } from "../../shared/constants/ApiConstants";
import { ApiRequestBuilder } from "../../builders/ApiRequestBuilder";
import { apiConfig } from "../../config/ApiConfig";
import { Route } from "../../domain/models/Route";
import { RouteRequestData } from "./dto/RouteRequestData";
import { ComputeRoutesResponse } from "../../shared/types/GoogleMapsTypes";

export class RoutesService {
    private routingClient: RoutesClient;
    private apiRequestBuilder: ApiRequestBuilder;

    constructor() {
        this.routingClient = new RoutesClient({key: apiConfig.googleMapsApiKey});
        this.apiRequestBuilder = new ApiRequestBuilder("routeRequest");
    }
    
    public async computeRoute(route: Route): Promise<ComputeRoutesResponse> {
        // ... existing code ...
    }
} 
import {RoutesClient} from "@googlemaps/routing";
import { API_CALL_OPTIONS} from "../../shared/constants/ApiConstants";
import { ApiRequestBuilder } from "../../builders/ApiRequestBuilder";
import { apiConfig } from "../../config/ApiConfig";
import { Route } from "../../domain/models/Route";
import { RouteRequestData } from "./dto/RouteRequestData";
import { protos } from "@googlemaps/routing";

export class RoutesService {
    private routingClient: RoutesClient;
    private apiRequestBuilder: ApiRequestBuilder;

    constructor() {
        this.routingClient = new RoutesClient({key: apiConfig.googleMaps.apiKey});
        this.apiRequestBuilder = new ApiRequestBuilder("routeRequest");
    }
    
    public async computeRoute(route: Route): Promise<protos.google.maps.routing.v2.IComputeRoutesResponse> {
        const requestData = this.getRequestData(route);

        try {
            const response = await this.routingClient.computeRoutes(requestData, API_CALL_OPTIONS.ROUTE);

            return response[0];

        } catch (error) {
            throw error;
        }
    }

    private getRequestData(route: Route): RouteRequestData {
        this.apiRequestBuilder.setStartLocation(route.startLocation);
        if (route.endLocation) {
            this.apiRequestBuilder.setEndLocation(route.endLocation);
        }

        const filteredPois = route.pois.length > 2 ? route.pois.slice(1, -1) : [];

        this.apiRequestBuilder.setPois(filteredPois);
        return this.apiRequestBuilder.build() as RouteRequestData;
    }
}
import {RoutesClient} from "@googlemaps/routing";
import { API_CALL_OPTIONS} from "../../shared/constants/ApiConstants";
import { ApiRequestBuilder } from "../../builders/ApiRequestBuilder";
import { apiConfig } from "../../config/ApiConfig";
import { Route } from "../../domain/models/Route";
import { RouteRequestData } from "./dto/RouteRequestData";

export class RoutesService {
    private routingClient: RoutesClient;
    private apiRequestBuilder: ApiRequestBuilder;

    constructor() {
        this.routingClient = new RoutesClient({key: apiConfig.googleMapsApiKey});
        this.apiRequestBuilder = new ApiRequestBuilder("routeRequest");
    }
    
    public async computeRoute(route: Route): Promise<any> {
        console.log("calculating route");
        const requestData = this.getRequestData(route);

        console.log("requestData:", requestData);

        try {
            const response = await this.routingClient.computeRoutes(requestData, API_CALL_OPTIONS.ROUTE);

            return response;

        } catch (error) {
            return new Map();
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
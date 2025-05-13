import  { PlacesService }  from "../../infrastructure/api/PlacesService";
import  { RoutingService }  from "../../infrastructure/api/RoutingService";
import { Route } from "../../domain/models/Route";
import { RouteBuilder } from "../../builders/RouteBuilder";
import { RouteState } from "../../domain/models/RouteState";
import { POI } from "../../domain/models/POI";

export class RouteGenerator {
        private placesService: PlacesService;
        private routingService: RoutingService;
        private routeBuilder: RouteBuilder;

    constructor() {
        this.placesService = new PlacesService();
        this.routingService = new RoutingService();
        this.routeBuilder = new RouteBuilder();
    }

    async generateRoute(request: any): Promise<Route> {
        const places = await this.placesService.searchNearbyPlaces(request);
        const distanceMatrix = await this.routingService.calculateDistanceMatrix(places);

        const pois = places.map(place => {
            return new POI(place);
        });

        pois.forEach(poi => {
            poi.distances = distanceMatrix.get(poi.id) ?? new Map();
        });
        
        this.routeBuilder.withStartLocation(request.startLocation)
            .withDuration(request.duration)
            .withThemeCategories(request.themeCategories)
            .withMaxPOIs(request.maxPOICount)
            .asRoundTrip(request.isRoundTrip)
        if(request.endLocation && !request.isRoundTrip) {
            this.routeBuilder.withEndLocation(request.endLocation);
        }
        const route = this.routeBuilder.build();

        const routeState = await RouteState.initialize(route, pois);

        return routeState.route;
    }
}

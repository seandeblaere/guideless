import  { PlacesService }  from "../../infrastructure/api/PlacesService";
import  { DistanceMatrixService }  from "../../infrastructure/api/DistanceMatrixService";
import { RouteBuilder } from "../../builders/RouteBuilder";
import { RouteState } from "../../domain/models/RouteState";
import { POI } from "../../domain/models/POI";
import { RouteOptimizer } from "./RouteOptimizer";
import { ClientRequest } from "../../infrastructure/api/dto/ClientRequestData";
import { getThemeTypes } from "../../infrastructure/firebase/ThemeRepository";
import { RoutesService } from "../../infrastructure/api/RoutesService";
export class RouteGenerator {
        private placesService: PlacesService;
        private distanceMatrixService: DistanceMatrixService;
        private routeBuilder: RouteBuilder;
        private routesService: RoutesService;

    constructor() {
        this.placesService = new PlacesService();
        this.distanceMatrixService = new DistanceMatrixService();
        this.routeBuilder = new RouteBuilder();
        this.routesService = new RoutesService();
    }

    async generateRoute(request: ClientRequest): Promise<any> {
        const themeTypes = await getThemeTypes(request.themeCategories);

        const places = await this.placesService.searchNearbyPlaces({
            coordinates: request.startLocation,
            durationMinutes: request.durationMinutes,
            includedTypes: themeTypes,
        });

        const distanceMatrix = await this.distanceMatrixService.calculateDistanceMatrix(places, request.startLocation, request.endLocation);

        console.log("distanceMatrix:", distanceMatrix);

        const pois = places.map(place => {
            return new POI(place);
        });

        console.log("pois without distances:", pois);

        const startPOI = POI.createLocationPOI(true);

        console.log("startPOI:", startPOI);

        let endPOI: POI | undefined;

        if(request.endLocation) {
            endPOI = POI.createLocationPOI(false);
            console.log("endPOI:", endPOI);
        }

        pois.forEach(poi => {
            poi.distances = distanceMatrix.get(poi.id) ?? new Map();

            if(distanceMatrix.has("start_location")) {
                const startToPoiDistance = distanceMatrix.get("start_location")?.get(poi.id);
                if(startToPoiDistance) {
                    poi.distances.set("start_location", startToPoiDistance);
                }
            }
            
            if(endPOI && distanceMatrix.has("end_location")) {
                const poiToEndDistance = distanceMatrix.get(poi.id)?.get("end_location");
                if(poiToEndDistance) {
                    poi.distances.set("end_location", poiToEndDistance);
                }
            }
        });

        console.log("pois with distances:", pois);

        startPOI.distances = distanceMatrix.get("start_location") ?? new Map();
        console.log("startPOI with distances:", startPOI);
        if(endPOI) {
            endPOI.distances = distanceMatrix.get("end_location") ?? new Map();
            console.log("endPOI with distances:", endPOI);
        }
        
        this.routeBuilder.withStartLocation(request.startLocation)
            .withDuration(request.durationMinutes)
            .withThemeCategories(request.themeCategories)
            .withMaxPOIs(request.maxPOICount)
            .asRoundTrip(request.isRoundTrip)

        if(request.endLocation && !request.isRoundTrip) {
            this.routeBuilder.withEndLocation(request.endLocation);
        }

        const route = this.routeBuilder.build();

        console.log("route:", route);

        route.insertPOI(startPOI, 0, 0);
        if(endPOI && !request.isRoundTrip) {
            route.insertPOI(endPOI, route.pois.length, startPOI.getDistanceToPOI("end_location"));
        }
        else if(endPOI && request.isRoundTrip) {
            route.insertPOI(endPOI, route.pois.length, 0);
        }

        console.log("route after inserting start and end POIs:", route);

        const routeState = await RouteState.initialize(route, pois);

        console.log("routeState initialized:", routeState);

        const optimizedRouteState = RouteOptimizer.optimize(routeState);

        console.log("optimizedRouteState:", optimizedRouteState);

        const computedRoute = await this.routesService.computeRoute(optimizedRouteState.route);

        console.log("computedRoute:", computedRoute);

        return computedRoute;
    }
}

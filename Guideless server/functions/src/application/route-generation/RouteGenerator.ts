import  { PlacesService }  from "../../infrastructure/api/PlacesService";
import  { DistanceMatrixService }  from "../../infrastructure/api/DistanceMatrixService";
import { RouteBuilder } from "../../builders/RouteBuilder";
import { RouteState } from "../../domain/models/RouteState";
import { POI } from "../../domain/models/POI";
import { RouteOptimizer } from "./RouteOptimizer";
import { ClientRequest } from "../../infrastructure/api/dto/ClientRequestData";
import { getThemeTypes } from "../../infrastructure/firebase/ThemeRepository";
import { RoutesService } from "../../infrastructure/api/RoutesService";
import { DistanceMatrix } from "../../shared/types/DistanceMatrix";
import { Route } from "../../domain/models/Route";
import { protos } from "@googlemaps/routing";

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

    async generateRoute(request: ClientRequest): Promise<protos.google.maps.routing.v2.IComputeRoutesResponse> {
        const themeTypes = await getThemeTypes(request.themeCategories);

        const places = await this.placesService.searchNearbyPlaces({
            coordinates: request.startLocation,
            durationMinutes: request.durationMinutes,
            includedTypes: themeTypes,
        });

        if(places.length <= 0) {
            throw new Error("No places found");
        }

        const distanceMatrix = await this.distanceMatrixService.calculateDistanceMatrix(places, request.startLocation, request.endLocation);

        if(!distanceMatrix.has("start_location")) {
            throw new Error("Start location not found in distance matrix");
        }

        if(request.endLocation && !distanceMatrix.has("end_location")) {
            throw new Error("End location not found in distance matrix");
        }

        const pois = places.map(place => {
            return new POI(place);
        });

        const startPOI = POI.createLocationPOI(true);

        const endPOI = POI.createLocationPOI(false);

        this.addDistancesToPOIs(pois, distanceMatrix, startPOI, endPOI, request.isRoundTrip);

        const route = this.buildRoute(request, startPOI, endPOI);

        const routeState = await RouteState.initialize(route, pois);

        const optimizedRouteState = RouteOptimizer.optimize(routeState);

        const computedRoute = await this.routesService.computeRoute(optimizedRouteState.route);

        return computedRoute;
    }

    private addDistancesToPOIs(pois: POI[], distanceMatrix: DistanceMatrix, startPOI: POI, endPOI: POI, isRoundTrip: boolean) {
        pois.forEach(poi => {
            const distances = distanceMatrix.get(poi.id);

            if(!distances) {
                throw new Error("POI not found in distance matrix");
            }

            poi.distances = distances;

            const startToPoiDistance = distanceMatrix.get("start_location")?.get(poi.id);

            if(!startToPoiDistance) {
                throw new Error("Start to POI distance not found in distance matrix");
            }

            poi.distances.set("start_location", startToPoiDistance);
            
            if(isRoundTrip) {
                poi.distances.set("end_location", startToPoiDistance);
            }
            else {
                const poiToEndDistance = distanceMatrix.get(poi.id)?.get("end_location");

                if(!poiToEndDistance) {
                    throw new Error("POI to end distance not found in distance matrix");
                }

                poi.distances.set("end_location", poiToEndDistance);
            }
        });

        const startPOIDistances = distanceMatrix.get("start_location");

        if(!startPOIDistances) {
            throw new Error("Start POI distances not found in distance matrix");
        }

        startPOI.distances = startPOIDistances;

        if(isRoundTrip) {
            endPOI.distances = startPOIDistances;
        }
        else {
            const endPOIDistances = distanceMatrix.get("end_location");

            if(!endPOIDistances) {
                throw new Error("End POI distances not found in distance matrix");
            }

            endPOI.distances = endPOIDistances;
        }
    }

    private buildRoute(request: ClientRequest, startPOI: POI, endPOI: POI): Route {
        this.routeBuilder.withStartLocation(request.startLocation)
            .withDuration(request.durationMinutes)
            .withThemeCategories(request.themeCategories)
            .withMaxPOIs(request.maxPOICount)
            .asRoundTrip(request.isRoundTrip)

        if(request.endLocation && !request.isRoundTrip) {
            this.routeBuilder.withEndLocation(request.endLocation);
        }

        const route = this.routeBuilder.build();

        route.insertPOI(startPOI, 0, 0);

        if(request.isRoundTrip) {
            route.insertPOI(endPOI, 1, 0);
        }
        else {
            route.insertPOI(endPOI, 1, startPOI.getDistanceToPOI("end_location"));
        }

        return route;
    }
}

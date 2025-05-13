import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as test from "./test-data";
import {PlacesService} from "./infrastructure/api/PlacesService";
import { getThemeTypes } from "./infrastructure/firebase/ThemeRepository";
import {RoutingService} from "./infrastructure/api/RoutingService";
import { POI } from "./domain/models/POI";
import { RouteState } from "./domain/models/RouteState";
import { RouteBuilder } from "./builders/RouteBuilder";

admin.initializeApp();
export const db = admin.firestore();

export const getMatrix = onRequest(async (req, res) => {
    try {
        const themeTypes = await getThemeTypes(test.clientRequest.themeCategories);

        const places = await PlacesService.searchNearbyPlaces({coordinates: test.clientRequest.startLocation, durationMinutes: test.clientRequest.durationMinutes, includedTypes: themeTypes});

        const distanceMatrix = await RoutingService.calculateDistanceMatrix(places);

        const pois = places.map(place => {
            return new POI(place);
        });

        pois.forEach(poi => {
            poi.distances = distanceMatrix.get(poi.id) ?? new Map();
        });

        const route = new RouteBuilder().withStartLocation(test.clientRequest.startLocation).asRoundTrip().withDuration(test.clientRequest.durationMinutes).withMaxPOIs(test.clientRequest.maxPOICount).withThemeCategories(test.clientRequest.themeCategories).build();

        const routeState = await RouteState.initialize(route, pois);

        const availablePois = routeState.availablePois;

        const result = availablePois.map(poi => {
            return {
                id: poi.id,
                name: poi.name,
                types: poi.types,
                themeScore: poi.themeScore,
                qualityScore: poi.qualityScore,
                clusterScore: poi.clusterScore,
                baseScore: poi.baseScore,
            };
        });

        res.status(200).send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});


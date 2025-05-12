import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as test from "./test-data";
/*import PlacesService from "./services/api/PlacesService";
import RoutingService from "./services/api/RoutingService";
import { ClientRequest } from "./types/requests/ClientRequestData";
import { getThemeTypes } from "./firestore/getThemeTypes";*/


admin.initializeApp();
export const db = admin.firestore();

export const getMatrix = onRequest(async (req, res) => {
    try {
        /*const themeTypes = await getThemeTypes(fakeRequest.themeCategories);

        const POI = await PlacesService.searchNearbyPlaces({coordinates: fakeRequest.startLocation, durationMinutes: fakeRequest.durationMinutes, includedTypes: themeTypes});

        const distanceMatrix = await RoutingService.calculateDistanceMatrix(POI);

        const result = Object.fromEntries(
            Array.from(distanceMatrix.entries()).map(([originId, destinations]) => [
                originId, 
                Object.fromEntries(destinations)
            ])
        );*/
        res.status(200).send(test.calculateDistanceMatrixResponseAsJson);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});


import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { RouteGenerator } from "./application/route-generation/RouteGenerator";

admin.initializeApp();
export const db = admin.firestore();

export const getRoute = onRequest(async (req, res) => {
    try {

        const routeGenerator = new RouteGenerator();
        const route = await routeGenerator.generateRoute(req.body);

        res.status(200).send(route);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});


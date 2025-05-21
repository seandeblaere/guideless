import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { RouteGenerator } from "./application/route-generation/RouteGenerator";

admin.initializeApp();
export const db = admin.firestore();

export const getRoute = onRequest(async (req, res) => {
    try {
        const request = req.body;

        console.log("request received:", request);

        const routeGenerator = new RouteGenerator();
        const route = routeGenerator.generateRoute(request);

        console.log("route generated:", route);

        res.status(200).send("route generated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});


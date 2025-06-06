import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { RouteGenerator } from "./application/route-generation/RouteGenerator";
import { onDocumentCreated } from "firebase-functions/firestore";
import { ContentGenerator } from "./application/content-generation/ContentGenerator";
import { IRouteDocument } from "./domain/interfaces/IRouteDocument";
import { ContentGenerationStatus } from "./shared/enums/ContentGenerationStatus";

admin.initializeApp();
export const db = admin.firestore();

export const getRoute = onRequest(async (req, res) => {
    try {
        const userId = "test-user";
        const routeGenerator = new RouteGenerator();
        const route = await routeGenerator.generateRoute(userId, req.body);

        res.status(200).send(route);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to generate route: " + error });
    }
});

export const generateRouteContent = onDocumentCreated(
    "users/{userId}/routes/{routeId}",
    async (event) => {
        try {
            const routeData = event.data?.data();
            const userId = event.params.userId;
            const routeId = event.params.routeId;

            if (!routeData || routeData.contentGenerationStatus !== ContentGenerationStatus.PENDING) {
                console.log('Route content generation not needed or already processed');
                return;
            }

            console.log(`Generating content for route ${routeId} for user ${userId}`);
            
            const contentGenerator = new ContentGenerator(userId, routeId, routeData as IRouteDocument);
            await contentGenerator.generateRouteContent();

        } catch (error) {
            console.error('Error generating route content:', error);
        }
    }
);


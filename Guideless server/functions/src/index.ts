import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {RouteGenerator} from "./application/route-generation/RouteGenerator";
import {onDocumentCreated} from "firebase-functions/firestore";
import {ContentGenerator} from "./application/content-generation/ContentGenerator";
import {IRouteDocument} from "./domain/interfaces/IRouteDocument";
import {ContentGenerationStatus} from "./shared/enums/ContentGenerationStatus";
import {POIVisitService} from "./application/poi/POIVisitService";
import {StoreService} from "./infrastructure/firebase/StoreService";

admin.initializeApp();
export const db = admin.firestore();

export const generateRoute = onCall(async (req) => {
  try {
    const userId = req.auth?.uid;

    if (!userId) {
      throw new HttpsError("unauthenticated", "User is not authenticated");
    }

    if(!req.data) {
      throw new HttpsError("invalid-argument", "Missing required parameters");
    }

    const routeGenerator = new RouteGenerator();
    const result = await routeGenerator.generateRoute(userId, req.data);
    return result;
  } catch (error) {
    return {
      success: false,
      message: "Failed to generate route: " + error,
    };
  }
});

export const visitPOI = onCall(async (req) => {
  try {
    const userId = req.auth?.uid;
    const {routeId, poiId} = req.data;

    if (!userId) {
      throw new HttpsError("unauthenticated", "User is not authenticated");
    }

    if (!routeId || !poiId) {
      throw new HttpsError("invalid-argument", "Missing required parameters: routeId and poiId");
    }

    const poiVisitService = new POIVisitService();
    const result = await poiVisitService.visitPOI(userId, routeId, poiId);

    return result;
  } catch (error) {
    return {
      success: false,
      message: `Failed to visit POI: ${error}`,
    };
  }
});

export const getActiveRoute = onCall(async (req) => {
  try {
    const userId = req.auth?.uid;

    if (!userId) {
      throw new HttpsError("unauthenticated", "User is not authenticated");
    }

    const storeService = new StoreService();

    const result = await storeService.getActiveRoute(userId);

    return result;
  } catch (error) {
    return {
      success: false,
      message: `Failed to get active route: ${error}`,
    };
  }
});

export const generateRouteContent = onDocumentCreated(
  "users/{userId}/routes/{routeId}",
  async (event) => {
    const routeData = event.data?.data();
    const userId = event.params.userId;
    const routeId = event.params.routeId;

    if (!routeData || routeData.contentGenerationStatus !== ContentGenerationStatus.PENDING) {
      return;
    }

    const contentGenerator = new ContentGenerator(userId, routeId, routeData as IRouteDocument);
    await contentGenerator.generateRouteContent();
  }
);

export const finishRoute = onCall(async (req) => {
  try {
    const userId = req.auth?.uid;
    const {routeId} = req.data;

    if (!userId) {
      throw new HttpsError("unauthenticated", "User is not authenticated");
    }

    if (!routeId) {
      throw new HttpsError("invalid-argument", "Missing required parameters: routeId");
    }

    const storeService = new StoreService();
    const result = await storeService.finishRoute(userId, routeId);

    return result;
  } catch (error) {
    return {
      success: false,
      message: `Failed to finish route: ${error}`,
    };
  }
});
import {db} from "../../index";
import {Timestamp} from "firebase-admin/firestore";
import {IRouteDocument} from "../../domain/interfaces/IRouteDocument";
import {POIDocument} from "../../domain/interfaces/IPOIDocument";
import {RouteStatus} from "../../shared/enums/RouteStatus";
import {ContentGenerationStatus} from "../../shared/enums/ContentGenerationStatus";

export interface ActiveRouteResponse {
    success: boolean;
    route: IRouteDocument | null;
    pois: POIDocument[];
    message: string;
}

export class StoreService {
  async saveRoute(userId: string, routeData: IRouteDocument, pois: POIDocument[]): Promise<{ route: IRouteDocument, pois: POIDocument[] }> {
    try {
      const routeRef = db.collection("users").doc(userId).collection("routes").doc();

      const routeDoc: IRouteDocument = {
        ...routeData,
        id: routeRef.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: RouteStatus.GENERATED,
        visitedPOIs: 0,
        manuallyCompleted: false,
        destinationReached: false,
        contentGenerationStatus: ContentGenerationStatus.PENDING,
      };

      await routeRef.set(routeDoc);

      const batch = db.batch();
      const poisRef = routeRef.collection("pois");

      const storedPOIs: POIDocument[] = [];

      pois.forEach((poi, index) => {
        const poiRef = poisRef.doc();
        const poiDoc: POIDocument = {
          ...poi,
          id: poiRef.id,
          routeIndex: index,
          visited: false,
          contentReady: false,
          skipped: false,
          locationRegion: {...poi.locationRegion, identifier: poiRef.id},
        };
        batch.set(poiRef, poiDoc);
        storedPOIs.push(poiDoc);
      });

      await batch.commit();

      return {
        route: routeDoc,
        pois: storedPOIs,
      };
    } catch (error) {
      throw new Error("Failed to save route to database with error: " + error);
    }
  }

  async getActiveRoute(userId: string): Promise<ActiveRouteResponse> {
    try {
      const routesRef = db.collection("users").doc(userId).collection("routes");

      const routeQuery = await routesRef
        .where("status", "in", [RouteStatus.GENERATED, RouteStatus.ACTIVE])
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (routeQuery.empty) {
        return {
          success: false,
          route: null,
          pois: [],
          message: "No active route found",
        };
      }

      const routeDoc = routeQuery.docs[0];
      const routeData = {...routeDoc.data()} as IRouteDocument;

      const poisQuery = await routeDoc.ref
        .collection("pois")
        .orderBy("routeIndex", "asc")
        .get();

      const pois: POIDocument[] = poisQuery.docs.map((doc) => ({
        ...doc.data(),
      } as POIDocument));

      return {
        success: true,
        route: routeData,
        pois: pois,
        message: "Active route retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        route: null,
        pois: [],
        message: `Failed to get active route: ${error}`,
      };
    }
  }

  async finishRoute(userId: string, routeId: string): Promise<{ success: boolean, message: string }> {
    try {
      const routeRef = db.collection("users").doc(userId).collection("routes").doc(routeId);
      const doc = await routeRef.get();
      if (!doc.exists) {
        return { success: false, message: "Route not found" };
      }
      await routeRef.update({ status: RouteStatus.COMPLETED});
      return { success: true, message: "Route finished successfully" };
    } catch (error) {
      throw new Error("Failed to finish route with error: " + error);
    }
  } 
}

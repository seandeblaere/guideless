import {db} from "../../index";
import {Timestamp} from "firebase-admin/firestore";
import {POIDocument} from "../../domain/interfaces/IPOIDocument";
import {IRouteDocument} from "../../domain/interfaces/IRouteDocument";

export interface POIVisitResponse {
    success: boolean;
    poi: POIDocument | null;
    routeProgress: {
        visitedPOIs: number;
        totalPOIs: number;
        completionPercentage: number;
        routeCompleted: boolean;
    };
    message: string;
}

export class POIVisitService {
  async visitPOI(userId: string, routeId: string, poiId: string): Promise<POIVisitResponse> {
    try {
      const routeRef = db.collection("users").doc(userId).collection("routes").doc(routeId);
      const poiRef = routeRef.collection("pois").doc(poiId);

      return await db.runTransaction(async (transaction) => {
        const [routeDoc, poiDoc] = await Promise.all([
          transaction.get(routeRef),
          transaction.get(poiRef),
        ]);

        if (!routeDoc.exists) {
          return {
            success: false,
            poi: null,
            routeProgress: {visitedPOIs: 0, totalPOIs: 0, completionPercentage: 0, routeCompleted: false},
            message: "Route not found",
          };
        }

        if (!poiDoc.exists) {
          return {
            success: false,
            poi: null,
            routeProgress: {visitedPOIs: 0, totalPOIs: 0, completionPercentage: 0, routeCompleted: false},
            message: "POI not found",
          };
        }

        const routeData = routeDoc.data() as IRouteDocument;
        const poiData = poiDoc.data() as POIDocument;

        if (poiData.visited) {
          const completionPercentage = (routeData.visitedPOIs / routeData.totalPOIs) * 100;
          return {
            success: true,
            poi: poiData,
            routeProgress: {
              visitedPOIs: routeData.visitedPOIs,
              totalPOIs: routeData.totalPOIs,
              completionPercentage: Math.round(completionPercentage),
              routeCompleted: routeData.visitedPOIs >= routeData.totalPOIs,
            },
            message: "POI already visited",
          };
        }

        const updatedPOI: Partial<POIDocument> = {
          visited: true,
          visitedAt: Timestamp.now(),
        };

        const newVisitedCount = routeData.visitedPOIs + 1;
        const completionPercentage = (newVisitedCount / routeData.totalPOIs) * 100;
        const routeCompleted = newVisitedCount >= routeData.totalPOIs;

        const updatedRoute: Partial<IRouteDocument> = {
          visitedPOIs: newVisitedCount,
          updatedAt: Timestamp.now(),
        };

        if (routeCompleted && !routeData.completedAt) {
          updatedRoute.completedAt = Timestamp.now();
        }

        transaction.update(poiRef, updatedPOI);
        transaction.update(routeRef, updatedRoute);

        const finalPOIData: POIDocument = {...poiData, ...updatedPOI};

        return {
          success: true,
          poi: finalPOIData,
          routeProgress: {
            visitedPOIs: newVisitedCount,
            totalPOIs: routeData.totalPOIs,
            completionPercentage: Math.round(completionPercentage),
            routeCompleted: routeCompleted,
          },
          message: "POI visited successfully",
        };
      });
    } catch (error: any) {
      return {
        success: false,
        poi: null,
        routeProgress: {visitedPOIs: 0, totalPOIs: 0, completionPercentage: 0, routeCompleted: false},
        message: `Failed to update POI: ${error}`,
      };
    }
  }
}

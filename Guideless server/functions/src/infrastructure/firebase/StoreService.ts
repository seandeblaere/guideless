import { db } from "../../index";
import { Timestamp } from 'firebase-admin/firestore';
import { IRouteDocument } from '../../domain/interfaces/IRouteDocument';
import { POIDocument } from '../../domain/interfaces/IPOIDocument';
import { RouteStatus } from '../../shared/enums/RouteStatus';
import { ContentGenerationStatus } from '../../shared/enums/ContentGenerationStatus';

export class StoreService {
    async saveRoute(userId: string, routeData: IRouteDocument, pois: POIDocument[]): Promise<string> {
        try {
            const routeRef = db.collection('users').doc(userId).collection('routes').doc();
            
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

                polyline: routeData.polyline,
                distanceMeters: routeData.distanceMeters,
                durationSeconds: routeData.durationSeconds,
                optimizedIntermediateWaypointIndex: routeData.optimizedIntermediateWaypointIndex,
                totalPOIs: routeData.totalPOIs,
            };

            await routeRef.set(routeDoc);

            const batch = db.batch();
            const poisRef = routeRef.collection('pois');

            pois.forEach((poi, index) => {
                const poiRef = poisRef.doc();
                const poiDoc: POIDocument = {
                    ...poi,
                    id: poiRef.id,
                    routeIndex: index,
                    visited: false,
                    contentReady: false,
                    skipped: false
                };
                batch.set(poiRef, poiDoc);
            });

            await batch.commit();

            return routeRef.id;

        } catch (error) {
            throw new Error('Failed to save route to database with error: ' + error);
        }
    }
}
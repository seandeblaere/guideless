import { Timestamp } from 'firebase-admin/firestore';
import { RouteStatus } from '../../shared/enums/RouteStatus';
import { RouteType } from '../../shared/enums/RouteType';
import { ThemeCategory } from '../../shared/types/ThemeCategory';
import { ContentGenerationStatus } from '../../shared/enums/ContentGenerationStatus';
import { LocationInfo } from '../../shared/types/LocationInfo';

export interface IRouteDocument {
  id?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: RouteStatus;
  
  routeType: RouteType;
  themes: ThemeCategory[];
  maxDurationMinutes: number;
  maxPOICount: number;
  
  startLocation: LocationInfo;
  endLocation: LocationInfo | null;
  
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
  optimizedIntermediateWaypointIndex: number[];
  
  totalPOIs: number;
  visitedPOIs: number;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  manuallyCompleted: boolean;
  destinationReached: boolean;
  
  contentGenerationStatus: ContentGenerationStatus;
}
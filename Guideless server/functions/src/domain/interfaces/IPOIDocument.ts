import { Timestamp } from "firebase-admin/firestore";
import { POIContent } from "./IPOIContent";
import { GeofenceLocationRegion } from "../../shared/types/GeofenceLocationRegion";

export interface POIDocument {
  id?: string;
  name: string;
  placeId: string;
  types: string[];
  
  routeIndex: number;
  isStartPoint: boolean;
  isEndPoint: boolean;
  
  visited: boolean;
  visitedAt: Timestamp | null;
  
  locationRegion: GeofenceLocationRegion;
  
  content: POIContent | null;
  contentReady: boolean;
  
  skipped: boolean;
  skippedAt: Timestamp | null;
}
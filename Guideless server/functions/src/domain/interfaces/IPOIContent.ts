import { Timestamp } from "firebase-admin/firestore";
import { ContentType } from "../../shared/enums/ContentType";

export interface POIContent {
    contentTypes: ContentType[];
    story: string | null;
    funFact: string | null;
    description: string | null;
    historicalContext: string | null;
    localTips: string | null;
    generatedAt: Timestamp | null;
}
import {Timestamp} from "firebase-admin/firestore";
import {ContentType} from "../../shared/enums/ContentType";

export interface POIContent {
    contentTypes: ContentType[];
    content: string | null;
    generatedAt: Timestamp | null;
}

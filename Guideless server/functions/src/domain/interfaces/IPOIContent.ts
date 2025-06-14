import {Timestamp} from "firebase-admin/firestore";
import {ContentType} from "../../shared/enums/ContentType";

export interface POIContentStructured {
    [ContentType.STORY]?: string;
    [ContentType.FOOD_TIP]?: string;
    [ContentType.NATURE_INFO]?: string;
    [ContentType.FUN_FACT]?: string;
    [ContentType.HISTORICAL_CONTEXT]?: string;
    [ContentType.DESCRIPTION]?: string;
  }
  
export interface POIContent {
    contentTypes: ContentType[];
    content: POIContentStructured;
    generatedAt: Timestamp;
}
  

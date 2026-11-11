export interface OcrBoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface OcrResult {
  text: string;
  bounding_box: OcrBoundingBox;
}

export default interface Product {
  id: number;
  productName: string;
  brand: string;
  category: string;
  skuId: string;
  images: string[];
  pricePerPiece: number;
  stockQuantity: number;
  unitOfMeasurement: string;
  documents: string[];
  features: string;
  specifications: string;
  notes: string;
  gst: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
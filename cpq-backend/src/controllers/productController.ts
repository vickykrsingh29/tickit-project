import { NextFunction, Request, Response } from "express";
import { customAlphabet } from "nanoid";
import { deleteFromBlob } from "../config/storage";
import { AuthenticatedRequest } from "../middlewares/auth";
import { uploadToBlob } from "../middlewares/upload";
import { Product } from "../models/Product";
import { User } from "../models/User";

// Get all products for authenticated user's company
export const getProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.auth?.sub;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const products = await Product.findAll({
      where: { companyName: user.companyName }, // Filter by company
    });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// Get product by SKU
export const getProductById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const product = await Product.findOne({
      where: {
        skuId: req.params.skuId,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// Get product by name

export const getProductByName = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const product = await Product.findOne({
      where: { productName: req.params.productName },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// Create new product
// Create a new product with image and document uploads
// Create new product with company association
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    console.log("Received files:", Object.keys(files)); // Log received file fields

    const productData = req.body;

    // Handle image uploads
    if (files?.images || files?.image) {
      try {
        const imageFiles = files.images || files.image;
        const imageUrls = await Promise.all(
          imageFiles.map((file) => uploadToBlob(file))
        );
        productData.images = imageUrls;
        console.log("Images uploaded successfully:", imageUrls);
      } catch (error) {
        console.error("Image upload error:", error);
        return res.status(500).json({ error: "Failed to upload images" });
      }
    }

    // Handle document uploads
    if (files?.documents || files?.document) {
      try {
        const documentFiles = files.documents || files.document;
        const documentUrls = await Promise.all(
          documentFiles.map((file) => uploadToBlob(file))
        );
        productData.documents = documentUrls;
        console.log("Documents uploaded successfully:", documentUrls);
      } catch (error) {
        console.error("Document upload error:", error);
        return res.status(500).json({ error: "Failed to upload documents" });
      }
    }

    const {
      productName,
      brand,
      category,
      skuId,
      pricePerPiece,
      stockQuantity,
      unitOfMeasurement,
      gst,
      features,
      specifications,
      notes,
    } = req.body;

    const userId = req.auth?.sub;
    // Look up the authenticated user to get companyName
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const gstValue = parseFloat(gst);
    const pricePerPieceNumber = parseFloat(pricePerPiece);
    const priceWithGST =
      pricePerPieceNumber + (gstValue / 100) * pricePerPieceNumber;

    const newProduct = await Product.create({
      productName,
      brand,
      category,
      skuId,
      pricePerPiece: pricePerPieceNumber,
      gst: gstValue,
      priceWithGST,
      stockQuantity,
      unitOfMeasurement,
      features,
      specifications,
      notes,
      images: productData.images,
      documents: productData.documents,
      userId,
      companyName: user.companyName, // Automatically set using user's company
    });

    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

// Update product
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let productData: any;

    try {
      productData = JSON.parse(req.body.product || "{}");
    } catch (e) {
      productData = req.body;
    }

    console.log("Received product data:", productData);
    console.log("SKU ID from params:", req.params.skuId);

    // Find product by skuId instead of id
    const product = await Product.findOne({
      where: { skuId: req.params.skuId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Handle file deletions
    const documentsToDelete = JSON.parse(req.body.documentsToDelete || "[]");
    const imagesToDelete = JSON.parse(req.body.imagesToDelete || "[]");

    // Filter out deleted files
    const remainingDocuments = (product.documents || []).filter(
      (doc) => !documentsToDelete.includes(doc)
    );
    const remainingImages = (product.images || []).filter(
      (img) => !imagesToDelete.includes(img)
    );

    // Handle new file uploads
    let newImageUrls: string[] = [];
    let newDocumentUrls: string[] = [];

    if (files?.images || files?.image) {
      const imageFiles = files.images || files.image;
      newImageUrls = await Promise.all(
        imageFiles.map((file) => uploadToBlob(file))
      );
      console.log("New images uploaded:", newImageUrls);
    }

    if (files?.documents || files?.document) {
      const documentFiles = files.documents || files.document;
      newDocumentUrls = await Promise.all(
        documentFiles.map((file) => uploadToBlob(file))
      );
      console.log("New documents uploaded:", newDocumentUrls);
    }

    // Delete old files from storage
    if (documentsToDelete.length > 0 || imagesToDelete.length > 0) {
      try {
        await Promise.all([
          ...documentsToDelete.map((doc: string) => deleteFromBlob(doc)),
          ...imagesToDelete.map((img: string) => deleteFromBlob(img)),
        ]);
        console.log("Successfully deleted files from storage");
      } catch (error) {
        console.error("Error deleting files from storage:", error);
      }
    }

    // Update product record
    const updateData = {
      ...productData,
      images: [...remainingImages, ...newImageUrls],
      documents: [...remainingDocuments, ...newDocumentUrls],
      // Remove tracking fields
      documentsToDelete: undefined,
      imagesToDelete: undefined,
      existingDocuments: undefined,
      existingImages: undefined,
    };

    // Update fields if provided
    await product.update(updateData);

    // Fetch updated product
    const updatedProduct = await Product.findOne({
      where: { skuId: req.params.skuId },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error in updateProduct:", error);
    next(error);
  }
};

// Delete product
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { skuIds } = req.body; // Expecting an array of SKU IDs

    if (!skuIds || !Array.isArray(skuIds)) {
      return res.status(400).json({ message: "Invalid SKU IDs provided." });
    }

    // First, get all products that will be deleted to access their files
    const productsToDelete = await Product.findAll({
      where: { skuId: skuIds },
    });

    if (productsToDelete.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found with the provided SKU IDs." });
    }

    // Collect all file URLs that need to be deleted
    const filesToDelete: string[] = [];
    productsToDelete.forEach((product) => {
      if (product.images) filesToDelete.push(...product.images);
      if (product.documents) filesToDelete.push(...product.documents);
    });

    // Delete the products from database
    await Product.destroy({
      where: { skuId: skuIds },
    });

    // Delete files from blob storage
    if (filesToDelete.length > 0) {
      try {
        await Promise.all(
          filesToDelete.map((fileUrl) => deleteFromBlob(fileUrl))
        );
        console.log("Successfully deleted associated files from storage");
      } catch (error) {
        console.error("Error deleting files from storage:", error);
        // Don't throw error as products are already deleted from database
      }
    }

    res.status(200).json({
      message: "Product(s) and associated files deleted successfully.",
      deletedCount: productsToDelete.length,
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    next(error);
  }
};

// Get all brands
export const getAllBrands = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const brands = await Product.findAll({
      attributes: ["brand"],
      group: ["brand"],
      order: [["brand", "ASC"]],
    });

    const formattedBrands = brands.map((brand) => ({
      label: brand.brand,
      value: brand.brand,
    }));

    res.status(200).json(formattedBrands);
  } catch (error) {
    next(error);
  }
};

// Get all categories
export const getAllCategories = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const categories = await Product.findAll({
      attributes: ["category"],
      group: ["category"],
      order: [["category", "ASC"]],
    });

    const formattedCategories = categories.map((category) => ({
      label: category.category,
      value: category.category,
    }));

    res.status(200).json(formattedCategories);
  } catch (error) {
    next(error);
  }
};

// Get all units of measurement
export const getAllUnits = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const units = await Product.findAll({
      attributes: ["unitOfMeasurement"],
      group: ["unitOfMeasurement"],
      order: [["unitOfMeasurement", "ASC"]],
    });

    const formattedUnits = units.map((unit) => ({
      label: unit.unitOfMeasurement,
      value: unit.unitOfMeasurement,
    }));

    res.status(200).json(formattedUnits);
  } catch (error) {
    next(error);
  }
};

// Get all products

export const getAllProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const products = await Product.findAll({
      attributes: ["productName"],
      group: ["productName"],
      order: [["productName", "ASC"]],
    });

    const formattedProducts = products.map((product) => ({
      label: product.productName,
      value: product.productName,
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    next(error);
  }
};

// Generate a unique SKU ID
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const skuIdLength = 4;
const generateCustomSkuId = customAlphabet(alphabet, skuIdLength);

export const generateSkuId = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let unique = false;
    let newSkuId = "";

    while (!unique) {
      newSkuId = generateCustomSkuId(); // e.g., 'A1B2C3D4'
      const existingProduct = await Product.findOne({
        where: { skuId: newSkuId },
      });
      if (!existingProduct) {
        unique = true;
      }
    }

    res.status(200).json({ skuId: newSkuId });
  } catch (error) {
    console.error("Error generating SKU ID:", error);
    next(error);
  }
};

// Get brands with their associated products
export const getBrandsWithProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Get user's company from auth token
    const userId = req.auth?.sub;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Get all products for this company
    const products = await Product.findAll({
      where: { companyName: user.companyName },
      order: [["brand", "ASC"], ["productName", "ASC"]]
    });

    // Group products by brand
    const brandMap = new Map();
    
    products.forEach(product => {
      const brand = product.brand || 'Uncategorized'; // Handle null brand
      
      if (!brandMap.has(brand)) {
        brandMap.set(brand, {
          brand: brand,
          products: []
        });
      }
      
      // Add this product to the brand's products array with price information
      brandMap.get(brand).products.push({
        productName: product.productName,
        pricePerPiece: product.pricePerPiece,
        gst: product.gst,
      });
    });
    
    // Convert Map to array for response
    const brandsWithProducts = Array.from(brandMap.values());
    
    res.status(200).json(brandsWithProducts);
  } catch (error) {
    console.error("Error fetching brands with products:", error);
    next(error);
  }
};
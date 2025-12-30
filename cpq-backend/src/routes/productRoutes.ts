import { Router } from "express";
import multer from "multer";
import {
  createProduct,
  deleteProduct,
  generateSkuId,
  getAllBrands,
  getAllCategories,
  getAllProducts,
  getAllUnits,
  getProductById,
  getProductByName,
  getProducts,
  updateProduct,
  getBrandsWithProducts
} from "../controllers/productController";
import { checkJwt } from "../middlewares/auth";
import upload from "../middlewares/upload";

const router = Router();
router.use(checkJwt);

// Static routes first (no file uploads)
router.get("/generate-skuId", generateSkuId);
router.get("/brands-with-products", getBrandsWithProducts);
router.get("/brands", getAllBrands);
router.get("/categories", getAllCategories);
router.get("/units", getAllUnits);
router.get("/products", getAllProducts);
router.get("/", getProducts);
router.get("/name/:productName", getProductByName);

// File upload routes with error handling
router.post("/", (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({
        error: "File upload error",
        details: err.message,
      });
    } else if (err) {
      console.error("Unknown error:", err);
      return res.status(500).json({
        error: "Unknown error occurred",
        details: err.message,
      });
    }
    createProduct(req, res, next);
  });
});

router.put("/:skuId", (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({
        error: "File upload error",
        details: err.message,
      });
    } else if (err) {
      console.error("Unknown error:", err);
      return res.status(500).json({
        error: "Unknown error occurred",
        details: err.message,
      });
    }
    updateProduct(req, res, next);
  });
});

// Get by SKU route (must come after named routes)
router.get("/:skuId", getProductById);

// Delete route
router.delete("/", deleteProduct);

export default router;

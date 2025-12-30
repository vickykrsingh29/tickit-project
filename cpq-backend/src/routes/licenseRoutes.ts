import { Router, Request, Response, NextFunction } from "express";
import {
  getAllLicenses,
  getLicenseById,
  createLicense,
  updateLicense,
  deleteLicense,
  deleteManyLicenses,
  getLicenseSelectOptions,
} from "../controllers/licenseController";
import { checkJwt } from "../middlewares/auth";
import multer, { MulterError } from "multer";
import upload from "../middlewares/upload";
import { LicenseRequest } from "../controllers/licenseController"; // Import LicenseRequest

const router = Router();

// Apply authentication middleware
router.use(checkJwt);

// GET routes
router.get("/", getAllLicenses);
router.get("/select-options", getLicenseSelectOptions);
router.get("/:id", getLicenseById);

// POST route with file upload
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ error: "File upload error", details: err.message });
    } else if (err) {
      return res
        .status(500)
        .json({ error: "Unknown error occurred", details: err.message });
    }
    
    // Handle the request as LicenseRequest
    createLicense(req as LicenseRequest, res, next);
  });
});

// PUT route with file upload
router.put("/:id", (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ error: "File upload error", details: err.message });
    } else if (err) {
      return res
        .status(500)
        .json({ error: "Unknown error occurred", details: err.message });
    }
    
    // Handle the request as LicenseRequest
    updateLicense(req as LicenseRequest, res, next);
  });
});

// DELETE route
router.delete("/:id", deleteLicense);
router.post("/delete-many", deleteManyLicenses);

export default router;
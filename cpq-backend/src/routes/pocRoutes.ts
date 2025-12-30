import { Router } from "express";
import {
  createPoc,
  deletePoc,
  getAllPoc,
  getPocById,
  updatePoc,
  getAllDesignations,
  getAllDepartments,
  getPocsForSelect 
} from "../controllers/pocController";
import { checkJwt } from "../middlewares/auth";
import multer from "multer";
import upload from "../middlewares/upload";

const router = Router();

// Apply authentication middleware
router.use(checkJwt);

// Static routes must come before dynamic routes
router.get("/designations", getAllDesignations);
router.get("/departments", getAllDepartments);

// List and search routes
router.get("/", getAllPoc);


// Route to get POCs for React Select
router.get("/get-poc-details-for-select/:customerId", getPocsForSelect)

// File upload routes with error handling
router.post("/", (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res
        .status(400)
        .json({ error: "File upload error", details: err.message });
    } else if (err) {
      console.error("Unknown error:", err);
      return res
        .status(500)
        .json({ error: "Unknown error occurred", details: err.message });
    }
    createPoc(req, res, next);
  });
});

router.put("/:id", (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res
        .status(400)
        .json({ error: "File upload error", details: err.message });
    } else if (err) {
      console.error("Unknown error:", err);
      return res
        .status(500)
        .json({ error: "Unknown error occurred", details: err.message });
    }
    updatePoc(req, res, next);
  });
});

// Dynamic routes
router.get("/:id", getPocById);

// Delete routes
router.delete("/:id", deletePoc);

export default router;

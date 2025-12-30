import { Router } from "express";
import multer from "multer";
import {
  createCustomer,
  deleteCustomer,
  deleteCustomers,
  getAllCities,
  getAllCompanies,
  getAllCountries,
  getAllCustomers,
  getAllDistricts,
  getAllIndustries,
  getAllSalesReps,
  getAllStates,
  getCustomerById,
  getCustomerByName,
  updateCustomer,
  getAllTypeOfCustomers,
  getAllCustomersForSelect,
  getCustomersWithPocs
} from "../controllers/customerController";
import { checkJwt } from "../middlewares/auth";
import upload from "../middlewares/upload";
 
const router = Router();
 
// Apply checkJwt middleware to all customer routes
router.use(checkJwt);
 
// Static routes must come before dynamic routes
router.get("/companies", getAllCompanies);
router.get("/with-pocs", getCustomersWithPocs);
router.get("/all-customers-for-select", getAllCustomersForSelect);
router.get("/industries", getAllIndustries);
router.get("/types-of-customers", getAllTypeOfCustomers);
router.get("/sales-reps", getAllSalesReps);
router.get("/cities", getAllCities);
router.get("/districts", getAllDistricts);
router.get("/states", getAllStates);
router.get("/countries", getAllCountries);
 
// List and search routes
router.get("/", getAllCustomers);
router.get("/byname/:name", getCustomerByName);
 
// File upload routes with better error handling
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
    createCustomer(req, res, next);
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
    updateCustomer(req, res, next);
  });
});
 
// Dynamic routes
router.get("/:id", getCustomerById);
 
// Delete routes
router.delete("/:id", deleteCustomer);
router.delete("/", deleteCustomers);
 
export default router;
import { Router } from "express";
import multer from "multer";
import * as orderController from "../controllers/orderController";
import { checkJwt } from "../middlewares/auth";
import upload from "../middlewares/upload";

const router = Router();

router.use(checkJwt);

router.get("/payment-methods", orderController.getAllPaymentMethods);
router.get("/payment-terms", orderController.getAllPaymentTerms);
router.get("/delivery-methods", orderController.getAllDeliveryMethods);
router.get("/statuses", orderController.getAllOrderStatuses);

router.post("/generate-order-number", orderController.generateOrderNumberOnly);

router.get("/", orderController.getAllOrders);
router.get("/customer/:customerId", orderController.getOrdersByCustomer);
router.get("/status/:status", orderController.getOrdersByStatus);
router.get("/number/:orderNumber", orderController.getOrderByOrderNumber);

router.put("/number/:orderNumber", (req, res, next) => {
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
    orderController.updateOrderByOrderNumber(req, res, next);
  });
});

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
    orderController.createOrder(req, res, next);
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
    orderController.updateOrder(req, res, next);
  });
});

// Bulk delete route
router.post("/delete", orderController.deleteOrders);

// PDF download route
router.get("/download/:orderNumber", orderController.downloadOrderPDF);

// Approval route
router.post("/approve/:orderNumber", orderController.approveOrder);

// Dynamic routes
router.get("/:id", orderController.getOrderById);

// Delete route by order number
router.delete("/number/:orderNumber", orderController.deleteOrderByOrderNumber);

// Delete route
router.delete("/:id", orderController.deleteOrder);

export default router; 
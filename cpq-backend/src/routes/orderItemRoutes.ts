import { Router } from "express";
import * as orderItemController from "../controllers/orderItemController";
import { checkJwt } from "../middlewares/auth";

const router = Router();

// Apply checkJwt middleware to all order item routes
router.use(checkJwt);

// List routes
router.get("/order/:orderId", orderItemController.getOrderItems);

// CRUD operations
router.post("/", orderItemController.addItemToOrder);
router.get("/:id", orderItemController.getOrderItemById);
router.put("/:id", orderItemController.updateOrderItem);
router.delete("/:id", orderItemController.deleteOrderItem);

// Special operations
router.patch("/:id/delivery-status", orderItemController.updateOrderItemDeliveryStatus);

export default router; 
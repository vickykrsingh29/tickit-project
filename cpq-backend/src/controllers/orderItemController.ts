import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Product } from "../models/Product";
import { Op } from "sequelize";

// Define interfaces for OrderItem properties
interface OrderItemAttributes {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  skuId: string;
  unitPrice: number;
  taxRate: number;
  quantity: number;
  discountRate: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  deliveryDate?: Date;
  unit?: string;
  description?: string;
}

// Get all items for a specific order
export const getOrderItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { orderId } = req.params;
    
    const items = await OrderItem.findAll({
      where: { orderId },
      include: [
        {
          model: Product,
          attributes: ["id", "productName", "skuId", "images"]
        }
      ],
      order: [["id", "ASC"]]
    });
    
    res.status(200).json(items);
  } catch (error) {
    console.error("Error in getOrderItems:", error);
    next(error);
  }
};

// Get a specific order item by ID
export const getOrderItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    
    const item = await OrderItem.findByPk(id, {
      include: [
        {
          model: Product
        }
      ]
    });
    
    if (!item) {
      return res.status(404).json({ message: "Order item not found" });
    }
    
    res.status(200).json(item);
  } catch (error) {
    console.error("Error in getOrderItemById:", error);
    next(error);
  }
};

// Add a new item to an order
export const addItemToOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { orderId } = req.params;
    const orderItemData = req.body;

    // Validate required fields
    if (!orderItemData.productId || !orderItemData.productName || !orderItemData.unitPrice || !orderItemData.quantity) {
      return res.status(400).json({
        message: "Missing required fields. Required: productId, productName, unitPrice, quantity",
      });
    }

    // Calculate financial values
    const subtotal = orderItemData.unitPrice * orderItemData.quantity;
    const taxRate = orderItemData.taxRate || 0;
    const discountRate = orderItemData.discountRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = subtotal * (discountRate / 100);
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Create order item with essential fields only
    const orderItem = await OrderItem.create({
      orderId: parseInt(orderId),
      productId: orderItemData.productId,
      productName: orderItemData.productName,
      skuId: orderItemData.skuId || "",
      unitPrice: orderItemData.unitPrice,
      taxRate: taxRate,
      quantity: orderItemData.quantity,
      discountRate: discountRate,
      subtotal: subtotal,
      taxAmount: taxAmount,
      discountAmount: discountAmount,
      totalAmount: totalAmount,
      status: orderItemData.status || "Pending",
      unit: orderItemData.unit,
      description: orderItemData.description,
      deliveryDate: orderItemData.deliveryDate,
    });

    // Update order totals
    await updateOrderTotals(parseInt(orderId));

    return res.status(201).json(orderItem);
  } catch (error) {
    next(error);
  }
};

// Update an existing order item
export const updateOrderItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const orderItemData = req.body;

    // Find the order item
    const orderItem = await OrderItem.findByPk(id);
    if (!orderItem) {
      return res.status(404).json({
        message: "Order item not found",
      });
    }

    // Calculate financial values if necessary fields are provided
    let updateData: Partial<OrderItemAttributes> = { ...orderItemData };

    if (orderItemData.unitPrice !== undefined || orderItemData.quantity !== undefined || orderItemData.taxRate !== undefined || orderItemData.discountRate !== undefined) {
      const unitPrice = orderItemData.unitPrice !== undefined ? orderItemData.unitPrice : orderItem.unitPrice;
      const quantity = orderItemData.quantity !== undefined ? orderItemData.quantity : orderItem.quantity;
      const taxRate = orderItemData.taxRate !== undefined ? orderItemData.taxRate : orderItem.taxRate;
      const discountRate = orderItemData.discountRate !== undefined ? orderItemData.discountRate : orderItem.discountRate;

      const subtotal = unitPrice * quantity;
      const taxAmount = subtotal * (taxRate / 100);
      const discountAmount = subtotal * (discountRate / 100);
      const totalAmount = subtotal + taxAmount - discountAmount;

      updateData = {
        ...updateData,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
      };
    }

    // Update order item with essential fields
    await orderItem.update(updateData);

    // Update order totals
    await updateOrderTotals(orderItem.orderId);

    return res.status(200).json(orderItem);
  } catch (error) {
    next(error);
  }
};

// Delete an order item
export const deleteOrderItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    
    // Find the item
    const item = await OrderItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Order item not found" });
    }
    
    const orderId = item.orderId;
    
    // Delete the item
    await item.destroy();
    
    // Update order totals
    await updateOrderTotals(orderId);
    
    res.status(200).json({ message: "Order item deleted successfully" });
  } catch (error) {
    console.error("Error in deleteOrderItem:", error);
    next(error);
  }
};

// Update delivery status of an order item
export const updateOrderItemDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = (req as AuthenticatedRequest).auth?.sub;
    const { id } = req.params;
    const { status, deliveryDate } = req.body;
    
    // Find the item
    const item = await OrderItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Order item not found" });
    }
    
    // Update status
    await item.update({
      status: status || "Pending",
      deliveryDate: status === "Delivered" ? deliveryDate || new Date() : item.deliveryDate
    });
    
    // Check if all items in the order are delivered
    const allItems = await OrderItem.findAll({
      where: { orderId: item.orderId }
    });
    
    const allDelivered = allItems.every((item: OrderItemAttributes) => item.status === "Delivered");
    
    // Update order status if all items are delivered
    if (allDelivered) {
      await Order.update(
        { 
          status: "Delivered",
          updatedBy: userId
        },
        { where: { id: item.orderId } }
      );
    }
    
    res.status(200).json({ 
      message: "Item status updated successfully", 
      item 
    });
  } catch (error) {
    console.error("Error in updateOrderItemDeliveryStatus:", error);
    next(error);
  }
};

// Helper function to update order totals
async function updateOrderTotals(orderId: number): Promise<void> {
  try {
    // Get all items for the order
    const items = await OrderItem.findAll({
      where: { orderId }
    });
    
    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;
    
    items.forEach((item: OrderItemAttributes) => {
      subtotal += item.subtotal;
      taxAmount += item.taxAmount;
      discountAmount += item.discountAmount;
    });
    
    const totalAmount = subtotal + taxAmount - discountAmount;
    
    // Update the order
    await Order.update(
      {
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount
      },
      { where: { id: orderId } }
    );
  } catch (error) {
    console.error("Error updating order totals:", error);
    throw error;
  }
} 
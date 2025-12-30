import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { Customer } from "../models/Customer";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Poc } from "../models/Poc";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { generateOrderPDF } from "../utils/pdfGenerator";
import sequelize from "../config/database";
import { uploadToBlob } from "../middlewares/upload";
import { deleteFromBlob } from "../config/storage";

// Add this interface near the top of the file with other interfaces
interface OrderItemData {
  id?: number;
  orderId?: number;
  productId: number;
  productName: string;
  skuId?: string;
  unitPrice: number | string;
  taxRate: number | string;
  quantity: number | string;
  discountRate?: number | string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  status?: string;
  unit?: string;
  description?: string;
  deliveryDate?: Date;
}

// Get all orders with pagination and filtering
export const getAllOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const search = req.query.search as string;
    const status = req.query.status as string;
    const customerId = req.query.customerId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const userId = (req as AuthenticatedRequest).auth?.sub;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (userId) {
      whereClause.companyName = user.companyName;
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (startDate && endDate) {
      whereClause.orderDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereClause.orderDate = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.orderDate = {
        [Op.lte]: new Date(endDate),
      };
    }

    if (search) {
      whereClause[Op.or] = [
        { orderNumber: { [Op.like]: `%${search}%` } },
        { orderName: { [Op.like]: `%${search}%` } },
        { customerName: { [Op.like]: `%${search}%` } },
        { executiveName: { [Op.like]: `%${search}%` } },
      ];
    }

    const orders = await Order.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Customer,
          as: "customer",
        },
        {
          model: Poc,
          as: "poc",
        },
        {
          model: OrderItem,
        },
      ],
    });

    return res.status(200).json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get order by ID
export const getOrderById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Customer,
          as: "customer"
        },
        {
          model: Poc,
          as: "poc"
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product
            }
          ]
        },
        {
          model: User,
          as: "Updater",
          attributes: ["id", "email", "firstName", "lastName"]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error in getOrderById:", error);
    next(error);
  }
};

// Get order by order number
export const getOrderByOrderNumber = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { orderNumber } = req.params;

    console.log(`Fetching order with order number: ${orderNumber}`);

    const order = await Order.findOne({
      where: { orderNumber },
      include: [
        {
          model: Customer,
          as: "customer",
        },
        {
          model: Poc,
          as: "poc",
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
            }
          ]
        },
        {
          model: User,
          as: "user",
        }
      ]
    });

    if (!order) {
      console.log(`Order with order number ${orderNumber} not found`);
      return res.status(404).json({ message: "Order not found" });
    }

    // Convert the order to a plain object to manipulate it
    const orderData = order.get({ plain: true });

    // Add additional information if needed
    orderData.customerName = orderData.customer ? orderData.customer.name : '';

    console.log(`Successfully fetched order with order number: ${orderNumber}`);
    res.status(200).json(orderData);
  } catch (error: any) {
    console.error("Error in getOrderByOrderNumber:", error);
    res.status(500).json({
      message: "Failed to fetch order details",
      error: error.message || "Unknown error occurred"
    });
  }
};

// Get orders by customer ID
export const getOrdersByCustomer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { customerId } = req.params;

    const orders = await Order.findAll({
      where: { customerId },
      include: [
        {
          model: Poc,
          as: "poc"
        },
        {
          model: OrderItem
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error in getOrdersByCustomer:", error);
    next(error);
  }
};

// Get orders by status
export const getOrdersByStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { status } = req.params;

    const orders = await Order.findAll({
      where: { status },
      include: [
        {
          model: Customer,
          as: "customer"
        },
        {
          model: Poc,
          as: "poc"
        },
        {
          model: OrderItem
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error in getOrdersByStatus:", error);
    next(error);
  }
};

// Create a new order
export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    const userId = (req as AuthenticatedRequest).auth?.sub;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("Files:", req.files);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };


    let orderData = typeof req.body.order === "string" ? JSON.parse(req.body.order) : req.body;

    console.log("Order data:", orderData);

    // Handle document uploads
    if (files?.documents || files?.document) {
      try {
        const documentFiles = files.documents || files.document;
        const documentUrls = await Promise.all(
          documentFiles.map((file) => uploadToBlob(file))
        );
        orderData.documents = documentUrls;
        console.log("Documents uploaded successfully:", documentUrls);
      } catch (error) {
        console.error("Document upload error:", error);
        await transaction.rollback();
        return res.status(500).json({ error: "Failed to upload documents" });
      }
    }

    // Handle attachment uploads
    if (files?.performanceBankGuarantee) {
      try {
        const attachmentFiles = Array.isArray(files.performanceBankGuarantee)
          ? files.performanceBankGuarantee
          : [files.performanceBankGuarantee];

        const attachmentUrl = await uploadToBlob(attachmentFiles[0]);
        orderData.performanceBankGuarantee = attachmentUrl; // Store as a single URL string, not an array
        console.log("Performance Bank Guarantee uploaded successfully:", attachmentUrl);
      } catch (error) {
        console.error("Performance Bank Guarantee upload error:", error);
        await transaction.rollback();
        return res.status(500).json({ error: "Failed to upload performanceBankGuarantee" });
      }
    }

    // Helper function to ensure numeric values
    const ensureNumber = (value: any, defaultValue = 0) => {
      if (value === "" || value === null || value === undefined || isNaN(Number(value))) {
        return defaultValue;
      }
      return Number(value);
    };

    // Extract order data from request body
    const {
      // Basic Order Information
      orderName,
      executiveName,
      orderDate,
      orderCreationDate,
      status,

      // Customer Information
      customerId,
      customerName,
      customerGST,
      customerEmail,
      customerPhone,

      // POC Information
      pocId,
      pocName,
      pocEmail,
      pocPhone,
      pocDesignation,
      pocDepartment,

      // Address Information
      billingAddress,
      billingAddressLine2,
      billingPin,
      billingCity,
      billingDistrict,
      billingState,
      billingCountry,

      shippingAddress,
      shippingAddressLine2,
      shippingPin,
      shippingCity,
      shippingDistrict,
      shippingState,
      shippingCountry,
      sameAsBilling,

      wpcAddress,
      wpcAddressLine2,
      wpcPin,
      wpcCity,
      wpcDistrict,
      wpcState,
      wpcCountry,
      wpcSameAsBilling,

      // Additional Details
      paymentTerm,
      paymentMethod,
      deliveryMethod,
      deliveryInstruction,
      modeOfDispatch,
      warranty,
      expectedDeliveryDate,
      notes,

      // License Information
      requiresLicense,
      licenseType,
      licenseNumber,
      licenseExpiryDate,
      licenseIssueDate,
      licenseQuantity,
      licenseStatus,
      liaisoningRemarks,
      licenseVerified,

      // Additional Costs
      liquidatedDamagesInclusive,
      liquidatedDamagesAmount,
      freightChargeInclusive,
      freightChargeAmount,
      transitInsuranceInclusive,
      transitInsuranceAmount,
      installationInclusive,
      installationAmount,
      securityDepositInclusive,
      securityDepositAmount,
      liaisoningInclusive,
      liaisoningAmount,
      performanceBankGuarantee,

      // Financial Totals
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      additionalCostTotal,
      grandTotal,
      // Metadata
      createdBy,
      documents,
      orderRemarks
    } = orderData;

    console.log("Order data:", orderData);

    let items;
    try {
      // Handle both string and array formats for items
      if (typeof orderData.items === 'string') {
        items = JSON.parse(orderData.items);
      } else if (Array.isArray(orderData.items)) {
        items = orderData.items;
      } else {
        console.warn("Items data is neither a string nor an array:", orderData.items);
        items = [];
      }
      console.log("Parsed items:", items);
    } catch (error) {
      console.error("Error parsing items:", error);
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid items data format" });
    }

    // Validate required fields
    if (!customerId) {
      await transaction.rollback();
      return res.status(400).json({ message: "Customer ID is required" });
    }

    // Get customer details for order number generation
    const customer = await Customer.findByPk(customerId, { transaction });
    if (!customer) {
      await transaction.rollback();
      return res.status(400).json({ message: "Customer not found" });
    }

    // Generate order number if not provided
    let orderNumber = req.body.orderNumber;
    if (!orderNumber) {
      try {
        orderNumber = await generateOrderNumber(
          user.companyName || "COMPANY",
          `${customer.name}-${customer.ancillaryName}`,
          transaction
        );
        console.log("Generated order number:", orderNumber);
      } catch (error) {
        console.error("Error generating order number:", error);
        await transaction.rollback();
        return res.status(500).json({ message: "Failed to generate order number" });
      }
    } else {
      console.log("Using provided order number:", orderNumber);
    }

    console.log("ISARRAY ITEMS:", Array.isArray(items));
    let order;
    try {
      order = await Order.create(
        {
          // Basic Order Information
          orderNumber,
          orderName: orderName || "",
          executiveName: executiveName || "",
          orderDate,
          orderCreationDate,
          status: status || "Pending",

          // Customer Information
          customerId,
          customerName: customerName || "",
          customerGST: customerGST || "",
          customerEmail: customerEmail || "",
          customerPhone: customerPhone || "",

          // POC Information
          pocId,
          pocName: pocName || "",
          pocEmail: pocEmail || "",
          pocPhone: pocPhone || "",
          pocDesignation: pocDesignation || "",
          pocDepartment: pocDepartment || "",

          // Address Information
          billingAddress: billingAddress || "",
          billingAddressLine2: billingAddressLine2 || "",
          billingPin: billingPin || "",
          billingCity: billingCity || "",
          billingDistrict: billingDistrict || "",
          billingState: billingState || "",
          billingCountry: billingCountry || "",

          shippingAddress: shippingAddress || "",
          shippingAddressLine2: shippingAddressLine2 || "",
          shippingPin: shippingPin || "",
          shippingCity: shippingCity || "",
          shippingDistrict: shippingDistrict || "",
          shippingState: shippingState || "",
          shippingCountry: shippingCountry || "",
          sameAsBilling: sameAsBilling || false,

          wpcAddress: wpcAddress || "",
          wpcAddressLine2: wpcAddressLine2 || "",
          wpcPin: wpcPin || "",
          wpcCity: wpcCity || "",
          wpcDistrict: wpcDistrict || "",
          wpcState: wpcState || "",
          wpcCountry: wpcCountry || "",
          wpcSameAsBilling: wpcSameAsBilling || false,

          // Additional Details
          paymentTerm: paymentTerm || "",
          paymentMethod: paymentMethod || "",
          deliveryMethod: deliveryMethod || "",
          deliveryInstruction: deliveryInstruction || "",
          modeOfDispatch: modeOfDispatch || "",
          warranty: warranty || "",
          expectedDeliveryDate,
          notes: notes || "",

          // License Information
          requiresLicense: requiresLicense || false,
          licenseType: licenseType || "",
          licenseNumber: licenseNumber || "",
          licenseExpiryDate: licenseExpiryDate || null,
          licenseIssueDate: licenseIssueDate || null,
          licenseQuantity: licenseQuantity || "",
          licenseStatus: licenseStatus || "",
          liaisoningRemarks: liaisoningRemarks || "",
          licenseVerified: licenseVerified || false,

          // Additional Costs
          liquidatedDamagesInclusive: liquidatedDamagesInclusive || false,
          liquidatedDamagesAmount: ensureNumber(liquidatedDamagesAmount),
          freightChargeInclusive: freightChargeInclusive || false,
          freightChargeAmount: ensureNumber(freightChargeAmount),
          transitInsuranceInclusive: transitInsuranceInclusive || false,
          transitInsuranceAmount: ensureNumber(transitInsuranceAmount),
          installationInclusive: installationInclusive || false,
          installationAmount: ensureNumber(installationAmount),
          securityDepositInclusive: securityDepositInclusive || false,
          securityDepositAmount: ensureNumber(securityDepositAmount),
          liaisoningInclusive: liaisoningInclusive || false,
          liaisoningAmount: ensureNumber(liaisoningAmount),
          performanceBankGuarantee: performanceBankGuarantee || "",

          // Financial Totals
          subtotal: ensureNumber(subtotal),
          taxAmount: ensureNumber(taxAmount),
          discountAmount: ensureNumber(discountAmount),
          totalAmount: ensureNumber(totalAmount),
          additionalCostTotal: ensureNumber(additionalCostTotal),
          grandTotal: ensureNumber(grandTotal),

          // Metadata
          userId,
          companyName: customer.companyName,
          createdBy: createdBy || "Unknown",
          documents: documents || [],
          orderRemarks: orderRemarks || ""
        },
        { transaction }
      );
    } catch (error) {
      console.error("Error creating order:", error);
      await transaction.rollback();
      return res.status(500).json({ message: "Failed to create order record" });
    }

    // Create order items
    const processedItems = await Promise.all(
      items.map(async (itemData: OrderItemData) => {
        try {
          // Ensure numeric values
          const unitPrice = ensureNumber(itemData.unitPrice);
          const taxRate = ensureNumber(itemData.taxRate);
          const quantity = ensureNumber(itemData.quantity);
          const discountRate = ensureNumber(itemData.discountRate, 0);

          // Calculate financial values
          const subtotal = unitPrice * quantity;
          const taxAmount = subtotal * (taxRate / 100);
          const discountAmount = subtotal * (discountRate / 100);
          const totalAmount = subtotal + taxAmount - discountAmount;

          // Create with only essential fields
          const orderItem = await OrderItem.create(
            {
              orderId: order.id,
              productId: itemData.productId,
              productName: itemData.productName,
              skuId: itemData.skuId || "",
              unitPrice,
              taxRate,
              quantity,
              discountRate,
              subtotal,
              taxAmount,
              discountAmount,
              totalAmount,
              orderStatus: "Pending",
              unit: itemData.unit,
              description: itemData.description,
              deliveryDate: itemData.deliveryDate,
            },
            { transaction }
          );

          return orderItem;
        } catch (err) {
          console.error("Error processing order item:", err);
          throw err;
        }
      })
    );

    // Commit the transaction
    await transaction.commit();

    // Return the created order with items
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        { model: Customer, as: "customer" },
        { model: Poc, as: "poc" },
        { model: OrderItem }
      ]
    });

    return res.status(201).json(createdOrder);
  } catch (error: any) {
    // Rollback the transaction in case of any error
    await transaction.rollback();
    console.error("Error creating order:", error);
    return res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });
  }
};

// Update an existing order
export const updateOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    console.log(`Updating order with ID: ${id}`);

    const userId = (req as AuthenticatedRequest).auth?.sub;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Parse the order data from the request body
    let orderData;
    try {
      orderData = typeof req.body.order === "string"
        ? JSON.parse(req.body.order)
        : req.body.order;

      console.log('Parsed order data:', orderData);
    } catch (error) {
      console.error('Error parsing order data:', error);
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid order data format" });
    }

    // Find the existing order
    const existingOrder = await Order.findByPk(id, { transaction });
    if (!existingOrder) {
      console.log(`Order with ID ${id} not found`);
      await transaction.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    // Handle file attachments
    let attachments = existingOrder.attachments || [];

    // Handle attachment deletions
    const attachmentsToDelete = JSON.parse(req.body.attachmentsToDelete || "[]");
    console.log('Attachments to delete:', attachmentsToDelete);

    // Filter out deleted attachments
    const remainingAttachments = attachments.filter(
      (attachment: string) => !attachmentsToDelete.includes(attachment)
    );

    // Delete attachments from blob storage
    if (attachmentsToDelete.length > 0) {
      try {
        await Promise.all(
          attachmentsToDelete.map((url: string) => deleteFromBlob(url))
        );
        console.log("Successfully deleted attachments from storage");
      } catch (error) {
        console.error("Error deleting attachments from storage:", error);
      }
    }

    // Handle new document uploads
    if (files && files.documents) {
      try {
        const uploadPromises = files.documents.map((file: Express.Multer.File) =>
          uploadToBlob(file)
        );

        const uploadedUrls = await Promise.all(uploadPromises);
        remainingAttachments.push(...uploadedUrls);
        console.log("Successfully uploaded new documents:", uploadedUrls);
      } catch (error) {
        console.error("Error uploading documents:", error);
        await transaction.rollback();
        return res.status(500).json({ message: "Error uploading documents" });
      }
    }

    // Handle performance bank guarantee upload
    let performanceBankGuaranteeUrl = existingOrder.performanceBankGuarantee;
    if (files && files.performanceBankGuarantee && files.performanceBankGuarantee.length > 0) {
      try {
        // Delete existing file if it exists
        if (performanceBankGuaranteeUrl) {
          await deleteFromBlob(performanceBankGuaranteeUrl);
        }

        // Upload new file
        performanceBankGuaranteeUrl = await uploadToBlob(
          files.performanceBankGuarantee[0]
        );
        console.log("Successfully uploaded performance bank guarantee:", performanceBankGuaranteeUrl);
      } catch (error) {
        console.error("Error uploading performance bank guarantee:", error);
        await transaction.rollback();
        return res.status(500).json({ message: "Error uploading performance bank guarantee" });
      }
    }

    // Helper function to ensure numeric values
    const ensureNumber = (value: any, defaultValue = 0) => {
      if (value === null || value === undefined) return defaultValue;
      const num = parseFloat(value);
      return isNaN(num) ? defaultValue : num;
    };

    // Extract customer and POC IDs
    const customerId = orderData.customerId || existingOrder.customerId;
    const pocId = orderData.pocId || existingOrder.pocId;

    // Extract billing address fields
    const billingAddress = orderData.billingAddress || existingOrder.billingAddress;
    const billingAddressLine2 = orderData.billingAddressLine2 || existingOrder.billingAddressLine2;
    const billingPin = orderData.billingPin || existingOrder.billingPin;
    const billingCity = orderData.billingCity || existingOrder.billingCity;
    const billingDistrict = orderData.billingDistrict || existingOrder.billingDistrict;
    const billingState = orderData.billingState || existingOrder.billingState;
    const billingCountry = orderData.billingCountry || existingOrder.billingCountry;

    // Extract shipping address fields
    const shippingAddress = orderData.shippingAddress || existingOrder.shippingAddress;
    const shippingAddressLine2 = orderData.shippingAddressLine2 || existingOrder.shippingAddressLine2;
    const shippingPin = orderData.shippingPin || existingOrder.shippingPin;
    const shippingCity = orderData.shippingCity || existingOrder.shippingCity;
    const shippingDistrict = orderData.shippingDistrict || existingOrder.shippingDistrict;
    const shippingState = orderData.shippingState || existingOrder.shippingState;
    const shippingCountry = orderData.shippingCountry || existingOrder.shippingCountry;

    // Extract WPC address fields
    const wpcAddress = orderData.wpcAddress || existingOrder.wpcAddress;
    const wpcAddressLine2 = orderData.wpcAddressLine2 || existingOrder.wpcAddressLine2;
    const wpcPin = orderData.wpcPin || existingOrder.wpcPin;
    const wpcCity = orderData.wpcCity || existingOrder.wpcCity;
    const wpcDistrict = orderData.wpcDistrict || existingOrder.wpcDistrict;
    const wpcState = orderData.wpcState || existingOrder.wpcState;
    const wpcCountry = orderData.wpcCountry || existingOrder.wpcCountry;

    const orderStatus = orderData.orderStatus || existingOrder.orderStatus;
    // Extract additional cost fields
    const liquidatedDamagesInclusive = orderData.liquidatedDamages !== undefined
      ? orderData.liquidatedDamages
      : existingOrder.liquidatedDamagesInclusive;

    const liquidatedDamagesAmount = ensureNumber(
      orderData.liquidatedDamagesAmount,
      existingOrder.liquidatedDamagesAmount
    );

    const freightChargeInclusive = orderData.freightCharge !== undefined
      ? orderData.freightCharge
      : existingOrder.freightChargeInclusive;

    const freightChargeAmount = ensureNumber(
      orderData.freightChargeAmount,
      existingOrder.freightChargeAmount
    );

    const transitInsuranceInclusive = orderData.transitInsurance !== undefined
      ? orderData.transitInsurance
      : existingOrder.transitInsuranceInclusive;

    const transitInsuranceAmount = ensureNumber(
      orderData.transitInsuranceAmount,
      existingOrder.transitInsuranceAmount
    );

    const installationInclusive = orderData.installation !== undefined
      ? orderData.installation
      : existingOrder.installationInclusive;

    const installationAmount = ensureNumber(
      orderData.installationAmount,
      existingOrder.installationAmount
    );

    const securityDepositInclusive = orderData.securityDeposit !== undefined
      ? orderData.securityDeposit
      : existingOrder.securityDepositInclusive;

    const securityDepositAmount = ensureNumber(
      orderData.securityDepositAmount,
      existingOrder.securityDepositAmount
    );

    const liaisoningInclusive = orderData.liaisoning !== undefined
      ? orderData.liaisoning
      : existingOrder.liaisoningInclusive;

    const liaisoningAmount = ensureNumber(
      orderData.liaisoningAmount,
      existingOrder.liaisoningAmount
    );

    // Calculate additional cost total
    const additionalCostTotal =
      (!liquidatedDamagesInclusive ? liquidatedDamagesAmount : 0) +
      (!freightChargeInclusive ? freightChargeAmount : 0) +
      (!transitInsuranceInclusive ? transitInsuranceAmount : 0) +
      (!installationInclusive ? installationAmount : 0) +
      (!securityDepositInclusive ? securityDepositAmount : 0) +
      (!liaisoningInclusive ? liaisoningAmount : 0);

    // Extract financial totals
    const subtotal = ensureNumber(orderData.subtotal, existingOrder.subtotal);
    const taxAmount = ensureNumber(orderData.taxAmount, existingOrder.taxAmount);
    const discountAmount = ensureNumber(orderData.discountAmount, existingOrder.discountAmount);
    const totalAmount = ensureNumber(orderData.totalAmount, existingOrder.totalAmount);

    // Calculate grand total
    const grandTotal = totalAmount + additionalCostTotal;

    // Update the order
    await existingOrder.update(
      {
        // Basic info
        orderNumber: orderData.orderNumber || existingOrder.orderNumber,
        orderName: orderData.orderName || existingOrder.orderName,
        executiveName: orderData.executiveName || existingOrder.executiveName,
        orderCreationDate: orderData.orderCreationDate || existingOrder.orderCreationDate,
        orderDate: orderData.orderDate || existingOrder.orderDate,
        orderStatus: orderData.orderStatus || existingOrder.orderStatus,
        // Customer and POC info
        customerId,
        customerName: orderData.customerName || existingOrder.customerName,
        customerGST: orderData.customerGST || existingOrder.customerGST,
        customerEmail: orderData.customerEmail || existingOrder.customerEmail,
        customerPhone: orderData.customerPhone || existingOrder.customerPhone,
        pocId,
        pocEmail: orderData.pocEmail || existingOrder.pocEmail,
        pocPhone: orderData.pocPhone || existingOrder.pocPhone,
        pocDesignation: orderData.pocDesignation || existingOrder.pocDesignation,
        pocDepartment: orderData.pocDepartment || existingOrder.pocDepartment,

        // Billing address
        billingAddress,
        billingAddressLine2,
        billingPin,
        billingCity,
        billingDistrict,
        billingState,
        billingCountry,

        // Shipping address
        shippingAddress,
        shippingAddressLine2,
        shippingPin,
        shippingCity,
        shippingDistrict,
        shippingState,
        shippingCountry,

        // WPC address
        wpcAddress,
        wpcAddressLine2,
        wpcPin,
        wpcCity,
        wpcDistrict,
        wpcState,
        wpcCountry,

        // Additional details
        paymentTerm: orderData.paymentTerm || existingOrder.paymentTerm,
        deliveryInstruction: orderData.deliveryInstruction || existingOrder.deliveryInstruction,
        modeOfDispatch: orderData.modeOfDispatch || existingOrder.modeOfDispatch,
        warranty: orderData.warranty || existingOrder.warranty,
        orderRemarks: orderData.orderRemarks || existingOrder.orderRemarks,

        // License info
        requiresLicense: orderData.requiresLicense !== undefined
          ? orderData.requiresLicense
          : existingOrder.requiresLicense,
        licenseType: orderData.licenseType || existingOrder.licenseType,
        licenseNumber: orderData.licenseNumber || existingOrder.licenseNumber,
        licenseExpiryDate: orderData.licenseExpiryDate || existingOrder.licenseExpiryDate || null,
        licenseIssueDate: orderData.licenseIssueDate || existingOrder.licenseIssueDate || null,
        licenseQuantity: orderData.licenseQuantity || existingOrder.licenseQuantity,
        licenseStatus: orderData.licenseStatus || existingOrder.licenseStatus,
        liaisoningRemarks: orderData.liaisoningRemarks || existingOrder.liaisoningRemarks,
        liaisoningVerified: orderData.liaisoningVerified !== undefined
          ? orderData.liaisoningVerified
          : existingOrder.liaisoningVerified,

        // Additional costs
        liquidatedDamagesInclusive,
        liquidatedDamagesAmount,
        freightChargeInclusive,
        freightChargeAmount,
        transitInsuranceInclusive,
        transitInsuranceAmount,
        installationInclusive,
        installationAmount,
        securityDepositInclusive,
        securityDepositAmount,
        liaisoningInclusive,
        liaisoningAmount,

        // Financial totals
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        additionalCostTotal,
        grandTotal,

        // Attachments
        attachments: remainingAttachments,
        performanceBankGuarantee: performanceBankGuaranteeUrl,

        // Update metadata
        updatedBy: userId,
      },
      { transaction }
    );

    // Handle order items
    if (orderData.items && Array.isArray(orderData.items)) {
      // Get existing order items
      const existingItems = await OrderItem.findAll({
        where: { orderId: id },
        transaction
      });

      // Create a map of existing items by ID for quick lookup
      const existingItemsMap = new Map();
      existingItems.forEach(item => {
        existingItemsMap.set(item.id, item);
      });

      // Process each item in the updated data
      const itemsToUpdate = [];
      const itemsToCreate = [];

      for (const itemData of orderData.items) {
        // Ensure numeric values
        const unitPrice = ensureNumber(itemData.unitPrice);
        const taxRate = ensureNumber(itemData.taxRate);
        const quantity = ensureNumber(itemData.quantity);
        const discountRate = ensureNumber(itemData.discountRate, 0);

        // Calculate financial values
        const subtotal = unitPrice * quantity;
        const taxAmount = subtotal * (taxRate / 100);
        const discountAmount = subtotal * (discountRate / 100);
        const totalAmount = subtotal + taxAmount - discountAmount;

        if (itemData.id && existingItemsMap.has(itemData.id)) {
          // Update existing item
          const existingItem = existingItemsMap.get(itemData.id);
          itemsToUpdate.push(
            existingItem.update(
              {
                productId: itemData.productId || existingItem.productId,
                productName: itemData.productName || existingItem.productName,
                skuId: itemData.skuId || existingItem.skuId,
                unitPrice,
                taxRate,
                quantity,
                discountRate,
                subtotal,
                taxAmount,
                discountAmount,
                totalAmount,
                unit: itemData.unit || existingItem.unit,
                description: itemData.description || existingItem.description,
                status: itemData.status || existingItem.status,
                deliveryDate: itemData.deliveryDate || existingItem.deliveryDate,
              },
              { transaction }
            )
          );

          // Remove from map to track which items were processed
          existingItemsMap.delete(itemData.id);
        } else {
          // Create new item
          itemsToCreate.push(
            OrderItem.create(
              {
                orderId: parseInt(id),
                productId: itemData.productId,
                productName: itemData.productName,
                skuId: itemData.skuId || '',
                unitPrice,
                taxRate,
                quantity,
                discountRate,
                subtotal,
                taxAmount,
                discountAmount,
                totalAmount,
                unit: itemData.unit || '',
                description: itemData.description || '',
                category: itemData.category || '',
                modelNo: itemData.modelNo || '',
                serialNo: itemData.serialNo || '',
                size: itemData.size || '',
                batchNo: itemData.batchNo || '',
                status: itemData.status || 'Pending',
                warranty: itemData.warranty || '',
                manufacturer: itemData.manufacturer || '',
                additionalDetails: itemData.additionalDetails || '',
                deliveryDate: itemData.deliveryDate,
              },
              { transaction }
            )
          );
        }
      }

      // Delete items that were not in the updated data
      for (const [id, item] of existingItemsMap.entries()) {
        await item.destroy({ transaction });
      }
    }

    // Commit the transaction
    await transaction.commit();

    // Fetch the updated order with all associations
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Customer,
          as: "customer"
        },
        {
          model: Poc,
          as: "poc"
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product
            }
          ]
        }
      ]
    });

    console.log(`Successfully updated order with ID: ${id}`);
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    console.error("Error in updateOrder:", error);
    res.status(500).json({
      message: "Failed to update order",
      error: error.message || 'Unknown error occurred'
    });
  }
};

export const deleteOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.attachments && order.attachments.length > 0) {
      try {
        await Promise.all(
          order.attachments.map((attachment: string) => {
            try {
              fs.unlinkSync(attachment);
              return Promise.resolve();
            } catch (err) {
              console.error(`Failed to delete file ${attachment}:`, err);
              return Promise.resolve();
            }
          })
        );
        console.log("Successfully deleted associated files from storage");
      } catch (error) {
        console.error("Error deleting files from storage:", error);
      }
    }

    await order.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Order deleted successfully",
      deletedId: id
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in deleteOrder:", error);
    next(error);
  }
};

export const deleteOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const transaction = await sequelize.transaction();

  try {
    const { ids, orderNumbers } = req.body;

    // Check if we have either IDs or order numbers
    if ((!Array.isArray(ids) || ids.length === 0) && 
        (!Array.isArray(orderNumbers) || orderNumbers.length === 0)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Invalid request. No order IDs or order numbers provided." });
    }

    let orders;
    
    // If we have order numbers, use those for the query
    if (Array.isArray(orderNumbers) && orderNumbers.length > 0) {
      orders = await Order.findAll({
        where: { orderNumber: orderNumbers },
        transaction
      });
    } else {
      // Otherwise use IDs (backward compatibility)
      orders = await Order.findAll({
        where: { id: ids },
        transaction
      });
    }

    if (orders.length === 0) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "No orders found for the provided identifiers." });
    }

    const filesToDelete: string[] = [];
    const orderIds: number[] = [];
    
    orders.forEach((order) => {
      if (order.attachments) filesToDelete.push(...order.attachments);
      orderIds.push(order.id);
    });

    await Order.destroy({
      where: { id: orderIds },
      transaction
    });

    await transaction.commit();

    if (filesToDelete.length > 0) {
      try {
        await Promise.all(
          filesToDelete.map((fileUrl) => {
            try {
              fs.unlinkSync(fileUrl);
              return Promise.resolve();
            } catch (err) {
              console.error(`Failed to delete file ${fileUrl}:`, err);
              return Promise.resolve();
            }
          })
        );
        console.log("Successfully deleted associated files from storage");
      } catch (error) {
        console.error("Error deleting files from storage:", error);
      }
    }

    res.status(200).json({
      message: "Orders and associated files deleted successfully.",
      deletedCount: orders.length,
      deletedOrderNumbers: orders.map(order => order.orderNumber)
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in deleteOrders:", error);
    next(error);
  }
};

export const downloadOrderPDF = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({
      where: { orderNumber },
      include: [
        {
          model: Customer,
          as: "customer"
        },
        {
          model: Poc,
          as: "poc"
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const pdfBuffer = await generateOrderPDF(order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Order_${orderNumber}.pdf`);

    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Error in downloadOrderPDF:", error);
    next(error);
  }
};

export const approveOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { orderNumber } = req.params;
    const userId = (req as AuthenticatedRequest).auth?.sub;

    const order = await Order.findOne({
      where: { orderNumber }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.pendingApprovalBy?.includes(userId as string)) {
      return res.status(403).json({ message: "User not authorized to approve this order" });
    }

    const pendingApprovalBy = order.pendingApprovalBy.filter((id: string) => id !== userId);
    const approvedBy = [...(order.approvedBy || []), userId];

    let orderStatus = order.orderStatus;
    if (pendingApprovalBy.length === 0) {
      orderStatus = "Approved";
    }

    await order.update({
      pendingApprovalBy,
      approvedBy,
      orderStatus,
      updatedBy: userId
    });

    res.status(200).json({
      message: "Order approved successfully",
      order
    });
  } catch (error) {
    console.error("Error in approveOrder:", error);
    next(error);
  }
};

export const getAllPaymentMethods = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const methods = await Order.findAll({
      attributes: ['paymentMethod'],
      where: {
        paymentMethod: {
          [Op.ne]: null
        }
      },
      group: ['paymentMethod']
    });

    const paymentMethods = methods.map((method: any) => ({
      value: method.paymentMethod,
      label: method.paymentMethod
    }));

    res.status(200).json(paymentMethods);
  } catch (error) {
    console.error("Error in getAllPaymentMethods:", error);
    next(error);
  }
};

// Get all payment terms
export const getAllPaymentTerms = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const terms = await Order.findAll({
      attributes: ['paymentTerms'],
      where: {
        paymentTerms: {
          [Op.ne]: null
        }
      },
      group: ['paymentTerms']
    });

    const paymentTerms = terms.map((term: any) => ({
      value: term.paymentTerms,
      label: term.paymentTerms
    }));

    res.status(200).json(paymentTerms);
  } catch (error) {
    console.error("Error in getAllPaymentTerms:", error);
    next(error);
  }
};

// Get all delivery methods
export const getAllDeliveryMethods = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const methods = await Order.findAll({
      attributes: ['deliveryMethod'],
      where: {
        deliveryMethod: {
          [Op.ne]: null
        }
      },
      group: ['deliveryMethod']
    });

    const deliveryMethods = methods.map((method: any) => ({
      value: method.deliveryMethod,
      label: method.deliveryMethod
    }));

    res.status(200).json(deliveryMethods);
  } catch (error) {
    console.error("Error in getAllDeliveryMethods:", error);
    next(error);
  }
};

// Get all order statuses
export const getAllOrderStatuses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const statuses = await Order.findAll({
      attributes: ['status'],
      group: ['status']
    });

    const orderStatuses = statuses.map((status: any) => ({
      value: status.status,
      label: status.status
    }));

    res.status(200).json(orderStatuses);
  } catch (error) {
    console.error("Error in getAllOrderStatuses:", error);
    next(error);
  }
};

// Generate order number without creating an order
export const generateOrderNumberOnly = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  let transaction = null;

  try {
    // Validate input
    const userId = (req as AuthenticatedRequest).auth?.sub;
    const user = await User.findOne({ where: { id: userId } });

    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        message: "Customer ID is required for order number generation"
      });
    }

    const customer = await Customer.findOne({ where: { id: customerId } });

    console.log(`Generating order number for customer: ${customerId}`);

    // Start transaction
    transaction = await sequelize.transaction();

    // Generate the order number
    const orderNumber = await generateOrderNumber(
      user?.companyName || '',
      `${customer?.name} - ${customer?.ancillaryName}`,
      transaction
    );

    // Commit the transaction
    await transaction.commit();

    // Return the generated order number
    return res.status(200).json({
      orderNumber,
      message: "Order number generated successfully"
    });
  } catch (error: any) {
    // Rollback transaction if it exists
    if (transaction) {
      await transaction.rollback();
    }

    console.error("Error generating order number:", error);
    return res.status(500).json({
      message: `Failed to generate order number: ${error.message}`
    });
  }
};

export const updateOrderByOrderNumber = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const transaction = await sequelize.transaction();

  try {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      await transaction.rollback();
      return res.status(400).json({ message: "Order number is required" });
    }

    const order = await Order.findOne({
      where: { orderNumber },
      include: [
        { model: OrderItem }
      ],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    let orderData = typeof req.body.order === "string" ? JSON.parse(req.body.order) : req.body;

    if (files?.documents || files?.document) {
      try {
        const documentFiles = files.documents || files.document;
        const documentUrls = await Promise.all(
          documentFiles.map((file) => uploadToBlob(file))
        );
        orderData.documents = documentUrls;
        console.log("Documents uploaded successfully:", documentUrls);
      } catch (error) {
        console.error("Document upload error:", error);
        await transaction.rollback();
        return res.status(500).json({ error: "Failed to upload documents" });
      }
    }

    if (files?.performanceBankGuarantee) {
      try {
        const attachmentFiles = Array.isArray(files.performanceBankGuarantee)
          ? files.performanceBankGuarantee
          : [files.performanceBankGuarantee];

        const attachmentUrl = await uploadToBlob(attachmentFiles[0]);
        orderData.performanceBankGuarantee = attachmentUrl;
      } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ error: "Failed to upload performanceBankGuarantee" });
      }
    }

    const ensureNumber = (value: any, defaultValue = 0) => {
      if (value === "" || value === null || value === undefined || isNaN(Number(value))) {
        return defaultValue;
      }
      return Number(value);
    };

    const {
      // Basic Order Information
      orderName,
      executiveName,
      orderDate,
      orderCreationDate,
      orderStatus,

      // Customer Information
      customerId,
      customerName,
      customerGST,
      customerEmail,
      customerPhone,

      // POC Information
      pocId,
      pocName,
      pocEmail,
      pocPhone,
      pocDesignation,
      pocDepartment,

      // Address Information
      billingAddress,
      billingAddressLine2,
      billingPin,
      billingCity,
      billingDistrict,
      billingState,
      billingCountry,

      shippingAddress,
      shippingAddressLine2,
      shippingPin,
      shippingCity,
      shippingDistrict,
      shippingState,
      shippingCountry,
      sameAsBilling,

      wpcAddress,
      wpcAddressLine2,
      wpcPin,
      wpcCity,
      wpcDistrict,
      wpcState,
      wpcCountry,
      wpcSameAsBilling,

      // Additional Details
      paymentTerm,
      paymentMethod,
      deliveryMethod,
      deliveryInstruction,
      modeOfDispatch,
      warranty,
      expectedDeliveryDate,
      notes,

      // License Information
      requiresLicense,
      licenseType,
      licenseNumber,
      licenseExpiryDate,
      licenseIssueDate,
      licenseQuantity,
      licenseStatus,
      liaisoningRemarks,
      licenseVerified,

      // Additional Costs
      liquidatedDamagesInclusive,
      liquidatedDamagesAmount,
      freightChargeInclusive,
      freightChargeAmount,
      transitInsuranceInclusive,
      transitInsuranceAmount,
      installationInclusive,
      installationAmount,
      securityDepositInclusive,
      securityDepositAmount,
      liaisoningInclusive,
      liaisoningAmount,
      performanceBankGuarantee,

      // Financial Totals
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      additionalCostTotal,
      grandTotal,
      // Metadata
      createdBy,
      documents,
      orderRemarks
    } = orderData;

    let items;
    try {
      // Handle both string and array formats for items
      if (typeof orderData.items === 'string') {
        items = JSON.parse(orderData.items);
      } else if (Array.isArray(orderData.items)) {
        items = orderData.items;
      } else {
        console.warn("Items data is neither a string nor an array:", orderData.items);
        items = [];
      }
      console.log("Parsed items:", items);
    } catch (error) {
      console.error("Error parsing items:", error);
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid items data format" });
    }

    try {
      await order.update(
        {
          // Basic Order Information
          orderName: orderName || order.orderName,
          executiveName: executiveName || order.executiveName,
          orderDate: orderDate || order.orderDate,
          orderCreationDate: orderCreationDate || order.orderCreationDate,
          orderStatus: orderStatus || order.orderStatus,

          // Customer Information
          customerId: customerId || order.customerId,
          customerName: customerName || order.customerName,
          customerGST: customerGST || order.customerGST,
          customerEmail: customerEmail || order.customerEmail,
          customerPhone: customerPhone || order.customerPhone,

          // POC Information
          pocId: pocId || order.pocId,
          pocName: pocName || order.pocName,
          pocEmail: pocEmail || order.pocEmail,
          pocPhone: pocPhone || order.pocPhone,
          pocDesignation: pocDesignation || order.pocDesignation,
          pocDepartment: pocDepartment || order.pocDepartment,

          // Address Information
          billingAddress: billingAddress || order.billingAddress,
          billingAddressLine2: billingAddressLine2 || order.billingAddressLine2,
          billingPin: billingPin || order.billingPin,
          billingCity: billingCity || order.billingCity,
          billingDistrict: billingDistrict || order.billingDistrict,
          billingState: billingState || order.billingState,
          billingCountry: billingCountry || order.billingCountry,

          shippingAddress: shippingAddress || order.shippingAddress,
          shippingAddressLine2: shippingAddressLine2 || order.shippingAddressLine2,
          shippingPin: shippingPin || order.shippingPin,
          shippingCity: shippingCity || order.shippingCity,
          shippingDistrict: shippingDistrict || order.shippingDistrict,
          shippingState: shippingState || order.shippingState,
          shippingCountry: shippingCountry || order.shippingCountry,
          sameAsBilling: sameAsBilling !== undefined ? sameAsBilling : order.sameAsBilling,

          wpcAddress: wpcAddress || order.wpcAddress,
          wpcAddressLine2: wpcAddressLine2 || order.wpcAddressLine2,
          wpcPin: wpcPin || order.wpcPin,
          wpcCity: wpcCity || order.wpcCity,
          wpcDistrict: wpcDistrict || order.wpcDistrict,
          wpcState: wpcState || order.wpcState,
          wpcCountry: wpcCountry || order.wpcCountry,
          wpcSameAsBilling: wpcSameAsBilling !== undefined ? wpcSameAsBilling : order.wpcSameAsBilling,

          // Additional Details
          paymentTerm: paymentTerm || order.paymentTerm,
          paymentMethod: paymentMethod || order.paymentMethod,
          deliveryMethod: deliveryMethod || order.deliveryMethod,
          deliveryInstruction: deliveryInstruction || order.deliveryInstruction,
          modeOfDispatch: modeOfDispatch || order.modeOfDispatch,
          warranty: warranty || order.warranty,
          expectedDeliveryDate: expectedDeliveryDate || order.expectedDeliveryDate,
          notes: notes || order.notes,
          orderRemarks: orderRemarks || order.orderRemarks,

          // License Information
          requiresLicense: requiresLicense !== undefined ? requiresLicense : order.requiresLicense,
          licenseType: licenseType || order.licenseType,
          licenseNumber: licenseNumber || order.licenseNumber,
          licenseExpiryDate: licenseExpiryDate || order.licenseExpiryDate,
          licenseIssueDate: licenseIssueDate || order.licenseIssueDate,
          licenseQuantity: licenseQuantity || order.licenseQuantity,
          licenseStatus: licenseStatus || order.licenseStatus,
          liaisoningRemarks: liaisoningRemarks || order.liaisoningRemarks,
          licenseVerified: licenseVerified !== undefined ? licenseVerified : order.licenseVerified,

          // Additional Costs
          liquidatedDamagesInclusive: liquidatedDamagesInclusive !== undefined ? liquidatedDamagesInclusive : order.liquidatedDamagesInclusive,
          liquidatedDamagesAmount: ensureNumber(liquidatedDamagesAmount, order.liquidatedDamagesAmount),
          freightChargeInclusive: freightChargeInclusive !== undefined ? freightChargeInclusive : order.freightChargeInclusive,
          freightChargeAmount: ensureNumber(freightChargeAmount, order.freightChargeAmount),
          transitInsuranceInclusive: transitInsuranceInclusive !== undefined ? transitInsuranceInclusive : order.transitInsuranceInclusive,
          transitInsuranceAmount: ensureNumber(transitInsuranceAmount, order.transitInsuranceAmount),
          installationInclusive: installationInclusive !== undefined ? installationInclusive : order.installationInclusive,
          installationAmount: ensureNumber(installationAmount, order.installationAmount),
          securityDepositInclusive: securityDepositInclusive !== undefined ? securityDepositInclusive : order.securityDepositInclusive,
          securityDepositAmount: ensureNumber(securityDepositAmount, order.securityDepositAmount),
          liaisoningInclusive: liaisoningInclusive !== undefined ? liaisoningInclusive : order.liaisoningInclusive,
          liaisoningAmount: ensureNumber(liaisoningAmount, order.liaisoningAmount),
          performanceBankGuarantee: performanceBankGuarantee || order.performanceBankGuarantee,

          // Financial Totals
          subtotal: ensureNumber(subtotal, order.subtotal),
          taxAmount: ensureNumber(taxAmount, order.taxAmount),
          discountAmount: ensureNumber(discountAmount, order.discountAmount),
          totalAmount: ensureNumber(totalAmount, order.totalAmount),
          additionalCostTotal: ensureNumber(additionalCostTotal, order.additionalCostTotal),
          grandTotal: ensureNumber(grandTotal, order.grandTotal),

          // Metadata
          documents: documents || order.documents
        },
        { transaction }
      );
    } catch (error) {
      console.error("Error updating order:", error);
      await transaction.rollback();
      return res.status(500).json({ message: "Failed to update order record" });
    }

    // Update order items
    if (items && items.length > 0) {
      try {
        // Delete existing items
        await OrderItem.destroy({
          where: { orderId: order.id },
          transaction
        });

        // Create new items
        const processedItems = await Promise.all(
          items.map(async (itemData: OrderItemData) => {
            try {
              // Ensure numeric values
              const unitPrice = ensureNumber(itemData.unitPrice);
              const taxRate = ensureNumber(itemData.taxRate);
              const quantity = ensureNumber(itemData.quantity);
              const discountRate = ensureNumber(itemData.discountRate, 0);

              // Calculate financial values
              const subtotal = unitPrice * quantity;
              const taxAmount = subtotal * (taxRate / 100);
              const discountAmount = subtotal * (discountRate / 100);
              const totalAmount = subtotal + taxAmount - discountAmount;

              // Create with only essential fields
              const orderItem = await OrderItem.create(
                {
                  orderId: order.id,
                  productId: itemData.productId,
                  productName: itemData.productName,
                  skuId: itemData.skuId || "",
                  unitPrice,
                  taxRate,
                  quantity,
                  discountRate,
                  subtotal,
                  taxAmount,
                  discountAmount,
                  totalAmount,
                  status: "Pending",
                  unit: itemData.unit,
                  description: itemData.description,
                  deliveryDate: itemData.deliveryDate,
                },
                { transaction }
              );

              return orderItem;
            } catch (err) {
              console.error("Error processing order item:", err);
              throw err;
            }
          })
        );
      } catch (error) {
        console.error("Error updating order items:", error);
        await transaction.rollback();
        return res.status(500).json({ message: "Failed to update order items" });
      }
    }

    // Commit the transaction
    await transaction.commit();

    // Return the updated order with items
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        { model: Customer, as: "customer" },
        { model: Poc, as: "poc" },
        { model: OrderItem }
      ]
    });

    return res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder
    });
  } catch (error: any) {
    // Rollback the transaction in case of any error
    await transaction.rollback();
    console.error("Error updating order:", error);
    return res.status(500).json({
      message: "Failed to update order",
      error: error.message
    });
  }
};

export const deleteOrderByOrderNumber = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const transaction = await sequelize.transaction();

  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ 
      where: { orderNumber },
      transaction 
    });
    
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.attachments && order.attachments.length > 0) {
      try {
        await Promise.all(
          order.attachments.map((attachment: string) => {
            try {
              fs.unlinkSync(attachment);
              return Promise.resolve();
            } catch (err) {
              console.error(`Failed to delete file ${attachment}:`, err);
              return Promise.resolve();
            }
          })
        );
        console.log("Successfully deleted associated files from storage");
      } catch (error) {
        console.error("Error deleting files from storage:", error);
      }
    }

    await order.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Order deleted successfully",
      deletedOrderNumber: orderNumber
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in deleteOrderByOrderNumber:", error);
    next(error);
  }
};

async function generateOrderNumber(
  companyName: string,
  customerName: string,
  transaction: any
): Promise<string> {
  try {
    // Format company name: uppercase, remove special chars, take first word
    const formattedCompanyName = companyName.toUpperCase()

    const formattedCustomerName = customerName
      .replace(/ - /g, '-').toUpperCase()

    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    const dateString = `${year}${month}${day}`;

    const prefix = `${formattedCompanyName}-${dateString}-${formattedCustomerName}`;

    console.log(`Generated order number prefix: ${prefix}`);

    const existingOrders = await Order.findAll({
      where: {
        orderNumber: {
          [Op.like]: `${prefix}-%`
        }
      },
      transaction
    });

    console.log(`Found ${existingOrders.length} existing orders with the same prefix`);

    let maxCount = -1;

    if (existingOrders.length > 0) {
      for (const order of existingOrders) {
        const parts = order.orderNumber.split("-");
        const countStr = parts[parts.length - 1];
        const count = parseInt(countStr, 10);

        if (!isNaN(count) && count > maxCount) {
          maxCount = count;
        }
      }
    }

    const newCount = maxCount + 1;
    const countStr = newCount.toString().padStart(3, "0");

    const orderNumber = `${prefix}-${countStr}`;

    console.log(`Generated order number: ${orderNumber}, count: ${newCount}`);

    return orderNumber;
  } catch (error) {
    console.error("Error in generateOrderNumber function:", error);
    throw error;
  }
}
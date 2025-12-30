import { NextFunction, Request, Response } from "express";
import sequelize from "../config/database";
import { quotesPdfContainer } from "../config/storage"; // Change this line
import { AuthenticatedRequest } from "../middlewares/auth";
import { Customer } from "../models/Customer";
import { Quote } from "../models/Quote";
import { QuoteItem } from "../models/QuoteItem";
import { User } from "../models/User";
import { generateQuotePDF } from "../utils/pdfGenerator";

export const createQuote = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const transaction = await sequelize.transaction();

  try {
    const {
      customerId,
      invoiceDate,
      totalAmount,
      items,
      createdBy,
      pendingApprovalBy, // expect an array of user IDs
      approvedBy, // expect an array of user IDs
      remarks,
      visibleColumns, // ADD THIS LINE
    } = req.body;
    const userId = req.auth?.sub || "";

    // Look up the authenticated user
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Ensure the customer belongs to the user's company
    const customer = await Customer.findOne({ where: { id: customerId } });
    if (!customer || customer.companyName !== user.companyName) {
      await transaction.rollback();
      return res
        .status(403)
        .json({ message: "Not authorized for this customer." });
    }

    const latestQuote = await Quote.findOne({
      order: [["id", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    let newRefNo = "001"; // Default starting refNo
    if (latestQuote && latestQuote.refNo) {
      const lastRefNo = parseInt(latestQuote.refNo, 10);
      newRefNo = (lastRefNo + 1).toString().padStart(3, "0");
    }

    // Create new quote including the new fields
    const newQuote = await Quote.create(
      {
        userId,
        customerId,
        invoiceDate,
        refNo: newRefNo,
        createdBy,
        totalAmount,
        status: "Drafted",
        companyName: user.companyName,
        pendingApprovalBy, // can be provided as an array of user IDs
        approvedBy, // same as above
        remarks,
        visibleColumns, // ADD THIS LINE
      },
      { transaction }
    );

    if (items && Array.isArray(items)) {
      for (const item of items) {
        const quoteItemData = {
          ...item,
          quoteId: newQuote.id,
          quantity: parseInt(item.quantity, 10), // Parse quantity to integer
          unitPrice: parseFloat(item.unitPrice), // Parse unitPrice to float
          tax: parseFloat(item.tax), // Parse tax to float
          discount: parseFloat(item.discount), // Parse discount to float
          amount: parseFloat(item.amount), // Parse amount to float
          expDate: item.expDate === "" ? null : item.expDate, // Send null if empty
          mfgDate: item.mfgDate === "" ? null : item.mfgDate, // Send null if empty
        };

        await QuoteItem.create(quoteItemData, { transaction });
      }
    }

    await transaction.commit();
    res.status(201).json(newQuote);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getAllQuotes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.auth?.sub;
    // Look up the authenticated user
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const quotes = await Quote.findAll({
      include: [
        {
          model: QuoteItem,
        },
        {
          model: Customer,
          attributes: ["name"],
          where: { companyName: user.companyName }, // Filter by companyName
        },
      ],
      attributes: ["refNo", "status", "updatedAt", "createdBy", "totalAmount"],
    });
    res.json(quotes);
  } catch (error) {
    next(error);
  }
};

export const getQuoteById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const quote = await Quote.findByPk(id, { include: [QuoteItem] });
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    res.json(quote);
  } catch (error) {
    next(error);
  }
};

export const getQuoteByRefNo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { refNo } = req.params;
    const quote = await Quote.findOne({
      where: { refNo },
      include: [
        QuoteItem,
        {
          model: Customer,
          attributes: [
            "id",
            "name",
            "email",
            "gstNumber",
            "billingStreetAddress",
            "billingAddressLine2",
            "billingPin",
            "billingCity",
            "billingDistrict",
            "billingState",
            "sameAsBilling",
            "shippingStreetAddress",
            "shippingAddressLine2",
            "shippingPin",
            "shippingCity",
            "shippingDistrict",
            "shippingState",
          ],
        },
        {
          // Include the User model to get the updater's name
          model: User,
          as: "Updater", // Alias for the association
          attributes: ["firstName", "lastName"],
        },
      ],
    });
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    // Look up pendingApproval and approved users if available
    let pendingApproverDetails: { id: string; name: string }[] = [];
    let approvedApproverDetails: { id: string; name: string }[] = [];
    if (quote.pendingApprovalBy && quote.pendingApprovalBy.length) {
      const pendingUsers = await User.findAll({
        where: { id: quote.pendingApprovalBy },
      });
      pendingApproverDetails = pendingUsers.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      }));
    }
    if (quote.approvedBy && quote.approvedBy.length) {
      const approvedUsers = await User.findAll({
        where: { id: quote.approvedBy },
      });
      approvedApproverDetails = approvedUsers.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      }));
    }

    const responseData = {
      ...quote.toJSON(),
      pendingApprovalByDetails: pendingApproverDetails,
      approvedByDetails: approvedApproverDetails,
      lastUpdatedBy: quote.Updater
        ? `${quote.Updater.firstName} ${quote.Updater.lastName}`
        : null, // Include last updated by
    };

    res.json(responseData);
  } catch (error) {
    next(error);
  }
};

export const updateQuoteByRefNo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const transaction = await sequelize.transaction();
  try {
    const { refNo } = req.params;
    const updateData = req.body;
    const userId = req.auth?.sub; // Get user ID from authenticated request

    // Find existing quote
    const quote = await Quote.findOne({
      where: { refNo },
      include: [
        QuoteItem,
        {
          model: Customer,
          attributes: [
            "id",
            "name",
            "email",
            "gstNumber",
            "billingStreetAddress",
            "billingAddressLine2",
            "billingPin",
            "billingCity",
            "billingDistrict",
            "billingState",
            "sameAsBilling",
            "shippingStreetAddress",
            "shippingAddressLine2",
            "shippingPin",
            "shippingCity",
            "shippingDistrict",
            "shippingState",
          ],
        },
      ],
      transaction, // Add transaction here
    });

    if (!quote) {
      await transaction.rollback();
      return res.status(404).json({ error: "Quote not found" });
    }

    // Extract approvedBy and pendingApprovalBy from updateData
    const {
      approvedBy: updatedApprovedBy = [],
      pendingApprovalBy,
      visibleColumns, // ADD THIS LINE
      items, // ADD THIS LINE
    } = updateData;

    // Identify users to remove from approvedBy (if any)
    let finalApprovedBy = [...updatedApprovedBy];
    if (pendingApprovalBy && updatedApprovedBy) {
      finalApprovedBy = updatedApprovedBy.filter(
        (approvedUserId: any) => !pendingApprovalBy.includes(approvedUserId)
      );
    }

    // Update quote details, including updatedBy and the adjusted approvedBy list
    await quote.update(
      {
        ...updateData,
        approvedBy: finalApprovedBy, // Use the filtered approvedBy list
        updatedBy: userId, // Include updatedBy
        visibleColumns, // ADD THIS LINE
      },
      { transaction }
    );

    // Update quote items if provided
    if (items && Array.isArray(items)) {
      // First, delete existing quote items
      await QuoteItem.destroy({ where: { quoteId: quote.id }, transaction });

      // Then, create new quote items
      for (const item of items) {
        const quoteItemData = {
          ...item,
          quoteId: quote.id,
          quantity: parseInt(item.quantity, 10), // Parse quantity to integer
          unitPrice: parseFloat(item.unitPrice), // Parse unitPrice to float
          tax: parseFloat(item.tax), // Parse tax to float
          discount: parseFloat(item.discount), // Parse discount to float
          amount: parseFloat(item.amount), // Parse amount to float
          expDate: item.expDate === "" ? null : item.expDate, // Send null if empty
          mfgDate: item.mfgDate === "" ? null : item.mfgDate, // Send null if empty
        };

        await QuoteItem.create(quoteItemData, { transaction });
      }
    }

    // Fetch updated quote with associations
    const updatedQuote = await Quote.findOne({
      where: { refNo },
      include: [
        QuoteItem,
        {
          model: Customer,
          attributes: [
            "id",
            "name",
            "email",
            "gstNumber",
            "billingStreetAddress",
            "billingAddressLine2",
            "billingPin",
            "billingCity",
            "billingDistrict",
            "billingState",
            "sameAsBilling",
            "shippingStreetAddress",
            "shippingAddressLine2",
            "shippingPin",
            "shippingCity",
            "shippingDistrict",
            "shippingState",
          ],
        },
      ],
      transaction, // Add transaction here
    });

    await transaction.commit();
    res.json(updatedQuote);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const approveQuote = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const transaction = await sequelize.transaction();
  try {
    const { refNo } = req.params;
    const userId = req.auth?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const quote = await Quote.findOne({ where: { refNo }, transaction });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found." });
    }

    if (!quote.pendingApprovalBy?.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is not pending approval for this quote." });
    }

    // Move user from pendingApprovalBy to approvedBy
    const updatedPendingApprovalBy = quote.pendingApprovalBy.filter(
      (id) => id !== userId
    );
    const updatedApprovedBy = [...(quote.approvedBy || []), userId];

    await quote.update(
      {
        pendingApprovalBy: updatedPendingApprovalBy,
        approvedBy: updatedApprovedBy,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: "Quote approved successfully." });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateQuote = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      customerId,
      invoiceDate,
      refNo,
      totalAmount,
      status: quoteStatus,
      items,
    } = req.body;
    const quote = await Quote.findByPk(id, { include: [QuoteItem] });
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    // Update quote fields
    quote.customerId = customerId;
    quote.invoiceDate = invoiceDate;
    quote.refNo = refNo;
    quote.totalAmount = totalAmount;
    quote.status = quoteStatus;
    await quote.save();
    // Update items
    if (items && Array.isArray(items)) {
      // remove existing items if needed or adjust logic
      await QuoteItem.destroy({ where: { quoteId: quote.id } });
      for (const item of items) {
        await QuoteItem.create({ ...item, quoteId: quote.id });
      }
    }
    res.json(quote);
  } catch (error) {
    next(error);
  }
};

export const deleteQuote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { refNos } = req.body; // Expecting an array of Ref Numbers

    if (!refNos || !Array.isArray(refNos)) {
      return res.status(400).json({ message: "Invalid Ref Numbers provided." });
    }

    await Quote.destroy({
      where: {
        refNo: refNos,
      },
    });

    res.status(200).json({ message: "Quote(s) deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const downloadQuotePDF = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { refNo } = req.params;
    const quote = await Quote.findOne({
      where: { refNo },
      include: [
        QuoteItem,
        {
          model: Customer,
          attributes: [
            "name",
            "email",
            "gstNumber",
            "billingStreetAddress",
            "billingAddressLine2",
            "billingPin",
            "billingCity",
            "billingState",
          ],
        },
      ],
    });

    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    try {
      const pdfBuffer = await generateQuotePDF(quote);
      const fileName = `quote-${refNo}-${Date.now()}.pdf`;

      // Stream the PDF directly to the response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // Add cache control headers
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation or upload error:", error);
      res.status(500).json({ error: "Failed to generate or upload PDF" });
    }
  } catch (error) {
    next(error);
  }
};
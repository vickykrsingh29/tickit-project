import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { Quote } from "../models/Quote";
import { QuoteItem } from "../models/QuoteItem";
import { Customer } from "../models/Customer";
import { Product } from "../models/Product";
import { User } from "../models/User";
import sequelize from "../config/database";
import { Op } from "sequelize";

// Helper function to format numbers to Indian currency format
const formatToIndianCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getDashboardData = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.auth?.sub;
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const companyName = user.companyName;

    // 1. Business Overview (KPI Cards)
    // Total Quote Value
    const totalQuoteValueResult = await Quote.sum("totalAmount", {
      where: { companyName: companyName },
    });
    const totalQuoteValue = totalQuoteValueResult || 0;

    // Quote Success Rate
    const totalQuotes = await Quote.count({
      where: { companyName: companyName },
    });
    const approvedQuotes = await Quote.count({
      where: { companyName: companyName, status: "Approved" },
    });
    const quoteSuccessRate =
      totalQuotes > 0 ? (approvedQuotes / totalQuotes) * 100 : 0;

    // Total Active Customers
    const totalActiveCustomers = await Customer.count({
      where: { companyName: companyName },
    });

    // New Customers Added (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomersAdded = await Customer.count({
      where: {
        companyName: companyName,
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
    });

    // Top Sales Representative (By Quote Value)
    const topSalesRep = (await Quote.findAll({
      attributes: [
        "createdBy",
        [sequelize.fn("sum", sequelize.col("totalAmount")), "totalSales"],
      ],
      where: { companyName: companyName },
      group: ["createdBy"],
      order: [[sequelize.fn("sum", sequelize.col("totalAmount")), "DESC"]],
      limit: 1,
      raw: true,
    })) as any[];
    const topSalesRepresentative =
      topSalesRep.length > 0 ? topSalesRep[0].createdBy : "N/A";

    // Average Quote Processing Time
    const averageProcessingTimeResult = (await Quote.findAll({
      attributes: [
        [
          sequelize.literal(`
  AVG(
    CASE
      WHEN "updatedAt" IS NOT NULL AND "createdAt" IS NOT NULL THEN
        EXTRACT(EPOCH FROM ("updatedAt" - "createdAt"))
      ELSE NULL
    END
  )
`),
          "avgTime",
        ],
      ],
      where: {
        companyName: companyName,
        status: "Approved",
      },
      raw: true,
    })) as any[];
    const averageProcessingTimeSeconds =
      averageProcessingTimeResult[0]?.avgTime || 0;
    const averageProcessingTimeDays =
      averageProcessingTimeSeconds / (60 * 60 * 24);

    const totalProducts = await Product.count({
      where: { companyName: companyName },
    });

    // 2. Key Trends & Visual Insights (Charts)
    // Quote Trends (Last 6 Months)
    const quoteTrends = (await Quote.findAll({
      attributes: [
        [
          sequelize.fn("date_trunc", "month", sequelize.col("invoiceDate")),
          "month",
        ],
        [sequelize.fn("sum", sequelize.col("totalAmount")), "total"],
      ],
      where: {
        companyName: companyName,
        invoiceDate: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        },
      },
      group: [
        sequelize.fn("date_trunc", "month", sequelize.col("invoiceDate")),
      ],
      order: [[sequelize.literal("month"), "ASC"]],
      raw: true,
    })) as any[];

    const quoteTrendsChartData = {
      labels: quoteTrends.map((item: any) =>
        new Date(item.month).toLocaleDateString("default", {
          month: "short",
          year: "numeric",
        })
      ),
      datasets: [
        {
          label: "Quote Value",
          data: quoteTrends.map((item: any) => item.total),
          fill: false,
          borderColor: "#1a73e8",
        },
      ],
    };

    // Quote Status Distribution
    const quoteStatusDistribution = (await Quote.findAll({
      attributes: [
        "status",
        [sequelize.fn("count", sequelize.col("status")), "count"],
      ],
      where: { companyName: companyName },
      group: ["status"],
      raw: true,
    })) as any[];

    const quoteStatusChartData = {
      labels: quoteStatusDistribution.map((item: any) => item.status),
      datasets: [
        {
          data: quoteStatusDistribution.map((item: any) => item.count),
          backgroundColor: ["#1a73e8", "#34a853", "#f44336"],
        },
      ],
    };

    // Top Products in Quotes
    const topProducts = (await QuoteItem.findAll({
      attributes: [
        "productName",
        [sequelize.fn("count", sequelize.col("productName")), "count"],
      ],
      include: [
        {
          model: Quote,
          where: { companyName: companyName },
          attributes: [],
        },
      ],
      group: ["productName"],
      order: [[sequelize.literal("count"), "DESC"]],
      limit: 5,
      raw: true,
    })) as any[];

    const topProductsChartData = {
      labels: topProducts.map((item: any) => item.productName),
      datasets: [
        {
          label: "Number of Times Quoted",
          data: topProducts.map((item: any) => item.count),
          backgroundColor: "#1a73e8",
        },
      ],
    };

    // Customer Distribution by Industry
    const customerDistribution = (await Customer.findAll({
      attributes: [
        "industry",
        [sequelize.fn("count", sequelize.col("industry")), "count"],
      ],
      where: { companyName: companyName },
      group: ["industry"],
      raw: true,
    })) as any[];

    const customerIndustryChartData = {
      labels: customerDistribution.map((item: any) => item.industry),
      datasets: [
        {
          data: customerDistribution.map((item: any) => item.count),
          backgroundColor: [
            "#1a73e8",
            "#34a853",
            "#f44336",
            "#ff9800",
            "#9c27b0",
          ],
        },
      ],
    };

    // 3. Sales & Customer Insights
    // Top Customers by Quote Value
    const topCustomers = (await Quote.findAll({
      attributes: [
        "customerId",
        [sequelize.fn("sum", sequelize.col("totalAmount")), "totalValue"],
      ],
      where: { companyName: companyName },
      include: [
        {
          model: Customer,
          as: "customer", // Add explicit alias
          attributes: ["name"],
          required: false,
        },
      ],
      group: ["Quote.customerId", "customer.name"], // Use lowercase 'customer' to match the alias
      order: [[sequelize.literal('"totalValue"'), "DESC"]], // Quote the column name
      limit: 5,
      raw: true,
      nest: true,
    })) as any[];

    // Person-wise Quote Generation
    const personQuoteGeneration = (await Quote.findAll({
      attributes: [
        "createdBy",
        [sequelize.fn("count", sequelize.col("createdBy")), "quoteCount"],
      ],
      where: { companyName: companyName },
      group: ["createdBy"],
      order: [[sequelize.literal('"quoteCount"'), "DESC"]], // Fix: Properly quote the column name
      raw: true,
    })) as any[];

    const personQuoteGenerationChartData = {
      labels: personQuoteGeneration.map((item: any) => item.createdBy),
      datasets: [
        {
          label: "Quotes Generated",
          data: personQuoteGeneration.map((item: any) => item.quoteCount),
          backgroundColor: "#1a73e8",
        },
      ],
    };

    // Quote Approval Time Analysis
    // Quote Approval Time Analysis
    const approvalTimeAnalysisResult = (await Quote.findAll({
      attributes: [
        [
          sequelize.literal(`
          AVG(
            CASE
              WHEN "updatedAt" IS NOT NULL AND "createdAt" IS NOT NULL THEN
                EXTRACT(EPOCH FROM ("updatedAt" - "createdAt"))
              ELSE NULL
            END
          )
        `),
          "avgApprovalTime",
        ],
      ],
      where: {
        companyName: companyName,
        status: "Approved",
        updatedAt: {
          [Op.ne]: null,
        },
      },
      raw: true,
    })) as any[];

    const averageApprovalTimeSeconds =
      approvalTimeAnalysisResult[0]?.avgApprovalTime || 0;
    const averageApprovalTimeDays = averageApprovalTimeSeconds / (60 * 60 * 24);

    res.status(200).json({
      kpiCards: {
        totalQuoteValue: formatToIndianCurrency(totalQuoteValue),
        quoteSuccessRate: quoteSuccessRate.toFixed(2),
        totalActiveCustomers,
        newCustomersAdded,
        topSalesRepresentative,
        averageQuoteProcessingTime: averageProcessingTimeDays.toFixed(2),
        totalProducts,
        totalQuotes,
      },
      chartData: {
        quoteTrends: quoteTrendsChartData,
        quoteStatusDistribution: quoteStatusChartData,
        topProducts: topProductsChartData,
        customerDistribution: customerIndustryChartData,
      },
      salesCustomerInsights: {
        topCustomers: topCustomers.map((customer: any) => ({
          customerName: customer.customer?.name || "Unknown", // Updated to use lowercase 'customer'
          totalValue: customer.totalValue,
        })),
        personQuoteGeneration: personQuoteGenerationChartData,
        averageApprovalTime: averageApprovalTimeDays.toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};

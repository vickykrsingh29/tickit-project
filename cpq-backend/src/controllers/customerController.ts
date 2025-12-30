import { NextFunction, Request, Response } from "express";
import { deleteFromBlob } from "../config/storage";
import { AuthenticatedRequest } from "../middlewares/auth";
import { uploadToBlob } from "../middlewares/upload";
import { Customer } from "../models/Customer";
import { User } from "../models/User";
import { Poc } from "../models/Poc";
 
// Get all customers for authenticated user (only their company)
export const getAllCustomers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = (req as AuthenticatedRequest).auth?.sub;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });
 
    const customers = await Customer.findAll({
      where: { companyName: user.companyName },
    });
    res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
};
// Get customer by ID
export const getCustomerById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = (req as AuthenticatedRequest).auth?.sub;
    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
      },
    });
 
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
 
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};
// Get customer by Name
export const getCustomerByName = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const customer = await Customer.findAll({
      where: { name: req.params.name },
    });
    if (!customer.length) {
      return res
        .status(404)
        .json({ message: "No customer found with that name" });
    }
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};
 
export const createCustomer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const customerData =
      typeof req.body.customer === "string"
        ? JSON.parse(req.body.customer)
        : req.body;
 
    // Handle image uploads using Azure Blob Storage
    if (files?.images || files?.image) {
      try {
        const imageFiles = files.images || files.image;
        const imageUrls = await Promise.all(
          imageFiles.map((file) => uploadToBlob(file))
        );
        customerData.images = imageUrls;
        console.log("Images uploaded successfully:", imageUrls);
      } catch (error) {
        console.error("Image upload error:", error);
        return res.status(500).json({ error: "Failed to upload images" });
      }
    }
 
    // Handle document uploads using Azure Blob Storage
    // if (files?.documents || files?.document) {
    //   try {
    //     const documentFiles = files.documents || files.document;
    //     const documentUrls = await Promise.all(
    //       documentFiles.map((file) => uploadToBlob(file))
    //     );
    //     customerData.documents = documentUrls;
    //     console.log("Documents uploaded successfully:", documentUrls);
    //   } catch (error) {
    //     console.error("Document upload error:", error);
    //     return res.status(500).json({ error: "Failed to upload documents" });
    //   }
    // }
 
    if(customerData.sameAsBilling){
      customerData.shippingStreetAddress = customerData.billingStreetAddress;
      customerData.shippingAddressLine2 = customerData.billingAddressLine2;
      customerData.shippingPin = customerData.billingPin;
      customerData.shippingCity = customerData.billingCity;
      customerData.shippingDistrict = customerData.billingDistrict;
      customerData.shippingState = customerData.billingState;
      customerData.shippingCountry = customerData.billingCountry;
    }
 
    if(customerData.wpcSameAsBilling){
      customerData.wpcStreetAddress = customerData.billingStreetAddress;
      customerData.wpcAddressLine2 = customerData.billingAddressLine2;
      customerData.wpcPin = customerData.billingPin;
      customerData.wpcCity = customerData.billingCity;
      customerData.wpcDistrict = customerData.billingDistrict;
      customerData.wpcState = customerData.billingState;
      customerData.wpcCountry = customerData.billingCountry;
    }
 
    console.log("Customer data:", customerData);
 
    const {
      name,
      ancillaryName,
      socialHandles,
      typeOfCustomer,
      email,
      phone,
      industry,
      website,
      gstNumber,
      salesRep,
      billingStreetAddress,
      billingAddressLine2,
      billingPin,
      billingCity,
      billingDistrict,
      billingState,
      billingCountry,
      shippingStreetAddress,
      shippingAddressLine2,
      shippingPin,
      shippingCity,
      shippingDistrict,
      shippingState,
      shippingCountry,
      sameAsBilling,
      wpcStreetAddress,
      wpcAddressLine2,
      wpcPin,
      wpcCity,
      wpcDistrict,
      wpcState,
      wpcCountry,
      wpcSameAsBilling,
    } = customerData;
 
    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "website",
      "industry",
      "typeOfCustomer",
      "salesRep",
    ];
 
    const missingFields = requiredFields.filter(
      (field) => !customerData[field]
    );
 
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }
 
    const userId = req.auth?.sub;
 
    // Look up the authenticated user from the database
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
 
    // Automatically set the companyName from the authenticated user's record
    const newCustomer = await Customer.create({
      name,
      ancillaryName,
      email,
      website,
      socialHandles,
      typeOfCustomer,
      phone,
      industry,
      gstNumber,
      salesRep,
      billingStreetAddress,
      billingAddressLine2,
      billingPin,
      billingCity,
      billingDistrict,
      billingState,
      billingCountry,
      shippingStreetAddress,
      shippingAddressLine2,
      shippingPin,
      shippingCity,
      shippingDistrict,
      shippingState,
      shippingCountry,
      sameAsBilling: sameAsBilling === "true" || sameAsBilling === true,
      wpcStreetAddress,
      wpcAddressLine2,
      wpcPin,
      wpcCity,
      wpcDistrict,
      wpcState,
      wpcCountry,
      wpcSameAsBilling: wpcSameAsBilling === "true" || wpcSameAsBilling === true,
      images: customerData.images || [], // Add this line to handle images
      documents: customerData.documents,
      userId,
      companyName: user.companyName, // <-- Automatically fill companyName
    });
 
    res.status(201).json(newCustomer);
  } catch (error) {
    next(error);
  }
};
 
export const updateCustomer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const customerData =
      typeof req.body.customer === "string"
        ? JSON.parse(req.body.customer)
        : req.body;
 
    console.log("Received customer data:", customerData);
 
    const customer = await Customer.findOne({ where: { id: req.params.id } });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
 
    // Handle file deletions first
    // const documentsToDelete = JSON.parse(req.body.documentsToDelete || "[]");
    const imagesToDelete = JSON.parse(req.body.imagesToDelete || "[]");
 
    console.log("Files to delete:", { imagesToDelete });

    // Delete images from blob storage
    if (imagesToDelete.length > 0) {
      try {
        await Promise.all(
          imagesToDelete.map((url: string) => deleteFromBlob(url))
        );
        console.log("Successfully deleted images from storage");
      } catch (error) {
        console.error("Error deleting images from storage:", error);
      }
    }

    // Filter out deleted documents and images
    // const remainingDocuments = (customer.documents || []).filter(
    //   (doc) => !documentsToDelete.includes(doc)
    // );
    
    const remainingImages = (customer.images || []).filter(
      (img) => !imagesToDelete.includes(img)
    );
 
    // Handle new file uploads
    let newImageUrls: string[] = [];
    // let newDocumentUrls: string[] = [];
 
    //if images are more than one
    if (files?.images && files.images.length > 1) {
      throw new Error("More than 1 image is not allowed!");
    }
   
    if (files?.images || files?.image) {
      const imageFiles = files.images || files.image;
      newImageUrls = await Promise.all(
        imageFiles.map((file) => uploadToBlob(file))
      );
      console.log("New images uploaded:", newImageUrls);
    }
 
    // if (files?.documents || files?.document) {
    //   const documentFiles = files.documents || files.document;
    //   newDocumentUrls = await Promise.all(
    //     documentFiles.map((file) => uploadToBlob(file))
    //   );
    //   console.log("New documents uploaded:", newDocumentUrls);
    // }
 
    // Delete files from storage
    try {
      await Promise.all([
        // ...documentsToDelete.map((doc: string) => deleteFromBlob(doc)),
        ...imagesToDelete.map((img: string) => deleteFromBlob(img)),
      ]);
      console.log("Successfully deleted files from storage");
    } catch (error) {
      console.error("Error deleting files from storage:", error);
      // Continue with update even if deletion fails
    }
 
    // Update customer record
    const updatedCustomer = {
      ...customerData,
      images: [...newImageUrls],
      // documents: [...remainingDocuments, ...newDocumentUrls],
      // Remove tracking fields
      // documentsToDelete: undefined,
      imagesToDelete: undefined,
      existingDocuments: undefined,
      existingImages: undefined,
      userId: req.auth?.sub,
    };
 
    await customer.update(updatedCustomer);
    res.status(200).json(customer);
  } catch (error) {
    console.error("Error in updateCustomer:", error);
    next(error);
  }
};
// Delete customer
export const deleteCustomer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { customerIds } = req.body;
 
    if (!customerIds || !Array.isArray(customerIds)) {
      return res
        .status(400)
        .json({ message: "Invalid customer IDs provided." });
    }
 
    // Find customers to delete and their associated files
    const customers = await Customer.findAll({
      where: { id: customerIds },
    });
 
    if (customers.length === 0) {
      return res.status(404).json({ message: "No customers found to delete." });
    }
 
    // Collect all file URLs that need to be deleted
    const filesToDelete: string[] = [];
    customers.forEach((customer) => {
      if (customer.images) filesToDelete.push(...customer.images);
      // if (customer.documents) filesToDelete.push(...customer.documents);
    });
 
    // Delete customers from database
    await Customer.destroy({
      where: { id: customerIds },
    });
 
    // Delete files from blob storage
    if (filesToDelete.length > 0) {
      try {
        await Promise.all(
          filesToDelete.map((fileUrl) => deleteFromBlob(fileUrl))
        );
        console.log("Successfully deleted associated files from storage");
      } catch (error) {
        console.error("Error deleting files from storage:", error);
        // Continue since customers are already deleted from database
      }
    }
 
    res.status(200).json({
      message: "Customer(s) and associated files deleted successfully.",
      deletedCount: customers.length,
    });
  } catch (error) {
    console.error("Error deleting customer(s):", error);
    next(error);
  }
};
// Delete customers
export const deleteCustomers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = (req as AuthenticatedRequest).auth?.sub;
    const { ids } = req.body;
 
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid request. No customer IDs provided." });
    }
 
    // Find all customers and their associated files
    const customers = await Customer.findAll({
      where: { id: ids },
    });
 
    if (customers.length === 0) {
      return res
        .status(404)
        .json({ message: "No customers found for the provided IDs." });
    }
 
    // Collect all file URLs that need to be deleted
    const filesToDelete: string[] = [];
    customers.forEach((customer) => {
      if (customer.images) filesToDelete.push(...customer.images);
      // if (customer.documents) filesToDelete.push(...customer.documents);
    });
 
    // Delete customers from database
    await Customer.destroy({
      where: { id: ids },
    });
 
    // Delete files from blob storage
    if (filesToDelete.length > 0) {
      try {
        await Promise.all(
          filesToDelete.map((fileUrl) => deleteFromBlob(fileUrl))
        );
        console.log("Successfully deleted associated files from storage");
      } catch (error) {
        console.error("Error deleting files from storage:", error);
        // Continue since customers are already deleted from database
      }
    }
 
    res.status(200).json({
      message: "Customers and associated files deleted successfully.",
      deletedCount: customers.length,
    });
  } catch (error) {
    console.error("Error in deleteCustomers:", error);
    next(error);
  }
};
/**
 * Get all companies
 */
export const getAllCompanies = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = (req as AuthenticatedRequest).auth?.sub;
    const user = await User.findOne({ where: { id: userId } });
    const whereClause: any = {};

    if (!user) return res.status(404).json({ message: "User not found" });

    if (userId) {
      whereClause.companyName = user.companyName;
    }

    const companies = await Customer.findAll({
      attributes: ["name"],
      group: ["name"],
      order: [["name", "ASC"]],
      where: whereClause,
    });
 
    const formattedCompanies = companies.map((company) => ({
      label: company.name,
      value: company.name,
    }));
 
    res.status(200).json(formattedCompanies);
  } catch (error) {
    next(error);
  }
};
 
export const getAllTypeOfCustomers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const typeOfCustomers = await Customer.findAll({
      attributes: ["typeOfCustomer"],
      group: ["typeOfCustomer"],
      order: [["typeOfCustomer", "ASC"]],
    });
 
    const formattedTypesOfCustomers = typeOfCustomers.map((typeOfCustomer) => ({
      label: typeOfCustomer.typeOfCustomer,
      value: typeOfCustomer.typeOfCustomer,
    }));
 
    res.status(200).json(formattedTypesOfCustomers);
  } catch (error) {
    next(error);
  }
};
 
 
/**
 * Get all industries
 */
export const getAllIndustries = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const industries = await Customer.findAll({
      attributes: ["industry"],
      group: ["industry"],
      order: [["industry", "ASC"]],
    });
 
    const formattedIndustries = industries.map((industry) => ({
      label: industry.industry,
      value: industry.industry,
    }));
 
    res.status(200).json(formattedIndustries);
  } catch (error) {
    next(error);
  }
};
 
/**
 * Get all sales representatives
 */
export const getAllSalesReps = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const salesReps = await Customer.findAll({
      attributes: ["salesRep"],
      group: ["salesRep"],
      order: [["salesRep", "ASC"]],
    });
 
    const formattedSalesReps = salesReps.map((rep) => ({
      label: rep.salesRep,
      value: rep.salesRep,
    }));
 
    res.status(200).json(formattedSalesReps);
  } catch (error) {
    next(error);
  }
};
 
/**
 * Get all cities
 */
export const getAllCities = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const cities = await Customer.findAll({
      attributes: ["billingCity", "shippingCity"],
      order: [["billingCity", "ASC"]],
    });
 
    const allCities = cities.reduce<string[]>((acc, city) => {
      if (city.billingCity) acc.push(city.billingCity);
      if (city.shippingCity) acc.push(city.shippingCity);
      return acc;
    }, []);
 
    const uniqueCities = Array.from(new Set(allCities));
 
    const formattedCities = uniqueCities.map((city) => ({
      label: city,
      value: city,
    }));
 
    res.status(200).json(formattedCities);
  } catch (error) {
    next(error);
  }
};
 
/**
 * Get all districts
 */
export const getAllDistricts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const districts = await Customer.findAll({
      attributes: ["billingDistrict", "shippingDistrict"],
      order: [["billingDistrict", "ASC"]],
    });
 
    const allDistricts = districts.reduce<string[]>((acc, district) => {
      if (district.billingDistrict) acc.push(district.billingDistrict);
      if (district.shippingDistrict) acc.push(district.shippingDistrict);
      return acc;
    }, []);
 
    const uniqueDistricts = Array.from(new Set(allDistricts));
 
    const formattedDistricts = uniqueDistricts.map((district) => ({
      label: district,
      value: district,
    }));
 
    res.status(200).json(formattedDistricts);
  } catch (error) {
    next(error);
  }
};
 
/**
 * Get all states
 */
export const getAllStates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const states = await Customer.findAll({
      attributes: ["billingState", "shippingState"],
      order: [["billingState", "ASC"]],
    });
 
    const allStates = states.reduce<string[]>((acc, state) => {
      if (state.billingState) acc.push(state.billingState);
      if (state.shippingState) acc.push(state.shippingState);
      return acc;
    }, []);
 
    const uniqueStates = Array.from(new Set(allStates));
 
    const formattedStates = uniqueStates.map((state) => ({
      label: state,
      value: state,
    }));
 
    res.status(200).json(formattedStates);
  } catch (error) {
    next(error);
  }
};
 
/**
 * Get all countries
 */
export const getAllCountries = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const countries = await Customer.findAll({
      attributes: ["billingCountry", "shippingCountry"],
      order: [["billingCountry", "ASC"]],
    });
 
    const allCountries = countries.reduce<string[]>((acc, country) => {
      if (country.billingCountry) acc.push(country.billingCountry);
      if (country.shippingCountry) acc.push(country.shippingCountry);
      return acc;
    }, []);
 
    const uniqueCountries = Array.from(new Set(allCountries));
 
    const formattedCountries = uniqueCountries.map((country) => ({
      label: country,
      value: country,
    }));
 
    res.status(200).json(formattedCountries);
  } catch (error) {
    next(error);
  }
};
 
 
export const getAllCustomersForSelect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.auth?.sub;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });
 
    // Get customers for the authenticated user's company
    const customers = await Customer.findAll({
      where: { companyName: user.companyName },
      order: [["name", "ASC"]],
    });
 
    // Format each customer with label and value for React Select
    const formattedCompanies = customers.map((customer) => {
      const label = customer.ancillaryName
        ? `${customer.name} - ${customer.ancillaryName}`
        : customer.name;
      return {
        label,
        value: customer.id,
      };
    });
 
    res.status(200).json(formattedCompanies);
  } catch (error) {
    next(error);
  }
};
 
// Get all customers with their POCs
export const getCustomersWithPocs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.auth?.sub;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });
 
    // Get customers for the authenticated user's company
    const customers = await Customer.findAll({
      where: { companyName: user.companyName },
      include: [
        {
          model: Poc,
          as: 'pocs',  // This matches the association defined in Customer model
        }
      ],
      order: [["name", "ASC"]],
    });
 
    // Format the response with parent+ancillary names and associated POCs
    const formattedCustomers = customers.map((customer) => {
      const customerName = customer.ancillaryName
        ? `${customer.name} - ${customer.ancillaryName}`
        : customer.name;
     
      return {
        id: customer.id,
        name: customerName,
        customerData: {
          ...customer.toJSON(),
          formattedName: customerName
        },
        pocs: customer.pocs || []
      };
    });
 
    res.status(200).json(formattedCustomers);
  } catch (error) {
    next(error);
  }
};
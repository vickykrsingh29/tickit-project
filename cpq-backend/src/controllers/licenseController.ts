import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { License } from "../models/License";
import { LicenseDevice } from "../models/LicenseDevice";
import { Customer } from "../models/Customer";
import { Poc } from "../models/Poc";
import { User } from "../models/User";
import { uploadToBlob } from "../middlewares/upload";
import sequelize from "../config/database";
import { deleteFromBlob } from "../config/storage";
import { Op } from "sequelize"; 

export interface LicenseRequest extends AuthenticatedRequest {
    files?: { [fieldname: string]: Express.Multer.File[] };
  }
// Get all licenses for the user's company
export const getAllLicenses = async (
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

    // Fetch licenses associated with the user's company
    const licenses = await License.findAll({
      where: { companyName: user.companyName },
      include: [
        {
          model: Customer,
          attributes: ["id", "name", "ancillaryName"],
        },
        {
          model: Poc,
          as: "contactPerson",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: LicenseDevice,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(licenses);
  } catch (error) {
    next(error);
  }
};

// Get license by ID (with company check)
export const getLicenseById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.auth?.sub;
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const license = await License.findOne({
      where: { id, companyName: user.companyName },
      include: [
        { model: Customer },
        { model: Poc, as: "contactPerson" },
        { model: LicenseDevice },
      ],
    });

    if (!license) {
      return res
        .status(404)
        .json({
          message:
            "License not found or you don't have permission to access it",
        });
    }

    res.status(200).json(license);
  } catch (error) {
    next(error);
  }
};

// Create new license
export const createLicense = async (
    req: LicenseRequest,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const transaction = await sequelize.transaction();
  
    try {
      const userId = req.auth?.sub;
      const user = await User.findOne({ where: { id: userId } });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Process uploaded files - updated approach
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Process licenseDocument
      const licenseDocumentUrl = files?.licenseDocument && files.licenseDocument.length > 0
        ? await uploadToBlob(files.licenseDocument[0])
        : null;
      
      // Process etaCertificate
      const etaCertificateUrl = files?.etaCertificate && files.etaCertificate.length > 0
        ? await uploadToBlob(files.etaCertificate[0])
        : null;
      
      // Process importLicense
      const importLicenseUrl = files?.importLicense && files.importLicense.length > 0
        ? await uploadToBlob(files.importLicense[0])
        : null;
      
      // Process otherDocuments
      const otherDocumentsUrls = [];
      if (files?.otherDocuments && files.otherDocuments.length > 0) {
        for (const file of files.otherDocuments) {
          const url = await uploadToBlob(file);
          otherDocumentsUrls.push(url);
        }
      }

    // Parse devices data
    let devices = [];
    if (req.body.devices) {
      devices = JSON.parse(req.body.devices);
    }

    // Verify customer belongs to user's company
    const customer = await Customer.findOne({
      where: { id: req.body.companyId },
    });

    if (!customer || customer.companyName !== user.companyName) {
      await transaction.rollback();
      return res.status(403).json({
        message: "Not authorized for this customer",
      });
    }

    // Create license record
    const license = await License.create(
      {
        licenseNumber: req.body.licenseNumber,
        licenseType: req.body.licenseType,
        issuingDate: req.body.issuingDate,
        expiryDate: req.body.expiryDate,
        status: req.body.status,
        issuingAuthority: req.body.issuingAuthority,
        processedBy: req.body.processedBy || userId,

        // Set company name from the authenticated user
        companyName: user.companyName,

        // Company details
        companyId: req.body.companyId,

        // WPC Address
        wpcStreetAddress: req.body.wpcStreetAddress,
        wpcAddressLine2: req.body.wpcAddressLine2,
        wpcPin: req.body.wpcPin,
        wpcCity: req.body.wpcCity,
        wpcDistrict: req.body.wpcDistrict,
        wpcState: req.body.wpcState,
        wpcCountry: req.body.wpcCountry,

        // Contact person details
        contactPersonId: req.body.contactPersonId,
        contactPersonName: req.body.contactPersonName,
        contactPersonNumber: req.body.contactPersonNumber,
        contactPersonEmailId: req.body.contactPersonEmailId,

        // Operational details
        geographicalCoverage: req.body.geographicalCoverage,
        endUsePurpose: req.body.endUsePurpose,

        // Document URLs
        licenseDocumentUrl,
        etaCertificateUrl,
        importLicenseUrl,
        otherDocumentsUrls,

        // Audit fields
        createdBy: userId,
      },
      { transaction }
    );

    // Create device records
    if (devices && devices.length > 0) {
      for (const device of devices) {
        await LicenseDevice.create(
          {
            licenseId: license.id,
            productName: device.productName,
            brand: device.brand,
            frequencyRange: device.frequencyRange,
            powerOutput: device.powerOutput,
            quantityApproved: device.quantityApproved,
            countryOfOrigin: device.countryOfOrigin,
            equipmentType: device.equipmentType,
            technologyUsed: device.technologyUsed,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    // Fetch complete license data with associations
    const completeData = await License.findByPk(license.id, {
      include: [
        { model: Customer },
        { model: Poc, as: "contactPerson" },
        { model: LicenseDevice },
      ],
    });

    res.status(201).json(completeData);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Update license with company check
export const updateLicense = async (
  req: LicenseRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = req.auth?.sub;
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if license exists and belongs to user's company
    const license = await License.findOne({
      where: { id, companyName: user.companyName },
    });

    if (!license) {
      await transaction.rollback();
      return res.status(404).json({
        message: "License not found or you don't have permission to update it",
      });
    }

    // Process files if included in the update
    let licenseDocumentUrl = license.licenseDocumentUrl;
    let etaCertificateUrl = license.etaCertificateUrl;
    let importLicenseUrl = license.importLicenseUrl;
    let otherDocumentsUrls = license.otherDocumentsUrls || [];

    if (req.files) {
      if (req.files.licenseDocument) {
        licenseDocumentUrl = await uploadToBlob(req.files.licenseDocument[0]);
      }
      if (req.files.etaCertificate) {
        etaCertificateUrl = await uploadToBlob(req.files.etaCertificate[0]);
      }
      if (req.files.importLicense) {
        importLicenseUrl = await uploadToBlob(req.files.importLicense[0]);
      }
      if (req.files.otherDocuments) {
        const newUrls = [];
        for (const file of req.files.otherDocuments) {
          const url = await uploadToBlob(file);
          newUrls.push(url);
        }
        otherDocumentsUrls = [...otherDocumentsUrls, ...newUrls];
      }
    }

    // Parse devices data if included
    let devices = [];
    if (req.body.devices) {
      devices = JSON.parse(req.body.devices);
    }

    // Update license details
    await license.update(
      {
        licenseNumber: req.body.licenseNumber || license.licenseNumber,
        licenseType: req.body.licenseType || license.licenseType,
        issuingDate: req.body.issuingDate || license.issuingDate,
        expiryDate: req.body.expiryDate || license.expiryDate,
        status: req.body.status || license.status,
        issuingAuthority: req.body.issuingAuthority || license.issuingAuthority,
        processedBy: req.body.processedBy || license.processedBy,

        // Don't update companyName as it should remain constant
        // Don't update companyId as it should remain constant

        wpcStreetAddress: req.body.wpcStreetAddress || license.wpcStreetAddress,
        wpcAddressLine2: req.body.wpcAddressLine2 || license.wpcAddressLine2,
        wpcPin: req.body.wpcPin || license.wpcPin,
        wpcCity: req.body.wpcCity || license.wpcCity,
        wpcDistrict: req.body.wpcDistrict || license.wpcDistrict,
        wpcState: req.body.wpcState || license.wpcState,
        wpcCountry: req.body.wpcCountry || license.wpcCountry,

        contactPersonId: req.body.contactPersonId || license.contactPersonId,
        contactPersonName:
          req.body.contactPersonName || license.contactPersonName,
        contactPersonNumber:
          req.body.contactPersonNumber || license.contactPersonNumber,
        contactPersonEmailId:
          req.body.contactPersonEmailId || license.contactPersonEmailId,

        geographicalCoverage:
          req.body.geographicalCoverage || license.geographicalCoverage,
        endUsePurpose: req.body.endUsePurpose || license.endUsePurpose,

        licenseDocumentUrl,
        etaCertificateUrl,
        importLicenseUrl,
        otherDocumentsUrls,

        lastUpdatedBy: userId,
      },
      { transaction }
    );

    // Update devices if included
    if (devices && devices.length > 0) {
      // Delete existing devices
      await LicenseDevice.destroy({
        where: { licenseId: license.id },
        transaction,
      });

      // Create new devices
      for (const device of devices) {
        await LicenseDevice.create(
          {
            licenseId: license.id,
            productName: device.productName,
            brand: device.brand,
            frequencyRange: device.frequencyRange,
            powerOutput: device.powerOutput,
            quantityApproved: device.quantityApproved,
            countryOfOrigin: device.countryOfOrigin,
            equipmentType: device.equipmentType,
            technologyUsed: device.technologyUsed,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    // Return updated license with associations
    const updatedLicense = await License.findByPk(id, {
      include: [
        { model: Customer },
        { model: Poc, as: "contactPerson" },
        { model: LicenseDevice },
      ],
    });

    res.status(200).json(updatedLicense);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Delete license with company check
export const deleteLicense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.auth?.sub;
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if license exists and belongs to user's company
    const license = await License.findOne({
      where: { id, companyName: user.companyName },
    });

    if (!license) {
      return res.status(404).json({
        message: "License not found or you don't have permission to delete it",
      });
    }

    // Delete license (will cascade to devices due to association)
    await license.destroy();

    res.status(200).json({ message: "License deleted successfully" });
  } catch (error) {
    next(error);
  }
};


// Delete multiple licenses with company check and document cleanup
export const deleteManyLicenses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { licenseIds } = req.body;
    
    // Validate input
    if (!licenseIds || !Array.isArray(licenseIds) || licenseIds.length === 0) {
      return res.status(400).json({ 
        message: "Please provide an array of license IDs" 
      });
    }

    const userId = req.auth?.sub;
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all licenses that belong to user's company with their document URLs
    const licenses = await License.findAll({
      where: { 
        id: licenseIds,
        companyName: user.companyName 
      }
    });

    // Check if all requested licenses were found
    if (licenses.length !== licenseIds.length) {
      await transaction.rollback();
      return res.status(403).json({
        message: "One or more licenses were not found or you don't have permission to delete them",
        deletedCount: 0
      });
    }

    // Delete all associated documents from blob storage
    const deletionPromises = [];
    for (const license of licenses) {
      // Delete license document if exists
      if (license.licenseDocumentUrl) {
        deletionPromises.push(deleteFromBlob(license.licenseDocumentUrl));
      }
      
      // Delete ETA certificate if exists
      if (license.etaCertificateUrl) {
        deletionPromises.push(deleteFromBlob(license.etaCertificateUrl));
      }
      
      // Delete import license if exists
      if (license.importLicenseUrl) {
        deletionPromises.push(deleteFromBlob(license.importLicenseUrl));
      }
      
      // Delete all other documents if any exist
      if (license.otherDocumentsUrls && license.otherDocumentsUrls.length > 0) {
        for (const url of license.otherDocumentsUrls) {
          deletionPromises.push(deleteFromBlob(url));
        }
      }
    }
    
    // Wait for all document deletions to complete
    try {
      await Promise.all(deletionPromises);
    } catch (error) {
      console.error("Error deleting some documents from blob storage:", error);
      // Continue with license deletion even if some document deletions fail
    }

    // Delete all licenses (this will cascade to LicenseDevice records)
    await License.destroy({
      where: { 
        id: licenseIds,
        companyName: user.companyName 
      },
      transaction
    });

    await transaction.commit();
    
    res.status(200).json({ 
      message: "Licenses and associated documents deleted successfully", 
      deletedCount: licenses.length 
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Gets all select options for AddLicenseModal
export const getLicenseSelectOptions = async (
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

    // Get distinct values from License model filtered by company
    const licenseTypes = await License.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('licenseType')), 'licenseType']],
      where: { companyName: user.companyName },
      raw: true
    });
    
    const statuses = await License.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('status')), 'status']],
      where: { companyName: user.companyName },
      raw: true
    });
    
    const issuingAuthorities = await License.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('issuingAuthority')), 'issuingAuthority']],
      where: { companyName: user.companyName },
      raw: true
    });
    
    const geographicalCoverages = await License.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('geographicalCoverage')), 'geographicalCoverage']],
      where: { 
        companyName: user.companyName,
        geographicalCoverage: { [Op.ne]: null }
      },
      raw: true
    });
    
    const endUsePurposes = await License.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('endUsePurpose')), 'endUsePurpose']],
      where: { 
        companyName: user.companyName,
        endUsePurpose: { [Op.ne]: null }
      },
      raw: true
    });
    
    // Get distinct values from LicenseDevice model through association
    const licenseIds = await License.findAll({
      attributes: ['id'],
      where: { companyName: user.companyName },
      raw: true
    }).then(licenses => licenses.map(license => license.id));

    const countriesOfOrigin = await LicenseDevice.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('countryOfOrigin')), 'countryOfOrigin']],
      where: { 
        licenseId: licenseIds,
        countryOfOrigin: { [Op.ne]: null }
      },
      raw: true
    });
    
    const equipmentTypes = await LicenseDevice.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('equipmentType')), 'equipmentType']],
      where: { licenseId: licenseIds },
      raw: true
    });
    
    const technologiesUsed = await LicenseDevice.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('technologyUsed')), 'technologyUsed']],
      where: { 
        licenseId: licenseIds,
        technologyUsed: { [Op.ne]: null }
      },
      raw: true
    });

    // Format the response
    const filters = {
      licenseTypes: licenseTypes.map(item => item.licenseType),
      statuses: statuses.map(item => item.status),
      issuingAuthorities: issuingAuthorities.map(item => item.issuingAuthority),
      geographicalCoverages: geographicalCoverages.map(item => item.geographicalCoverage),
      endUsePurposes: endUsePurposes.map(item => item.endUsePurpose),
      countriesOfOrigin: countriesOfOrigin.map(item => item.countryOfOrigin),
      equipmentTypes: equipmentTypes.map(item => item.equipmentType),
      technologiesUsed: technologiesUsed.map(item => item.technologyUsed)
    };

    res.status(200).json(filters);
  } catch (error) {
    next(error);
  }
};
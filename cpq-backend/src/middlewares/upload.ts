import multer from "multer";
import { uploadToContainer } from "../config/storage";

const storage = multer.memoryStorage();

// Create multer instance with proper error handling and logging
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    console.log("Processing file:", {
      fieldname: file.fieldname,
      mimetype: file.mimetype,
      originalname: file.originalname,
    });

    // Handle images
    if (file.fieldname === "images" || file.fieldname === "image") {
      if (!file.mimetype.startsWith("image/")) {
        console.error("Invalid image type:", file.mimetype);
        return cb(new Error("Only image files are allowed"));
      }
      console.log("Accepted image file:", file.originalname);
      return cb(null, true);
    }

    // Handle ALL document types (including license documents)
    if (
      file.fieldname === "documents" ||
      file.fieldname === "document" ||
      file.fieldname === "licenseDocument" ||
      file.fieldname === "etaCertificate" ||
      file.fieldname === "importLicense" ||
      file.fieldname === "otherDocuments"
    ) {
      const allowedMimes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedMimes.includes(file.mimetype)) {
        console.error("Invalid document type:", file.mimetype);
        return cb(new Error("Only PDF and Word documents are allowed"));
      }
      console.log("Accepted document file:", file.originalname);
      return cb(null, true);
    }
    // Handle performance bank guarantee
    if (file.fieldname === "performanceBankGuarantee") {
      const allowedMimes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedMimes.includes(file.mimetype)) {
        console.error("Invalid performance bank guarantee type:", file.mimetype);
        return cb(new Error("Only PDF and Word documents are allowed for performance bank guarantee"));
      }
      console.log("Accepted performance bank guarantee file:", file.originalname);
      return cb(null, true);
    }

    // Handle attachments
    if (file.fieldname === "attachments" || file.fieldname === "attachment") {
      const allowedMimes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/zip",
        "application/x-zip-compressed",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];
      if (!allowedMimes.includes(file.mimetype)) {
        console.error("Invalid attachment type:", file.mimetype);
        return cb(new Error("Unsupported attachment file type"));
      }
      console.log("Accepted attachment file:", file.originalname);
      return cb(null, true);
    }

    console.error("Unexpected field:", file.fieldname);
    cb(new Error(`Unexpected field: ${file.fieldname}`));
  },
}).fields([
  { name: "images", maxCount: 20 },
  { name: "image", maxCount: 1 }, // Add this line to accept single image
  { name: "documents", maxCount: 20 },
  { name: "document", maxCount: 1 }, // Add this line to accept single document
  { name: "attachments", maxCount: 5 },
  { name: "image", maxCount: 1 },
  { name: "document", maxCount: 1 },
  { name: "attachment", maxCount: 1 },
  { name: "performanceBankGuarantee", maxCount: 1 },
  { name: "licenseDocument", maxCount: 1 },
  { name: "etaCertificate", maxCount: 1 },
  { name: "importLicense", maxCount: 1 },
  { name: "otherDocuments", maxCount: 20 }, // license other documents
]);

// Helper function to upload files to appropriate containers
export const uploadToBlob = async (
  file: Express.Multer.File
): Promise<string> => {
  try {
    // Determine container type based on field name and log it
    let containerType: "images" | "documents" | "quotes-pdf" = "documents";
    if (file.fieldname.includes("image")) {
      containerType = "images";
    } else if (file.fieldname.includes("attachment") || file.fieldname === "performanceBankGuarantee") {
      containerType = "documents"; // Store attachments and performance bank guarantee in the documents container
    }
    
    console.log(
      `Uploading ${file.originalname} to ${containerType} container with fieldname ${file.fieldname}`
    );

    const url = await uploadToContainer(file, containerType);
    console.log(`Successfully uploaded ${file.originalname}. URL: ${url}`);
    return url;
  } catch (error) {
    console.error(`Failed to upload ${file.originalname}:`, error);
    throw error;
  }
};

export default upload;

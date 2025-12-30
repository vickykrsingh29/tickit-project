import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING || ""
);

// Get container clients for different types of content
const quotesPdfContainer = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_QUOTES || "quotes-pdf"
);

const imagesContainer = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_IMAGES || "images"
);

const documentsContainer = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_DOCUMENTS || "documents"
);

// Helper function to upload files to specific containers
const uploadToContainer = async (
  file: Express.Multer.File,
  containerType: "images" | "documents" | "quotes-pdf"
): Promise<string> => {
  try {
    // Select appropriate container
    const container =
      containerType === "images"
        ? imagesContainer
        : containerType === "documents"
        ? documentsContainer
        : quotesPdfContainer;

    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = container.getBlockBlobClient(blobName);

    await blockBlobClient.upload(file.buffer, file.size, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
        blobContentDisposition: `inline; filename="${file.originalname}"`,
        blobCacheControl: "public, max-age=31536000",
      },
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error(`Error uploading to ${containerType} container:`, error);
    throw error;
  }
};

// Add this new function to delete files from blob storage
const deleteFromBlob = async (url: string): Promise<void> => {
  try {
    // Extract container name and blob name from URL
    const urlParts = new URL(url);
    const pathname = urlParts.pathname.substring(1); // Remove leading slash
    const pathParts = pathname.split("/");

    // The container name is the first part after the domain
    const containerName = pathParts[0];
    // The blob name is everything after the container name
    const blobName = pathParts.slice(1).join("/");

    console.log("Deleting blob:", {
      url,
      containerName,
      blobName,
    });

    // Get the appropriate container
    const container = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = container.getBlockBlobClient(blobName);

    // Check if blob exists before trying to delete
    const exists = await blockBlobClient.exists();
    if (!exists) {
      console.log(
        `Blob ${blobName} does not exist in container ${containerName}`
      );
      return;
    }

    // Delete the blob
    await blockBlobClient.delete();
    console.log(
      `Successfully deleted blob: ${blobName} from container: ${containerName}`
    );
  } catch (error) {
    console.error(`Error deleting blob from storage:`, {
      error,
      url,
    });
    throw error;
  }
};

export {
  deleteFromBlob,
  documentsContainer,
  imagesContainer,
  quotesPdfContainer,
  uploadToContainer,
};
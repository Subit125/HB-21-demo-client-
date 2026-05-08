import { BlobServiceClient } from '@azure/storage-blob';

const accountName = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME || "hbplusstorage";
const containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER || "hb-playground";
const sasToken = import.meta.env.VITE_AZURE_SAS_TOKEN || "";

// In development: route through Vite proxy to avoid HTTPS-only SAS token restriction
const isDev = import.meta.env.DEV;
const endpoint = isDev
  ? `${window.location.origin}/azure-blob`
  : `https://${accountName}.blob.core.windows.net`;

const blobServiceClient = new BlobServiceClient(`${endpoint}?${sasToken}`, null, {
  allowInsecureConnection: isDev,
});
const containerClient = blobServiceClient.getContainerClient(containerName);


export { containerClient };

/**
 * Uploads a file to Azure Blob Storage
 * @param {File} file 
 * @param {string} folder 
 * @returns {Promise<string>} The URL of the uploaded file
 */
export const uploadToAzure = async (file, folder = 'proofs') => {
  const blobName = `${folder}/${Date.now()}-${file.name}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  await blockBlobClient.uploadData(file, {
    blobHTTPHeaders: { blobContentType: file.type }
  });
  
  return blockBlobClient.url;
};

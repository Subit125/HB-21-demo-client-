import { TableClient, AzureSASCredential } from "@azure/data-tables";

const accountName = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME || "hbplusstorage";
const containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER || "hb-playground";
const sasToken = import.meta.env.VITE_AZURE_SAS_TOKEN || "";

// In development: use the Vite proxy (/azure-table → hbplusstorage.table.core.windows.net)
// In production:  go directly to Azure over HTTPS (SAS token requires https)
const isDev = import.meta.env.DEV;
const endpoint = isDev
  ? `${window.location.origin}/azure-table`
  : `https://${accountName}.table.core.windows.net`;

/**
 * Utility to get a Table Client
 * @param {string} tableName 
 */
export const getTableClient = (tableName) => {
  return new TableClient(endpoint, tableName, new AzureSASCredential(sasToken), {
    allowInsecureConnection: isDev, // Allow HTTP in dev (proxy); always HTTPS in production
  });
};

// Common Table Names
export const TABLES = {
  PROFILES: "Profiles",
  TASKS: "Tasks",
  SUBMISSIONS: "Submissions",
  CLANS: "Clans",
  FLASHCARDS: "Flashcards",
  MANUAL_AWARDS: "ManualAwards",
  BATCHES: "Batches"
};

/**
 * Fetch all entities from a table
 */
export const getAllEntities = async (tableName) => {
  try {
    const client = getTableClient(tableName);
    const entities = [];
    const iterator = client.listEntities();
    for await (const entity of iterator) {
      entities.push(entity);
    }
    return entities;
  } catch (error) {
    // Azure SDK might return code 'TableNotFound' or a status of 404
    if (error.code === 'TableNotFound' || error.statusCode === 404 || (error.message && error.message.includes('not exist'))) {
      console.warn(`Azure Table Storage: Table "${tableName}" not found or empty. Returning [].`);
      return [];
    }
    console.error(`Azure Table Storage error [${tableName}]:`, error);
    throw error;
  }
};

/**
 * Upsert an entity (Create or Update)
 * @param {string} tableName 
 * @param {object} entity Must have partitionKey and rowKey
 */
export const upsertEntity = async (tableName, entity) => {
  const client = getTableClient(tableName);
  await client.upsertEntity(entity, "Merge");
};

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { TableClient } = require('@azure/data-tables');

// --- ROBUST ENV LOADER ---
const envText = fs.readFileSync('./.env', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    let value = parts.slice(1).join('=').trim();
    // Strip quotes if they exist
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[key] = value;
  }
});

// Find connection string
const azureConnString = env.VITE_AZURE_STORAGE_CONNECTION_STRING || env.AZURE_STORAGE_CONNECTION_STRING;

if (!azureConnString) {
    console.error("❌ ERROR: Connection String not found in .env file!");
    process.exit(1);
}

// 1. Setup Clients
const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);

const migrateTable = async (supabaseTable, azureTableName, partitionKey) => {
  console.log(`\n--- Migrating ${supabaseTable} to Azure Table: ${azureTableName} ---`);
  
  const azureClient = TableClient.fromConnectionString(azureConnString, azureTableName);
  
  try { await azureClient.createTable(); } catch (e) { }

  const { data, error } = await supabase.from(supabaseTable).select('*');
  if (error) {
    console.error(`Error fetching ${supabaseTable}:`, error.message);
    return;
  }

  console.log(`Found ${data.length} records.`);

  for (const item of data) {
    try {
      const entity = {
        partitionKey: partitionKey,
        rowKey: item.id.toString(),
        ...item
      };
      
      // Clean up fields for Azure NoSQL compatibility
      Object.keys(entity).forEach(k => { 
          if (entity[k] === null || entity[k] === undefined) delete entity[k]; 
          // Azure Tables don't support objects/arrays, so we stringify them
          if (typeof entity[k] === 'object' && !(entity[k] instanceof Date)) {
              entity[k] = JSON.stringify(entity[k]);
          }
      });

      await azureClient.upsertEntity(entity, "Replace");
      process.stdout.write('.');
    } catch (err) {
      console.error(`\nFailed item ${item.id}:`, err.message);
    }
  }
};

const run = async () => {
  try {
    await migrateTable('profiles', 'Profiles', 'PROFILES');
    await migrateTable('tasks', 'Tasks', 'TASKS');
    await migrateTable('submissions', 'Submissions', 'SUBMISSIONS');
    await migrateTable('flashcards', 'Flashcards', 'FLASHCARDS');
    await migrateTable('clans', 'Clans', 'CLANS');
    console.log('\n\n✅ ALL DATA MIGRATED SUCCESSFULLY!');
  } catch (err) {
    console.error('Migration error:', err);
  }
};

run();

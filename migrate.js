const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { TableClient } = require('@azure/data-tables');

// --- SELF-SUFFICIENT ENV LOADER ---
const envText = fs.readFileSync('./.env', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) env[key.trim()] = value.join('=').trim();
});

// 1. Setup Clients
const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);

const azureConnString = env.VITE_AZURE_STORAGE_CONNECTION_STRING;

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
      // Clean up nulls for Azure compatibility
      Object.keys(entity).forEach(k => { if (entity[k] === null) delete entity[k]; });

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
    console.log('\n\n✅ DATA MIGRATION FINISHED!');
  } catch (err) {
    console.error('Migration error:', err);
  }
};

run();

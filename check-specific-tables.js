// Script pour vérifier l'existence des tables dans Supabase
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Liste des tables à vérifier
const tablesToCheck = [
  'samples',
  'analyses_planifiees',
  'analyses_en_cours',
  'sample_forms',
  'form_samples',
  'batch_numbers',
  'users'
];

// Créer le client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkTables() {
  console.log("Vérification des tables spécifiques dans Supabase...");
  
  let results = [];
  
  for (const tableName of tablesToCheck) {
    try {
      console.log(`Vérification de la table '${tableName}'...`);
      
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Table n'existe pas
          console.log(`❌ Table '${tableName}' n'existe pas`);
          results.push({ table: tableName, exists: false, error: error.message });
        } else {
          console.error(`❌ Erreur lors de la vérification de '${tableName}':`, error);
          results.push({ table: tableName, exists: false, error: error.message });
        }
      } else {
        console.log(`✅ Table '${tableName}' existe avec ${count} enregistrements`);
        results.push({ table: tableName, exists: true, count });
      }
    } catch (err) {
      console.error(`❌ Exception lors de la vérification de '${tableName}':`, err);
      results.push({ table: tableName, exists: false, error: err.message });
    }
  }
  
  // Résumé
  console.log("\n📊 RÉSUMÉ DES TABLES:");
  console.log("--------------------------------------------------");
  let existingCount = 0;
  
  results.forEach(result => {
    if (result.exists) {
      existingCount++;
      console.log(`✅ ${result.table} - Existe (${result.count} enregistrements)`);
    } else {
      console.log(`❌ ${result.table} - N'existe pas (${result.error})`);
    }
  });
  
  console.log("--------------------------------------------------");
  console.log(`TOTAL: ${existingCount}/${tablesToCheck.length} tables existent`);
  
  return results;
}

// Exécution de la vérification
checkTables()
  .then(results => {
    console.log("\n✅ Vérification terminée");
  })
  .catch(err => {
    console.error("❌ Erreur globale:", err);
  }); 
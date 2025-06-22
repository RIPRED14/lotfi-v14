// Script pour récupérer les données de la table batch_numbers
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Créer le client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function fetchBatchNumbers() {
  console.log("Récupération des données de la table batch_numbers...");
  
  try {
    // Récupérer les 10 premiers enregistrements
    const { data, error, count } = await supabase
      .from('batch_numbers')
      .select('*', { count: 'exact' })
      .limit(10);
    
    if (error) {
      console.error("❌ Erreur lors de la récupération des données:", error);
      return false;
    }
    
    console.log(`✅ Données récupérées: ${data.length} enregistrements (total: ${count})`);
    
    // Afficher les données
    console.log("\n📋 ÉCHANTILLON DE DONNÉES (10 premiers enregistrements):");
    console.log("--------------------------------------------------");
    
    data.forEach((record, index) => {
      console.log(`\nENREGISTREMENT #${index + 1}:`);
      for (const [key, value] of Object.entries(record)) {
        console.log(`${key}: ${value || 'N/A'}`);
      }
    });
    
    console.log("--------------------------------------------------");
    
    // Analyse des colonnes
    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log("\n📊 STRUCTURE DE LA TABLE:");
      console.log("--------------------------------------------------");
      columns.forEach(column => {
        const sampleValue = data[0][column];
        const valueType = typeof sampleValue;
        console.log(`- ${column} (${valueType}): ${sampleValue || 'NULL'}`);
      });
      console.log("--------------------------------------------------");
    }
    
    return true;
  } catch (err) {
    console.error("❌ Exception:", err);
    return false;
  }
}

// Exécution
fetchBatchNumbers()
  .then(success => {
    if (success) {
      console.log("\n✅ Récupération terminée avec succès");
    } else {
      console.log("\n❌ Échec de la récupération");
    }
  })
  .catch(err => {
    console.error("❌ Erreur globale:", err);
  }); 
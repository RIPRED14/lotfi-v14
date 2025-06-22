// Script pour insérer un enregistrement minimal dans Supabase
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Créer le client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Fonction principale
async function insertMinimalSample() {
  console.log("Tentative d'insertion d'un échantillon minimal...");
  
  // ID unique pour l'échantillon
  const testId = `TEST-SIMPLE-${Date.now()}`;
  
  // Échantillon minimal
  const minimalSample = {
    number: testId,
    product: 'Test Simple'
  };
  
  try {
    // Insertion avec debug
    console.log("Données à insérer:", minimalSample);
    console.log("URL Supabase:", SUPABASE_URL);
    console.log("Clé API (5 premiers caractères):", SUPABASE_PUBLISHABLE_KEY.substring(0, 20) + "...");
    
    const { data, error } = await supabase
      .from('samples')
      .insert(minimalSample)
      .select();
    
    if (error) {
      console.error("❌ ERREUR: Impossible d'insérer les données");
      console.error("Message d'erreur:", error.message);
      console.error("Code d'erreur:", error.code);
      console.error("Détails:", error.details);
      return false;
    }
    
    console.log("✅ SUCCÈS: Insertion réussie");
    console.log("Données insérées:", data);
    return true;
  } catch (err) {
    console.error("❌ EXCEPTION:", err);
    return false;
  }
}

// Exécution
insertMinimalSample()
  .then(success => {
    if (success) {
      console.log("\n✅ Opération réussie");
    } else {
      console.log("\n❌ Échec de l'opération");
    }
  })
  .catch(err => {
    console.error("\n❌ Erreur globale:", err);
  }); 
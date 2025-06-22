// Script pour lister les tables dans Supabase
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Créer le client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function listTables() {
  console.log("Listing des tables dans Supabase...");
  
  try {
    // Requête SQL pour lister les tables
    const { data, error } = await supabase.rpc('list_tables');
    
    if (error) {
      // Si la fonction RPC n'existe pas, essayons une requête SQL brute
      console.log("Tentative avec une requête SQL brute...");
      const { data: sqlData, error: sqlError } = await supabase.from('pg_tables').select('schemaname, tablename').eq('schemaname', 'public');
      
      if (sqlError) {
        console.error("❌ Erreur lors de la requête SQL:", sqlError);
        return false;
      }
      
      console.log("📋 Tables trouvées:");
      sqlData.forEach(table => {
        console.log(`- ${table.tablename} (schéma: ${table.schemaname})`);
      });
      
      return true;
    }
    
    console.log("📋 Tables trouvées:");
    data.forEach(table => {
      console.log(`- ${table}`);
    });
    
    return true;
  } catch (err) {
    console.error("❌ EXCEPTION:", err);
    return false;
  }
}

// Exécution du test
listTables()
  .then(success => {
    if (success) {
      console.log("✅ Liste des tables obtenue avec succès");
    } else {
      console.log("❌ Échec de la récupération des tables");
    }
  })
  .catch(err => {
    console.error("❌ Erreur inattendue:", err);
  }); 
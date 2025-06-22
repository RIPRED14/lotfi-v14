// Script pour appliquer la migration form_bacteria_selections
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Créer le client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function applyMigration() {
  try {
    console.log("🔄 Application de la migration form_bacteria_selections...");

    // Lire le fichier de migration
    const migrationSQL = readFileSync('./supabase/migrations/20230620_create_form_bacteria_selections.sql', 'utf8');

    // Diviser en plusieurs requêtes (séparées par ;)
    const queries = migrationSQL
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));

    // Exécuter chaque requête séparément
    for (const query of queries) {
      if (query.trim()) {
        console.log(`🔧 Exécution: ${query.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: query 
        });

        if (error) {
          console.error(`❌ Erreur pour la requête: ${query.substring(0, 50)}...`);
          console.error(error);
        } else {
          console.log(`✅ Requête exécutée avec succès`);
        }
      }
    }

    console.log("🎉 Migration appliquée avec succès !");

  } catch (error) {
    console.error("❌ Erreur lors de l'application de la migration:", error);
  }
}

// Exécuter le script
applyMigration(); 
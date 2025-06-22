// Script pour créer la table form_bacteria_selections
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function createTable() {
  try {
    console.log("🔄 Création de la table form_bacteria_selections...");

    // Exécuter directement via SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS form_bacteria_selections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          form_id TEXT NOT NULL,
          bacteria_name TEXT NOT NULL,
          bacteria_delay TEXT NOT NULL,
          reading_day TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
          reading_date TEXT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_form_bacteria_selections_form_id ON form_bacteria_selections(form_id);
        CREATE INDEX IF NOT EXISTS idx_form_bacteria_selections_status ON form_bacteria_selections(status);
        CREATE INDEX IF NOT EXISTS idx_form_bacteria_selections_reading_day ON form_bacteria_selections(reading_day);
        CREATE INDEX IF NOT EXISTS idx_form_bacteria_selections_bacteria_name ON form_bacteria_selections(bacteria_name);
      `
    });

    if (error) {
      console.error("❌ Erreur:", error);
    } else {
      console.log("✅ Table créée avec succès !");
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

createTable(); 
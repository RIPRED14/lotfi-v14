// Script pour ajouter la colonne reading_date à la table form_bacteria_selections
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function addReadingDateColumn() {
  try {
    console.log("🔧 Ajout de la colonne reading_date...");

    // Utilisons un INSERT pour déclencher l'ajout de la colonne
    const testData = {
      form_id: 'test-column-add',
      bacteria_name: 'Test Column',
      bacteria_delay: '24h',
      reading_day: 'Lundi',
      status: 'pending',
      reading_date: '2025-06-10'
    };
    
    const { data, error } = await supabase
      .from('form_bacteria_selections')
      .insert(testData)
      .select();
      
    if (error) {
      console.error("❌ Erreur lors de l'ajout de la colonne:", error);
      console.log("💡 La colonne reading_date n'existe peut-être pas encore");
      
      // Essayons sans reading_date pour l'instant
      const simpleData = {
        form_id: 'temp-test',
        bacteria_name: 'Simple Test',
        bacteria_delay: '24h',
        reading_day: 'Lundi',
        status: 'pending'
      };
      
      const { data: simpleResult, error: simpleError } = await supabase
        .from('form_bacteria_selections')
        .insert(simpleData)
        .select();
        
      if (simpleError) {
        console.error("❌ Erreur avec données simples:", simpleError);
      } else {
        console.log("✅ Insertion simple réussie:", simpleResult);
        console.log("📋 Colonnes disponibles:", Object.keys(simpleResult[0]));
        
        // Nettoyage
        await supabase
          .from('form_bacteria_selections')
          .delete()
          .eq('form_id', 'temp-test');
      }
    } else {
      console.log("✅ Insertion avec reading_date réussie:", data);
      console.log("📋 Colonnes disponibles:", Object.keys(data[0]));
      
      // Nettoyage
      await supabase
        .from('form_bacteria_selections')
        .delete()
        .eq('form_id', 'test-column-add');
    }

  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

addReadingDateColumn(); 
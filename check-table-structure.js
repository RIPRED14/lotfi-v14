// Script pour vérifier la structure de la table form_bacteria_selections
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Créer le client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkTableStructure() {
  try {
    console.log('🔍 Vérification de la structure de la table samples...');
    
    // Récupérer un échantillon pour voir les colonnes disponibles
    const { data, error } = await supabase
      .from('samples')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Colonnes disponibles dans la table samples:');
      const columns = Object.keys(data[0]);
      columns.forEach((col, index) => {
        console.log(`${index + 1}. ${col} (${typeof data[0][col]}) = ${data[0][col]}`);
      });
      
      console.log(`\n📊 Total: ${columns.length} colonnes`);
      
      // Vérifier spécifiquement les colonnes de bactéries
      const bacteriaColumns = columns.filter(col => 
        col.includes('bacteria') || 
        col.includes('listeria') || 
        col.includes('coliforms') || 
        col.includes('staphylococcus') ||
        col.includes('enterobacteria') ||
        col.includes('yeast')
      );
      
      console.log(`\n🦠 Colonnes de bactéries trouvées:`);
      bacteriaColumns.forEach(col => {
        console.log(`- ${col}`);
      });
      
      // Tester une mise à jour simple
      console.log(`\n🧪 Test de mise à jour sur l'échantillon ${data[0].id}:`);
      
      const testUpdate = {
        modified_at: new Date().toISOString()
      };
      
      const { data: updateData, error: updateError } = await supabase
        .from('samples')
        .update(testUpdate)
        .eq('id', data[0].id)
        .select();
      
      if (updateError) {
        console.error('❌ Erreur de mise à jour:', updateError);
      } else {
        console.log('✅ Mise à jour réussie');
      }
      
    } else {
      console.log('❌ Aucun échantillon trouvé dans la table');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkTableStructure(); 
// Script pour insérer un nouvel échantillon dans Supabase
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Créer le client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Données pour le nouvel échantillon
const newSample = {
  number: 'TEST-001',
  product: 'Yaourt aux fruits',
  smell: 'A',
  texture: 'B',
  taste: 'A',
  aspect: 'A',
  ph: '4.5',
  enterobacteria: '<10',
  yeast_mold: '<100',
  ready_time: '09:30',
  fabrication: '2025-05-23',
  dlc: '2025-06-15',
  status: 'pending',
  brand: 'Grand Frais',
  site: 'R1',
  report_title: 'Test d\'insertion Supabase'
};

async function insertSample() {
  console.log("Tentative d'insertion d'un nouvel échantillon...");
  
  try {
    // Insertion dans la table samples
    const { data, error } = await supabase
      .from('samples')
      .insert(newSample)
      .select();
    
    if (error) {
      console.error("❌ Erreur lors de l'insertion:", error);
      return false;
    }
    
    console.log("✅ Échantillon inséré avec succès:");
    console.log(data);
    
    // Vérifier que l'échantillon a bien été inséré
    const { data: checkData, error: checkError } = await supabase
      .from('samples')
      .select('*')
      .eq('number', newSample.number)
      .single();
    
    if (checkError) {
      console.error("❌ Erreur lors de la vérification:", checkError);
      return false;
    }
    
    console.log("\n✅ Échantillon vérifié dans la base de données:");
    console.log(checkData);
    
    return true;
  } catch (err) {
    console.error("❌ Exception:", err);
    return false;
  }
}

// Exécution
insertSample()
  .then(success => {
    if (success) {
      console.log("\n✅ Opération réussie");
    } else {
      console.log("\n❌ Échec de l'opération");
    }
  })
  .catch(err => {
    console.error("❌ Erreur globale:", err);
  }); 
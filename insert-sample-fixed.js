// Script pour insérer un nouvel échantillon dans Supabase
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Créer le client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Examiner la structure de la table samples
async function getTableStructure() {
  console.log("Récupération de la structure de la table samples...");
  
  try {
    // Essayer de récupérer un échantillon pour voir les colonnes
    const { data, error } = await supabase
      .from('samples')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error("❌ Erreur lors de la récupération de la structure:", error);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log("✅ Structure de la table samples récupérée:");
      console.log(Object.keys(data[0]));
      return Object.keys(data[0]);
    } else {
      console.log("⚠️ Aucune donnée disponible pour déduire la structure");
      
      // Essayer une approche différente
      const { data: insertTest, error: insertError } = await supabase
        .from('samples')
        .insert({
          number: 'TEST-STRUCTURE',
          product: 'Test structure'
        })
        .select();
      
      if (insertError) {
        console.log("❌ Erreur lors du test d'insertion:");
        
        // Analyser le message d'erreur pour extraire les colonnes requises
        const errorMsg = insertError.message;
        if (errorMsg.includes("violates not-null constraint")) {
          console.log("⚠️ Colonnes requises détectées dans l'erreur:", errorMsg);
        }
      } else if (insertTest) {
        console.log("✅ Structure déduite de l'insertion test:");
        console.log(Object.keys(insertTest[0]));
        return Object.keys(insertTest[0]);
      }
    }
    
    // Structure par défaut basée sur le code de l'application
    console.log("⚠️ Utilisation d'une structure par défaut:");
    const defaultStructure = [
      'id', 'number', 'product', 'ready_time', 'fabrication', 'dlc',
      'smell', 'texture', 'taste', 'aspect', 'ph', 'enterobacteria',
      'yeast_mold', 'created_at', 'modified_at', 'status', 'brand', 'report_title'
    ];
    console.log(defaultStructure);
    return defaultStructure;
    
  } catch (err) {
    console.error("❌ Exception:", err);
    return null;
  }
}

// Insérer un échantillon
async function insertSample() {
  console.log("Tentative d'insertion d'un nouvel échantillon...");
  
  // D'abord récupérer la structure
  const columns = await getTableStructure();
  
  if (!columns) {
    console.error("❌ Impossible de déterminer la structure de la table");
    return false;
  }
  
  // Créer un échantillon adapté à la structure
  const newSample = {
    number: 'TEST-002',
    product: 'Yaourt aux fruits rouges',
    smell: 'A',
    texture: 'B',
    taste: 'A',
    aspect: 'A',
    ph: '4.5',
    brand: 'Grand Frais'
  };
  
  // Si certaines colonnes existent, les ajouter
  if (columns.includes('enterobacteria')) newSample.enterobacteria = '<10';
  if (columns.includes('yeast_mold')) newSample.yeast_mold = '<100';
  if (columns.includes('ready_time')) newSample.ready_time = '09:30';
  if (columns.includes('fabrication')) newSample.fabrication = '2025-05-23';
  if (columns.includes('dlc')) newSample.dlc = '2025-06-15';
  if (columns.includes('status')) newSample.status = 'pending';
  if (columns.includes('report_title')) newSample.report_title = 'Test d\'insertion Supabase';
  
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
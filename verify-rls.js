// Script pour vérifier si les opérations d'écriture et lecture anonymes sont autorisées
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Créer le client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Générer un ID de test unique
const testId = `TEST-${Date.now()}`;

// Tests séquentiels pour vérifier les différentes opérations
async function runTests() {
  console.log("🔍 VÉRIFICATION DES PERMISSIONS RLS SUR SUPABASE");
  console.log("------------------------------------------------");
  
  // Test 1: Vérifier la lecture (SELECT)
  console.log("\n📖 TEST 1: Lecture (SELECT)");
  try {
    const { data: selectData, error: selectError } = await supabase
      .from('samples')
      .select('*')
      .limit(2);
    
    if (selectError) {
      console.error("❌ ERREUR: Impossible de lire les données");
      console.error(selectError);
    } else {
      console.log("✅ SUCCÈS: Lecture autorisée");
      console.log(`   ${selectData.length} enregistrements trouvés`);
      if (selectData.length > 0) {
        console.log(`   Premier enregistrement: ${selectData[0].number} - ${selectData[0].product}`);
      }
    }
  } catch (err) {
    console.error("❌ EXCEPTION:", err);
  }
  
  // Test 2: Vérifier l'écriture (INSERT)
  console.log("\n📝 TEST 2: Écriture (INSERT)");
  try {
    const newSample = {
      number: testId,
      product: 'Test RLS Permissions',
      smell: 'A',
      texture: 'B',
      taste: 'A',
      aspect: 'A',
      ready_time: '10:00',
      brand: 'Test Brand'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('samples')
      .insert(newSample)
      .select();
    
    if (insertError) {
      console.error("❌ ERREUR: Impossible d'insérer des données");
      console.error(insertError);
    } else {
      console.log("✅ SUCCÈS: Insertion autorisée");
      console.log(`   Échantillon inséré: ${insertData[0].number}`);
    }
  } catch (err) {
    console.error("❌ EXCEPTION:", err);
  }
  
  // Test 3: Vérifier la mise à jour (UPDATE)
  console.log("\n🔄 TEST 3: Mise à jour (UPDATE)");
  try {
    const { data: updateData, error: updateError } = await supabase
      .from('samples')
      .update({ product: 'Test RLS Permissions (Updated)' })
      .eq('number', testId)
      .select();
    
    if (updateError) {
      console.error("❌ ERREUR: Impossible de mettre à jour des données");
      console.error(updateError);
    } else {
      console.log("✅ SUCCÈS: Mise à jour autorisée");
      console.log(`   Échantillon mis à jour: ${updateData[0].number} - ${updateData[0].product}`);
    }
  } catch (err) {
    console.error("❌ EXCEPTION:", err);
  }
  
  // Test 4: Vérifier la suppression (DELETE)
  console.log("\n🗑️ TEST 4: Suppression (DELETE)");
  try {
    const { error: deleteError } = await supabase
      .from('samples')
      .delete()
      .eq('number', testId);
    
    if (deleteError) {
      console.error("❌ ERREUR: Impossible de supprimer des données");
      console.error(deleteError);
    } else {
      console.log("✅ SUCCÈS: Suppression autorisée");
      console.log(`   Échantillon supprimé: ${testId}`);
    }
  } catch (err) {
    console.error("❌ EXCEPTION:", err);
  }
  
  // Résumé des tests
  console.log("\n📊 RÉSUMÉ DES TESTS");
  console.log("------------------------------------------------");
  console.log("Ces tests vérifient si votre configuration RLS permet:");
  console.log("1. La lecture des données (SELECT)");
  console.log("2. L'insertion de nouvelles données (INSERT)");
  console.log("3. La mise à jour des données existantes (UPDATE)");
  console.log("4. La suppression des données (DELETE)");
  console.log("\nSi tous les tests ont passé avec succès (✅), cela signifie que votre");
  console.log("configuration est correcte pour permettre des opérations anonymes.");
}

// Exécuter les tests
runTests()
  .then(() => {
    console.log("\n✅ Vérification terminée");
  })
  .catch(err => {
    console.error("\n❌ Erreur lors de la vérification:", err);
  }); 
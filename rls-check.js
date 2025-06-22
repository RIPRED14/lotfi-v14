// Test de la sécurité RLS (Row Level Security) dans Supabase
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Créer le client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Test d'insertion (CREATE)
async function testInsert() {
  console.log("\n📝 TEST D'INSERTION (CREATE)");
  
  const number = `TEST-${Date.now()}`;
  const today = new Date();
  const fabrication = new Date(today);
  const dlc = new Date(today);
  dlc.setDate(today.getDate() + 30); // DLC = date actuelle + 30 jours
  
  // Formater les dates en YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Formater l'heure en HH:MM
  const formatTime = (date) => {
    return date.toTimeString().split(' ')[0].substring(0, 5);
  };
  
  const { data, error } = await supabase
    .from('samples')
    .insert({
      number: number,
      product: 'Test RLS',
      smell: 'A',
      texture: 'A',
      taste: 'A',
      aspect: 'A',
      ready_time: formatTime(today),     // Heure actuelle au format HH:MM
      fabrication: formatDate(fabrication), // Date de fabrication
      dlc: formatDate(dlc),                 // Date limite de consommation
      status: 'in_progress'                 // Statut par défaut
    })
    .select();
  
  if (error) {
    console.error('❌ ÉCHEC: Impossible d\'insérer un nouvel enregistrement');
    console.error(error);
    return null;
  }
  
  console.log('✅ SUCCÈS: L\'insertion a fonctionné');
  console.log(data);
  
  return data[0];
}

// Test de lecture (READ)
async function testRead(id) {
  console.log("\n📝 TEST DE LECTURE (READ)");
  
  // Si un ID est fourni, lire cet enregistrement spécifique
  if (id) {
    const { data, error } = await supabase
      .from('samples')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`❌ ÉCHEC: Impossible de lire l'enregistrement avec l'ID ${id}`);
      console.error(error);
      return false;
    }
    
    console.log(`✅ SUCCÈS: Lecture réussie de l'enregistrement avec l'ID ${id}`);
    console.log(data);
    return true;
  }
  
  // Sinon, lire tous les enregistrements (limités à 5)
  const { data, error } = await supabase
    .from('samples')
    .select('*')
    .limit(5);
  
  if (error) {
    console.error('❌ ÉCHEC: Impossible de lire les enregistrements');
    console.error(error);
    return false;
  }
  
  console.log('✅ SUCCÈS: Lecture réussie');
  console.log(`Nombre d'enregistrements: ${data.length}`);
  if (data.length > 0) {
    console.log('Premier enregistrement:', data[0]);
  }
  
  return data.length > 0;
}

// Test de mise à jour (UPDATE)
async function testUpdate(id) {
  console.log("\n📝 TEST DE MISE À JOUR (UPDATE)");
  
  if (!id) {
    console.log('⚠️ IGNORÉ: Aucun ID fourni pour la mise à jour');
    return false;
  }
  
  const updateValue = `Updated-${Date.now()}`;
  
  const { data, error } = await supabase
    .from('samples')
    .update({ product: updateValue })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error(`❌ ÉCHEC: Impossible de mettre à jour l'enregistrement avec l'ID ${id}`);
    console.error(error);
    return false;
  }
  
  console.log(`✅ SUCCÈS: Mise à jour réussie de l'enregistrement avec l'ID ${id}`);
  console.log(data);
  return true;
}

// Test de suppression (DELETE)
async function testDelete(id) {
  console.log("\n📝 TEST DE SUPPRESSION (DELETE)");
  
  if (!id) {
    console.log('⚠️ IGNORÉ: Aucun ID fourni pour la suppression');
    return false;
  }
  
  const { error } = await supabase
    .from('samples')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`❌ ÉCHEC: Impossible de supprimer l'enregistrement avec l'ID ${id}`);
    console.error(error);
    return false;
  }
  
  console.log(`✅ SUCCÈS: Suppression réussie de l'enregistrement avec l'ID ${id}`);
  return true;
}

// Exécution de tous les tests
async function runAllTests() {
  console.log("📊 RÉSUMÉ DES TESTS");
  console.log("------------------------------------------------");
  console.log("Ces tests vérifient si votre configuration RLS permet:");
  console.log("1. La lecture des données (SELECT)");
  console.log("2. L'insertion de nouvelles données (INSERT)");
  console.log("3. La mise à jour des données existantes (UPDATE)");
  console.log("4. La suppression des données (DELETE)");
  console.log("");
  console.log("Si tous les tests ont passé avec succès (✅), cela signifie que votre");
  console.log("configuration est correcte pour permettre des opérations anonymes.");
  console.log("");
  
  // Test READ initial (sans ID spécifique)
  await testRead();
  
  // Test CREATE puis READ, UPDATE, DELETE avec l'ID créé
  const insertedData = await testInsert();
  
  if (insertedData && insertedData.id) {
    const id = insertedData.id;
    await testRead(id);
    await testUpdate(id);
    await testDelete(id);
  }
  
  console.log("\n✅ Vérification terminée");
}

// Lancer tous les tests
runAllTests().catch(err => {
  console.error("\n❌ Erreur inattendue:", err);
}); 
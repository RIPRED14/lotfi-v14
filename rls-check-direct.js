// Script pour exécuter des requêtes SQL directes sur la table samples
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Créer le client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Fonction pour exécuter des requêtes SQL personnalisées
async function executeCustomQuery(query, name) {
  console.log(`\n📝 Exécution de la requête: ${name}`);
  console.log(`SQL: ${query}`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: query 
    });
    
    if (error) {
      console.error(`❌ ERREUR: ${error.message}`);
      
      // Si la fonction RPC exec_sql n'existe pas, essayons pg_execute
      try {
        console.log("Tentative avec pg_execute...");
        const { data: pgData, error: pgError } = await supabase.rpc('pg_execute', { 
          command: query 
        });
        
        if (pgError) {
          console.error(`❌ ERREUR avec pg_execute: ${pgError.message}`);
          return null;
        }
        
        console.log(`✅ SUCCÈS (pg_execute):`);
        console.log(pgData);
        return pgData;
      } catch (pgErr) {
        console.error(`❌ EXCEPTION avec pg_execute: ${pgErr}`);
        return null;
      }
    }
    
    console.log(`✅ SUCCÈS:`);
    console.log(data);
    return data;
  } catch (err) {
    console.error(`❌ EXCEPTION: ${err}`);
    return null;
  }
}

// Test d'insertion directe via SQL
async function insertViaSql() {
  console.log("\n📝 Test d'insertion directe via SQL");
  
  const uuid = `TEST-DIRECT-${Date.now()}`;
  const query = `
    INSERT INTO samples (number, product, smell, texture, taste, aspect) 
    VALUES ('${uuid}', 'Test Direct SQL', 'A', 'B', 'A', 'A')
    RETURNING *;
  `;
  
  return await executeCustomQuery(query, "Insertion directe");
}

// Vérifier l'état actuel de RLS
async function checkRlsStatus() {
  const query = `
    SELECT relrowsecurity, relname
    FROM pg_class
    WHERE relname = 'samples';
  `;
  
  return await executeCustomQuery(query, "Vérification du statut RLS");
}

// Vérifier les politiques RLS existantes
async function checkRlsPolicies() {
  const query = `
    SELECT *
    FROM pg_policies
    WHERE tablename = 'samples';
  `;
  
  return await executeCustomQuery(query, "Politiques RLS existantes");
}

// Tenter de désactiver RLS (nécessite des privilèges élevés)
async function disableRls() {
  const query = `
    ALTER TABLE samples DISABLE ROW LEVEL SECURITY;
  `;
  
  return await executeCustomQuery(query, "Désactivation de RLS");
}

// Tenter de créer une politique permissive
async function createPermissivePolicy() {
  // D'abord supprimer toute politique existante avec ce nom
  const dropQuery = `
    DROP POLICY IF EXISTS allow_anon_inserts ON samples;
  `;
  
  await executeCustomQuery(dropQuery, "Suppression de la politique existante");
  
  // Créer une nouvelle politique
  const createQuery = `
    CREATE POLICY allow_anon_inserts
    ON samples
    FOR INSERT
    TO anon
    USING (true);
  `;
  
  return await executeCustomQuery(createQuery, "Création d'une politique permissive");
}

// Exécution des tests
async function main() {
  console.log("🔍 VÉRIFICATION ET MODIFICATION DES POLITIQUES RLS");
  console.log("------------------------------------------------");
  
  // 1. Vérifier l'état actuel de RLS
  await checkRlsStatus();
  
  // 2. Vérifier les politiques existantes
  await checkRlsPolicies();
  
  // 3. Essayer de désactiver RLS
  await disableRls();
  
  // 4. Essayer de créer une politique permissive
  await createPermissivePolicy();
  
  // 5. Vérifier à nouveau les politiques
  await checkRlsPolicies();
  
  // 6. Essayer d'insérer directement via SQL
  await insertViaSql();
  
  console.log("\n✅ Opérations terminées");
}

// Exécution
main().catch(err => {
  console.error("\n❌ Erreur globale:", err);
}); 
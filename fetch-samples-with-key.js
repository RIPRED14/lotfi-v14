// Script pour tester l'accès aux échantillons avec les options avancées de Supabase
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Créer le client avec des options spéciales
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.49.4',
    },
  },
});

async function fetchSamplesWithOptions() {
  console.log("Tentative de récupération des échantillons avec des options spéciales...");
  
  try {
    // Tentative 1: Récupérer avec les headers normaux
    console.log("\nTentative 1: Headers standard");
    const { data: data1, error: error1 } = await supabase
      .from('samples')
      .select('*')
      .limit(5);
    
    if (error1) {
      console.error("❌ Erreur (Tentative 1):", error1);
    } else {
      console.log("✅ Récupération réussie:", data1);
    }
    
    // Tentative 2: Essayer de mettre à jour un échantillon existant
    console.log("\nTentative 2: Tester l'insertion sans id");
    const { data: data2, error: error2 } = await supabase
      .from('samples')
      .insert({
        number: 'TEST-003',
        product: 'Test produit',
        smell: 'A',
        texture: 'B',
        taste: 'B',
        aspect: 'A'
      })
      .select();
    
    if (error2) {
      console.error("❌ Erreur (Tentative 2):", error2);
    } else {
      console.log("✅ Insertion réussie:", data2);
    }
    
    // Tentative 3: Récupérer les échantillons les plus récents
    console.log("\nTentative 3: Récupérer les échantillons les plus récents");
    const { data: data3, error: error3 } = await supabase
      .from('samples')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error3) {
      console.error("❌ Erreur (Tentative 3):", error3);
    } else {
      console.log("✅ Récupération réussie:", data3);
    }
    
    // Tentative 4: Examiner le schéma de la table
    console.log("\nTentative 4: Récupérer le schéma de la table samples");
    const { data: data4, error: error4 } = await supabase
      .rpc('get_schema', { table_name: 'samples' });
    
    if (error4) {
      console.error("❌ Erreur (Tentative 4):", error4);
    } else {
      console.log("✅ Schéma récupéré:", data4);
    }
    
    return true;
  } catch (err) {
    console.error("❌ Exception globale:", err);
    return false;
  }
}

// Exécution
fetchSamplesWithOptions()
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
// Script pour vérifier les données dans la base
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function verifyData() {
  console.log("🔍 Vérification des données...\n");

  // Vérifier les échantillons en attente
  console.log("📋 Échantillons en attente de lecture:");
  const { data: samples, error: samplesError } = await supabase
    .from('samples')
    .select('id, number, product, status, created_at')
    .eq('status', 'waiting_reading')
    .order('created_at', { ascending: false });

  if (samplesError) {
    console.error("❌ Erreur échantillons:", samplesError);
  } else {
    console.log(`✅ ${samples.length} échantillons trouvés:`);
    samples.forEach(sample => {
      console.log(`  - ${sample.number}: ${sample.product} (${sample.status})`);
    });
  }

  console.log("\n🧬 Sélections de bactéries:");
  const { data: bacteria, error: bacteriaError } = await supabase
    .from('form_bacteria_selections')
    .select('form_id, bacteria_name, bacteria_delay, reading_day, status, created_at')
    .order('created_at', { ascending: false });

  if (bacteriaError) {
    console.error("❌ Erreur bactéries:", bacteriaError);
  } else {
    console.log(`✅ ${bacteria.length} sélections de bactéries trouvées:`);
    
    // Grouper par form_id
    const groupedBacteria = {};
    bacteria.forEach(b => {
      if (!groupedBacteria[b.form_id]) {
        groupedBacteria[b.form_id] = [];
      }
      groupedBacteria[b.form_id].push(b);
    });

    Object.entries(groupedBacteria).forEach(([formId, bacteriaList]) => {
      const sample = samples?.find(s => s.id === formId);
      console.log(`\n  📝 ${sample?.number || formId}:`);
      bacteriaList.forEach(b => {
        console.log(`    - ${b.bacteria_name} (${b.bacteria_delay}) - ${b.status} - ${b.reading_day}`);
      });
    });
  }

  // Statistiques
  console.log("\n📊 Statistiques:");
  if (bacteria && bacteria.length > 0) {
    const statusCounts = bacteria.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });
  }
}

verifyData(); 
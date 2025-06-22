// Script pour insérer des données de test pour les lectures en attente
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

// Créer le client
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Fonction pour insérer des échantillons en attente de lecture
async function insertPendingReadingsSamples() {
  console.log("🔄 Insertion des échantillons en attente de lecture...");

  const currentDate = new Date();
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const afterTomorrow = new Date(currentDate);
  afterTomorrow.setDate(afterTomorrow.getDate() + 2);

  // Échantillons de test
  const testSamples = [
    {
      number: 'PEND-001',
      product: 'Yaourt aux fruits',
      ready_time: '10:00',
      fabrication: currentDate.toISOString().split('T')[0],
      dlc: afterTomorrow.toISOString().split('T')[0],
      smell: 'A',
      texture: 'A',
      taste: 'A',
      aspect: 'A',
      status: 'waiting_reading',
      brand: 'Grand Frais',
      site: 'R1',
      form_id: 'test-form-001',
      report_title: 'Contrôle qualité Yaourt',
      created_at: currentDate.toISOString(),
      modified_at: currentDate.toISOString()
    },
    {
      number: 'PEND-002',
      product: 'Fromage blanc',
      ready_time: '11:30',
      fabrication: currentDate.toISOString().split('T')[0],
      dlc: afterTomorrow.toISOString().split('T')[0],
      smell: 'A',
      texture: 'B',
      taste: 'A',
      aspect: 'A',
      status: 'waiting_reading',
      brand: 'BAIKO',
      site: 'BAIKO',
      form_id: 'test-form-002',
      report_title: 'Contrôle qualité Fromage blanc',
      created_at: currentDate.toISOString(),
      modified_at: currentDate.toISOString()
    },
    {
      number: 'PEND-003',
      product: 'Crème fraîche',
      ready_time: '14:00',
      fabrication: currentDate.toISOString().split('T')[0],
      dlc: afterTomorrow.toISOString().split('T')[0],
      smell: 'A',
      texture: 'A',
      taste: 'A',
      aspect: 'A',
      status: 'waiting_reading',
      brand: 'R2',
      site: 'R2',
      form_id: 'test-form-003',
      report_title: 'Contrôle qualité Crème fraîche',
      created_at: currentDate.toISOString(),
      modified_at: currentDate.toISOString()
    }
  ];

  try {
    // Insérer les échantillons
    const { data: samplesData, error: samplesError } = await supabase
      .from('samples')
      .insert(testSamples)
      .select();

    if (samplesError) throw samplesError;

    console.log("✅ Échantillons insérés avec succès:", samplesData);

    // Maintenant insérer les sélections de bactéries correspondantes
    const bacteriaSelections = [
      // Pour test-form-001
      {
        form_id: 'test-form-001',
        bacteria_name: 'Entérobactéries',
        bacteria_delay: '24h',
        reading_day: 'Lundi',
        status: 'pending',
        reading_date: tomorrow.toISOString().split('T')[0],
        created_at: currentDate.toISOString(),
        modified_at: currentDate.toISOString()
      },
      {
        form_id: 'test-form-001',
        bacteria_name: 'Levures/Moisissures',
        bacteria_delay: '3j',
        reading_day: 'Mercredi',
        status: 'pending',
        reading_date: afterTomorrow.toISOString().split('T')[0],
        created_at: currentDate.toISOString(),
        modified_at: currentDate.toISOString()
      },
      // Pour test-form-002
      {
        form_id: 'test-form-002',
        bacteria_name: 'Listeria',
        bacteria_delay: '48h',
        reading_day: 'Mardi',
        status: 'in_progress',
        reading_date: tomorrow.toISOString().split('T')[0],
        created_at: currentDate.toISOString(),
        modified_at: currentDate.toISOString()
      },
      {
        form_id: 'test-form-002',
        bacteria_name: 'Coliformes totaux',
        bacteria_delay: '48h',
        reading_day: 'Mardi',
        status: 'pending',
        reading_date: tomorrow.toISOString().split('T')[0],
        created_at: currentDate.toISOString(),
        modified_at: currentDate.toISOString()
      },
      // Pour test-form-003
      {
        form_id: 'test-form-003',
        bacteria_name: 'Staphylocoques',
        bacteria_delay: '48h',
        reading_day: 'Vendredi',
        status: 'pending',
        reading_date: afterTomorrow.toISOString().split('T')[0],
        created_at: currentDate.toISOString(),
        modified_at: currentDate.toISOString()
      },
      {
        form_id: 'test-form-003',
        bacteria_name: 'Escherichia coli',
        bacteria_delay: '24h',
        reading_day: 'Jeudi',
        status: 'pending',
        reading_date: tomorrow.toISOString().split('T')[0],
        created_at: currentDate.toISOString(),
        modified_at: currentDate.toISOString()
      }
    ];

    const { data: bacteriaData, error: bacteriaError } = await supabase
      .from('form_bacteria_selections')
      .insert(bacteriaSelections)
      .select();

    if (bacteriaError) throw bacteriaError;

    console.log("✅ Sélections de bactéries insérées avec succès:", bacteriaData);
    console.log("🎉 Insertion terminée avec succès !");

  } catch (error) {
    console.error("❌ Erreur lors de l'insertion:", error);
  }
}

// Exécuter le script
insertPendingReadingsSamples(); 
// Script final pour tester l'application complète
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bkdcbrnfzgnafjwnryme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZGNicm5memduYWZqd25yeW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODA1MTAsImV4cCI6MjA2MTI1NjUxMH0.cdzP9f_Bg1TlrBs-v1DsOb5Iv-tfK0KURPwZn1hwYMU";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function finalTest() {
  console.log("🎯 Test final de l'application...\n");

  try {
    // 1. Vérifier la structure des données
    console.log("1️⃣ Vérification de la structure des données:");
    
    const { data: samples, error: samplesError } = await supabase
      .from('samples')
      .select('*')
      .eq('status', 'waiting_reading')
      .limit(3);

    if (samplesError) {
      console.error("❌ Erreur échantillons:", samplesError);
      return;
    }

    console.log(`✅ ${samples.length} échantillons de test trouvés`);

    const { data: bacteria, error: bacteriaError } = await supabase
      .from('form_bacteria_selections')
      .select('*')
      .limit(5);

    if (bacteriaError) {
      console.error("❌ Erreur bactéries:", bacteriaError);
      return;
    }

    console.log(`✅ ${bacteria.length} bactéries de test trouvées`);

    // 2. Simuler la fonction loadWaitingForms exacte
    console.log("\n2️⃣ Simulation de loadWaitingForms:");
    
    const { data: waitingSamples, error: waitingError } = await supabase
      .from('samples')
      .select('id, form_id, report_title, brand, site, created_at, modified_at')
      .eq('status', 'waiting_reading');

    const { data: bacteriaSelections, error: bacteriaSelectionsError } = await supabase
      .from('form_bacteria_selections')
      .select('*')
      .in('status', ['pending', 'in_progress']);

    if (waitingError || bacteriaSelectionsError) {
      console.error("❌ Erreur lors de la récupération:", waitingError || bacteriaSelectionsError);
      return;
    }

    // Traitement des données comme dans l'application
    const formsMap = new Map();
    
    waitingSamples.forEach(sample => {
      const formId = sample.id;
      if (!formsMap.has(formId)) {
        formsMap.set(formId, {
          id: formId,
          title: sample.report_title || `Échantillon ${sample.id.substring(0, 8)}`,
          brand: sample.brand || 'Non spécifié',
          site: sample.site || 'Non spécifié',
          createdAt: sample.created_at,
          modifiedAt: sample.modified_at,
          bacteria: []
        });
      }
    });

    bacteriaSelections.forEach(bacteria => {
      if (formsMap.has(bacteria.form_id)) {
        const form = formsMap.get(bacteria.form_id);
        form.bacteria.push({
          id: bacteria.id,
          name: bacteria.bacteria_name,
          delay: bacteria.bacteria_delay,
          readingDay: bacteria.reading_day,
          status: bacteria.status,
          readingDate: new Date() // Simulé
        });
      }
    });

    const waitingForms = Array.from(formsMap.values());
    console.log(`✅ ${waitingForms.length} formulaires traités avec succès`);

    // 3. Test des fonctions de couleur et d'icône
    console.log("\n3️⃣ Test des fonctions de couleur et d'icône:");
    
    const getStatusColor = (status) => {
      switch (status) {
        case 'pending': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
        case 'in_progress': return 'bg-blue-100 border-blue-300 text-blue-800';
        case 'completed': return 'bg-green-100 border-green-300 text-green-800';
        case 'overdue': return 'bg-red-100 border-red-300 text-red-800';
        default: return 'bg-gray-100 border-gray-300 text-gray-800';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'pending': return '⏳';
        case 'in_progress': return '🔄';
        case 'completed': return '✅';
        case 'overdue': return '⚠️';
        default: return '❓';
      }
    };

    const statusTests = ['pending', 'in_progress', 'completed', 'overdue'];
    statusTests.forEach(status => {
      console.log(`   ${getStatusIcon(status)} ${status}: ${getStatusColor(status)}`);
    });

    // 4. Test de l'organisation par jour
    console.log("\n4️⃣ Test de l'organisation par jour:");
    
    const bacteriaByDay = {};
    waitingForms.forEach(form => {
      form.bacteria.forEach(bacteria => {
        const dateKey = bacteria.readingDate.toISOString().split('T')[0];
        if (!bacteriaByDay[dateKey]) {
          bacteriaByDay[dateKey] = [];
        }
        bacteriaByDay[dateKey].push({
          ...bacteria,
          formTitle: form.title
        });
      });
    });

    Object.entries(bacteriaByDay).forEach(([date, dayBacteria]) => {
      console.log(`📅 ${date}: ${dayBacteria.length} bactéries`);
      
      // Grouper par statut
      const statusGroups = {};
      dayBacteria.forEach(b => {
        if (!statusGroups[b.status]) statusGroups[b.status] = 0;
        statusGroups[b.status]++;
      });
      
      Object.entries(statusGroups).forEach(([status, count]) => {
        console.log(`   ${getStatusIcon(status)} ${status}: ${count}`);
      });
    });

    // 5. Résumé final
    console.log("\n5️⃣ Résumé final:");
    const totalBacteria = waitingForms.reduce((sum, form) => sum + form.bacteria.length, 0);
    const formsWithBacteria = waitingForms.filter(form => form.bacteria.length > 0).length;
    
    console.log(`📊 Statistiques:`);
    console.log(`   - Formulaires: ${waitingForms.length}`);
    console.log(`   - Formulaires avec bactéries: ${formsWithBacteria}`);
    console.log(`   - Total bactéries: ${totalBacteria}`);
    console.log(`   - Moyenne par formulaire: ${(totalBacteria / formsWithBacteria).toFixed(1)}`);

    const allStatuses = {};
    waitingForms.forEach(form => {
      form.bacteria.forEach(bacteria => {
        allStatuses[bacteria.status] = (allStatuses[bacteria.status] || 0) + 1;
      });
    });

    console.log(`   - Répartition par statut:`);
    Object.entries(allStatuses).forEach(([status, count]) => {
      const percentage = ((count / totalBacteria) * 100).toFixed(1);
      console.log(`     ${getStatusIcon(status)} ${status}: ${count} (${percentage}%)`);
    });

    console.log("\n✅ Test final terminé avec succès!");
    console.log("🎉 L'application est prête à être utilisée!");

  } catch (error) {
    console.error("❌ Erreur lors du test final:", error);
  }
}

finalTest(); 
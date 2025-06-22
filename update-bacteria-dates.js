import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://ekmkjbqafhjkuqhjdslf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbWtqYnFhZmhqa3VxaGpkc2xmIiwicm9sZSI6InB1YmxpYyIsImlhdCI6MTczMzg2OTY2MSwiZXhwIjoyMDQ5NDQ1NjYxfQ.xzQQHaM2KPV-21z1MuJOkRm5qn4FQvFjy--R_BwD3zs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateBacteriaWithRealisticDates() {
  console.log('🔄 Mise à jour des dates des bactéries...');
  
  try {
    // Récupérer toutes les bactéries existantes
    const { data: bacteria, error: fetchError } = await supabase
      .from('form_bacteria_selections')
      .select('*');
    
    if (fetchError) throw fetchError;
    
    console.log(`📊 ${bacteria.length} bactéries trouvées`);
    
    // Créer des dates variées pour tester le système de couleurs
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    // Répartir les bactéries avec différents statuts et dates
    const updates = bacteria.map((bacterium, index) => {
      let status = bacterium.status;
      let created_at = bacterium.created_at;
      
      // Répartir selon l'index pour avoir de la variété
      const modulo = index % 6;
      
      switch (modulo) {
        case 0: // En retard (rouge)
          status = 'pending';
          created_at = new Date(yesterday.getTime() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case 1: // À faire aujourd'hui (rouge)
          status = 'pending';
          created_at = yesterday.toISOString();
          break;
        case 2: // Terminé (vert)
          status = 'completed';
          created_at = new Date(yesterday.getTime() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case 3: // En cours (bleu)
          status = 'in_progress';
          created_at = yesterday.toISOString();
          break;
        case 4: // Pas encore à échéance - demain (gris)
          status = 'pending';
          created_at = today.toISOString();
          break;
        case 5: // Pas encore à échéance - après-demain (gris)
          status = 'pending';
          created_at = tomorrow.toISOString();
          break;
        default:
          status = 'pending';
          created_at = today.toISOString();
      }
      
      return {
        id: bacterium.id,
        status,
        created_at,
        modified_at: new Date().toISOString()
      };
    });
    
    // Mettre à jour chaque bactérie
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('form_bacteria_selections')
        .update({
          status: update.status,
          created_at: update.created_at,
          modified_at: update.modified_at
        })
        .eq('id', update.id);
      
      if (updateError) {
        console.error(`❌ Erreur mise à jour ${update.id}:`, updateError);
      }
    }
    
    // Vérifier les résultats
    const { data: updatedBacteria, error: verifyError } = await supabase
      .from('form_bacteria_selections')
      .select('*')
      .order('created_at');
    
    if (verifyError) throw verifyError;
    
    // Statistiques
    const statusCounts = updatedBacteria.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('✅ Mise à jour terminée !');
    console.log('📊 Répartition des statuts :');
    console.log(`   🔴 En retard/À faire : ${statusCounts.pending || 0}`);
    console.log(`   🔵 En cours : ${statusCounts.in_progress || 0}`);
    console.log(`   🟢 Terminé : ${statusCounts.completed || 0}`);
    
    console.log('\n🎨 Test des couleurs :');
    updatedBacteria.forEach((bacterium, index) => {
      const createdDate = new Date(bacterium.created_at);
      const delayDays = parseInt(bacterium.bacteria_delay.replace(/[^\d]/g, '')) || 1;
      const readingDate = new Date(createdDate.getTime() + delayDays * 24 * 60 * 60 * 1000);
      const today = new Date();
      
      let color = '';
      if (bacterium.status === 'completed') {
        color = '🟢';
      } else if (readingDate <= today) {
        color = '🔴';
      } else if (bacterium.status === 'in_progress') {
        color = '🔵';
      } else {
        color = '⚪';
      }
      
      console.log(`   ${color} ${bacterium.bacteria_name} (${bacterium.status}) - Échéance: ${readingDate.toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur :', error);
  }
}

updateBacteriaWithRealisticDates(); 
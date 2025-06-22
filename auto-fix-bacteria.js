import { createClient } from '@supabase/supabase-js';

console.log('🤖 RÉPARATION AUTOMATIQUE DES BACTÉRIES');
console.log('=====================================');

// Configuration Supabase
const supabaseUrl = 'https://ekmkjbqafhjkuqhjdslf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbWtqYnFhZmhqa3VxaGpkc2xmIiwicm9sZSI6InB1YmxpYyIsImlhdCI6MTczMzg2OTY2MSwiZXhwIjoyMDQ5NDQ1NjYxfQ.xzQQHaM2KPV-21z1MuJOkRm5qn4FQvFjy--R_BwD3zs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function autoFixBacteria() {
  try {
    console.log('🔗 Connexion à Supabase...');
    
    // 1. Vérifier la connexion
    const { data: testConnection, error: testError } = await supabase
      .from('samples')
      .select('form_id')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur de connexion:', testError.message);
      return;
    }
    
    console.log('✅ Connexion réussie !');

    // 2. Identifier le formulaire de l'utilisateur
    const targetFormId = 'form-2025-06-09-3dr8om5';
    console.log(`🎯 Ciblage du formulaire: ${targetFormId}`);

    // 3. Vérifier si les bactéries existent déjà
    console.log('\n🔍 Vérification des bactéries existantes...');
    const { data: existingBacteria, error: checkError } = await supabase
      .from('form_bacteria_selections')
      .select('*')
      .eq('form_id', targetFormId);

    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError.message);
      return;
    }

    if (existingBacteria && existingBacteria.length > 0) {
      console.log(`⚠️  ${existingBacteria.length} bactéries déjà présentes pour ce formulaire:`);
      existingBacteria.forEach(b => {
        console.log(`   - ${b.bacteria_name} (${b.status})`);
      });
      
      console.log('\n🗑️  Suppression des anciennes bactéries...');
      const { error: deleteError } = await supabase
        .from('form_bacteria_selections')
        .delete()
        .eq('form_id', targetFormId);

      if (deleteError) {
        console.error('❌ Erreur lors de la suppression:', deleteError.message);
        return;
      }
      
      console.log('✅ Anciennes bactéries supprimées');
    } else {
      console.log('✅ Aucune bactérie existante trouvée');
    }

    // 4. Créer les nouvelles bactéries avec les dates correctes
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const selectedBacteria = [
      {
        form_id: targetFormId,
        bacteria_name: 'Entérobactéries',
        bacteria_delay: 24,
        reading_day: 1,
        status: 'pending',
        reading_date: tomorrow.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString()
      },
      {
        form_id: targetFormId,
        bacteria_name: 'Escherichia coli',
        bacteria_delay: 24,
        reading_day: 1,
        status: 'pending',
        reading_date: tomorrow.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString()
      },
      {
        form_id: targetFormId,
        bacteria_name: 'Coliformes totaux',
        bacteria_delay: 48,
        reading_day: 2,
        status: 'pending',
        reading_date: dayAfterTomorrow.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString()
      }
    ];

    console.log('\n🧬 Création des bactéries sélectionnées...');
    selectedBacteria.forEach((bacteria, index) => {
      console.log(`   ${index + 1}. ${bacteria.bacteria_name} (${bacteria.bacteria_delay}h) - Lecture: ${bacteria.reading_date}`);
    });

    // 5. Insérer les bactéries
    const { data: insertedBacteria, error: insertError } = await supabase
      .from('form_bacteria_selections')
      .insert(selectedBacteria)
      .select();

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion:', insertError.message);
      console.log('📝 Détails de l\'erreur:', insertError);
      return;
    }

    console.log(`\n✅ ${insertedBacteria?.length || 0} bactéries créées avec succès !`);
    
    // 6. Vérifier que le formulaire a le bon statut
    console.log('\n📋 Vérification du statut du formulaire...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('samples')
      .select('status, report_title, brand')
      .eq('form_id', targetFormId)
      .single();

    if (sampleError) {
      console.log('⚠️  Impossible de vérifier le statut du formulaire:', sampleError.message);
    } else {
      console.log(`📋 Formulaire trouvé:`);
      console.log(`   - Titre: ${sampleData.report_title || 'N/A'}`);
      console.log(`   - Marque: ${sampleData.brand || 'N/A'}`);
      console.log(`   - Statut actuel: ${sampleData.status}`);
      
      // Mettre à jour le statut si nécessaire
      if (sampleData.status !== 'waiting_reading') {
        console.log('🔄 Mise à jour du statut vers "waiting_reading"...');
        const { error: updateError } = await supabase
          .from('samples')
          .update({ status: 'waiting_reading' })
          .eq('form_id', targetFormId);

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour du statut:', updateError.message);
        } else {
          console.log('✅ Statut mis à jour avec succès');
        }
      } else {
        console.log('✅ Le statut est déjà correct');
      }
    }

    // 7. Vérification finale
    console.log('\n🔍 Vérification finale...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('form_bacteria_selections')
      .select('*')
      .eq('form_id', targetFormId);

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError.message);
    } else {
      console.log(`✅ ${finalCheck?.length || 0} bactéries confirmées dans la base:`);
      finalCheck?.forEach(b => {
        console.log(`   - ${b.bacteria_name} (${b.status}) - Lecture: ${b.reading_date}`);
      });
    }

    console.log('\n🎉 RÉPARATION AUTOMATIQUE TERMINÉE !');
    console.log('📱 Rechargez maintenant la page "Lectures en Attente"');
    console.log('🔄 Cliquez sur "Actualiser" pour voir vos bactéries');
    console.log('\n🎨 Couleurs attendues:');
    console.log('   🔴 Entérobactéries et E. coli (dus demain)');
    console.log('   ⚪ Coliformes totaux (dus après-demain)');

  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

// Exécuter automatiquement
autoFixBacteria(); 
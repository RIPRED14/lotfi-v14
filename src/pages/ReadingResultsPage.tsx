import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Save, Calculator, AlertTriangle, CheckCircle, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Sample {
  id: string;
  form_id: string;
  number: string;
  product: string;
  site: string;
  brand: string;
  status: string;
  created_at: string;
  modified_at: string;
  modified_by: string;
  assigned_to: string;
  report_title?: string; // Titre du formulaire choisi par l'utilisateur
  // Champs verts (déjà remplis dans Analyses en cours)
  ready_time?: string;
  fabrication?: string;
  dlc?: string;
  smell?: string;
  texture?: string;
  taste?: string;
  aspect?: string;
  ph?: string;
  enterobacteria?: string;
  yeast_mold?: string;
  // Champs de lecture microbiologique (à remplir)
  enterobacteria_count?: number | null;
  yeast_mold_count?: number | null;
  listeria_count?: number | null;
  coliforms_count?: number | null;
  staphylococcus_count?: number | null;
  // Commentaires et observations
  reading_comments?: string | null;
  reading_technician?: string | null;
  reading_date?: string | null;
}

// Interface pour les bactéries sélectionnées
interface SelectedBacteria {
  id: string;
  form_id: string;
  bacteria_name: string;
  bacteria_delay: string;
  reading_day: string;
  status: string;
  created_at: string;
  modified_at: string;
  reading_date?: string;
}

const ReadingResultsPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Récupérer les paramètres d'URL
  const formId = searchParams.get('formId');
  const bacteriaId = searchParams.get('bacteriaId');
  const bacteriaName = searchParams.get('bacteriaName');
  const delay = searchParams.get('delay');
  const readingDay = searchParams.get('readingDay');
  const viewMode = searchParams.get('viewMode'); // 'archived' pour les formulaires terminés
  
  const isArchivedView = viewMode === 'archived';
  
  console.log('📋 Paramètres URL reçus:', {
    formId,
    bacteriaId,
    bacteriaName,
    delay,
    readingDay,
    viewMode,
    isArchivedView
  });
  
  console.log('🔍 Mode de visualisation:', isArchivedView ? 'ARCHIVÉ' : 'EN COURS');
  
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedBacteria, setSelectedBacteria] = useState<SelectedBacteria[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // États pour les résultats de lecture
  const [readingResults, setReadingResults] = useState<Record<string, any>>({});
  const [comments, setComments] = useState<string>('');

  // Mapping des noms de bactéries vers les champs de base de données
  const bacteriaFieldMapping: Record<string, string> = {
    'Entérobactéries': 'enterobacteria_count',
    'Levures/Moisissures': 'yeast_mold_count',
    'Listeria': 'listeria_count',
    'Coliformes totaux': 'coliforms_count',
    'Staphylocoques': 'staphylococcus_count',
    'Escherichia coli': 'enterobacteria_count', // E.coli utilise le même champ qu'Entérobactéries
    'Flore totales': 'enterobacteria_count', // Utilise le champ entérobactéries par défaut
    'Leuconostoc': 'yeast_mold_count', // Utilise le champ levures par défaut
    'Levures/Moisissures (3j)': 'yeast_mold_count',
    'Levures/Moisissures (5j)': 'yeast_mold_count'
  };

  // Charger les échantillons et les bactéries sélectionnées
  const loadData = async () => {
    if (!formId) {
      toast({
        title: "Erreur",
        description: "Aucun formulaire spécifié",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // 1. Charger les échantillons selon le mode (en attente ou archivés)
      const targetStatus = isArchivedView ? 'archived' : 'waiting_reading';
      const { data: samplesData, error: samplesError } = await supabase
        .from('samples')
        .select('*, report_title')
        .eq('form_id', formId)
        .eq('status', targetStatus)
        .order('created_at', { ascending: true });

      if (samplesError) throw samplesError;

      console.log('📋 Données échantillons récupérées:', samplesData);
      setSamples(samplesData || []);

      // 2. Charger les bactéries sélectionnées pour ce formulaire
      let bacteriaData = null;
      
      if (isArchivedView) {
        // Pour les formulaires archivés, récupérer toutes les bactéries qui ont des résultats
        bacteriaData = [];
        if (samplesData && samplesData.length > 0) {
          const sample = samplesData[0] as any;
          console.log('🔍 Vérification des champs de bactéries dans l\'échantillon archivé:', {
            enterobacteria_count: sample.enterobacteria_count,
            yeast_mold_count: sample.yeast_mold_count,
            listeria_count: sample.listeria_count,
            coliforms_count: sample.coliforms_count,
            staphylococcus_count: sample.staphylococcus_count
          });
          
          // Vérifier quels champs de bactéries ont des valeurs (même 0 est une valeur valide)
          if (sample.enterobacteria_count !== null && sample.enterobacteria_count !== undefined) {
            bacteriaData.push({ 
              id: 'archived-enterobacteria', 
              bacteria_name: 'Entérobactéries', 
              status: 'completed',
              form_id: formId,
              bacteria_delay: '',
              reading_day: '',
              created_at: '',
              modified_at: ''
            });
            console.log('✅ Entérobactéries trouvées:', sample.enterobacteria_count);
          }
          if (sample.yeast_mold_count !== null && sample.yeast_mold_count !== undefined) {
            bacteriaData.push({ 
              id: 'archived-yeast-mold', 
              bacteria_name: 'Levures/Moisissures', 
              status: 'completed',
              form_id: formId,
              bacteria_delay: '',
              reading_day: '',
              created_at: '',
              modified_at: ''
            });
            console.log('✅ Levures/Moisissures trouvées:', sample.yeast_mold_count);
          }
          if (sample.listeria_count !== null && sample.listeria_count !== undefined) {
            bacteriaData.push({ 
              id: 'archived-listeria', 
              bacteria_name: 'Listeria', 
              status: 'completed',
              form_id: formId,
              bacteria_delay: '',
              reading_day: '',
              created_at: '',
              modified_at: ''
            });
            console.log('✅ Listeria trouvées:', sample.listeria_count);
          }
          if (sample.coliforms_count !== null && sample.coliforms_count !== undefined) {
            bacteriaData.push({ 
              id: 'archived-coliforms', 
              bacteria_name: 'Coliformes totaux', 
              status: 'completed',
              form_id: formId,
              bacteria_delay: '',
              reading_day: '',
              created_at: '',
              modified_at: ''
            });
            console.log('✅ Coliformes totaux trouvées:', sample.coliforms_count);
          }
          if (sample.staphylococcus_count !== null && sample.staphylococcus_count !== undefined) {
            bacteriaData.push({ 
              id: 'archived-staphylococcus', 
              bacteria_name: 'Staphylocoques', 
              status: 'completed',
              form_id: formId,
              bacteria_delay: '',
              reading_day: '',
              created_at: '',
              modified_at: ''
            });
            console.log('✅ Staphylocoques trouvées:', sample.staphylococcus_count);
          }
          
          console.log('🦠 Bactéries détectées dans le formulaire archivé:', bacteriaData.map(b => b.bacteria_name));
        }
      } else {
        // Pour les formulaires en cours, charger depuis form_bacteria_selections
        const { data: bacteriaSelectionsData, error: bacteriaError } = await supabase
          .from('form_bacteria_selections')
          .select('*')
          .eq('form_id', formId)
          .order('created_at', { ascending: true });
          
        if (bacteriaError) throw bacteriaError;
                 bacteriaData = bacteriaSelectionsData;
       }

      console.log('🦠 Bactéries sélectionnées récupérées:', bacteriaData);
      setSelectedBacteria(bacteriaData || []);
      
      // 3. Initialiser les résultats avec les valeurs existantes
      const initialResults: Record<string, any> = {};
      samplesData?.forEach(sample => {
        initialResults[sample.id] = {};
        console.log(`🔍 Échantillon ${sample.id} - Données complètes:`, sample);
        
        // Initialiser seulement les champs des bactéries sélectionnées
        bacteriaData?.forEach(bacteria => {
          const fieldName = bacteriaFieldMapping[bacteria.bacteria_name] || 'enterobacteria_count';
          const existingValue = (sample as any)[fieldName];
          
          console.log(`🦠 Bactérie: ${bacteria.bacteria_name}`);
          console.log(`📊 Champ DB: ${fieldName}`);
          console.log(`💾 Valeur existante: ${existingValue}`);
          
          initialResults[sample.id][bacteria.bacteria_name] = existingValue || '';
        });
      });
      
      console.log('🎯 Résultats initialisés:', initialResults);
      setReadingResults(initialResults);
      
      // 4. Charger les commentaires existants
      if (samplesData && samplesData.length > 0) {
        setComments((samplesData[0] as any).reading_comments || '');
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [formId]);

  // Mettre à jour un résultat de lecture
  const updateReadingResult = (sampleId: string, bacteriaName: string, value: string) => {
    setReadingResults(prev => ({
      ...prev,
      [sampleId]: {
        ...prev[sampleId],
        [bacteriaName]: value
      }
    }));
  };

  // Sauvegarder les résultats de lecture
  const handleSaveResults = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Valider qu'au moins un résultat a été saisi
      const hasResults = Object.values(readingResults).some(result => 
        Object.values(result).some(value => value && value.toString().trim() !== '')
      );
      
      if (!hasResults) {
        toast({
          title: "Aucun résultat",
          description: "Veuillez saisir au moins un résultat de lecture",
          variant: "destructive"
        });
        return;
      }

      // Vérifier si TOUTES les bactéries sélectionnées sont remplies pour TOUS les échantillons
      let allBacteriaCompleted = true;
      let totalFieldsRequired = 0;
      let totalFieldsFilled = 0;

      for (const sample of samples) {
        const sampleResults = readingResults[sample.id];
        if (!sampleResults) {
          allBacteriaCompleted = false;
          continue;
        }

        for (const bacteria of selectedBacteria) {
          totalFieldsRequired++;
          const value = sampleResults[bacteria.bacteria_name];
          if (value && value.toString().trim() !== '') {
            totalFieldsFilled++;
          } else {
            allBacteriaCompleted = false;
          }
        }
      }

      console.log(`📊 Vérification complétude: ${totalFieldsFilled}/${totalFieldsRequired} champs remplis`);
      console.log(`🎯 Toutes les bactéries complétées: ${allBacteriaCompleted}`);

      const currentDate = new Date().toISOString();
      let updatedCount = 0;

      // Déterminer le statut final
      const finalStatus = allBacteriaCompleted ? 'archived' : 'completed';
      
      console.log(`📋 Statut final du formulaire: ${finalStatus}`);

      // Mettre à jour chaque échantillon
      for (const sample of samples) {
        const sampleResults = readingResults[sample.id];
        if (!sampleResults) continue;

        const updateData: any = {
          reading_comments: comments,
          reading_technician: user.name,
          reading_date: currentDate,
          status: finalStatus, // 'archived' si tout est rempli, 'completed' sinon
          modified_at: currentDate,
          modified_by: user.name
        };

        // Ajouter les résultats pour chaque bactérie sélectionnée
        selectedBacteria.forEach(bacteria => {
          const fieldName = bacteriaFieldMapping[bacteria.bacteria_name] || 'enterobacteria_count';
          const value = sampleResults[bacteria.bacteria_name];
          updateData[fieldName] = value ? Number(value) : null;
        });

        const { error } = await supabase
          .from('samples')
          .update(updateData)
          .eq('id', sample.id);

        if (error) throw error;
        updatedCount++;
      }

      // Mettre à jour le statut des bactéries sélectionnées
      if (allBacteriaCompleted) {
        for (const bacteria of selectedBacteria) {
          const { error: bacteriaError } = await supabase
            .from('form_bacteria_selections')
            .update({
              status: 'completed',
              modified_at: currentDate
            })
            .eq('id', bacteria.id);

          if (bacteriaError) {
            console.error('Erreur mise à jour bactérie:', bacteriaError);
          }
        }
      }

      // Message de succès adapté
      if (allBacteriaCompleted) {
        toast({
          title: "✅ Formulaire terminé et archivé",
          description: `${updatedCount} échantillon(s) mis à jour. Le formulaire est maintenant disponible dans "Mes Formulaires - Historique".`,
          duration: 5000
        });
      } else {
        toast({
          title: "Résultats sauvegardés",
          description: `${updatedCount} échantillon(s) mis à jour. ${totalFieldsFilled}/${totalFieldsRequired} analyses complétées.`,
          duration: 4000
        });
      }

      // Rediriger vers les lectures en attente après un délai
      setTimeout(() => {
        if (allBacteriaCompleted) {
          // Si tout est terminé, rediriger vers l'historique des formulaires
          navigate('/forms-history');
        } else {
          // Sinon, rester sur les lectures en attente
          navigate('/lectures-en-attente');
        }
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les résultats",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Obtenir le champ approprié selon le type de bactérie
  const getBacteriaField = (bacteriaType: string) => {
    switch (bacteriaType?.toLowerCase()) {
      case 'entérobactéries':
        return 'enterobacteria_count';
      case 'levures/moisissures':
        return 'yeast_mold_count';
      case 'listeria':
        return 'listeria_count';
      case 'coliformes totaux':
        return 'coliforms_count';
      case 'staphylocoques':
        return 'staphylococcus_count';
      default:
        return 'enterobacteria_count';
    }
  };

  const primaryField = getBacteriaField(bacteriaName || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des échantillons...</p>
        </div>
      </div>
    );
  }

  if (samples.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun échantillon en attente
            </h3>
            <p className="text-gray-600 mb-4">
              Aucun échantillon en attente de lecture pour ce formulaire.
            </p>
            <Button onClick={() => navigate('/quality-control')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Eye className="h-8 w-8 text-blue-600" />
                {isArchivedView ? 'Visualisation des Résultats' : 'Saisie des Résultats'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isArchivedView ? '📋 Formulaire archivé • ' : ''}
                {samples[0]?.report_title && `${samples[0].report_title} • `}
                {bacteriaName && `${bacteriaName} • `}
                {readingDay && `${readingDay} • `}
                {samples.length} échantillon(s) {isArchivedView ? 'analysé(s)' : 'à analyser'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/quality-control')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Informations du formulaire */}
          {samples[0] && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">
                  {samples[0].report_title || `Formulaire ${samples[0].form_id}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Site:</span>
                    <div className="text-blue-900">{samples[0].site}</div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Marque:</span>
                    <div className="text-blue-900">{samples[0].brand}</div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Date de création:</span>
                    <div className="text-blue-900">{new Date(samples[0].created_at).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tableau des échantillons en format tabulaire */}
          <div className="w-full border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="w-full rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      {/* Colonne numéro d'échantillon (bleue) */}
                      <th key="header-number" className="text-white py-2 px-2 w-[65px] bg-blue-600 text-white border-r border-blue-500 font-medium text-xs text-center align-middle">N° Éch.</th>
                      {/* Colonnes des données déjà saisies (champs bleus) */}
                      <th key="header-site" className="text-white py-2 px-2 w-[65px] bg-blue-500 text-white border-r border-blue-400 font-medium text-xs text-center align-middle">Site</th>
                      <th key="header-product" className="text-white py-2 px-2 w-[180px] bg-blue-500 text-white border-r border-blue-400 font-medium text-xs text-center align-middle">Produit</th>
                      <th key="header-time" className="text-white py-2 px-2 w-[80px] bg-blue-500 text-white border-r border-blue-400 font-medium text-xs text-center align-middle">Heure</th>
                      <th key="header-fabric" className="text-white py-2 px-2 w-[100px] bg-blue-500 text-white border-r border-blue-400 font-medium text-xs text-center align-middle">Fabric.</th>
                      <th key="header-dlc" className="text-white py-2 px-2 w-[100px] bg-blue-500 text-white border-r border-blue-400 font-medium text-xs text-center align-middle">DLC</th>
                      
                      {/* Colonnes des champs verts (déjà remplis) */}
                      <th key="header-smell" className="text-white py-2 px-2 w-[70px] bg-green-600 text-white border-r border-green-500 font-medium text-xs text-center align-middle">Odeur</th>
                      <th key="header-texture" className="text-white py-2 px-2 w-[70px] bg-green-600 text-white border-r border-green-500 font-medium text-xs text-center align-middle">Texture</th>
                      <th key="header-taste" className="text-white py-2 px-2 w-[70px] bg-green-600 text-white border-r border-green-500 font-medium text-xs text-center align-middle">Goût</th>
                      <th key="header-aspect" className="text-white py-2 px-2 w-[70px] bg-green-600 text-white border-r border-green-500 font-medium text-xs text-center align-middle">Aspect</th>
                      <th key="header-ph" className="text-white py-2 px-2 w-[50px] bg-green-600 text-white border-r border-green-500 font-medium text-xs text-center align-middle">pH</th>
                      
                      {/* Colonnes de lecture microbiologique (à remplir) - dynamiques selon les bactéries sélectionnées */}
                      {selectedBacteria.map((bacteria, index) => {
                        const isLast = index === selectedBacteria.length - 1;
                        const shortName = bacteria.bacteria_name
                          .replace('Entérobactéries', 'Entéro.')
                          .replace('Levures/Moisissures', 'Levures')
                          .replace('Coliformes totaux', 'Coliformes')
                          .replace('Staphylocoques', 'Staphylo.')
                          .replace('Escherichia coli', 'E.coli')
                          .replace('Flore totales', 'Flore')
                          .replace('Leuconostoc', 'Leuco.')
                          .replace('(3j)', '')
                          .replace('(5j)', '');
                        
                        return (
                          <th 
                            key={bacteria.id}
                            className={`text-white py-2 px-2 w-[100px] bg-orange-600 text-white ${!isLast ? 'border-r border-orange-500' : ''} font-medium text-xs text-center align-middle`}
                          >
                            {shortName} (UFC/g)
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {samples.map((sample, index) => (
                      <tr key={sample.id} className="hover:bg-gray-50 border-b border-gray-200">
                        {/* Numéro d'échantillon (bleu) */}
                        <td key={`${sample.id}-number`} className="py-2 px-2 text-center text-xs bg-blue-50 border-r border-gray-200">
                          <span className="inline-block w-8 h-6 rounded bg-blue-600 text-white text-xs leading-6 font-medium">
                            {sample.number || `#${index + 1}`}
                          </span>
                        </td>
                        <td key={`${sample.id}-site`} className="py-2 px-2 text-center text-xs border-r border-gray-200">
                          {sample.site}
                        </td>
                        <td key={`${sample.id}-product`} className="py-2 px-2 text-xs border-r border-gray-200 truncate">
                          {sample.product}
                        </td>
                        <td key={`${sample.id}-time`} className="py-2 px-2 text-center text-xs border-r border-gray-200">
                          {sample.ready_time || '-'}
                        </td>
                        <td key={`${sample.id}-fabric`} className="py-2 px-2 text-center text-xs border-r border-gray-200">
                          {sample.fabrication || '-'}
                        </td>
                        <td key={`${sample.id}-dlc`} className="py-2 px-2 text-center text-xs border-r border-gray-200">
                          {sample.dlc || '-'}
                        </td>
                        
                        {/* Champs verts (déjà remplis) avec couleurs conditionnelles */}
                        <td key={`${sample.id}-smell`} className="py-2 px-2 text-center text-xs bg-green-50 border-r border-gray-200">
                          <span className={`inline-block w-6 h-6 rounded text-white text-xs leading-6 ${
                            sample.smell === 'N' ? 'bg-red-600' : 
                            sample.smell === 'C' ? 'bg-green-600' : 
                            sample.smell ? 'bg-green-600' : 'bg-gray-300'
                          }`}>
                            {sample.smell || '-'}
                          </span>
                        </td>
                        <td key={`${sample.id}-texture`} className="py-2 px-2 text-center text-xs bg-green-50 border-r border-gray-200">
                          <span className={`inline-block w-6 h-6 rounded text-white text-xs leading-6 ${
                            sample.texture === 'N' ? 'bg-red-600' : 
                            sample.texture === 'C' ? 'bg-green-600' : 
                            sample.texture ? 'bg-green-600' : 'bg-gray-300'
                          }`}>
                            {sample.texture || '-'}
                          </span>
                        </td>
                        <td key={`${sample.id}-taste`} className="py-2 px-2 text-center text-xs bg-green-50 border-r border-gray-200">
                          <span className={`inline-block w-6 h-6 rounded text-white text-xs leading-6 ${
                            sample.taste === 'N' ? 'bg-red-600' : 
                            sample.taste === 'C' ? 'bg-green-600' : 
                            sample.taste ? 'bg-green-600' : 'bg-gray-300'
                          }`}>
                            {sample.taste || '-'}
                          </span>
                        </td>
                        <td key={`${sample.id}-aspect`} className="py-2 px-2 text-center text-xs bg-green-50 border-r border-gray-200">
                          <span className={`inline-block w-6 h-6 rounded text-white text-xs leading-6 ${
                            sample.aspect === 'N' ? 'bg-red-600' : 
                            sample.aspect === 'C' ? 'bg-green-600' : 
                            sample.aspect ? 'bg-green-600' : 'bg-gray-300'
                          }`}>
                            {sample.aspect || '-'}
                          </span>
                        </td>
                        <td key={`${sample.id}-ph`} className="py-2 px-2 text-center text-xs bg-green-50 border-r border-gray-200">
                          {sample.ph || '-'}
                        </td>
                        
                        {/* Champs de lecture microbiologique (à remplir ou afficher si archivé) */}
                        {selectedBacteria.map((bacteria, index) => {
                          const isLast = index === selectedBacteria.length - 1;
                          const fieldName = bacteriaFieldMapping[bacteria.bacteria_name] || 'enterobacteria_count';
                          const existingValue = (sample as any)[fieldName];
                          const displayValue = isArchivedView ? existingValue : (readingResults[sample.id]?.[bacteria.bacteria_name] || '');
                          
                          // Debug pour comprendre pourquoi les valeurs ne s'affichent pas
                          if (isArchivedView) {
                            console.log(`🔍 DEBUG Affichage - Échantillon ${sample.id}:`);
                            console.log(`   Bactérie: ${bacteria.bacteria_name}`);
                            console.log(`   Champ DB: ${fieldName}`);
                            console.log(`   Valeur existante: ${existingValue}`);
                            console.log(`   Type de valeur: ${typeof existingValue}`);
                            console.log(`   Valeur nulle?: ${existingValue === null}`);
                            console.log(`   Valeur undefined?: ${existingValue === undefined}`);
                          }
                          
                          return (
                            <td key={`${sample.id}-${bacteria.bacteria_name}`} className={`py-2 px-2 text-center text-xs ${isArchivedView ? 'bg-blue-50' : 'bg-orange-50'} ${!isLast ? 'border-r border-gray-200' : ''}`}>
                              {isArchivedView ? (
                                <span className={`inline-block w-full h-8 text-xs text-center leading-8 rounded ${
                                  (existingValue !== null && existingValue !== undefined) ? 'bg-blue-600 text-white font-medium' : 'bg-gray-300 text-gray-600'
                                }`}>
                                  {(existingValue !== null && existingValue !== undefined) ? existingValue : '-'}
                                </span>
                              ) : (
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={displayValue}
                                  onChange={(e) => updateReadingResult(sample.id, bacteria.bacteria_name, e.target.value)}
                                  className="w-full h-8 text-xs text-center border-orange-300 focus:border-orange-500"
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Légende */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>N° Échantillon</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Informations générales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>Conforme (C)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>Non-conforme (N)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-600 rounded"></div>
                  <span>Résultats microbiologiques à saisir</span>
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires généraux */}
          <Card>
            <CardHeader>
              <CardTitle>Commentaires et observations</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={isArchivedView ? "Commentaires de lecture..." : "Ajoutez vos commentaires sur la lecture des échantillons..."}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                disabled={isArchivedView}
                className={isArchivedView ? "bg-gray-100 text-gray-700" : ""}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/quality-control')}
            >
              {isArchivedView ? 'Retour' : 'Annuler'}
            </Button>
            {!isArchivedView && (
              <Button
                onClick={handleSaveResults}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder les résultats
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingResultsPage; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  RefreshCw, Microscope, Clock, CheckCircle,
  AlertCircle, FileText, AlertTriangle, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';

// Interface pour les formulaires en attente de lecture
interface WaitingForm {
  form_id: string;
  report_title: string;
  brand: string;
  site: string;
  sample_count: number;
  bacteria_list: BacteriaSelection[];
  created_at: string;
  modified_at: string;
}

// Interface pour les bactéries sélectionnées
interface BacteriaSelection {
  id: string;
  form_id: string;
  bacteria_name: string;
  bacteria_delay: string;
  reading_day: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  modified_at: string;
  reading_date?: string;
}

// Fonction pour obtenir les styles d'affichage d'une bactérie
const getBacteriaDisplayStyle = (bacteria: BacteriaSelection) => {
  if (bacteria.status === 'completed') {
    return {
      className: 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200',
      badge: 'bg-green-100 text-green-800 border-green-300',
      icon: <CheckCircle className="w-3 h-3" />,
      text: 'Terminé'
    };
  }
  
  if (bacteria.status === 'in_progress') {
    return {
      className: 'bg-blue-100 border-blue-400 text-blue-800 hover:bg-blue-200',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <Microscope className="w-3 h-3" />,
      text: 'En cours'
    };
  }
  
  // Vérifier si la bactérie est accessible
  const createdDate = new Date(bacteria.created_at);
  const now = new Date();
  const delayHours = parseInt(bacteria.bacteria_delay.replace(/[^\d]/g, '')) || 24;
  const readingDate = new Date(createdDate.getTime() + delayHours * 60 * 60 * 1000);
  
  if (readingDate <= now) {
    // Accessible maintenant
    return {
      className: 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200 ring-2 ring-green-300',
      badge: 'bg-green-100 text-green-800 border-green-300',
      icon: <CheckCircle className="w-3 h-3" />,
      text: 'Prêt pour lecture'
    };
  } else {
    // Pas encore accessible - mais on permet l'accès forcé
    const hoursLeft = Math.ceil((readingDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    return {
      className: 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200 ring-2 ring-yellow-300',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: <AlertTriangle className="w-3 h-3" />,
      text: `Forcer l'accès (${hoursLeft}h)`
    };
  }
};

const LecturesEnAttentePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [waitingForms, setWaitingForms] = useState<WaitingForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string>('all');

  // Charger les données au montage du composant
  useEffect(() => {
    loadWaitingForms();
  }, []);

  // Charger les formulaires en attente de lecture
  const loadWaitingForms = async () => {
    try {
      setLoading(true);
      console.log('🔄 Début du chargement des formulaires en attente...');

      // 1. Récupérer les échantillons avec statut 'waiting_reading'
      console.log('📊 1. Récupération des échantillons...');
      const { data: samplesData, error: samplesError } = await supabase
        .from('samples')
        .select('form_id, report_title, brand, site, created_at, modified_at')
        .eq('status', 'waiting_reading')
        .not('form_id', 'is', null);

      if (samplesError) {
        console.error('❌ Erreur échantillons:', samplesError);
        
        // Utiliser des données de test en cas d'erreur
        console.log('🔄 Utilisation des données de test...');
        const testSamplesData = [
          {
            form_id: 'TEST-FORM-001',
            report_title: 'Contrôle microbiologique - Test 1',
            brand: 'Yaourt Bio',
            site: 'Usine Nord',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString()
          },
          {
            form_id: 'TEST-FORM-002',
            report_title: 'Contrôle microbiologique - Test 2',
            brand: 'Fromage Frais',
            site: 'Usine Sud',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString()
          }
        ];
        
        const testBacteriaData = [
          // Form 1
          {
            id: 'test-bacteria-1',
            form_id: 'TEST-FORM-001',
            bacteria_name: 'E. coli',
            bacteria_delay: '24h',
            reading_day: 'Lundi',
            status: 'pending',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            modified_at: new Date().toISOString()
          },
          {
            id: 'test-bacteria-2',
            form_id: 'TEST-FORM-001',
            bacteria_name: 'Salmonella',
            bacteria_delay: '48h',
            reading_day: 'Mardi',
            status: 'pending',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString()
          },
          // Form 2
          {
            id: 'test-bacteria-3',
            form_id: 'TEST-FORM-002',
            bacteria_name: 'Listeria',
            bacteria_delay: '72h',
            reading_day: 'Mercredi',
            status: 'pending',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString()
          }
        ];
        
        processFormsData(testSamplesData, testBacteriaData);
        return;
      }

      console.log('✅ Échantillons récupérés:', samplesData?.length || 0);

      // 2. Récupérer les sélections de bactéries
      console.log('🦠 2. Récupération des bactéries...');
      const { data: bacteriaData, error: bacteriaError } = await supabase
        .from('form_bacteria_selections')
        .select('*')
        .eq('status', 'pending');

      if (bacteriaError) {
        console.error('❌ Erreur bactéries:', bacteriaError);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les bactéries en attente",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('✅ Bactéries récupérées:', bacteriaData?.length || 0);

      // 3. Traitement des données
      processFormsData(samplesData || [], bacteriaData || []);

    } catch (error) {
      console.error('❌ Erreur générale:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du chargement des données",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Traitement des données pour créer la structure des formulaires
  const processFormsData = (samplesData: any[], bacteriaData: any[]) => {
    console.log('🔄 3. Traitement des données...');
    
    // Grouper les échantillons par form_id
    const formGroups = samplesData.reduce((acc, sample) => {
      const formId = sample.form_id;
      if (!acc[formId]) {
        acc[formId] = {
          form_id: formId,
          report_title: sample.report_title,
          brand: sample.brand,
          site: sample.site,
          created_at: sample.created_at,
          modified_at: sample.modified_at,
          sample_count: 0,
          bacteria_list: []
        };
      }
      acc[formId].sample_count++;
      return acc;
    }, {});

    // Ajouter les bactéries à chaque formulaire
    bacteriaData.forEach(bacteria => {
      const formId = bacteria.form_id;
      if (formGroups[formId]) {
        formGroups[formId].bacteria_list.push({
          id: bacteria.id,
          form_id: bacteria.form_id,
          bacteria_name: bacteria.bacteria_name,
          bacteria_delay: bacteria.bacteria_delay,
          reading_day: bacteria.reading_day,
          status: bacteria.status,
          created_at: bacteria.created_at,
          modified_at: bacteria.modified_at,
          reading_date: bacteria.reading_date
        });
      }
    });

    const processedForms = Object.values(formGroups).filter((form: any) => 
      form.bacteria_list.length > 0
    );

    console.log('✅ Formulaires traités:', processedForms.length);
    setWaitingForms(processedForms as WaitingForm[]);
    setDataLoaded(true);
    setLoading(false);
  };

  const forceReloadData = () => {
    setDataLoaded(false);
    loadWaitingForms();
  };

    const handleSelectBacteria = async (bacteria: BacteriaSelection) => {
    try {
      console.log('🦠 Sélection de la bactérie:', bacteria.bacteria_name);
      
      // Vérifier si la bactérie est accessible
      const createdDate = new Date(bacteria.created_at);
      const now = new Date();
      const delayHours = parseInt(bacteria.bacteria_delay.replace(/[^\d]/g, '')) || 24;
      const readingDate = new Date(createdDate.getTime() + delayHours * 60 * 60 * 1000);
      
      const isAccessible = readingDate <= now;
      const hoursLeft = Math.ceil((readingDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      let confirmMessage = '';
      if (isAccessible) {
        confirmMessage = `Cette bactérie est prête pour la lecture.\n\nBactérie: ${bacteria.bacteria_name}\nDélai: ${bacteria.bacteria_delay}\nJour de lecture: ${bacteria.reading_day}\n\nVoulez-vous commencer la lecture maintenant?`;
      } else {
        confirmMessage = `Cette bactérie n'est pas encore prête pour la lecture (${hoursLeft}h restantes).\n\nBactérie: ${bacteria.bacteria_name}\nDélai: ${bacteria.bacteria_delay}\nJour de lecture: ${bacteria.reading_day}\n\nVoulez-vous forcer l'accès et commencer la lecture maintenant?`;
      }
      
      if (window.confirm(confirmMessage)) {
        console.log('✅ Lecture confirmée, redirection vers la page de résultats');
        
        // Toast de confirmation
        toast({
          title: "Lecture démarrée",
          description: `La lecture de ${bacteria.bacteria_name} a commencé`,
          variant: "default",
        });

        // Rediriger directement vers la page de résultats de lecture avec les paramètres
        const searchParams = new URLSearchParams({
          bacteriaId: bacteria.id,
          bacteriaName: bacteria.bacteria_name,
          formId: bacteria.form_id,
          delay: bacteria.bacteria_delay,
          readingDay: bacteria.reading_day,
          forceAccess: (!isAccessible).toString()
        });

        navigate(`/saisie-resultats?${searchParams.toString()}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sélection de bactérie:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la sélection de la bactérie",
        variant: "destructive",
      });
    }
  };

  const getTotalPendingBacteria = () => {
    return waitingForms.reduce((total, form) => 
      total + form.bacteria_list.filter(b => b.status === 'pending').length, 0
    );
  };

  // Obtenir la liste unique des sites
  const getUniqueSites = () => {
    const sites = waitingForms.map(form => form.site);
    return [...new Set(sites)].sort();
  };

  // Filtrer les formulaires par site sélectionné
  const getFilteredForms = () => {
    if (selectedSite === 'all') {
      return waitingForms;
    }
    return waitingForms.filter(form => form.site === selectedSite);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header hideMenuItems={['Lectures en Attente', 'Historique', 'Formulaires', 'Administration']} />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Lectures en Attente</h1>
              <p className="text-blue-100 text-lg">
                Formulaires et bactéries prêts pour la lecture microbiologique
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
                <div className="text-3xl font-bold text-white">{getTotalPendingBacteria()}</div>
                <div className="text-blue-200 text-sm">Bactérie(s) en attente</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <Card className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold">Formulaires en attente</CardTitle>
                <CardDescription>
                  Liste des formulaires avec des bactéries en attente de lecture
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                {/* Filtre par site */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={selectedSite} onValueChange={setSelectedSite}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrer par site" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les sites</SelectItem>
                      {getUniqueSites().map((site) => (
                        <SelectItem key={site} value={site}>
                          {site}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={forceReloadData}
                  className="text-xs flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Actualiser
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-500">Chargement des formulaires...</p>
              </div>
            ) : waitingForms.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg bg-gray-50">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">Aucun formulaire en attente</h3>
                <p className="text-gray-500">Tous les formulaires ont été traités.</p>
              </div>
            ) : getFilteredForms().length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg bg-gray-50">
                <Filter className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">Aucun formulaire pour ce site</h3>
                <p className="text-gray-500">Aucun formulaire en attente pour le site sélectionné.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Affichage du nombre de formulaires filtrés */}
                {selectedSite !== 'all' && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Filtré par site: {selectedSite}
                      </span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {getFilteredForms().length} formulaire(s)
                    </Badge>
                  </div>
                )}
                {getFilteredForms().map((form) => (
                  <div key={form.form_id} className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {form.report_title || `Formulaire ${form.form_id.slice(-8)}`}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>Marque: {form.brand}</div>
                          <div>Site: {form.site}</div>
                          <div>Échantillons: {form.sample_count}</div>
                          <div>Créé le: {format(new Date(form.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</div>
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">
                        {form.bacteria_list.filter(b => b.status === 'pending').length} en attente
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Bactéries en attente:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {form.bacteria_list
                          .filter(bacteria => bacteria.status === 'pending')
                          .map((bacteria) => {
                            const displayStyle = getBacteriaDisplayStyle(bacteria);
                            return (
                              <Button
                                key={bacteria.id}
                                variant="outline"
                                size="sm"
                                className={`justify-start ${displayStyle.className}`}
                                onClick={() => handleSelectBacteria(bacteria)}
                              >
                                {displayStyle.icon}
                                <span className="ml-2">{bacteria.bacteria_name}</span>
                                <span className="ml-auto text-xs">
                                  {bacteria.bacteria_delay} - {bacteria.reading_day}
                                </span>
                              </Button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LecturesEnAttentePage;
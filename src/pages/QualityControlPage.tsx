import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CalendarIcon, 
  History, 
  BarChart3, 
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Beaker,
  Users,
  Building,
  Microscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';

const sites = [
  { id: 'R1', name: 'Laiterie Collet (R1)', color: 'bg-blue-50 border-blue-200' },
  { id: 'R2', name: 'Végétal Santé (R2)', color: 'bg-green-50 border-green-200' },
  { id: 'BAIKO', name: 'Laiterie Baiko', color: 'bg-purple-50 border-purple-200' },
];

interface DashboardStats {
  totalSamples: number;
  pendingAnalysis: number;
  awaitingReading: number;
  completedToday: number;
  overdueSamples: number;
}

const QualityControlPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [stats, setStats] = useState<DashboardStats>({
    totalSamples: 0,
    pendingAnalysis: 0,
    awaitingReading: 0,
    completedToday: 0,
    overdueSamples: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      const { data: samples, error } = await supabase
        .from('samples')
        .select('status, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des stats:', error);
        return;
      }

      const today = new Date().toDateString();

      const stats: DashboardStats = {
        totalSamples: samples?.length || 0,
        pendingAnalysis: samples?.filter(s => s.status === 'in_progress').length || 0,
        awaitingReading: samples?.filter(s => s.status === 'waiting_reading').length || 0,
        completedToday: samples?.filter(s => 
          s.status === 'completed' && 
          new Date(s.created_at).toDateString() === today
        ).length || 0,
        overdueSamples: samples?.filter(s => 
          s.status === 'draft' || s.status === 'pending'
        ).length || 0
      };

      setStats(stats);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedAnalysis = async () => {
    try {
      // Récupérer les analyses depuis Supabase au lieu du localStorage
      const { data: samples, error } = await supabase
        .from('samples')
        .select('*')
        .order('modified_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erreur lors de la récupération des analyses:', error);
        return;
      }

      if (samples && samples.length > 0) {
        // Grouper par formulaire
        const analysesByForm = samples.reduce((acc, sample) => {
          const formId = sample.form_id || sample.report_title || 'unknown';
          if (!acc[formId]) {
            acc[formId] = {
              formId,
              reportTitle: sample.report_title || 'Analyse sans titre',
              samples: [],
              status: sample.status,
              lastModified: sample.modified_at || sample.created_at,
              brand: sample.brand,
              site: sample.site
            };
          }
          acc[formId].samples.push(sample);
          return acc;
        }, {});

        const formsList = Object.values(analysesByForm);
        console.log('Analyses chargées depuis Supabase:', formsList.length);
      }
    } catch (error) {
      console.error('Erreur lors du chargement depuis Supabase:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (user?.role === 'coordinator') {
      navigate('/technical-info', {
        state: {
          selectedSite,
          analysisDate: date
        }
      });
    } else {
      // Plus de localStorage - navigation directe vers sample-entry
      navigate('/sample-entry', {
        state: {
          reportTitle: 'Nouveau rapport',
          samples: [],
          brand: '',
          selectedSite,
          analysisDate: date,
          isNew: true // Indiquer que c'est un nouveau formulaire
        }
      });
    }
  };

  const handleCreateNewForm = () => {
    // Plus de localStorage.clear() - navigation directe
    navigate('/technical-info', {
      state: {
        selectedSite: '',
        analysisDate: new Date(),
        isNew: true
      }
    });
  };

  const quickActions = user?.role === 'coordinator' 
    ? [
        {
          title: 'Mes Formulaires',
          description: 'Historique et suivi de mes demandes',
          icon: <History className="h-5 w-5" />,
          action: () => navigate('/forms-history'),
          color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
        }
      ]
    : [
        {
          title: 'Mes Formulaires',
          description: 'Historique et suivi des formulaires',
          icon: <History className="h-5 w-5" />,
          action: () => navigate('/forms-history'),
          color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
        },
        {
          title: 'Analyses en Cours',
          description: 'Voir les analyses en cours',
          icon: <Clock className="h-5 w-5" />,
          action: () => navigate('/analyses-en-cours'),
          color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
        },
        {
          title: 'Lectures en Attente',
          description: 'Formulaires prêts pour lecture',
          icon: <Microscope className="h-5 w-5" />,
          action: () => navigate('/lectures-en-attente'),
          color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
        }
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header hideMenuItems={['Lectures en Attente', 'Formulaires', 'Administration', 'Historique']} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header avec informations utilisateur */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Beaker className="h-8 w-8 text-blue-600" />
                Contrôle Qualité Microbiologique
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Connecté en tant que <span className="font-medium text-blue-600">{user?.role === 'coordinator' ? 'Demandeur' : 'Technicien'}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {stats.totalSamples} échantillons total
              </Badge>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-600">{loading ? '...' : stats.totalSamples}</div>
              <div className="text-sm text-gray-500">Total</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats.pendingAnalysis}</div>
              <div className="text-sm text-orange-600">En analyse</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Beaker className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{loading ? '...' : stats.awaitingReading}</div>
              <div className="text-sm text-blue-600">En attente lecture</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{loading ? '...' : stats.completedToday}</div>
              <div className="text-sm text-green-600">Terminés aujourd'hui</div>
            </CardContent>
          </Card>
        </div>

        <div className={user?.role === 'coordinator' ? 'grid grid-cols-1 lg:grid-cols-3 gap-8' : 'w-full'}>
          {/* Formulaire principal - seulement pour les demandeurs */}
          {user?.role === 'coordinator' && (
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Nouvelle Demande d'Analyse
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez le site et la date pour créer une nouvelle demande
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Site de production</Label>
                        <RadioGroup
                          value={selectedSite}
                          onValueChange={setSelectedSite}
                          className="grid grid-cols-1 gap-3"
                        >
                          {sites.map((site) => (
                            <div key={site.id} 
                                 className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                                   selectedSite === site.id ? site.color + ' border-opacity-100' : 'border-gray-200 hover:border-gray-300'
                                 }`}>
                              <RadioGroupItem value={site.id} id={`site-${site.id}`} />
                              <Label htmlFor={`site-${site.id}`} className="cursor-pointer font-medium flex-1">
                                {site.name}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-medium">Date d'analyse</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="lg"
                              className={cn(
                                "w-full justify-start text-left h-12",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-3 h-5 w-5" />
                              {date ? (
                                format(date, "d MMMM yyyy", { locale: fr })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={!selectedSite || !date}
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                    >
                      <Building className="w-5 h-5 mr-2" />
                      Créer la demande d'analyse
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions rapides et informations */}
          <div className={user?.role === 'coordinator' ? 'space-y-6' : 'w-full'}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Actions Rapides
                </CardTitle>
              </CardHeader>
              <CardContent className={user?.role === 'coordinator' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="lg"
                    className={`w-full justify-start h-auto p-6 ${action.color} transition-all duration-300 hover:scale-105`}
                    onClick={action.action}
                  >
                    <div className="flex items-start gap-3 text-left">
                      <div className="mt-1">{action.icon}</div>
                      <div>
                        <div className="font-semibold">{action.title}</div>
                        <div className="text-sm opacity-75 mt-1">{action.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Message d'aide selon le rôle */}
        <Card className={user?.role === 'coordinator' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${user?.role === 'coordinator' ? 'bg-blue-100' : 'bg-green-100'}`}>
                <Users className={`h-5 w-5 ${user?.role === 'coordinator' ? 'text-blue-600' : 'text-green-600'}`} />
              </div>
              <div>
                <h4 className={`font-semibold ${user?.role === 'coordinator' ? 'text-blue-900' : 'text-green-900'}`}>
                  Guide {user?.role === 'coordinator' ? 'Demandeur' : 'Technicien'}
                </h4>
                <p className={`text-sm mt-1 ${user?.role === 'coordinator' ? 'text-blue-700' : 'text-green-700'}`}>
                  {user?.role === 'coordinator' 
                    ? 'En tant que demandeur, vous pouvez créer de nouvelles demandes d\'analyse, consulter l\'historique de vos formulaires et accéder aux statistiques. Les techniciens se chargeront de l\'exécution des analyses.'
                    : 'En tant que technicien, vous pouvez effectuer les analyses, saisir les résultats des lectures microbiologiques et compléter les formulaires d\'analyse créés par les demandeurs.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default QualityControlPage;

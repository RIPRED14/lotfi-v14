import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trash2, AlertTriangle, Database, RefreshCw, 
  FileText, Users, Settings, Shield, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';

interface DatabaseStats {
  samples_count: number;
  bacteria_selections_count: number;
  forms_count: number;
  pending_readings: number;
  completed_readings: number;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DatabaseStats>({
    samples_count: 0,
    bacteria_selections_count: 0,
    forms_count: 0,
    pending_readings: 0,
    completed_readings: 0
  });

  // Vérifier les permissions d'accès
  useEffect(() => {
    if (!user || user.role !== 'coordinator') {
      toast({
        title: "Accès refusé",
        description: "Seuls les demandeurs peuvent accéder à cette page.",
        variant: "destructive"
      });
      navigate('/quality-control');
    }
  }, [user, navigate, toast]);

  // Charger les statistiques de la base de données
  const loadDatabaseStats = async () => {
    try {
      setLoading(true);

      // Compter les échantillons
      const { count: samplesCount } = await supabase
        .from('samples')
        .select('*', { count: 'exact', head: true });

      // Compter les sélections de bactéries
      const { count: bacteriaCount } = await supabase
        .from('form_bacteria_selections')
        .select('*', { count: 'exact', head: true });

      // Compter les formulaires uniques
      const { data: formsData } = await supabase
        .from('samples')
        .select('form_id')
        .not('form_id', 'is', null);

      const uniqueForms = new Set(formsData?.map(item => item.form_id) || []);

      // Compter les lectures en attente et terminées
      const { count: pendingCount } = await supabase
        .from('form_bacteria_selections')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress']);

      const { count: completedCount } = await supabase
        .from('form_bacteria_selections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      setStats({
        samples_count: samplesCount || 0,
        bacteria_selections_count: bacteriaCount || 0,
        forms_count: uniqueForms.size,
        pending_readings: pendingCount || 0,
        completed_readings: completedCount || 0
      });

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques de la base de données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'coordinator') {
      loadDatabaseStats();
    }
  }, [user]);

  // Fonction pour nettoyer complètement la base de données
  const handleCleanDatabase = async () => {
    try {
      setLoading(true);

      // Supprimer toutes les sélections de bactéries
      const { error: bacteriaError } = await supabase
        .from('form_bacteria_selections')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (bacteriaError) throw bacteriaError;

      // Supprimer tous les échantillons
      const { error: samplesError } = await supabase
        .from('samples')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (samplesError) throw samplesError;

      toast({
        title: "Base de données nettoyée",
        description: "Toutes les données ont été supprimées avec succès.",
        duration: 3000
      });

      // Recharger les statistiques
      await loadDatabaseStats();

    } catch (error) {
      console.error('Erreur lors du nettoyage de la base de données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de nettoyer la base de données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer seulement les échantillons de test
  const handleCleanTestData = async () => {
    try {
      setLoading(true);

      // Supprimer les sélections de bactéries de test
      const { error: bacteriaError } = await supabase
        .from('form_bacteria_selections')
        .delete()
        .like('form_id', 'test-form-%');

      if (bacteriaError) throw bacteriaError;

      // Supprimer les échantillons de test
      const { error: samplesError } = await supabase
        .from('samples')
        .delete()
        .like('form_id', 'test-form-%');

      if (samplesError) throw samplesError;

      toast({
        title: "Données de test supprimées",
        description: "Tous les formulaires de test ont été supprimés.",
        duration: 3000
      });

      // Recharger les statistiques
      await loadDatabaseStats();

    } catch (error) {
      console.error('Erreur lors de la suppression des données de test:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les données de test",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'coordinator') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Administration" 
        hideMenuItems={['Lectures en Attente', 'Historique', 'Formulaires', 'Administration']} 
      />

      <div className="bg-[#0d47a1] text-white py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Panneau d'Administration
            </h1>
          </div>
          <Badge className="bg-white text-[#0d47a1] font-semibold">
            Demandeur
          </Badge>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Statistiques de la base de données */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Échantillons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.samples_count}</div>
              <p className="text-xs text-muted-foreground">Total dans la BDD</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Formulaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.forms_count}</div>
              <p className="text-xs text-muted-foreground">Formulaires uniques</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Bactéries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bacteria_selections_count}</div>
              <p className="text-xs text-muted-foreground">Sélections totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Lectures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending_readings}</div>
              <p className="text-xs text-muted-foreground">En attente</p>
              <div className="text-sm text-green-600 mt-1">{stats.completed_readings} terminées</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions d'administration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Gestion des données
              </CardTitle>
              <CardDescription>
                Outils pour gérer et nettoyer les données de l'application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={loadDatabaseStats}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser les statistiques
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={loading}
                    className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer les données de test
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Supprimer les données de test
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action supprimera tous les formulaires commençant par "test-form-".
                      Les données de production ne seront pas affectées.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCleanTestData}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Supprimer les données de test
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={loading}
                    className="w-full"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Nettoyer toute la base de données
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Nettoyer complètement la base de données
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      ⚠️ <strong>ATTENTION :</strong> Cette action supprimera TOUTES les données de l'application :
                      <br />• {stats.samples_count} échantillons
                      <br />• {stats.bacteria_selections_count} sélections de bactéries
                      <br />• {stats.forms_count} formulaires
                      <br /><br />Cette action est irréversible !
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCleanDatabase}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Nettoyer la base de données
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Navigation rapide
              </CardTitle>
              <CardDescription>
                Accès rapide aux différentes sections de l'application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate('/sample-entry')}
                variant="outline"
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Saisie d'échantillons
              </Button>

              <Button
                onClick={() => navigate('/lectures-en-attente')}
                variant="outline"
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                Lectures en attente
              </Button>

              <Button
                onClick={() => navigate('/quality-control')}
                variant="outline"
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Contrôle qualité
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Informations système */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Utilisateur :</strong> {user?.name || 'Non défini'}
              </div>
              <div>
                <strong>Rôle :</strong> {user?.role || 'Non défini'}
              </div>
              <div>
                <strong>Dernière mise à jour :</strong> {new Date().toLocaleString('fr-FR')}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPage;

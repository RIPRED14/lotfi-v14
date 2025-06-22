import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FormEntry {
  id: string;
  title: string;
  date: string;
  brand: string;
  site: string;
  sample_count: number;
}

const FormsHistoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [forms, setForms] = useState<FormEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadFormsHistory();
  }, []);

  const loadFormsHistory = async () => {
    try {
      setLoading(true);
      
      // Récupérer uniquement les formulaires archivés (statut 'archived')
      const { data, error } = await supabase
        .from('samples')
        .select('*')
        .eq('status', 'archived')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Erreur lors du chargement de l'historique des formulaires:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique des formulaires",
          variant: "destructive",
          duration: 3000
        });
        setLoading(false);
        return;
      }
      
      // Logs de débogage pour examiner les données reçues
      console.log("Données reçues de Supabase:", data);
      console.log("Nombre total d'échantillons:", data?.length || 0);
      
      // Regrouper les données par formulaire
      const formMap = new Map<string, FormEntry>();
      
      if (data && data.length > 0) {
        // Afficher tous les form_id pour déboguer
        console.log("Tous les form_id trouvés:", data.map(item => item.form_id));
        
        // Premier passage pour collecter les informations de base - condition moins stricte
        data.forEach(item => {
          // Vérification moins stricte pour trouver tous les form_id
          if (item.form_id) {
            console.log("Traitement form_id:", item.form_id, "Type:", typeof item.form_id);
            
            if (!formMap.has(item.form_id)) {
              // Créer une nouvelle entrée de formulaire
              formMap.set(item.form_id, {
                id: item.form_id,
                title: item.report_title || `Formulaire du ${format(new Date(item.created_at), 'dd/MM/yyyy', { locale: fr })}`,
                date: item.created_at,
                brand: item.brand || '',
                site: item.site || '',
                sample_count: 1
              });
            } else {
              // Incrémenter le compteur d'échantillons pour un formulaire existant
              const form = formMap.get(item.form_id);
              if (form) {
                form.sample_count += 1;
              }
            }
          }
        });
      } else {
        console.log("Aucun échantillon trouvé dans la base de données");
      }
      
      // Convertir la Map en tableau pour l'affichage
      const formsList = Array.from(formMap.values());
      setForms(formsList);
      
      console.log("✅ Historique des formulaires chargé:", formsList.length);
      
      if (formsList.length === 0) {
        toast({
          title: "Information",
          description: "Aucun formulaire trouvé dans la base de données",
          duration: 3000
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique des formulaires:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement de l'historique",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour créer un échantillon de test avec un form_id
  const createTestSample = async () => {
    try {
      setLoading(true);
      
      // Créer un form_id unique
      const testFormId = `test-form-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Créer un échantillon de test
      const testSample = {
        number: '01',
        product: 'Produit Test',
        ready_time: '12:00',
        fabrication: new Date().toISOString().split('T')[0],
        dlc: new Date().toISOString().split('T')[0],
        smell: 'A',
        texture: 'A',
        taste: 'A',
        aspect: 'A',
        status: 'pending',
        brand: 'Test Brand',
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
        notification_sent: false,
        form_id: testFormId, // Ceci est important pour le test
        report_title: `Formulaire test ${new Date().toLocaleTimeString()}`
      };
      
      console.log("Création d'un échantillon de test avec form_id:", testFormId);
      
      // Insérer dans Supabase
      const { data, error } = await supabase
        .from('samples')
        .insert([testSample])
        .select();
        
      if (error) {
        console.error("Erreur lors de la création de l'échantillon de test:", error);
        toast({
          title: "Erreur",
          description: "Impossible de créer l'échantillon de test",
          variant: "destructive",
          duration: 3000
        });
      } else {
        console.log("Échantillon de test créé avec succès:", data);
        toast({
          title: "Succès",
          description: "Échantillon de test créé avec ID de formulaire: " + testFormId,
          duration: 5000
        });
        
        // Recharger la liste des formulaires
        await loadFormsHistory();
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'échantillon de test:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewForm = (formId: string) => {
    // Naviguer vers la page de visualisation des résultats avec l'ID du formulaire
    navigate(`/saisie-resultats?formId=${formId}&viewMode=archived&bacteriaName=Toutes&readingDay=Terminé`);
  };

  const getBrandName = (brand: string): string => {
    switch(brand) {
      case '1': return 'Grand Frais';
      case '2': return "L'Atelier Dessy";
      case '3': return 'BAIKO';
      default: return brand;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Historique des formulaires" 
        hideMenuItems={['Lectures en Attente', 'Historique', 'Formulaires', 'Administration']} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <Card className="bg-white rounded-lg shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">Historique des formulaires</CardTitle>
                <CardDescription>Tous les formulaires d'analyse créés</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/quality-control')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => loadFormsHistory()}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Rafraîchir
                </Button>
                <Button 
                  variant="outline"
                  onClick={createTestSample}
                  className="border-green-300 text-green-600 hover:bg-green-50"
                >
                  Créer test
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : forms.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead className="w-[300px]">Titre</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead>Marque</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead className="text-center">Échantillons</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forms.map((form) => (
                      <TableRow key={form.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{form.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(form.date), 'dd/MM/yyyy', { locale: fr })}
                            <Clock className="h-3 w-3 ml-2" />
                            {format(new Date(form.date), 'HH:mm', { locale: fr })}
                          </div>
                        </TableCell>
                        <TableCell>{getBrandName(form.brand)}</TableCell>
                        <TableCell>{form.site}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {form.sample_count}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleViewForm(form.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-10 text-muted-foreground">
                <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Clock className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun formulaire trouvé</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Vous n'avez pas encore créé de formulaires d'analyse ou ils ont tous été supprimés.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FormsHistoryPage; 
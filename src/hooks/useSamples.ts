import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sample, SupabaseSample } from '@/types/samples';

interface UseSamplesProps {
  savedSamples?: Sample[];
  brand?: string;
  isNewForm?: boolean; // Nouveau paramètre pour indiquer s'il s'agit d'un nouveau formulaire
}

// Clé pour le stockage local des échantillons
const LOCAL_STORAGE_KEY = 'lotfiv1_samples';

export const useSamples = ({ savedSamples = [], brand = '', isNewForm = false }: UseSamplesProps) => {
  const [samples, setSamples] = useState<Sample[]>(savedSamples);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState<{id: string, title: string, date: string}[]>([]);

  // Référence pour suivre si les données ont déjà été chargées
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Si c'est un nouveau formulaire, ne pas charger les anciens échantillons
    if (isNewForm) {
      console.log("✨ Nouveau formulaire, pas de chargement des anciens échantillons");
      setSamples([]);
      hasLoadedRef.current = true;
      return;
    }

    // Éviter les chargements multiples
    if (hasLoadedRef.current) {
      return;
    }

    // Si des savedSamples sont fournis, on les utilise directement
    if (savedSamples && savedSamples.length > 0) {
      setSamples(savedSamples);
      hasLoadedRef.current = true;
      return;
    }

    // Limiter les tentatives de connexion - ajouter un flag pour éviter les boucles
    let isMounted = true;

    // Chargement depuis Supabase
    const loadSamples = async () => {
      try {
        setLoading(true);

        // Charger depuis Supabase
        const { data, error } = await supabase
          .from('samples')
          .select('*')
          .eq('brand', brand)
          .order('created_at', { ascending: false });

        // Si le composant a été démonté pendant la requête, ne rien faire
        if (!isMounted) return;

        if (error) {
          // En cas d'erreur, afficher simplement l'erreur sans passer en mode hors ligne
          console.error('Error fetching samples from Supabase:', error);

            toast({
            title: "Erreur de connexion",
            description: "Impossible de récupérer les échantillons depuis la base de données. Veuillez réessayer.",
              variant: "destructive",
              duration: 5000
            });

          return;
        }

        if (data) {
          const mappedSamples: Sample[] = data.map(sample => {
            let status = sample.status;
            if (status === 'inProgress') {
              status = 'in_progress';
            }

            return {
              id: sample.id,
              number: sample.number || '',
              product: sample.product || '',
              readyTime: sample.ready_time || '',
              fabrication: sample.fabrication || '',
              dlc: sample.dlc || '',
              smell: sample.smell || '',
              texture: sample.texture || '',
              taste: sample.taste || '',
              aspect: sample.aspect || '',
              ph: sample.ph || '',
              enterobacteria: sample.enterobacteria || '',
              yeastMold: sample.yeast_mold || '',
              createdAt: sample.created_at || '',
              modifiedAt: sample.modified_at || '',
              modifiedBy: sample.modified_by || '',
              status: status as 'pending' | 'in_progress' | 'completed' | 'rejected',
              assignedTo: sample.assigned_to || '',
              reportTitle: sample.report_title || '',
              brand: sample.brand || '',
              site: sample.site || 'R1',
              formId: sample.form_id || ''
            };
          });

          setSamples(mappedSamples);
        }

        // Marquer que les données ont été chargées
        hasLoadedRef.current = true;
      } catch (error) {
        if (!isMounted) return;

        console.error('Exception fetching samples:', error);

          toast({
            title: "Erreur",
          description: "Impossible de récupérer les échantillons. Veuillez réessayer.",
            variant: "destructive",
            duration: 5000
          });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

        loadSamples();

    return () => {
      isMounted = false;
    };
  }, [brand, isNewForm]); // Ajout de isNewForm comme dépendance

  // Fonction pour ajouter un échantillon avec un produit par défaut
  const addSample = async (defaultProduct?: string, additionalData?: Record<string, any>) => {
    setLoading(true);

    try {
      // Générer un numéro d'échantillon automatique
      const sampleNumber = `${samples.length + 1}`.padStart(2, '0');

      // Utiliser la marque choisie comme produit par défaut
      const selectedBrandName = additionalData?.brandName || '';
      const product = defaultProduct || selectedBrandName || additionalData?.brand || brand || '';

      console.log('Produit sélectionné:', { defaultProduct, selectedBrandName, product });

      // Générer ou récupérer l'ID du formulaire
      // Si additionalData contient un formId, l'utiliser, sinon en générer un nouveau
      const formId = additionalData?.formId || `form-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substring(2, 9)}`;
      console.log('ID du formulaire utilisé:', formId);

      // Version simplifiée qui correspond au format exact de la table samples
      const sampleData = {
        number: sampleNumber,
        product: product,
        ready_time: additionalData?.readyTime || '00:00',
        fabrication: additionalData?.fabrication || new Date().toISOString().split('T')[0],
        dlc: additionalData?.dlc || new Date().toISOString().split('T')[0],
        smell: additionalData?.smell || 'N',
        texture: additionalData?.texture || 'N',
        taste: additionalData?.taste || 'N',
        aspect: additionalData?.aspect || 'N',
        status: 'pending',
        brand: additionalData?.brand || brand || 'default',
        site: additionalData?.site || 'R1',
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
        notification_sent: false,
        form_id: formId, // Ajouter l'ID du formulaire à chaque échantillon
        report_title: additionalData?.reportTitle || '' // Inclure le titre du rapport s'il est fourni
      };

      console.log('Données à insérer:', sampleData);

      // Enregistrer directement dans Supabase avec une requête simplifiée
      const { data, error } = await supabase
        .from('samples')
        .insert([sampleData])
        .select('*');

      if (error) {
        console.error("Erreur lors de l'ajout d'échantillon dans Supabase:", error);
        console.error("❌ Échec de l'ajout d'échantillon", error.message, error.details);

        toast({
          title: "Erreur de connexion",
          description: `Impossible d'enregistrer l'échantillon: ${error.message}`,
          variant: "destructive",
          duration: 5000
        });

        setLoading(false);
        return null;
      }

      if (data && data.length > 0) {
        // Convertir l'échantillon de Supabase au format local
        const newSample: Sample = {
          id: data[0].id,
          number: data[0].number || '',
          product: data[0].product || '',
          readyTime: data[0].ready_time || '',
          fabrication: data[0].fabrication || '',
          dlc: data[0].dlc || '',
          smell: data[0].smell || '',
          texture: data[0].texture || '',
          taste: data[0].taste || '',
          aspect: data[0].aspect || '',
          ph: data[0].ph || '',
          enterobacteria: data[0].enterobacteria || '',
          yeastMold: data[0].yeast_mold || '',
          createdAt: data[0].created_at || '',
          modifiedAt: data[0].modified_at || '',
          modifiedBy: data[0].modified_by || '',
          status: data[0].status as 'pending' | 'in_progress' | 'completed' | 'rejected',
          assignedTo: data[0].assigned_to || '',
          reportTitle: data[0].report_title || '',
          brand: data[0].brand || '',
          site: data[0].site || 'R1', // Utiliser R1 comme valeur par défaut si vide
          formId: data[0].form_id || formId, // Stocker l'ID du formulaire dans l'échantillon local
          isLocalOnly: false
        };

        // Mettre à jour l'état local avec le nouvel échantillon
        const updatedSamples = [...samples, newSample];
        setSamples(updatedSamples);

        // Renvoyer l'ID du formulaire avec l'ID de l'échantillon
        const result = {
          sampleId: data[0].id,
          formId: formId
        };

        // Afficher un toast pour confirmer l'ajout à Supabase
      toast({
        title: "Échantillon ajouté",
          description: "Échantillon enregistré dans la base de données.",
        variant: "default",
          duration: 3000
        });

        setLoading(false);
        console.log("✅ Échantillon ajouté avec succès:", data[0]);
        return result;
      } else {
        console.error("❌ Pas de données retournées après l'insertion");
        toast({
          title: "Erreur",
          description: "L'échantillon a été créé mais n'a pas pu être récupéré",
          variant: "destructive",
          duration: 3000
        });
      }

      setLoading(false);
      return null;
    } catch (error) {
      console.error("Erreur générale lors de l'ajout d'échantillon:", error);

      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'échantillon",
        variant: "destructive",
        duration: 3000
      });

      setLoading(false);
      return null;
    }
  };

  // Fonction pour supprimer un échantillon
  const deleteSample = async (sampleId: string | number) => {
    try {
      console.log('Suppression de l\'échantillon dans le hook useSamples:', sampleId);

      // Supprimer directement dans Supabase
      const { error } = await supabase
        .from('samples')
        .delete()
        .eq('id', sampleId);

      if (error) {
        console.error("Erreur lors de la suppression de l'échantillon dans Supabase:", error);

        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'échantillon dans la base de données.",
          variant: "destructive",
          duration: 3000
        });

        return false;
      }

      // Filtrer pour enlever l'échantillon de la liste locale
      const updatedSamples = samples.filter(s => s.id !== sampleId);

      // Mettre à jour l'état
      setSamples(updatedSamples);

      // Notification de succès
      toast({
        title: "Échantillon supprimé",
        description: "L'échantillon a été supprimé avec succès de la base de données.",
        variant: "default",
        duration: 3000
      });

      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'échantillon:", error);

      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'échantillon.",
        variant: "destructive",
        duration: 3000
      });

      return false;
    }
  };

  // Fonction pour valider les objets de mise à jour et éviter les clés numériques
  const validateUpdateObject = (updates: Record<string, any>): Record<string, any> => {
    const cleanedUpdates: Record<string, any> = {};
    
    // Vérifier si l'objet updates lui-même a des clés numériques (cas principal du problème)
    if (typeof updates === 'object' && updates !== null) {
      const hasNumericKeys = Object.keys(updates).some(k => k.match(/^\d+$/));
      if (hasNumericKeys) {
        console.warn(`⚠️ Objet principal avec clés numériques détecté, conversion en chaîne...`);
        // Si l'objet a des clés numériques, c'est probablement une chaîne convertie incorrectement
        // Essayer de reconstruire la chaîne originale
        const reconstructedString = Object.keys(updates)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(key => updates[key])
          .join('');
        
        console.warn(`⚠️ Chaîne reconstruite: "${reconstructedString}"`);
        // Retourner un objet vide pour éviter l'erreur, avec un log d'erreur
        console.error(`❌ Tentative de mise à jour avec un objet invalide. Valeur détectée: "${reconstructedString}"`);
        return {};
      }
    }
    
    for (const [key, value] of Object.entries(updates)) {
      // Vérifier si la clé est numérique
      if (key.match(/^\d+$/)) {
        console.warn(`⚠️ Clé numérique détectée et ignorée: "${key}"`);
        continue;
      }
      
      // Vérifier si la valeur est un objet avec des clés numériques
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const hasNumericKeys = Object.keys(value).some(k => k.match(/^\d+$/));
        if (hasNumericKeys) {
          console.warn(`⚠️ Objet avec clés numériques détecté dans "${key}", nettoyage...`);
          const cleanedObject: Record<string, any> = {};
          Object.keys(value).forEach(k => {
            const newKey = k.match(/^\d+$/) ? `item_${k}` : k;
            cleanedObject[newKey] = value[k];
          });
          cleanedUpdates[key] = cleanedObject;
        } else {
          cleanedUpdates[key] = value;
        }
      } else {
        cleanedUpdates[key] = value;
      }
    }
    
    return cleanedUpdates;
  };

  // Fonction pour mettre à jour un échantillon
  const updateSample = async (sampleId: string, updates: Partial<Sample>) => {
    try {
      // Valider l'ID de l'échantillon
      if (!sampleId || sampleId === 'undefined' || sampleId === 'null') {
        console.error("ID d'échantillon invalide:", sampleId);
        toast({
          title: "Erreur",
          description: "ID d'échantillon invalide",
          variant: "destructive",
          duration: 3000
        });
        return false;
      }

      // Valider et nettoyer l'objet de mise à jour
      const validatedUpdates = validateUpdateObject(updates as Record<string, any>);

      // Convertir les noms de champs de camelCase vers snake_case pour Supabase
      const supabaseUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(validatedUpdates)) {
        // Convertir les noms de propriétés du format local vers Supabase
        if (key === 'readyTime') supabaseUpdates['ready_time'] = value;
        else if (key === 'yeastMold') supabaseUpdates['yeast_mold'] = value;
        else if (key === 'createdAt') supabaseUpdates['created_at'] = value;
        else if (key === 'modifiedAt') supabaseUpdates['modified_at'] = value;
        else if (key === 'modifiedBy') supabaseUpdates['modified_by'] = value;
        else if (key === 'assignedTo') supabaseUpdates['assigned_to'] = value;
        else if (key === 'reportTitle') supabaseUpdates['report_title'] = value;
        else if (key === 'formId') supabaseUpdates['form_id'] = value;
        else supabaseUpdates[key] = value;
      }

      // Toujours mettre à jour modified_at
      supabaseUpdates['modified_at'] = new Date().toISOString();

      console.log(`🔄 Mise à jour échantillon ${sampleId}:`, supabaseUpdates);

      // Mettre à jour dans Supabase
      const { data, error } = await supabase
        .from('samples')
        .update(supabaseUpdates)
        .eq('id', sampleId)
        .select();

      if (error) {
        console.error("Erreur lors de la mise à jour de l'échantillon dans Supabase:", error);
        console.error("Données envoyées:", supabaseUpdates);
        console.error("ID utilisé:", sampleId);

        toast({
          title: "Erreur",
          description: `Impossible de mettre à jour l'échantillon: ${error.message}`,
          variant: "destructive",
          duration: 3000
        });

        return false;
      }

      // Vérifier que la mise à jour a bien eu lieu
      if (!data || data.length === 0) {
        console.warn("Aucune ligne mise à jour pour l'ID:", sampleId);
        toast({
          title: "Attention",
          description: "Aucun échantillon trouvé avec cet ID",
          variant: "destructive",
          duration: 3000
        });
        return false;
      }

      // Mettre à jour l'échantillon dans la liste locale
      const updatedSamples = samples.map(s =>
        s.id === sampleId ? { ...s, ...validatedUpdates, modifiedAt: new Date().toISOString() } : s
      );

      setSamples(updatedSamples);
      console.log(`✅ Échantillon ${sampleId} mis à jour avec succès`);

      return true;
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Erreur technique lors de la mise à jour",
        variant: "destructive",
        duration: 3000
      });
      return false;
    }
  };

  // Fonction wrapper pour gérer les deux signatures d'updateSample
  const updateSampleField = async (sampleId: string, field: keyof Sample | Partial<Sample>, value?: string) => {
    // Si le deuxième paramètre est un objet, utiliser la signature normale
    if (typeof field === 'object' && field !== null) {
      return updateSample(sampleId, field);
    }
    
    // Si c'est une chaîne, créer un objet avec le champ et la valeur
    if (typeof field === 'string' && value !== undefined) {
      return updateSample(sampleId, { [field]: value });
    }
    
    console.error("Signature invalide pour updateSampleField:", { sampleId, field, value });
    return false;
  };

  // Fonction pour basculer la conformité d'un champ
  const toggleConformity = async (sampleId: string, field: string, value: any) => {
    try {
      // Valider l'ID de l'échantillon
      if (!sampleId || sampleId === 'undefined' || sampleId === 'null') {
        console.error("ID d'échantillon invalide pour conformité:", sampleId);
        toast({
          title: "Erreur",
          description: "ID d'échantillon invalide",
          variant: "destructive",
          duration: 3000
        });
        return false;
      }

      console.log(`🔄 toggleConformity: ${sampleId}, ${field}, ${value}`);

      // Convertir le nom de champ de camelCase vers snake_case pour Supabase
      let supabaseField = field;
      if (field === 'readyTime') supabaseField = 'ready_time';
      else if (field === 'yeastMold') supabaseField = 'yeast_mold';
      else if (field === 'createdAt') supabaseField = 'created_at';
      else if (field === 'modifiedAt') supabaseField = 'modified_at';
      else if (field === 'modifiedBy') supabaseField = 'modified_by';
      else if (field === 'assignedTo') supabaseField = 'assigned_to';
      else if (field === 'reportTitle') supabaseField = 'report_title';
      else if (field === 'formId') supabaseField = 'form_id';

      console.log(`🔄 Conversion champ: ${field} → ${supabaseField}`);

      // Mettre à jour dans Supabase avec le nom de champ converti
      const { data, error } = await supabase
        .from('samples')
        .update({
          [supabaseField]: value,
          modified_at: new Date().toISOString()
        })
        .eq('id', sampleId)
        .select();

      if (error) {
        console.error("Erreur lors du changement de conformité dans Supabase:", error);
        console.error("Champ:", supabaseField, "Valeur:", value, "ID:", sampleId);

        toast({
          title: "Erreur",
          description: `Impossible de mettre à jour la conformité: ${error.message}`,
          variant: "destructive",
          duration: 3000
        });

        return false;
      }

      // Vérifier que la mise à jour a bien eu lieu
      if (!data || data.length === 0) {
        console.warn("Aucune ligne mise à jour pour la conformité, ID:", sampleId);
        return false;
      }

      // Mettre à jour l'état local également (utiliser le nom camelCase pour l'état local)
      const updatedSamples = samples.map(s => {
        if (s.id === sampleId) {
          console.log(`✅ Mise à jour locale: ${field} = ${value}`);
          // @ts-ignore: Propriété dynamique
          return { ...s, [field]: value, modifiedAt: new Date().toISOString() };
        }
        return s;
      });

      setSamples(updatedSamples);

      toast({
        title: "Conformité mise à jour",
        description: `${field} mis à jour vers ${value}`,
        duration: 2000
      });

      return true;
    } catch (error) {
      console.error("Erreur toggle conformité:", error);
      toast({
        title: "Erreur",
        description: "Erreur technique lors du changement de conformité",
        variant: "destructive",
        duration: 3000
      });
      return false;
    }
  };

  // Fonction pour valider les échantillons
  const validateSamples = () => {
    // Validation simple
    return samples.length > 0;
  };

  // Fonction pour ajouter un historique de changement
  const addChangeHistory = async (historyData: any) => {
    // Implémenter l'ajout d'historique à Supabase
    console.log("Historique à ajouter dans Supabase:", historyData);
    return true;
  };

  // Fonction pour envoyer au technicien
  const sendToTechnician = async (selectedSampleIds?: string[]) => {
    if (!selectedSampleIds || selectedSampleIds.length === 0) return false;

    try {
      // Mise à jour du statut et de l'assignation dans Supabase
      const { error } = await supabase
        .from('samples')
        .update({
          status: 'in_progress',
          modified_at: new Date().toISOString()
        })
        .in('id', selectedSampleIds);

      if (error) {
        console.error("Erreur lors de l'envoi au technicien dans Supabase:", error);

    toast({
          title: "Erreur",
          description: "Impossible d'envoyer les échantillons au technicien.",
      variant: "destructive",
          duration: 3000
        });

        return false;
      }

      // Mettre à jour l'état local
      const updatedSamples = samples.map(s => {
        if (selectedSampleIds.includes(s.id)) {
          return { ...s, status: 'in_progress', modifiedAt: new Date().toISOString() };
        }
        return s;
      });

      setSamples(updatedSamples);

      toast({
        title: "Échantillons envoyés",
        description: "Les échantillons ont été envoyés au technicien avec succès.",
        variant: "default",
        duration: 3000
      });

      return true;
    } catch (error) {
      console.error("Erreur lors de l'envoi au technicien:", error);
    return false;
    }
  };

  // Fonction pour récupérer tous les formulaires distincts
  const loadForms = async () => {
    try {
      setLoading(true);

      // Requête simplifiée sans le filtre problématique
      const { data, error } = await supabase
        .from('samples')
        .select('form_id, report_title, created_at, brand')
        .eq('brand', brand)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur lors du chargement des formulaires:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des formulaires",
          variant: "destructive",
          duration: 3000
        });
        return;
      }

      // Créer une Map pour dédupliquer les formulaires par form_id
      const formsMap = new Map();

      if (data) {
        data.forEach(item => {
          // Filtrer les form_id nuls ou vides côté client
          if (item.form_id &&
              typeof item.form_id === 'string' &&
              item.form_id.trim() !== '' &&
              item.form_id !== 'null') {

            if (!formsMap.has(item.form_id)) {
              formsMap.set(item.form_id, {
                id: item.form_id,
                title: item.report_title || `Formulaire ${new Date(item.created_at).toLocaleDateString()}`,
                date: item.created_at
              });
            }
          }
        });
      }

      // Convertir la Map en tableau pour l'état
      const formsList = Array.from(formsMap.values());
      setForms(formsList);

      console.log("✅ Formulaires chargés:", formsList.length);
    } catch (error) {
      console.error("Erreur lors du chargement des formulaires:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les échantillons d'un formulaire spécifique
  const loadSamplesByFormId = async (formId: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('samples')
        .select('*')
        .eq('form_id', formId)
        .order('number', { ascending: true });

      if (error) {
        console.error("Erreur lors du chargement des échantillons du formulaire:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les échantillons du formulaire",
          variant: "destructive",
          duration: 3000
        });
        return;
      }

      if (data) {
        const mappedSamples: Sample[] = data.map(sample => {
          let status = sample.status;
          if (status === 'inProgress') {
            status = 'in_progress';
          }

          return {
            id: sample.id,
            number: sample.number || '',
            product: sample.product || '',
            readyTime: sample.ready_time || '',
            fabrication: sample.fabrication || '',
            dlc: sample.dlc || '',
            smell: sample.smell || '',
            texture: sample.texture || '',
            taste: sample.taste || '',
            aspect: sample.aspect || '',
            ph: sample.ph || '',
            enterobacteria: sample.enterobacteria || '',
            yeastMold: sample.yeast_mold || '',
            createdAt: sample.created_at || '',
            modifiedAt: sample.modified_at || '',
            modifiedBy: sample.modified_by || '',
            status: status as 'pending' | 'in_progress' | 'completed' | 'rejected',
            assignedTo: sample.assigned_to || '',
            reportTitle: sample.report_title || '',
            brand: sample.brand || '',
            site: sample.site || '',
            formId: sample.form_id || ''
          };
        });

        setSamples(mappedSamples);
        console.log(`✅ ${mappedSamples.length} échantillons chargés pour le formulaire ${formId}`);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des échantillons par formulaire:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    samples,
    forms,
    loading,
    addSample,
    updateSample,
    updateSampleField,
    toggleConformity,
    validateSamples,
    addChangeHistory,
    sendToTechnician,
    deleteSample,
    loadForms,
    loadSamplesByFormId
  };
};
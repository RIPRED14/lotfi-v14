import { useState, useEffect, useRef } from 'react';

// Clé pour le localStorage
const STORAGE_KEY = 'lotfiv2-bacteria-selection';

// Fonction pour lire le localStorage
const getStoredSelection = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.warn('Erreur lecture localStorage bacteria selection:', error);
  }
  return [];
};

// Fonction pour sauvegarder dans le localStorage
const saveToStorage = (selection: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    console.log('💾 Bacteria selection sauvegardée:', selection);
  } catch (error) {
    console.warn('Erreur sauvegarde localStorage bacteria selection:', error);
  }
};

export function useBacteriaSelection() {
  const [selectedBacteria, setSelectedBacteria] = useState<string[]>([]);
  
  // Références pour éviter les boucles infinies
  const isLoadingFromDB = useRef(false);
  const lastSyncedData = useRef<string[]>([]);
  const isInitialized = useRef(false);

  // Charger depuis localStorage au démarrage (UNE SEULE FOIS)
  useEffect(() => {
    if (!isInitialized.current) {
      const stored = getStoredSelection();
      if (stored.length > 0) {
        console.log('📂 Chargement bacteria selection depuis localStorage:', stored);
        setSelectedBacteria(stored);
        lastSyncedData.current = [...stored];
      }
      isInitialized.current = true;
    }
  }, []);

  // Sauvegarder dans localStorage quand la sélection change (SAUF si chargement depuis DB)
  useEffect(() => {
    if (isInitialized.current && !isLoadingFromDB.current && selectedBacteria.length >= 0) {
      // Vérifier si les données ont vraiment changé
      const currentDataStr = JSON.stringify([...selectedBacteria].sort());
      const lastSyncedStr = JSON.stringify([...lastSyncedData.current].sort());
      
      if (currentDataStr !== lastSyncedStr) {
        saveToStorage(selectedBacteria);
        lastSyncedData.current = [...selectedBacteria];
      }
    }
  }, [selectedBacteria]);

  const toggleBacteria = (id: string) => {
    if (isLoadingFromDB.current) return; // Éviter les modifications pendant le chargement DB
    
    setSelectedBacteria(prev => {
      const newSelection = prev.includes(id) 
        ? prev.filter(b => b !== id)
        : [...prev, id];
      console.log('🦠 Toggle bacteria:', id, 'New selection:', newSelection);
      return newSelection;
    });
  };

  const addBacteria = (id: string) => {
    if (isLoadingFromDB.current) return;
    
    setSelectedBacteria(prev => {
      if (!prev.includes(id)) {
        const newSelection = [...prev, id];
        console.log('🦠 Add bacteria:', id, 'New selection:', newSelection);
        return newSelection;
      }
      return prev;
    });
  };

  const removeBacteria = (id: string) => {
    if (isLoadingFromDB.current) return;
    
    setSelectedBacteria(prev => {
      const newSelection = prev.filter(b => b !== id);
      console.log('🦠 Remove bacteria:', id, 'New selection:', newSelection);
      return newSelection;
    });
  };

  const resetToDefaults = () => {
    isLoadingFromDB.current = false;
    setSelectedBacteria([]);
    localStorage.removeItem(STORAGE_KEY);
    lastSyncedData.current = [];
    console.log('🦠 Reset bacteria selection');
  };

  // Fonction pour définir une sélection complète
  const setBacteriaSelection = (bacteria: string[]) => {
    if (isLoadingFromDB.current) return;
    
    setSelectedBacteria(bacteria);
    console.log('🦠 Set bacteria selection:', bacteria);
  };

  // Fonction pour synchroniser avec la base de données (version améliorée)
  const syncBacteriaSelection = (bacteriaFromDB: string[]) => {
    console.log('🔄 Synchronisation avec la base:', bacteriaFromDB);
    
    // Vérifier si les données ont vraiment changé
    const currentDataStr = JSON.stringify([...selectedBacteria].sort());
    const newDataStr = JSON.stringify([...bacteriaFromDB].sort());
    
    if (currentDataStr === newDataStr) {
      console.log('✅ Données identiques, pas de synchronisation nécessaire');
      return;
    }
    
    // Marquer qu'on charge depuis la DB pour éviter la sauvegarde localStorage
    isLoadingFromDB.current = true;
    
    // Mettre à jour l'état
    setSelectedBacteria(bacteriaFromDB);
    lastSyncedData.current = [...bacteriaFromDB];
    
    // Sauvegarder dans localStorage après un délai et démarquer le chargement
    setTimeout(() => {
      saveToStorage(bacteriaFromDB);
      isLoadingFromDB.current = false;
      console.log('✅ Synchronisation terminée et sauvegardée');
    }, 200); // Augmenter le délai pour éviter les conflits
  };

  // Fonction pour vérifier si les données sont synchronisées
  const isDataSynced = () => {
    const currentDataStr = JSON.stringify([...selectedBacteria].sort());
    const lastSyncedStr = JSON.stringify([...lastSyncedData.current].sort());
    return currentDataStr === lastSyncedStr;
  };

  return {
    selectedBacteria,
    toggleBacteria,
    addBacteria,
    removeBacteria,
    resetToDefaults,
    setBacteriaSelection,
    syncBacteriaSelection,
    isDataSynced,
    isLoadingFromDB: isLoadingFromDB.current
  };
} 
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Liste complète des marques et leurs produits par site
const siteProducts = {
  'R1': [
    { id: 'fromage_pasteurises', name: 'Fromage pasteurises (FP)', products: [] },
    { id: 'lait', name: 'LAIT', products: [] },
    { id: 'gyma_0', name: 'GYMA 0%', products: [] },
    { id: 'grand_frais', name: 'Grand Frais', products: [] },
    { id: 'aliments_sante', name: 'Aliments Sante (AS)', products: [] },
    { id: 'creme_dessert_collet', name: 'Créme Dessert Collet', products: [] }
  ],
  'R2': [
    { id: 'tcc', name: 'TCC', products: [] },
    { id: 'abbott_kinney', name: 'Abbott Kinney', products: [] },
    { id: 'dessy', name: 'Dessy', products: [] },
    { id: 'amorcage_debut_prod', name: 'Amorçage début prod', products: [] },
    { id: 'yoplait', name: 'Yoplait', products: [] },
    { id: 'milsani', name: 'Milsani', products: [] },
    { id: 'envia', name: 'Envia', products: [] },
    { id: 'heaven', name: 'Heaven', products: [] }
  ],
  'BAIKO': [
    { id: 'yaourts', name: 'Yaourts', products: [] },
    { id: 'prepa_fruit', name: 'Prépa fruit', products: [] }
  ]
};

interface TechnicalInfoProps {
  selectedSite?: string;
  analysisDate?: Date;
}

const TechnicalInfoPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSite, analysisDate } = (location.state as TechnicalInfoProps) || {};

  const [brand, setBrand] = useState<string>('');
  const [reportTitle, setReportTitle] = useState<string>('');
  const [availableBrands, setAvailableBrands] = useState<Array<{id: string, name: string, products?: string[]}>>([]);
  
  useEffect(() => {
    // Si un site est sélectionné, filtrer les marques disponibles
    if (selectedSite && siteProducts[selectedSite]) {
      setAvailableBrands(siteProducts[selectedSite]);
      
      // Si une seule marque est disponible, la sélectionner automatiquement
      if (siteProducts[selectedSite].length === 1) {
        setBrand(siteProducts[selectedSite][0].id);
        setReportTitle(`Formulaire contrôle microbiologique – ${siteProducts[selectedSite][0].name}`);
      }
    } else {
      setAvailableBrands([]);
      setBrand('');
      setReportTitle('');
    }
  }, [selectedSite]);

  // Mettre à jour le titre du rapport quand la marque change
  useEffect(() => {
    if (brand) {
      const selectedBrandInfo = availableBrands.find(b => b.id === brand);
      if (selectedBrandInfo) {
        setReportTitle(`Formulaire contrôle microbiologique – ${selectedBrandInfo.name}`);
      }
    }
  }, [brand, availableBrands]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand) {
      toast({
        title: "Champs requis",
        description: "Veuillez sélectionner une marque.",
        variant: "destructive"
      });
      return;
    }

    // Trouver la marque sélectionnée pour accéder à ses produits
    const selectedBrandInfo = availableBrands.find(b => b.id === brand);
    const products = selectedBrandInfo?.products || [];
    const brandName = selectedBrandInfo?.name || '';

    navigate('/sample-entry', {
      state: {
        ...location.state,
        brand,
        brandName,
        reportTitle,
        site: selectedSite,
        sampleDate: analysisDate ? analysisDate.toLocaleDateString() : '',
        reference: `REF-${selectedSite}-${Date.now().toString().substring(8)}`,
        GF_PRODUCTS: products, // Transmettre les produits disponibles pour cette marque
        isNew: true           // Indiquer qu'il s'agit d'un nouveau formulaire
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[#0091CA] text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-semibold">Contrôle Qualité Microbiologique</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-medium">Informations Techniques</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site">Site sélectionné</Label>
                <Input 
                  id="site" 
                  value={selectedSite ? sites.find(s => s.id === selectedSite)?.name || selectedSite : ''} 
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand">Produit</Label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {availableBrands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableBrands.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    Aucun produit disponible pour ce site.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reportTitle">Titre du rapport</Label>
                <Input 
                  id="reportTitle" 
                  value={reportTitle} 
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Le titre sera généré automatiquement"
                  className="border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/quality-control')}
              >
                Retour
              </Button>
              
              <Button 
                type="submit" 
                className="bg-[#0091CA] hover:bg-[#007AA8]"
                disabled={!brand}
              >
                <Check className="w-4 h-4 mr-2" />
                Valider
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

// Liste des sites pour affichage
const sites = [
  { id: 'R1', name: 'Laiterie Collet (R1)' },
  { id: 'R2', name: 'Végétal Santé (R2)' },
  { id: 'BAIKO', name: 'Laiterie Baiko' },
];

export default TechnicalInfoPage;

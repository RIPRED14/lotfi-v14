import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell } from '@/components/ui/table';
import { Sample } from '@/types/samples';
import { CalendarIcon } from 'lucide-react';
import EditableCell from '@/components/EditableCell';

interface CoordinatorFieldsProps {
  sample: Sample;
  isGrandFrais: boolean;
  GF_PRODUCTS: string[];
  updateSample: (id: string, updates: Partial<Sample>) => boolean;
  isCoordinator: boolean;
  isLocked: boolean;
}

export const CoordinatorFields: React.FC<CoordinatorFieldsProps> = ({
  sample,
  isGrandFrais,
  GF_PRODUCTS,
  updateSample,
  isCoordinator,
  isLocked,
}) => {
  const [product, setProduct] = useState(sample.product || '');
  const [fabrication, setFabrication] = useState(sample.fabrication || '');
  const [dlc, setDlc] = useState(sample.dlc || '');
  
  useEffect(() => {
    setProduct(sample.product || '');
    setFabrication(sample.fabrication || '');
    setDlc(sample.dlc || '');
  }, [sample.product, sample.fabrication, sample.dlc]);

  const handleProductChange = (value: string) => {
    setProduct(value);
    updateSample(sample.id.toString(), { product: value });
  };

  const handleFabricationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFabrication = e.target.value;
    setFabrication(newFabrication);
    updateSample(sample.id.toString(), { fabrication: newFabrication });
  };
  
  const handleDlcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDlc = e.target.value;
    setDlc(newDlc);
    updateSample(sample.id.toString(), { dlc: newDlc });
  };

  const handleInputChange = (field: keyof Sample, value: string) => {
    updateSample(sample.id.toString(), { [field]: value });
  };

  // Fonction pour formater la date au format jj-mm-aaaa
  const formatDateForDisplay = (isoDate: string) => {
    if (!isoDate) return '';
    
    try {
      // Si la date est déjà au format jj-mm-aaaa, on la renvoie telle quelle
      if (/^\d{2}-\d{2}-\d{4}$/.test(isoDate)) return isoDate;
      
      // Conversion de aaaa-mm-jj à jj-mm-aaaa
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return isoDate;
    } catch (e) {
      return isoDate;
    }
  };

  // Fonction pour convertir jj-mm-aaaa en aaaa-mm-jj (format ISO)
  const formatDateForStorage = (displayDate: string) => {
    if (!displayDate) return '';
    
    try {
      // Si la date est déjà au format aaaa-mm-jj, on la renvoie telle quelle
      if (/^\d{4}-\d{2}-\d{2}$/.test(displayDate)) return displayDate;
      
      // Conversion de jj-mm-aaaa à aaaa-mm-jj
      const parts = displayDate.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return displayDate;
    } catch (e) {
      return displayDate;
    }
  };

  return (
    <>
      <TableCell className="px-1 py-1 border-r border-gray-200 bg-blue-50 w-[180px]">
        <EditableCell
          value={product}
          onSave={(value) => handleProductChange(value)}
          canEdit={isCoordinator}
          placeholder="Produit"
          textClassName="truncate"
          inputClassName="truncate"
          className="h-8"
        />
      </TableCell>

      {/* Colonne Heure */}
      <TableCell className="p-0 border-r border-gray-200 bg-blue-50 w-[80px] text-center">
        <EditableCell
          value={sample.readyTime || ''}
          onSave={(value) => updateSample(sample.id.toString(), { readyTime: value })}
          canEdit={isCoordinator && !isLocked}
          placeholder="HH:MM"
        />
      </TableCell>

      {/* Colonne Fabrication */}
      <TableCell className="p-0 border-r border-gray-200 bg-blue-50 w-[100px] text-center">
        <EditableCell
          value={formatDateForDisplay(fabrication)}
          onSave={(value) => updateSample(sample.id.toString(), { fabrication: formatDateForStorage(value) })}
          canEdit={isCoordinator && !isLocked}
          placeholder="jj-mm-aaaa"
          className="h-8"
        />
      </TableCell>

      {/* Colonne DLC */}
      <TableCell className="p-0 border-r border-gray-200 bg-blue-50 w-[100px] text-center">
        <EditableCell
          value={formatDateForDisplay(dlc)}
          onSave={(value) => updateSample(sample.id.toString(), { dlc: formatDateForStorage(value) })}
          canEdit={isCoordinator && !isLocked}
          placeholder="jj-mm-aaaa"
          className="h-8"
        />
      </TableCell>
    </>
  );
};

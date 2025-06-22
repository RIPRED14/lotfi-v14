import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableCell } from '@/components/ui/table';
import { Check, X, AlertTriangle, AlertCircle } from 'lucide-react';
import { Sample } from '@/types/samples';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TechnicianFieldsProps {
  sample: Sample;
  toggleConformity: (id: string, field: string, value: string) => boolean;
  updateSample: (id: string, updates: Partial<Sample>) => boolean;
  isTechnician: boolean;
  alertStatus: string | null;
}

export const TechnicianFields: React.FC<TechnicianFieldsProps> = ({
  sample,
  toggleConformity,
  updateSample,
  isTechnician,
  alertStatus
}) => {
  // Debug pour voir la valeur de isTechnician
  console.log('TechnicianFields - isTechnician:', isTechnician, 'sample:', sample.id);
  const renderConformityButton = (field: 'smell' | 'texture' | 'taste' | 'aspect') => {
    // Permettre la modification pour tous les utilisateurs (temporaire pour debug)
    const currentValue = sample[field] || 'N';
    const nextValue = currentValue === 'C' ? 'N' : 'C';

    return (
      <Button
        onClick={() => {
          console.log(`Clic sur ${field}: ${currentValue} -> ${nextValue}`);
          toggleConformity(sample.id.toString(), field, nextValue);
        }}
        className={`w-full h-8 ${currentValue === 'C' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white p-0`}
      >
        {currentValue === 'C' ? (
          <Check className="w-3 h-3 mr-1" />
        ) : (
          <X className="w-3 h-3 mr-1" />
        )}
        <span className="text-xs">{currentValue}</span>
      </Button>
    );
  };

  return (
    <>
      <TableCell className="px-1 py-1 bg-green-50 w-[70px] border-r border-gray-200">{renderConformityButton('smell')}</TableCell>
      <TableCell className="px-1 py-1 bg-green-50 w-[70px] border-r border-gray-200">{renderConformityButton('texture')}</TableCell>
      <TableCell className="px-1 py-1 bg-green-50 w-[70px] border-r border-gray-200">{renderConformityButton('taste')}</TableCell>
      <TableCell className="px-1 py-1 bg-green-50 w-[70px] border-r border-gray-200">{renderConformityButton('aspect')}</TableCell>
      <TableCell className="px-1 py-1 bg-green-50 w-[50px] border-r border-gray-200">
        <Input
          value={sample.ph}
          onChange={(e) => updateSample(sample.id.toString(), { ph: e.target.value })}
          className="w-full h-8 text-xs px-2"
          type="number"
          step="0.01"
          min="0"
          max="14"
        />
      </TableCell>
    </>
  );
};

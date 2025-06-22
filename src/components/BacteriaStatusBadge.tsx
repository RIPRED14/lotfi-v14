import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface BacteriaItem {
  id: string;
  name: string;
  delay: string; // "24h", "48h", "5j"
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  readingDate?: string;
  form_id: string;
  created_at: string;
}

interface BacteriaStatusBadgeProps {
  bacteria: BacteriaItem;
  onClick?: () => void;
  compact?: boolean;
}

export const BacteriaStatusBadge: React.FC<BacteriaStatusBadgeProps> = ({
  bacteria,
  onClick,
  compact = false
}) => {
  // Calculer le statut réel basé sur la date
  const getActualStatus = () => {
    if (bacteria.status === 'completed') return 'completed';
    
    if (!bacteria.readingDate) return bacteria.status;
    
    const today = startOfDay(new Date());
    const readingDate = startOfDay(new Date(bacteria.readingDate));
    
    if (isBefore(readingDate, today)) {
      return 'overdue'; // En retard
    } else if (isAfter(readingDate, today)) {
      return 'pending'; // Pas encore prêt
    } else {
      return 'ready'; // Prêt à être lu aujourd'hui
    }
  };

  const actualStatus = getActualStatus();

  // Configuration des couleurs et icônes par statut
  const statusConfig = {
    pending: {
      color: 'bg-gray-100 text-gray-600 border-gray-300',
      icon: Calendar,
      label: 'En attente'
    },
    ready: {
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: AlertCircle,
      label: 'Prêt à lire'
    },
    in_progress: {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Clock,
      label: 'En cours'
    },
    completed: {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle,
      label: 'Terminé'
    },
    overdue: {
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: AlertCircle,
      label: 'En retard'
    }
  };

  const config = statusConfig[actualStatus] || statusConfig.pending;
  const IconComponent = config.icon;

  // Configuration des couleurs par type de bactérie
  const bacteriaColors = {
    'Entérobactéries': 'border-l-blue-500',
    'Levures et Moisissures': 'border-l-green-500',
    'Flores totales': 'border-l-purple-500',
    'Salmonelles': 'border-l-red-500',
    'Listeria': 'border-l-orange-500',
    'E.coli': 'border-l-yellow-500',
    'Staphylocoques': 'border-l-pink-500',
    'Clostridium': 'border-l-indigo-500'
  };

  const bacteriaColor = bacteriaColors[bacteria.name as keyof typeof bacteriaColors] || 'border-l-gray-500';

  if (compact) {
    return (
      <Badge
        variant="outline"
        className={`${config.color} ${bacteriaColor} border-l-4 cursor-pointer hover:shadow-md transition-shadow`}
        onClick={onClick}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        <span className="text-xs font-medium">{bacteria.name}</span>
        <span className="text-xs ml-1">({bacteria.delay})</span>
      </Badge>
    );
  }

  return (
    <div
      className={`${config.color} ${bacteriaColor} border border-l-4 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4" />
          <span className="font-medium text-sm">{bacteria.name}</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {bacteria.delay}
        </Badge>
      </div>
      
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span>Statut:</span>
          <span className="font-medium">{config.label}</span>
        </div>
        
        {bacteria.readingDate && (
          <div className="flex justify-between">
            <span>Lecture:</span>
            <span className="font-medium">
              {format(new Date(bacteria.readingDate), 'dd/MM/yyyy', { locale: fr })}
            </span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>Formulaire:</span>
          <span className="font-medium">{bacteria.form_id.slice(-6)}</span>
        </div>
      </div>
    </div>
  );
};

// Hook pour calculer le statut des bactéries en fonction de leurs paramètres
export const useBacteriaStatus = (bacteria: BacteriaItem[]) => {
  const getBacteriaByStatus = () => {
    const ready: BacteriaItem[] = [];
    const pending: BacteriaItem[] = [];
    const completed: BacteriaItem[] = [];
    const overdue: BacteriaItem[] = [];

    bacteria.forEach(item => {
      const today = startOfDay(new Date());
      const readingDate = item.readingDate ? startOfDay(new Date(item.readingDate)) : null;

      if (item.status === 'completed') {
        completed.push(item);
      } else if (!readingDate) {
        pending.push(item);
      } else if (isBefore(readingDate, today)) {
        overdue.push({ ...item, status: 'overdue' });
      } else if (isAfter(readingDate, today)) {
        pending.push(item);
      } else {
        ready.push({ ...item, status: 'ready' });
      }
    });

    return { ready, pending, completed, overdue };
  };

  return getBacteriaByStatus();
}; 
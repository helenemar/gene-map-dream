import React from 'react';
import { Cloud, CloudOff, Loader2, Check } from 'lucide-react';
import { SaveStatus } from '@/hooks/useAutoSave';
import { useLanguage } from '@/contexts/LanguageContext';

interface SaveIndicatorProps {
  status: SaveStatus;
}

const SaveIndicator: React.FC<SaveIndicatorProps> = ({ status }) => {
  const { t } = useLanguage();

  const config = {
    idle: { icon: Cloud, label: '', className: 'text-muted-foreground/40' },
    saving: { icon: Loader2, label: t.saveIndicator.saving, className: 'text-muted-foreground animate-spin' },
    saved: { icon: Check, label: t.saveIndicator.saved, className: 'text-emerald-500' },
    error: { icon: CloudOff, label: t.saveIndicator.error, className: 'text-destructive' },
  }[status];

  if (status === 'idle') return null;

  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Icon className={`w-3.5 h-3.5 ${config.className}`} />
      <span className={`${status === 'saved' ? 'text-emerald-500' : status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
        {config.label}
      </span>
    </div>
  );
};

export default SaveIndicator;

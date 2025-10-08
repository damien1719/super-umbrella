import { Loader2, AlertCircle, CheckCircle2, Circle, Save } from 'lucide-react';
import { Button } from './ui/button';

interface AutosaveBadgeProps {
  statusLabel: string;
  isSaving: boolean;
  hasError: boolean;
  isDirty: boolean;
  onClickSave: () => void | Promise<void>;
}

export default function AutosaveBadge({
  statusLabel,
  isSaving,
  hasError,
  isDirty,
  onClickSave,
}: AutosaveBadgeProps) {
  const Icon = isSaving
    ? Loader2
    : hasError
      ? AlertCircle
      : isDirty
        ? Circle
        : CheckCircle2;
  const iconClass = isSaving
    ? 'text-blue-500 animate-spin'
    : hasError
      ? 'text-red-500'
      : isDirty
        ? 'text-amber-500'
        : 'text-green-600';

  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <div className="flex items-center gap-2" title={statusLabel}>
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <span>{statusLabel}</span>
      </div>
      <Button
        className="gap-2"
        variant="outline"
        size="sm"
        onClick={() => void onClickSave()}
      >
        <Save className="h-4 w-4" />
      </Button>
    </div>
  );
}


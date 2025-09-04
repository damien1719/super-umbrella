import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import JobBadge from '@/components/ui/job-badge';
import type { Job } from '@/types/job';
import {
  Trash2,
  ClipboardList,
  Globe2,
  Lock,
  ListChecks,
  ChevronRight,
} from 'lucide-react';

export interface BilanTypeInfo {
  id: string;
  name: string;
  description?: string | null;
  authorPrenom?: string | null;
  isPublic?: boolean;
  testsCount?: number;
  job?: Job[];
}

interface BilanTypeCardProps {
  bilanType: BilanTypeInfo;
  onOpen?: () => void;
  onDelete?: () => void;
}

export default function BilanTypeCard({
  bilanType,
  onOpen,
  onDelete,
}: BilanTypeCardProps) {
  return (
    <Card
      onClick={onOpen}
      className="relative group hover:shadow-md hover:bg-wood-100 transition-all cursor-pointer w-full"
    >
      {onDelete && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Supprimer"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {
            <div className="h-10 w-10 shrink-0 rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5" />
            </div>
          }
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {bilanType.name}
              </CardTitle>
              {bilanType.isPublic && (
                <span className="inline-flex items-center gap-1 rounded-full border border-coral  -500 bg-white px-2 py-0.5 text-[11px] text-coral-600">
                  <Globe2 className="h-3.5 w-3.5 text-coral-600" />
                  Public
                </span>
              )}
            </div>
            {bilanType.authorPrenom && (
              <p className="mt-0.5 text-xs text-gray-500">
                Partagé par {bilanType.authorPrenom}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {bilanType.description && (
          <p className="text-sm text-gray-600">{bilanType.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          {typeof bilanType.testsCount === 'number' && (
            <span className="inline-flex items-center gap-1 rounded-md ring-1 ring-ocean-600 px-2 py-1 text-ocean-600">
              <ListChecks className="h-3.5 w-3.5 text-ocean-600" />
              <span className="font-medium">{bilanType.testsCount}</span>
              <span>tests</span>
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex w-full items-center justify-between text-xs text-gray-500">
          <span className="flex flex-wrap gap-1">
            {bilanType.job && bilanType.job.length > 0 ? (
              bilanType.job.map((j) => (
                <JobBadge key={j} job={j} className="bg-ocean-600 text-white" />
              ))
            ) : (
              <span>Bilan complet</span>
            )}
          </span>
          <span className="hidden sm:inline text-ocean-600 group-hover:underline"></span>
        </div>
      </CardFooter>
    </Card>
  );
}

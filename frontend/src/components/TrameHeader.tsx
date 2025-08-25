import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Category } from '@/types/trame';
import type { Job } from '@/types/job';
import { jobOptions } from '@/types/job';

interface Props {
  title: string;
  category: string;
  isPublic: boolean;
  categories: Category[];
  jobs: Job[];
  onTitleChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onJobsChange: (jobs: Job[]) => void;
  onPublicChange: (v: boolean) => void;
  onSave: () => void;
  onImport: () => void;
  onBack: () => void;
  onAdminImport?: () => void;
  showAdminImport?: boolean;
}

export default function TrameHeader(p?: Partial<Props>) {
  const {
    title = '',
    category,
    isPublic = false,
    categories = [],
    jobs = [],
    onTitleChange = () => {},
    onCategoryChange = () => {},
    onJobsChange = () => {},
    onPublicChange = () => {},
    onSave = () => {},
    onImport = () => {},
    onBack = () => {},
    onAdminImport = () => {},
    showAdminImport = false,
  } = p ?? {};

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Titre de la trame"
        className="text-2xl font-bold text-gray-900 flex-1"
      />
      <div className="w-48 flex-shrink-0">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-48 flex-shrink-0">
        <Select
          value={jobs.length > 0 ? jobs[0] : ''}
          onValueChange={(value) => onJobsChange([value as Job])}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Métiers" />
          </SelectTrigger>
          <SelectContent>
            {jobOptions.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => onPublicChange(e.target.checked)}
          aria-label="Partager la trame"
        />
        <Label className="text-md text-gray-700">Partager</Label>
      </div>
      <Button onClick={onSave} variant="primary" className="ml-auto">
        Sauvegarder la trame
      </Button>
      <Button variant="outline" onClick={onImport}>
        Import Magique
      </Button>
      {showAdminImport && (
        <Button variant="primary" onClick={onAdminImport}>
          Admin Import
        </Button>
      )}
    </div>
  );
}

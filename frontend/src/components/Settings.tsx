import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Category, CategoryId } from '@/types/trame';
import type { Job } from '@/types/job';
import { jobOptions } from '@/types/job';

interface SettingsProps {
  category: CategoryId | undefined;
  jobs: Job[];
  categories: Category[];
  onCategoryChange: (category: CategoryId) => void;
  onJobsChange: (jobs: Job[]) => void;
}

export default function Settings({
  category,
  jobs,
  categories,
  onCategoryChange,
  onJobsChange,
}: SettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Réglages de la trame</h2>
        <p className="text-sm text-gray-600 mb-6">
          Configurez les paramètres de base de votre trame
        </p>
      </div>

      <div className="space-y-6">
        {/* Choix de la catégorie */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium text-gray-700">
            Type de trame
          </Label>
          <Select
            value={category || ''}
            onValueChange={(value) => onCategoryChange(value as CategoryId)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un type de trame" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <cat.icon className="h-4 w-4" />
                    {cat.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Choisissez le type de trame qui correspond le mieux à votre besoin
          </p>
        </div>

        {/* Choix des métiers */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Métiers concernés
          </Label>
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex flex-wrap gap-2 mb-3">
              {jobs.map((j) => (
                <span
                  key={j}
                  className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-full flex items-center gap-2"
                >
                  {jobOptions.find((o) => o.id === j)?.label}
                  <button
                    type="button"
                    className="text-primary-700 hover:text-primary-900 hover:bg-primary-200 rounded-full w-5 h-5 flex items-center justify-center"
                    onClick={() =>
                      onJobsChange(jobs.filter((x) => x !== j))
                    }
                    aria-label={`Retirer ${jobOptions.find((o) => o.id === j)?.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Select
              onValueChange={(v) => {
                const val = v as Job;
                if (!jobs.includes(val)) {
                  onJobsChange([...jobs, val]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ajouter un métier" />
              </SelectTrigger>
              <SelectContent>
                {jobOptions
                  .filter((j) => !jobs.includes(j.id))
                  .map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-gray-500">
            Sélectionnez les métiers qui utiliseront cette trame
          </p>
        </div>
      </div>
    </div>
  );
}

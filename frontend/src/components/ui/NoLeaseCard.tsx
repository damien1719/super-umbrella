import { FileText, Plus, ArrowRight, Upload } from 'lucide-react';
import { Card, CardContent } from './card';

interface Props {
  onCreateNew: () => void;
  onAddExisting: () => void;
}

export function NoLeaseCard({ onCreateNew, onAddExisting }: Props) {
  return (
    <Card className="border-dashed border-2 border-gray-200">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">Gestion du Bail</h3>
          <p className="text-sm text-gray-500">
            Aucun contrat de bail enregistré
          </p>
        </div>

        <div className="space-y-3">
          <div
            className="group p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all duration-200"
            onClick={onCreateNew}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    Créer un nouveau bail
                  </p>
                  <p className="text-xs text-gray-500">
                    Génération automatique + signature électronique
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-blue-600">29€</span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </div>

          <div
            className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 cursor-pointer transition-all duration-200"
            onClick={onAddExisting}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <Upload className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    Ajouter un bail existant
                  </p>
                  <p className="text-xs text-gray-500">
                    Saisir les informations d&apos;un contrat signé
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-green-600">
                  Gratuit
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <span role="img" aria-label="light-bulb">
              💡
            </span>{' '}
            Un bail enregistré vous permettra de suivre les paiements et générer
            des documents automatiquement
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default NoLeaseCard;

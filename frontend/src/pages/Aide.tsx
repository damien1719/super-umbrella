'use client';

import { cn } from '../lib/utils';
import { buttonVariants } from '../components/ui/button';

export default function Aide() {
  return (
    <div className="min-h-screen bg-wood-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Aide</h1>
              <p className="text-gray-600">
                Guide de démarrage et notions clés
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl space-y-8">
          <section className="space-y-2">
            <h3 className="text-xl font-semibold">✨ Les notions clés</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Partie</strong> : un bloc de contenu (anamnèse, test,
                observation, conclusion, etc.).
              </li>
              <li>
                <strong>Trame de bilan</strong> : un assemblage de parties, qui
                devient votre trame pour vos bilans complets.
              </li>
              <li>
                <strong>Assistant IA</strong> : votre aide à la rédaction pour
                transformer vos notes en texte clair et professionnel.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">
              🚀 Get started en 5 étapes
            </h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Explorez la bibliothèque de parties disponibles.</li>
              <li>
                Créez une partie de bilan personnalisée dans "Bibliothèque".
              </li>
              <li>Créez votre 1ère rédaction dans "Mes rédactions".</li>
              <li>Générez un texte rédigé avec le panel Assistant IA.</li>
              <li>
                Assemblez vos parties pour créer votre trame de bilan complet
                dans "Mes trames de bilan".
              </li>
            </ol>
          </section>

          <section className="border-t pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-gray-700">
                Vous avez des questions / besoin d'aide ?
              </p>
              <a
                href="mailto:support@bilanplume.fr?subject=Support%20Bilan%20Plume"
                className={cn(
                  buttonVariants({ variant: 'primary', size: 'lg' }),
                )}
              >
                Contacter le support
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

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
{/*           <section className="space-y-2">
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
          </section> */}

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">
              🚀 Get started :
            </h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Depuis Mes rédactions : créer une nouvelle rédaction de bilan</li>
              <li>Choisissiez dans le panel Assistant IA une catégorie à générer via "Démarrer"</li>
              <li>Choisissez une partie de bilan à générer</li>
              <li>Remplissez les questions puis cliquer sur "Générer</li>
              <li>Et voilà vous avez générer votre 1e bilan !</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">
              🚀 Comment personnaliser vos rédactions : la trame de bilan
            </h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Dans "Mes trames de bilan" vous pourrez composer et modifier vos trames</li>
              <li>Une trame est composée de différentes parties de bilan personnalisées ou des parties publiques</li>
              <li>Vous pourrez ensuite rédiger via cette trame depuis Mes rédactions pour directement accéder à l'ensemble des tests/observations</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h3 className="text-xl font-semibold">
              🚀 Comment personnaliser vos rédactions : les parties personnalisées
            </h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Pour plus de personnalisation vous pouvez créer des parties personnalisées</li>
              <li>Soit en dupliquant des parties existantes</li>
              <li>Soit en créant une partie via import magique ou manuellement</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">🎥 Les tutos vidéos:</h3>

            <ul className="grid gap-3 sm:grid-cols-2">
              <li>
                <a
                  href="https://www.loom.com/share/347306ba41c74bca8c1669690ed6d8f7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-2xl border-gray-200 p-4 hover:shadow-md transition"
                  aria-label="Rédiger son 1e bilan avec bilan plume"
                >
                  <span className="text-2xl leading-none">▶️</span>
                  <div className="flex-1">
                    <h4 className="font-medium group-hover:underline">
                      Rédiger son 1e bilan avec BilanPlume
                    </h4>
                    <p className="text-sm text-muted-foreground">Tutoriel vidéo</p>
                  </div>
                  <span aria-hidden className="text-sm opacity-60 group-hover:opacity-100">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.loom.com/share/efdce319584b47e7a3200520c02d4be9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-2xl border-gray-200 p-4 hover:shadow-md transition"
                  aria-label="Créer une trame de bilan (ouvre Loom dans un nouvel onglet)"
                >
                  <span className="text-2xl leading-none">▶️</span>
                  <div className="flex-1">
                    <h4 className="font-medium group-hover:underline">
                      Créer une trame de bilan
                    </h4>
                    <p className="text-sm text-muted-foreground">Tutoriel vidéo</p>
                  </div>
                  <span aria-hidden className="text-sm opacity-60 group-hover:opacity-100">↗</span>
                </a>
              </li>

              <li>
                <a
                  href="https://www.loom.com/share/d49e6488aa624f7eb58e7c98a525860e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-2xl border-gray-200 p-4 hover:shadow-md transition"
                  aria-label="Créer une partie via l'import magique (ouvre Loom dans un nouvel onglet)"
                >
                  <span className="text-2xl leading-none">▶️</span>
                  <div className="flex-1">
                    <h4 className="font-medium group-hover:underline">
                      Créer une partie de bilan via l’import magique
                    </h4>
                    <p className="text-sm text-muted-foreground">Tutoriel vidéo</p>
                  </div>
                  <span aria-hidden className="text-sm opacity-60 group-hover:opacity-100">↗</span>
                </a>
              </li>

              <li>
                <a
                  href="https://www.loom.com/share/fcd56c6846514c7c8077d64951de2f99"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-2xl border-gray-200 p-4 hover:shadow-md transition"
                  aria-label="Créer et éditer une partie de bilan manuellement (ouvre Loom dans un nouvel onglet)"
                >
                  <span className="text-2xl leading-none">▶️</span>
                  <div className="flex-1">
                    <h4 className="font-medium group-hover:underline">
                      Créer et éditer une partie de bilan manuellement
                    </h4>
                    <p className="text-sm text-muted-foreground">Tutoriel vidéo</p>
                  </div>
                  <span aria-hidden className="text-sm opacity-60 group-hover:opacity-100">↗</span>
                </a>
              </li>
            </ul>
          </section>


          <section className="border-t pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-gray-700">
                Vous avez des questions / besoin d'aide ?
              </p>
              <a
                href="mailto:damien@bilanplume.fr?subject=Support%20Bilan%20Plume"
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

export default function Abonnement() {
  return (
    <div className="min-h-screen bg-wood-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎁 Votre premier mois est offert
              </h1>
              <p className="text-gray-600">
                Profitez de l’accès complet à Bilan Plume pendant la phase bêta
              </p>
            </div>
          </div>
        </div>

        {/* Contenu abonnement */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Abonnement
          </h2>
          <p className="text-gray-700">
            Vous faites partis des 1ers à tester Bilan Plume qui est gratuit pendant 1 mois pendant la phase de tests.
          </p>
        </div>
      </div>
    </div>
  );
}

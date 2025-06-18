import { useEffect, useState } from 'react';
import { useBienStore, Bien } from '../store/biens';
import BienForm from '../components/BienForm';
import { Button, buttonVariants } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function MesBiens() {
  const { items, fetchAll, remove } = useBienStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Bien | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (items.length === 0 && !showForm) {
    return (
      <div className="space-y-2">
        <p>Aucun bien pour le moment.</p>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          Créer un bien
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showForm && (
        <BienForm
          bien={editing}
          onCancel={() => {
            setEditing(null);
            setShowForm(false);
          }}
        />
      )}
      <div className="flex justify-between items-center">
        <h1>Mes biens</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          Nouveau bien
        </Button>
      </div>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border p-2">Type</th>
            <th className="border p-2">Adresse</th>
            <th className="border p-2" />
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td className="border p-2">{b.typeBien}</td>
              <td className="border p-2">{b.adresse}</td>
              <td className="border p-2 space-x-2 text-right">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(b);
                    setShowForm(true);
                  }}
                >
                  Modifier
                </Button>
                <Button variant="destructive" onClick={() => remove(b.id)}>
                  Supprimer
                </Button>
                <Link
                  to={`/biens/${b.id}/locations/new`}
                  className={buttonVariants({ variant: 'secondary' })}
                  aria-label="Nouvelle location"
                >
                  Nouvelle location
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

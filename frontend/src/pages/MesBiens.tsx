import { useEffect, useState } from 'react';
import { useBienStore, Bien } from '../store/biens';
import BienForm from '../components/BienForm';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import BienCard from '../components/ui/BienCard';
import { useLocationStore, type Location } from '../store/locations';
import type { Locataire } from '../store/locataires';
import { useAuth } from '../store/auth';
import { apiFetch } from '../utils/api';

export default function MesBiens() {
  const { items, fetchAll } = useBienStore();
  const fetchLocation = useLocationStore((s) => s.fetchForBien);
  const token = useAuth((s) => s.token);
  const navigate = useNavigate();
  const [details, setDetails] = useState<
    Record<string, { location: Location | null; tenants: Locataire[] }>
  >({});
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Bien | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    items.forEach((b) => {
      fetchLocation(b.id).then((loc) => {
        if (!token) return;
        if (loc) {
          apiFetch<Locataire[]>(`/api/v1/locataires?locationId=${loc.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((locs) =>
            setDetails((d) => ({
              ...d,
              [b.id]: { location: loc, tenants: locs },
            })),
          );
        } else {
          setDetails((d) => ({
            ...d,
            [b.id]: { location: null, tenants: [] },
          }));
        }
      });
    });
  }, [items, fetchLocation, token]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((b) => {
          const info = details[b.id];
          const tenant = info?.tenants[0];
          return (
            <BienCard
              key={b.id}
              property={{
                id: b.id,
                address: b.adresse,
                city: `${b.codePostal ?? ''} ${b.ville ?? ''}`.trim(),
                status: info && info.location ? 'occupé' : 'libre',
                revenue: 1000,
                charges: 200,
                tenant: tenant
                  ? {
                      firstName: tenant.prenom,
                      lastName: tenant.nom,
                      phone: tenant.telephone || tenant.mobile || '',
                      email: tenant.emailSecondaire || '',
                    }
                  : undefined,
                lease:
                  info && info.location
                    ? {
                        startDate: info.location.leaseStartDate,
                        endDate: info.location.leaseEndDate || '',
                      }
                    : undefined,
              }}
              onCreateLease={() => navigate(`/biens/${b.id}/locations/new`)}
              onViewDocuments={() =>
                navigate(`/biens/${b.id}/dashboard?tab=documents`)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

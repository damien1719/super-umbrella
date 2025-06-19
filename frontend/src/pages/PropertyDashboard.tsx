'use client';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, Euro } from 'lucide-react';
import { PropertyTabList } from '../components/ui/PropertyTabList';
import {
  PropertyInfoCard,
  PropertyInfo,
} from '../components/ui/PropertyInfoCard';
import { LeaseInfoCard, LeaseInfo } from '../components/ui/LeaseInfoCard';
import { TenantInfoCard, TenantInfo } from '../components/ui/TenantInfoCard';
import { DocumentList } from '../components/ui/DocumentList';
import { useDocumentStore } from '../store/documents';
import LocationForm1 from '../components/LocationForm1';
import LocataireForm from '../components/LocataireForm';
import { useBienStore, type Bien } from '../store/biens';
import { useLocationStore } from '../store/locations';
import { useLocataireStore } from '../store/locataires';
import type { NewLocation, NewLocataire } from '@monorepo/shared';
import { Button, buttonVariants } from '../components/ui/button';
import { ChargesCard } from '../components/ui/ChargesCard';
import { RevenueCard } from '../components/ui/RevenueCard';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';

export default function PropertyDashboard() {
  const [tab, setTab] = useState<'view' | 'documents' | 'finances'>('view');
  const { id } = useParams<{ id: string }>();
  const { items: documents, fetchAll, create, remove } = useDocumentStore();
  const fetchBien = useBienStore((s) => s.fetchOne);
  const [bien, setBien] = useState<Bien | null>(null);
  const {
    current: location,
    fetchForBien: fetchLocation,
    update: updateLocation,
    remove: removeLocation,
  } = useLocationStore();
  const {
    current: locataire,
    fetchForBien: fetchLocataire,
    update: updateLocataire,
    remove: removeLocataire,
  } = useLocataireStore();
  const [editLoc, setEditLoc] = useState(false);
  const [editTenant, setEditTenant] = useState(false);
  const [locData, setLocData] = useState<Partial<NewLocation>>({});
  const [tenantData, setTenantData] = useState<Partial<NewLocataire>>({});

  useEffect(() => {
    if (tab === 'documents' && id) fetchAll(id);
  }, [tab, id, fetchAll]);

  useEffect(() => {
    if (!id) return;
    fetchBien(id).then(setBien);
    fetchLocation(id);
    fetchLocataire(id);
  }, [id, fetchBien, fetchLocation, fetchLocataire]);

  useEffect(() => {
    if (location) setLocData(location as Partial<NewLocation>);
  }, [location]);

  useEffect(() => {
    if (locataire) setTenantData(locataire as Partial<NewLocataire>);
  }, [locataire]);

  const today = new Date();
  const activeLocation =
    location &&
    new Date(location.leaseStartDate) <= today &&
    (!location.leaseEndDate || new Date(location.leaseEndDate) >= today);

  const propertyData: PropertyInfo | null = bien
    ? {
        address: bien.adresse,
        type: bien.typeBien,
        surface: bien.surfaceHabitable ? `${bien.surfaceHabitable} m²` : '-',
        value: '-',
        status: activeLocation ? 'Occupé' : 'Disponible',
      }
    : null;

  const leaseData: LeaseInfo | null = location
    ? {
        tenant: locataire ? `${locataire.prenom} ${locataire.nom}` : 'N/A',
        startDate: new Date(location.leaseStartDate).toLocaleDateString(),
        endDate: location.leaseEndDate
          ? new Date(location.leaseEndDate).toLocaleDateString()
          : '—',
        rent: `${location.baseRent.toLocaleString()} €`,
        deposit: location.depositAmount
          ? `${location.depositAmount.toLocaleString()} €`
          : '-',
        status: activeLocation ? 'En cours' : 'Terminé',
      }
    : null;

  const tenantInfo: TenantInfo | null = locataire
    ? {
        name: `${locataire.prenom} ${locataire.nom}`,
        email: locataire.emailSecondaire ?? '',
        phone: locataire.telephone ?? locataire.mobile ?? '',
        profession: locataire.profession ?? '',
        avatar: '/placeholder.svg?height=40&width=40',
      }
    : null;
  const financialData = {
    monthlyRent: 1800,
    yearlyIncome: 21600,
    expenses: 3200,
    netIncome: 18400,
    rentPayments: [
      { month: 'Jan', amount: 1800, status: 'Payé' },
      { month: 'Fév', amount: 1800, status: 'En attente' },
    ],
  };
  const alerts = [
    {
      type: 'warning',
      title: 'Révision de loyer',
      description: 'La révision annuelle du loyer est due',
      date: '2024-01-15',
    },
  ];

  return (
    <div className="space-y-4">
      <PropertyTabList value={tab} onChange={setTab} />
      {tab === 'view' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {propertyData && <PropertyInfoCard property={propertyData} />}
          {activeLocation && leaseData && tenantInfo ? (
            <>
              <div>
                {editLoc ? (
                  <div className="space-y-2">
                    <LocationForm1 data={locData} onChange={setLocData} />
                    <Button
                      onClick={async () => {
                        if (location) {
                          await updateLocation(location.id, locData);
                          setEditLoc(false);
                        }
                      }}
                    >
                      Valider
                    </Button>
                  </div>
                ) : (
                  <div>
                    <LeaseInfoCard lease={leaseData} />
                    <div className="space-x-2 mt-2">
                      <Button
                        variant="secondary"
                        onClick={() => setEditLoc(true)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => location && removeLocation(location.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                {editTenant ? (
                  <div className="space-y-2">
                    <LocataireForm data={tenantData} onChange={setTenantData} />
                    <Button
                      onClick={async () => {
                        if (locataire) {
                          await updateLocataire(locataire.id, tenantData);
                          setEditTenant(false);
                        }
                      }}
                    >
                      Valider
                    </Button>
                  </div>
                ) : (
                  <div>
                    <TenantInfoCard tenant={tenantInfo} />
                    <div className="space-x-2 mt-2">
                      <Button
                        variant="secondary"
                        onClick={() => setEditTenant(true)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          locataire && removeLocataire(locataire.id)
                        }
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center border rounded p-4">
              <p>Aucune location active</p>
              {id && (
                <Link
                  to={`/biens/${id}/locations/new`}
                  className={buttonVariants({ variant: 'primary' })}
                >
                  Ajouter une location
                </Link>
              )}
            </div>
          )}
        </div>
      )}
      {tab === 'documents' && (
        <DocumentList
          documents={documents}
          onUpload={(file, type) => id && create(id, file, type)}
          onDelete={remove}
        />
      )}
      {tab === 'finances' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Euro className="h-5 w-5 mr-2" /> Finances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <RevenueCard amount={financialData.yearlyIncome} />
                  <ChargesCard amount={financialData.expenses} />
                </div>
                <Separator />
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-600 mb-2">
                    Revenus Nets Annuels
                  </h3>
                  <p className="text-3xl font-bold text-blue-700">
                    {financialData.netIncome.toLocaleString()} €
                  </p>
                  <div className="mt-2">
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-blue-600 mt-1">
                      Rentabilité: 85%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" /> Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.map((alert, i) => (
              <Alert key={i} className="mb-2">
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                  <span>{alert.description}</span>
                  <span className="text-xs text-gray-500">{alert.date}</span>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

  useEffect(() => {
    if (tab === 'documents' && id) fetchAll(id);
  }, [tab, id, fetchAll]);

  // fake data
  const propertyData: PropertyInfo = {
    address: '15 Rue de la Paix, 75001 Paris',
    type: 'Appartement T3',
    surface: '75 m²',
    value: '450 000 €',
    status: 'Occupé',
  };
  const leaseData: LeaseInfo = {
    tenant: 'Marie Dubois',
    startDate: '01/01/2023',
    endDate: '31/12/2025',
    rent: '1 800 €',
    deposit: '3 600 €',
    status: 'En cours',
  };
  const tenantData: TenantInfo = {
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    phone: '06 12 34 56 78',
    profession: 'Ingénieure',
    avatar: '/placeholder.svg?height=40&width=40',
  };
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
          <PropertyInfoCard property={propertyData} />
          <LeaseInfoCard lease={leaseData} />
          <TenantInfoCard tenant={tenantData} />
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

'use client';

import type React from 'react';

import { useState } from 'react';
import {
  AlertTriangle,
  Building,
  Download,
  Euro,
  FileText,
  Home,
  Mail,
  Phone,
  Settings,
  Trash2,
  Upload,
  User,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PropertyDashboard() {
  const [, setSelectedFile] = useState<File | null>(null);

  // Données simulées
  const propertyData = {
    address: '15 Rue de la Paix, 75001 Paris',
    type: 'Appartement T3',
    surface: '75 m²',
    value: '450 000 €',
    status: 'Occupé',
  };

  const leaseData = {
    tenant: 'Marie Dubois',
    startDate: '01/01/2023',
    endDate: '31/12/2025',
    rent: '1 800 €',
    deposit: '3 600 €',
    status: 'En cours',
  };

  const tenantData = {
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    phone: '06 12 34 56 78',
    profession: 'Ingénieure',
    avatar: '/placeholder.svg?height=40&width=40',
  };

  const alerts = [
    {
      type: 'warning',
      title: 'Révision de loyer',
      description: 'La révision annuelle du loyer est due dans 15 jours',
      date: '2024-01-15',
    },
    {
      type: 'info',
      title: 'Visite technique',
      description: 'Inspection annuelle de la chaudière programmée',
      date: '2024-01-20',
    },
  ];

  const documents = [
    {
      id: 1,
      name: 'Contrat de bail.pdf',
      type: 'Bail',
      date: '2023-01-01',
      size: '2.4 MB',
    },
    {
      id: 2,
      name: 'État des lieux entrée.pdf',
      type: 'État des lieux',
      date: '2023-01-01',
      size: '1.8 MB',
    },
    {
      id: 3,
      name: 'Assurance habitation.pdf',
      type: 'Assurance',
      date: '2023-12-01',
      size: '0.9 MB',
    },
    {
      id: 4,
      name: 'Quittance décembre.pdf',
      type: 'Quittance',
      date: '2023-12-31',
      size: '0.3 MB',
    },
  ];

  const financialData = {
    monthlyRent: 1800,
    yearlyIncome: 21600,
    expenses: 3200,
    netIncome: 18400,
    rentPayments: [
      { month: 'Jan', amount: 1800, status: 'Payé' },
      { month: 'Fév', amount: 1800, status: 'Payé' },
      { month: 'Mar', amount: 1800, status: 'Payé' },
      { month: 'Avr', amount: 1800, status: 'Payé' },
      { month: 'Mai', amount: 1800, status: 'Payé' },
      { month: 'Juin', amount: 1800, status: 'En attente' },
    ],
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestion Immobilière
                </h1>
                <p className="text-sm text-gray-500">{propertyData.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Bien */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bien Immobilier
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">{propertyData.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Type:</span>
                  <span className="text-sm font-medium">
                    {propertyData.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Surface:</span>
                  <span className="text-sm font-medium">
                    {propertyData.surface}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Valeur:</span>
                  <span className="text-sm font-medium">
                    {propertyData.value}
                  </span>
                </div>
                <Badge variant="secondary" className="mt-2">
                  {propertyData.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Bail */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bail en Cours
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Début:</span>
                  <span className="text-sm font-medium">
                    {leaseData.startDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Fin:</span>
                  <span className="text-sm font-medium">
                    {leaseData.endDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Loyer:</span>
                  <span className="text-sm font-medium">
                    {leaseData.rent}/mois
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Dépôt:</span>
                  <span className="text-sm font-medium">
                    {leaseData.deposit}
                  </span>
                </div>
                <Badge variant="default" className="mt-2">
                  {leaseData.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Locataire */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locataire</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-3">
                <Avatar>
                  <AvatarImage src={tenantData.avatar || '/placeholder.svg'} />
                  <AvatarFallback>MD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{tenantData.name}</p>
                  <p className="text-xs text-gray-500">
                    {tenantData.profession}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">{tenantData.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">{tenantData.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Alertes et Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <Alert
                  key={index}
                  className={
                    alert.type === 'warning'
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-blue-200 bg-blue-50'
                  }
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription className="flex justify-between items-center">
                    <span>{alert.description}</span>
                    <span className="text-xs text-gray-500">{alert.date}</span>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Documents
                </span>
                <div className="flex space-x-2">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Ajouter
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.size}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{doc.date}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Finances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Euro className="h-5 w-5 mr-2" />
                Finances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Résumé financier */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-green-600">
                        Revenus
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {financialData.yearlyIncome.toLocaleString()} €
                    </p>
                    <p className="text-xs text-green-600">Annuel</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingDown className="h-5 w-5 text-red-600 mr-1" />
                      <span className="text-sm font-medium text-red-600">
                        Charges
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-red-700">
                      {financialData.expenses.toLocaleString()} €
                    </p>
                    <p className="text-xs text-red-600">Annuel</p>
                  </div>
                </div>

                <Separator />

                {/* Revenus nets */}
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

                {/* Paiements récents */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Paiements Récents
                  </h4>
                  <div className="space-y-2">
                    {financialData.rentPayments
                      .slice(-3)
                      .map((payment, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">{payment.month} 2024</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {payment.amount} €
                            </span>
                            <Badge
                              variant={
                                payment.status === 'Payé'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className={
                                payment.status === 'Payé'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                              }
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

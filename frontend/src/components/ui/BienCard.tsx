'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  User,
  Euro,
  FileText,
  PenTool,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  Loader2,
  Plus,
  Upload,
} from 'lucide-react';

interface BienCardProps {
  property: {
    id: string;
    address: string;
    city: string;
    status: 'libre' | 'occupé';
    revenue: number;
    charges: number;
    tenant?: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      avatar?: string;
    };
    lease?: {
      startDate: string;
      endDate: string;
    };
  };
  onCreateLease?: () => void;
  onViewDocuments?: () => void;
}

export default function BienCard({
  property,
  onCreateLease,
  onViewDocuments,
}: BienCardProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (actionName: string) => {
    setLoadingAction(actionName);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoadingAction(null);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card className="w-full max-w-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        {/* Adresse et statut */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight text-gray-900">
              {property.address}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{property.city}</p>
          </div>
          <Badge
            className={`ml-3 ${
              property.status === 'occupé'
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800'
            }`}
          >
            <Home className="w-3 h-3 mr-1" />
            {property.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Finances - Mois actuel */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Euro className="w-4 h-4" />
            Mois actuel
          </h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Loyer</span>
              <span className="font-semibold">{property.revenue}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Charges</span>
              <span className="font-semibold text-red-600">
                -{property.charges}€
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-medium text-gray-900">Cash-flow</span>
              <span className="font-bold text-green-600">
                {property.revenue - property.charges}€
              </span>
            </div>
          </div>
        </div>

        {/* Informations conditionnelles */}
        {property.status === 'occupé' && property.tenant && property.lease ? (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {/* Locataire */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={property.tenant.avatar || '/placeholder.svg'}
                />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {getInitials(
                    property.tenant.firstName,
                    property.tenant.lastName,
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {property.tenant.firstName} {property.tenant.lastName}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {property.tenant.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {property.tenant.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Bail */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Bail :</span>
                <span className="font-medium">
                  {formatDate(property.lease.startDate)} -{' '}
                  {formatDate(property.lease.endDate)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Actions pour bien libre */
          <div className="space-y-2">
            <Button
              onClick={() =>
                onCreateLease ? onCreateLease() : handleAction('Créer un bail')
              }
              disabled={loadingAction === 'Créer un bail'}
              className="w-full flex items-center gap-2"
              variant="default"
            >
              {loadingAction === 'Créer un bail' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Créer un bail
            </Button>
            <Button
              onClick={() => handleAction('Ajouter un bail existant')}
              disabled={loadingAction === 'Ajouter un bail existant'}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              {loadingAction === 'Ajouter un bail existant' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Ajouter un bail existant
            </Button>
          </div>
        )}

        {/* Actions principales */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleAction('Signer bail')}
            disabled={loadingAction === 'Signer bail'}
            className="flex-1 flex items-center gap-2"
            variant="outline"
            size="sm"
          >
            {loadingAction === 'Signer bail' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PenTool className="w-4 h-4" />
            )}
            Signer bail
          </Button>
          <Button
            onClick={() => handleAction('Signer états des lieux')}
            disabled={loadingAction === 'Signer états des lieux'}
            className="flex-1 flex items-center gap-2"
            variant="outline"
            size="sm"
          >
            {loadingAction === 'Signer états des lieux' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Signer EDL
          </Button>
        </div>

        {/* Menu More */}
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <MoreHorizontal className="w-4 h-4 mr-1" />
                Plus
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem
                onClick={() =>
                  onViewDocuments
                    ? onViewDocuments()
                    : handleAction('Voir les documents')
                }
              >
                <FileText className="w-4 h-4 mr-2" />
                Voir les documents
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction('Gérer les paiements')}
              >
                <Euro className="w-4 h-4 mr-2" />
                Gérer les paiements
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction('Contacter le locataire')}
              >
                <User className="w-4 h-4 mr-2" />
                Contacter le locataire
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

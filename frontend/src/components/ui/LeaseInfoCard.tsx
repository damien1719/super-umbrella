import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

export interface LeaseInfo {
  tenant: string;
  startDate: string;
  endDate: string;
  rent: string;
  deposit: string;
  status: string;
}

interface Props {
  lease: LeaseInfo;
}

export function LeaseInfoCard({ lease }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Bail en Cours</CardTitle>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Début:</span>
            <span className="text-sm font-medium">{lease.startDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Fin:</span>
            <span className="text-sm font-medium">{lease.endDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Loyer:</span>
            <span className="text-sm font-medium">{lease.rent}/mois</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Dépôt:</span>
            <span className="text-sm font-medium">{lease.deposit}</span>
          </div>
          <Badge variant="default" className="mt-2">
            {lease.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

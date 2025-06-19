import { Home, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

export interface PropertyInfo {
  address: string;
  type: string;
  surface: string;
  value: string;
  status: string;
}

interface Props {
  property: PropertyInfo;
}

export function PropertyInfoCard({ property }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Bien Immobilier</CardTitle>
        <Home className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-gray-600">{property.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Type:</span>
            <span className="text-sm font-medium">{property.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Surface:</span>
            <span className="text-sm font-medium">{property.surface}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Valeur:</span>
            <span className="text-sm font-medium">{property.value}</span>
          </div>
          <Badge variant="secondary" className="mt-2">
            {property.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

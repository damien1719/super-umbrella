import { Mail, Phone, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export interface TenantInfo {
  name: string;
  email: string;
  phone: string;
  profession: string;
  avatar: string;
}

interface Props {
  tenant: TenantInfo;
}

export function TenantInfoCard({ tenant }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Locataire</CardTitle>
        <User className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-3 mb-3">
          <Avatar>
            <AvatarImage src={tenant.avatar || '/placeholder.svg'} />
            <AvatarFallback>{tenant.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{tenant.name}</p>
            <p className="text-xs text-gray-500">{tenant.profession}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-gray-600">{tenant.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-gray-600">{tenant.phone}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

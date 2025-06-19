import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface Props {
  amount: number;
}

export function RevenueCard({ amount }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" /> Revenus
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-green-700">
          {amount.toLocaleString()} €
        </p>
      </CardContent>
    </Card>
  );
}

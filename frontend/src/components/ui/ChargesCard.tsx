import { TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface Props {
  amount: number;
}

export function ChargesCard({ amount }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingDown className="h-5 w-5 mr-2" /> Charges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-red-700">
          {amount.toLocaleString()} €
        </p>
      </CardContent>
    </Card>
  );
}

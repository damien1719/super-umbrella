import { useParams } from 'react-router-dom';

export default function Bilan() {
  const { bilanId } = useParams<{ bilanId: string }>();
  return <div data-testid="bilan-page">Bilan {bilanId}</div>;
}

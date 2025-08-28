'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import {
  useBilanTypeStore,
  type BilanType as BilanTypeModel,
} from '@/store/bilanTypes';

export default function BilanType() {
  const { bilanTypeId } = useParams();
  const { fetchOne } = useBilanTypeStore();
  const [item, setItem] = useState<BilanTypeModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bilanTypeId) return;
    fetchOne(bilanTypeId)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [bilanTypeId, fetchOne]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!item) {
    return <div className="p-4">Bilan type introuvable.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
      {item.description && <p className="text-gray-600">{item.description}</p>}
    </div>
  );
}

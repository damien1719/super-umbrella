import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import InventaireForm from './InventaireForm';
import type { Inventaire } from '../store/inventaires';
import type { NewInventaire } from '@monorepo/shared';

interface Props {
  items: Inventaire[];
  bienId: string;
  onCreate: (data: NewInventaire) => Promise<void>;
  onUpdate: (id: string, data: Partial<NewInventaire>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function InventaireTable({
  items,
  bienId,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newData, setNewData] = useState<Partial<NewInventaire>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<NewInventaire>>({});

  return (
    <div className="space-y-4">
      {adding ? (
        <Card>
          <CardContent className="space-y-2 pt-4">
            <InventaireForm data={newData} onChange={setNewData} />
            <div className="flex justify-end space-x-2 mt-2">
              <Button
                onClick={async () => {
                  await onCreate({ bienId, ...(newData as NewInventaire) });
                  setNewData({});
                  setAdding(false);
                }}
              >
                Valider
              </Button>
              <Button variant="secondary" onClick={() => setAdding(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-right">
          <Button onClick={() => setAdding(true)}>Ajouter</Button>
        </div>
      )}

      {items.map((inv) => (
        <Card key={inv.id}>
          {editingId === inv.id ? (
            <CardContent className="space-y-2 pt-4">
              <InventaireForm data={editData} onChange={setEditData} />
              <div className="flex justify-end space-x-2 mt-2">
                <Button
                  onClick={async () => {
                    await onUpdate(inv.id, editData);
                    setEditingId(null);
                  }}
                >
                  Valider
                </Button>
                <Button variant="secondary" onClick={() => setEditingId(null)}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle>
                  {inv.piece} - {inv.mobilier}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Quantité: {inv.quantite ?? '-'}</p>
                <p>Marque: {inv.marque ?? '-'}</p>
                <p>État: {inv.etatEntree ?? '-'}</p>
                <div className="space-x-2 mt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(inv.id);
                      setEditData(inv);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(inv.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}

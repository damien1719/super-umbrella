'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Package, Edit, Trash2, X, Check } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useInventaireStore, type Inventaire } from '../store/inventaires';

interface InventoryItem extends Inventaire {
  prix?: number;
  createdAt?: string;
}

const pieces = [
  'Salon',
  'Cuisine',
  'Chambre',
  'Salle à manger',
  'Salle de bain',
  'Entrée',
  'Bureau',
  'Balcon',
  'Cave',
  'Garage',
];
const etatsEntree = [
  'Neuf',
  'Très bon',
  'Bon',
  'Correct',
  'Usagé',
  'Défaillant',
];

export default function InventoryPage() {
  const { id } = useParams<{ id: string }>();
  const {
    items: inventory,
    fetchForBien,
    create,
    update,
    remove,
  } = useInventaireStore();

  useEffect(() => {
    if (id) {
      fetchForBien(id).catch(() => {});
    }
  }, [id, fetchForBien]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPiece, setSelectedPiece] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<InventoryItem>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemData, setNewItemData] = useState<Partial<InventoryItem>>({
    piece: '',
    mobilier: '',
    quantite: 1,
    prix: 0,
    marque: '',
    etatEntree: '',
  });
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.mobilier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.marque.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPiece =
      selectedPiece === 'all' || item.piece === selectedPiece;
    return matchesSearch && matchesPiece;
  });

  const handleStartEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditingData(item);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleSaveEdit = async () => {
    if (
      editingId &&
      editingData.piece &&
      editingData.mobilier &&
      editingData.etatEntree
    ) {
      await update(editingId, editingData);
      setEditingId(null);
      setEditingData({});
    }
  };

  const handleStartAddNew = () => {
    setIsAddingNew(true);
    setNewItemData({
      piece: '',
      mobilier: '',
      quantite: 1,
      prix: 0,
      marque: '',
      etatEntree: '',
    });
  };

  const handleCancelAddNew = () => {
    setIsAddingNew(false);
    setNewItemData({
      piece: '',
      mobilier: '',
      quantite: 1,
      prix: 0,
      marque: '',
      etatEntree: '',
    });
  };

  const handleSaveNew = async () => {
    if (!id) return;
    if (newItemData.piece && newItemData.mobilier && newItemData.etatEntree) {
      await create({ bienId: id, ...(newItemData as Inventaire) });
      setIsAddingNew(false);
      setNewItemData({
        piece: '',
        mobilier: '',
        quantite: 1,
        prix: 0,
        marque: '',
        etatEntree: '',
      });
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await remove(itemToDelete);
      setItemToDelete(null);
    }
  };

  const getEtatColor = (etat: string) => {
    switch (etat) {
      case 'Neuf':
        return 'bg-green-100 text-green-800';
      case 'Très bon':
        return 'bg-blue-100 text-blue-800';
      case 'Bon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Correct':
        return 'bg-orange-100 text-orange-800';
      case 'Usagé':
        return 'bg-red-100 text-red-800';
      case 'Défaillant':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalValue = inventory.reduce(
    (sum, item) => sum + item.prix * item.quantite,
    0,
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventaire</h1>
          <p className="text-muted-foreground">
            Gérez l&apos;inventaire de vos biens locatifs
          </p>
        </div>
        <Button onClick={handleStartAddNew} disabled={isAddingNew}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un élément
        </Button>
      </div>

      {/* Stats */}
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total éléments
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalValue.toLocaleString('fr-FR')} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un mobilier ou une marque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedPiece} onValueChange={setSelectedPiece}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Toutes les pièces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les pièces</SelectItem>
                {pieces.map((piece) => (
                  <SelectItem key={piece} value={piece}>
                    {piece}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des éléments ({filteredInventory.length})</CardTitle>
          <CardDescription>
            Tous les éléments de votre inventaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pièce</TableHead>
                  <TableHead>Mobilier</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Marque</TableHead>
                  <TableHead>État à l&apos;entrée</TableHead>
                  <TableHead>Date ajout</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Ligne d'ajout */}
                {isAddingNew && (
                  <TableRow className="bg-blue-50">
                    <TableCell>
                      <Select
                        value={newItemData.piece || ''}
                        onValueChange={(value) =>
                          setNewItemData({ ...newItemData, piece: value })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Pièce" />
                        </SelectTrigger>
                        <SelectContent>
                          {pieces.map((piece) => (
                            <SelectItem key={piece} value={piece}>
                              {piece}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8"
                        value={newItemData.mobilier || ''}
                        onChange={(e) =>
                          setNewItemData({
                            ...newItemData,
                            mobilier: e.target.value,
                          })
                        }
                        placeholder="Mobilier"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 w-20"
                        type="number"
                        min="1"
                        value={newItemData.quantite || 1}
                        onChange={(e) =>
                          setNewItemData({
                            ...newItemData,
                            quantite: Number.parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 w-24"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newItemData.prix || 0}
                        onChange={(e) =>
                          setNewItemData({
                            ...newItemData,
                            prix: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8"
                        value={newItemData.marque || ''}
                        onChange={(e) =>
                          setNewItemData({
                            ...newItemData,
                            marque: e.target.value,
                          })
                        }
                        placeholder="Marque"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={newItemData.etatEntree || ''}
                        onValueChange={(value) =>
                          setNewItemData({ ...newItemData, etatEntree: value })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="État" />
                        </SelectTrigger>
                        <SelectContent>
                          {etatsEntree.map((etat) => (
                            <SelectItem key={etat} value={etat}>
                              {etat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSaveNew}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelAddNew}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Lignes existantes */}
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {editingId === item.id ? (
                        <Select
                          value={editingData.piece || item.piece}
                          onValueChange={(value) =>
                            setEditingData({ ...editingData, piece: value })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {pieces.map((piece) => (
                              <SelectItem key={piece} value={piece}>
                                {piece}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="font-medium">{item.piece}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          className="h-8"
                          value={editingData.mobilier || item.mobilier}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              mobilier: e.target.value,
                            })
                          }
                        />
                      ) : (
                        item.mobilier
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          className="h-8 w-20"
                          type="number"
                          min="1"
                          value={editingData.quantite || item.quantite}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              quantite: Number.parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      ) : (
                        item.quantite
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          className="h-8 w-24"
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingData.prix || item.prix}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              prix: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      ) : (
                        `${(item.prix * item.quantite).toLocaleString('fr-FR')} €`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          className="h-8"
                          value={editingData.marque || item.marque}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              marque: e.target.value,
                            })
                          }
                        />
                      ) : (
                        item.marque
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Select
                          value={editingData.etatEntree || item.etatEntree}
                          onValueChange={(value) =>
                            setEditingData({
                              ...editingData,
                              etatEntree: value,
                            })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {etatsEntree.map((etat) => (
                              <SelectItem key={etat} value={etat}>
                                {etat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getEtatColor(item.etatEntree)}>
                          {item.etatEntree}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('fr-FR')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === item.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleSaveEdit}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(item)}
                              disabled={editingId !== null || isAddingNew}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => setItemToDelete(item.id)}
                              disabled={editingId !== null || isAddingNew}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredInventory.length === 0 && !isAddingNew && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun élément trouvé
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmation de suppression */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

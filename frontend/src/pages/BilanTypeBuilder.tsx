"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SectionDisponible } from "@/components/bilanType/SectionDisponible";
import { BilanTypeConstruction } from "@/components/bilanType/BilanTypeConstruction";
import { useSectionStore } from "@/store/sections";
import { useBilanTypeStore } from "@/store/bilanTypes";

// ✅ On réutilise les types existants
import { categories, kindMap, type CategoryId } from "@/types/trame";
import { Job } from "@/types/job";

// Petit type UI local basé UNIQUEMENT sur tes types de domaine
type BilanElement = {
  id: string;
  type: CategoryId;
  title: string;
  description: string;
  // "général" = absence de ciblage métier → on n'invente pas de valeur custom,
  // on laisse ce champ optionnel et uniquement typé avec Job.
  metier?: Job;
};

type SelectedElement = BilanElement & {
  order: number;
};

export default function BilanTypeBuilder() {
  const [bilanName, setBilanName] = useState("");
  const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const sections = useSectionStore((s) => s.items);
  const fetchSections = useSectionStore((s) => s.fetchAll);
  const createBilanType = useBilanTypeStore((s) => s.create);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSections().catch(console.error);
  }, [fetchSections]);

  // Set des CategoryId valides d'après ta source unique de vérité
  const validCategoryIds = useMemo(
    () => new Set<CategoryId>(categories.map((c) => c.id)),
    [],
  );

  // Normalise un "kind" venant du store vers un CategoryId si possible
  const normalizeKind = (k: string | undefined | null): CategoryId | null => {
    if (!k) return null;

    // 1) Cas des ids d'UI "hyphénés" → map via kindMap (ex: 'profil-sensoriel' -> 'profil_sensoriel')
    if (k in kindMap) {
      return kindMap[k as keyof typeof kindMap];
    }

    // 2) Cas où le store fournit déjà un CategoryId exact (ex: 'tests_standards')
    if (validCategoryIds.has(k as CategoryId)) {
      return k as CategoryId;
    }

    // 3) Sinon : inconnu → on ignore proprement
    return null;
  };

  // AUCUNE RESTRICTION : on prend toutes les sections dont le kind est mappable vers un CategoryId
  const availableElements = useMemo<BilanElement[]>(
    () =>
      sections
        .map((s) => {
          const normalized = normalizeKind((s as any).kind as string | undefined);
          if (!normalized) return null;

          return {
            id: (s as any).id as string,
            type: normalized,
            title: (s as any).title as string,
            description: ((s as any).description as string) || "",
            // pas de "general" string — on garde uniquement Job si un ciblage est utile
            metier: undefined as Job | undefined,
          } satisfies BilanElement;
        })
        .filter((x): x is BilanElement => x !== null),
    [sections, validCategoryIds],
  );

  const addElement = (element: BilanElement) => {
    const newElement: SelectedElement = {
      ...element,
      order: selectedElements.length,
    };
    setSelectedElements((prev) => [...prev, newElement]);
  };

  const removeElement = (id: string) => {
    setSelectedElements((prev) => prev.filter((el) => el.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const items = Array.from(selectedElements);
    const draggedItem = items[draggedIndex];

    items.splice(draggedIndex, 1);
    const newIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    items.splice(newIndex, 0, draggedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setSelectedElements(updatedItems);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const saveBilanType = async () => {
    await createBilanType({
      name: bilanName,
      layoutJson: selectedElements.map(({ id, order }) => ({
        sectionId: id,
        order,
      })),
    });
    navigate("/bilan-types");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Constructeur de Type de Bilan
          </h1>
          <p className="text-muted-foreground">
            Créez votre type de bilan personnalisé en sélectionnant et organisant les éléments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SectionDisponible
            availableElements={availableElements}
            onAddElement={addElement}
          />

          <BilanTypeConstruction
            bilanName={bilanName}
            setBilanName={setBilanName}
            selectedElements={selectedElements}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            draggedIndex={draggedIndex}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onRemoveElement={removeElement}
            onSave={saveBilanType}
          />
        </div>
      </div>
    </div>
  );
}

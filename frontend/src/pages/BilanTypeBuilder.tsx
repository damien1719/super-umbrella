"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SectionDisponible } from "@/components/bilanType/SectionDisponible";
import { BilanTypeConstruction } from "@/components/bilanType/BilanTypeConstruction";
import { useSectionStore } from "@/store/sections";
import { useBilanTypeStore } from "@/store/bilanTypes";

interface BilanElement {
  id: string;
  type: "test" | "anamnese" | "conclusion";
  title: string;
  description: string;
  metier:
    | "psychologue"
    | "orthophoniste"
    | "neuropsychologue"
    | "psychiatre"
    | "general";
}

interface SelectedElement extends BilanElement {
  order: number;
}

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

  const availableElements = useMemo<BilanElement[]>(
    () =>
      sections
        .filter((s) =>
          ["anamnese", "conclusion", "tests_standards"].includes(s.kind as string),
        )
        .map((s) => ({
          id: s.id,
          type: (s.kind === "tests_standards" ? "test" : s.kind) as BilanElement["type"],
          title: s.title,
          description: s.description || "",
          metier: "general" as const,
        })),
    [sections],
  );

  const addElement = (element: BilanElement) => {
    const newElement: SelectedElement = {
      ...element,
      order: selectedElements.length,
    };
    setSelectedElements([...selectedElements, newElement]);
  };

  const removeElement = (id: string) => {
    setSelectedElements(selectedElements.filter((el) => el.id !== id));
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

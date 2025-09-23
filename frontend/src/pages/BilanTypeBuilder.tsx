'use client';

import type React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SectionDisponible } from '@/components/bilanType/SectionDisponible';
import ExplorerSectionsModal from '@/components/bilanType/ExplorerSectionsModal';
import { BilanTypeConstruction } from '@/components/bilanType/BilanTypeConstruction';
import { useSectionStore, type Section } from '@/store/sections';
import { useBilanTypeStore } from '@/store/bilanTypes';
import RichTextEditor, {
  type RichTextEditorHandle,
} from '@/components/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ✅ On réutilise les types existants
import { categories, kindMap, type CategoryId } from '@/types/trame';
import { Job, jobOptions } from '@/types/job';
import { hydrateLayout, type LexicalState } from '@/utils/hydrateLayout';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import SharePanel from '@/components/SharePanel';
import ExitConfirmation from '@/components/ExitConfirmation';
import LeftNavBilanType from '@/components/bilan/LeftNavBilanType';
import { DataEntry, type DataEntryHandle } from '@/components/bilan/DataEntry';
import type { Answers, Question } from '@/types/question';

// Types d'élément composant la construction
type SectionElement = {
  kind: 'section';
  id: string; // sectionId
  type: CategoryId;
  title: string;
  description: string;
  metier?: Job;
  order: number;
};

type HeadingElement = {
  kind: 'heading';
  id: string; // derived key e.g. heading-<index>
  title: string;
  order: number;
};

type SelectedElement = SectionElement | HeadingElement;

interface BilanTypeBuilderProps {
  initialBilanTypeId?: string;
}

export default function BilanTypeBuilder({
  initialBilanTypeId,
}: BilanTypeBuilderProps) {
  const [currentBilanTypeId, setCurrentBilanTypeId] = useState<
    string | undefined
  >(initialBilanTypeId);
  const [bilanName, setBilanName] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<
    'build' | 'layout' | 'apercu' | 'preview' | 'settings'
  >('build');
  const [layoutJson, setLayoutJson] = useState<unknown | undefined>(undefined);
  const [jobs, setJobs] = useState<Job[]>([]);
  const layoutEditorRef = useRef<RichTextEditorHandle | null>(null);
  const apercuDataEntryRef = useRef<DataEntryHandle | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [apercuActiveSectionId, setApercuActiveSectionId] = useState<
    string | null
  >(null);
  const [apercuAnswers, setApercuAnswers] = useState<Record<string, Answers>>(
    {},
  );
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [selectedExplorerSectionId, setSelectedExplorerSectionId] = useState<
    string | null
  >(null);
  const [isFetchingSections, setIsFetchingSections] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const sections = useSectionStore((s) => s.items);
  const fetchSections = useSectionStore((s) => s.fetchAll);
  const createBilanType = useBilanTypeStore((s) => s.create);
  const updateBilanType = useBilanTypeStore((s) => s.update);
  const fetchBilanType = useBilanTypeStore((s) => s.fetchOne);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setCurrentBilanTypeId(initialBilanTypeId);
  }, [initialBilanTypeId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromParams = params.get('id');
    if (idFromParams && idFromParams !== currentBilanTypeId) {
      setCurrentBilanTypeId(idFromParams);
    }
  }, [location.search, currentBilanTypeId]);

  useEffect(() => {
    let isMounted = true;
    setIsFetchingSections(true);
    fetchSections()
      .catch(console.error)
      .finally(() => {
        if (isMounted) setIsFetchingSections(false);
      });
    return () => {
      isMounted = false;
    };
  }, [fetchSections]);

  // Initialize from query params (name, jobs) when coming from creation modal
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const n = params.get('name');
    if (n) setBilanName(n);
    // Parse jobs list if present (comma-separated)
    const jobsParam = params.get('jobs');
    if (jobsParam) {
      const parts = jobsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const valid = parts.filter((p): p is Job =>
        Object.values(Job).includes(p as Job),
      );
      if (valid.length) setJobs(valid);
    }
  }, [location.search]);

  // No auto-sync from construction → layout. layoutJson is the single source of truth.

  // Initialize from an existing BilanType id if provided
  useEffect(() => {
    if (!currentBilanTypeId) return;
    (async () => {
      try {
        const bt = await fetchBilanType(currentBilanTypeId);
        setBilanName(bt.name || '');
        setLayoutJson(bt.layoutJson ?? undefined);
        if (Array.isArray(bt.job)) {
          const valid = bt.job.filter((p): p is Job =>
            Object.values(Job).includes(p as Job),
          );
          setJobs(valid);
        }
      } catch {}
    })();
  }, [currentBilanTypeId, fetchBilanType]);

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
  const availableElements = useMemo<
    {
      id: string;
      type: CategoryId;
      title: string;
      description: string;
      metier?: Job;
    }[]
  >(
    () =>
      sections
        .map((s) => {
          const normalized = normalizeKind(s.kind);
          if (!normalized) return null;

          return {
            id: s.id,
            type: normalized,
            title: s.title,
            description: s.description ?? '',
            // pas de "general" string — on garde uniquement Job si un ciblage est utile
            metier: undefined as Job | undefined,
          };
        })
        .filter(
          (
            x,
          ): x is {
            id: string;
            type: CategoryId;
            title: string;
            description: string;
            metier?: Job;
          } => x !== null,
        ),
    [sections, validCategoryIds],
  );

  const handleExplorerOpenChange = (open: boolean) => {
    setIsExplorerOpen(open);
    if (!open) {
      setSelectedExplorerSectionId(null);
    }
  };

  const handleExplorerValidate = (section: Section) => {
    const existing = availableElements.find((el) => el.id === section.id);
    if (existing) {
      addSectionElement(existing);
    } else {
      const normalized = normalizeKind(section.kind);
      if (normalized) {
        addSectionElement({
          id: section.id,
          type: normalized,
          title: section.title,
          description: section.description ?? '',
        });
      }
    }
    setSelectedExplorerSectionId(null);
  };

  const explorerLoading = isFetchingSections && sections.length === 0;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // ===== Layout helpers: parse, mutate, derive display list =====
  type LexNode = Record<string, any> & { type?: string; children?: any[] };
  type Segment =
    | {
        kind: 'heading';
        start: number;
        end: number; // exclusive
        title: string;
      }
    | {
        kind: 'section';
        start: number;
        end: number; // exclusive
        sectionId: string;
        label: string;
      };

  const asArray = (x: any): any[] => (Array.isArray(x) ? x : x ? [x] : []);

  const getRootChildren = (state: unknown): LexNode[] => {
    const root = (state as any)?.root;
    const children = asArray<LexNode>(root?.children ?? []);
    return children;
  };

  const setRootChildren = (state: any, nextChildren: LexNode[]) => {
    const root = (state?.root ?? {}) as any;
    return { ...state, root: { ...root, children: nextChildren } } as unknown;
  };

  // Identify segments: each heading or section-placeholder and the non-item nodes until next item
  const computeSegments = (
    state: unknown,
  ): { segments: Segment[]; prefix: LexNode[]; suffix: LexNode[] } => {
    const children = getRootChildren(state);
    const boundaries: {
      index: number;
      kind: 'heading' | 'section';
      meta?: any;
    }[] = [];
    children.forEach((ch, idx) => {
      if (ch?.type === 'heading') {
        const text = asArray(ch.children).find((c) => c?.type === 'text');
        const title = (text?.text as string) || '';
        boundaries.push({ index: idx, kind: 'heading', meta: { title } });
      } else if (ch?.type === 'section-placeholder') {
        boundaries.push({
          index: idx,
          kind: 'section',
          meta: { sectionId: ch.sectionId, label: ch.label },
        });
      }
    });
    if (boundaries.length === 0) {
      return { segments: [], prefix: children.slice(), suffix: [] };
    }
    const segments: Segment[] = [];
    for (let i = 0; i < boundaries.length; i++) {
      const b = boundaries[i];
      const nextIndex =
        i + 1 < boundaries.length ? boundaries[i + 1].index : children.length;
      if (b.kind === 'heading') {
        segments.push({
          kind: 'heading',
          start: b.index,
          end: nextIndex,
          title: b.meta?.title ?? '',
        });
      } else {
        segments.push({
          kind: 'section',
          start: b.index,
          end: nextIndex,
          sectionId: b.meta?.sectionId,
          label: b.meta?.label ?? '',
        });
      }
    }
    const prefix = children.slice(0, segments[0].start);
    const suffix = children.slice(segments[segments.length - 1].end);
    return { segments, prefix, suffix };
  };

  const deriveSelectedElements = (state: unknown): SelectedElement[] => {
    const { segments } = computeSegments(state);
    const out: SelectedElement[] = segments.map((seg, i) => {
      if (seg.kind === 'heading') {
        return {
          kind: 'heading',
          id: `heading-${i}`,
          title: seg.title,
          order: i,
        };
      }
      // seg.kind === 'section'
      const sec = sections.find((s) => s.id === seg.sectionId);
      const normalized = normalizeKind(sec?.kind);
      return {
        kind: 'section',
        id: seg.sectionId,
        type: (normalized || 'tests_standards') as CategoryId,
        title: sec?.title || seg.label || 'Section',
        description: sec?.description ?? '',
        order: i,
      } as SectionElement;
    });
    return out;
  };

  // Derived: nav items for the Aperçu tab from layout
  type ApercuNavItem = {
    id: string;
    title: string;
    kind?: 'section' | 'separator';
    index?: number;
    schema?: Question[];
  };
  const apercuNavItems = useMemo<ApercuNavItem[]>(() => {
    const { segments } = computeSegments(layoutJson);
    const items: ApercuNavItem[] = [];
    let idx = 0;
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      if (s.kind === 'heading') {
        if ((s.title || '').trim()) {
          items.push({ id: `__sep__${i}`, title: s.title, kind: 'separator' });
        }
      } else {
        const sec = sections.find((x) => x.id === s.sectionId);
        items.push({
          id: s.sectionId,
          title: (sec?.title as string) || `Section ${idx + 1}`,
          kind: 'section',
          index: idx,
          schema: ((sec?.schema || []) as unknown as Question[]) || [],
        });
        idx += 1;
      }
    }
    return items;
  }, [layoutJson, sections]);

  // Ensure we have an active section selected when items change
  useEffect(() => {
    if (apercuActiveSectionId) return;
    const first = apercuNavItems.find((x) => x.kind !== 'separator');
    if (first?.id) setApercuActiveSectionId(first.id);
  }, [apercuActiveSectionId, apercuNavItems]);

  const addSectionElement = (element: {
    id: string;
    type: CategoryId;
    title: string;
    description: string;
    metier?: Job;
  }) => {
    setLayoutJson((prev) => {
      const base = (prev as any) ?? { root: { type: 'root', children: [] } };
      const children = getRootChildren(base).slice();
      children.push(
        {
          type: 'section-placeholder',
          version: 1,
          sectionId: element.id,
          label: element.title,
        },
        {
          type: 'paragraph',
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          children: [],
        },
      );
      return setRootChildren(base, children);
    });
  };

  const addHeadingElement = (title?: string) => {
    const headingTitle = (title || '').trim() || 'Nouvelle partie';
    setLayoutJson((prev) => {
      const base = (prev as any) ?? { root: { type: 'root', children: [] } };
      const children = getRootChildren(base).slice();
      children.push(
        {
          type: 'heading',
          tag: 'h1',
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'text',
              text: headingTitle,
              detail: 0,
              format: 0,
              style: '',
              version: 1,
            },
          ],
        },
        {
          type: 'paragraph',
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          children: [],
        },
      );
      return setRootChildren(base, children);
    });
  };

  const removeElementByIndex = (index: number) => {
    setLayoutJson((prev) => {
      const base = (prev as any) ?? { root: { type: 'root', children: [] } };
      const { segments, prefix, suffix } = computeSegments(base);
      if (index < 0 || index >= segments.length) return base;
      const nextSegs = segments.slice();
      nextSegs.splice(index, 1);
      const nextChildren = [
        ...prefix,
        ...nextSegs.flatMap((s) => getRootChildren(base).slice(s.start, s.end)),
        ...suffix,
      ];
      return setRootChildren(base, nextChildren);
    });
  };

  const renameHeadingByIndex = (index: number, title: string) => {
    setLayoutJson((prev) => {
      const base = (prev as any) ?? { root: { type: 'root', children: [] } };
      const { segments } = computeSegments(base);
      if (index < 0 || index >= segments.length) return base;
      const seg = segments[index];
      if (seg.kind !== 'heading') return base;
      const children = getRootChildren(base).slice();
      const node = { ...(children[seg.start] || {}) } as any;
      const kids = asArray(node.children).slice();
      if (kids.length === 0 || kids[0]?.type !== 'text') {
        kids.unshift({
          type: 'text',
          text: title,
          detail: 0,
          format: 0,
          style: '',
          version: 1,
        });
      } else {
        kids[0] = { ...kids[0], text: title };
      }
      node.children = kids;
      children[seg.start] = node;
      return setRootChildren(base, children);
    });
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    setLayoutJson((prev) => {
      const base = (prev as any) ?? { root: { type: 'root', children: [] } };
      const children = getRootChildren(base);
      const { segments, prefix, suffix } = computeSegments(base);
      if (segments.length === 0) return base;
      const segSlices = segments.map((s) => children.slice(s.start, s.end));
      const from = draggedIndex;
      let to = dropIndex;
      if (from < to) to = to - 1;
      const working = segSlices.slice();
      const [moved] = working.splice(from, 1);
      working.splice(to, 0, moved);
      const nextChildren = [...prefix, ...working.flat(), ...suffix];
      return setRootChildren(base, nextChildren);
    });
    setDraggedIndex(null);
  };

  // drag end handled inline where needed

  const doSaveBilanType = async () => {
    setIsSaving(true);
    try {
      // Derive sections order from layout placeholders (by appearance order)
      const { segments } = computeSegments(layoutJson);
      const sectionOrder = segments
        .filter(
          (s): s is Extract<Segment, { kind: 'section' }> =>
            s.kind === 'section',
        )
        .map((s, idx) => ({ sectionId: s.sectionId, sortOrder: idx }));
      const payload = {
        name: bilanName,
        sections: sectionOrder,
        layoutJson: layoutJson ?? { root: { type: 'root', children: [] } },
        job: jobs,
      };
      if (currentBilanTypeId) {
        await updateBilanType(currentBilanTypeId, payload);
      } else {
        const created = await createBilanType(payload);
        setCurrentBilanTypeId(created.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const saveBilanType = async () => {
    await doSaveBilanType();
    navigate('/bilan-types');
  };

  // Small local component to render the left sidebar list of sections
  function SectionsList({
    elements,
    onInsert,
    showInsert = true,
  }: {
    elements: { id: string; title: string }[];
    onInsert?: (id: string, title: string) => void;
    showInsert?: boolean;
  }) {
    return (
      <div className="space-y-2">
        {showInsert && (
          <div className="text-sm text-muted-foreground mb-2">
            Cliquez pour insérer un placeholder de section dans le layout
          </div>
        )}
        {elements.map((el, i) => (
          <div
            key={el.id}
            className="flex items-center justify-between gap-2 border rounded px-2 py-1"
          >
            <div className="truncate">
              <span className="text-xs text-muted-foreground mr-2">
                {i + 1}.
              </span>
              <span>{el.title}</span>
            </div>
            {showInsert && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onInsert?.(el.id, el.title)}
              >
                Insérer
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(true)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                {isEditingTitle ? (
                  <input
                    autoFocus
                    className="text-2xl font-semibold bg-transparent border-b border-muted-foreground/30 focus:outline-none focus:border-foreground"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={() => {
                      setBilanName(tempTitle.trim());
                      setIsEditingTitle(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setBilanName(tempTitle.trim());
                        setIsEditingTitle(false);
                      } else if (e.key === 'Escape') {
                        setIsEditingTitle(false);
                        setTempTitle(bilanName);
                      }
                    }}
                  />
                ) : (
                  <h1
                    className="text-2xl font-semibold cursor-text"
                    onClick={() => {
                      setTempTitle(bilanName);
                      setIsEditingTitle(true);
                    }}
                    title="Cliquer pour modifier le titre"
                  >
                    {bilanName || 'Nouveau type de bilan'}
                  </h1>
                )}
                <p className="text-sm text-muted-foreground"></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={saveBilanType} disabled={isSaving || !bilanName}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs with extra spacing from header */}
        <div className="mb-4">
          <div className="flex-1 mt-4">
            <Tabs
              tabs={[
                { key: 'build', label: 'Construction' },
                { key: 'apercu', label: 'Aperçu des questions' },
                { key: 'layout', label: 'Edition Word' },
                /*                 { key: 'preview', label: 'Modèle Word (avancé)' },
                 */ { key: 'settings', label: 'Réglages' },
              ]}
              active={mode}
              onChange={(k) => setMode(k as typeof mode)}
            />
          </div>
        </div>

        {mode === 'build' ? (
          <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-9rem)] min-h-[500px]">
            <div className="flex-1 overflow-y-auto">
              <SectionDisponible
                availableElements={availableElements}
                onAddElement={addSectionElement}
                onOpenExplorer={() => handleExplorerOpenChange(true)}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <BilanTypeConstruction
                bilanName={bilanName}
                setBilanName={setBilanName}
                selectedElements={deriveSelectedElements(layoutJson)}
                isSaving={isSaving}
                draggedIndex={draggedIndex}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={() => setDraggedIndex(null)}
                onRemoveElement={removeElementByIndex}
                onAddHeading={addHeadingElement}
                onRenameHeading={renameHeadingByIndex}
                onSave={saveBilanType}
              />
            </div>
          </div>
        ) : mode === 'layout' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Sections du bilan</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const { segments } = computeSegments(layoutJson);
                  const list = segments
                    .filter(
                      (s): s is Extract<Segment, { kind: 'section' }> =>
                        s.kind === 'section',
                    )
                    .map((s) => {
                      const sec = sections.find((x) => x.id === s.sectionId);
                      return { id: s.sectionId, title: sec?.title || s.label };
                    });
                  return (
                    <SectionsList
                      elements={list}
                      onInsert={(id, title) =>
                        layoutEditorRef.current?.insertSectionPlaceholder?.(
                          id,
                          title,
                        )
                      }
                      showInsert
                    />
                  );
                })()}
                <div className="mt-4 flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode('build')}
                  >
                    Retour
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  Layout du Bilan: {bilanName || 'Sans nom'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded">
                  <RichTextEditor
                    ref={
                      layoutEditorRef as unknown as React.RefObject<RichTextEditorHandle>
                    }
                    initialStateJson={layoutJson}
                    readOnly={false}
                    onChangeStateJson={(st) => setLayoutJson(st)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : mode === 'apercu' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Aperçu: nav de gauche + saisie inline sans persistance */}
            <Card className="lg:col-span-3">
              <CardContent>
                {(() => {
                  const firstSection = apercuNavItems.find(
                    (x) => x.kind !== 'separator',
                  );
                  const activeId =
                    apercuActiveSectionId || firstSection?.id || null;
                  const active = apercuNavItems.find(
                    (x) => x.id === activeId && x.kind !== 'separator',
                  );
                  const activeQuestions = (active?.schema ?? []) as Question[];
                  const activeTitle = active?.title;
                  const answers = (activeId && apercuAnswers[activeId]) || {};

                  return (
                    <div className="flex h-[70vh] min-h-[480px] overflow-hidden">
                      <LeftNavBilanType
                        items={apercuNavItems.map((s) =>
                          s.kind === 'separator'
                            ? {
                                id: s.id,
                                title: s.title,
                                kind: 'separator' as const,
                              }
                            : {
                                id: s.id,
                                title: s.title,
                                kind: 'section' as const,
                                index: s.index,
                              },
                        )}
                        activeId={activeId}
                        onSelect={(id) => {
                          if (apercuActiveSectionId) {
                            try {
                              const data =
                                apercuDataEntryRef.current?.getAnswers?.() as
                                  | Answers
                                  | undefined;
                              if (data) {
                                setApercuAnswers((prev) => ({
                                  ...prev,
                                  [apercuActiveSectionId]: data,
                                }));
                              }
                            } catch {}
                          }
                          setApercuActiveSectionId(id);
                          const next = apercuAnswers[id];
                          if (next) apercuDataEntryRef.current?.load?.(next);
                          else apercuDataEntryRef.current?.clear?.();
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <DataEntry
                          ref={
                            apercuDataEntryRef as unknown as React.RefObject<DataEntryHandle>
                          }
                          questions={activeQuestions}
                          answers={answers}
                          onChange={(a) => {
                            if (!activeId) return;
                            setApercuAnswers((prev) => ({
                              ...prev,
                              [activeId]: a,
                            }));
                          }}
                          inline
                          showGroupNav={false}
                          defaultGroupTitle={activeTitle}
                        />
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        ) : mode === 'preview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar intentionally removed in preview mode to keep focus on the composed output */}

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Modèle Word (avancé): {bilanName || 'Sans nom'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const baseLayout = (layoutJson as
                      | LexicalState
                      | undefined) ?? {
                      root: { type: 'root', children: [] },
                    };
                    // Build sections map from all known sections (id -> content)
                    const sectionsMap = Object.fromEntries(
                      sections.map((s) => {
                        const content = (s?.templateRef?.content ??
                          s?.defaultContent) as LexicalState | undefined;
                        return [s.id, content];
                      }),
                    );
                    const composed = hydrateLayout(baseLayout, sectionsMap);
                    return (
                      <div className="border rounded">
                        <RichTextEditor
                          initialStateJson={composed}
                          readOnly={true}
                        />
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Réglages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Métiers concernés
                    </div>
                    <div className="border rounded p-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {jobs.map((j) => (
                          <span
                            key={j}
                            className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded"
                          >
                            {jobOptions.find((o) => o.id === j)?.label}
                            <button
                              type="button"
                              className="ml-1 text-primary-700"
                              onClick={() =>
                                setJobs((prev) => prev.filter((x) => x !== j))
                              }
                              aria-label={`Retirer ${jobOptions.find((o) => o.id === j)?.label}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <Select
                        onValueChange={(v) => {
                          const val = v as Job;
                          setJobs((prev) =>
                            prev.includes(val) ? prev : [...prev, val],
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ajouter un métier" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobOptions.map((j) => (
                            <SelectItem key={j.id} value={j.id}>
                              {j.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMode('build')}
                    >
                      Retour
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <SharePanel
              resourceType="bilan-type"
              resourceId={currentBilanTypeId}
            />
          </div>
        )}
        <ExplorerSectionsModal
          open={isExplorerOpen}
          onOpenChange={handleExplorerOpenChange}
          sections={sections}
          isLoading={explorerLoading}
          selectedSectionId={selectedExplorerSectionId}
          onSelectedSectionChange={setSelectedExplorerSectionId}
          onValidate={handleExplorerValidate}
        />

        <ExitConfirmation
          open={showConfirm}
          onOpenChange={setShowConfirm}
          onConfirm={async () => {
            await doSaveBilanType();
            navigate(-1);
          }}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}

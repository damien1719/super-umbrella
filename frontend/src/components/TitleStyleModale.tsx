import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ColorDropdown from '@/components/ui/color-dropdown';
import type {
  TitleFormatSpec,
  TitleDecorSpec,
  TitlePreset,
} from '@/types/question';
import { DEFAULT_TITLE_PRESETS } from '@/types/question';
import {
  createOrGetStylePreset,
  formatToPresetName,
} from '@/utils/stylePresets';
import { apiFetch } from '@/utils/api';
import { useToastStore } from '@/store/toast';
import { cn } from '@/lib/utils';
import { Check, Pencil, Plus, ArrowLeft, List as ListIcon } from 'lucide-react';

type Props = {
  open: boolean;
  initial?: TitleFormatSpec;
  onCancel: () => void;
  onSave: (format: TitleFormatSpec) => void;
};

const TITLE_SAMPLE = 'Aperçu du titre';

function normalizeInitial(initial?: TitleFormatSpec): TitleFormatSpec {
  return (
    initial ?? {
      kind: 'paragraph',
      fontSize: 12,
      bold: true,
      align: 'left',
      case: 'none',
    }
  );
}

function Preview({ format }: { format: TitleFormatSpec }) {
  // Compute classes for text formatting and alignment
  const alignClass =
    format.align === 'center'
      ? 'text-center'
      : format.align === 'right'
        ? 'text-right'
        : format.align === 'justify'
          ? 'text-justify'
          : 'text-left';
  const caseClass =
    format.case === 'uppercase'
      ? 'uppercase'
      : format.case === 'capitalize'
        ? 'capitalize'
        : format.case === 'lowercase'
          ? 'lowercase'
          : undefined;

  const isHeading = format.kind === 'heading';
  const level = format.level ?? 2;
  const headingClass = isHeading
    ? level === 1
      ? 'text-3xl'
      : level === 2
        ? 'text-2xl'
        : level === 3
          ? 'text-xl'
          : level === 4
            ? 'text-lg'
            : level === 5
              ? 'text-base'
              : 'text-sm'
    : 'text-base';

  const style: React.CSSProperties = {};
  if (typeof format.fontSize === 'number') {
    style.fontSize = `${format.fontSize}pt`;
  } else if (typeof format.fontSize === 'string' && format.fontSize.trim()) {
    style.fontSize = format.fontSize.trim();
  }
  // text color (optional) – prefer new `fontColor`, fallback to legacy `textColor`
  const colorPref = (format as any)?.fontColor ?? (format as any)?.textColor;
  if (typeof colorPref === 'string' && colorPref.trim()) {
    style.color = colorPref.trim();
  }

  const textClasses = [
    'leading-tight text-gray-900',
    headingClass,
    caseClass,
    format.bold ? 'font-semibold' : undefined,
    format.italic ? 'italic' : undefined,
    format.underline ? 'underline' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {format.prefix ?? ''}
      {TITLE_SAMPLE}
      {format.suffix ?? ''}
    </>
  );

  const inner =
    format.kind === 'list-item' ? (
      // Use inline-flex wrapped by a block container with text alignment,
      // so alignment (left/center/right/justify) is visible.
      <div className={alignClass + ' w-full'}>
        <div className="inline-flex items-start gap-2">
          <span className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
          <div className={textClasses} style={style}>
            {content}
          </div>
        </div>
      </div>
    ) : (
      <div
        className={[alignClass, 'w-full', textClasses]
          .filter(Boolean)
          .join(' ')}
        style={style}
      >
        {content}
      </div>
    );

  const decor = format.decor;
  if (!decor) return inner;

  const wrapperStyle: React.CSSProperties = {};
  if (decor.fill?.kind === 'custom' && decor.fill.color) {
    wrapperStyle.backgroundColor = decor.fill.color;
  }

  return (
    <div
      className="w-full bp-decor bp-border"
      data-bp-weight={decor.weight ?? 'thin'}
      data-bp-color={decor.color ?? 'black'}
      data-bp-fill={decor.fill?.kind ?? 'none'}
      data-bp-fill-token={decor.fill?.token}
      style={wrapperStyle}
    >
      {inner}
    </div>
  );
}

// -------- Preset library preview helpers (aligned with TitlePresetDropdown) --------
const TITLE_SAMPLE_TEXT = "Titre d'exemple";

function getHeadingSizeClass(level?: number) {
  switch (level) {
    case 1:
      return 'text-3xl';
    case 2:
      return 'text-2xl';
    case 3:
      return 'text-xl';
    case 4:
      return 'text-lg';
    case 5:
      return 'text-base';
    case 6:
      return 'text-sm';
    default:
      return 'text-2xl';
  }
}

function getAlignmentClass(align?: TitlePreset['format']['align']) {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    case 'justify':
      return 'text-justify';
    default:
      return 'text-left';
  }
}

function getCaseClass(caseOption?: TitlePreset['format']['case']) {
  switch (caseOption) {
    case 'uppercase':
      return 'uppercase';
    case 'capitalize':
      return 'capitalize';
    case 'lowercase':
      return 'lowercase';
    default:
      return undefined;
  }
}

function getTextClasses(format: TitlePreset['format']) {
  const baseSize =
    format.kind === 'heading' ? getHeadingSizeClass(format.level) : 'text-base';
  return [
    'block leading-tight text-gray-900',
    baseSize,
    getAlignmentClass(format.align),
    getCaseClass(format.case),
    format.bold ? 'font-semibold' : undefined,
    format.italic ? 'italic' : undefined,
    format.underline ? 'underline' : undefined,
  ]
    .filter(Boolean)
    .join(' ');
}

function buildSampleText(sampleText: string, format: TitlePreset['format']) {
  const segments: string[] = [];
  if (format.prefix) segments.push(format.prefix);
  segments.push(sampleText);
  if (format.suffix) segments.push(format.suffix);
  return segments.join('');
}

type LibraryItem = {
  id: string;
  label: string;
  format: TitleFormatSpec;
  source: 'builtin' | 'db';
};

export default function TitleStyleModale({
  open,
  initial,
  onCancel,
  onSave,
}: Props) {
  // Default format for "+Nouveau style"
  const NEW_STYLE_DEFAULT: TitleFormatSpec = React.useMemo(
    () => ({
      kind: 'paragraph',
      fontSize: 12,
      bold: true,
      underline: true,
      align: 'left',
      case: 'none',
    }),
    [],
  );
  const [format, setFormat] = React.useState<TitleFormatSpec>(
    normalizeInitial(initial),
  );
  const [mode, setMode] = React.useState<'library' | 'editor'>('library');
  const [items, setItems] = React.useState<LibraryItem[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState<boolean>(false);
  const toast = useToastStore();

  React.useEffect(() => {
    if (!open) return;
    // Reset to library on open and reset format
    setMode('library');
    const next = normalizeInitial(initial);
    next.kind = 'paragraph';
    setFormat(next);

    async function load() {
      setLoading(true);
      try {
        // Built-in presets
        const builtinItems: LibraryItem[] = Object.values(
          DEFAULT_TITLE_PRESETS,
        ).map((p) => ({
          id: p.id,
          label: p.label,
          format: p.format,
          source: 'builtin',
        }));

        // DB presets
        type DbPreset = {
          id: string;
          target: 'TITLE' | 'SUBTITLE' | 'PARAGRAPH';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style: any;
          visibility?: 'PUBLIC' | 'PRIVATE';
        };
        let dbItems: LibraryItem[] = [];
        try {
          const dbList = await apiFetch<DbPreset[]>(
            '/api/v1/style-presets?target=TITLE',
          );
          dbItems = (dbList ?? [])
            .filter((it) => it && it.style)
            .map((it) => ({
              id: it.id,
              label: formatToPresetName(it.style as TitleFormatSpec),
              format: it.style as TitleFormatSpec,
              source: 'db' as const,
            }));
        } catch (e) {
          console.warn('Failed to load DB style presets', e);
        }

        const all = [...dbItems, ...builtinItems];
        setItems(all);
        setSelectedId(all[0]?.id ?? null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [open, initial]);

  const updateFormat = (patch: Partial<TitleFormatSpec>) => {
    setFormat((prev) => ({ ...prev, ...patch }));
  };

  const updateDecor = (patch: Partial<TitleDecorSpec>) => {
    setFormat((prev) => ({
      ...prev,
      decor: { ...(prev.decor ?? {}), ...patch },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        target: 'TITLE' as const,
        style: format,
      };
      const result = await createOrGetStylePreset(body);
      if (result?.created) {
        toast.show('Style enregistré dans les presets', { type: 'success' });
      } else {
        toast.show('Style déjà présent, preset réutilisé', { type: 'info' });
      }
    } catch (e) {
      console.error(e);
      toast.show("Impossible d'enregistrer le preset", { type: 'error' });
    } finally {
      setSaving(false);
      onSave(format);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onPointerDownOutside={onCancel}
        onEscapeKeyDown={onCancel}
        size="xl"
        className={
          mode === 'library'
            ? 'flex flex-col max-h-[80vh] overflow-hidden'
            : undefined
        }
      >
        {mode === 'library' ? (
          <>
            <DialogHeader>
              <DialogTitle>Bibliothèque de styles</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 h-full min-h-0">
              <div className="flex justify-end items-center">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    // Start a brand-new style with clean defaults
                    setFormat(NEW_STYLE_DEFAULT);
                    setMode('editor');
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Nouveau style
                </Button>
              </div>
              <div className="flex-1 min-h-0 border rounded-md divide-y overflow-y-auto">
                {loading ? (
                  <div className="p-3 text-sm text-gray-500">Chargement…</div>
                ) : items.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">
                    Aucun style disponible
                  </div>
                ) : (
                  items.map((it) => {
                    const isSelected = selectedId === it.id;
                    const previewPreset: TitlePreset = {
                      id: it.id,
                      label: it.label,
                      format: it.format,
                    };
                    const textClasses = getTextClasses(previewPreset.format);
                    const style: React.CSSProperties = {};
                    if (typeof previewPreset.format.fontSize === 'number') {
                      style.fontSize = `${previewPreset.format.fontSize}pt`;
                    } else if (
                      typeof previewPreset.format.fontSize === 'string' &&
                      previewPreset.format.fontSize.trim()
                    ) {
                      style.fontSize = previewPreset.format.fontSize.trim();
                    }
                    const colorPref =
                      (previewPreset.format as any)?.fontColor ??
                      (previewPreset.format as any)?.textColor;
                    if (typeof colorPref === 'string' && colorPref.trim()) {
                      style.color = colorPref.trim();
                    }
                    const displayText = buildSampleText(
                      TITLE_SAMPLE_TEXT,
                      previewPreset.format,
                    );
                    const inner =
                      previewPreset.format.kind === 'list-item' ? (
                        <div className="w-full">
                          <div className="inline-flex items-start gap-2">
                            <span className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                            <div
                              className={[textClasses, 'flex-1'].join(' ')}
                              style={style}
                            >
                              {displayText}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className={textClasses} style={style}>
                          {displayText}
                        </span>
                      );
                    const decor = previewPreset.format.decor;
                    const preview = decor ? (
                      <div
                        className="bp-decor bp-border w-full"
                        data-bp-weight={decor.weight ?? 'thin'}
                        data-bp-color={decor.color ?? 'black'}
                        data-bp-fill={decor.fill?.kind ?? 'none'}
                        data-bp-fill-token={decor.fill?.token}
                        style={{
                          ...(decor.fill?.kind === 'custom' && decor.fill.color
                            ? { backgroundColor: decor.fill.color }
                            : {}),
                        }}
                      >
                        {inner}
                      </div>
                    ) : (
                      inner
                    );

                    return (
                      <div
                        key={it.id}
                        className={cn(
                          'flex items-center gap-3 p-3 hover:bg-gray-200 cursor-pointer',
                          isSelected && 'bg-primary-100',
                        )}
                        onClick={() => setSelectedId(it.id)}
                      >
                        <Check
                          className={cn(
                            'h-4 w-4 text-primary-600 transition-opacity',
                            isSelected ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          {preview}
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {previewPreset.label}
                          </div>
                        </div>
                        {it.source === 'db' ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormat(it.format);
                              setMode('editor');
                            }}
                            className="shrink-0"
                            title="Modifier ce style"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={onCancel}>
                Fermer
              </Button>
              <Button
                onClick={() => {
                  const chosen = items.find((i) => i.id === selectedId);
                  if (!chosen) return onCancel();
                  onSave(chosen.format);
                }}
                disabled={!selectedId}
              >
                Appliquer
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode('library')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Retour
                  </Button>
                  <DialogTitle>Nouveau style</DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-6">
              {/* Preview */}
              <div className="space-y-3">
                <div className="text-xs text-gray-500">Aperçu :</div>
                <div className="rounded p-3">
                  <Preview format={format} />
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {/* Paragraphe: puces */}
                <div className="grid grid-cols-2 gap-2 items-end">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Paragraphe
                    </label>
                    <Select
                      value={format.kind === 'list-item' ? 'bullets' : 'none'}
                      onValueChange={(v) =>
                        updateFormat({
                          kind: v === 'bullets' ? 'list-item' : 'paragraph',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Puces" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sans puces</SelectItem>
                        <SelectItem value="bullets">
                          <div className="flex items-center gap-2">
                            <ListIcon className="w-4 h-4" />
                            <span>Puces</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Align + Case */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Alignement
                    </label>
                    <Select
                      value={format.align ?? 'left'}
                      onValueChange={(v) =>
                        updateFormat({ align: v as TitleFormatSpec['align'] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Alignement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Gauche</SelectItem>
                        <SelectItem value="center">Centré</SelectItem>
                        <SelectItem value="right">Droite</SelectItem>
                        <SelectItem value="justify">Justifié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Casse
                    </label>
                    <Select
                      value={format.case ?? 'none'}
                      onValueChange={(v) =>
                        updateFormat({ case: v as TitleFormatSpec['case'] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Casse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        <SelectItem value="uppercase">MAJUSCULE</SelectItem>
                        <SelectItem value="capitalize">Capitaliser</SelectItem>
                        <SelectItem value="lowercase">minuscule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Font size (pt dropdown) + text styles */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Taille (pt)
                    </label>
                    <Select
                      value={
                        typeof format.fontSize === 'number'
                          ? String(format.fontSize)
                          : format.fontSize &&
                              /\d+/.test(String(format.fontSize))
                            ? String(parseInt(String(format.fontSize), 10))
                            : '12'
                      }
                      onValueChange={(v) =>
                        updateFormat({ fontSize: parseInt(v, 10) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Taille" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          '8',
                          '9',
                          '10',
                          '11',
                          '12',
                          '13',
                          '14',
                          '16',
                          '18',
                          '20',
                          '22',
                          '24',
                          '26',
                          '28',
                          '36',
                          '48',
                          '72',
                        ].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-3">
                    <label className="text-xs text-gray-500">Style</label>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={!!format.bold}
                        onChange={(e) =>
                          updateFormat({ bold: e.target.checked })
                        }
                      />
                      <span>Gras</span>
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={!!format.italic}
                        onChange={(e) =>
                          updateFormat({ italic: e.target.checked })
                        }
                      />
                      <span>Italique</span>
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={!!format.underline}
                        onChange={(e) =>
                          updateFormat({ underline: e.target.checked })
                        }
                      />
                      <span>Souligné</span>
                    </label>
                  </div>
                </div>

                {/* Couleur du texte */}
                <ColorDropdown
                  label="Couleur du texte"
                  selectedHex={
                    typeof (format as any)?.fontColor === 'string' &&
                    (format as any).fontColor
                      ? (format as any).fontColor
                      : ((format as any)?.textColor ?? null)
                  }
                  onSelectHex={(hex) =>
                    setFormat((prev) => {
                      const next: any = { ...(prev as any) };
                      // migrate to `fontColor`
                      next.fontColor = hex ?? '';
                      // keep legacy key clean if present
                      if ('textColor' in next && next.textColor && hex) {
                        delete next.textColor;
                      }
                      return next as TitleFormatSpec;
                    })
                  }
                />

                {/* Decor */}
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">Décoration</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Poids
                      </label>
                      <Select
                        value={format.decor?.weight ?? 'none'}
                        onValueChange={(v) =>
                          updateDecor({
                            weight: v as NonNullable<TitleDecorSpec['weight']>,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Poids" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          <SelectItem value="thin">Fin</SelectItem>
                          <SelectItem value="medium">Moyen</SelectItem>
                          <SelectItem value="thick">Épais</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <ColorDropdown
                      label="Remplissage"
                      selectedToken={
                        format.decor?.fill?.kind === 'token'
                          ? (format.decor?.fill?.token ?? null)
                          : null
                      }
                      selectedHex={
                        format.decor?.fill?.kind === 'custom'
                          ? (format.decor?.fill?.color ?? null)
                          : undefined
                      }
                      onSelectToken={(token) =>
                        updateDecor({
                          fill: token
                            ? { kind: 'token', token }
                            : { kind: 'none' },
                        })
                      }
                      onSelectHex={(hex) =>
                        updateDecor({
                          fill: hex
                            ? { kind: 'custom', color: hex }
                            : { kind: 'none' },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

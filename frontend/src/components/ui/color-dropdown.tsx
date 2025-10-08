import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

type ThemeColor = {
  key: string;
  hex: string;
};

const THEME_COLORS: ThemeColor[] = [
  { key: 'red', hex: '#EF4444' }, // rouge atténué, pour signaler ou mettre en valeur sans agressivité
  { key: 'orange', hex: '#F97316' }, // orange chaleureux, énergie douce
  { key: 'yellow', hex: '#FACC15' }, // jaune soleil clair, lisible en surlignage
  { key: 'green', hex: '#22C55E' }, // vert équilibré, santé, validation
  { key: 'emerald', hex: '#34D399' }, // vert-bleuté apaisant
  { key: 'teal', hex: '#2DD4BF' }, // turquoise frais, vivant sans être saturé
  { key: 'blue', hex: '#3B82F6' }, // bleu clair, classique, rassurant
  { key: 'indigo', hex: '#6366F1' }, // indigo doux, sérieux mais moderne
  { key: 'violet', hex: '#8B5CF6' }, // violet lumineux mais non agressif
  { key: 'pink', hex: '#EC4899' }, // rose chaleureux, humanité, relationnel
  { key: 'slate', hex: '#64748B' }, // gris ardoise neutre, excellent pour du texte discret
  { key: 'stone', hex: '#78716C' }, // neutre chaud, alternatif au gris froid
  { key: 'cyan', hex: '#06B6D4' }, // cyan clair, dynamisme et clarté
  { key: 'sky', hex: '#0EA5E9' }, // bleu ciel, légèreté et ouverture
  { key: 'lime', hex: '#84CC16' }, // vert citron doux, vitalité
  { key: 'rose', hex: '#F43F5E' }, // rose corail, chaleureux et humain
  { key: 'amber', hex: '#F59E0B' }, // ambre doré, chaleureux et rassurant
  { key: 'soft-blue', hex: '#93C5FD' }, // bleu pastel, calme et rassurant
  { key: 'soft-green', hex: '#A7F3D0' }, // vert menthe très doux, sérénité
  { key: 'soft-yellow', hex: '#FEF08A' }, // jaune pâle, lumineux mais non agressif
  { key: 'soft-pink', hex: '#FBCFE8' }, // rose pastel, relationnel, chaleureux
  { key: 'soft-violet', hex: '#DDD6FE' }, // violet lavande clair, apaisant
];

export function ColorSquare({
  color,
  selected,
  onClick,
  title,
}: {
  color: string | null;
  selected?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'relative h-8 w-8 rounded border transition-colors',
        selected ? 'ring-2 ring-primary-500 ring-offset-1' : 'ring-0',
        'border-gray-300',
      )}
      style={{ backgroundColor: color ?? 'transparent' }}
    >
      {color === null ? (
        <span className="absolute inset-0 flex items-center justify-center text-gray-500 select-none">
          ×
        </span>
      ) : null}
    </button>
  );
}

export function ThemeColorPanel({
  label,
  subtitle = 'Couleurs du thème',
  selectedHex,
  selectedToken,
  includeNone = true,
  onSelectHex,
  onSelectToken,
  customLabel = '🎨 Couleur personnalisée…',
  framed = true,
}: {
  label: string;
  subtitle?: string;
  selectedHex?: string | null;
  selectedToken?: string | null;
  includeNone?: boolean;
  onSelectHex?: (hex: string | null) => void;
  onSelectToken?: (token: string | null) => void;
  customLabel?: string;
  framed?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const handleCustomPick = () => inputRef.current?.click();
  const isSelectedThemeHex = (hex: string) =>
    (selectedHex ?? '').toLowerCase() === hex.toLowerCase();
  const isSelectedToken = (key: string) => selectedToken === key;

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={cn('p-3 rounded', framed ? 'border' : '')}>
        <div className="text-xs text-gray-500 mb-2">{subtitle}</div>
        <div className="grid grid-cols-6 gap-2">
          {includeNone ? (
            <ColorSquare
              color={null}
              // "Aucun" should be active only when no fill is selected.
              // Treat undefined as "not provided" and consider both nullish as no fill.
              selected={selectedHex == null && selectedToken == null}
              onClick={() => {
                onSelectHex?.(null);
                onSelectToken?.(null);
              }}
              title="Aucun"
            />
          ) : null}
          {THEME_COLORS.map((c) => (
            <ColorSquare
              key={c.key}
              color={c.hex}
              selected={
                (selectedHex ? isSelectedThemeHex(c.hex) : false) ||
                (selectedToken ? isSelectedToken(c.key) : false)
              }
              onClick={() => {
                onSelectToken?.(c.key);
                onSelectHex?.(c.hex);
              }}
              title={c.key}
            />
          ))}
        </div>
        <div className="mt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCustomPick}
          >
            {customLabel}
          </Button>
          <input
            ref={inputRef}
            type="color"
            className="hidden"
            onChange={(e) => {
              const hex = e.target.value;
              // Selecting a custom color should not clear token via consumer,
              // otherwise it may overwrite the 'custom' fill with 'none'.
              onSelectHex?.(hex);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function ColorDropdown({
  label,
  selectedHex,
  selectedToken,
  onSelectHex,
  onSelectToken,
  includeNone = true,
}: {
  label: string;
  selectedHex?: string | null;
  selectedToken?: string | null;
  onSelectHex?: (hex: string | null) => void;
  onSelectToken?: (token: string | null) => void;
  includeNone?: boolean;
}) {
  const tokenToHex = React.useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of THEME_COLORS) m[c.key] = c.hex;
    return m;
  }, []);

  const activeHex = React.useMemo(() => {
    if (selectedHex && selectedHex.trim()) return selectedHex;
    if (selectedToken && tokenToHex[selectedToken])
      return tokenToHex[selectedToken];
    return null as string | null;
  }, [selectedHex, selectedToken, tokenToHex]);

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-gray-500">{label}</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="inline-flex items-center">
            <ColorSquare color={activeHex} />
            <ChevronDown className="ml-2 h-4 w-4 text-gray-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-0 bg-white">
          <div className="p-2">
            <ThemeColorPanel
              label={label}
              selectedHex={selectedHex}
              selectedToken={selectedToken}
              includeNone={includeNone}
              onSelectHex={onSelectHex}
              onSelectToken={onSelectToken}
              framed={false}
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ColorDropdown;

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, MoreVertical, Check, ExternalLink, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface TrameInfo {
  id: string;
  title: string;
  description?: string | null;
  sharedBy?: string | null;
}

interface TrameCardProps {
  trame: TrameInfo;
  selected?: boolean;
  onSelect?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  showLink?: boolean;
  showDuplicate?: boolean;
  showDelete?: boolean;
}

export default function TrameCard({
  trame,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
  showLink,
  showDuplicate,
  showDelete,
}: TrameCardProps) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        'relative hover:shadow-md hover:bg-wood-100 transition-shadow cursor-pointer max-w-60 w-full',
        selected && 'border-2 border-primary-500 bg-primary-50',
      )}
    >
      {(showDuplicate || showDelete) && (
        <div className="absolute bottom-2 right-2 flex gap-1 z-10">
{/*           {showDuplicate && onDuplicate && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
          )} */}
{/*           {showDelete && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )} */}
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-gray-900 flex items-center gap-1">
          {trame.title}
        </CardTitle>
        {trame.sharedBy && (
          <p className="text-xs text-gray-500">Partagée par {trame.sharedBy}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-sm text-gray-600">{trame.description}</p>
       {/* Barre d’actions (tout en bas, dans le CardContent) */}
        {(showLink || (showDuplicate && onDuplicate) || (showDelete && onDelete)) && (
          <div className="pt-2 flex items-center justify-end gap-1">
            {showLink && (
              <a
                href={`/creation-trame/${trame.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50"
                onClick={(e) => e.stopPropagation()}
                aria-label="Ouvrir la trame dans un nouvel onglet"
                title="Ouvrir"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {showDuplicate && onDuplicate && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                aria-label="Dupliquer la trame"
                title="Dupliquer"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}

            {showDelete && onDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label="Supprimer la trame"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

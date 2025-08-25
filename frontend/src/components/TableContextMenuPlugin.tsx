import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  NodeContextMenuPlugin,
  NodeContextMenuOption,
} from '@lexical/react/LexicalNodeContextMenuPlugin';
import {
  $insertTableRowAtSelection,
  $insertTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $deleteTableColumnAtSelection,
  $isTableCellNode,
} from '@lexical/table';

export function TableContextMenuPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const items = React.useMemo(
    () => [
      new NodeContextMenuOption('➕ Ajouter ligne', {
        $onSelect: () =>
          editor.update(() => {
            $insertTableRowAtSelection();
          }),
        $showOn: $isTableCellNode,
      }),
      new NodeContextMenuOption('➕ Ajouter colonne', {
        $onSelect: () =>
          editor.update(() => {
            $insertTableColumnAtSelection();
          }),
        $showOn: $isTableCellNode,
      }),
      new NodeContextMenuOption('🗑️ Supprimer ligne', {
        $onSelect: () =>
          editor.update(() => {
            $deleteTableRowAtSelection();
          }),
        $showOn: $isTableCellNode,
      }),
      new NodeContextMenuOption('🗑️ Supprimer colonne', {
        $onSelect: () =>
          editor.update(() => {
            $deleteTableColumnAtSelection();
          }),
        $showOn: $isTableCellNode,
      }),
    ],
    [editor],
  );

  return <NodeContextMenuPlugin items={items} />;
}

export default TableContextMenuPlugin;

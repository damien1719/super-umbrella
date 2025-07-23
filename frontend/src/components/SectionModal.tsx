import React, { useState } from 'react';

interface Props {
  section: {
    title: string;
    content: string;
    metadata: Record<string, unknown>;
  } | null;
  onClose: () => void;
}

export default function SectionModal({ section, onClose }: Props) {
  const [title, setTitle] = useState(section?.title ?? '');
  const [content, setContent] = useState(section?.content ?? '');
  if (!section) return null;

  return (
    <div role="dialog">
      <h2>Ajouter une section</h2>
      <label>
        Titre
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Contenu
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </label>
      <button onClick={onClose}>Valider</button>
    </div>
  );
}

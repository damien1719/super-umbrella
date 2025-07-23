import React, { useEffect, useState } from 'react';
import SectionModal from './SectionModal';

interface Section {
  id: number;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
}

interface Props {
  bilanId: string;
}

export default function AiRightPanel({ bilanId }: Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [modalSection, setModalSection] = useState<Section | null>(null);

  useEffect(() => {
    fetch(`/api/bilans/${bilanId}/sections`)
      .then((res) => res.json())
      .then((data) => setSections(data.sections ?? []));
  }, [bilanId]);

  return (
    <aside>
      <h2>AI Panel</h2>
      <ul>
        {sections.map((s) => (
          <li key={s.id}>
            {s.title}{' '}
            <button onClick={() => setModalSection(s)}>Ajouter</button>
          </li>
        ))}
      </ul>
      {modalSection && (
        <SectionModal
          section={modalSection}
          onClose={() => setModalSection(null)}
        />
      )}
    </aside>
  );
}

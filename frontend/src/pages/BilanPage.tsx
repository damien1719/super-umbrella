import React from 'react';
import AiRightPanel from '../components/AiRightPanel';

interface Props {
  bilanId: string;
}

export default function BilanPage({ bilanId }: Props) {
  return (
    <div style={{ display: 'flex' }}>
      <main style={{ flex: 1 }}>
        <h1>Bilan {bilanId}</h1>
        {/* Ici l'éditeur de texte */}
      </main>
      <AiRightPanel bilanId={bilanId} />
    </div>
  );
}

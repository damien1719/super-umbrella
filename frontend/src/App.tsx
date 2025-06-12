import React, { useState } from 'react';

export default function App() {
  const [anneeId, setAnneeId] = useState('');
  const [activityId, setActivityId] = useState('');

  const download = async () => {
    const res = await fetch(
      `/api/v1/cerfa/2031-sd?anneeId=${anneeId}&activityId=${activityId}`
    );
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2031-sd.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Test</h1>
      <input
        type="text"
        placeholder="anneeId"
        value={anneeId}
        onChange={e => setAnneeId(e.target.value)}
      />
      <input
        type="text"
        placeholder="activityId"
        value={activityId}
        onChange={e => setActivityId(e.target.value)}
      />
      <button onClick={download}>Télécharger le Cerfa 2031-SD</button>
    </div>
  );
}

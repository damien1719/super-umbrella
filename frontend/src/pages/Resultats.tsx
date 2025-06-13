import React, { useState } from 'react';
import { downloadCerfa2031 } from "../services/api";


export default function Resultats() {

  console.log("here");

  //const [anneeId, setAnneeId] = useState('');
  //const [activityId, setActivityId] = useState('');

  const anneeId = 345319370
  const activityId= 139054534

  const handleDownload = async () => {
    try {
      const blob = await downloadCerfa2031(anneeId, activityId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "2031-sd.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Échec du téléchargement");
    }
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
      <button onClick={handleDownload}>Télécharger le Cerfa 2031-SD</button>
    </div>
  );
} 
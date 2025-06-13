import React, { useState } from 'react';
import { downloadCerfa2031, downloadCerfa2042 } from "../services/api";


export default function Resultats() {

  console.log("here");

  //const [anneeId, setAnneeId] = useState('');
  //const [activityId, setActivityId] = useState('');

  const anneeId = 345319370
  const activityId= 139054534

  const handleDownload2031 = async () => {
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

  const handleDownload2042 = async () => {
    try {
      const blob = await downloadCerfa2042(anneeId, activityId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "2042_5124.pdf";
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
      <button onClick={handleDownload2031}>Télécharger le Cerfa 2031-SD</button>
      <button onClick={handleDownload2042}>Télécharger le Cerfa 2042</button>
    </div>
  );
}

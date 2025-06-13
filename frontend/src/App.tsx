import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Resultats from './pages/Resultats';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Resultats />} />
        <Route path="/Resultats" element={<Resultats />} />
        {/* tes autres pages */}
      </Routes>
    </BrowserRouter>
  );
}

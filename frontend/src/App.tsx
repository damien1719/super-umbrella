import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import BilanPage from './pages/BilanPage';

function BilanWrapper() {
  const { id } = useParams();
  if (!id) return null;
  return <BilanPage bilanId={id} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Test</h1>} />
        <Route path="/bilan/:id" element={<BilanWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

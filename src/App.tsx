import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import Hero from './components/layout/Hero'
import Features from './components/layout/Features'
import MolecularViewer from './components/molecular/MolecularViewer'
import AlphaFoldPredictor from './components/molecular/AlphaFoldPredictor'
import AIAnalysis from './components/molecular/AIAnalysis'
// ...existing code...
import PDBSearch from './components/molecular/PDBSearch'
// ...existing code...
import Footer from './components/layout/Footer'
// Removed Turnstile verification page

import { useState, useEffect } from 'react';

function App() {
  // Removed Turnstile gating; app renders directly

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Hero />
              <Features />
            </motion.div>
          } />
          <Route path="/viewer" element={<MolecularViewer />} />
          <Route path="/predict" element={<AlphaFoldPredictor />} />
          <Route path="/analysis" element={<AIAnalysis />} />
// ...existing code...
          <Route path="/search" element={<PDBSearch />} />
// ...existing code...
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App

import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ImageDetectionPage from './pages/ImageDetectionPage';
import VideoDetectionPage from './pages/VideoDetectionPage';
import AboutPage from './pages/AboutPage';
import HowToUsePage from './pages/HowToUsePage';
import TermsPrivacyPage from './pages/TermsPrivacyPage';
import ContactPage from './pages/ContactPage';
import Footer from './components/Footer';
import MouseFollower from './components/MouseFollower';
import ContextMenu from './components/ContextMenu';

function App() {
  return (
    <Router>
      <MouseFollower />
      <ContextMenu />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/image-detection" element={<ImageDetectionPage />} />
        <Route path="/video-detection" element={<VideoDetectionPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-to-use" element={<HowToUsePage />} />
        <Route path="/terms-privacy" element={<TermsPrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;

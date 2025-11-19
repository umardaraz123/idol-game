import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Songs from './components/Songs';
import GameHighlights from './components/GameHighlights';
import WhoIsAna from './components/WhoIsAna';
import Features from './components/Features';
import ArtistTeam from './components/ArtistTeam';
import Footer from './components/Footer';
import AdminLogin from './admin/pages/AdminLogin';
import Dashboard from './admin/pages/Dashboard';
import ContentManagement from './admin/pages/ContentManagement';
import GameHighlightsManagement from './admin/pages/GameHighlightsManagement';
import FeaturesManagement from './admin/pages/FeaturesManagement';
import TeamManagement from './admin/pages/TeamManagement';
import HeroManagement from './admin/pages/HeroManagement';
import AboutFeaturesManagement from './admin/pages/AboutFeaturesManagement';
import QueriesManagement from './admin/pages/QueriesManagement';
import SongsManagement from './admin/pages/SongsManagement';
import FooterManagement from './admin/pages/FooterManagement';
import LogoManagement from './admin/pages/LogoManagement';
import AdminLayout from './admin/components/AdminLayout';
import ProtectedRoute from './admin/components/ProtectedRoute';
import './App.css';

// Main landing page component
const MainSite = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <div className="App">
      <Navbar />
      <section id="home">
        <Hero />
      </section>
      <section id="songs">
        <Songs />
      </section>
      <section id="about">
        <About />
      </section>
      <section id="highlights">
        <GameHighlights />
      </section>
      <section id="ana">
        <WhoIsAna />
      </section>
      <section id="features">
        <Features />
      </section>
      <section id="team">
        <ArtistTeam />
      </section>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            {/* Main website routes */}
            <Route path="/" element={<MainSite />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="hero" element={<HeroManagement />} />
            <Route path="about-features" element={<AboutFeaturesManagement />} />
            <Route path="game-highlights" element={<GameHighlightsManagement />} />
            <Route path="features" element={<FeaturesManagement />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="songs" element={<SongsManagement />} />
            <Route path="queries" element={<QueriesManagement />} />
            <Route path="footer" element={<FooterManagement />} />
            <Route path="logo" element={<LogoManagement />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;

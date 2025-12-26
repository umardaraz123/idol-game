import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ContentProvider } from './context/ContentContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Songs from './components/Songs';
import GameHighlights from './components/GameHighlights';
import WhoIsAna from './components/WhoIsAna';
// import Features from './components/Features'; // Commented out - Why Choose Idol Be section
import ArtistTeam from './components/ArtistTeam';
import AboutUs from './components/AboutUs';
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

    // Content Protection: Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Content Protection: Disable keyboard shortcuts for copy/save/print/source
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S (Save), Ctrl+C (Copy), Ctrl+U (View Source), Ctrl+P (Print), Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && (
        e.key === 's' || e.key === 'S' ||
        e.key === 'c' || e.key === 'C' ||
        e.key === 'u' || e.key === 'U' ||
        e.key === 'p' || e.key === 'P' ||
        (e.shiftKey && (e.key === 'i' || e.key === 'I'))
      )) {
        e.preventDefault();
        return false;
      }
      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    // Content Protection: Disable drag on images and videos
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
        e.preventDefault();
        return false;
      }
    };

    // Content Protection: Disable copy event
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('copy', handleCopy);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  return (
    <div className="App content-protected no-context-menu">
      <Navbar />
      {/* 1. Image */}
      <section id="home">
        <Hero />
      </section>
      {/* 2. What is Idol be */}
      <section id="about">
        <About />
      </section>
      {/* 3. Who is Ana */}
      <section id="ana">
        <WhoIsAna />
      </section>
      {/* 4. Example song */}
      <div id="songs">
        <Songs />
      </div>
      {/* 5. Join to the journey - Why Choose Idol Be commented out for now */}
      {/* <section id="features">
        <Features />
      </section> */}
      <section id="highlights">
        <GameHighlights />
      </section>
      {/* 6. Artistic team */}
      <section id="team">
        <ArtistTeam />
      </section>
      {/* 7. About us */}
      <section id="aboutus">
        <AboutUs />
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
            <Route path="/" element={<ContentProvider><MainSite /></ContentProvider>} />

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

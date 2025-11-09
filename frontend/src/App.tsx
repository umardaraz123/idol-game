import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Hero from './components/Hero';
import About from './components/About';
import GameHighlights from './components/GameHighlights';
import WhoIsAna from './components/WhoIsAna';
import Features from './components/Features';
import ArtistTeam from './components/ArtistTeam';
import Footer from './components/Footer';
import './App.css';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <div className="App">
      <Hero />
      <About />
      <GameHighlights />
      <WhoIsAna />
      <Features />
      <ArtistTeam />
      <Footer />
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from '../assets/images/logo.png';
import { logoAPI } from '../services/api';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

interface Logo {
  logoUrl: string;
  altText: string;
  width: number;
  height: number;
  isActive: boolean;
}

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [dynamicLogo, setDynamicLogo] = useState<Logo | null>(null);

  // Fetch logo from API
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await logoAPI.get();
        if (response.data.data?.logo) {
          setDynamicLogo(response.data.data.logo);
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
        // Silently fail and use default logo
      }
    };

    fetchLogo();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);

      // Update active section based on scroll position
      const sections = ['home', 'about', 'highlights', 'ana', 'features', 'team', 'game'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
    setActiveSection(sectionId);
  };

  const menuItems = [
    { id: 'about', label: 'About' },
    { id: 'ana', label: 'Ana' },
    { id: 'features', label: 'Features' },
    { id: 'team', label: 'Team' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <a href="#home" className="navbar-logo" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
          <img 
            src={dynamicLogo?.logoUrl || logo} 
            alt={dynamicLogo?.altText || "Idol Be Logo"} 
            className="logo-image"
          />
        </a>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => scrollToSection(item.id)}
            >
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
          
          {/* Language Switcher */}
          <div className="navbar-language">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-items">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => scrollToSection(item.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
          
          {/* Language Switcher in Mobile Menu */}
          <div className="mobile-language-switcher">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

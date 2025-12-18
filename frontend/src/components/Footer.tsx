import { useState, useEffect } from 'react';
import { useFooter } from '../context/ContentContext';
import ContactModal from './ContactModal';
import './Footer.css';

const Footer = () => {
  const { footer: footerData, isLoading: loading } = useFooter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return <footer className="footer"><div className="container">Loading...</div></footer>;
  }

  if (!footerData) {
    return <footer className="footer"><div className="container">Footer data not available</div></footer>;
  }

  return (
    <footer className="footer">
      <div className="footer-glow"></div>

      <div className="container">
        <div className="footer-content">
          {/* Left Column */}
          <div className="footer-brand">
            {footerData.leftColumn.title && (
              <a href="#about" className="footer-logo-link">
                <h3 className="footer-logo">{footerData.leftColumn.title}</h3>
              </a>
            )}
            {footerData.leftColumn.subtitle && <p className="footer-tagline">{footerData.leftColumn.subtitle}</p>}
            {footerData.leftColumn.description && <p className="footer-description">{footerData.leftColumn.description}</p>}
          </div>

          {/* Center Column */}
          <div className="footer-social">
            {footerData.centerColumn.title && (
              <h4
                className="footer-heading footer-heading-clickable"
                onClick={() => setIsModalOpen(true)}
                style={{ cursor: 'pointer' }}
              >
                {footerData.centerColumn.title}
              </h4>
            )}
            {footerData.centerColumn.subtitle && <p className="footer-tagline">{footerData.centerColumn.subtitle}</p>}
            {footerData.centerColumn.description && <p className="contact-text">{footerData.centerColumn.description}</p>}

            {/* Social Icons - Commented out
            {footerData.socialIcons.length > 0 && (
              <div className="social-icons">
                {footerData.socialIcons
                  .filter(icon => icon.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((icon, index) => (
                    <a 
                      key={index}
                      href={icon.url} 
                      className="social-icon" 
                      aria-label={icon.platform}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={icon.iconUrl} alt={icon.platform} style={{ width: '24px', height: '24px' }} />
                    </a>
                  ))
                }
              </div>
            )}
            */}
          </div>

          {/* Right Column */}
          <div className="footer-contact">
            {footerData.rightColumn.title && <h4 className="footer-heading">{footerData.rightColumn.title}</h4>}
            {footerData.rightColumn.subtitle && <p className="footer-tagline">{footerData.rightColumn.subtitle}</p>}
            {footerData.rightColumn.description && <p className="contact-text">{footerData.rightColumn.description}</p>}
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="copyright">
            {footerData.copyrightText || `© ${new Date().getFullYear()} IDOL BE. All rights reserved.`}
          </p>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Floating Scroll to Top Button */}
      <button
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    </footer>
  );
};

export default Footer;

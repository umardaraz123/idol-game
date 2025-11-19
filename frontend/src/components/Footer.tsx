import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { footerAPI } from '../services/api';
import './Footer.css';

interface FooterData {
  leftColumn: {
    title: string;
    subtitle: string;
    description: string;
  };
  centerColumn: {
    title: string;
    subtitle: string;
    description: string;
  };
  rightColumn: {
    title: string;
    subtitle: string;
    description: string;
  };
  socialIcons: Array<{
    platform: string;
    url: string;
    iconUrl: string;
    order: number;
    isActive: boolean;
  }>;
  copyrightText: string;
}

const Footer = () => {
  const { language } = useLanguage();
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterData();
  }, [language]);

  const fetchFooterData = async () => {
    try {
      const response = await footerAPI.get(language);
      setFooterData(response.data.data.footer);
    } catch (error) {
      console.error('Failed to fetch footer data:', error);
    } finally {
      setLoading(false);
    }
  };

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
            {footerData.leftColumn.title && <h3 className="footer-logo">{footerData.leftColumn.title}</h3>}
            {footerData.leftColumn.subtitle && <p className="footer-tagline">{footerData.leftColumn.subtitle}</p>}
            {footerData.leftColumn.description && <p className="footer-description">{footerData.leftColumn.description}</p>}
          </div>

          {/* Center Column */}
          <div className="footer-social">
            {footerData.centerColumn.title && <h4 className="footer-heading">{footerData.centerColumn.title}</h4>}
            {footerData.centerColumn.subtitle && <p className="footer-tagline">{footerData.centerColumn.subtitle}</p>}
            {footerData.centerColumn.description && <p className="contact-text">{footerData.centerColumn.description}</p>}
            
            {/* Social Icons */}
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
    </footer>
  );
};

export default Footer;

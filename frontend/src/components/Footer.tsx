import { FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaDiscord } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-glow"></div>
      
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <h3 className="footer-logo">IDOL BE</h3>
            <p className="footer-tagline">Sing Your Dream</p>
            <p className="footer-description">
              Created by Jacinto Jiménez. A game made by real people, no AI involved.
            </p>
          </div>

          {/* Social Media */}
          <div className="footer-social">
            <h4 className="footer-heading">Connect With Us</h4>
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="social-icon" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="social-icon" aria-label="YouTube">
                <FaYoutube />
              </a>
              <a href="#" className="social-icon" aria-label="Discord">
                <FaDiscord />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h4 className="footer-heading">Get In Touch</h4>
            <p className="contact-text">
              We'd love to hear your questions, suggestions, or anything else that comes to mind!
            </p>
            <a href="mailto:contact@idolbe.com" className="contact-link">
              contact@idolbe.com
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} Idol be. Created by Jacinto Jiménez. All rights reserved.
          </p>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <span className="separator">•</span>
            <a href="#" className="footer-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { FaMicrophone, FaUsers, FaPalette, FaGlobe } from 'react-icons/fa';
import type { ReactElement } from 'react';
import './Features.css';

interface Feature {
  id: number;
  icon: ReactElement;
  title: string;
  description: string;
}

const Features = () => {
  const features: Feature[] = [
    {
      id: 1,
      icon: <FaMicrophone />,
      title: 'Original Music',
      description: '20 completely original pop songs composed by talented artists from diverse backgrounds.',
    },
    {
      id: 2,
      icon: <FaUsers />,
      title: 'Online Multiplayer',
      description: 'Compete with players worldwide and showcase your singing talents in real-time battles.',
    },
    {
      id: 3,
      icon: <FaPalette />,
      title: 'Customize Looks',
      description: 'Unlock 20+ unique outfits and styles to make your idol stand out from the crowd.',
    },
    {
      id: 4,
      icon: <FaGlobe />,
      title: 'Multi-Language',
      description: 'Available in 7 languages: Spanish, English, Mandarin, Russian, Korean, Japanese, and Hindi.',
    },
  ];

  return (
    <section className="features-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2 className="section-title">
            Why Choose <span className="text-glow-blue">Idol be?</span>
          </h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">
            Experience gaming the way it should be - fair, fun, and full of creativity
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="feature-icon-container">
                <div className="feature-icon">{feature.icon}</div>
                <div className="icon-glow"></div>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-border"></div>
            </div>
          ))}
        </div>

        {/* Extra Info */}
        <div className="features-extra" data-aos="zoom-in" data-aos-delay="400">
          <div className="extra-card">
            <h3 className="extra-title">No Hidden Costs</h3>
            <p className="extra-description">
              Enjoy the complete gaming experience without ads, loot boxes, or pay-to-win mechanics. 
              When you purchase Idol be, you own the full game with all its content.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

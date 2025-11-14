import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { publicAPI } from '../services/api';
import './Features.css';

interface Feature {
  _id: string;
  title: string; // Localized string from API
  description: string; // Localized string from API
  imageUrl?: string;
  metadata: {
    order: number;
    isActive: boolean;
  };
}

const Features = () => {
  const { language } = useLanguage();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await publicAPI.getContent(language, { type: 'features' });
        const contentData = response.data.data.content?.features || [];
        console.log('Features data received:', contentData);
        setFeatures(
          Array.isArray(contentData) 
            ? contentData.sort((a: any, b: any) => a.metadata.order - b.metadata.order)
            : []
        );
      } catch (error) {
        console.error('Failed to fetch features:', error);
        setFeatures([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [language]);

  if (loading) {
    return (
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Loading...</h2>
          </div>
        </div>
      </section>
    );
  }

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
              key={feature._id}
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="feature-icon-container">
                <div className="feature-icon">
                  {feature.imageUrl ? (
                    <img src={feature.imageUrl} alt={feature.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span>⭐</span>
                  )}
                </div>
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

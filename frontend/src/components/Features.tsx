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
  const [sectionHeader, setSectionHeader] = useState({
    title: 'Why Choose Idol be?',
    subtitle: 'Experience gaming the way it should be - fair, fun, and full of creativity'
  });

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setLoading(true);
        const response = await publicAPI.getContent(language);
        const contentData = response.data.data.content;
        
        console.log('Full API response:', response.data);
        console.log('Content data:', contentData);
        
        // The API returns data with the type as the key (e.g., content.features, content.artist_team)
        const featuresData = contentData?.features || [];
        
        console.log('Features data:', featuresData);
        
        if (!Array.isArray(featuresData)) {
          console.warn('Features data is not an array:', featuresData);
          setFeatures([]);
          setLoading(false);
          return;
        }
        
        // Separate header from features
        const headerItem = featuresData.find((item: any) => item.key === 'features_section_header');
        const featureItems = featuresData.filter((item: any) => 
          item.key !== 'features_section_header' && item.metadata?.isActive !== false
        );
        
        // Update header if found
        if (headerItem) {
          const newHeader = {
            title: headerItem.title || 'Why Choose Idol be?',
            subtitle: headerItem.subtitle || headerItem.description || 'Experience gaming the way it should be - fair, fun, and full of creativity'
          };
          console.log('Setting header:', newHeader);
          setSectionHeader(newHeader);
        } else {
          console.warn('⚠️ No header item found with key "features_section_header"');
        }
        
        // Update features list - map to ensure correct structure
        const mappedFeatures = featureItems
          .sort((a: any, b: any) => (a.metadata?.order || 0) - (b.metadata?.order || 0))
          .map((item: any) => ({
            _id: item._id,
            title: item.title || '',
            description: item.description || '',
            imageUrl: item.imageUrl,
            metadata: item.metadata || { order: 0, isActive: true }
          }));
        
        console.log('Final mapped features:', mappedFeatures);
        setFeatures(mappedFeatures);
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
            <span className="text-glow-blue">{sectionHeader.title}</span>
          </h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">
            {sectionHeader.subtitle}
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

        
      </div>
    </section>
  );
};

export default Features;

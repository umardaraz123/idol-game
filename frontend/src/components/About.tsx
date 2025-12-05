import { useState, useEffect } from 'react';
import { publicAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ContactModal from './ContactModal';
import './About.css';

interface AboutContent {
  title: string;
  subtitle: string;
  description: string;
}

interface AboutFeature {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  metadata: {
    order: number;
    isActive: boolean;
  };
}

const About = () => {
  const { language } = useLanguage();
  const [content, setContent] = useState<AboutContent>({
    title: 'What is Idol be?',
    subtitle: 'About the Game',
    description: 'Idol be is a casual singing game designed for people who love to sing. The gameplay is beautifully simple: listen to a song, sing along, and receive a score that unlocks new songs and unique looks for your idol.'
  });
  const [features, setFeatures] = useState<AboutFeature[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch content from backend
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await publicAPI.getContent(language);
        const contentData = response.data.data.content;
        
        // Get about_section content
        const aboutData = contentData?.about_section || [];
        
        console.log('About Data:', aboutData, 'Language:', language); // Debug
        
        if (aboutData && aboutData.length > 0) {
          // Get main content for title/description - specifically look for "aboutcontent" key or "What is Idol be" title
          // Exclude any content related to "who_is_ana" or "Who is Ana"
          const mainContent = aboutData.find((item: any) => 
            (item.key === 'aboutcontent' || item.title?.toLowerCase().includes('idol be')) &&
            item.metadata?.category === 'main' &&
            !item.key?.includes('who_is_ana') &&
            !item.title?.toLowerCase().includes('ana')
          ) || aboutData.find((item: any) => 
            item.metadata?.category === 'main' &&
            !item.key?.includes('who_is_ana') &&
            !item.title?.toLowerCase().includes('ana')
          );
          
          // Get feature items - exclude who_is_ana related content
          const featureItems = aboutData
            .filter((item: any) => 
              item.metadata?.category === 'feature' && 
              item.metadata?.isActive &&
              !item.key?.includes('who_is_ana')
            )
            .sort((a: any, b: any) => (a.metadata?.order || 0) - (b.metadata?.order || 0));
          
          console.log('Selected About Content:', mainContent); // Debug
          console.log('About Features:', featureItems); // Debug
          
          if (mainContent) {
            setContent({
              title: mainContent.title || 'What is Idol be?',
              subtitle: mainContent.subtitle || 'About the Game',
              description: mainContent.description || 'Idol be is a casual singing game designed for people who love to sing. The gameplay is beautifully simple: listen to a song, sing along, and receive a score that unlocks new songs and unique looks for your idol.'
            });
          }
          
          setFeatures(featureItems);
        }
      } catch (error) {
        console.error('Failed to fetch About content:', error);
        // Keep default content on error
      }
    };

    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return (
    <section id="about" className="about-section">
      <div className="about-bg-particles"></div>
      <div className="container">
        <div className="row align-items-center g-5">
          {/* commented by umar - Left Column - Image/Video
          <div className="col-lg-6 col-md-12" data-aos="fade-right" data-aos-duration="1000">
            <div className="about-media-wrapper">
              <div className="media-frame">
                <div className="about-placeholder">
                  <div className="placeholder-icon">🎤</div>
                  <div className="placeholder-text">Idol be</div>
                </div>
                <div className="media-border-glow"></div>
              </div>
              <div className="floating-badge badge-1">
                <div className="badge-icon">🎵</div>
                <div className="badge-text">20 Songs</div>
              </div>
              <div className="floating-badge badge-2">
                <div className="badge-icon">🌍</div>
                <div className="badge-text">7 Languages</div>
              </div>
              <div className="floating-badge badge-3">
                <div className="badge-icon">✨</div>
                <div className="badge-text">20+ Looks</div>
              </div>
            </div>
          </div>
          */}

          {/* Right Column - Content */}
          <div className="col-lg-6 col-md-12" data-aos="fade-left" data-aos-duration="1000">
            <div className="about-content">
              {/* <div className="section-tag">{content.subtitle}</div> */}
              <h2 className="section-title">
                <span className="text-glow-blue">{content.title}</span>
              </h2>
              <div className="title-underline"></div>
              
              <p className="about-text lead-text">
                {content.description}
              </p>
              
              <div id="features" className="feature-list">
                {features.length > 0 ? (
                  features.map((feature) => (
                    <div key={feature._id} className="feature-item">
                      <div className="feature-icon">
                        {feature.imageUrl ? (
                          <img src={feature.imageUrl} alt={feature.title} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                        ) : (
                          '🎵'
                        )}
                      </div>
                      <div className="feature-content">
                        <h4>{feature.title}</h4>
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="feature-item">
                      <div className="feature-icon">🎤</div>
                      <div className="feature-content">
                        <h4>20 Original Pop Songs</h4>
                        <p>Completely original music composed by talented artists worldwide</p>
                      </div>
                    </div>
                    
                    <div className="feature-item">
                      <div className="feature-icon">👥</div>
                      <div className="feature-content">
                        <h4>Online Multiplayer</h4>
                        <p>Show off your singing skills to players around the world</p>
                      </div>
                    </div>
                    
                    <div className="feature-item">
                      <div className="feature-icon">🌐</div>
                      <div className="feature-content">
                        <h4>Multi-Language Support</h4>
                        <p>Available in Spanish, English, Mandarin, Russian, Korean, Japanese, and Hindi</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

           

              {/* <div className="cta-box">
                <h4 className="cta-title">We Want to Hear From You!</h4>
                <p className="cta-text">
                  Join the Idol be community! We'd love to hear your questions, suggestions, 
                  or anything else that comes to mind. Your feedback helps us create the best 
                  singing experience possible.
                </p>
                <button 
                  className="btn-neon purple"
                  onClick={() => setIsModalOpen(true)}
                >
                  Join Our Community
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default About;

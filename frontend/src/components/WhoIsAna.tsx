import { useState, useEffect } from 'react';
import { publicAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './WhoIsAna.css';

interface AnaContent {
  title: string;
  subtitle: string;
  description: string;
}

const WhoIsAna = () => {
  const { language } = useLanguage();
  const [content, setContent] = useState<AnaContent>({
    title: 'Who is Ana?',
    subtitle: 'MEET YOUR IDOL',
    description: `Ever since I was little, I've always loved to sing. That's why I sing every day. My dream is to become a star and enjoy my fans. Although I know it's a very difficult dream, I guess that's how dreams are, right?

There will be an audition in my city soon, but I feel like I'm not ready. I need to improve my singing skills to have any chance. There are so many people out there who sing so well... I wish everything were easier.`
  });

  // Fetch content from backend
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await publicAPI.getContent(language);
        const contentData = response.data.data.content;
        
        console.log('WhoIsAna - Full API Response:', response.data);
        console.log('WhoIsAna - Content Data:', contentData);
        
        // Get who_is_ana section content - check both possible locations
        const anaData = contentData?.who_is_ana || [];
        const aboutData = contentData?.about_section || [];
        
        // Find Ana content by key in about_section if not found in who_is_ana
        let anaContent = null;
        
        if (anaData.length > 0) {
          anaContent = anaData.find((item: any) => 
            item.metadata?.category === 'main' || item.metadata?.isFeatured
          ) || anaData[0];
        } else {
          // Look for ana content in about_section by key
          anaContent = aboutData.find((item: any) => item.key === 'who_is_ana');
        }
        
        console.log('WhoIsAna - Selected Content:', anaContent);
        
        if (anaContent) {
          const newContent = {
            title: anaContent.title || 'Who is Ana?',
            subtitle: anaContent.subtitle || 'MEET YOUR IDOL',
            description: anaContent.description || `Ever since I was little, I've always loved to sing. That's why I sing every day. My dream is to become a star and enjoy my fans. Although I know it's a very difficult dream, I guess that's how dreams are, right?\n\nThere will be an audition in my city soon, but I feel like I'm not ready. I need to improve my singing skills to have any chance. There are so many people out there who sing so well... I wish everything were easier.`
          };
          console.log('WhoIsAna - Setting Content:', newContent);
          setContent(newContent);
        } else {
          console.warn('WhoIsAna - No content found. Please create content with type "who_is_ana" or key "who_is_ana" in the admin panel.');
        }
      } catch (error) {
        console.error('WhoIsAna - Failed to fetch content:', error);
        // Keep default content on error
      }
    };

    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Split description into paragraphs
  const paragraphs = content.description.split('\n').filter(p => p.trim());

  return (
    <section className="who-is-ana-section">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left Column - Content */}
          <div className="col-lg-6 col-md-12" data-aos="fade-right" data-aos-duration="1000">
            <div className="ana-content">
              <div className="section-tag">{content.subtitle}</div>
              <h2 className="section-title">
                <span className="text-glow-purple">{content.title}</span>
              </h2>
              <div className="title-underline"></div>
              
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="ana-text">
                  {paragraph}
                </p>
              ))}
              
              {/* <div className="ana-quote-box">
                <div className="quote-icon">"</div>
                <p className="quote-text">
                  Anyway, I enjoy singing and no one can take that away from me. For me, 
                  singing is like flying, I can be free. I can express my feelings and get to know 
                  myself better. That's why I invite you not to be afraid and to join me on this 
                  adventure. If you're like me, let's do it together!
                </p>
                <div className="quote-author">— Ana</div>
              </div> */}

              
            </div>
          </div>

          {/* Right Column - Image/Video */}
          <div className="col-lg-6 col-md-12" data-aos="fade-left" data-aos-duration="1000">
            <div className="ana-media-wrapper">
              <div className="ana-image-frame">
                <div className="ana-placeholder">
                  <div className="ana-placeholder-icon">🎤</div>
                  <div className="ana-placeholder-text">Ana</div>
                </div>
                <div className="image-glow-effect"></div>
              </div>
              
              {/* Decorative Elements */}
              <div className="decorative-circle circle-1"></div>
              <div className="decorative-circle circle-2"></div>
              <div className="music-note note-1">♪</div>
              <div className="music-note note-2">♫</div>
              <div className="music-note note-3">♪</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoIsAna;

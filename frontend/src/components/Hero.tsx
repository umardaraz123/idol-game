import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { publicAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ContactModal from './ContactModal';
import introVideo from '../assets/videos/intro.mp4';
import './Hero.css';

interface HeroContent {
  title: string;
  description: string;
  videoUrl?: string;
  imageUrl?: string;
}

// Translations for "Join to the journey" button
const joinButtonTranslations: Record<string, string> = {
  en: 'Join to the journey',
  hi: 'यात्रा में शामिल हों',
  ru: 'Присоединяйтесь к путешествию',
  ko: '여정에 참여하세요',
  zh: '加入旅程',
  ja: '旅に参加しよう',
  es: 'Únete al viaje'
};

const Hero = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { language } = useLanguage();
  const [content, setContent] = useState<HeroContent>({
    title: 'IDOL BE',
    description: 'Sing Your Dream • Express Your Feelings • Become a Star',
    videoUrl: '',
    imageUrl: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch hero content from backend
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch content by type and language
        const response = await publicAPI.getContent(language);
        const contentData = response.data.data.content;
        
        // Get hero section content
        const heroData = contentData?.hero_section || [];
        
        console.log('Hero Data:', heroData, 'Language:', language); // Debug
        
        if (heroData && heroData.length > 0) {
          // Get the main content for title/description (category: "main")
          const mainContent = heroData.find((item: any) => 
            item.metadata?.category === 'main'
          ) || heroData.find((item: any) => 
            item.metadata?.isFeatured && item.metadata?.isActive !== false
          ) || heroData[0];
          
          // Get media content for video/image (any item with videoUrl or imageUrl)
          const mediaContent = heroData.find((item: any) => 
            item.videoUrl || item.imageUrl
          );
          
          console.log('Selected Hero Content (Text):', mainContent); // Debug
          console.log('Selected Hero Content (Media):', mediaContent); // Debug
          
          setContent({
            title: mainContent?.title || 'IDOL BE',
            description: mainContent?.description || 'Sing Your Dream • Express Your Feelings • Become a Star',
            videoUrl: mediaContent?.videoUrl || '',
            imageUrl: mediaContent?.imageUrl || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch hero content:', error);
        // Keep default content on error
      }
    };

    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // GSAP animations
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    
    tl.fromTo(
      titleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
    )
    .fromTo(
      subtitleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
      '-=0.8'
    )
    .fromTo(
      buttonRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' },
      '-=0.6'
    );
  }, [content]);

  const handleJoinClick = () => {
    setIsModalOpen(true);
  };

  return (
    <section className="hero-section">
      {/* Video or Image Background */}
      <div className="hero-video-container">
        {content.videoUrl ? (
          <video
            key={content.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="hero-video"
          >
            <source src={`${content.videoUrl}?t=${Date.now()}`} type="video/mp4" />
          </video>
        ) : content.imageUrl ? (
          <img 
            key={content.imageUrl}
            src={`${content.imageUrl}?t=${Date.now()}`}
            alt="Hero Background" 
            className="hero-video"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="hero-video"
          >
            <source src={introVideo} type="video/mp4" />
          </video>
        )}
        <div className="hero-overlay"></div>
        
        {/* Particle Effect Background */}
        <div className="particle-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <div className="container">
          <h1 ref={titleRef} className="hero-title">
            <span className="text-glow-blue">{content.title}</span>
          </h1>
          <p ref={subtitleRef} className="hero-subtitle">
            {content.description}
          </p>
          <button
            ref={buttonRef}
            className="btn-neon"
            onClick={handleJoinClick}
          >
            {joinButtonTranslations[language] || joinButtonTranslations.en}
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
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

export default Hero;

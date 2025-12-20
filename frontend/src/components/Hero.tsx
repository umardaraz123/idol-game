import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import { useContentByType } from '../context/ContentContext';
import ContactModal from './ContactModal';
import './Hero.css';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  videoUrl?: string;
  imageUrl?: string;
}

// Translations for "Join the Idol be community!" button
const joinButtonTranslations: Record<string, string> = {
  en: 'Join the Idol be community!',
  hi: 'Idol be समुदाय से जुड़ें!',
  ru: 'Присоединяйтесь к сообществу Idol be!',
  ko: 'Idol be 커뮤니티에 가입하세요!',
  zh: '加入 Idol be 社区！',
  ja: 'Idol be コミュニティに参加しよう！',
  es: '¡Únete a la comunidad Idol be!'
};

// Module-level flag to persist across component remounts (survives re-renders and remounts)
let heroAnimationHasPlayed = false;

const Hero = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { language } = useLanguage();
  const { data: heroData, isLoading } = useContentByType('hero_section');

  const [content, setContent] = useState<HeroContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update content when heroData changes (from cached context)
  useEffect(() => {
    if (heroData && heroData.length > 0) {
      const mainContent = heroData.find((item: any) =>
        item.metadata?.category === 'main'
      ) || heroData.find((item: any) =>
        item.metadata?.isFeatured && item.metadata?.isActive !== false
      ) || heroData[0];

      const mediaContent = heroData.find((item: any) =>
        item.videoUrl || item.imageUrl
      );

      setContent({
        title: mainContent?.title || 'IDOL BE',
        subtitle: mainContent?.subtitle || '',
        description: mainContent?.description || '',
        videoUrl: mediaContent?.videoUrl || '',
        imageUrl: mediaContent?.imageUrl || ''
      });
    }
  }, [heroData]);

  // GSAP animations - run only ONCE when content is loaded
  useEffect(() => {
    // Skip if animation already played or content not yet loaded
    if (heroAnimationHasPlayed || !content) return;

    // Mark as played immediately to prevent any re-runs
    heroAnimationHasPlayed = true;

    // Small delay to ensure DOM elements are rendered
    const timer = setTimeout(() => {
      if (!titleRef.current || !subtitleRef.current || !buttonRef.current) return;

      // Use fromTo for explicit start/end states - prevents replay issues
      const tl = gsap.timeline();

      tl.fromTo(titleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
        .fromTo(
          subtitleRef.current,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          '-=0.5'
        )
        .fromTo(
          buttonRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
          '-=0.4'
        );
    }, 50);

    return () => clearTimeout(timer);
  }, [content]);

  const handleJoinClick = () => {
    setIsModalOpen(true);
  };

  // Show loading spinner until content is loaded
  if (isLoading || !content) {
    return (
      <section className="hero-section hero-loading">
        <div className="hero-loader-container">
          <div className="hero-spinner"></div>
        </div>
      </section>
    );
  }

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
            <source src={content.videoUrl} type="video/mp4" />
          </video>
        ) : content.imageUrl ? (
          <img
            key={content.imageUrl}
            src={content.imageUrl}
            alt="Hero Background"
            className="hero-video"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        ) : null}
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
          {/* Subtitle - commented out */}
          {/* {content.subtitle && (
            <p ref={subtitleRef} className="hero-subtitle">
              {content.subtitle}
            </p>
          )} */}
          {content.description && (
            <p className="hero-description">
              {content.description}
            </p>
          )}
          <button
            ref={buttonRef}
            className="btn-neon"
            onClick={handleJoinClick}
          >
            {joinButtonTranslations[language] || joinButtonTranslations.en}
          </button>
        </div>
      </div>

      {/* Scroll Indicator - commented out */}
      {/* <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
      </div> */}

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default Hero;


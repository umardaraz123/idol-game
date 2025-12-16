import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { publicAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ContactModal from './ContactModal';
import fallbackImage from '../assets/images/img.png';
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

const Hero = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const animationPlayedRef = useRef(false);

  const { language } = useLanguage();
  const [content, setContent] = useState<HeroContent>({
    title: 'IDOL BE',
    subtitle: 'Sing Your Dream • Express Your Feelings • Become a Star',
    description: 'At Idol be, we love receiving your questions and suggestions, or anything else you want to share. We promise to do our best to respond and, even if we can\'t, you can be sure that we read all your messages.',
    videoUrl: '',
    imageUrl: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch hero content from backend
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await publicAPI.getContent(language);
        const contentData = response.data.data.content;
        const heroData = contentData?.hero_section || [];

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
            subtitle: mainContent?.subtitle || 'Sing Your Dream • Express Your Feelings • Become a Star',
            description: mainContent?.description || 'At Idol be, we love receiving your questions and suggestions, or anything else you want to share. We promise to do our best to respond and, even if we can\'t, you can be sure that we read all your messages.',
            videoUrl: mediaContent?.videoUrl || '',
            imageUrl: mediaContent?.imageUrl || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch hero content:', error);
      }
    };

    fetchContent();
  }, [language]);

  // GSAP animations - run only ONCE ever (not on language change)
  useEffect(() => {
    // Skip if animation already played
    if (animationPlayedRef.current) return;
    animationPlayedRef.current = true;

    // Set initial state immediately to prevent flash
    gsap.set([titleRef.current, subtitleRef.current, buttonRef.current], {
      opacity: 1,
      y: 0,
      scale: 1
    });

    const tl = gsap.timeline({ delay: 0.1 });

    tl.from(titleRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    })
      .from(
        subtitleRef.current,
        {
          y: 25,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out'
        },
        '-=0.5'
      )
      .from(
        buttonRef.current,
        {
          scale: 0.9,
          opacity: 0,
          duration: 0.5,
          ease: 'back.out(1.7)'
        },
        '-=0.4'
      );
  }, []);

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
          <img
            src={fallbackImage}
            alt="Hero Background"
            className="hero-video"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
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
            {content.subtitle}
          </p>
          <p className="hero-description">
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

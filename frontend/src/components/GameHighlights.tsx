import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { publicAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import introVideo from '../assets/videos/intro.mp4';
import './GameHighlights.css';

interface GameSlide {
  id: string;
  title: string;
  description: string;
  image?: string;
  video?: string;
  type: 'image' | 'video';
  order?: number;
}

const GameHighlights = () => {
  const { language } = useLanguage();
  const [slides, setSlides] = useState<GameSlide[]>([
    {
      id: '1',
      title: 'Sing Your Heart Out',
      description: 'Experience the thrill of performing with 20 completely original pop songs. Each track is crafted by talented artists to give you an authentic singing experience.',
      video: introVideo,
      type: 'video',
    },
  ]);

  // Fetch game highlights from backend
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await publicAPI.getContent(language);
        const contentData = response.data.data.content;
        
        const highlightsData = contentData?.game_highlights || [];
        
        console.log('Game Highlights Data:', highlightsData, 'Language:', language);
        
        if (highlightsData && highlightsData.length > 0) {
          // Map and sort by order
          const mappedSlides = highlightsData
            .filter((item: any) => item.metadata?.isActive !== false)
            .sort((a: any, b: any) => (a.metadata?.order || 0) - (b.metadata?.order || 0))
            .map((item: any) => ({
              id: item._id,
              title: item.title || 'Game Highlight',
              description: item.description || '',
              image: item.imageUrl,
              video: item.videoUrl,
              type: item.videoUrl ? 'video' : 'image',
              order: item.metadata?.order || 0
            }));
          
          console.log('Mapped Slides:', mappedSlides);
          
          if (mappedSlides.length > 0) {
            setSlides(mappedSlides);
          }
        }
      } catch (error) {
        console.error('Failed to fetch game highlights:', error);
        // Keep default slides on error
      }
    };

    fetchSlides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
    cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    arrows: true,
  };

  return (
    <section className="game-highlights-section">
      <div className="highlights-bg-effect"></div>
      <div className="container-fluid px-0">
        <div className="section-header" data-aos="fade-up">
          <h2 className="section-title">
            Experience <span className="text-glow-purple">Idol be</span>
          </h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">
            Immerse yourself in a world where your voice becomes your power
          </p>
        </div>

        <div className="slider-container-full" data-aos="fade-up" data-aos-delay="200">
          <Slider {...settings}>
            {slides.map((slide, index) => (
              <div key={slide.id} className="slide-wrapper-full">
                <div className="slide-content-wrapper">
                  <div className="slide-media-container">
                    {slide.type === 'video' && slide.video ? (
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="slide-video"
                      >
                        <source src={slide.video} type="video/mp4" />
                      </video>
                    ) : slide.image ? (
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="slide-image-full"
                      />
                    ) : null}
                    <div className="slide-overlay-gradient"></div>
                  </div>
                  
                  <div className="slide-text-content">
                    <div className="slide-number">0{index + 1}</div>
                    <h3 className="slide-title-large">{slide.title}</h3>
                    <p className="slide-description-large">{slide.description}</p>
                    <div className="slide-decorative-line"></div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default GameHighlights;

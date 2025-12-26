import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useContentByType } from '../context/ContentContext';
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
  const { data: highlightsData } = useContentByType('game_highlights');

  const [slides, setSlides] = useState<GameSlide[]>([
    {
      id: '1',
      title: 'Sing Your Heart Out',
      description: 'Experience the thrill of performing with 20 completely original pop songs. Each track is crafted by talented artists to give you an authentic singing experience.',
      video: introVideo,
      type: 'video',
    },
  ]);

  const [sectionHeader, setSectionHeader] = useState({
    title: 'Experience Idol be',
    subtitle: 'Immerse yourself in a world where your voice becomes your power'
  });

  // Update content from cached context data
  useEffect(() => {
    if (highlightsData && highlightsData.length > 0) {
      // Get section header
      const headerItem = highlightsData.find((item: any) => item.key === 'game_highlights_section_header');
      if (headerItem) {
        setSectionHeader({
          title: headerItem.title || 'Experience Idol be',
          subtitle: headerItem.subtitle || headerItem.description || 'Immerse yourself in a world where your voice becomes your power'
        });
      }

      // Filter out header and get actual highlights
      const actualHighlights = highlightsData.filter((item: any) => item.key !== 'game_highlights_section_header');

      if (actualHighlights && actualHighlights.length > 0) {
        // Map and sort by order
        const mappedSlides = actualHighlights
          .filter((item: any) => item.metadata?.isActive !== false)
          .sort((a: any, b: any) => (a.metadata?.order || 0) - (b.metadata?.order || 0))
          .map((item: any) => ({
            id: item._id,
            title: item.title || 'Game Highlight',
            description: item.description || '',
            image: item.imageUrl,
            video: item.videoUrl,
            type: (item.videoUrl ? 'video' : 'image') as 'image' | 'video',
            order: item.metadata?.order || 0
          }));

        if (mappedSlides.length > 0) {
          // Only show the latest slide (last one by order)
          setSlides([mappedSlides[mappedSlides.length - 1]]);
        }
      }
    }
  }, [highlightsData]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    pauseOnHover: false,
    fade: true,
    cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    arrows: false,
  };

  return (
    <section className="game-highlights-section">
      <div className="highlights-bg-effect"></div>
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <h2 className="section-title">
            {sectionHeader.title.split(' ').map((word, index) => {
              // Check if word contains "Idol" or "be" to apply gradient
              if (word.toLowerCase().includes('idol') || word.toLowerCase() === 'be') {
                return <span key={index} className="text-glow-purple">{word} </span>;
              }
              return <span key={index}>{word} </span>;
            })}
          </h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">
            {sectionHeader.subtitle}
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
                        controlsList="nodownload nofullscreen noremoteplayback"
                        disablePictureInPicture
                        onContextMenu={(e) => e.preventDefault()}
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

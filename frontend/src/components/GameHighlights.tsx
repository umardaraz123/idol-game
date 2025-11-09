import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './GameHighlights.css';

interface GameSlide {
  id: number;
  title: string;
  description: string;
  image?: string;
  video?: string;
  type: 'image' | 'video';
}

const GameHighlights = () => {
  const slides: GameSlide[] = [
    {
      id: 1,
      title: 'Sing Your Heart Out',
      description: 'Experience the thrill of performing with 20 completely original pop songs. Each track is crafted by talented artists to give you an authentic singing experience.',
      video: '/videos/singing-gameplay.mp4',
      type: 'video',
    },
    {
      id: 2,
      title: 'Compete Worldwide',
      description: 'Challenge players from across the globe in real-time multiplayer battles. Show off your vocal skills and climb the global leaderboards.',
      image: '/images/multiplayer-mode.jpg',
      type: 'image',
    },
    {
      id: 3,
      title: 'Express Your Style',
      description: 'Unlock and customize over 20 unique outfits and styles. Make your idol truly yours with stunning looks and vibrant designs.',
      video: '/videos/customization.mp4',
      type: 'video',
    },
    {
      id: 4,
      title: 'Speak Your Language',
      description: 'Play in your native tongue! Available in 7 languages: Spanish, English, Mandarin Chinese, Russian, Korean, Japanese, and Hindi.',
      image: '/images/multilingual.jpg',
      type: 'image',
    },
    {
      id: 5,
      title: 'Pure Gaming Experience',
      description: 'No ads, no loot boxes, no pay-to-win mechanics. When you buy Idol be, you get the complete game with all content unlockable through gameplay.',
      image: '/images/fair-play.jpg',
      type: 'image',
    },
    {
      id: 6,
      title: 'Meet Ana - Your Idol',
      description: 'Follow Ana\'s journey from a dreamer to a star. Help her achieve her dreams through singing and expression.',
      video: '/videos/ana-story.mp4',
      type: 'video',
    },
  ];

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
            {slides.map((slide) => (
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
                    ) : (
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="slide-image-full"
                      />
                    )}
                    <div className="slide-overlay-gradient"></div>
                  </div>
                  
                  <div className="slide-text-content">
                    <div className="slide-number">0{slide.id}</div>
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

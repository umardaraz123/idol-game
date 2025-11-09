import './About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-bg-particles"></div>
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left Column - Image/Video */}
          <div className="col-lg-6 col-md-12" data-aos="fade-right" data-aos-duration="1000">
            <div className="about-media-wrapper">
              <div className="media-frame">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="about-video"
                >
                  <source src="/videos/idol-gameplay-demo.mp4" type="video/mp4" />
                </video>
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

          {/* Right Column - Content */}
          <div className="col-lg-6 col-md-12" data-aos="fade-left" data-aos-duration="1000">
            <div className="about-content">
              <div className="section-tag">DISCOVER THE GAME</div>
              <h2 className="section-title">
                What is <span className="text-glow-blue">Idol be?</span>
              </h2>
              <div className="title-underline"></div>
              
              <p className="about-text lead-text">
                Idol be is a <strong>casual singing game</strong> designed for people who love to sing. 
                The gameplay is beautifully simple: listen to a song, sing along, and receive a score 
                that unlocks new songs and unique looks for your idol.
              </p>
              
              <div className="feature-list">
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
              </div>

              <div className="about-highlight-box">
                <div className="highlight-icon-wrapper">
                  <span className="highlight-icon">💎</span>
                </div>
                <div className="highlight-content">
                  <h4 className="highlight-title">Fair Gaming Philosophy</h4>
                  <p className="highlight-text">
                    No ads. No loot boxes. No pay-to-win mechanics. No in-game purchases. 
                    When you buy Idol be, you get the <strong>complete gaming experience</strong> 
                    with all content freely unlockable through gameplay.
                  </p>
                </div>
              </div>

              <div className="cta-box">
                <h4 className="cta-title">We Want to Hear From You!</h4>
                <p className="cta-text">
                  Join the Idol be community! We'd love to hear your questions, suggestions, 
                  or anything else that comes to mind. Your feedback helps us create the best 
                  singing experience possible.
                </p>
                <button className="btn-neon purple">Join Our Community</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

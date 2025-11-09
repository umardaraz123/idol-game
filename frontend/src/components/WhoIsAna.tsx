import './WhoIsAna.css';

const WhoIsAna = () => {
  return (
    <section className="who-is-ana-section">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left Column - Content */}
          <div className="col-lg-6 col-md-12" data-aos="fade-right" data-aos-duration="1000">
            <div className="ana-content">
              <div className="section-tag">MEET YOUR IDOL</div>
              <h2 className="section-title">
                Who is <span className="text-glow-purple">Ana?</span>
              </h2>
              <div className="title-underline"></div>
              
              <p className="ana-text lead-text">
                Ana is a girl just like you!
              </p>
              
              <p className="ana-text">
                Ever since I was little, I've always loved to sing. That's why I sing every day. 
                My dream is to become a star and enjoy my fans. Although I know it's a very 
                difficult dream, I guess that's how dreams are, right?
              </p>
              
              <p className="ana-text">
                There will be an audition in my city soon, but I feel like I'm not ready. I need 
                to improve my singing skills to have any chance. There are so many people out there 
                who sing so well... I wish everything were easier.
              </p>
              
              <div className="ana-quote-box">
                <div className="quote-icon">"</div>
                <p className="quote-text">
                  Anyway, I enjoy singing and no one can take that away from me. For me, 
                  singing is like flying, I can be free. I can express my feelings and get to know 
                  myself better. That's why I invite you not to be afraid and to join me on this 
                  adventure. If you're like me, let's do it together!
                </p>
                <div className="quote-author">— Ana</div>
              </div>

              <div className="ana-dream-box">
                <div className="dream-icon">✨</div>
                <div className="dream-content">
                  <h4>Join Ana's Journey</h4>
                  <p>
                    Help Ana achieve her dreams through singing, practice, and dedication. 
                    Your voice is her strength!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Image/Video */}
          <div className="col-lg-6 col-md-12" data-aos="fade-left" data-aos-duration="1000">
            <div className="ana-media-wrapper">
              <div className="ana-image-frame">
                <img
                  src="/images/ana-character.jpg"
                  alt="Ana - Your Idol"
                  className="ana-image"
                />
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

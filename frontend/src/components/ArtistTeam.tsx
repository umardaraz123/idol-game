import './ArtistTeam.css';

const ArtistTeam = () => {
  return (
    <section className="artist-team-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <div className="section-tag">THE CREATORS</div>
          <h2 className="section-title">
            Artistic <span className="text-glow-blue">Team</span>
          </h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">
            Idol be has a wonderful team of artists and creators who have contributed 
            their talent and dedication to the development of this project.
          </p>
          <p className="section-note">
            Idol be is a game created by <strong>real people, no AI involved!</strong> Meet them all:
          </p>
        </div>

        <div className="team-intro" data-aos="fade-up" data-aos-delay="100">
          <div className="presenter-card">
            <div className="presenter-label">Presented by</div>
            <h3 className="presenter-name">Victoria Jiménez Díaz</h3>
            <p className="presenter-role">presents: Idol be</p>
          </div>
        </div>

        <div className="team-grid">
          <div className="team-category" data-aos="fade-up" data-aos-delay="200">
            <h3 className="category-title">🎮 Game Design</h3>
            <div className="team-member">
              <span className="member-name">Sergio González</span>
              <span className="member-role">Game Design Document</span>
            </div>
          </div>

          <div className="team-category" data-aos="fade-up" data-aos-delay="250">
            <h3 className="category-title">💻 Programming</h3>
            <div className="team-member">
              <span className="member-name">BlackAce Studios</span>
              <span className="member-role">Harris Sameer</span>
            </div>
          </div>

          <div className="team-category" data-aos="fade-up" data-aos-delay="300">
            <h3 className="category-title">🎵 Music</h3>
            <div className="team-members-list">
              <div className="team-member">
                <span className="member-name">Jaime Llana (DaWave)</span>
                <span className="member-role">Composer of songs 8, 10, 11, 14, 15, 16, 17, 18, 19, 20 and menu song / Mixing and mastering engineer</span>
              </div>
              <div className="team-member">
                <span className="member-name">Antonio Yuste</span>
                <span className="member-role">Composer of songs 1 to 7</span>
              </div>
              <div className="team-member">
                <span className="member-name">Millenia Estudios</span>
                <span className="member-role">Vicente Mezquita - Executive producer, Spanish vocals, and Iñaki Ariste, Spanish vocal recording engineer</span>
              </div>
              <div className="team-member">
                <span className="member-name">NeoMedia Music</span>
                <span className="member-role">Pedro Catalan and Juan Marpe - Composers of songs 9, 12, 13, credits song, and music for 2D intro and ending animations</span>
              </div>
            </div>
          </div>

          <div className="team-category" data-aos="fade-up" data-aos-delay="350">
            <h3 className="category-title">🎤 Singers</h3>
            <div className="team-members-list">
              <div className="singer-item">
                <span className="flag">🇬🇧</span>
                <span className="member-name">Keziadt</span>
                <span className="member-role">English singer</span>
              </div>
              <div className="singer-item">
                <span className="flag">🇪🇸</span>
                <span className="member-name">Victoria Bravo</span>
                <span className="member-role">Spanish singer</span>
              </div>
              <div className="singer-item">
                <span className="flag">🇷🇺</span>
                <span className="member-name">Elizaveta Protas</span>
                <span className="member-role">Russian singer and translation</span>
              </div>
              <div className="singer-item">
                <span className="flag">🇰🇷</span>
                <span className="member-name">Youngin Lee</span>
                <span className="member-role">Korean singer and translation</span>
              </div>
              <div className="singer-item">
                <span className="flag">🇯🇵</span>
                <span className="member-name">Nahmida</span>
                <span className="member-role">Japanese singer, translation arrangements and Japanese-English translation</span>
              </div>
              <div className="singer-item">
                <span className="flag">🇮🇳</span>
                <span className="member-name">Jade Gupta</span>
                <span className="member-role">Hindi singer and translation</span>
              </div>
              <div className="singer-item">
                <span className="flag">🇨🇳</span>
                <span className="member-name">Kristic Cheung</span>
                <span className="member-role">Chinese singer, translation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="gratitude-section" data-aos="zoom-in" data-aos-delay="400">
          <h3 className="gratitude-title">Thank you all very much! Without you, this would not have been possible.</h3>
        </div>
      </div>
    </section>
  );
};

export default ArtistTeam;
